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
                        <p>本文完整记录了一套家庭内网域名统一接入体系：从 Cloudflare Tunnel 公网穿透、Nginx 18080 统一路由分发、CoreDNS 内网域名劫持，到主路由 hosts 防回环、双栈 V4/V6 支持，以及 Shadowsocks over WSS 直连节点。所有配置均脱敏，按本文步骤可在另一台设备上完整复刻。</p>
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
│           主路由 31.1 hosts → 192.168.31.250                     │
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
│               Cloudflared → Nginx 18080 → gost 10089 WSS        │
│                          ↓                                      │
│                     内网服务                                      │
└─────────────────────────────────────────────────────────────────┘`}</pre>

                    <h2>二、硬件与网络拓扑</h2>

                    <p>本文基于以下硬件环境，你可以根据自身设备调整 IP 和配置：</p>

                    <table>
                        <thead>
                            <tr><th>设备</th><th>IP</th><th>角色</th><th>OS</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>主路由</td><td>192.168.31.1</td><td>拨号上网、DHCP、hosts 域名劫持</td><td>OpenWRT / iStoreOS / 爱快等</td></tr>
                            <tr><td>Tower</td><td>192.168.31.2</td><td>主力服务器，运行 Cloudflared、Nginx、LanProxy、LanDNS、所有 Docker 容器</td><td>Unraid 7.3.1</td></tr>
                            <tr><td>FnOS</td><td>192.168.31.5</td><td>存储与影音服务（飞牛影视、FnOS 管理后台）</td><td>FnOS</td></tr>
                            <tr><td>iStoreOS</td><td>192.168.31.10</td><td>软路由子系统（插件管理）</td><td>iStoreOS</td></tr>
                            <tr><td>LanProxy</td><td>192.168.31.250</td><td>内网 SSL 卸载入口，OpenResty 容器，br0 模式独立 IP</td><td>OpenResty (容器)</td></tr>
                            <tr><td>LanDNS</td><td>192.168.31.251</td><td>内网 DNS 服务器，CoreDNS 容器，br0 模式独立 IP</td><td>CoreDNS (容器)</td></tr>
                        </tbody>
                    </table>

                    <p>主路由的 DHCP 将 DNS 指向 <code>192.168.31.251</code>（LanDNS），所有内网设备自动使用 CoreDNS 解析域名。</p>

                    <h2>三、Cloudflare 准备工作</h2>

                    <h3>3.1 域名与 NS</h3>
                    <p>将域名（如 <code>deltrivx.com</code>）的 NS 记录指向 Cloudflare。在 Cloudflare 面板中完成域名添加后，你会获得 Zone ID 和 Account ID，后续需要用到。</p>

                    <h3>3.2 创建 API Token</h3>
                    <p>进入 Cloudflare 控制台 → My Profile → API Tokens → Create Token。选择 "Edit zone DNS" 模板，授权给当前域名：</p>
                    <pre>{`# 权限模板
