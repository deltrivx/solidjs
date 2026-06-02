import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal } from '../../utils/animations';

export default function ArticleHomenetQX() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南</h1>
                    <p class="article-subtitle">Cloudflare Tunnel + Sub-Store + Shadowsocks over WSS · 从零到可用的内网回家方案</p>
                    <div class="article-meta">
                        <span class="article-date">2026-05-29</span>
                        <div class="article-tags">
                            <span class="tech-tag">iOS</span>
                            <span class="tech-tag">Quantumult X</span>
                            <span class="tech-tag">Cloudflare</span>
                            <span class="tech-tag">Sub-Store</span>
                            <span class="tech-tag">内网穿透</span>
                            <span class="tech-tag">Shadowsocks</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、方案概述</h2>
                    <p>异地访问家中内网，常见方案有 Tailscale、ZeroTier、frp 等。本文另辟蹊径——利用 Cloudflare Tunnel 的天然双栈穿透能力，结合 Shadowsocks over WebSocket Secure（WSS）协议，在 iOS Quantumult X 上实现双节点自动切换，让手机无论身处何地都能像在家一样访问 192.168.31.0/24 内网。</p>

                    <p>整个链路分三层：<strong>Cloudflare 边缘层</strong>（双栈接入）、<strong>隧道与代理层</strong>（cloudflared + gost + Nginx）、<strong>订阅与客户端层</strong>（Sub-Store + Quantumult X）。下面逐层展开。</p>

                    <pre>{`┌─────────────────────────────────────────────────────────┐
│  iOS Quantumult X                                       │
│    ├─ HomeNet-Fast（直连 · IPv6/DDNS）                   │
│    └─ HomeNet-CF  （Cloudflare 中继 · IPv4/IPv6）        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────┐           ┌──────▼──────┐
   │ Fast 路径 │           │  CF 路径     │
   │          │           │             │
   │ example  │           │ substore.   │
   │ .com     │           │ example.com │
   │ :18443   │           │ .com:443    │
   │          │           │             │
   │ FnOS IPv6│           │ CF 边缘节点  │
   │ 直连     │           │ 双栈接入     │
   └────┬─────┘           └──────┬──────┘
        │                         │
   ┌────▼─────────────────────────▼─────┐
   │  192.168.31.5（TencentOS 服务器）    │
   │    gost :18443（WSS 后端）           │
   │    gost :10089（CF 专用后端）         │
   │    nginx（反代 / PAC）               │
   │    cloudflared（Tunnel 客户端）      │
   └─────────────────────────────────────┘`}</pre>

                    <h2>二、Cloudflare 前期配置</h2>

                    <h3>2.1 域名接入与 DNS 准备</h3>
                    <p>将域名 NS 记录指向 Cloudflare 后，在控制台完成域名添加。随后创建 API Token（My Profile → API Tokens → Create Token），选择 "Edit zone DNS" 模板——这是后续自动化管理 DNS 记录的基础。</p>

                    <h3>2.2 创建 Cloudflare Tunnel</h3>
                    <p>在 Cloudflare Zero Trust 控制台中创建 Tunnel，获取 Tunnel ID 和 Token。在本机（192.168.31.5）安装 cloudflared 并配置服务：</p>

                    <pre>{`# /etc/cloudflared/config.yml
token: "eyJhIjoi..."  # 替换为你的 Tunnel Token
ingress:
  # HomeNet 直连入口
  - hostname: example.com
    service: https://localhost:18443
    originRequest:
      noTLSVerify: true
  # Sub-Store + HomeNet-CF 入口
  - hostname: substore.example.com
    service: http://localhost:3000
  # 兜底 404
  - service: http_status:404`}</pre>

                    <p>cloudflared 作为 systemd 服务运行，监听 Cloudflare 边缘的入站连接，根据 ingress 规则将流量分发到本机不同端口。</p>

                    <h3>2.3 DNS CNAME 记录</h3>
                    <p>为每个 Tunnel 子域名添加 CNAME 记录，指向 <code>&lt;tunnel-id&gt;.cfargotunnel.com</code>，并开启代理（🟠）：</p>

                    <pre>{`# 通过 CF API 添加 CNAME 记录
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
  -H "Authorization: Bearer $CF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "CNAME",
    "name": "substore",
    "content": "$TUNNEL_ID.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'`}</pre>

                    <h2>三、Nginx 配置：IPv6 直连加速</h2>

                    <p>HomeNet 的 Fast 路径依赖 IPv6 直连。家中 FnOS（192.168.31.2）上的 Nginx 容器承担了 WebSocket 流量转发的角色。</p>

                    <p>核心配置仅保留 HomeNet Direct Fast 这一个 server 块，负责将 WSS 流量转发到内网 gost 服务：</p>

                    <pre>{`# /vol2/1000/Docker/nginx/conf.d/default.conf

# HomeNet Direct Fast
server {
    listen 18443 ssl;
    listen [::]:18443 ssl;    # ← IPv6 双栈监听
    http2 on;
    server_name example.com;

    ssl_certificate     /ssl/example.com/fullchain.pem;
    ssl_certificate_key /ssl/example.com/privkey.pem;

    location = /ss-direct {
        proxy_pass http://192.168.31.5:18443;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}`}</pre>

                    <p>关键点：<code>listen [::]:18443 ssl</code> 同时监听 IPv4 和 IPv6。当 iOS 设备通过 IPv6 访问时，流量直接到达 FnOS Nginx，再转发到 192.168.31.5 的 gost 服务，全程不经 Cloudflare，延迟最低。</p>

                    <p>WebSocket 路径统一为 <code>/ss-direct</code>，这是 Shadowsocks over WSS 的约定路径，后续在 Quantumult X 节点配置中会用到。</p>

                    <h2>四、Sub-Store 搭建与订阅分发</h2>

                    <h3>4.1 部署 Sub-Store</h3>
                    <p>Sub-Store 是一个订阅管理工具，可以将节点信息以标准格式分发给各类客户端。在本机（192.168.31.5）直接以 Node.js 进程方式运行：</p>

                    <pre>{`# 目录结构
/opt/Sub-Store/
├── backend/
│   ├── sub-store.min.js    # 主程序（单文件编译版）
│   ├── sub-store.json      # 订阅与制品配置
│   ├── root.json           # 缓存资源
│   └── substore.log        # 运行日志
├── config/                 # 客户端模板
│   ├── QX.snippet          # Quantumult X 片段
│   ├── QX-Task.json        # QX 定时任务
│   ├── Loon.plugin         # Loon 插件
│   ├── Surge.sgmodule      # Surge 模块
│   └── ...
└── scripts/                # 辅助脚本

# 启动方式（systemd 或直接 node）
node /opt/Sub-Store/backend/sub-store.min.js
# 监听端口：3000（前端/通用）、3001（后端 API）`}</pre>

                    <h3>4.2 配置 HomeNet 双节点订阅</h3>
                    <p>在 Sub-Store 中创建名为 <code>HomeNet-QX</code> 的订阅，包含两个 Shadowsocks 节点：</p>

                    <pre>{`# HomeNet-QX 订阅内容（QX 格式）

# 节点一：HomeNet-Fast（直连 · 优先）
shadowsocks=example.com:18443,method=chacha20-ietf-poly1305,\\
  password=your_password,obfs=wss,obfs-host=example.com,\\
  obfs-uri=/ss-direct,fast-open=true,udp-relay=false,\\
  tag=HomeNet-Fast

# 节点二：HomeNet-CF（Cloudflare 中继 · 备用）
shadowsocks=substore.example.com:443,method=chacha20-ietf-poly1305,\\
  password=your_password,obfs=wss,obfs-host=substore.example.com,\\
  obfs-uri=/ss-direct,fast-open=true,udp-relay=false,\\
  tag=HomeNet-CF`}</pre>

                    <p>两个节点的加密方式和密码完全相同，区别仅在于入口域名和端口：</p>
                    <ul>
                        <li><strong>HomeNet-Fast</strong>：<code>example.com:18443</code> → FnOS IPv6 直连 → gost :18443</li>
                        <li><strong>HomeNet-CF</strong>：<code>substore.example.com:443</code> → Cloudflare 边缘 → cloudflared → gost :10089</li>
                    </ul>

                    <h3>4.3 创建 QX 专用订阅端点</h3>
                    <p>Sub-Store 的 <code>/download/&lt;订阅名&gt;?target=QX</code> 接口可以直接输出 Quantumult X 格式的订阅。但由于目标解析的换行问题，更稳妥的方式是通过 Nginx 创建静态端点：</p>

                    <pre>{`# Nginx 配置
location = /qx {
    proxy_pass http://127.0.0.1:3001/download/HomeNet-QX?target=QX;
    proxy_set_header Host $host;
}

# QX 订阅地址
# https://substore.example.com/qx`}</pre>

                    <p>订阅 URL 为 <code>https://substore.example.com/qx</code>，Quantumult X 通过此地址拉取节点列表。</p>

                    <h2>五、Quantumult X 配置</h2>

                    <h3>5.1 添加订阅</h3>
                    <p>在 Quantumult X 中，进入「订阅」→「添加」，填入订阅地址：</p>
                    <pre>{`https://substore.example.com/qx`}</pre>
                    <p>Quantumult X 会自动解析出 HomeNet-Fast 和 HomeNet-CF 两个节点。</p>

                    <h3>5.2 配置策略组</h3>
                    <p>要实现双节点自动切换（优先 Fast，CF 兜底），需要创建一个策略组。在 QX 配置文件中添加：</p>

                    <pre>{`# 策略组：自动选择可用节点
[policy]
available=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$, \\
  check-interval=300, alive-checking=true`}</pre>

                    <p>参数说明：</p>
                    <ul>
                        <li><code>available</code>：自动选择策略组，优先选取第一个可用节点</li>
                        <li><code>server-tag-regex=^HomeNet-(Fast|CF)$</code>：匹配 HomeNet-Fast 和 HomeNet-CF</li>
                        <li><code>check-interval=300</code>：每 300 秒检测一次节点存活</li>
                        <li><code>alive-checking=true</code>：启用存活检测</li>
                    </ul>

                    <p><strong>注意</strong>：<code>available</code> 策略组按订阅中的节点顺序选择，因此订阅中 <strong>HomeNet-Fast 必须排在 HomeNet-CF 前面</strong>，否则会优先走 Cloudflare 中继。</p>

                    <p>如果需要<strong>手动切换</strong>节点，将策略组类型改为 <code>static</code>：</p>

                    <pre>{`[policy]
static=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$`}</pre>

                    <h3>5.3 配置分流规则</h3>
                    <p>HomeNet 只应路由内网流量，其他流量走用户原有的科学上网节点。在 QX 配置中添加分流规则：</p>

                    <pre>{`[filter_local]
# 内网 IP 段走 HomeNet（必须放在其他 private-IP DIRECT 规则之前）
ip-cidr, 192.168.31.0/24, HomeNet, no-resolve

# 其他内网段直连
ip-cidr, 192.168.0.0/16, DIRECT
ip-cidr, 10.0.0.0/8, DIRECT
ip-cidr, 172.16.0.0/12, DIRECT`}</pre>

                    <p><code>no-resolve</code> 参数表示不解析域名，直接匹配 IP 范围，避免 DNS 泄漏。</p>

                    <h3>5.4 完整配置片段</h3>
                    <p>以下是可直接导入 Quantumult X 的完整配置片段：</p>

                    <pre>{`# HomeNet 内网回家配置
# 订阅地址：https://substore.example.com/qx

[server_remote]
https://substore.example.com/qx, tag=HomeNet, \\
  update-interval=86400, opt-parser=false, \\
  enabled=true

[policy]
# 自动切换（Fast 优先，CF 兜底）
available=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$, \\
  check-interval=300, alive-checking=true

[filter_local]
# 内网流量走 HomeNet
ip-cidr, 192.168.31.0/24, HomeNet, no-resolve

[rewrite_local]
# 可选：拦截内网域名的 DNS 解析
# ^https?://.+\\.local reject`}</pre>

                    <h2>六、连接优化与排障</h2>

                    <h3>6.1 双节点切换逻辑</h3>
                    <p>Quantumult X 的 <code>available</code> 策略组行为：</p>
                    <ul>
                        <li>按订阅中节点顺序依次检测可用性</li>
                        <li>选择第一个可用的节点</li>
                        <li>每 <code>check-interval</code> 秒重新检测一次</li>
                        <li>当当前节点不可用时，自动切换到下一个可用节点</li>
                    </ul>

                    <p>因此，<strong>订阅中节点顺序至关重要</strong>。HomeNet-Fast 在前、HomeNet-CF 在后，确保优先走直连路径。</p>

                    <h3>6.2 Fast 路径排障</h3>
                    <p>如果 HomeNet-Fast 无法连接，按以下顺序排查：</p>
                    <ol>
                        <li><strong>IPv6 连通性</strong>：确认 iOS 设备当前网络支持 IPv6（蜂窝网络通常支持）</li>
                        <li><strong>DDNS 解析</strong>：<code>nslookup example.com</code> 应返回 IPv6 地址</li>
                        <li><strong>端口可达性</strong>：<code>curl -6 https://example.com:18443</code> 应返回 WebSocket 握手响应</li>
                        <li><strong>证书有效性</strong>：确认 <code>/ssl/example.com/fullchain.pem</code> 未过期</li>
                        <li><strong>gost 服务</strong>：<code>ss -tlnp | grep 18443</code> 确认 gost 正在监听</li>
                    </ol>

                    <h3>6.3 CF 路径排障</h3>
                    <p>HomeNet-CF 经过 Cloudflare 边缘，排查重点不同：</p>
                    <ol>
                        <li><strong>Tunnel 状态</strong>：<code>systemctl status cloudflared</code> 确认 Tunnel 在线</li>
                        <li><strong>Ingress 规则</strong>：确认 <code>substore.example.com</code> 的 ingress 正确指向 <code>http://localhost:10089</code>（gost CF 专用端口）</li>
                        <li><strong>路径分流</strong>：CF 路径下 <code>/ss-direct</code> 应直达 gost，不经过 Nginx</li>
                    </ol>

                    <h3>6.4 常见连接问题与解决</h3>
                    <table>
                        <thead>
                            <tr><th>现象</th><th>原因</th><th>解决</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>两个节点都显示不可达</td><td>订阅地址不通或密码错误</td><td>检查订阅 URL 和密码配置</td></tr>
                            <tr><td>只能连 CF，连不上 Fast</td><td>IPv6 不通或 DDNS 未更新</td><td>检查 IPv6 连通性和 DNS 解析</td></tr>
                            <tr><td>连接后无法访问内网 IP</td><td>分流规则顺序错误</td><td>将 HomeNet 规则放在其他 private-IP 规则之前</td></tr>
                            <tr><td>手动切换不生效</td><td>策略组类型为 available</td><td>改为 static 类型</td></tr>
                            <tr><td>连接后所有流量都走 HomeNet</td><td>分流规则范围过大</td><td>确认 ip-cidr 仅匹配 192.168.31.0/24</td></tr>
                        </tbody>
                    </table>

                    <h2>七、安全建议</h2>
                    <ul>
                        <li><strong>密码强度</strong>：Shadowsocks 密码应使用随机字符串，避免使用弱密码</li>
                        <li><strong>TLS 证书</strong>：使用 Let's Encrypt 或 Cloudflare Origin CA 签名的有效证书</li>
                        <li><strong>分流精确</strong>：仅将内网 IP 段（192.168.31.0/24）路由到 HomeNet，避免全局代理</li>
                        <li><strong>订阅保护</strong>：Sub-Store 订阅地址建议添加 token 参数，防止未授权访问</li>
                        <li><strong>日志审计</strong>：定期检查 gost 和 cloudflared 日志，排查异常连接</li>
                    </ul>

                    <h2>八、总结</h2>
                    <p>本文从 Cloudflare Tunnel 的创建出发，经 Nginx IPv6 直连加速、Sub-Store 订阅分发，到 Quantumult X 双节点策略组配置，完整覆盖了 iOS 设备异地接入内网的整个链路。</p>

                    <p>核心设计思想是<strong>双路径冗余</strong>：Fast 路径（IPv6 直连）提供最低延迟，CF 路径（Cloudflare 中继）提供最大兼容性。Quantumult X 的 <code>available</code> 策略组自动在两者之间切换，用户无需手动干预。</p>

                    <p>整个方案无需公网 IP、无需额外硬件，仅利用 Cloudflare 免费 Tunnel 和家中现有服务器即可实现。对于需要随时访问家中 NAS、HomeAssistant、开发环境等内网服务的场景，这是一个简洁而可靠的解决方案。</p>

                </div>
            </div>
        </section>
    );
}
