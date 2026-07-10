import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal } from '../../utils/animations';

export default function ArticleTunnelDualStackFull() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>家庭内网双栈隧道架构：Cloudflare Tunnel + Nginx 统一域名入口实战</h1>
                    <p class="article-subtitle">Cloudflare Tunnel · CoreDNS · Nginx 反代 · 双栈 · 内网防回环 · 端口隔离 · Shadowsocks over WSS</p>
                    <div class="article-meta">
                        <span class="article-date">2026-07-10</span>
                        <div class="article-tags">
                            <span class="tech-tag">Cloudflare</span>
                            <span class="tech-tag">Tunnel</span>
                            <span class="tech-tag">Nginx</span>
                            <span class="tech-tag">双栈</span>
                            <span class="tech-tag">内网穿透</span>
                            <span class="tech-tag">CoreDNS</span>
                            <span class="tech-tag">HomeNet</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <blockquote>
                        <p>本文完整记录了一套家庭内网域名统一接入体系：从 Cloudflare Tunnel 公网穿透、Nginx 统一路由分发、CoreDNS 内网域名劫持，到主路由 hosts 防回环、双栈 V4/V6 支持，以及 Shadowsocks over WSS 直连节点。所有配置均脱敏，按本文步骤可在另一台设备上完整复刻。</p>
                    </blockquote>

                    <h2>一、方案概述</h2>

                    <p>当家庭服务器上运行了十几个服务（NAS、Emby、HomeAssistant、SubStore、下载器等），每个服务一个端口号显然不可维护。更好的做法是：统一域名入口，通过反向代理按 hostname 分发。</p>

                    <p>本文的架构解决三个核心问题：</p>
                    <ul>
                        <li><strong>公网访问</strong>：没有公网 IPv4 怎么办？用 Cloudflare Tunnel 穿透。</li>
                        <li><strong>内网访问</strong>：内网设备不走公网绕一圈，通过 DNS 劫持 + 本地 Nginx 直连。</li>
                        <li><strong>异地回家</strong>：手机在外面能像在家一样访问内网服务，通过 Shadowsocks over WSS 代理隧道。</li>
                    </ul>

                    <p>整体架构分三条路径：</p>
                    <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                    外网用户 (IPv4 / IPv6)                       │
│                          ↓                                      │
│            Cloudflare 边缘节点 (天然双栈)                        │
│                          ↓                                      │
│              Cloudflare Tunnel (cloudflared)                     │
│                          ↓                                      │
│                 Nginx 18080 统一入口                              │
│                    ↙    ↓    ↘                                   │
│              Tower/31.2  FnOS/31.5  iStoreOS/31.10              │
│              各 Docker 容器  影音/存储  软路由管理               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     内网用户                                     │
│                          ↓                                      │
│           主路由 hosts → 192.168.31.250                         │
│             (V4: 192.168.31.250 / V6: 2408:...::250)            │
│                          ↓                                      │
│           LanProxy (OpenResty) :443 SSL 卸载                      │
│                          ↓                                      │
│              Tower Nginx :18080 统一入口                          │
│                          ↓                                      │
│                      后端服务                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    iOS / 异地客户端                               │
│         HomeNet-Fast: fast.deltrivx.com:18443 (直连)              │
│         HomeNet-CF:   substore.deltrivx.com:8443  (CF 中继)      │
│                          ↓                                      │
│               Nginx 18443 SSL → gost 11843 WSS                   │
│               Cloudflared → gost 10089 WSS                       │
│                          ↓                                      │
│                     内网服务                                      │
└─────────────────────────────────────────────────────────────────┘`}</pre>

                    <h2>二、硬件与网络拓扑</h2>

                    <table>
                        <thead>
                            <tr><th>设备</th><th>IP</th><th>角色</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>主路由</td><td>192.168.31.1</td><td>拨号、DHCP、hosts 域名劫持</td></tr>
                            <tr><td>Tower</td><td>192.168.31.2</td><td>主力服务器，运行 Cloudflared、Nginx、LanProxy、LanDNS、所有容器</td></tr>
                            <tr><td>FnOS</td><td>192.168.31.5</td><td>存储与影音服务</td></tr>
                            <tr><td>iStoreOS</td><td>192.168.31.10</td><td>软路由子系统</td></tr>
                            <tr><td>LanProxy</td><td>192.168.31.250</td><td>内网 SSL 卸载，OpenResty 容器 br0 独立 IP</td></tr>
                            <tr><td>LanDNS</td><td>192.168.31.251</td><td>内网 DNS，CoreDNS 容器 br0 独立 IP</td></tr>
                        </tbody>
                    </table>

                    <p>主路由 DHCP 将 DNS 指向 <code>192.168.31.251</code>（LanDNS），所有内网设备自动使用 CoreDNS 解析。</p>

                    <h2>三、Cloudflare 准备工作</h2>

                    <h3>3.1 域名与 NS</h3>
                    <p>将域名 NS 记录指向 Cloudflare，在面板完成域名添加后获得 Zone ID 和 Account ID。</p>

                    <h3>3.2 创建 API Token</h3>
                    <p>进入 Cloudflare 控制台 → My Profile → API Tokens → Create Token，选择 "Edit zone DNS" 模板，授权给当前域名。</p>

                    <h3>3.3 创建 Tunnel</h3>
                    <pre>{`cloudflared tunnel login