Zone - DNS - Edit
Zone - Zone - Read
Zone - Cloudflare Tunnel - Read  # 如果需要管理 Tunnel`}</pre>

                    <h3>3.3 创建 Tunnel</h3>
                    <pre>{`# 安装 cloudflared（直接在服务器上执行）
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 认证（会打开浏览器登录你的 Cloudflare 账号）
cloudflared tunnel login

# 创建 Tunnel
cloudflared tunnel create my-tunnel

# 记录 Tunnel ID，例如 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# 记录凭证文件路径，例如 ~/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json`}</pre>

                    <p>创建完成后，Tunnel 的域名入口为 <code>&lt;TUNNEL_ID&gt;.cfargotunnel.com</code>，后续所有 DNS 记录都 CNAME 指向这个地址。</p>

                    <h2>四、容器化部署 Cloudflared</h2>

                    <p>本文使用 Docker 运行 cloudflared，使用 host 网络模式以获取最佳性能：</p>

                    <pre>{`# docker-compose.yml
services:
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
      - /mnt/user/appdata/cloudflared/config.yml:/etc/cloudflared/config.yml`}</pre>

                    <p><code>--no-autoupdate</code> 避免容器内自动更新导致意外重启，镜像版本由 Docker 管理。</p>

                    <p><code>config.yml</code> 配置如下：</p>

                    <pre>{`# /mnt/user/appdata/cloudflared/config.yml
token: "<TUNNEL_TOKEN>"   # 从凭证文件获取

ingress:
  # 全部指向 Nginx 18080 统一入口
  - hostname: homeassistant.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: moviepilot.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: pansou.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: portainer.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: ddnsgo.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: openlist.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: omnibox.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: migu.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: emby.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: fntv.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: chromium.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: istoreos.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: tower.deltrivx.com
    service: http://127.0.0.1:18080
  - hostname: fnos.deltrivx.com
    service: http://127.0.0.1:18080

  # SubStore 特殊路径：ss-direct 直接指向 gost，不走 Nginx
  - hostname: substore.deltrivx.com
    path: /ss-direct
    service: http://127.0.0.1:10089
  - hostname: substore.deltrivx.com
    service: http://127.0.0.1:18080

  # fast 域名由 Nginx 18443 处理，Cloudflared 不处理
  - hostname: fast.deltrivx.com
    service: http_status:404

  # 兜底
  - service: http_status:404`}</pre>

                    <p>验证配置并重启：</p>
                    <pre>{`# 验证 ingress 规则
docker exec Cloudflared cloudflared tunnel ingress validate

# 重启
docker restart Cloudflared

# 查看日志
docker logs --tail 30 Cloudflared`}</pre>

                    <h2>五、Nginx 统一路由分发层</h2>

                    <p>Nginx 监听 <code>18080</code> 端口，所有 Cloudflared 转发过来的流量按 <code>Host</code> header 分发到对应后端服务。</p>

                    <h3>5.1 Nginx 容器</h3>
                    <pre>{`services:
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
      - /mnt/user/appdata/nginx/logs:/var/log/nginx`}</pre>

                    <h3>5.2 主配置文件</h3>
                    <pre>{`# /mnt/user/appdata/nginx/nginx.conf
worker_processes auto;
events { worker_connections 4096; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server_tokens off;

    # WebSocket 升级映射
    map $http_upgrade $connection_upgrade {
        default upgrade;
        "" close;
    }

    include /etc/nginx/conf.d/*.conf;
}`}</pre>

                    <h3>5.3 域名入口配置</h3>
                    <p>以下为 <code>80-domains.conf</code> 完整内容。每个服务一个 server block，按功能分组：</p>

                    <pre>{`# /mnt/user/appdata/nginx/conf.d/80-domains.conf
# 18080 域名代理总入口 · *.deltrivx.com
# 注: map $http_upgrade $connection_upgrade 已在 nginx.conf 定义

# ── SubStore (含 WebSocket) ──
server {
    listen 18080;
    server_name substore.deltrivx.com;

    location = /ss-direct {
        proxy_pass http://192.168.31.2:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location / {
        proxy_pass http://192.168.31.2:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

# ── 下载工具 ──
server {
    listen 18080;
    server_name migu.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:1234;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# ── 影音媒体 ──
server {
    listen 18080;
    server_name emby.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:8096;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# ── 文件 & 网盘 ──
server {
    listen 18080;
    server_name pansou.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:3080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 18080;
    server_name openlist.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:5244;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# ── 智能家居 ──
server {
    listen 18080;
    server_name homeassistant.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:8123;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }
}

# ── 系统管理 ──
server {
    listen 18080;
    server_name fnos.deltrivx.com;
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

server {
    listen 18080;
    server_name fntv.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.5:8005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 18080;
    server_name portainer.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 18080;
    server_name ddnsgo.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:9876;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# ── 其他服务 ──
server {
    listen 18080;
    server_name moviepilot.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 18080;
    server_name omnibox.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:7023;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 18080;
    server_name chromium.deltrivx.com;
    location / {
        proxy_pass https://192.168.31.2:3011;
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

server {
    listen 18080;
    server_name istoreos.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.10:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 18080;
    server_name tower.deltrivx.com;
    location / {
        proxy_pass http://192.168.31.2:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
        proxy_set_header X-Forwarded-Port 443;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_redirect http://tower.deltrivx.com/ https://tower.deltrivx.com/;
    }
}

# 兜底 404
server {
    listen 18080 default_server;
    server_name _;
    location / { return 404; }
}`}</pre>

                    <p>添加新服务时，只需在这个文件里新增一个 server block，然后 reload Nginx：</p>
                    <pre>{`docker exec Nginx nginx -t
docker exec Nginx nginx -s reload`}</pre>

                    <h2>六、内网 DNS 劫持：CoreDNS</h2>

                    <p>内网用户访问 <code>*.deltrivx.com</code> 时，如果走公网会形成回环：内网设备 → 主路由 → 外网 → CF 边缘 → Tunnel → 本机。延迟大、浪费带宽，且部分服务可能依赖内网直连。</p>

                    <p>解决方案：在内网架设一个 DNS 服务器，将 <code>*.deltrivx.com</code> 解析到本地 IP，不走公网。</p>

                    <h3>6.1 CoreDNS 容器</h3>
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
      - /mnt/user/appdata/landns/Corefile:/etc/coredns/Corefile
      - /mnt/user/appdata/landns/lan-hosts:/etc/coredns/lan-hosts`}</pre>

                    <p>br0 网络模式需要 Docker 自定义 macvlan/bridge 网络，确保容器获得独立 IP。</p>

                    <h3>6.2 Corefile 配置</h3>
                    <pre>{`# /mnt/user/appdata/landns/Corefile
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

                    <h3>6.3 hosts 文件</h3>
                    <pre>{`# /mnt/user/appdata/landns/lan-hosts
# 内网域名劫持 - 所有 *.deltrivx.com 指向 LanProxy (31.250)
# V4 解析
192.168.31.250 homeassistant.deltrivx.com moviepilot.deltrivx.com pansou.deltrivx.com portainer.deltrivx.com ddnsgo.deltrivx.com openlist.deltrivx.com omnibox.deltrivx.com migu.deltrivx.com emby.deltrivx.com fntv.deltrivx.com chromium.deltrivx.com istoreos.deltrivx.com substore.deltrivx.com tower.deltrivx.com fnos.deltrivx.com

# V6 解析（可选，如果内网有 V6 环境）
2408:8266:2e01:a560::250 homeassistant.deltrivx.com moviepilot.deltrivx.com pansou.deltrivx.com portainer.deltrivx.com ddnsgo.deltrivx.com openlist.deltrivx.com omnibox.deltrivx.com migu.deltrivx.com emby.deltrivx.com fntv.deltrivx.com chromium.deltrivx.com istoreos.deltrivx.com substore.deltrivx.com tower.deltrivx.com fnos.deltrivx.com`}</pre>

                    <p>添加新域名时，同步更新这个文件的两行（V4 和 V6），然后重启 LanDNS：</p>
                    <pre>{`docker restart LanDNS`}</pre>

                    <h3>6.4 主路由设置</h3>
                    <p>在主路由（192.168.31.1）的 DHCP 设置中，将 DNS 服务器设为 <code>192.168.31.251</code>。所有内网设备自动获取 DNS 后，访问 <code>*.deltrivx.com</code> 就会解析到 LanProxy。</p>

                    <p>同时，在主路由的 <code>/etc/hosts</code> 中追加同样的域名映射，确保路由器自身也走内网直连：</p>
                    <pre>{`# 主路由 /etc/hosts 追加
192.168.31.250 homeassistant.deltrivx.com moviepilot.deltrivx.com pansou.deltrivx.com portainer.deltrivx.com ddnsgo.deltrivx.com openlist.deltrivx.com omnibox.deltrivx.com migu.deltrivx.com emby.deltrivx.com fntv.deltrivx.com chromium.deltrivx.com istoreos.deltrivx.com substore.deltrivx.com tower.deltrivx.com fnos.deltrivx.com
2408:8266:2e01:a560::250 homeassistant.deltrivx.com moviepilot.deltrivx.com pansou.deltrivx.com portainer.deltrivx.com ddnsgo.deltrivx.com openlist.deltrivx.com omnibox.deltrivx.com migu.deltrivx.com emby.deltrivx.com fntv.deltrivx.com chromium.deltrivx.com istoreos.deltrivx.com substore.deltrivx.com tower.deltrivx.com fnos.deltrivx.com`}</pre>

                    <p>注意：本文不修改主路由的 DNS 指向配置，仅在 hosts 中追加域名映射。</p>

                    <h2>七、内网 SSL 卸载：LanProxy</h2>

                    <p>内网用户访问域名时，如果走 HTTP 会被浏览器标记不安全，且部分服务强制 HTTPS。因此需要一个内网 SSL 卸载层。</p>

                    <p>LanProxy 使用 OpenResty（nginx 增强版），监听 443 端口，统一 SSL 卸载后转发到 Tower Nginx 18080。</p>

                    <h3>7.1 LanProxy 容器</h3>
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
      - /mnt/user/appdata/lanproxy/default.conf:/etc/nginx/conf.d/default.conf
      - /mnt/user/appdata/nginx/certs:/etc/nginx/certs
      - /mnt/user/appdata/lanproxy/logs:/var/log/nginx`}</pre>

                    <h3>7.2 LanProxy 配置</h3>
                    <pre>{`# /mnt/user/appdata/lanproxy/default.conf
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream tunnel_proxy {
    server 192.168.31.248:18080;  # 指向 Tower 的 Nginx 18080
    keepalive 32;
}

