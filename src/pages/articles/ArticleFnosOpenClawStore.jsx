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
                    <h1>飞牛系统商店版 OpenClaw 优化实战：启动守护、路径复刻与更新按钮增强</h1>
                    <p class="article-subtitle">FnOS App Center · trim.openclaw · systemd 兜底自启 · Gateway loopback · 插件优先更新</p>
                    <div class="article-meta">
                        <span class="article-date">2026-05-29</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">OpenClaw</span>
                            <span class="tech-tag">systemd</span>
                            <span class="tech-tag">Bun</span>
                            <span class="tech-tag">Node.js</span>
                            <span class="tech-tag">Gateway</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、写在前面：本文解决什么问题</h2>
                    <p>飞牛系统（FnOS）商店版 OpenClaw 的运行方式与普通 Docker 部署不同。它不是直接由 root 启动一个裸进程，而是由 FnOS App Center 管理应用包，再由商店版 Monitor 启动 OpenClaw Gateway。本文记录一次完整的商店版 OpenClaw 优化过程：反向定位运行路径、补齐开机自启兜底脚本、梳理控制面板“检查更新”按钮的真实逻辑，并给出可复刻的代码与目录结构。</p>

                    <p>本文所有域名、Token、用户名、内网地址均做脱敏处理。示例中的 <code>example.com</code>、<code>192.168.x.x</code>、<code>&lt;TOKEN&gt;</code> 等请替换为你自己的环境。</p>

                    <h2>二、目标架构</h2>
                    <p>优化后的商店版 OpenClaw 采用以下链路：</p>

                    <pre>{`FnOS systemd
  → openclaw-ensure.service
    → /usr/local/sbin/openclaw-ensure.sh
      → /var/apps/trim.openclaw/cmd/main start
        → bun /vol1/@appcenter/trim.openclaw/server/index.js
          → /var/apps/trim.openclaw/target/bin/openclaw
            → /vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin/openclaw
              → Gateway: 127.0.0.1:25730`}</pre>

                    <p>关键设计原则：</p>
                    <ul>
                        <li><strong>商店版独立用户运行</strong>：使用 <code>trim.openclaw</code> 用户，不与 root 或 Docker 版混用。</li>
                        <li><strong>Gateway 仅监听 loopback</strong>：默认 <code>127.0.0.1:25730</code>，避免直接暴露到局域网或公网。</li>
                        <li><strong>systemd 只做兜底</strong>：真正的应用生命周期仍交给 FnOS 商店脚本 <code>cmd/main</code>。</li>
                        <li><strong>更新前优雅停止 Gateway</strong>：避免安装包替换过程中进程仍占用旧文件。</li>
                        <li><strong>更新 OpenClaw 前先检查商店插件</strong>：如果 FnOS 商店包本身有更新，优先提示先升级商店包。</li>
                        <li><strong>OpenClaw 升级前先更新渠道插件</strong>：例如 QQBot，避免 OpenClaw 基底升级后插件 SDK 不兼容。</li>
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

                    <h2>六、systemd 兜底启动脚本</h2>
                    <p>FnOS 商店脚本可能只负责 App Center 生命周期；如果系统重启后 Monitor 或 Gateway 没有按预期起来，可以增加一个轻量的 systemd 兜底服务。</p>

                    <h3>6.1 systemd unit</h3>
                    <p>创建：</p>

                    <pre>{`/etc/systemd/system/openclaw-ensure.service`}</pre>

                    <p>内容：</p>

                    <pre>{`[Unit]
Description=Ensure OpenClaw Gateway is running
After=network-online.target trim_open_gateway.service trim_app_center.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/openclaw-ensure.sh
TimeoutStartSec=120
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target`}</pre>

                    <h3>6.2 ensure 脚本</h3>
                    <p>创建：</p>

                    <pre>{`/usr/local/sbin/openclaw-ensure.sh`}</pre>

                    <p>推荐代码如下。注意：该脚本只检查商店版 Gateway 的 loopback 端口，不检查 Docker 版或其他 root 进程。</p>

                    <pre>{`#!/usr/bin/env bash
set -euo pipefail

APP_NAME="trim.openclaw"
APP_MAIN="/var/apps/\${APP_NAME}/cmd/main"
GATEWAY_HOST="127.0.0.1"
GATEWAY_PORT="25730"
LOG_FILE="/var/log/openclaw-ensure.log"

log() {
  printf '%s %s\n' "$(date '+%F %T')" "$*" >> "\${LOG_FILE}"
}

is_listening() {
  ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "(^|:)\${GATEWAY_PORT}$"
}

http_ready() {
  curl -fsS --max-time 3 "http://\${GATEWAY_HOST}:\${GATEWAY_PORT}/" >/dev/null 2>&1
}

start_store_app() {
  if [ ! -x "\${APP_MAIN}" ]; then
    log "ERROR: \${APP_MAIN} not found or not executable"
    return 1
  fi

  log "starting \${APP_NAME} via \${APP_MAIN} start"
  "\${APP_MAIN}" start || true
}

wait_ready() {
  local i
  for i in $(seq 1 60); do
    if is_listening || http_ready; then
      log "OpenClaw Gateway is ready on \${GATEWAY_HOST}:\${GATEWAY_PORT}"
      return 0
    fi
    sleep 2
  done
  log "ERROR: OpenClaw Gateway did not become ready within timeout"
  return 1
}

main() {
  if is_listening || http_ready; then
    log "OpenClaw Gateway already running on \${GATEWAY_HOST}:\${GATEWAY_PORT}"
    exit 0
  fi

  start_store_app
  wait_ready
}

main "$@"`}</pre>

                    <p>启用：</p>

                    <pre>{`chmod +x /usr/local/sbin/openclaw-ensure.sh
systemctl daemon-reload
systemctl enable openclaw-ensure.service
systemctl start openclaw-ensure.service
systemctl status openclaw-ensure.service --no-pager`}</pre>

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
  process.env.OPENCLAW_VERSION || "2026.5.4";

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

                    <p>更新后启动：</p>

                    <pre>{`openclaw gateway run --port 25730 --bind loopback`}</pre>

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
                    <p>在另一台 FnOS 设备复刻时，推荐顺序如下：</p>

                    <pre>{`# 1. 通过 FnOS App Center 安装飞牛 OpenClaw
# 确认 trim.openclaw 用户、应用目录与依赖已创建
id trim.openclaw
ls -ld /var/apps/trim.openclaw /vol1/@appcenter/trim.openclaw /vol1/@apphome/trim.openclaw

# 2. 确认 Bun / Node.js
/var/apps/bunjs/target/bin/bun --version
/var/apps/nodejs_v24/target/bin/node --version

# 3. 确认主脚本
sed -n '1,220p' /var/apps/trim.openclaw/cmd/main

# 4. 确认 OpenClaw wrapper
sed -n '1,120p' /var/apps/trim.openclaw/target/bin/openclaw

# 5. 修正数据目录权限
chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod -R 750 /vol1/@apphome/trim.openclaw/data
chmod 700 /vol1/@apphome/trim.openclaw/data/home/.openclaw
chmod 640 /vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# 6. 安装 ensure 脚本与 systemd unit
chmod +x /usr/local/sbin/openclaw-ensure.sh
systemctl daemon-reload
systemctl enable --now openclaw-ensure.service

# 7. 验证商店版进程与端口
ps -eo pid,ppid,user,group,cmd | grep -E 'trim.openclaw|server/index.js|openclaw' | grep -v grep
ss -ltnp | grep 25730
curl -I http://127.0.0.1:25730/`}</pre>

                    <h2>十三、排错清单</h2>
                    <h3>1. 控制面板能打开，但 Gateway 不在线</h3>
                    <pre>{`systemctl status openclaw-ensure.service --no-pager
cat /var/log/openclaw-ensure.log
tail -n 100 /vol1/@appdata/trim.openclaw/info.log
ss -ltnp | grep 25730`}</pre>

                    <h3>2. bun command not found</h3>
                    <p>检查 <code>cmd/main</code> 与 wrapper 的 PATH：</p>
                    <pre>{`export PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:$PATH
command -v bun
command -v node`}</pre>

                    <h3>3. 配置文件读不到</h3>
                    <p>确认 HOME 与 OPENCLAW_CONFIG_PATH：</p>
                    <pre>{`runuser -u trim.openclaw -- env \
  HOME=/vol1/@apphome/trim.openclaw/data/home \
  OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json \
  /var/apps/trim.openclaw/target/bin/openclaw --version`}</pre>

                    <h3>4. 误把 Docker 版和商店版混在一起</h3>
                    <p>判断标准：</p>
                    <pre>{`# 商店版
用户：trim.openclaw
端口：127.0.0.1:25730
cwd：/vol1/@apphome/trim.openclaw/data/openclaw

# Docker 或其他自建版
用户：通常为 root 或容器用户
端口：可能是 18789 或其他
cwd：通常是 /app 或容器内路径`}</pre>

                    <h2>十四、最终效果</h2>
                    <p>完成优化后，你会得到一个更稳的商店版 OpenClaw：</p>

                    <pre>{`✅ FnOS 商店包负责 UI / Monitor / 生命周期入口
✅ OpenClaw Gateway 以 trim.openclaw 用户运行
✅ Gateway 仅监听 127.0.0.1:25730
✅ systemd 负责开机后兜底拉起
✅ 控制面板“检查更新”可升级 openclaw@latest
✅ 更新前可检测 FnOS 商店插件版本
✅ 更新 OpenClaw 前可先升级渠道插件
✅ 更新后自动刷新渠道插件与模型目录
✅ 整体路径清晰，便于备份、恢复和迁移`}</pre>

                    <p>这套方案的关键不是“把 OpenClaw 跑起来”，而是让它符合 FnOS 商店应用的运行范式：程序归 App Center，数据归 @apphome，权限归独立用户，Gateway 不直接暴露，升级逻辑有顺序、有日志、可回滚。这样迁移到另一台设备时，只需按目录、用户、wrapper、systemd、更新逻辑逐项复刻，就能得到一致的运行环境。</p>

                </div>
            </div>
        </section>
    );
}
