import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function ArticleFnosOpenClawStore() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>飞牛系统商店版 OpenClaw 优化实战：Monitor API 开机引导、状态修复、备份复用与更新按钮</h1>
                    <p class="article-subtitle">FnOS App Center · trim.openclaw · bootstrap 引导 · 一键安装脚本 · Gateway loopback · 权限隔离 · 一键备份恢复</p>
                    <div class="article-meta">
                        <span class="article-date">2026-07-21</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">OpenClaw</span>
                            <span class="tech-tag">systemd</span>
                            <span class="tech-tag">Bun</span>
                            <span class="tech-tag">Monitor</span>
                            <span class="tech-tag">Gateway</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、写在前面：本文解决什么问题</h2>
                    <p>飞牛系统（FnOS）商店版 OpenClaw 的运行方式与普通 Docker 部署不同。它不是直接由 root 启动一个裸进程，而是由 FnOS App Center 管理应用包，再由商店版 Monitor 启动 OpenClaw Gateway。本文记录完整的商店版优化过程：反向定位运行路径、修复开机自启、根治 root Monitor 残留、修复控制面板卡“启动中”、梳理“检查更新”按钮逻辑，并沉淀可一键还原或迁移的备份方案。</p>
                    <p><strong>2026-07-20 修订说明：</strong>早期文章使用 <code>openclaw-ensure.service</code> 在 Monitor 就绪后由 systemd 直接 <code>runuser</code> 拉起 Gateway。现行稳定方案已演进为 <code>trim-openclaw-gateway.service</code> + drop-in + <code>trim-openclaw-bootstrap.sh</code>：只等待商店 Monitor 的 unix socket API ready，再通过 <code>POST /app/trim-openclaw/api/install</code> 的 <code>action=start</code> 让 <strong>Monitor 自己</strong> 拉起 Gateway。这样生命周期完全落在 App Center 范式内，避免 ensure 与面板抢进程。旧 ensure 方案保留为第六节反面教材短节。</p>
                    <p><strong>2026-07-21 修订说明：</strong>对齐 Hermes 增强文的「从零到可跑」体验，新增第六节 <code>6.7</code> 一键安装脚本 <code>install-openclaw-gateway-boot.sh</code>：在已商店安装 <code>trim.openclaw</code> 的前提下，root 一条命令写入 base unit + drop-in + bootstrap、清理旧 ensure、enable/start 并做 30 秒自检。NO_PROXY 示范改为<strong>精确 IP 列表</strong>（勿写 CIDR/通配），避免 Node/httpx 等运行时不认网段导致内网请求被代理拐走。全量数据迁移仍走第十三节备份还原，与一键 boot 职责分离。</p>
                    <p>若同一台 FnOS 还要并行<strong>自装第二实例</strong>，见 <A href="/article/fnos-openclaw-dual-instance">FnOS 双 OpenClaw 实例并存实战</A>。本文只覆盖商店版（实例 A）。</p>
                    <p>本文所有域名、Token、真实内网地址均做脱敏。示例中的 <code>example.com</code>、<code>192.168.x.x</code>、<code>&lt;TOKEN&gt;</code> 请替换为你自己的环境。商店用户名 <code>trim.openclaw</code> 为 FnOS 常见约定，可按实际保留。</p>

                    <h2>二、目标架构</h2>
                    <p>优化后的商店版 OpenClaw 采用以下链路（2026-07 修订）：</p>

                    <pre>{`FnOS App Center / trim_app_center
  → /var/apps/trim.openclaw/cmd/main（商店生命周期）
    → bun /vol1/@appcenter/trim.openclaw/server/index.js  （Monitor）
      → Unix Socket: /vol1/@appcenter/trim.openclaw/trim.openclaw.sock
      → API: /app/trim-openclaw/api/health | /api/install
      → 由 Monitor 拉起 OpenClaw Gateway
          → 127.0.0.1:25730 / [::1]:25730  （loopback only）

systemd: trim-openclaw-gateway.service （enabled，开机 oneshot 引导）
  base unit 可能仍描述「直接 gateway run」（历史模板）
  drop-in 20-boot-order.conf 实际改写为：
    Type=oneshot
    After=network-online.target trim_app_center.service
    ExecStart=/usr/local/sbin/trim-openclaw-bootstrap.sh
  bootstrap：
    1) 等 sock 存在且 health API 成功（最多约 90s）
    2) 若 :25730 已 LISTEN → exit 0（跳过）
    3) 否则 POST install {"action":"start","instanceId":"default"}
       等待 SSE/日志中 complete + success
  成功后 unit 为 inactive (dead) 属正常（oneshot，RemainAfterExit=no）`}</pre>

                    <p>关键设计原则：</p>
                    <ul>
                        <li><strong>商店版独立用户运行</strong>：使用 <code>trim.openclaw</code>，不与 root、Docker 版或其它自装实例混用。</li>
                        <li><strong>Gateway 仅监听 loopback</strong>：默认 <code>127.0.0.1:25730</code> / <code>[::1]:25730</code>，外网入口走反代或 Tunnel。</li>
                        <li><strong>Monitor 归 FnOS App Center</strong>：禁止 systemd/root 直接 <code>cmd/main start</code> 拉起 Monitor。</li>
                        <li><strong>systemd 只做开机引导</strong>：不长期托管 Gateway 进程；通过 Monitor API <code>action=start</code> 委托启动。</li>
                        <li><strong>端口已占用则跳过</strong>：App Center 已起 Gateway 时 bootstrap 直接成功退出，避免双进程。</li>
                        <li><strong>更新前优雅停止 Gateway</strong>：避免安装包替换过程中仍占用旧文件。</li>
                        <li><strong>更新顺序</strong>：优先商店插件 → 渠道插件 → OpenClaw 基底（见第八～十节，运维检查清单）。</li>
                    </ul>

                    <h2>三、路径与运行环境定位</h2>
                    <p>在 FnOS 中，商店应用通常由 <code>/var/apps/&lt;appname&gt;</code> 暴露入口，再通过软链接指向 <code>/vol1/@appcenter</code> 与 <code>/vol1/@apphome</code>。以商店版 OpenClaw 为例：</p>

                    <pre>{`# 商店应用入口
/var/apps/trim.openclaw

# 实际程序目录（App Center 管理）
/vol1/@appcenter/trim.openclaw

# 实际数据目录（用户数据与运行态）
/vol1/@apphome/trim.openclaw/data

# OpenClaw 安装目录
/vol1/@apphome/trim.openclaw/data/openclaw

# OpenClaw HOME
/vol1/@apphome/trim.openclaw/data/home

# OpenClaw 配置文件
/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# 工作区
/vol1/@apphome/trim.openclaw/data/workspace

# 状态目录
/vol1/@apphome/trim.openclaw/data/state

# 运行目录
/vol1/@apphome/trim.openclaw/data/runtime`}</pre>

                    <p>商店版依赖 FnOS 提供的 Bun 与 Node.js：</p>

                    <pre>{`# Bun
/var/apps/bunjs/target/bin/bun
# 通常指向：/vol1/@appcenter/bunjs/bin/bun

# Node.js
/var/apps/nodejs_v24/target/bin/node
# 通常指向：/vol1/@appcenter/nodejs_v24/bin/node`}</pre>

                    <p>建议先确认版本：</p>

                    <pre>{`/var/apps/bunjs/target/bin/bun --version
/var/apps/nodejs_v24/target/bin/node --version`}</pre>

                    <p>在本次环境中，Bun 为 1.3.x，Node.js 为 v24.x。你不必强求小版本完全一致，但建议 Bun ≥ 1.3.9，Node.js 使用 FnOS 商店依赖中声明的 v24 系列。</p>

                    <h3>3.1 本次修订后的运行快照（2026-07）</h3>
                    <p>以下状态可作为排查基准线（数值已脱敏/抽象化，以你本机 <code>ss</code>/<code>ps</code>/<code>systemctl</code> 为准）：</p>

                    <pre>{`主机：FnOS
商店应用：trim.openclaw
OpenClaw 包版本（安装目录 package.json）：2026.7.x
OpenClaw Gateway：127.0.0.1:25730 / [::1]:25730
Monitor Socket：/vol1/@appcenter/trim.openclaw/trim.openclaw.sock
systemd：trim-openclaw-gateway.service
  enabled
  ActiveState=inactive / SubState=dead（oneshot 成功后正常）
  Result=success / ExecMainStatus=0
  Drop-In：trim-openclaw-gateway.service.d/20-boot-order.conf
  ExecStart（生效）：/usr/local/sbin/trim-openclaw-bootstrap.sh

Monitor:
  用户：trim.openclaw
  进程：bun /vol1/@appcenter/trim.openclaw/server/index.js

Gateway:
  用户：trim.openclaw
  工作目录：/vol1/@apphome/trim.openclaw/data/openclaw
  配置：/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json
  环境要点：HOME / OPENCLAW_DATA_DIR / OPENCLAW_CONFIG_PATH
  可选代理：HTTP(S)_PROXY=http://192.168.x.x:7890
            NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1

辅助脚本（可选）：
  /usr/local/sbin/trim-openclaw-gateway-start.sh  # 手工/排障拉 Gateway，非开机主路径
  /usr/local/sbin/openclaw-pin-heal.sh            # 本地 pin 补丁重打（若启用）`}</pre>

                    <p>注意：如果同时存在 Docker 版、cwd 为 <code>/app</code>、或其它端口的自装 Gateway（例如 <code>:11751</code>），它们<strong>不是</strong>本文的商店版。同机双实例请读 <A href="/article/fnos-openclaw-dual-instance">双实例并存实战</A>；排查商店版时务必用用户 <code>trim.openclaw</code> + 端口 <code>25730</code> 过滤。</p>

                    <h2>四、商店版主启动脚本 cmd/main</h2>
                    <p>商店版主脚本位于：</p>

                    <pre>{`/var/apps/trim.openclaw/cmd/main`}</pre>

                    <p>它的职责不是直接跑 Gateway，而是启动商店版 Monitor：</p>

                    <pre>{`#!/bin/bash

LOG_FILE="\${TRIM_PKGVAR}/info.log"
PID_FILE="\${TRIM_PKGVAR}/app.pid"

# Bun / Node.js path
export PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:$PATH

# Data directory (@apphome)
OPENCLAW_DATA_DIR="\${TRIM_PKGHOME}/data"

# Static files directory (frontend)
STATIC_DIR="\${TRIM_APPDEST}/ui"
SOCKET_PATH="\${TRIM_APPDEST}/trim.openclaw.sock"
OPENCLAW_PATCHES_DIR="\${TRIM_APPDEST}/vendor/openclaw-patches/dist"

# Custom SOUL.md shipped with this package
SOUL_MD_SRC="\${TRIM_APPDEST}/../config/prompts/SOUL.md"

# Monitor command
CMD="env OPENCLAW_DATA_DIR=\"\${OPENCLAW_DATA_DIR}\" STATIC_DIR=\"\${STATIC_DIR}\" SOUL_MD_SRC=\"\${SOUL_MD_SRC}\" MONITOR_SOCKET_PATH=\"\${SOCKET_PATH}\" MONITOR_ACCESS_MODE=\"public\" OPENCLAW_PATCHES_DIR=\"\${OPENCLAW_PATCHES_DIR}\" bun \"\${TRIM_APPDEST}/server/index.js\""

log_msg() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> \${LOG_FILE}
}

check_process() {
    local pid=$1
    if kill -0 "\${pid}" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

status() {
    if [ -f "\${PID_FILE}" ]; then
        pid=$(head -n 1 "\${PID_FILE}" | tr -d '[:space:]')
        if check_process "\${pid}"; then
            return 0
        else
            rm -f "\${PID_FILE}"
        fi
    fi
    return 1
}

start_process() {
    if status; then
        return 0
    fi

    if ! command -v bun >/dev/null 2>&1; then
        log_msg "bun command not found in PATH"
        return 1
    fi

    log_msg "Starting process ..."
    rm -f "\${SOCKET_PATH}"
    bash -c "\${CMD}" >> \${LOG_FILE} 2>&1 &
    printf "%s" "$!" > \${PID_FILE}
    return 0
}

stop_process() {
    log_msg "Stopping process ..."

    if [ -r "\${PID_FILE}" ]; then
        pid=$(head -n 1 "\${PID_FILE}" | tr -d '[:space:]')

        log_msg "pid=\${pid}"
        if ! check_process "\${pid}"; then
            rm -f "\${PID_FILE}"
            log_msg "remove pid file 1"
            return
        fi

        log_msg "send TERM signal to PID:\${pid}..."
        kill -TERM \${pid} >> \${LOG_FILE} 2>&1

        local count=0
        while check_process "\${pid}" && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
            log_msg "waiting process terminal... (\${count}s/10s)"
        done

        if check_process "\${pid}"; then
            log_msg "send KILL signal to PID:\${pid}..."
            kill -KILL "\${pid}"
            sleep 1
            rm -f "\${PID_FILE}"
        else
            log_msg "process killed... "
        fi
    fi

    rm -f "\${SOCKET_PATH}"
    return 0
}

case $1 in
start)
    start_process
    ;;
stop)
    stop_process
    ;;
status)
    if status; then
        exit 0
    else
        exit 3
    fi
    ;;
*)
    exit 1
    ;;
esac`}</pre>

                    <p>这个脚本依赖 FnOS 注入的环境变量：</p>
                    <ul>
                        <li><code>TRIM_PKGVAR</code>：应用运行状态目录，如日志与 pid 文件。</li>
                        <li><code>TRIM_PKGHOME</code>：应用 home 目录，通常映射到 <code>/vol1/@apphome/trim.openclaw</code>。</li>
                        <li><code>TRIM_APPDEST</code>：应用程序目录，通常映射到 <code>/vol1/@appcenter/trim.openclaw</code>。</li>
                    </ul>

                    <h2>五、OpenClaw CLI wrapper</h2>
                    <p>商店版还应提供一个 wrapper，用于保证 OpenClaw 以正确 HOME、配置路径和依赖目录运行：</p>

                    <pre>{`/var/apps/trim.openclaw/target/bin/openclaw`}</pre>

                    <p>建议内容如下：</p>

                    <pre>{`#!/bin/bash
set -e

export PATH="/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH"
export OPENCLAW_DATA_DIR="/vol1/@apphome/trim.openclaw/data"
export HOME="/vol1/@apphome/trim.openclaw/data/home"
export OPENCLAW_CONFIG_PATH="/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json"
export OPENCLAW_HIDE_BANNER="1"

exec "/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin/openclaw" "$@"`}</pre>

                    <p>权限建议：</p>

                    <pre>{`chown trim.openclaw:trim.openclaw /var/apps/trim.openclaw/target/bin/openclaw
chmod 770 /var/apps/trim.openclaw/target/bin/openclaw`}</pre>

                    <h2>六、systemd 开机引导：Monitor API bootstrap（现行方案）</h2>
                    <p>这一节是 2026-07 修订的核心。早期方案用 <code>openclaw-ensure.service</code> 在 Monitor 就绪后以 <code>runuser</code> <strong>直接</strong>执行 <code>openclaw gateway run</code>。现行方案改为：systemd 只负责在开机后调用 bootstrap，由<strong>已经以 trim.openclaw 运行的商店 Monitor</strong> 通过官方 install API 拉起 Gateway，进程树与面板状态一致。</p>
                    <p>unit 名：</p>
                    <pre>{`/etc/systemd/system/trim-openclaw-gateway.service
/etc/systemd/system/trim-openclaw-gateway.service.d/20-boot-order.conf
/usr/local/sbin/trim-openclaw-bootstrap.sh`}</pre>

                    <h3>6.1 为什么 base unit 和生效行为不一致</h3>
                    <p>仓库/历史模板里的 base unit 可能仍是 <code>Type=simple</code> + <code>ExecStart=... gateway run --port 25730</code>。实际生效靠 drop-in 清空并改写：</p>
                    <ul>
                        <li><code>Type=oneshot</code></li>
                        <li><code>ExecCondition=</code> 清空（bootstrap 内部自己判断端口）</li>
                        <li><code>ExecStart=/usr/local/sbin/trim-openclaw-bootstrap.sh</code></li>
                        <li><code>After=... trim_app_center.service</code></li>
                        <li><code>RemainAfterExit=no</code> → 成功后 <code>inactive (dead)</code> 是正常现象</li>
                    </ul>
                    <p>排查时务必看 <code>systemctl cat trim-openclaw-gateway.service</code> 合并视图，不要只读 base 文件。</p>

                    <h3>6.2 drop-in：20-boot-order.conf</h3>
                    <pre>{`# /etc/systemd/system/trim-openclaw-gateway.service.d/20-boot-order.conf
[Unit]
After=network-online.target trim_app_center.service
Before=

[Service]
Type=oneshot
ExecCondition=
ExecStart=
ExecStart=/usr/local/sbin/trim-openclaw-bootstrap.sh
ExecStartPost=
Restart=no
TimeoutStartSec=120
StandardOutput=journal
StandardError=journal
RemainAfterExit=no`}</pre>

                    <h3>6.3 bootstrap 脚本（推荐全文）</h3>
                    <p>脚本以 root 或 unit 配置用户执行均可；它<strong>不</strong>直接 fork Gateway，只通过 unix socket 调 Monitor API。sock 文件可能在异常重启后残留，因此必须用 health 探测，不能只判断 <code>-S socket</code>。</p>
                    <pre>{`#!/bin/sh
set -eu

socket=/vol1/@appcenter/trim.openclaw/trim.openclaw.sock
health_url=http://localhost/app/trim-openclaw/api/health
start_url=http://localhost/app/trim-openclaw/api/install

# 残留 socket inode 不等于 Monitor 已就绪
monitor_ready=0
for _ in $(seq 1 90); do
  if [ -S "$socket" ] && timeout 3 curl --unix-socket "$socket" -fsS "$health_url" >/dev/null 2>&1; then
    monitor_ready=1
    break
  fi
  sleep 1
done

if [ "$monitor_ready" -ne 1 ]; then
  echo "OpenClaw store monitor API did not become ready within 90 seconds" >&2
  exit 1
fi

if ss -lntH sport = :25730 | grep -q LISTEN; then
  echo "OpenClaw store gateway already listens on 25730; bootstrap skipped"
  exit 0
fi

result=$(mktemp /vol1/@apphome/trim.openclaw/data/runtime/trim-openclaw-bootstrap.XXXXXX)
trap 'rm -f "$result"' EXIT HUP INT TERM

if ! timeout 90 curl --unix-socket "$socket" -fsS -N \\
  -X POST -H "Content-Type: application/json" \\
  --data-binary '{"action":"start","instanceId":"default"}' \\
  "$start_url" | tee "$result"; then
  echo "OpenClaw store monitor start request failed" >&2
  exit 1
fi

if grep -q '"event":"complete"' "$result" && grep -q '"success":true' "$result"; then
  echo "OpenClaw store gateway bootstrap completed"
  exit 0
fi

if grep -q '"event":"error"' "$result"; then
  echo "OpenClaw store monitor reported a startup error" >&2
else
  echo "OpenClaw store monitor returned no successful completion event" >&2
fi
exit 1`}</pre>
                    <pre>{`install -m 0755 trim-openclaw-bootstrap.sh /usr/local/sbin/trim-openclaw-bootstrap.sh
mkdir -p /etc/systemd/system/trim-openclaw-gateway.service.d
# 放置 base unit + 20-boot-order.conf 后：
systemctl daemon-reload
systemctl enable trim-openclaw-gateway.service
# 冷启动验证：reboot 后
systemctl status trim-openclaw-gateway.service --no-pager
# 期望：inactive (dead) 且 Result=success；:25730 LISTEN；Monitor 为 trim.openclaw`}</pre>

                    <h3>6.4 base unit 模板（供 drop-in 覆盖）</h3>
                    <p>即使生效路径是 bootstrap，仍建议保留一份描述环境变量的 base unit，便于手工对照与权限约束（User/Group/NoNewPrivileges/代理等）。示意：</p>
                    <pre>{`# /etc/systemd/system/trim-openclaw-gateway.service
[Unit]
Description=Bootstrap Trim OpenClaw Gateway Once at Boot
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=trim.openclaw
Group=trim.openclaw
WorkingDirectory=/vol1/@apphome/trim.openclaw/data/openclaw
Environment=HOME=/vol1/@apphome/trim.openclaw/data/home
Environment=OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data
Environment=OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json
Environment=OPENCLAW_HIDE_BANNER=1
Environment=PATH=/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
# 可选代理（无代理则删除）
Environment=HTTP_PROXY=http://192.168.x.x:7890
Environment=HTTPS_PROXY=http://192.168.x.x:7890
Environment=NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1
# 下列 ExecStart 会被 drop-in 清空；仅作「无 drop-in 时」的兜底语义
ExecCondition=/bin/bash -c "! ss -lntH sport = :25730 | grep -q LISTEN"
ExecStart=/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin/openclaw gateway run --port 25730 --bind loopback
Restart=no
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target`}</pre>
                    <p>装好 drop-in 后，真正执行的永远是 bootstrap。不要在没有 drop-in 的情况下把 base unit 当长期 Gateway supervisor——商店版 Gateway 应由 Monitor 托管。</p>

                    <h3>6.5 可选：手工 gateway-start 脚本</h3>
                    <p>另有 <code>/usr/local/sbin/trim-openclaw-gateway-start.sh</code> 一类脚本，用于排障时在正确环境变量下启动/接管 Gateway（处理端口占用、App Center 子进程等）。它<strong>不是</strong>开机主路径；开机请走 bootstrap → Monitor API。</p>

                    <h3>6.6 历史方案：openclaw-ensure（反面教材，勿再照抄）</h3>
                    <p>旧文曾给出 <code>openclaw-ensure.service</code> + <code>openclaw-ensure.sh</code>：等待 Monitor 后 <code>runuser -u trim.openclaw -- openclaw gateway run ...</code>。问题与演进：</p>
                    <ul>
                        <li>Gateway 脱离 Monitor 进程树，面板状态/优雅停止可能不一致。</li>
                        <li>若 ensure 误调 <code>cmd/main start</code>，会以 root 起第二套 Monitor，造成权限污染与双 socket。</li>
                        <li>现行环境通常已删除 ensure unit/脚本；若仍存在，应迁移到 bootstrap 并 disable ensure。</li>
                    </ul>
                    <p>判断踩坑：</p>
                    <pre>{`ps -eo user,pid,cmd | grep -E 'server/index.js|openclaw-gateway|openclaw gateway' | grep -v grep
# 错误：出现 root 用户的 Monitor 或双 Monitor
# 正确：Monitor 与 Gateway 均为 trim.openclaw；仅一个 :25730`}</pre>

                    <h3>6.7 从零到可跑：一键安装脚本（其它主机直接复刻）</h3>
                    <p>第六节前面是「分步理解 + 手工落地」。若你只想在<strong>已商店安装 trim.openclaw</strong> 的 FnOS 上，把开机引导一次写齐，可用下面脚本（对齐 Hermes 文第六节体验）。</p>
                    <p>脚本会：检查商店用户与路径 → 备份并禁用旧 <code>openclaw-ensure*</code>（若有）→ 写入 base unit + <code>20-boot-order.conf</code> + <code>trim-openclaw-bootstrap.sh</code> → <code>daemon-reload</code> / enable / start 一次 → 最小验收。它<strong>不</strong>代替商店安装，<strong>不</strong>写入 sessions/token/完整 <code>openclaw.json</code>（那是第十三节全量备份还原的事），也<strong>不</strong>触碰自装实例 <code>openclaw-11751*</code>。</p>
                    <p><strong>执行前请改顶部变量：</strong></p>
                    <ol>
                        <li><code>APP_CENTER</code> / <code>APP_HOME</code>：卷名与商店路径不同时改这里。</li>
                        <li><code>GW_PORT</code>：默认 <code>25730</code>。</li>
                        <li><code>HTTP_PROXY_DEFAULT</code> / <code>HTTPS_PROXY_DEFAULT</code>：无代理写成空字符串 <code>""</code>。</li>
                        <li><code>NO_PROXY_DEFAULT</code>：写成<strong>精确 IP</strong>，禁止 CIDR/通配。</li>
                    </ol>
                    <pre>{`#!/bin/bash
# install-openclaw-gateway-boot.sh
# FnOS 商店版 OpenClaw 开机 bootstrap 一键落地
# 要求：已在 App Center 安装 trim.openclaw；以 root 运行
set -euo pipefail

# ========== 按环境修改 ==========
APP_CENTER=/vol1/@appcenter/trim.openclaw
APP_HOME=/vol1/@apphome/trim.openclaw
GW_PORT=25730
# 无代理：两行写成 ""
HTTP_PROXY_DEFAULT="http://192.168.x.x:7890"
HTTPS_PROXY_DEFAULT="http://192.168.x.x:7890"
# 精确 IP，勿用 CIDR/通配
NO_PROXY_DEFAULT="localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1"
# ========== 一般不用改 ==========
SOCK=\${APP_CENTER}/trim.openclaw.sock
DATA=\${APP_HOME}/data
HOME_DIR=\${DATA}/home
OPENCLAW_DIR=\${DATA}/openclaw
RUNTIME_DIR=\${DATA}/runtime
UNIT=/etc/systemd/system/trim-openclaw-gateway.service
DROPIN_DIR=/etc/systemd/system/trim-openclaw-gateway.service.d
DROPIN=\${DROPIN_DIR}/20-boot-order.conf
BOOTSTRAP=/usr/local/sbin/trim-openclaw-bootstrap.sh
BACKUP_DIR=/root/backup/openclaw-boot-\$(date +%Y%m%d-%H%M%S)

die() { echo "ERROR: \$*" >&2; exit 1; }
need() { command -v "\$1" >/dev/null 2>&1 || die "缺少命令: \$1"; }

[ "\$(id -u)" -eq 0 ] || die "请用 root 执行"
need ss; need curl; need systemctl; need install; need timeout

id trim.openclaw >/dev/null 2>&1 || die "用户 trim.openclaw 不存在（请先商店安装 OpenClaw）"
[ -d "\${APP_CENTER}" ] || die "APP_CENTER 不存在: \${APP_CENTER}"
[ -d "\${APP_HOME}" ] || die "APP_HOME 不存在: \${APP_HOME}"
[ -d "\${OPENCLAW_DIR}" ] || die "OPENCLAW_DIR 不存在: \${OPENCLAW_DIR}（商店安装可能未完成）"
[ -x /var/apps/bunjs/target/bin/bun ] || die "找不到 bun（/var/apps/bunjs/target/bin/bun）"

echo "==> 1) 备份并禁用冲突 ensure unit（不碰 openclaw-11751*）"
mkdir -p "\${BACKUP_DIR}"
for u in openclaw-ensure openclaw-gateway-ensure; do
  systemctl disable --now "\${u}.service" 2>/dev/null || true
done
for f in \\
  /etc/systemd/system/openclaw-ensure.service \\
  /etc/systemd/system/openclaw-gateway-ensure.service \\
  /usr/local/sbin/openclaw-ensure.sh \\
  /usr/local/bin/openclaw-ensure.sh
do
  [ -e "\$f" ] && mv "\$f" "\${BACKUP_DIR}/" || true
done
[ -d /etc/systemd/system/openclaw-ensure.service.d ] \\
  && mv /etc/systemd/system/openclaw-ensure.service.d "\${BACKUP_DIR}/" || true
for f in "\${UNIT}" "\${DROPIN}" "\${BOOTSTRAP}"; do
  [ -e "\$f" ] && cp -a "\$f" "\${BACKUP_DIR}/" || true
done

echo "==> 2) 准备 runtime 目录（bootstrap mktemp 用）"
install -d -o trim.openclaw -g trim.openclaw -m 0750 "\${RUNTIME_DIR}"

echo "==> 3) 写入 base unit: \${UNIT}"
install -d -m 755 /etc/systemd/system
cat > "\${UNIT}" <<EOF
[Unit]
Description=Bootstrap Trim OpenClaw Gateway Once at Boot
Documentation=man:systemd.service(5)
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=trim.openclaw
Group=trim.openclaw
WorkingDirectory=\${OPENCLAW_DIR}

Environment=HOME=\${HOME_DIR}
Environment=OPENCLAW_DATA_DIR=\${DATA}
Environment=OPENCLAW_CONFIG_PATH=\${HOME_DIR}/.openclaw/openclaw.json
Environment=OPENCLAW_HIDE_BANNER=1
Environment=PATH=\${OPENCLAW_DIR}/node_modules/.bin:/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=HTTP_PROXY=\${HTTP_PROXY_DEFAULT}
Environment=HTTPS_PROXY=\${HTTPS_PROXY_DEFAULT}
Environment=http_proxy=\${HTTP_PROXY_DEFAULT}
Environment=https_proxy=\${HTTPS_PROXY_DEFAULT}
Environment=NO_PROXY=\${NO_PROXY_DEFAULT}
Environment=no_proxy=\${NO_PROXY_DEFAULT}

# 无 drop-in 时的兜底语义；装好 drop-in 后会被清空，真正执行 bootstrap
ExecCondition=/bin/bash -c "! ss -lntH sport = :\${GW_PORT} | grep -q LISTEN"
ExecStart=\${OPENCLAW_DIR}/node_modules/.bin/openclaw gateway run --port \${GW_PORT} --bind loopback
Restart=no
KillMode=process
TimeoutStartSec=75
TimeoutStopSec=20
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

echo "==> 4) 写入 drop-in: \${DROPIN}"
install -d -m 755 "\${DROPIN_DIR}"
cat > "\${DROPIN}" <<EOF
[Unit]
After=network-online.target trim_app_center.service
Before=

[Service]
Type=oneshot
ExecCondition=
ExecStart=
ExecStart=\${BOOTSTRAP}
ExecStartPost=
Restart=no
TimeoutStartSec=120
StandardOutput=journal
StandardError=journal
RemainAfterExit=no
EOF

echo "==> 5) 写入 bootstrap: \${BOOTSTRAP}"
# 引号 heredoc 避免安装时展开 $(seq)/$(mktemp)；再用 sed 注入路径/端口
cat > "\${BOOTSTRAP}" <<'EOS'
#!/bin/sh
set -eu

socket=__SOCK__
health_url=http://localhost/app/trim-openclaw/api/health
start_url=http://localhost/app/trim-openclaw/api/install
gw_port=__GW_PORT__
runtime_dir=__RUNTIME_DIR__

# 残留 socket inode 不等于 Monitor 已就绪
monitor_ready=0
for _ in $(seq 1 90); do
  if [ -S "$socket" ] && timeout 3 curl --unix-socket "$socket" -fsS "$health_url" >/dev/null 2>&1; then
    monitor_ready=1
    break
  fi
  sleep 1
done

if [ "$monitor_ready" -ne 1 ]; then
  echo "OpenClaw store monitor API did not become ready within 90 seconds" >&2
  exit 1
fi

if ss -lntH sport = :$gw_port | grep -q LISTEN; then
  echo "OpenClaw store gateway already listens on $gw_port; bootstrap skipped"
  exit 0
fi

result=$(mktemp "$runtime_dir/trim-openclaw-bootstrap.XXXXXX")
trap 'rm -f "$result"' EXIT HUP INT TERM

if ! timeout 90 curl --unix-socket "$socket" -fsS -N \\
  -X POST -H "Content-Type: application/json" \\
  --data-binary '{"action":"start","instanceId":"default"}' \\
  "$start_url" | tee "$result"; then
  echo "OpenClaw store monitor start request failed" >&2
  exit 1
fi

if grep -q '"event":"complete"' "$result" && grep -q '"success":true' "$result"; then
  echo "OpenClaw store gateway bootstrap completed"
  exit 0
fi

if grep -q '"event":"error"' "$result"; then
  echo "OpenClaw store monitor reported a startup error" >&2
else
  echo "OpenClaw store monitor returned no successful completion event" >&2
fi
exit 1
EOS

sed -i \\
  -e "s|__SOCK__|\${SOCK}|g" \\
  -e "s|__GW_PORT__|\${GW_PORT}|g" \\
  -e "s|__RUNTIME_DIR__|\${RUNTIME_DIR}|g" \\
  "\${BOOTSTRAP}"
chmod 755 "\${BOOTSTRAP}"

echo "==> 6) enable + start 一次"
systemctl daemon-reload
systemctl enable trim-openclaw-gateway.service
systemctl start trim-openclaw-gateway.service || true

echo "==> 7) 30 秒自检"
sleep 2
echo -n "unit enabled: "; systemctl is-enabled trim-openclaw-gateway.service || true
echo -n "unit active:  "; systemctl is-active trim-openclaw-gateway.service || true
systemctl show -p Result -p ExecMainStatus trim-openclaw-gateway.service --no-pager || true
if ss -lntH "sport = :\${GW_PORT}" | grep -q LISTEN; then
  echo "OK: gateway listens on :\${GW_PORT}"
else
  echo "WARN: :\${GW_PORT} 未监听；若 Monitor 未起，请先开商店面板或查 journalctl -u trim-openclaw-gateway"
fi
if [ -S "\${SOCK}" ] && timeout 3 curl --unix-socket "\${SOCK}" -fsS http://localhost/app/trim-openclaw/api/health >/dev/null 2>&1; then
  echo "OK: monitor health via unix socket"
else
  echo "WARN: monitor health 未通（sock=\${SOCK}）"
fi
ps -eo user,pid,cmd | grep -E 'server/index.js|openclaw-gatewa|openclaw gateway' | grep -v grep || true
echo "备份目录: \${BACKUP_DIR}"
echo "完成。期望：Gateway=trim.openclaw @ 127.0.0.1:\${GW_PORT}；bootstrap unit 可为 inactive(dead)+Result=success；无 root Monitor。"`}</pre>

                    <h4>6.7.1 一键安装后的 30 秒自检</h4>
                    <pre>{`systemctl is-enabled trim-openclaw-gateway.service   # enabled
systemctl is-active  trim-openclaw-gateway.service   # inactive (dead) 亦可
systemctl show -p Result -p ExecMainStatus trim-openclaw-gateway.service
ss -lntH | grep 25730
curl --unix-socket /vol1/@appcenter/trim.openclaw/trim.openclaw.sock -fsS \\
  http://localhost/app/trim-openclaw/api/health
ps -eo user,pid,cmd | grep -E 'trim.openclaw|server/index.js|openclaw-gatewa' | grep -v grep
# 正确：Monitor 与 Gateway 均为 trim.openclaw；仅一个 :25730
# 错误：出现 root 用户的 Monitor`}</pre>

                    <h4>6.7.2 卸载 / 回滚（只卸开机引导，不卸商店）</h4>
                    <pre>{`systemctl disable --now trim-openclaw-gateway.service 2>/dev/null || true
rm -f /etc/systemd/system/trim-openclaw-gateway.service
rm -rf /etc/systemd/system/trim-openclaw-gateway.service.d
rm -f /usr/local/sbin/trim-openclaw-bootstrap.sh
systemctl daemon-reload
# 商店 App / 数据目录保留；Gateway 仍可由面板手动 start
# 若有 6.7 脚本生成的备份：/root/backup/openclaw-boot-YYYYMMDD-HHMMSS/`}</pre>
                    <p>装完后若只关心「冷启动自动有 Gateway」，到此即可。全量会话/配置迁移请继续用第十三节备份还原脚本。自装第二实例请看 <A href="/article/fnos-openclaw-dual-instance">双实例文</A>，不要用本脚本去管 <code>:11751</code>。</p>

                    <h2>七、权限统一：复刻成功的关键</h2>
                    <p><strong>这是整套方案最容易踩坑、也最必须强调的部分：</strong>商店版 OpenClaw 的运行用户不是 root，而是 FnOS 为商店应用创建的独立用户 <code>trim.openclaw</code>。如果用 root 运行过安装、更新或修复命令，很容易把 <code>node_modules</code>、<code>.openclaw</code>、<code>sessions</code>、<code>runtime</code> 等目录污染成 root 属主，最终导致商店版进程读写失败、更新失败、会话不可写，或者出现“root 版能跑、商店版不能跑”的混乱状态。</p>

                    <p>复刻环境时应坚持一条铁律：</p>

                    <pre>{`商店版 OpenClaw 的数据目录、配置目录、安装目录、运行目录、workspace，统一归 trim.openclaw:trim.openclaw。
root 只负责 systemd、FnOS 应用脚本、必要的文件修复；不要让 root 成为 OpenClaw 运行态文件的属主。`}</pre>

                    <h3>7.1 先确认商店用户存在</h3>
                    <p>另一台设备上，<code>trim.openclaw</code> 用户通常由 FnOS App Center 安装商店包时自动创建。不要优先手工创建用户；如果用户不存在，优先重新安装或修复商店包。</p>

                    <pre>{`id trim.openclaw
getent passwd trim.openclaw
getent group trim.openclaw`}</pre>

                    <p>预期结果类似：</p>

                    <pre>{`uid=xxx(trim.openclaw) gid=xxx(trim.openclaw) groups=...,AppUsers,OfficialAppUsers,trim.openclaw`}</pre>

                    <h3>7.2 统一属主范围</h3>
                    <p>需要统一归属的核心目录：</p>

                    <pre>{`/vol1/@apphome/trim.openclaw/data
/vol1/@apphome/trim.openclaw/data/openclaw
/vol1/@apphome/trim.openclaw/data/openclaw/node_modules
/vol1/@apphome/trim.openclaw/data/home
/vol1/@apphome/trim.openclaw/data/home/.openclaw
/vol1/@apphome/trim.openclaw/data/runtime
/vol1/@apphome/trim.openclaw/data/state
/vol1/@apphome/trim.openclaw/data/workspace
/vol1/@apphome/trim.openclaw/data/monitor`}</pre>

                    <p>检查命令：</p>

                    <pre>{`find /vol1/@apphome/trim.openclaw/data \
  -maxdepth 4 \
  \( ! -user trim.openclaw -o ! -group trim.openclaw \) \
  -printf '%u:%g %m %p\n' | head -n 100`}</pre>

                    <p>如果有输出，说明存在 root 或其他用户污染。修复：</p>

                    <pre>{`chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod -R u+rwX,g+rX,o-rwx /vol1/@apphome/trim.openclaw/data`}</pre>

                    <h3>7.3 推荐权限基线</h3>
                    <p>为了既能让商店版运行，又避免过度开放权限，推荐基线如下：</p>

                    <pre>{`# 数据根目录：商店用户可读写，组可读进，其他用户不可访问
chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod 750 /vol1/@apphome/trim.openclaw/data
chmod 750 /vol1/@apphome/trim.openclaw/data/openclaw
chmod 750 /vol1/@apphome/trim.openclaw/data/home
chmod 700 /vol1/@apphome/trim.openclaw/data/home/.openclaw
chmod 750 /vol1/@apphome/trim.openclaw/data/runtime
chmod 750 /vol1/@apphome/trim.openclaw/data/state
chmod 750 /vol1/@apphome/trim.openclaw/data/workspace

# 配置文件：含模型、渠道、Gateway 等配置，禁止其他用户读取
chmod 640 /vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# CLI wrapper：由商店用户执行
chown trim.openclaw:trim.openclaw /var/apps/trim.openclaw/target/bin/openclaw
chmod 770 /var/apps/trim.openclaw/target/bin/openclaw`}</pre>

                    <h3>7.4 所有 OpenClaw CLI 操作都应以商店用户执行</h3>
                    <p>需要查看版本、安装插件、执行诊断时，不要直接 root 执行 <code>openclaw</code>。正确方式是用 <code>runuser</code> 切到 <code>trim.openclaw</code>，并显式带上商店版 HOME 与配置路径：</p>

                    <pre>{`runuser -u trim.openclaw -- env \
  HOME=/vol1/@apphome/trim.openclaw/data/home \
  OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data \
  OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json \
  PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH \
  /var/apps/trim.openclaw/target/bin/openclaw --version`}</pre>

                    <p>插件安装也同理：</p>

                    <pre>{`runuser -u trim.openclaw -- env \
  HOME=/vol1/@apphome/trim.openclaw/data/home \
  OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data \
  OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json \
  PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH \
  /var/apps/trim.openclaw/target/bin/openclaw plugins install @openclaw/qqbot@latest --force`}</pre>

                    <h3>7.5 验证进程绝不能跑成 root</h3>
                    <p>Gateway 进程应满足：</p>

                    <pre>{`# 进程用户应为 trim.openclaw
ps -eo pid,ppid,user,group,cwd,cmd | grep -E 'trim.openclaw|server/index.js|openclaw' | grep -v grep

# 端口应只监听 loopback 的商店版端口
ss -ltnp | grep 25730

# 当前工作目录应是商店版安装目录
readlink -f /proc/<GATEWAY_PID>/cwd
# 预期：/vol1/@apphome/trim.openclaw/data/openclaw`}</pre>

                    <p>如果看到 <code>root</code> 用户运行的 <code>openclaw</code>，或者 cwd 是 <code>/app</code>、端口是其他值，那通常不是商店版，排查时必须排除，避免将 Docker 版或手工版误认为商店版。</p>

                    <h2>八、控制面板“检查更新”按钮的真实逻辑</h2>
                    <p><em>说明：以下流程与路径来自商店 Monitor 后端常见实现，不同商店包小版本可能略有差异。落地前请在本机反查 <code>/vol1/@appcenter/trim.openclaw/server</code> 与 UI bundle。本节与第九、十节偏「运维检查清单 / 可选补丁」，不必强行改闭源商店包源码。</em></p>

                    <p>商店版控制面板前端按钮位于 UI bundle 中，点击“检查更新”后并不是只检查版本，而是弹出确认框，确认后调用后端安装接口：</p>

                    <pre>{`POST /app/trim-openclaw/api/install
Content-Type: application/json

{
  "method": "bun",
  "action": "update"
}`}</pre>

                    <p>前端会切换到运行日志页面，通过 SSE 持续接收后端日志。后端入口在：</p>

                    <pre>{`/vol1/@appcenter/trim.openclaw/server/index.js`}</pre>

                    <p>更新目标由以下常量决定：</p>

                    <pre>{`const OPENCLAW_NPM_REGISTRY =
  process.env.OPENCLAW_NPM_REGISTRY || "https://registry.npmmirror.com/";

const OPENCLAW_VERSION =
  process.env.OPENCLAW_VERSION || "2026.7.1";  // 以本机环境变量/商店包为准

const OPENCLAW_PACKAGE_SPEC =
  \`openclaw@\${OPENCLAW_VERSION}\`;

const OPENCLAW_UPDATE_PACKAGE_SPEC =
  process.env.OPENCLAW_UPDATE_PACKAGE_SPEC || "openclaw@latest";`}</pre>

                    <p>当 <code>action === "update"</code> 时，实际目标是：</p>

                    <pre>{`openclaw@latest`}</pre>

                    <p>核心更新流程：</p>

                    <pre>{`确认更新
  → POST /api/install action=update
  → gracefulStopGateway()
  → 准备 Bun / npm registry / cache 环境
  → ensureInstanceDirectories()
  → ensureManagedInstallPackageJson()
  → bun add --cwd <installDir> --registry <registry> openclaw@latest
  → refreshOpenClawVersionMetadata()
  → deploySoulMd()
  → startOpenclaw()
  → refreshChannelPlugins()
  → refreshModelsCatalogSnapshot()
  → SSE complete`}</pre>

                    <p>在本文路径中，等价命令为：</p>

                    <pre>{`/var/apps/bunjs/target/bin/bun add \
  --cwd /vol1/@apphome/trim.openclaw/data/openclaw \
  --registry https://registry.npmmirror.com/ \
  openclaw@latest`}</pre>

                    <h2>九、优化一：更新前检查 FnOS 商店插件版本</h2>
                    <p>如果商店包 <code>trim.openclaw</code> 自身已有新版，而用户直接在 OpenClaw 控制面板里升级 npm 包，可能出现“基底已经升级，但商店 Monitor/UI/脚本仍是旧版”的错配。因此可在 OpenClaw 升级前先检查 FnOS App Center 数据库。</p>

                    <p>新增脚本：</p>

                    <pre>{`/vol1/@apphome/trim.openclaw/data/openclaw/scripts/check-store-plugin-update.sh`}</pre>

                    <p>示例代码如下。不同 FnOS 版本的 PostgreSQL 连接方式可能不同，需按实际 appcenter 数据库配置调整。</p>

                    <pre>{`#!/usr/bin/env bash
set -euo pipefail

APP_NAME="trim.openclaw"
PSQL_BIN="\${PSQL_BIN:-/usr/bin/psql}"
DB_NAME="\${DB_NAME:-appcenter}"

log() {
  printf '%s\n' "$*"
}

if ! command -v "\${PSQL_BIN}" >/dev/null 2>&1; then
  log "未找到 psql，跳过 FnOS 商店插件更新检查"
  exit 0
fi

SQL="
SELECT
  COALESCE(installed.version, '') AS installed_version,
  COALESCE(candidate.version, '') AS candidate_version
FROM
  (SELECT version FROM app_package WHERE app_name = '\${APP_NAME}' AND installed = true ORDER BY id DESC LIMIT 1) installed
FULL JOIN
  (SELECT version FROM app_package WHERE app_name = '\${APP_NAME}' AND installed = false ORDER BY id DESC LIMIT 1) candidate
ON true;
"

RESULT=$("\${PSQL_BIN}" -d "\${DB_NAME}" -Atc "\${SQL}" 2>/dev/null || true)

if [ -z "\${RESULT}" ]; then
  log "未查询到 \${APP_NAME} 的商店更新信息，继续 OpenClaw 更新流程"
  exit 0
fi

INSTALLED=$(printf '%s' "\${RESULT}" | awk -F '|' '{print $1}')
CANDIDATE=$(printf '%s' "\${RESULT}" | awk -F '|' '{print $2}')

if [ -n "\${CANDIDATE}" ] && [ "\${CANDIDATE}" != "\${INSTALLED}" ]; then
  log "发现飞牛商店插件新版本: \${INSTALLED:-unknown} → \${CANDIDATE}"
  log "请先在 FnOS App Center 中更新『飞牛 OpenClaw』插件，再回到控制面板升级 OpenClaw。"
  exit 2
fi

log "飞牛商店插件已是最新版本，无需先更新商店包"
exit 0`}</pre>

                    <p>接入后端更新流程时，建议只在 <code>action === "update"</code> 时执行：</p>

                    <pre>{`if (action === "update") {
  enqueue("检查 FnOS 商店插件是否有更新...");
  const check = Bun.spawnSync({
    cmd: ["bash", instance.installDir + "/scripts/check-store-plugin-update.sh"],
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });

  const output = new TextDecoder().decode(check.stdout || new Uint8Array()).trim();
  if (output) enqueue(output);

  if (check.exitCode === 2) {
    throw new Error("检测到 FnOS 商店插件有新版本，请先更新商店插件");
  }
}`}</pre>

                    <h2>十、优化二：OpenClaw 基底更新前先更新渠道插件</h2>
                    <p>OpenClaw 升级后，渠道插件可能因 SDK 或 API 变化而不兼容。尤其是 QQBot 这类插件，建议在升级 OpenClaw 基底前先更新到最新版本。</p>

                    <p>后端可加入：</p>

                    <pre>{`const channelPkgs = ["@openclaw/qqbot@latest"];

if (action === "update") {
  for (const pkg of channelPkgs) {
    enqueue("升级渠道插件 " + pkg + " ...");
    const pluginResult = Bun.spawnSync({
      cmd: [
        bunPath,
        "add",
        "--cwd",
        instance.installDir,
        "--registry",
        registry,
        pkg,
      ],
      stdout: "pipe",
      stderr: "pipe",
      env: installEnv,
    });

    const stdout = new TextDecoder().decode(pluginResult.stdout || new Uint8Array()).trim();
    const stderr = new TextDecoder().decode(pluginResult.stderr || new Uint8Array()).trim();
    if (stdout) enqueue(stdout);
    if (stderr) enqueue(stderr);

    if (pluginResult.exitCode !== 0) {
      throw new Error("渠道插件 " + pkg + " 更新失败");
    }
  }
}`}</pre>

                    <p>这样完整顺序变为：</p>

                    <pre>{`点击“检查更新”
  → 确认弹窗
  → 停止 Gateway
  → Step 1：检测 FnOS 商店插件更新
  → Step 2：bun add @openclaw/qqbot@latest
  → Step 3：bun add openclaw@latest
  → 刷新渠道插件列表
  → 刷新模型目录快照
  → 启动 Gateway`}</pre>

                    <h2>十一、Gateway 启停与配置写入</h2>
                    <p>更新前应优雅停止 Gateway：</p>

                    <pre>{`gracefulStopGateway(instance, enqueue, action)`}</pre>

                    <p>建议逻辑：</p>

                    <pre>{`1. 读取当前 Gateway 端口
2. 查找监听端口 PID 与 pid 文件 PID
3. 校验 PID 是否确为 OpenClaw 进程
4. 发送 SIGTERM
5. 最多等待 15 秒
6. 若未退出，发送 SIGKILL
7. 清理 pid 文件
8. 标记 stopped`}</pre>

                    <p>更新后启动（优先走 Monitor，与 bootstrap 一致）：</p>

                    <pre>{`# 推荐：让商店 Monitor 拉起（与面板一致）
curl --unix-socket /vol1/@appcenter/trim.openclaw/trim.openclaw.sock \
  -fsS -N -X POST -H "Content-Type: application/json" \
  --data-binary '{"action":"start","instanceId":"default"}' \
  http://localhost/app/trim-openclaw/api/install

# 排障备用：仅在 Monitor 异常时，以 trim.openclaw 手工
# openclaw gateway run --port 25730 --bind loopback`}</pre>

                    <p>配置建议写入：</p>

                    <pre>{`gateway.mode = "local"
gateway.port = 25730
gateway.bind = "loopback"
gateway.trustedProxies = ["127.0.0.1", "::1"]
gateway.controlUi.enabled = true
gateway.controlUi.basePath = "/app/trim-openclaw"
gateway.controlUi.allowInsecureAuth = true
gateway.controlUi.dangerouslyDisableDeviceAuth = true
gateway.controlUi.allowedOrigins = ["*"]
agents.defaults.workspace = "/vol1/@apphome/trim.openclaw/data/workspace"
update.checkOnStart = false
cli.banner.taglineMode = "off"`}</pre>

                    <p><strong>安全提醒：</strong><code>allowInsecureAuth</code> 与 <code>dangerouslyDisableDeviceAuth</code> 只适用于 FnOS App Center 已经提供外层认证、且 Gateway 仅 loopback 监听的场景。若你把 Gateway 暴露到局域网或公网，不应这样配置。</p>

                    <h2>十二、复刻步骤总览</h2>
                    <p>在另一台 FnOS 设备复刻商店版优化时，推荐顺序：</p>
                    <p><strong>省事路径：</strong>商店安装完成后，改第六节 <code>6.7</code> 一键脚本顶部变量，root 执行整段即可落地开机引导，再按 6.7.1 自检。</p>
                    <p><strong>理解路径（分步）：</strong></p>

                    <pre>{`# 1. App Center 安装飞牛 OpenClaw，确认用户与目录
id trim.openclaw
ls -ld /var/apps/trim.openclaw /vol1/@appcenter/trim.openclaw /vol1/@apphome/trim.openclaw

# 2. 确认 Bun / Node.js
/var/apps/bunjs/target/bin/bun --version
/var/apps/nodejs_v24/target/bin/node --version

# 3. 确认主脚本与 Monitor
sed -n '1,120p' /var/apps/trim.openclaw/cmd/main
# 面板启动后：
ls -l /vol1/@appcenter/trim.openclaw/trim.openclaw.sock
curl --unix-socket /vol1/@appcenter/trim.openclaw/trim.openclaw.sock -fsS \
  http://localhost/app/trim-openclaw/api/health

# 4. 修正数据目录权限（绝不用 root 长期跑 openclaw CLI）
chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
# 敏感配置目录保持 700/640 基线（见第七节）

# 5a. 推荐：第六节 6.7 一键 install-openclaw-gateway-boot.sh
# 5b. 或手工：bootstrap + unit + drop-in
install -m 0755 trim-openclaw-bootstrap.sh /usr/local/sbin/trim-openclaw-bootstrap.sh
# 放置 trim-openclaw-gateway.service 与 20-boot-order.conf
systemctl daemon-reload
systemctl enable trim-openclaw-gateway.service
# 若仍有 openclaw-ensure：disable --now 并备份后移除

# 6. 触发一次引导或重启验证
systemctl start trim-openclaw-gateway.service
systemctl status trim-openclaw-gateway.service --no-pager
ss -lntH | grep 25730
ps -eo user,pid,cmd | grep -E 'trim.openclaw|server/index.js|openclaw-gateway' | grep -v grep

# 7. 期望
# - Gateway: trim.openclaw @ 127.0.0.1:25730
# - bootstrap unit: inactive (dead) + success
# - 无 root Monitor
# - NO_PROXY 为精确 IP，不是 CIDR`}</pre>

                    <h2>十三、完整备份、一键还原与新机复用</h2>
                    <p>修复完成后，建议立即做一份完整备份。本文环境最终备份位于：</p>

                    <pre>{`/path/to/Backup/OpenClaw/store-openclaw-YYYYMMDD-HHMMSS

openclaw-store-full.tar.zst   # 完整归档，约 464M
restore-openclaw-store.sh     # 一键恢复/新机复用脚本
checksums.sha256              # 校验文件
backup-info.txt               # 备份说明
manifest.txt                  # 路径清单
README.md                     # 使用说明`}</pre>

                    <p>latest 指针：</p>

                    <pre>{`/path/to/Backup/OpenClaw/LATEST_STORE.txt
/path/to/Backup/OpenClaw/restore-latest-openclaw-store.sh`}</pre>

                    <p>恢复最新备份：</p>

                    <pre>{`/path/to/Backup/OpenClaw/restore-latest-openclaw-store.sh`}</pre>

                    <p>无人值守恢复：</p>

                    <pre>{`/path/to/Backup/OpenClaw/restore-latest-openclaw-store.sh --yes`}</pre>

                    <p>备份应至少包含：</p>

                    <pre>{`/var/apps/trim.openclaw/
/vol1/@appcenter/trim.openclaw/
/vol1/@apphome/trim.openclaw/
/vol1/@appdata/trim.openclaw/
/usr/local/sbin/trim-openclaw-bootstrap.sh
/usr/local/sbin/trim-openclaw-gateway-start.sh   # 若使用
/etc/systemd/system/trim-openclaw-gateway.service
/etc/systemd/system/trim-openclaw-gateway.service.d/20-boot-order.conf
# 可选：openclaw-pin-heal.* / openclaw-backup.* （含密钥的备份勿公开分享）`}</pre>

                    <p>新机复用时，建议先在 FnOS 商店安装一次 <code>trim.openclaw</code>，确保系统用户、App Center 注册与 nginx/socket 路由存在，再运行恢复脚本。完整运行态备份会包含 sessions、credentials、identity、plugin-state、media/outbound 等数据，适合自用迁移，不适合公开分享。</p>

                    <h2>十四、排错清单</h2>
                    <h3>1. 控制面板能打开，但 Gateway 不在线</h3>
                    <pre>{`systemctl status trim-openclaw-gateway.service --no-pager
journalctl -u trim-openclaw-gateway.service -b --no-pager | tail -n 80
ss -lntH | grep 25730
curl --unix-socket /vol1/@appcenter/trim.openclaw/trim.openclaw.sock -fsS \
  http://localhost/app/trim-openclaw/api/health
# 手动补一次 start：
curl --unix-socket /vol1/@appcenter/trim.openclaw/trim.openclaw.sock -fsS -N \
  -X POST -H "Content-Type: application/json" \
  --data-binary '{"action":"start","instanceId":"default"}' \
  http://localhost/app/trim-openclaw/api/install`}</pre>

                    <h3>2. bootstrap 报 monitor 90 秒未就绪</h3>
                    <p>常见原因：App Center 未起来、Monitor 崩溃、sock 僵尸。检查 <code>trim_app_center</code>、Monitor 进程用户是否为 <code>trim.openclaw</code>、删掉无效 sock 后由商店重新 start（不要用 root 手搓 Monitor）。</p>

                    <h3>3. unit 显示 inactive (dead) 以为失败</h3>
                    <p>oneshot + <code>RemainAfterExit=no</code> 成功后就是 dead。看 <code>Result=success</code> 与 <code>:25730</code> 是否 LISTEN，不要只凭 ActiveState 判断。</p>

                    <h3>4. bun / node command not found</h3>
                    <pre>{`export PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:$PATH
command -v bun
command -v node`}</pre>

                    <h3>5. 配置文件读不到</h3>
                    <pre>{`runuser -u trim.openclaw -- env \
  HOME=/vol1/@apphome/trim.openclaw/data/home \
  OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data \
  OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json \
  /vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin/openclaw --version`}</pre>

                    <h3>6. root Monitor / 权限污染</h3>
                    <p>若曾用 root 执行 <code>cmd/main start</code> 或 ensure 调 main：停掉 root 进程，统一 <code>chown</code> 回 <code>trim.openclaw</code>，只保留一套 Monitor。</p>

                    <h3>7. 误把 Docker / 自装实例当成商店版</h3>
                    <pre>{`# 商店版
用户：trim.openclaw
端口：127.0.0.1:25730
Monitor：bun .../@appcenter/trim.openclaw/server/index.js

# 自装第二实例（示例）
用户：其它系统用户
端口：例如 11751
systemd：openclaw-11751.service
# 详见双实例文，勿用商店 bootstrap 去管 11751`}</pre>

                    <h3>8. 代理导致内网管理口异常</h3>
                    <p>若 unit 配置了 <code>HTTP_PROXY</code>，访问本机/内网管理 API 可能被拐走。务必配置 <code>NO_PROXY</code> / <code>no_proxy</code>：写成<strong>精确 IP 列表</strong>（含 loopback、本机、内网 API、代理网关本身），<strong>禁止 CIDR / 通配 / 前缀</strong>。curl 认 CIDR，但 Node / Python httpx 等常不认，会导致请求被错误打进代理再 502。示例：<code>localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1</code>。</p>

                    <h2>十五、最终效果</h2>
                    <p>完成优化后，你会得到更稳、更符合商店范式的 OpenClaw：</p>

                    <pre>{`✅ FnOS 商店包负责 UI / Monitor / 生命周期入口
✅ systemd 只做开机 bootstrap，不与 Monitor 抢 Gateway
✅ 通过 Monitor API action=start 拉起 Gateway
✅ Gateway 以 trim.openclaw 运行，仅 loopback :25730
✅ oneshot 成功后 unit inactive 属正常
✅ 禁止 root 起 Monitor；权限基线可复刻
✅ 更新链路可检查：商店插件 → 渠道插件 → 基底
✅ 备份清单对齐 bootstrap unit/脚本
✅ 6.7 一键脚本可从零落地开机引导（与第十三节全量还原职责分离）
✅ NO_PROXY 精确 IP，避免代理拐走内网
✅ 与同机自装实例边界清晰（见双实例文）`}</pre>

                    <p>这套方案的关键不是“把 OpenClaw 跑起来”，而是让它符合 FnOS 商店应用的运行范式：程序归 App Center，数据归 @apphome，权限归独立用户，Gateway 不直接暴露，开机引导只委托不越权，升级有顺序、有日志、可回滚。迁移到另一台设备时：商店装好后优先跑第六节 <code>6.7</code> 一键 boot；需要整机会话与配置时再走第十三节还原；按目录、用户、Monitor API、bootstrap unit、权限基线逐项验收即可。</p>
                    <p>推荐阅读：</p>
                    <ol>
                        <li>本文：商店版优化与开机引导</li>
                        <li><A href="/article/fnos-openclaw-dual-instance">双 OpenClaw 实例并存</A>（同机第二套时）</li>
                        <li><A href="/article/memory-embed-ollama">记忆 / Embedding 本地化</A></li>
                        <li><A href="/article/tunnel-dualstack-full-guide">双栈隧道统一入口</A></li>
                    </ol>

                </div>
            </div>
        </section>
    );
}