upstream fast_direct_tls {
    server 192.168.31.248:18443;  # 指向 Tower 的 Nginx 18443 (直连节点)
    keepalive 8;
}

# HTTP → HTTPS 重定向
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 308 https://$host$request_uri;
}

# 主 SSL 入口
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    http2 on;
    server_name
        openlist.deltrivx.com
        pansou.deltrivx.com
        substore.deltrivx.com
        tower.deltrivx.com
        fnos.deltrivx.com
        fntv.deltrivx.com
        homeassistant.deltrivx.com
        moviepilot.deltrivx.com
        portainer.deltrivx.com
        ddnsgo.deltrivx.com
        omnibox.deltrivx.com
        migu.deltrivx.com
        emby.deltrivx.com
        chromium.deltrivx.com
        istoreos.deltrivx.com;

    ssl_certificate     /etc/nginx/certs/deltrivx.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/deltrivx.com/privkey.pem;
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

# fast 直连节点 SSL 入口
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name fast.deltrivx.com;

    ssl_certificate     /etc/nginx/certs/deltrivx.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/deltrivx.com/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_protocols TLSv1.2 TLSv1.3;

    location = /ss-direct {
        proxy_pass https://fast_direct_tls;
        proxy_ssl_server_name on;
        proxy_ssl_name fast.deltrivx.com;
        proxy_ssl_verify off;
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

    location / { return 404; }
}

