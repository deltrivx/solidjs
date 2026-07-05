import{o as t,i as r,c as a,A as p,t as c}from"./index-0rqsoekv.js";var i=c(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>SubStore HomeNet 优化实战：流量显示修复与 ss-direct 8443 独立链路</h1><p class=article-subtitle>SubStore · Quantumult X · Shadowsocks over WSS · Cloudflare Tunnel · Nginx 端口隔离</p><div class=article-meta><span class=article-date>2026-06-12</span><div class=article-tags><span class=tech-tag>SubStore</span><span class=tech-tag>Quantumult X</span><span class=tech-tag>Cloudflare</span><span class=tech-tag>Nginx</span><span class=tech-tag>HomeNet</span><span class=tech-tag>WSS</span></div></div></div><div class=article-content><blockquote><p>本文所有域名、密码、Token、内网地址均已脱敏。示例中的 <code>example.com</code>、<code>substore.example.com</code>、<code>192.168.31.x</code> 只代表架构位置，不对应真实环境。</p></blockquote><h2>一、背景：为什么要优化 HomeNet</h2><p>HomeNet 的目标很简单：人在外面时，手机也能像在家一样访问内网服务。此前已经有一套双节点方案：</p><ul><li><strong>HomeNet-Fast</strong>：优先路径，走家庭 IPv6 / DDNS 直连，延迟最低。</li><li><strong>HomeNet-CF</strong>：备用路径，走 Cloudflare Tunnel，适合运营商网络不稳定、IPv6 不通或公共 Wi-Fi 场景。</li></ul><p>这套方案能用，但实际使用中出现了两个问题：第一，SubStore / Quantumult X 里的流量显示不准确；第二，备用节点 <code>HomeNet-CF</code> 复用了 <code>substore.example.com:443</code>，导致页面、订阅和 WebSocket 隧道职责混在一起，后续排障很不清晰。</p><h2>二、脱敏后的目标架构</h2><p>优化后的架构如下：</p><pre>┌──────────────────────────────────────────────────────┐
│ iPhone / Quantumult X                                │
│   ├─ HomeNet-Fast: home.example.com:18443             │
│   └─ HomeNet-CF:   substore.example.com:8443          │
└──────────────────────┬───────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐           ┌────────▼────────┐
│ Fast 直连路径   │           │ Cloudflare 备用 │
│ home.example   │           │ substore.example│
│ :18443         │           │ :8443           │
└───────┬────────┘           └────────┬────────┘
        │                             │
┌───────▼─────────────────────────────▼────────┐
│ FnOS / Nginx                                 │
│   443  → SubStore 页面、订阅、userinfo         │
│   8443 → 只转发 /ss-direct                    │
└───────┬──────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────┐
│ Proxy / SubStore 后端                         │
│   /qx                  输出 QX 订阅            │
│   /homenet-userinfo    输出流量统计             │
│   gost / ss-wss        承载真正代理流量          │
└──────────────────────────────────────────────┘</pre><p>优化原则是：<strong>页面归页面，订阅归订阅，隧道归隧道，统计归统计</strong>。只要职责拆清，后续定位问题会轻松很多。</p><h2>三、问题一：节点能用，但流量显示异常</h2><p>最初的症状通常是这样：</p><ul><li>QX 订阅能拉取，节点也能连通。</li><li>使用代理后，SubStore 或客户端里看不到正确流量。</li><li>有时只显示订阅下载流量，不显示实际代理消耗。</li><li>有时 userinfo 接口存在，但没有返回客户端能识别的 header。</li></ul><p>原因并不神秘：订阅下载、userinfo 查询、代理转发是三条不同链路。如果它们各算各的，或者只有其中一条写入计数，最终显示就会错。</p><h2>四、修复一：统一流量统计与 userinfo</h2><p>最小可用方案是准备一个轻量 Node.js 统计后端，负责两件事：</p><ul><li><code>/qx</code>：输出 Quantumult X 订阅，同时把订阅下载量计入统计。</li><li><code>/homenet-userinfo</code>：输出客户端可识别的 <code>subscription-userinfo</code> header。</li></ul><p>下面是一个适合新手理解的简化版。生产环境建议把计数持久化到 JSON、SQLite 或 Redis，避免进程重启后清零。</p><pre>// homenet-subscription-proxy.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const DATA_FILE = path.join(__dirname, "homenet-traffic.json");

const DEFAULT_TRAFFIC = {
  upload: 0,
  download: 0,
  total: 100 * 1024 * 1024 * 1024,
  expire: Math.floor(Date.now() / 1000) + 30 * 86400,
};

function loadTraffic() {
  try {
    return { ...DEFAULT_TRAFFIC, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) };
  } catch {
    return { ...DEFAULT_TRAFFIC };
  }
}

