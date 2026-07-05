import{o as n,i as a,c as o,A as r,t as s}from"./index-0rqsoekv.js";var p=s(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>从零搭建双栈域名体系：Cloudflare Tunnel + 内网穿透完全指南</h1><p class=article-subtitle>V4/V6 双栈 · 域名统一接入 · 内外网分流防回环</p><div class=article-meta><span class=article-date>2026-05-28</span><div class=article-tags><span class=tech-tag>Cloudflare</span><span class=tech-tag>Tunnel</span><span class=tech-tag>双栈</span><span class=tech-tag>内网穿透</span><span class=tech-tag>DNS</span></div></div></div><div class=article-content><h2>一、为什么要做双栈域名？</h2><p>IPv6 已经普及，但很多服务只配置了 IPv4。双栈（Dual Stack）让域名同时支持 IPv4 和 IPv6 访问，用户无论使用哪种协议都能连通。结合 Cloudflare Tunnel，可以在没有公网 IP 的情况下，实现全域名双栈接入。</p><p>实际场景中，家中服务器可能只有 IPv6 公网地址（由运营商分配），而很多用户的网络环境仅支持 IPv4。双栈域名体系让两种网络环境下的用户都能无缝访问你的服务。</p><h2>二、基础架构设计</h2><p>整体架构分两条路径：外网用户通过 Cloudflare 边缘节点（天然双栈）进入 Tunnel，内网用户通过路由器 DNS 重定向直达本机。两条路径互不干扰，避免回环。</p><pre>┌─────────────────────────────────────────────────────────────┐
│  外网用户（IPv4 / IPv6）                                     │
│       ↓                                                       │
│  Cloudflare 边缘节点（天然双栈）                               │
│       ↓                                                       │
│  Cloudflare Tunnel（内网穿透）                                 │
│       ↓                                                       │
│  本机 cloudflared → ingress 规则匹配                           │
│       ↓                                                       │
│  本机服务（localhost）/ 远程服务（内网 IP）                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  内网用户                                                     │
│       ↓                                                       │
│  路由器 DNS 重定向（如 192.168.31.1）                          │
│       ↓                                                       │
│  本机 nginx → 127.0.0.1:port（防回环）                        │
└─────────────────────────────────────────────────────────────┘</pre><h2>三、Cloudflare 前期准备</h2><h3>3.1 注册与域名接入</h3><p>将域名的 NS 记录指向 Cloudflare，在面板中完成域名添加。这一步是所有后续操作的基础。</p><h3>3.2 创建 API Token</h3><p>进入 Cloudflare 控制台 → My Profile → API Tokens → Create Token。选择 "Edit zone DNS" 模板，生成用于 DNS 管理的 Token。建议仅授权当前域名的 DNS 编辑权限，遵循最小权限原则。</p><pre># API Token 权限模板
Zone - DNS - Edit
Zone - Zone - Read</pre><h3>3.3 获取关键 ID</h3><p>后续操作需要用到 Zone ID 和 Account ID，可在 Cloudflare 控制台右侧栏找到：</p><pre>Zone ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Account ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</pre><h2>四、部署 Cloudflare Tunnel</h2><h3>4.1 安装 cloudflared</h3><pre>wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
rpm -ivh cloudflared-linux-x86_64.rpm
cloudflared --version</pre><h3>4.2 认证并创建 Tunnel</h3><pre>cloudflared tunnel login
cloudflared tunnel create my-tunnel</pre><p>登录后会生成凭证文件，创建 Tunnel 后记录 Tunnel ID，后续配置 DNS CNAME 记录时需要用到。</p><h3>4.3 编写 ingress 配置文件</h3><p>创建 /etc/cloudflared/config.yml。本机服务指向 localhost，远程服务指向内网 IP。ingress 规则按顺序匹配，最后一条设为 http_status:404 兜底：</p><pre>token: "你的 Tunnel Token"
ingress:
  # 本机服务
  - hostname: baota.example.com
    service: http://localhost:19190
  - hostname: sub2api.example.com
    service: http://localhost:8080
  - hostname: substore.example.com
    service: http://localhost:3000

  # 远程服务（内网其他设备）
  - hostname: emby.example.com
    service: http://192.168.31.2:8096
  - hostname: fnos.example.com
    service: http://192.168.31.2:5080
  - hostname: homeassistant.example.com
    service: http://192.168.31.3:8123

  # 兜底 404
  - service: http_status:404</pre><h3>4.4 配置 systemd 服务</h3><pre>systemctl enable --now cloudflared
systemctl status cloudflared</pre><h2>五、DNS 记录批量配置</h2><p>所有域名统一添加 CNAME 记录指向 &lt;Tunnel-ID&gt;.cfargotunnel.com，开启代理（🟠）。以多个子域名为例，逐一添加：</p><pre># 单个添加
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/&lt;ZONE_ID>/dns_records" \\
  -H "Authorization: Bearer &lt;API_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "CNAME",
    "name": "emby",
    "content": "&lt;TUNNEL_ID>.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'

# 批量添加（多个域名）
for name in aria2 baota chromium ddnsgo emby fnos fntv \\
          hermes homeassistant istoreos migu moviepilot \\
          omnibox openlist pansou portainer qbittorrent \\
          socks sub2api substore telegram transmission xunlei; do
  curl -s -X POST ".../dns_records" \\
    -H "Authorization: Bearer &lt;API_TOKEN>" \\
    -H "Content-Type: application/json" \\
    -d "{\\"type\\":\\"CNAME\\",\\"name\\":\\"$name\\",\\"content\\":\\"&lt;TUNNEL_ID>.cfargotunnel.com\\",\\"ttl\\":1,\\"proxied\\":true}"
  sleep 0.5
done</pre><p>代理开启后，Cloudflare 边缘节点天然支持 IPv4 + IPv6 双栈，无需额外配置。</p><h2>六、内网防回环</h2><p>内网用户如果也走 CF Tunnel，会形成回环：内网设备 → 路由器 → 外网 → CF 边缘 → Tunnel → 本机。延迟增加且浪费带宽。</p><p>解决方案：在路由器 DNS 中将域名解析到本机 IP，nginx 代理到 127.0.0.1:port：</p><pre>内网设备 → 路由器 DNS 重定向 → 本机 nginx → 本机服务</pre><p>以 FnOS 上的 Nginx 容器为例，在路由器中将 *.example.com 解析到 FnOS 的 IP（如 192.168.31.2），Nginx 再反代到各服务端口。</p><h2>七、双栈验证</h2><p>配置完成后，分别验证 IPv4 和 IPv6 解析：</p><pre># IPv4 解析
dig +short A emby.example.com
# 返回 CF IPv4 地址（如 104.21.x.x）

# IPv6 解析
dig +short AAAA emby.example.com
# 返回 CF IPv6 地址（如 2606:4700::xxx）

# 连通性测试
curl -4 -I https://emby.example.com
curl -6 -I https://emby.example.com</pre><p>如果主域名本身有公网 IPv6（如家中服务器有 /128 的 IPv6 地址），还可以额外添加一条 AAAA 记录直连：</p><pre># 主域名 AAAA 记录（直连 IPv6，不走 CF 代理）
AAAA  example.com  →  2408:8266:xxxx::xxx  ⚪仅 DNS</pre><p>这样 IPv6 用户直连家中服务器，IPv4 用户走 CF Tunnel，实现最优路径。</p><h2>八、最终效果</h2><pre>✅ 外网用户（IPv4）→ CF 边缘 → Tunnel → 各服务
✅ 外网用户（IPv6）→ CF 边缘 → Tunnel → 各服务
✅ 内网用户 → 路由器 DNS → 本机 nginx → 各服务
✅ 无回环、无暴露真实 IP、统一安全防护
✅ 可以多个子域名统一接入，全部双栈可达</pre><h2>九、常见问题</h2><h3>Q: 双栈是否需要单独配置 IPv6？</h3><p>不需要。CF 边缘节点天然双栈，IPv6 访问时自动回源到 Tunnel 的 IPv4 连接。</p><h3>Q: 如何验证双栈？</h3><pre>dig +short A emby.example.com
dig +short AAAA emby.example.com</pre><h3>Q: 部分域名不需要走 CF 代理怎么办？</h3><p>对于已有其他 CDN 或自托管服务的域名，可以关闭代理（⚪仅 DNS），仅保留 DNS 解析功能。例如博客域名 www.example.com 指向 GitHub Pages，可以设为 CNAME → yourname.github.io，关闭代理。</p><h3>Q: Tunnel 最多支持多少域名？</h3><p>Cloudflare 免费版 Tunnel 支持最多 100 个 ingress 规则，对于个人使用完全足够。`);function x(){return n(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=p(),l=e.firstChild,t=l.firstChild;return a(l,o(r,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),t),e})()}export{x as default};