# 兜底 404
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name _;
    ssl_certificate     /etc/nginx/certs/deltrivx.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/deltrivx.com/privkey.pem;
    return 404;
}`}</pre>

                    <h3>7.3 证书来源</h3>
                    <p>证书文件位于 <code>/mnt/user/appdata/nginx/certs/deltrivx.com/</code>，包含 <code>fullchain.pem</code> 和 <code>privkey.pem</code>。可以使用 AllinSSL 容器自动化申请和续签：</p>
                    <pre>{`services:
  allinssl:
    image: allinssl/allinssl:latest
    container_name: AllinSSL
    restart: always
    network_mode: host
    volumes:
      - /mnt/user/appdata/allinssl:/www/allinssl/data`}</pre>
                    <p>通过 <code>http://192.168.31.2:8888/allinssl</code> 访问管理面板，配置证书自动续签。</p>

                    <h2>八、双栈（V4/V6）实现</h2>

                    <h3>8.1 公网双栈</h3>
                    <p>Cloudflare 边缘节点天然支持 IPv4 和 IPv6。所有 DNS 记录开启代理（橙云）后，Cloudflare 自动处理双栈接入：</p>
                    <ul>
                        <li>IPv4 用户访问时，Cloudflare 返回 CF 边缘的 IPv4 地址。</li>
                        <li>IPv6 用户访问时，Cloudflare 返回 CF 边缘的 IPv6 地址。</li>
                        <li>CF 边缘到 Tunnel 回源走 IPv4。</li>
                    </ul>
                    <p>无需任何额外配置。公网 DNS 记录统一为 CNAME 指向 <code>&lt;TUNNEL_ID&gt;.cfargotunnel.com</code>，开启代理：</p>
                    <pre>{`# 添加 DNS 记录示例
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records" \\
  -H "Authorization: Bearer <API_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "CNAME",
    "name": "emby",
    "content": "<TUNNEL_ID>.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'`}</pre>

                    <h3>8.2 内网双栈</h3>
                    <p>内网 DNS（CoreDNS）同时配置了 V4 和 V6 解析：</p>
                    <ul>
                        <li><strong>V4</strong>：<code>192.168.31.250</code>（LanProxy）</li>
                        <li><strong>V6</strong>：<code>2408:8266:2e01:a560::250</code>（LanProxy 的 V6 地址）</li>
                    </ul>
                    <p>主路由的 hosts 同样配置 V4 和 V6 双行，确保路由器自身和 DHCP 客户端都能正确解析。</p>

                    <p>验证双栈：</p>
                    <pre>{`# 内网 V4 解析
dig +short A emby.deltrivx.com @192.168.31.251
# 期望: 192.168.31.250

# 内网 V6 解析
dig +short AAAA emby.deltrivx.com @192.168.31.251
# 期望: 2408:8266:2e01:a560::250

# 公网 V4 解析
dig +short A emby.deltrivx.com
# 期望: CF 边缘 IPv4 (如 104.21.x.x)

# 公网 V6 解析
dig +short AAAA emby.deltrivx.com
# 期望: CF 边缘 IPv6 (如 2606:4700::xxx)`}</pre>

                    <h2>九、HomeNet 直连节点：Shadowsocks over WSS</h2>

                    <p>异地访问内网时，可以通过 Cloudflare Tunnel 走 HTTP 访问页面，但代理隧道（Shadowsocks）需要 WebSocket 升级。因此设计两条代理路径：</p>

                    <ul>
                        <li><strong>HomeNet-Fast</strong>：直连路径，走 <code>fast.deltrivx.com:18443</code>。</li>
                        <li><strong>HomeNet-CF</strong>：备用路径，走 <code>substore.deltrivx.com:8443</code>，通过 Cloudflare Tunnel 中继。</li>
                    </ul>

                    <h3>9.1 gost 代理服务端</h3>
                    <p>gost 嵌入在 Sub-Store 容器内，通过启动脚本启动两个 gost 实例：</p>
                    <pre>{`# /mnt/user/appdata/sub-store/app/start-single.sh
#!/bin/sh
set -eu

# HomeNet Fast 路径 - 监听 127.0.0.1:11843
gost -L "ss+ws://chacha20-ietf-poly1305:password@127.0.0.1:11843?path=/ss-direct" &
GOST_PID1=$!

# HomeNet CF 路径 - 监听 127.0.0.1:10089
gost -L "ss+ws://chacha20-ietf-poly1305:password@127.0.0.1:10089?path=/ss-direct" &
GOST_PID2=$!

# 启动 SubStore 主程序
node -r /opt/app/homenet-backend-hook.js /opt/app/sub-store.bundle.js &
APP_PID=$!

# 守护进程
while true; do
  kill -0 "$APP_PID" 2>/dev/null || exit 1
  kill -0 "$GOST_PID1" 2>/dev/null || exit 1
  kill -0 "$GOST_PID2" 2>/dev/null || exit 1
  sleep 2
done`}</pre>

                    <p>两个 gost 实例的区别：</p>
                    <ul>
                        <li><code>11843</code>：Fast 路径，被 Nginx 18443 反代。</li>
                        <li><code>10089</code>：CF 路径，被 Cloudflared 直接反代（不走 Nginx 18080）。</li>
                    </ul>

                    <h3>9.2 Fast 路径：Nginx 18443 SSL</h3>
                    <pre>{`# /mnt/user/appdata/nginx/conf.d/443-fast.conf
server {
    listen 18443 ssl;
    listen [::]:18443 ssl;
    server_name fast.deltrivx.com;

    ssl_certificate     /etc/nginx/certs/deltrivx.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/deltrivx.com/privkey.pem;

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

                    <h3>9.3 CF 路径：Cloudflared 直达 gost</h3>
                    <p>在 Cloudflared config.yml 中，<code>substore.deltrivx.com/ss-direct</code> 直接指向 gost 10089，不走 Nginx：</p>
                    <pre>{`  # SubStore 特殊路径：ss-direct 直接指向 gost
  - hostname: substore.deltrivx.com
    path: /ss-direct
    service: http://127.0.0.1:10089

  # SubStore 普通页面走 Nginx
  - hostname: substore.deltrivx.com
    service: http://127.0.0.1:18080`}</pre>

                    <p>端口隔离的好处：</p>
                    <ul>
                        <li><code>443</code>：SubStore 页面、订阅、userinfo。</li>
                        <li><code>8443</code>：只承载 <code>/ss-direct</code> WSS 隧道（CF 中继路径）。</li>
                        <li><code>18443</code>：只承载 <code>/ss-direct</code> WSS 隧道（直连路径）。</li>
                    </ul>

                    <h3>9.4 Quantumult X 客户端配置</h3>
                    <p>客户端通过 SubStore 订阅拉取节点，自动生成两条节点：</p>
                    <pre>{`# HomeNet-Fast：直连路径
shadowsocks=fast.deltrivx.com:18443, method=chacha20-ietf-poly1305, password=password, obfs=wss, obfs-host=fast.deltrivx.com, obfs-uri=/ss-direct, fast-open=true, udp-relay=false, server_check_url=http://connectivitycheck.gstatic.com/generate_204, tag=HomeNet-Fast

# HomeNet-CF：CF 中继路径
shadowsocks=substore.deltrivx.com:8443, method=chacha20-ietf-poly1305, password=password, obfs=wss, obfs-host=substore.deltrivx.com, obfs-uri=/ss-direct, tls-verification=false, fast-open=true, udp-relay=false, server_check_url=http://connectivitycheck.gstatic.com/generate_204, tag=HomeNet-CF`}</pre>

                    <p>在 Quantumult X 中配置策略组，优先使用 Fast 路径，Fast 不通时自动切换到 CF 路径。</p>

                    <h2>十、公网 DNS 批量配置</h2>

                    <p>所有域名统一添加 CNAME 记录。以下脚本可批量添加：</p>
                    <pre>{`#!/bin/bash
# batch-add-dns.sh
ZONE_ID="你的ZoneID"
API_TOKEN="你的APIToken"
TUNNEL_ID="你的TunnelID.cfargotunnel.com"

for name in homeassistant moviepilot pansou portainer ddnsgo \\
            openlist omnibox migu emby fntv chromium istoreos \\
            substore tower fnos; do
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
    -H "Authorization: Bearer $API_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d "{\\"type\\":\\"CNAME\\",\\"name\\":\\"$name\\",\\"content\\":\\"$TUNNEL_ID\\",\\"ttl\\":1,\\"proxied\\":true}"
  sleep 0.3
done`}</pre>

                    <p>注意：<code>fast.deltrivx.com</code> 的 DNS 记录应为 A/AAAA 记录指向公网 IP（或 DDNS），不开启代理，因为它是直连节点。</p>

                    <h2>十一、内网防回环完整流程</h2>

                    <p>总结内网防回环的完整链路：</p>
                    <pre>{`内网设备 → 主路由 DHCP → DNS 192.168.31.251 (CoreDNS)
         → CoreDNS hosts 匹配 *.deltrivx.com
         → 返回 192.168.31.250 (LanProxy V4) / V6 地址
         → 浏览器访问 https://substore.deltrivx.com
         → 主路由 hosts 也指向 31.250（路由器自身）
         → LanProxy 443 SSL 卸载
         → proxy_pass → Tower 192.168.31.248:18080
         → Nginx 按 Host header 分发到后端
         → 后端服务响应

结果：全程内网，不经过公网，延迟 <1ms`}</pre>

                    <p>注意：<code>192.168.31.248</code> 是 Tower 在 Docker br0 网络中的 IP（Tower 主机本身是 31.2，但 br0 网络中容器通过 31.248 访问宿主机端口）。你的环境可能不同，请根据实际网络配置调整。</p>

                    <h2>十二、容器配置清单</h2>

                    <p>以下为完整的 docker-compose.yml 配置，包含所有关键基础设施容器：</p>

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
    cap_add:
      - CAP_NET_RAW
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

                    <p>部署完成后，按以下步骤逐一验证：</p>

                    <h3>13.1 验证 Cloudflared</h3>
                    <pre>{`# 检查容器运行状态
docker ps --filter name=Cloudflared --format "{{.Names}} {{.Status}}"

# 验证 ingress 规则
docker exec Cloudflared cloudflared tunnel ingress validate

# 查看日志
docker logs --tail 20 Cloudflared`}</pre>

                    <h3>13.2 验证 Nginx</h3>
                    <pre>{`# 检查配置
docker exec Nginx nginx -t

# 验证内网 Host header 可达
curl -I --max-time 5 -H "Host: emby.deltrivx.com" http://127.0.0.1:18080/

# 验证 WebSocket 服务
curl -I --max-time 5 -H "Host: homeassistant.deltrivx.com" http://127.0.0.1:18080/api/websocket`}</pre>

                    <h3>13.3 验证公网访问</h3>
                    <pre>{`# 公网 DNS 解析
dig +short A emby.deltrivx.com
dig +short AAAA emby.deltrivx.com

# 公网访问（需要在外网环境测试）
curl -4 -I https://emby.deltrivx.com
curl -6 -I https://emby.deltrivx.com`}</pre>

                    <h3>13.4 验证内网直连</h3>
                    <pre>{`# 内网 DNS 解析
dig +short A emby.deltrivx.com @192.168.31.251
# 期望: 192.168.31.250

# 内网访问
curl -I https://emby.deltrivx.com
# 期望: 直接返回，不走公网`}</pre>

                    <h3>13.5 验证代理隧道</h3>
                    <pre>{`# 验证 Fast 直连节点
curl -k -I https://fast.deltrivx.com:18443/ss-direct

# 验证 CF 中继节点
curl -k -I https://substore.deltrivx.com:8443/ss-direct

# 验证 userinfo 接口
curl -s https://substore.deltrivx.com/homenet-userinfo`}</pre>

                    <h2>十四、添加新服务流程</h2>

                    <p>当有新服务上线时，按以下步骤操作：</p>

                    <ol>
                        <li>在 Nginx <code>80-domains.conf</code> 中新增 server block，配置 proxy_pass。</li>
                        <li>在 CoreDNS <code>lan-hosts</code> 中新增域名（V4 和 V6 两行）。</li>
                        <li>在主路由 <code>/etc/hosts</code> 中新增域名（V4 和 V6 两行）。</li>
                        <li>在 Cloudflared <code>config.yml</code> 中新增 ingress 规则（插入到兜底 404 前）。</li>
                        <li>在 Cloudflare DNS 中添加 CNAME 记录。</li>
                        <li>验证：<code>nginx -t && cloudflared tunnel ingress validate && nginx -s reload && docker restart Cloudflared</code></li>
                    </ol>

                    <h2>十五、常见问题</h2>

                    <h3>Q1：内网访问 CF 域名走公网回环了？</h3>
                    <p>检查 CoreDNS 是否正常运行，主路由 DHCP 是否将 DNS 指向 31.251，主路由 hosts 是否配置了域名映射。可以在内网设备上执行 <code>nslookup emby.deltrivx.com</code> 确认解析结果。</p>

                    <h3>Q2：添加新域名后 CoreDNS 不生效？</h3>
                    <p>CoreDNS 的 hosts 缓存 TTL 为 30 秒。如果修改后不生效，重启容器：<code>docker restart LanDNS</code>。同时检查主路由 hosts 是否同步更新。</p>

                    <h3>Q3：Cloudflared ingress 验证失败？</h3>
                    <p>检查 ingress 规则顺序——特殊路径（如 <code>/ss-direct</code>）必须在普通域名之前，兜底 404 必须在最后。每新增一条规则都需要重新验证和重启。</p>

                    <h3>Q4：Nginx 配置了，访问还是 502？</h3>
                    <p>检查后端服务端口是否正确，是否在监听。使用 <code>curl -I http://127.0.0.1:PORT</code> 直接测试后端服务是否可达。WebSocket 服务需要额外的 <code>proxy_http_version 1.1</code> 和 Upgrade 头。</p>

                    <h3>Q5：双栈配置后，V6 访问不通？</h3>
                    <p>检查主路由的 V6 防火墙是否放行 443 端口。Cloudflare 边缘节点天然支持 V6，但回源到 Tunnel 走 V4。内网 V6 直连需要 LanProxy 的 V6 地址正确配置，且主路由 hosts 包含 V6 行。</p>

                    <h3>Q6：如何备份和恢复配置？</h3>
                    <pre>{`# 备份所有配置
tar -czf tunnel-backup-$(date +%Y%m%d).tar.gz \\
  /mnt/user/appdata/cloudflared/ \\
  /mnt/user/appdata/nginx/conf.d/ \\
  /mnt/user/appdata/nginx/nginx.conf \\
  /mnt/user/appdata/lanproxy/ \\
  /mnt/user/appdata/landns/ \\
  /mnt/user/appdata/nginx/certs/

# 恢复
tar -xzf tunnel-backup-YYYYMMDD.tar.gz -C /`}</pre>

                    <h2>十六、总结</h2>

                    <p>这套架构的核心设计原则：</p>
                    <ul>
                        <li><strong>统一入口</strong>：所有域名统一走 Nginx 18080 分发，新增服务只需加一个 server block。</li>
                        <li><strong>职责分离</strong>：Cloudflared 只负责隧道穿透，Nginx 只负责路由分发，CoreDNS 只负责 DNS 解析，各司其职。</li>
                        <li><strong>内外分流</strong>：内网用户通过 DNS 劫持直连，不经过公网；外网用户通过 Cloudflare Tunnel 穿透。</li>
                        <li><strong>双栈就绪</strong>：V4 和 V6 同时支持，适应不同网络环境。</li>
                        <li><strong>端口隔离</strong>：页面、订阅、代理隧道使用不同端口，排障不互相干扰。</li>
                    </ul>

                    <p>按本文步骤，你可以在另一台设备上完整复刻这套架构。唯一的定制化部分是域名、IP 地址和 Cloudflare Token——这些已经在文中脱敏，替换为你的实际值即可。</p>

                </div>
            </div>
        </section>
    );
}