function saveTraffic(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function addTraffic(upload, download) {
  const data = loadTraffic();
  data.upload += upload;
  data.download += download;
  saveTraffic(data);
  return data;
}

function userinfoHeader(data) {
  return [
    "upload=" + data.upload,
    "download=" + data.download,
    "total=" + data.total,
    "expire=" + data.expire,
  ].join("; ");
}

app.get("/homenet-userinfo", (req, res) => {
  const data = loadTraffic();
  res.setHeader("subscription-userinfo", userinfoHeader(data));
  res.json({
    upload: data.upload,
    download: data.download,
    used: data.upload + data.download,
    total: data.total,
    expire: data.expire,
  });
});

app.get("/qx", (req, res) => {
  const subscription = [
    "shadowsocks=home.example.com:18443,method=chacha20-ietf-poly1305,password=your_password,obfs=wss,obfs-host=home.example.com,obfs-uri=/ss-direct,fast-open=true,udp-relay=false,tag=HomeNet-Fast",
    "shadowsocks=substore.example.com:8443,method=chacha20-ietf-poly1305,password=your_password,obfs=wss,obfs-host=substore.example.com,obfs-uri=/ss-direct,fast-open=true,udp-relay=false,tls-verification=false,server_check_url=http://connectivitycheck.gstatic.com/generate_204,tag=HomeNet-CF",
  ].join("
");

  const data = addTraffic(0, Buffer.byteLength(subscription));
  res.setHeader("subscription-userinfo", userinfoHeader(data));
  res.type("text/plain").send(subscription);
});

app.listen(3100, "0.0.0.0", () => {
  console.log("HomeNet subscription proxy listening on :3100");
});</pre><p>启动它：</p><pre>npm init -y
npm install express
node homenet-subscription-proxy.js</pre><p>验证 userinfo：</p><pre>curl -i http://127.0.0.1:3100/homenet-userinfo</pre><p>重点看响应头里是否有类似内容：</p><pre>subscription-userinfo: upload=0; download=1234; total=107374182400; expire=1781190000</pre><h2>五、Nginx 转发：让订阅和 userinfo 走同一个统计后端</h2><p>如果 SubStore 前面有 Nginx，建议显式增加两个 location，把订阅和流量信息都转给同一个统计服务：</p><pre>server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name substore.example.com;

    ssl_certificate     /path/to/ssl/fullchain.pem;
    ssl_certificate_key /path/to/ssl/privkey.pem;

    # SubStore 前端或已有入口
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # QX 订阅
    location = /qx {
        proxy_pass http://127.0.0.1:3100/qx;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # QX / SubStore 可读取的流量信息
    location = /homenet-userinfo {
        proxy_pass http://127.0.0.1:3100/homenet-userinfo;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}</pre><p>这样，订阅内容和 userinfo 都来自同一个计数源，避免“订阅更新了，但流量不更新”的错位。</p><h2>六、问题二：ss-direct 复用 443，职责混乱</h2><p>早期方案里，备用节点常写成：</p><pre>shadowsocks=substore.example.com:443,...,obfs-uri=/ss-direct,tag=HomeNet-CF</pre><p>它能工作，但并不优雅。因为 <code>substore.example.com:443</code> 同时承担：</p><ul><li>SubStore 页面访问。</li><li>订阅文件下载。</li><li><code>/homenet-userinfo</code> 流量信息。</li><li><code>/ss-direct</code> WebSocket 代理隧道。</li></ul><p>一旦出现问题，很难判断是页面反代、订阅后端、WebSocket Upgrade、TLS 证书，还是 Cloudflare 回源配置出了问题。</p><h2>七、修复二：让 ss-direct 独立走 8443</h2><p>更清晰的做法是：保留 <code>443</code> 给页面和订阅，新增 <code>8443</code> 只承载 <code>/ss-direct</code>。</p><pre>server {
    listen 8443 ssl;
    listen [::]:8443 ssl;
    http2 on;

    server_name substore.example.com;

    ssl_certificate     /path/to/ssl/fullchain.pem;
    ssl_certificate_key /path/to/ssl/privkey.pem;

    location = /ss-direct {
        proxy_pass http://192.168.31.5:18443;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}</pre><p>配置完成后先测试再重载：</p><pre>nginx -t
nginx -s reload</pre><p>如果 Nginx 在 Docker 容器里：</p><pre>docker exec nginx nginx -t
docker exec nginx nginx -s reload</pre><h2>八、Cloudflare 与 8443</h2><p>Cloudflare 的 HTTPS 代理支持若干非标准端口，<code>8443</code> 就是常用端口之一。因此 DNS 仍然可以保持橙云代理：</p><pre>substore.example.com  CNAME  &lt;tunnel-id>.cfargotunnel.com  Proxied</pre><p>Cloudflare Tunnel 的常见配置如下：</p><pre># /etc/cloudflared/config.yml
# 示例已脱敏
token: "$TUNNEL_TOKEN"

ingress:
  - hostname: substore.example.com
    service: http://192.168.31.2:3000

  - service: http_status:404</pre><p>注意：Cloudflare 对 <code>substore.example.com:8443</code> 的访问会走 Cloudflare 边缘支持的 8443 端口，再到你的源站或 Tunnel。你的 Nginx 必须确实监听 <code>8443</code>，否则客户端会连不上。</p><h2>九、Quantumult X 节点配置</h2><p>优化后的两个节点可以写成：</p><pre># HomeNet-Fast：优先直连
shadowsocks=home.example.com:18443,method=chacha20-ietf-poly1305,password=your_password,obfs=wss,obfs-host=home.example.com,obfs-uri=/ss-direct,fast-open=true,udp-relay=false,tag=HomeNet-Fast

# HomeNet-CF：Cloudflare 备用，走 8443
shadowsocks=substore.example.com:8443,method=chacha20-ietf-poly1305,password=your_password,obfs=wss,obfs-host=substore.example.com,obfs-uri=/ss-direct,fast-open=true,udp-relay=false,tls-verification=false,server_check_url=http://connectivitycheck.gstatic.com/generate_204,tag=HomeNet-CF</pre><p><code>tls-verification=false</code> 不是最佳实践。它只适合临时处理证书 SAN 不覆盖 <code>substore.example.com</code> 的情况。长期方案应申请包含 <code>substore.example.com</code> 或 <code>*.example.com</code> 的证书，然后打开 TLS 校验。</p><h2>十、完整验证流程</h2><h3>10.1 检查端口监听</h3><pre>ss -ltnp | grep ':8443'</pre><p>期望看到 Nginx 正在监听 <code>0.0.0.0:8443</code> 或 <code>[::]:8443</code>。</p><h3>10.2 检查 userinfo</h3><pre>curl -i https://substore.example.com/homenet-userinfo</pre><p>期望看到：</p><pre>subscription-userinfo: upload=...; download=...; total=...; expire=...</pre><h3>10.3 检查 8443 TLS</h3><pre>curl -k -I https://substore.example.com:8443/ss-direct</pre><p><code>/ss-direct</code> 是 WebSocket 隧道入口，不一定返回普通页面的 <code>200</code>。这一步主要确认 TLS 与 Nginx server 块能被命中。</p><h3>10.4 用 gost 做本机代理实测</h3><p>如果你熟悉 gost，可以临时起一个本地 SOCKS5，把它转到远端 WSS 节点：</p><pre>gost -L socks5://127.0.0.1:18188   -F 'ss+wss://chacha20-ietf-poly1305:your_password@substore.example.com:8443?path=/ss-direct&amp;host=substore.example.com&amp;secure=false'</pre><p>另开一个终端测试：</p><pre>curl --socks5-hostname 127.0.0.1:18188   -o /dev/null -w '%{http_code}
'   http://connectivitycheck.gstatic.com/generate_204</pre><p>返回 <code>204</code> 即代表代理链路可用。</p><h3>10.5 验证流量确实增长</h3><p>测试前先看一次 userinfo：</p><pre>curl -s https://substore.example.com/homenet-userinfo</pre><p>通过 QX 或 gost 下载一小段测试流量，再看一次：</p><pre>curl --socks5-hostname 127.0.0.1:18188   -r 0-524287   -o /tmp/homenet-test.bin   https://speed.cloudflare.com/__down?bytes=524288

curl -s https://substore.example.com/homenet-userinfo</pre><p>如果 <code>download</code> 约增长 512 KiB，就说明代理链路和流量统计都生效。</p><h2>十一、常见问题</h2><h3>Q1：8443 打不开？</h3><ul><li>检查 Nginx 是否监听 <code>8443</code>。</li><li>检查防火墙是否放行 <code>8443/tcp</code>。</li><li>检查 Cloudflare DNS 是否为橙云代理。</li><li>检查是否把 <code>server_name</code> 写成了错误域名。</li></ul><h3>Q2：QX 提示证书错误？</h3><ul><li>临时方案：节点加 <code>tls-verification=false</code>。</li><li>正式方案：签发覆盖 <code>substore.example.com</code> 的证书。</li></ul><h3>Q3：节点能用，流量还是不显示？</h3><ul><li>确认 <code>/homenet-userinfo</code> 返回了 <code>subscription-userinfo</code> header。</li><li>确认订阅地址和 userinfo 地址指向同一个统计后端。</li><li>确认真正代理流量经过了你的统计逻辑；如果只统计订阅下载，代理消耗当然不会变。</li></ul><h3>Q4：为什么不继续复用 443？</h3><p>不是不能复用，而是不利于维护。443 同时承载页面、订阅、userinfo、WebSocket 隧道时，任何一处出问题都会互相干扰。把 <code>/ss-direct</code> 拆到 8443 后，职责更清晰，也更容易回滚。</p><h2>十二、回滚方案</h2><p>如果 8443 方案不适合你的网络，可以按下面顺序回滚：</p><pre># 1. QX 节点端口改回旧值
# substore.example.com:8443 -> substore.example.com:443

# 2. 删除 Nginx 里的 8443 server 块

# 3. 测试配置
nginx -t

# 4. 重载 Nginx
nginx -s reload</pre><p>回滚只影响 <code>HomeNet-CF</code> 备用链路，不影响 SubStore 页面，也不影响 <code>HomeNet-Fast</code> 直连节点。</p><h2>十三、总结</h2><p>这次优化的关键不是“换一个端口”这么简单，而是把链路职责拆清楚：</p><ul><li><code>443</code> 保留给页面、订阅和 userinfo。</li><li><code>8443</code> 专门承载 <code>/ss-direct</code> WSS 隧道。</li><li>订阅和 userinfo 使用同一套统计后端。</li><li>流量验证不只看节点连通，还要看计数前后变化。</li></ul><p>对新手来说，最稳的排障方法是逐层验证：先看端口监听，再看 Nginx location，再看 userinfo header，最后用 QX 或 gost 跑真实流量。每一层都有明确输出，问题就不会混在一起。`);function n(){return t(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=i(),o=e.firstChild,s=o.firstChild;return r(o,a(p,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),s),e})()}export{n as default};