cloudflared tunnel create my-tunnel
# 记录 Tunnel ID，例如 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`}</pre>

                    <p>Tunnel 创建后域名入口为 <code>&lt;TUNNEL_ID&gt;.cfargotunnel.com</code>，后续所有 DNS CNAME 记录指向这个地址。</p>

                    <h2>四、容器化部署 Cloudflared</h2>

                    <p>使用 Docker 运行，host 网络模式：</p>

                    <pre>{`services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: Cloudflared
    network_mode: host
    restart: always
    cap_add:
      - CAP_NET_RAW
    command: tunnel run
    entrypoint: cloudflared --no-autoupdate
    volumes:
      - /path/to/config.yml:/etc/cloudflared/config.yml`}</pre>

                    <p><code>config.yml</code> 配置示例：</p>

                    <pre>{`# /path/to/config.yml
token: "<TUNNEL_TOKEN>"

ingress:
  # 普通域名 → Nginx 18080 统一入口
  - hostname: homeassistant.example.com
    service: http://127.0.0.1:18080
  - hostname: emby.example.com
    service: http://127.0.0.1:18080
  - hostname: fnos.example.com
    service: http://127.0.0.1:18080

  # SubStore 特殊路径：ss-direct 直达 gost
  - hostname: substore.example.com
    path: /ss-direct
    service: http://127.0.0.1:10089
  - hostname: substore.example.com
    service: http://127.0.0.1:18080

  # 直连节点不由 Cloudflared 处理
  - hostname: fast.example.com
    service: http_status:404

  # 兜底
  - service: http_status:404`}</pre>

                    <p>验证并重启：</p>
                    <pre>{`docker exec Cloudflared cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate
docker restart Cloudflared`}</pre>

                    <h2>五、Nginx 统一路由分发层</h2>

                    <p>Nginx 监听 18080 端口，按 <code>Host</code> header 分发到对应后端。容器配置：</p>

                    <pre>{`services:
  nginx:
    image: nginx:latest
    container_name: Nginx
    network_mode: host
    restart: always
    volumes:
      - /path/to/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /path/to/nginx/conf.d:/etc/nginx/conf.d
      - /path/to/nginx/certs:/etc/nginx/certs
      - /path/to/nginx/html:/usr/share/nginx/html
      - /path/to/nginx/logs:/var/log/nginx`}</pre>

                    <p>主配置文件：</p>
                    <pre>{`# /path/to/nginx/nginx.conf
worker_processes auto;
events { worker_connections 4096; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server_tokens off;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        "" close;
    }

    include /etc/nginx/conf.d/*.conf;
}`}</pre>

                    <p>域名入口 <code>80-domains.conf</code> —— 每个服务一个 server block，按功能分组。以下仅列示例，实际按需添加：</p>

                    <pre>{`# 18080 域名代理总入口 · *.example.com
# 注: map $http_upgrade $connection_upgrade 已在 nginx.conf 定义

# FnOS 管理后台（跨主机）
server {
    listen 18080;
    server_name fnos.example.com;
    location / {
        proxy_pass http://192.168.31.5:5080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

# Emby 媒体服务器（本机服务）
server {
    listen 18080;
    server_name emby.example.com;
    location / {
        proxy_pass http://192.168.31.2:8096;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HomeAssistant（WebSocket）
server {
    listen 18080;
    server_name homeassistant.example.com;
    location / {
        proxy_pass http://192.168.31.2:8123;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /api/websocket {
        proxy_pass http://192.168.31.2:8123/api/websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }
}

# 兜底 404
server {
    listen 18080 default_server;
    server_name _;
    location / { return 404; }
}`}</pre>

                    <p>添加新服务时，新增一个 server block 然后 reload：</p>
                    <pre>{`docker exec Nginx nginx -t && docker exec Nginx nginx -s reload`}</pre>

                    <p><strong>反代模板速查</strong>：</p>

                    <p>普通 HTTP：</p>
                    <pre>{`location / {
    proxy_pass http://BACKEND_IP:PORT;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}`}</pre>

                    <p>WebSocket：</p>
                    <pre>{`location / {
    proxy_pass http://BACKEND_IP:PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}`}</pre>

                    <h2>六、内网 DNS 劫持：CoreDNS</h2>

                    <p>内网用户访问 <code>*.example.com</code> 时如果走公网会形成回环：内网设备 → 主路由 → 外网 → CF 边缘 → Tunnel → 本机。解决方案：内网 DNS 将域名解析到本地 IP。</p>

                    <pre>{`services:
  landns:
    image: coredns/coredns:1.12.2
    container_name: LanDNS
    networks:
      br0:
        ipv4_address: 192.168.31.251
    restart: always
    command: -conf /etc/coredns/Corefile
    volumes:
      - /path/to/landns/Corefile:/etc/coredns/Corefile
      - /path/to/landns/lan-hosts:/etc/coredns/lan-hosts`}</pre>

                    <pre>{`# /path/to/landns/Corefile
.:53 {
    errors
    log
    hosts /etc/coredns/lan-hosts {
        ttl 30
        fallthrough
    }
    forward . 223.5.5.5 119.29.29.29
    cache 30
}`}</pre>

                    <pre>{`# /path/to/landns/lan-hosts
# V4 解析
192.168.31.250 homeassistant.example.com emby.example.com fnos.example.com substore.example.com

# V6 解析（可选）
2408:8266:2e01:a560::250 homeassistant.example.com emby.example.com fnos.example.com substore.example.com`}</pre>

                    <p>添加新域名时同步更新两行，重启 LanDNS：<code>docker restart LanDNS</code>。</p>

                    <p>主路由 DHCP 将 DNS 指向 <code>192.168.31.251</code>。同时主路由 <code>/etc/hosts</code> 中追加同样映射，确保路由器自身不走公网：</p>
                    <pre>{`# 主路由 /etc/hosts 追加
192.168.31.250 homeassistant.example.com emby.example.com fnos.example.com substore.example.com
2408:8266:2e01:a560::250 homeassistant.example.com emby.example.com fnos.example.com substore.example.com`}</pre>

                    <h2>七、内网 SSL 卸载：LanProxy</h2>

                    <p>内网用户需要 HTTPS 访问，用 OpenResty 统一 SSL 卸载后转发到 Nginx 18080。</p>

                    <pre>{`services:
  lanproxy:
    image: openresty/openresty:alpine
    container_name: LanProxy
    restart: always
    networks:
      br0:
        ipv4_address: 192.168.31.250
        ipv6_address: 2408:8266:2e01:a560::250
    command: /usr/local/openresty/bin/openresty -g 'daemon off;'
    volumes:
      - /path/to/lanproxy/default.conf:/etc/nginx/conf.d/default.conf
      - /path/to/nginx/certs:/etc/nginx/certs
      - /path/to/lanproxy/logs:/var/log/nginx`}</pre>

                    <pre>{`# /path/to/lanproxy/default.conf
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream tunnel_proxy {
    server 192.168.31.248:18080;  # Tower 的 Nginx 18080
    keepalive 32;
}

upstream fast_direct_tls {
    server 192.168.31.248:18443;  # 直连节点
    keepalive 8;
}

# HTTP → HTTPS 重定向
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 308 https://$host$request_uri;
}

# 主 SSL 入口 - 统一代理所有域名
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    http2 on;
    server_name
        homeassistant.example.com
        emby.example.com
        fnos.example.com
        substore.example.com;

    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://tunnel_proxy;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

# fast 直连节点
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name fast.example.com;

    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;

    location = /ss-direct {
        proxy_pass https://fast_direct_tls;
        proxy_ssl_server_name on;
        proxy_ssl_name fast.example.com;
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location / { return 404; }
}

# 兜底 404
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name _;
    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;
    return 404;
}`}</pre>

                    <p>证书可通过 AllinSSL 自动续签：</p>
                    <pre>{`services:
  allinssl:
    image: allinssl/allinssl:latest
    container_name: AllinSSL
    restart: always
    network_mode: host
    volumes:
      - /path/to/allinssl:/www/allinssl/data`}</pre>

                    <h2>八、双栈（V4/V6）实现</h2>

                    <p><strong>公网双栈</strong>：Cloudflare 边缘节点天然支持 V4/V6，DNS 记录开启代理（橙云）即可，无需额外配置。</p>

                    <pre>{`# DNS 添加示例
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records" \\
  -H "Authorization: Bearer <API_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","name":"emby","content":"<TUNNEL_ID>.cfargotunnel.com","ttl":1,"proxied":true}'`}</pre>

                    <p><strong>内网双栈</strong>：CoreDNS 同时配置 V4 和 V6 解析，主路由 hosts 同样双行。</p>

                    <p>验证命令：</p>
                    <pre>{`# 内网解析
dig +short A emby.example.com @192.168.31.251       # → 192.168.31.250
dig +short AAAA emby.example.com @192.168.31.251    # → 2408:...::250

# 公网解析
dig +short A emby.example.com                       # → CF IPv4
dig +short AAAA emby.example.com                    # → CF IPv6`}</pre>

                    <h2>九、HomeNet 直连节点：Shadowsocks over WSS</h2>

                    <p>异地访问内网时，通过 gost 建立两条代理路径。gost 嵌入在 Sub-Store 容器内：</p>

                    <pre>{`# start-single.sh（gost 部分）
# Fast 路径 - 监听 127.0.0.1:11843
gost -L "ss+ws://chacha20-ietf-poly1305:***@127.0.0.1:11843?path=/ss-direct" &

# CF 路径 - 监听 127.0.0.1:10089
gost -L "ss+ws://chacha20-ietf-poly1305:***@127.0.0.1:10089?path=/ss-direct" &`}</pre>

                    <p>Fast 路径走 Nginx 18443 SSL 转发到 gost 11843：</p>
                    <pre>{`# /path/to/nginx/conf.d/443-fast.conf
server {
    listen 18443 ssl;
    listen [::]:18443 ssl;
    server_name fast.example.com;

    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;

    location = /ss-direct {
        proxy_pass http://127.0.0.1:11843;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location / { return 404; }
}`}</pre>

                    <p>CF 路径在 Cloudflared ingress 中直接指向 gost 10089，不走 Nginx：</p>
                    <pre>{`  - hostname: substore.example.com
    path: /ss-direct
    service: http://127.0.0.1:10089`}</pre>

                    <p>端口隔离原则：</p>
                    <ul>
                        <li><code>443</code>：页面、订阅、userinfo</li>
                        <li><code>8443</code>：CF 中继 /ss-direct</li>
                        <li><code>18443</code>：直连 /ss-direct</li>
                    </ul>

                    <p>Quantumult X 客户端节点配置：</p>
                    <pre>{`# HomeNet-Fast（直连）
shadowsocks=fast.example.com:18443, method=chacha20-ietf-poly1305, password=*** obfs=wss, obfs-host=fast.example.com, obfs-uri=/ss-direct, tag=HomeNet-Fast

# HomeNet-CF（CF 中继）
shadowsocks=substore.example.com:8443, method=chacha20-ietf-poly1305, password=*** obfs=wss, obfs-host=substore.example.com, obfs-uri=/ss-direct, tls-verification=false, tag=HomeNet-CF`}</pre>

                    <h2>十、公网 DNS 批量配置</h2>

                    <pre>{`#!/bin/bash
ZONE_ID="你的ZoneID"
API_TOKEN="***"
TUNNEL_ID="你的TunnelID.cfargotunnel.com"

for name in homeassistant emby fnos substore; do
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
    -H "Authorization: Bearer $API_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d "{\\"type\\":\\"CNAME\\",\\"name\\":\\"$name\\",\\"content\\":\\"$TUNNEL_ID\\",\\"ttl\\":1,\\"proxied\\":true}"
  sleep 0.3
done`}</pre>

                    <p>注意：<code>fast.example.com</code> 的 DNS 应为 A/AAAA 记录指向公网 IP，不开启代理。</p>

                    <h2>十一、内网防回环完整流程</h2>

                    <pre>{`内网设备 → 主路由 DHCP → DNS 192.168.31.251 (CoreDNS)
         → CoreDNS hosts 匹配 *.example.com
         → 返回 192.168.31.250 (LanProxy V4) / V6 地址
         → 浏览器访问 https://emby.example.com
         → 主路由 hosts 也指向 31.250（路由器自身）
         → LanProxy 443 SSL 卸载
         → proxy_pass → Tower Nginx 18080
         → Nginx 按 Host header 分发到后端

结果：全程内网，不经过公网，延迟 <1ms`}</pre>

                    <p>注意：<code>192.168.31.248</code> 是 Tower 在 Docker br0 网络中的 IP，你的环境可能不同。</p>

                    <h2>十二、容器配置清单</h2>

                    <pre>{`version: '3.8'

networks:
  br0:
    driver: macvlan
    driver_opts:
      parent: br0
    ipam:
      config:
        - subnet: 192.168.31.0/24
          gateway: 192.168.31.1
          ip_range: 192.168.31.248/29
        - subnet: "2408:8266:2e01:a560::/64"
          gateway: "2408:8266:2e01:a560::1"

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: Cloudflared
    network_mode: host
    restart: always
    cap_add: [CAP_NET_RAW]
    command: tunnel run
    entrypoint: cloudflared --no-autoupdate
    volumes:
      - /mnt/user/appdata/cloudflared/config.yml:/etc/cloudflared/config.yml

  nginx:
    image: nginx:latest
    container_name: Nginx
    network_mode: host
    restart: always
    volumes:
      - /mnt/user/appdata/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /mnt/user/appdata/nginx/conf.d:/etc/nginx/conf.d
      - /mnt/user/appdata/nginx/certs:/etc/nginx/certs
      - /mnt/user/appdata/nginx/html:/usr/share/nginx/html
      - /mnt/user/appdata/nginx/logs:/var/log/nginx

  lanproxy:
    image: openresty/openresty:alpine
    container_name: LanProxy
    restart: always
    networks:
      br0:
        ipv4_address: 192.168.31.250
        ipv6_address: 2408:8266:2e01:a560::250
    command: /usr/local/openresty/bin/openresty -g 'daemon off;'
    volumes:
      - /mnt/user/appdata/lanproxy/default.conf:/etc/nginx/conf.d/default.conf
      - /mnt/user/appdata/nginx/certs:/etc/nginx/certs
      - /mnt/user/appdata/lanproxy/logs:/var/log/nginx

  landns:
    image: coredns/coredns:1.12.2
    container_name: LanDNS
    restart: always
    networks:
      br0:
        ipv4_address: 192.168.31.251
    command: -conf /etc/coredns/Corefile
    volumes:
      - /mnt/user/appdata/landns/Corefile:/etc/coredns/Corefile
      - /mnt/user/appdata/landns/lan-hosts:/etc/coredns/lan-hosts

  allinssl:
    image: allinssl/allinssl:latest
    container_name: AllinSSL
    restart: always
    network_mode: host
    volumes:
      - /mnt/user/appdata/allinssl:/www/allinssl/data`}</pre>

                    <h2>十三、验证流程</h2>

                    <pre>{`# Cloudflared
docker ps --filter name=Cloudflared
docker exec Cloudflared cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate

# Nginx
docker exec Nginx nginx -t
curl -I -H "Host: emby.example.com" http://127.0.0.1:18080/

# 公网
dig +short A emby.example.com          # → CF IPv4
dig +short AAAA emby.example.com       # → CF IPv6

# 内网直连
dig +short A emby.example.com @192.168.31.251   # → 192.168.31.250
curl -I https://emby.example.com                # 不走公网

# 代理隧道
curl -k -I https://fast.example.com:18443/ss-direct
curl -k -I https://substore.example.com:8443/ss-direct`}</pre>

                    <h2>十四、添加新服务流程</h2>

                    <ol>
                        <li>Nginx <code>80-domains.conf</code> 新增 server block</li>
                        <li>CoreDNS <code>lan-hosts</code> 新增域名（V4 + V6 两行）</li>
                        <li>主路由 <code>/etc/hosts</code> 新增域名（V4 + V6 两行）</li>
                        <li>Cloudflared <code>config.yml</code> 新增 ingress 规则</li>
                        <li>Cloudflare DNS 添加 CNAME 记录</li>
                        <li>验证：<code>nginx -t && cloudflared ingress validate && nginx -s reload && docker restart Cloudflared</code></li>
                    </ol>

                    <h2>十五、常见问题</h2>

                    <h3>Q1：内网访问走公网回环？</h3>
                    <p>检查 CoreDNS 是否运行，主路由 DHCP DNS 是否指向 31.251，主路由 hosts 是否正确。内网设备执行 <code>nslookup emby.example.com</code> 确认解析结果。</p>

                    <h3>Q2：Cloudflared ingress 验证失败？</h3>
                    <p>检查规则顺序——特殊路径必须在普通域名之前，兜底 404 必须在最后。修改后需重启容器。</p>

                    <h3>Q3：Nginx 502？</h3>
                    <p>检查后端服务端口。使用 <code>curl -I http://127.0.0.1:PORT</code> 直接测试后端。WebSocket 服务需 <code>proxy_http_version 1.1</code> 和 Upgrade 头。</p>

                    <h3>Q4：双栈 V6 不通？</h3>
                    <p>检查主路由 V6 防火墙是否放行 443。CF 边缘到 Tunnel 回源走 V4，内网 V6 需 LanProxy V6 地址和 hosts 双行正确配置。</p>

                    <h3>Q5：如何备份？</h3>
                    <pre>{`tar -czf tunnel-backup-\$(date +%Y%m%d).tar.gz \\
  /path/to/cloudflared/ /path/to/nginx/conf.d/ /path/to/nginx/nginx.conf \\
  /path/to/lanproxy/ /path/to/landns/ /path/to/nginx/certs/`}</pre>

                    <h2>十六、总结</h2>

                    <p>核心设计原则：</p>
                    <ul>
                        <li><strong>统一入口</strong>：所有域名走 Nginx 18080 分发</li>
                        <li><strong>职责分离</strong>：Cloudflared 管隧道，Nginx 管路由，CoreDNS 管解析</li>
                        <li><strong>内外分流</strong>：内网 DNS 劫持直连，外网 Tunnel 穿透</li>
                        <li><strong>双栈就绪</strong>：V4/V6 同时支持</li>
                        <li><strong>端口隔离</strong>：页面、订阅、代理隧道不同端口</li>
                    </ul>

                    <p>按本文步骤替换域名、IP 和 Token 后即可完整复刻。</p>

                </div>
            </div>
        </section>
    );
}