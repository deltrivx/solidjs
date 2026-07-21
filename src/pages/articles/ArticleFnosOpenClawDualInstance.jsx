import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function ArticleFnosOpenClawDualInstance() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>FnOS 双 OpenClaw 实例并存实战：商店版 + 自装版隔离、端口与 systemd 复刻</h1>
                    <p class="article-subtitle">trim.openclaw · openclaw-user · loopback 端口隔离 · config-guard · 一键 boot 交叉链 · Monitor/Gateway 双链路</p>
                    <div class="article-meta">
                        <span class="article-date">2026-07-21</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">OpenClaw</span>
                            <span class="tech-tag">双实例</span>
                            <span class="tech-tag">systemd</span>
                            <span class="tech-tag">Gateway</span>
                            <span class="tech-tag">隔离</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <blockquote>
                        <p>本文所有域名、Token、真实用户名、内网地址均已脱敏。示例中的 <code>example.com</code>、<code>192.168.x.x</code>、<code>openclaw-user</code>、<code>&lt;TOKEN&gt;</code> 请替换为你自己的环境。商店版用户名 <code>trim.openclaw</code> 是 FnOS App Center 常见约定，可按实际保留。</p>
                    </blockquote>

                    <h2>一、写在前面：本文解决什么问题</h2>
                    <p>同一台飞牛系统（FnOS）上，经常会同时需要两套 OpenClaw：</p>
                    <ul>
                        <li><strong>实例 A（商店版）</strong>：由 FnOS 应用中心管理，适合面板运维、日常主通道。</li>
                        <li><strong>实例 B（自装版）</strong>：独立目录、独立端口、独立 systemd，适合试验升级、第二通道、与商店生命周期解耦。</li>
                    </ul>
                    <p>只装一套时问题简单；两套并存时，真正会翻车的是：抢端口、root 污染权限、配置/session 串目录、代理把 loopback 拐走、Monitor 停不了自己的 unit、冷启动卷未就绪导致 209/STDOUT。</p>
                    <p>本文记录一套可复刻的双实例方案：路径、用户、端口、systemd、Monitor、代理与隔离清单。商店版「如何跑稳」的完整细节见 <A href="/article/fnos-openclaw-store-optimization">飞牛系统商店版 OpenClaw 优化实战</A>（含 <strong>6.7 一键安装开机引导</strong>）；本文以<strong>双实例共存与自装版从零落地</strong>为主，商店版只给对照与核对清单。</p>
                    <p><strong>2026-07-21 修订说明：</strong>（1）商店侧交叉链到旧文 6.7 <code>install-openclaw-gateway-boot.sh</code>，复刻实例 A 时优先一键落地 bootstrap，勿再手抄 ensure 反面教材；（2）自装实例 B 增补 <code>ensureDevModeConfig</code> 冲配置根因与防护：Monitor 在 system 模式下误写 <code>openclaw.json</code> 只剩 <code>gateway.controlUi</code> 残片 → Gateway exit 78；落地 <code>OPENCLAW_USE_SYSTEM_CONFIG=1</code> / skip 补丁、启动前 <code>config-guard</code>、NO_PROXY 精确 IP。</p>

                    <h2>二、目标架构</h2>
                    <pre>{`┌─────────────────────────────── 同一台 FnOS ───────────────────────────────┐
│                                                                           │
│  实例 A · 商店版                            实例 B · 自装版                 │
│  用户: trim.openclaw                        用户: openclaw-user             │
│  路径: /vol1/@apphome/trim.openclaw         路径: /volX/OpenClaw            │
│        /vol1/@appcenter/trim.openclaw              (示例: /vol2/1000/OpenClaw)│
│                                                                           │
│  App Center / Monitor(A)                    systemd Monitor(B)              │
│        │                                           │                      │
│        ▼                                           ▼                      │
│  Gateway :25730 (loopback)                  Gateway :11751 (loopback)       │
│  可选: trim-openclaw-gateway 兜底           openclaw-11751.service          │
│        (端口已占用则跳过)                   openclaw-11751-monitor.service  │
│                                                                           │
│  硬隔离: 数据目录不共享 · 用户不混用 · InaccessiblePaths 互挡 · 升级分通道  │
└───────────────────────────────────────────────────────────────────────────┘`}</pre>

                    <h3>2.1 对照表（复刻时先抄这张）</h3>
                    <pre>{`| 维度       | 实例 A 商店版                         | 实例 B 自装版                          |
|------------|---------------------------------------|----------------------------------------|
| 运行用户   | trim.openclaw                         | openclaw-user（示例关键词）            |
| 数据根目录 | /vol1/@apphome/trim.openclaw          | /volX/OpenClaw                         |
| 配置路径   | .../home/.openclaw/openclaw.json      | .../home/.openclaw/openclaw.json       |
| Gateway 端口 | 25730 loopback                      | 11751 loopback                         |
| 主启动方   | App Center / 商店 Monitor             | systemd unit                           |
| 兜底 unit  | trim-openclaw-gateway / bootstrap     | openclaw-11751.service                 |
| 面板后端   | 商店 Monitor (unix socket)            | openclaw-11751-monitor (如 PORT=19201) |
| 代理       | HTTP(S)_PROXY → 内网出口              | 同左，注意 NO_PROXY                    |
| 隔离       | 独立 HOME/DATA                        | InaccessiblePaths 挡商店路径           |`}</pre>

                    <h3>2.2 复刻铁律（违反即不保证可迁移）</h3>
                    <ol>
                        <li><strong>端口不共用</strong>：两套 Gateway 必须不同端口，且都 bind loopback。</li>
                        <li><strong>用户不混用</strong>：禁止用 root 长期跑安装/升级/修 session；属主必须是各自用户。</li>
                        <li><strong>目录不串挂</strong>：不把 A 的 <code>.openclaw</code> / sessions 挂给 B，反之亦然。</li>
                        <li><strong>公网不直暴 Gateway</strong>：外网入口走 Cloudflare Tunnel / Nginx 反代（见隧道相关旧文）。</li>
                        <li><strong>升级分通道</strong>：不要一条 <code>npm i -g</code> / 全局 update 同时动两边。</li>
                    </ol>

                    <h2>三、前置条件与版本基线</h2>
                    <ul>
                        <li>FnOS（或同类 Linux NAS）具备 systemd、Node 24 / Bun 可用路径（商店环境常见 <code>/var/apps/nodejs_v24</code>、<code>/var/apps/bunjs</code>）。</li>
                        <li>实例 A 建议先按旧文跑通商店版，控制面板与 Gateway 在线。</li>
                        <li>实例 B 建议固定 OpenClaw 版本（示例基线 <code>2026.7.1</code>），记录 <code>openclaw --version</code> 输出。</li>
                        <li>内网 HTTP 代理可选；若有，统一写成 <code>http://192.168.x.x:7890</code>，并配置 <code>NO_PROXY</code>。</li>
                    </ul>
                    <pre>{`# 关键词替换表（全文通用）
openclaw-user     → 你的自装运行用户
openclaw-group    → 该用户主组（示例 Users）
/volX/OpenClaw    → 自装根目录（示例 /vol2/1000/OpenClaw）
:11751 / :25730   → 可改，但两实例必须不同
192.168.x.x:7890  → 你的内网代理（没有可删代理环境变量）`}</pre>

                    <h2>四、实例 A（商店版）— 双实例视角核对清单</h2>
                    <p>商店版完整启动链、权限基线、更新按钮逻辑见旧文 <A href="/article/fnos-openclaw-store-optimization">商店版优化实战</A>。复刻实例 A 的开机引导时，优先用旧文 <strong>第六节 6.7</strong> 一键脚本 <code>install-openclaw-gateway-boot.sh</code>（root 一条命令写 unit + drop-in + bootstrap），不要再手抄旧的 <code>openclaw-ensure</code>。这里只列<strong>双实例场景下必须确认</strong>的点：</p>
                    <pre>{`# 1) 商店用户存在
id trim.openclaw

# 2) Gateway 监听 loopback:25730（端口号以你环境为准）
ss -lntH | grep 25730

# 3) 进程用户不是 root
ps -o user,pid,cmd -C openclaw-gateway 2>/dev/null || \\
  ps aux | grep -E 'openclaw.*gateway|openclaw-gatewa' | grep -v grep

# 4) 配置与数据在 apphome，不在自装目录
echo "$OPENCLAW_CONFIG_PATH"   # 期望含 @apphome/trim.openclaw
# 或从 unit / 进程环境读取`}</pre>

                    <h3>4.1 商店 Gateway 兜底：优先一键 bootstrap，端口已占用则跳过</h3>
                    <p>推荐直接跑旧文 6.7 一键脚本落地 <code>trim-openclaw-gateway.service</code> + <code>trim-openclaw-bootstrap.sh</code>（Monitor API <code>action=start</code>，端口已 LISTEN 则 exit 0）。若你手工写 unit，务必加「端口已被 App Center 占用则跳过」的条件，避免双进程抢 <code>:25730</code>：</p>
                    <pre>{`# unit 片段示意（User=trim.openclaw）
ExecCondition=/bin/bash -c "! ss -lntH sport = :25730 | grep -q LISTEN"
ExecStart=.../openclaw gateway run --port 25730 --bind loopback`}</pre>
                    <p>更稳的做法就是旧文 6.7 / 第六节现行方案：oneshot bootstrap 等商店 Monitor unix socket API ready，再 POST start；若端口已 LISTEN 则直接 exit 0。不要在 root 下直接 <code>cmd/main start</code> 拉起 Monitor，否则会污染为 root Monitor（旧文已强调）。一键脚本<strong>不会</strong>触碰 <code>openclaw-11751*</code>，与实例 B 边界安全。</p>

                    <h3>4.2 与自装版的边界</h3>
                    <ul>
                        <li>商店路径：<code>/vol1/@apphome/trim.openclaw</code>、<code>/vol1/@appcenter/trim.openclaw</code>、<code>/var/apps/trim.openclaw</code></li>
                        <li>自装 unit 应用 <code>InaccessiblePaths=</code> 指向上述路径，降低串读配置/插件的概率</li>
                        <li>两边插件、session、memory DB 各自维护</li>
                    </ul>

                    <h2>五、实例 B（自装版）— 从零复刻</h2>

                    <h3>5.1 目录树约定</h3>
                    <pre>{`/volX/OpenClaw/
├── bin/openclaw              # CLI 入口（可指向 data/node_modules 包装脚本）
├── data/                     # OPENCLAW_DATA_DIR；node_modules / workspace 等
├── home/                     # HOME；.openclaw/openclaw.json 在此
├── log/                      # gateway.log / monitor.log（启动前准备）
├── server/                   # 自建 Monitor 后端（可选）
├── web/dist/                 # Monitor 静态资源（可选）
├── runtime/                  # 运行时临时文件
└── .env                      # 可选：版本号等非密钥状态`}</pre>
                    <pre>{`# 创建用户与目录（示例）
# 若系统已有普通用户，可直接用，不必新建；关键词统一为 openclaw-user
sudo useradd -r -m -s /bin/bash openclaw-user 2>/dev/null || true
sudo mkdir -p /volX/OpenClaw/{bin,data,home,log,server,web/dist,runtime}
sudo chown -R openclaw-user:openclaw-group /volX/OpenClaw
sudo chmod 0711 /volX /volX/...   # 保证中间路径可遍历
sudo find /volX/OpenClaw -type d -exec chmod 0700 {} +`}</pre>

                    <h3>5.2 安装包与 CLI</h3>
                    <p>推荐把 OpenClaw 安装在 <code>/volX/OpenClaw/data</code> 的本地 <code>node_modules</code>，用 <code>bin/openclaw</code> 固定环境，避免全局 <code>npm i -g</code> 污染系统：</p>
                    <pre>{`sudo -u openclaw-user -H bash -lc '
  export HOME=/volX/OpenClaw/home
  export OPENCLAW_DATA_DIR=/volX/OpenClaw/data
  export OPENCLAW_CONFIG_PATH=/volX/OpenClaw/home/.openclaw/openclaw.json
  cd /volX/OpenClaw/data
  # 按你惯用方式安装固定版本 openclaw 到本地 node_modules
  # 然后写 bin/openclaw 包装，确保 PATH 含 node/bun
'
/volX/OpenClaw/bin/openclaw --version`}</pre>

                    <h3>5.3 环境变量契约</h3>
                    <pre>{`HOME=/volX/OpenClaw/home
OPENCLAW_DATA_DIR=/volX/OpenClaw/data
OPENCLAW_CONFIG_PATH=/volX/OpenClaw/home/.openclaw/openclaw.json
OPENCLAW_HIDE_BANNER=1
HTTP_PROXY=http://192.168.x.x:7890
HTTPS_PROXY=http://192.168.x.x:7890
NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1
# 必须精确 IP：Node / Python httpx 等不认 CIDR/通配/前缀；curl 认 CIDR 会掩盖问题
# 若还有 sidecar 同步脚本访问内网管理口，请额外写精确 IP`}</pre>

                    <h3>5.4 Gateway systemd unit</h3>
                    <pre>{`# /etc/systemd/system/openclaw-11751.service
[Unit]
Description=OpenClaw Gateway (Port 11751)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=openclaw-user
Group=openclaw-group
WorkingDirectory=/volX/OpenClaw/data
# 若 shebang/权限环境复杂，可用 bash 包装（见 drop-in）
ExecStart=/volX/OpenClaw/bin/openclaw gateway run --port 11751 --bind loopback
Restart=always
RestartSec=5
Environment=HOME=/volX/OpenClaw/home
Environment=OPENCLAW_DATA_DIR=/volX/OpenClaw/data
Environment=OPENCLAW_CONFIG_PATH=/volX/OpenClaw/home/.openclaw/openclaw.json
Environment=OPENCLAW_HIDE_BANNER=1
Environment=HTTP_PROXY=http://192.168.x.x:7890
Environment=HTTPS_PROXY=http://192.168.x.x:7890
Environment=NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1
StandardOutput=append:/volX/OpenClaw/log/gateway.log
StandardError=append:/volX/OpenClaw/log/gateway.log
NoNewPrivileges=true
# 关键：挡住商店版路径，降低串环境风险
InaccessiblePaths=/vol1/@apphome/trim.openclaw /vol1/@appcenter/trim.openclaw /var/apps/trim.openclaw

[Install]
WantedBy=multi-user.target`}</pre>

                    <h3>5.5 推荐 drop-in</h3>
                    <p>除权限与挂载外，建议再补两类 drop-in（2026-07 实战后强烈建议）：</p>
                    <pre>{`# /etc/systemd/system/openclaw-11751.service.d/00-requires-mounts.conf
[Unit]
RequiresMountsFor=/volX/OpenClaw /volX/OpenClaw/log

# /etc/systemd/system/openclaw-11751.service.d/01-log-prepare.conf
[Unit]
Requires=openclaw-11751-log-prepare.service
After=openclaw-11751-log-prepare.service

# /etc/systemd/system/openclaw-11751.service.d/05-permission-fix.conf
[Service]
PermissionsStartOnly=true
ExecStartPre=/usr/local/sbin/openclaw-11751-permission-fix.sh

# /etc/systemd/system/openclaw-11751.service.d/06-config-guard.conf
[Service]
# 启动前校验 openclaw.json；坏配置自动从 last-good 恢复（见 5.10）
ExecStartPre=/usr/local/sbin/openclaw-11751-config-guard.sh

# /etc/systemd/system/openclaw-11751.service.d/15-noproxy-exact.conf
[Service]
# 覆盖 base unit 里可能写的 CIDR；精确 IP only
Environment=NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1
Environment=no_proxy=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1

# /etc/systemd/system/openclaw-11751.service.d/20-exec-via-bash.conf （若 CLI 为 shell 包装）
[Service]
ExecStart=
ExecStart=/bin/bash /volX/OpenClaw/bin/openclaw gateway run --port 11751 --bind loopback`}</pre>
                    <h3>5.6 log-prepare oneshot</h3>
                    <pre>{`# /etc/systemd/system/openclaw-11751-log-prepare.service
[Unit]
Description=Prepare OpenClaw 11751 log files
RequiresMountsFor=/volX/OpenClaw
Before=openclaw-11751.service openclaw-11751-monitor.service

[Service]
Type=oneshot
ExecStart=/usr/bin/install -d -o openclaw-user -g openclaw-group -m 0700 /volX/OpenClaw/log
ExecStart=/usr/bin/touch /volX/OpenClaw/log/gateway.log /volX/OpenClaw/log/monitor.log
ExecStart=/usr/bin/chown openclaw-user:openclaw-group /volX/OpenClaw/log/gateway.log /volX/OpenClaw/log/monitor.log
ExecStart=/usr/bin/chmod 0600 /volX/OpenClaw/log/gateway.log /volX/OpenClaw/log/monitor.log
RemainAfterExit=yes`}</pre>

                    <h3>5.7 权限修复脚本（最小可用）</h3>
                    <pre>{`# /usr/local/sbin/openclaw-11751-permission-fix.sh
#!/bin/bash
set -euo pipefail
ROOT=/volX/OpenClaw
RUN_USER=openclaw-user
RUN_GROUP=openclaw-group
[ -d "$ROOT" ] || exit 0
chown -R "$RUN_USER:$RUN_GROUP" "$ROOT"
# 中间路径可遍历（按你的卷布局调整）
chmod 0711 "$(dirname "$ROOT")" 2>/dev/null || true
find "$ROOT" -type d -exec chmod 0700 {} +
find "$ROOT" -type f -exec chmod 0600 {} +
# 可执行入口
chmod 0700 "$ROOT/bin/openclaw" 2>/dev/null || true
find "$ROOT/data/node_modules/.bin" -maxdepth 1 -type l -exec chmod 0700 {} + 2>/dev/null || true`}</pre>

                    <h3>5.8 Monitor（可选但强烈建议）</h3>
                    <p>自装版若带独立控制面板后端，用第二个 unit 管理，并通过环境变量声明「系统托管 Gateway unit」：</p>
                    <pre>{`# /etc/systemd/system/openclaw-11751-monitor.service （关键字段）
[Service]
User=openclaw-user
Group=openclaw-group
WorkingDirectory=/volX/OpenClaw/server
ExecStart=/path/to/bun /volX/OpenClaw/server/index.js
Environment=HOME=/volX/OpenClaw/home
Environment=OPENCLAW_DATA_DIR=/volX/OpenClaw/data
Environment=OPENCLAW_CONFIG_PATH=/volX/OpenClaw/home/.openclaw/openclaw.json
Environment=PORT=19201
Environment=OPENCLAW_VERSION=2026.7.1
Environment=OPENCLAW_USE_SYSTEM_CONFIG=1
Environment=OPENCLAW_SYSTEM_UNIT=openclaw-11751.service
InaccessiblePaths=/vol1/@apphome/trim.openclaw /vol1/@appcenter/trim.openclaw /var/apps/trim.openclaw`}</pre>
                    <p>Monitor 侧务必同时设置（可放 unit 或 drop-in <code>20-system-managed.conf</code>）：</p>
                    <pre>{`Environment=OPENCLAW_USE_SYSTEM_CONFIG=1
Environment=OPENCLAW_SYSTEM_UNIT=openclaw-11751.service
# 同样建议精确 NO_PROXY（与 Gateway 一致）
Environment=NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1
Environment=no_proxy=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1`}</pre>
                    <p>有这两项时，Monitor 应<strong>跳过</strong> <code>ensureDevModeConfig()</code> 对完整 <code>openclaw.json</code> 的改写；否则可能在读失败时只写出 <code>gateway.controlUi</code> 残片（见 5.10）。若 Monitor 需要 stop/start Gateway，给 <code>openclaw-user</code> 做<strong>窄授权</strong>即可（polkit 或 sudoers），只允许操作 <code>openclaw-11751.service</code>，不要给 ALL：</p>
                    <pre>{`# /etc/sudoers.d/openclaw-11751-openclaw-user  （示例，visudo 语法）
openclaw-user ALL=(root) NOPASSWD: /bin/systemctl start openclaw-11751.service, \\
  /bin/systemctl stop openclaw-11751.service, \\
  /bin/systemctl restart openclaw-11751.service, \\
  /bin/systemctl status openclaw-11751.service`}</pre>

                    <h3>5.9 启用并启动</h3>
                    <pre>{`sudo systemctl daemon-reload
sudo systemctl enable openclaw-11751-log-prepare.service
sudo systemctl enable --now openclaw-11751.service
sudo systemctl enable --now openclaw-11751-monitor.service   # 若有
ss -lntH | grep -E '11751|25730'
curl -fsS http://127.0.0.1:11751/healthz || true`}</pre>

                    <h3>5.10 配置防冲：ensureDevModeConfig 坑 + config-guard（必做）</h3>
                    <p><strong>现象：</strong>自装 Gateway 突然 failed，日志：</p>
                    <pre>{`Gateway start blocked: existing config is missing gateway.mode.
Treat this as suspicious or clobbered config.`}</pre>
                    <p>进程 exit 78/CONFIG；<code>:11751</code> 无监听。此时查配置文件体积往往只剩约 <strong>300 字节</strong>，内容类似：</p>
                    <pre>{`{
  "gateway": {
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
  }
}`}</pre>
                    <p>完整配置（通常十几 KB，含 <code>gateway.mode=local</code>、<code>channels</code>、<code>agents</code>、<code>models</code>）被冲掉。商店实例 <code>:25730</code> 可仍正常——问题只在自装 Monitor 写到了实例 B 的 <code>openclaw.json</code>。</p>
                    <p><strong>根因：</strong>自建 Monitor（<code>server/index.js</code>）里的 <code>ensureDevModeConfig()</code> 在 system 模式下仍会改「系统配置」。当读配置失败/得到空对象时，旧逻辑会把只含 <code>gateway.controlUi</code> 的残片<strong>写回</strong>同一路径，覆盖完整文件。日志侧可看到：</p>
                    <pre>{`[dev-config] Updated system OpenClaw config at .../openclaw.json
# 随后 gateway 反复：
Config write audit / size-drop-vs-last-good: ~17000 -> ~298`}</pre>
                    <p><strong>防护（三层，建议全上）：</strong></p>
                    <ol>
                        <li><strong>Monitor 环境变量</strong>（见 5.8）：<code>OPENCLAW_USE_SYSTEM_CONFIG=1</code> + <code>OPENCLAW_SYSTEM_UNIT=openclaw-11751.service</code>。</li>
                        <li><strong>代码补丁</strong>（Monitor 源码 <code>ensureDevModeConfig</code>）：system-managed 时直接 skip；且仅当已有 <code>gateway.mode=local</code> 才允许改 controlUi。示意：</li>
                    </ol>
                    <pre>{`async function ensureDevModeConfig() {
  // system-managed 实例拥有完整 openclaw.json，禁止用 controlUi 残片覆盖
  if (process.env.OPENCLAW_USE_SYSTEM_CONFIG === "1" || process.env.OPENCLAW_SYSTEM_UNIT) {
    console.log("[dev-config] Skipping ensureDevModeConfig for system-managed OpenClaw");
    return;
  }
  // ... 读取 config 后：
  if (!config?.gateway || config.gateway.mode !== "local") {
    console.error("[dev-config] Refusing to patch: missing gateway.mode=local");
    return;
  }
  // 仅在已有完整 local 配置上合并 controlUi 字段
}`}</pre>
                    <p>3. <strong>启动前 config-guard</strong>（Gateway unit 的 <code>ExecStartPre</code>）：校验当前配置；坏则从 <code>openclaw.json.last-good</code>（或你自己的 bak）恢复。健康启动成功后顺便刷新 last-good。</p>
                    <pre>{`# /usr/local/sbin/openclaw-11751-config-guard.sh
#!/bin/bash
set -euo pipefail
CFG_DIR=/volX/OpenClaw/home/.openclaw
CFG="$CFG_DIR/openclaw.json"
LAST_GOOD="$CFG_DIR/openclaw.json.last-good"
# 可再列一份你信任的历史 bak
BAK="$CFG_DIR/openclaw.json.bak-known-good"
LOG=/volX/OpenClaw/log/config-guard.log
mkdir -p /volX/OpenClaw/log

ok_mode() {
  local f="$1"
  [ -f "$f" ] || return 1
  python3 - "$f" <<'PY'
import json, sys
d=json.load(open(sys.argv[1], encoding="utf-8"))
g=d.get("gateway") or {}
if g.get("mode") != "local":
  sys.exit(1)
if int(g.get("port") or 0) != 11751:  # 按你的端口改
  sys.exit(1)
if "channels" not in d or "meta" not in d:
  sys.exit(1)
sys.exit(0)
PY
}

if ok_mode "$CFG"; then
  if ! cmp -s "$CFG" "$LAST_GOOD" 2>/dev/null; then
    cp -a "$CFG" "$LAST_GOOD"
    chown openclaw-user:openclaw-group "$LAST_GOOD"
    chmod 600 "$LAST_GOOD"
  fi
  echo "$(date '+%F %T') config ok" >>"$LOG"
  exit 0
fi

echo "$(date '+%F %T') BAD config; restoring" >>"$LOG"
cp -a "$CFG" "$CFG_DIR/openclaw.json.broken-auto-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
for src in "$LAST_GOOD" "$BAK"; do
  if ok_mode "$src"; then
    cp -a "$src" "$CFG"
    chown openclaw-user:openclaw-group "$CFG"
    chmod 600 "$CFG"
    echo "$(date '+%F %T') restored from $src" >>"$LOG"
    exit 0
  fi
done
echo "$(date '+%F %T') FATAL: no valid backup" >>"$LOG"
exit 1`}</pre>
                    <pre>{`install -m 0755 openclaw-11751-config-guard.sh /usr/local/sbin/
# drop-in 见 5.5 的 06-config-guard.conf
# 建议平时保留：
#   openclaw.json.last-good
#   至少一份带时间戳的 bak（升级/改模型前手动 cp）`}</pre>
                    <p><strong>验收：</strong>Monitor 日志出现 <code>Skipping ensureDevModeConfig for system-managed...</code>；人为把配置改成残片后 <code>systemctl restart openclaw-11751</code> 应被 guard 自动救回；正常时 <code>openclaw.json</code> 体积保持完整量级，且 <code>gateway.mode=local</code>。</p>
                    <p><strong>恢复应急（无 guard 时）：</strong></p>
                    <pre>{`# 1) 停 gateway
sudo systemctl stop openclaw-11751
# 2) 从 last-good / 备份恢复
cp -a .../openclaw.json.last-good .../openclaw.json
chown openclaw-user:openclaw-group .../openclaw.json
# 3) 确认 JSON：gateway.mode=local、port=11751
# 4) 先给 Monitor 打上 skip 补丁与环境变量，再 start
sudo systemctl start openclaw-11751
curl -fsS http://127.0.0.1:11751/healthz`}</pre>

                    <h2>六、双实例共存硬隔离清单</h2>
                    <pre>{`| 检查项     | 命令/标准                                      | 通过标准                          |
|------------|------------------------------------------------|-----------------------------------|
| 双端口     | ss -lntH | grep -E '25730|11751'               | 各自 loopback LISTEN，无交叉      |
| 用户       | ps 看 gateway 进程 User                        | A=trim.openclaw；B=openclaw-user  |
| 配置路径   | 两进程 OPENCLAW_CONFIG_PATH                    | 路径不同、目录不共享              |
| 互不可见   | systemctl cat B | grep InaccessiblePaths       | 含商店版路径                      |
| 重启隔离   | systemctl restart openclaw-11751               | A 的 25730 不掉线                 |
| 代理       | 进程环境 HTTP_PROXY / NO_PROXY                 | 精确 IP；禁止 CIDR/通配           |
| 权限       | namei -l 数据目录                              | 无 root 属主污染                  |
| 配置完整   | wc -c openclaw.json；含 gateway.mode=local     | 非 ~300B controlUi 残片           |
| system 标记| Monitor 环境 OPENCLAW_USE_SYSTEM_CONFIG=1      | ensureDevModeConfig 应 skip       |
| config-guard | ExecStartPre 存在且 Result=success           | 坏配置可自动从 last-good 恢复     |`}</pre>

                    <h2>七、通道、插件与共享能力</h2>
                    <ul>
                        <li><strong>消息通道</strong>（QQBot / Telegram 等）：各实例独立 appId/token/session，禁止共享 sessions 目录。</li>
                        <li><strong>模型中转</strong>（CLIProxy / sub2api 等）：可共用同一上游，但各实例的 api-key / base URL 配置分开写；密钥不进公开备份。</li>
                        <li><strong>Embedding / memory-core</strong>：可共用本机 Ollama（见 <A href="/article/memory-embed-ollama">记忆优化实战</A>），provider 配置仍按实例写。</li>
                        <li><strong>外网入口</strong>：两套面板/健康检查都经反代或 Tunnel 暴露，Gateway 保持 loopback（见 <A href="/article/tunnel-dualstack-full-guide">双栈隧道架构</A>）。</li>
                    </ul>

                    <h2>八、另一台设备复刻步骤总览</h2>
                    <pre>{`# 1. 先落地实例 A（商店版）—— 旧文 6.7 一键 install-openclaw-gateway-boot.sh
# 2. 建 openclaw-user 与 /volX/OpenClaw 目录树，修权限
# 3. 安装固定版本 OpenClaw 到 data/，写 bin/openclaw
# 4. 初始化完整 openclaw.json（gateway.mode=local + port）；保留 last-good
# 5. 安装 log-prepare / permission-fix / config-guard / gateway unit / drop-in
# 6. enable --now Gateway；验证 :11751 healthz
# 7. Monitor：OPENCLAW_USE_SYSTEM_CONFIG=1 + OPENCLAW_SYSTEM_UNIT + ensureDevModeConfig skip 补丁
# 8. 窄 sudoers/polkit；精确 NO_PROXY
# 9. 核对 :25730 与 :11751 同时在线
# 10. 只 restart B，确认 A 不受影响；人为残片配置测 guard 恢复
# 11. 冷启动一次；打备份 manifest（不含 secrets）`}</pre>

                    <h2>九、验证矩阵</h2>
                    <pre>{`| 场景                 | 操作                              | 期望结果                    |
|----------------------|-----------------------------------|-----------------------------|
| 双在线               | ss + healthz                      | 两端口正常                  |
| 只重启 B             | systemctl restart openclaw-11751  | A 会话/端口保持             |
| 只停 A               | 商店面板停止 / 停 A 进程          | B 仍可对话                  |
| 只停 B               | systemctl stop openclaw-11751     | A 仍可对话                  |
| 冷启动               | 开机后检查 unit                   | RequiresMountsFor 后成功    |
| 升级 B               | 仅更新 /volX/OpenClaw/data        | A 版本号不变                |
| 权限污染演练         | 误用 root touch 文件后 fix 脚本   | 服务可再启动                |
| 配置残片演练         | 故意写成仅 controlUi 后 restart B | guard 从 last-good 恢复     |
| Monitor skip         | 日志含 Skipping ensureDevMode...  | 不再 Updated system config  |`}</pre>

                    <h2>十、备份与一键还原（公开可说的部分）</h2>
                    <pre>{`# 建议分两份包：store-A / selfhost-B
manifest.txt          # 路径清单、unit 列表、版本号、端口
systemd/              # *.service 与 drop-in（已脱敏）
scripts/              # permission-fix / bootstrap / auto-update
# 不要打进公开包：
#   *.env 含 token、oauth json、accounts、management secret、私钥`}</pre>
                    <p>还原顺序：目录与权限 → 放 unit → daemon-reload → log-prepare → start B → 核对 A 仍在 → 再导入密钥（手工，不进脚本仓库）。</p>

                    <h2>十一、排错清单</h2>
                    <h3>1. 抢端口 / 双 Gateway</h3>
                    <pre>{`ss -lntp | grep -E '25730|11751'
# 同一端口两个进程：先停错误启动方；商店兜底加 ExecCondition`}</pre>
                    <h3>2. root 污染 node_modules / sessions</h3>
                    <pre>{`find /volX/OpenClaw -user root | head
# 跑 permission-fix；以后所有 openclaw CLI 用：
sudo -u openclaw-user -H env HOME=... OPENCLAW_CONFIG_PATH=... openclaw ...`}</pre>
                    <h3>3. Monitor 停不了 service</h3>
                    <p>system mode 下 Monitor 以普通用户调 systemctl 会要 polkit。补窄 polkit/sudoers，只放开自己的 unit。</p>
                    <h3>4. 重启后 port not ready / 配置被改写 / exit 78</h3>
                    <p>若日志是 <code>missing gateway.mode</code> 或配置只剩 ~300B controlUi，就是 5.10 的 <code>ensureDevModeConfig</code> 冲配置。立刻从 last-good 恢复，再上 skip 补丁 + config-guard，不要反复 restart 空转。日常：等待端口时做连续多次 stable check；system mode 下禁止 Monitor 每次改完整 <code>openclaw.json</code>。</p>
                    <h3>5. 代理拐走内网管理口</h3>
                    <p><code>HTTP_PROXY</code> 存在时，访问 <code>192.168.x.x</code> 管理 API 可能 502。给<strong>精确 IP</strong>进 <code>NO_PROXY</code>/<code>no_proxy</code>（含 loopback、本机、内网 API、代理网关），禁止 CIDR/通配/前缀。curl 认 CIDR 会掩盖 Node/httpx 的 502。</p>
                    <h3>6. 开机 209/STDOUT</h3>
                    <p>日志目录所在卷未就绪。加 <code>RequiresMountsFor=</code> + log-prepare oneshot。</p>
                    <h3>7. 把 Docker 版和商店版混谈</h3>
                    <p>cwd/环境若是容器内 <code>/app</code>，说明你在 Docker 实例，不是本文的双 systemd/商店模型。路径与 unit 不可照搬。</p>

                    <h2>十二、最终效果</h2>
                    <pre>{`✅ 同一台 FnOS：商店版 :25730 + 自装版 :11751 同时 loopback 在线
✅ 用户/目录/配置/session 完全分离
✅ 重启一侧不影响另一侧
✅ 冷启动有卷就绪与日志准备
✅ 权限脚本可从 root 污染中拉回
✅ 升级分通道，可独立回滚
✅ 另一台设备可按清单复刻，而不是「凭记忆拼」
✅ 实例 A 开机引导可走旧文 6.7 一键脚本，不碰 11751
✅ 实例 B：ensureDevModeConfig skip + config-guard + last-good，防冲配置
✅ NO_PROXY 精确 IP，两边一致`}</pre>
                    <p>这套方案的关键不是「再装一个 OpenClaw」，而是把<strong>隔离契约</strong>写进 systemd 与目录规范：端口、用户、路径、InaccessiblePaths、升级通道，以及<strong>配置所有权</strong>（谁可以写 <code>openclaw.json</code>）。商店版负责「符合 App Center 范式」——优先旧文 6.7 一键 boot；自装版负责「可独立运维的第二生命线」——Monitor 不得用 controlUi 残片覆盖完整配置。两者并存时，先保证边界与配置守卫，再谈插件与通道。</p>
                    <p>推荐阅读顺序：</p>
                    <ol>
                        <li><A href="/article/fnos-openclaw-store-optimization">商店版 OpenClaw 优化实战</A>（含 6.7 一键开机引导）</li>
                        <li>本文：双实例并存、自装版复刻与配置防冲</li>
                        <li><A href="/article/memory-embed-ollama">记忆 / Embedding 本地化</A>（多实例共享 Ollama 时）</li>
                        <li><A href="/article/tunnel-dualstack-full-guide">双栈隧道统一入口</A>（外网暴露面板时）</li>
                    </ol>

                </div>
            </div>
        </section>
    );
}
