import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function ArticleFnosHermesStore() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>飞牛系统商店版 Hermes 开机引导实战：oneshot 点火 + wrapper 共存（可完整复刻）</h1>
                    <p class="article-subtitle">trim.hermes · oneshot · KillMode=none · 一键安装脚本 · Dashboard :19119 · Gateway :18642 · NO_PROXY 精确 IP</p>
                    <div class="article-meta">
                        <span class="article-date">2026-07-21</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">Hermes</span>
                            <span class="tech-tag">systemd</span>
                            <span class="tech-tag">App Center</span>
                            <span class="tech-tag">Gateway</span>
                            <span class="tech-tag">oneshot</span>
                            <span class="tech-tag">维护</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、写在前面：本文解决什么问题</h2>
                    <p>飞牛系统（FnOS）商店版 Hermes 不是「随便起一个 Python 进程」这么简单。商店侧由 App Center 拉起 <code>trim-hermes-wrapper</code>（Go），wrapper 在起 Dashboard 前会对 <code>:18642</code>（及必要时 <code>:19119</code>）做<strong>硬绑定端口预检</strong>。若 systemd 用常驻 unit 长期占住 Gateway，面板常见现象是：</p>
                    <ul>
                        <li>面板 “Hermes could not start” / address already in use</li>
                        <li>wrapper 预检失败，Dashboard 起不来或页面 502</li>
                        <li>Gateway 其实在跑，但商店生命周期与 systemd 互抢端口</li>
                    </ul>
                    <p><strong>2026-07-21 修订说明：</strong>早期文章使用常驻 <code>trim-hermes-gateway.service</code> + drop-in <code>20-boot-order.conf</code>（等 Dashboard 再起 Gateway、<code>Restart=on-failure</code>）。真实踩坑后确认：<strong>常驻监管 Gateway 与 wrapper 的 preflight 硬 bind 本质冲突</strong>。现行稳定方案改为与商店版 OpenClaw 同思路的<strong>开机 oneshot 点火</strong>：</p>
                    <ul>
                        <li>unit：<code>hermes-gateway-boot.service</code>（<code>Type=oneshot</code>，<code>KillMode=none</code>）</li>
                        <li>脚本：<code>/usr/local/bin/hermes-gateway-boot.sh</code></li>
                        <li>以商店用户 <code>trim.hermes</code> 走 wrapper 路径尽量保住 Dashboard 归属，再用原生 CLI 起 Gateway</li>
                        <li>网关 detached 后由 Hermes 自己管（lock / state），oneshot 不再 <code>Restart=always</code> 抢端口</li>
                    </ul>
                    <p>本文给出可迁移到其它 FnOS 主机的完整路径、unit、脚本、NO_PROXY 坑、验收矩阵与回滚清单。域名、Token、真实内网地址已脱敏；示例 <code>192.168.x.x</code>、<code>&lt;TOKEN&gt;</code> 请替换为你的环境。</p>
                    <p>对照 OpenClaw 商店引导见 <A href="/article/fnos-openclaw-store-optimization">飞牛系统商店版 OpenClaw 优化实战</A>：两边都是「systemd 只点火，生命周期尽量落在商店路径内」。</p>

                    <h2>二、目标架构（2026-07-21 现行）</h2>
                    <pre>{`FnOS App Center / trim_app_center
  → wrapper: trim-hermes-wrapper
       --socket  /vol1/@appcenter/trim.hermes/run/trim-hermes.sock
       --dashboard-host 127.0.0.1
       --dashboard-port 19119
       --app-root  /vol1/@appcenter/trim.hermes
       --data-root /vol1/@appdata/trim.hermes
    → preflightRuntimePorts（硬 bind 探测 :18642，必要时也探 :19119）
    → Dashboard: 127.0.0.1:19119   （理想：ppid = wrapper）

systemd oneshot: hermes-gateway-boot.service （enabled）
  Type=oneshot · RemainAfterExit=yes · KillMode=none
  User/Group=trim.hermes
  WorkingDirectory=.../workspace
  ExecStart=/usr/local/bin/hermes-gateway-boot.sh
  脚本顺序：
    1) 等 wrapper unix sock + health
    2) 若 Dashboard 未起 / 归属不对 → 短暂释放 :18642 → 走 wrapper admin 入口拉起面板
    3) 若 :18642 未 LISTEN → setsid hermes gateway run --replace --accept-hooks
    4) 写 gateway.lock / gateway_state.json；health 200 后 exit 0
    5) 不再常驻监管；stop unit 不得杀已 detached 的网关
       （RemainAfterExit=yes 时 process 可能仍显示在 unit cgroup 下，但 PPid 可为 1；以 stop 后是否存活验收）

Hermes Gateway
  → 127.0.0.1:18642
  → HERMES_HOME=/vol1/@appdata/trim.hermes/hermes
  → 原生指纹：python3.11.real -m hermes_cli.main gateway run --replace --accept-hooks
  → Dashboard 理想态：ppid = trim-hermes-wrapper；Gateway 理想态：ppid=1 自管
`}</pre>

                    <p>关键设计原则：</p>
                    <ul>
                        <li><strong>oneshot 点火，不常驻监管</strong>：长期 <code>Restart=always</code> 占着 <code>:18642</code> 必撞 preflight。</li>
                        <li><strong>KillMode=none</strong>：oneshot 退出/stop 时默认 control-group 会杀子进程；网关必须继续活。systemd 会告警 deprecation，但当前仍是让网关存活的必要项；勿改回 control-group。</li>
                        <li><strong>Dashboard 归商店 wrapper</strong>：不要另起常驻 <code>hermes-dashboard.service</code>（只会把碰撞从 18642 挪到 19119）。</li>
                        <li><strong>Gateway 归 Hermes 原生 lock</strong>：同用户、同 CLI、同状态文件，商店后续可识别/接管。</li>
                        <li><strong>先尽量满足 wrapper，再起 Gateway</strong>：必要时短暂释放 <code>:18642</code> 让 preflight 过。</li>
                        <li><strong>NO_PROXY 写精确 IP</strong>：Python httpx/requests <strong>不认 CIDR / 通配</strong>，见第八节。</li>
                        <li><strong>Gateway 优先 loopback</strong>：外网走反代 / Tunnel，不直暴进程端口。</li>
                    </ul>

                    <h2>三、路径与运行环境定位</h2>
                    <p>复刻前先在目标机核对（卷名可能略有差异）：</p>
                    <pre>{`# 商店应用入口
/var/apps/trim.hermes
  target -> /vol1/@appcenter/trim.hermes
  var    -> /vol1/@appdata/trim.hermes
  home   -> /vol1/@apphome/trim.hermes
  etc    -> /vol1/@appconf/trim.hermes

# 程序 / 运行时
/vol1/@appcenter/trim.hermes/
  wrapper/trim-hermes-wrapper
  runtime/python/bin/hermes
  runtime/python/bin/python3.11.real
  runtime/python/node/bin/...
  run/trim-hermes.sock

# 数据（配置、日志、工作区）
/vol1/@appdata/trim.hermes/
  hermes/                 # HERMES_HOME
  hermes/config.yaml
  hermes/.env
  hermes/logs/gateway.log
  hermes/logs/gateway-boot.log
  hermes/gateway.lock
  hermes/gateway_state.json
  home/
  workspace/

# systemd（现行两件套）
/etc/systemd/system/hermes-gateway-boot.service
/usr/local/bin/hermes-gateway-boot.sh

# 已弃用（勿再启用）
# /etc/systemd/system/trim-hermes-gateway.service
# /etc/systemd/system/trim-hermes-gateway.service.d/20-boot-order.conf
# /etc/systemd/system/hermes-dashboard.service`}</pre>

                    <p>端口与用户约定：</p>
                    <pre>{`| 组件              | 地址 / 身份              | 说明 |
|-------------------|--------------------------|------|
| Hermes Dashboard  | 127.0.0.1:19119          | wrapper 拉起的面板 |
| Hermes Gateway    | 127.0.0.1:18642          | 消息网关 / API |
| wrapper unix sock | .../run/trim-hermes.sock | App Center 通信 |
| 运行用户          | trim.hermes              | 主组常见为 AppUsers，辅组含 trim.hermes；uid/gid 以命令 id trim.hermes 为准 |
| unit Group        | Group=trim.hermes        | 对齐商店运行时 gid，避免写权限漂移 |`}</pre>

                    <h2>四、根因时间线：为什么旧方案会翻车</h2>

                    <h3>4.1 wrapper 硬 bind 预检</h3>
                    <ol>
                        <li><code>trim_app_center</code> 拉起 <code>trim-hermes-wrapper</code>。</li>
                        <li>点控制面板 / ensureDashboard 时执行 <code>preflightRuntimePorts</code>：对 <code>:18642</code>（必要时也有 <code>:19119</code>）做<strong>硬 bind 探测</strong>。</li>
                        <li>若 Gateway 已由常驻 systemd 占住 <code>:18642</code> → 预检失败 → “already in use / could not start”。</li>
                        <li>即便 Gateway 健康、消息渠道已 connected，面板仍可能认为启动失败。</li>
                    </ol>

                    <h3>4.2 常驻 unit 的两个死结</h3>
                    <ul>
                        <li><strong>Restart=always 抢端口</strong>：unit 一直管着进程，wrapper 永远过不了 preflight。</li>
                        <li><strong>TimeoutStartSec 与 ExecStartPre 互相打架</strong>（旧 drop-in）：Pre 循环等 Dashboard 90s，但 unit <code>TimeoutStartSec=45</code> 会提前杀掉 Pre，冷启动「等不到就兜底启动」永远触发不了。</li>
                    </ul>

                    <h3>4.3 常驻 Dashboard 也是错方向</h3>
                    <p>有人想「先常驻 :19119 再起网关」——wrapper 点面板时两端都可能硬 bind，结果只是把红条从 <code>:18642 already in use</code> 变成 <code>:19119 already in use</code>。已否决。</p>

                    <h3>4.4 正确顺序（实测成功路径）</h3>
                    <pre>{`trim_app_center / wrapper sock 就绪
  → （如需）短暂释放 :18642 让 preflight 能 bind-probe
  → 经 wrapper admin 路径拉起 Dashboard（ppid 最好是 wrapper）
  → hermes CLI: gateway run --replace --accept-hooks
  → :18642 LISTEN + /health 200 + gateway.lock
  → oneshot 退出；网关 ppid=1 或自管，继续活着`}</pre>

                    <h2>五、可复刻配置（其它主机按此落地）</h2>

                    <h3>5.1 清理冲突残留（首次必做）</h3>
                    <pre>{`# 停掉并禁用旧常驻方案（若存在）
sudo systemctl disable --now trim-hermes-gateway.service 2>/dev/null || true
sudo systemctl disable --now hermes-dashboard.service 2>/dev/null || true
sudo systemctl disable --now hermes-gateway.service 2>/dev/null || true

# 建议整体移走而非直接 rm
sudo mkdir -p /root/backup/hermes-residual-$(date +%Y%m%d)
sudo mv /etc/systemd/system/trim-hermes-gateway.service \\
        /etc/systemd/system/trim-hermes-gateway.service.d \\
        /etc/systemd/system/hermes-dashboard.service \\
        /root/backup/hermes-residual-$(date +%Y%m%d)/ 2>/dev/null || true
sudo systemctl daemon-reload`}</pre>

                    <h3>5.2 oneshot unit</h3>
                    <p>路径：<code>/etc/systemd/system/hermes-gateway-boot.service</code></p>
                    <pre>{`[Unit]
Description=Hermes boot assist (OpenClaw-style via shop wrapper + gateway CLI)
After=network-online.target trim_app_center.service trim_connect.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=trim.hermes
Group=trim.hermes
# 关键：oneshot 退出后网关必须继续活；默认 control-group 会在 stop/清理时杀子进程
KillMode=none
WorkingDirectory=/vol1/@appdata/trim.hermes/workspace
# 脚本幂等：端口已起则跳过；始终跑一遍以便必要时修 Dashboard 归属
ExecStart=/usr/local/bin/hermes-gateway-boot.sh
TimeoutStartSec=180

[Install]
WantedBy=multi-user.target`}</pre>

                    <h3>5.3 boot 脚本（核心，完整可复用）</h3>
                    <p>脚本里的 <code>X-Trim-Isadmin: true</code> 是飞牛商店 wrapper 的本地 admin 头，用于触发控制入口拉起 Dashboard；<strong>不是</strong> API Token/密钥，可写在文档里。</p>
                    <p>路径：<code>/usr/local/bin/hermes-gateway-boot.sh</code>，<code>chmod 755</code>，属主 root 即可（由 unit 切到 <code>trim.hermes</code> 执行）。代理地址请按你的出口修改；没有代理可保留空 fallback 或删掉相关行。</p>
                    <pre>{`#!/bin/bash
# Hermes boot assist — same idea as OpenClaw store bootstrap:
# prefer shop control path so the panel is happy, then ensure gateway is up.
#
# Shop Hermes constraint:
#   Go wrapper preflightRuntimePorts hard-binds :18642 before starting dashboard.
#   Dashboard started by bare CLI is NOT owned by wrapper → opening panel can fail.
#   Correct order:
#     1) wait for wrapper sock
#     2) ensure dashboard via wrapper admin hit (needs :18642 free at that moment)
#     3) ensure gateway via hermes CLI (same user as shop)
set -euo pipefail

GW_PORT=18642
DASH_PORT=19119
APP_ROOT=/vol1/@appcenter/trim.hermes
HERMES_ROOT=/vol1/@appdata/trim.hermes
HERMES_HOME=\${HERMES_ROOT}/hermes
HOME_DIR=\${HERMES_ROOT}/home
WORKSPACE=\${HERMES_ROOT}/workspace
PY_BIN=\${APP_ROOT}/runtime/python/bin
NODE_BIN=\${APP_ROOT}/runtime/python/node/bin
HERMES_BIN=\${PY_BIN}/hermes
PYTHON=\${PY_BIN}/python3.11.real
ENV_FILE=\${HERMES_HOME}/.env
LOG_DIR=\${HERMES_HOME}/logs
LOG_FILE=\${LOG_DIR}/gateway-boot.log
WRAPPER_SOCK=\${APP_ROOT}/run/trim-hermes.sock

mkdir -p "\${LOG_DIR}" "\${WORKSPACE}"
chown trim.hermes:trim.hermes "\${LOG_DIR}" 2>/dev/null || true
exec >>"\${LOG_FILE}" 2>&1
echo "===== \$(date '+%F %T') hermes-gateway-boot start ====="

port_up() {
  local p="\$1"
  ss -lntH "sport = :\${p}" 2>/dev/null | grep -q LISTEN
}

wait_port() {
  local p="\$1" label="\$2" max="\${3:-60}"
  local i
  for i in \$(seq 1 "\${max}"); do
    if port_up "\${p}"; then
      echo "\${label} ready on :\${p} after \${i}s"
      return 0
    fi
    sleep 1
  done
  echo "ERROR: \${label} did not bind :\${p} within \${max}s"
  return 1
}

export HOME="\${HOME_DIR}"
export HERMES_HOME="\${HERMES_HOME}"
export USER=trim.hermes
export LOGNAME=trim.hermes
export PATH="\${PY_BIN}:\${NODE_BIN}:\${HERMES_HOME}/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LD_LIBRARY_PATH="\${PY_BIN}/../system-libs"
export HERMES_MANAGED_BY=trim.hermes
export HERMES_NODE="\${NODE_BIN}/node"
export HERMES_WRITE_SAFE_ROOT="\${WORKSPACE}"
export HERMES_NONINTERACTIVE=1
export HERMES_QUIET=1
export TRIM_APPNAME=trim.hermes
export TRIM_APPDEST="\${APP_ROOT}"
export TRIM_HERMES_DATA_ROOT="\${HERMES_ROOT}"
export TRIM_PKGVAR="\${HERMES_ROOT}"
export TRIM_UID=\$(id -u trim.hermes)
export TRIM_GID=\$(getent group trim.hermes | cut -d: -f3)
export TRIM_USERNAME=trim.hermes
export TRIM_GROUPNAME=trim.hermes
export TRIM_RUN_UID=\${TRIM_UID}
export TRIM_RUN_GID=\${TRIM_GID}
export TRIM_RUN_USERNAME=trim.hermes
export TRIM_RUN_GROUPNAME=trim.hermes
export TRIM_SERVICE_PORT=\${DASH_PORT}

if [ -f "\${ENV_FILE}" ]; then
  set -a
  . "\${ENV_FILE}"
  set +a
  echo "loaded env_file=\${ENV_FILE}"
fi

# re-pin after sourcing .env
export HOME="\${HOME_DIR}"
export HERMES_HOME="\${HERMES_HOME}"
export HERMES_MANAGED_BY=trim.hermes
export HERMES_NODE="\${NODE_BIN}/node"
export HERMES_WRITE_SAFE_ROOT="\${WORKSPACE}"
export PATH="\${PY_BIN}:\${NODE_BIN}:\${HERMES_HOME}/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LD_LIBRARY_PATH="\${PY_BIN}/../system-libs"

# 代理：按你的内网出口改；NO_PROXY 必须精确 IP（见第八节）
: "\${HTTP_PROXY:=http://192.168.x.x:7890}"
: "\${HTTPS_PROXY:=http://192.168.x.x:7890}"
: "\${http_proxy:=\${HTTP_PROXY}}"
: "\${https_proxy:=\${HTTPS_PROXY}}"
: "\${NO_PROXY:=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1}"
: "\${no_proxy:=\${NO_PROXY}}"
export HTTP_PROXY HTTPS_PROXY http_proxy https_proxy NO_PROXY no_proxy

cd "\${WORKSPACE}"
export PWD="\${WORKSPACE}"
export TERMINAL_CWD="\${WORKSPACE}"

if [ -x "\${HERMES_BIN}" ]; then
  HCMD=("\${HERMES_BIN}")
else
  HCMD=("\${PYTHON}" -m hermes_cli.main)
fi
echo "hermes_cmd=\${HCMD[*]}"

# 0) Wait shop wrapper
if [ ! -S "\${WRAPPER_SOCK}" ]; then
  echo "waiting for wrapper sock"
  for i in \$(seq 1 90); do
    [ -S "\${WRAPPER_SOCK}" ] && break
    sleep 1
  done
fi
if [ -S "\${WRAPPER_SOCK}" ] && curl -fsS --unix-socket "\${WRAPPER_SOCK}" -m 3 http://localhost/health >/dev/null 2>&1; then
  echo "wrapper health OK"
else
  echo "WARN: wrapper not healthy yet"
fi

dashboard_owned_by_wrapper() {
  port_up "\${DASH_PORT}" || return 1
  local dpid wpid ppid
  dpid=\$(ss -lntp "sport = :\${DASH_PORT}" 2>/dev/null | sed -n 's/.*pid=\\([0-9]*\\).*/\\1/p' | head -1)
  [ -n "\${dpid}" ] || return 1
  wpid=\$(pgrep -f 'trim-hermes-wrapper' | head -1 || true)
  [ -n "\${wpid}" ] || return 1
  ppid=\$(awk '/^PPid:/{print \$2}' "/proc/\${dpid}/status" 2>/dev/null || true)
  [ "\${ppid}" = "\${wpid}" ]
}

stop_gateway_briefly() {
  echo "temporarily stopping gateway so wrapper preflight can bind-probe :\${GW_PORT}"
  "\${HCMD[@]}" gateway stop >>"\${LOG_DIR}/gateway-boot.log" 2>&1 || true
  local i
  for i in \$(seq 1 20); do
    port_up "\${GW_PORT}" || return 0
    sleep 1
  done
  fuser -k "\${GW_PORT}/tcp" 2>/dev/null || true
  sleep 1
}

start_dashboard_via_wrapper() {
  if [ ! -S "\${WRAPPER_SOCK}" ]; then
    echo "ERROR: no wrapper sock; cannot start shop dashboard"
    return 1
  fi
  if port_up "\${GW_PORT}"; then
    stop_gateway_briefly
  fi
  echo "starting dashboard via shop wrapper admin API"
  curl -fsS --unix-socket "\${WRAPPER_SOCK}" -m 90 \\
    -H 'X-Trim-Isadmin: true' \\
    -o /tmp/hermes-boot-panel.html \\
    "http://localhost/app/trim-hermes/" || true
  if grep -q 'Hermes could not start' /tmp/hermes-boot-panel.html 2>/dev/null; then
    echo "WARN: wrapper returned could-not-start page"
  fi
  wait_port "\${DASH_PORT}" dashboard 45
}

start_gateway_cli() {
  if port_up "\${GW_PORT}"; then
    echo "gateway :\${GW_PORT} already LISTEN — skip"
    return 0
  fi
  echo "starting gateway via hermes CLI"
  setsid "\${HCMD[@]}" gateway run --replace --accept-hooks \\
    >>"\${LOG_DIR}/gateway.log" 2>&1 </dev/null &
  echo "spawned gateway setsid_pid=\$!"
  wait_port "\${GW_PORT}" gateway 60
  if [ -f "\${HERMES_HOME}/gateway.lock" ]; then
    echo "gateway.lock=\$(cat "\${HERMES_HOME}/gateway.lock")"
  fi
  curl -fsS -m 3 "http://127.0.0.1:\${GW_PORT}/health" >/dev/null 2>&1 && echo "gateway health 200"
}

# 1) Ensure dashboard
if dashboard_owned_by_wrapper; then
  echo "dashboard already owned by wrapper — ok"
elif port_up "\${DASH_PORT}"; then
  echo "dashboard on :\${DASH_PORT} but not wrapper-owned — leave as-is (do not kill UI)"
else
  start_dashboard_via_wrapper || {
    echo "ERROR: failed to start shop dashboard"
    exit 1
  }
fi

# 2) Ensure gateway
start_gateway_cli || {
  echo "ERROR: failed to start gateway"
  exit 1
}

echo "final:"
ss -lntp "sport = :\${DASH_PORT}" 2>/dev/null | head -n 2 || true
ss -lntp "sport = :\${GW_PORT}" 2>/dev/null | head -n 2 || true
echo "boot assist done"
exit 0`}</pre>

                    <h3>5.4 启用与加载</h3>
                    <pre>{`sudo install -m 755 hermes-gateway-boot.sh /usr/local/bin/hermes-gateway-boot.sh
sudo install -m 644 hermes-gateway-boot.service /etc/systemd/system/hermes-gateway-boot.service
sudo systemctl daemon-reload
sudo systemctl enable hermes-gateway-boot.service

# 热验证
sudo systemctl start hermes-gateway-boot.service
systemctl status hermes-gateway-boot.service --no-pager
# 期望：active (exited)，且 :18642 已 LISTEN

# 冷启动验证（最能暴露顺序问题）
# sudo reboot`}</pre>

                    <h2>六、从零到可跑：一键安装脚本（其它主机直接复刻）</h2>
                    <p>下面脚本把<strong>清理旧常驻 unit → 写入 oneshot 两件套 → enable/start → 最小验收</strong>串成一条。在已安装商店版 Hermes 的 FnOS 上以 <code>root</code> 执行。路径默认按 <code>/vol1/@appcenter|@appdata/trim.hermes</code>；卷名不同时先改顶部变量。</p>
                    <p><strong>执行前请改 3 处：</strong></p>
                    <ol>
                        <li><code>HTTP_PROXY_DEFAULT</code> / <code>HTTPS_PROXY_DEFAULT</code>：你的内网代理；无代理可留空字符串 <code>""</code>。</li>
                        <li><code>NO_PROXY_DEFAULT</code>：写成<strong>精确 IP 列表</strong>（含本机、内网 API、代理网关），禁止 CIDR/通配。</li>
                        <li>若 Dashboard/Gateway 端口不是 <code>19119/18642</code>，改 <code>DASH_PORT</code> / <code>GW_PORT</code>。</li>
                    </ol>
                    <pre>{`#!/bin/bash
# install-hermes-gateway-boot.sh
# FnOS 商店版 Hermes oneshot 开机引导 — 一键落地
# 要求：已商店安装 trim.hermes；以 root 运行
set -euo pipefail

# ========== 按环境修改 ==========
APP_ROOT=/vol1/@appcenter/trim.hermes
HERMES_ROOT=/vol1/@appdata/trim.hermes
GW_PORT=18642
DASH_PORT=19119
# 无代理：两行都写成空 ""
HTTP_PROXY_DEFAULT="http://192.168.x.x:7890"
HTTPS_PROXY_DEFAULT="http://192.168.x.x:7890"
# 精确 IP，勿用 CIDR/通配；按你的内网改
NO_PROXY_DEFAULT="localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1"
# ========== 一般不用改 ==========
HERMES_HOME=\${HERMES_ROOT}/hermes
WORKSPACE=\${HERMES_ROOT}/workspace
UNIT=/etc/systemd/system/hermes-gateway-boot.service
SCRIPT=/usr/local/bin/hermes-gateway-boot.sh
BACKUP_DIR=/root/backup/hermes-residual-\$(date +%Y%m%d-%H%M%S)

die() { echo "ERROR: \$*" >&2; exit 1; }
need() { command -v "\$1" >/dev/null 2>&1 || die "缺少命令: \$1"; }

[ "\$(id -u)" -eq 0 ] || die "请用 root 执行"
need ss; need curl; need systemctl; need install

id trim.hermes >/dev/null 2>&1 || die "用户 trim.hermes 不存在（请先商店安装 Hermes）"
[ -d "\${APP_ROOT}" ] || die "APP_ROOT 不存在: \${APP_ROOT}"
[ -d "\${HERMES_ROOT}" ] || die "HERMES_ROOT 不存在: \${HERMES_ROOT}"
[ -x "\${APP_ROOT}/runtime/python/bin/hermes" ] || [ -x "\${APP_ROOT}/runtime/python/bin/python3.11.real" ] \\
  || die "找不到 hermes runtime（检查商店安装是否完整）"

echo "==> 1) 备份并禁用冲突常驻 unit"
mkdir -p "\${BACKUP_DIR}"
for u in trim-hermes-gateway hermes-dashboard hermes-gateway; do
  systemctl disable --now "\${u}.service" 2>/dev/null || true
done
for f in \\
  /etc/systemd/system/trim-hermes-gateway.service \\
  /etc/systemd/system/hermes-dashboard.service \\
  /etc/systemd/system/hermes-gateway.service
do
  [ -e "\$f" ] && mv "\$f" "\${BACKUP_DIR}/" || true
done
[ -d /etc/systemd/system/trim-hermes-gateway.service.d ] \\
  && mv /etc/systemd/system/trim-hermes-gateway.service.d "\${BACKUP_DIR}/" || true
# 用户级残留
for f in /etc/systemd/user/hermes-gateway.service \\
         /home/*/ .config/systemd/user/hermes-gateway.service; do
  true
done
systemctl daemon-reload

echo "==> 2) 写入 oneshot unit: \${UNIT}"
install -d -m 755 /etc/systemd/system
cat > "\${UNIT}" <<EOF
[Unit]
Description=Hermes boot assist (OpenClaw-style via shop wrapper + gateway CLI)
After=network-online.target trim_app_center.service trim_connect.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=trim.hermes
Group=trim.hermes
KillMode=none
WorkingDirectory=\${WORKSPACE}
ExecStart=\${SCRIPT}
TimeoutStartSec=180

[Install]
WantedBy=multi-user.target
EOF

echo "==> 3) 写入 boot 脚本: \${SCRIPT}"
cat > "\${SCRIPT}" <<'EOS'
#!/bin/bash
# Hermes boot assist — shop wrapper path + native gateway CLI
set -euo pipefail

GW_PORT=__GW_PORT__
DASH_PORT=__DASH_PORT__
APP_ROOT=__APP_ROOT__
HERMES_ROOT=__HERMES_ROOT__
HERMES_HOME=\${HERMES_ROOT}/hermes
HOME_DIR=\${HERMES_ROOT}/home
WORKSPACE=\${HERMES_ROOT}/workspace
PY_BIN=\${APP_ROOT}/runtime/python/bin
NODE_BIN=\${APP_ROOT}/runtime/python/node/bin
HERMES_BIN=\${PY_BIN}/hermes
PYTHON=\${PY_BIN}/python3.11.real
ENV_FILE=\${HERMES_HOME}/.env
LOG_DIR=\${HERMES_HOME}/logs
LOG_FILE=\${LOG_DIR}/gateway-boot.log
WRAPPER_SOCK=\${APP_ROOT}/run/trim-hermes.sock

mkdir -p "\${LOG_DIR}" "\${WORKSPACE}"
chown trim.hermes:trim.hermes "\${LOG_DIR}" 2>/dev/null || true
exec >>"\${LOG_FILE}" 2>&1
echo "===== \$(date '+%F %T') hermes-gateway-boot start ====="

port_up() {
  local p="\$1"
  ss -lntH "sport = :\${p}" 2>/dev/null | grep -q LISTEN
}

wait_port() {
  local p="\$1" label="\$2" max="\${3:-60}" i
  for i in \$(seq 1 "\${max}"); do
    if port_up "\${p}"; then
      echo "\${label} ready on :\${p} after \${i}s"
      return 0
    fi
    sleep 1
  done
  echo "ERROR: \${label} did not bind :\${p} within \${max}s"
  return 1
}

export HOME="\${HOME_DIR}"
export HERMES_HOME="\${HERMES_HOME}"
export USER=trim.hermes
export LOGNAME=trim.hermes
export PATH="\${PY_BIN}:\${NODE_BIN}:\${HERMES_HOME}/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LD_LIBRARY_PATH="\${PY_BIN}/../system-libs"
export HERMES_MANAGED_BY=trim.hermes
export HERMES_NODE="\${NODE_BIN}/node"
export HERMES_WRITE_SAFE_ROOT="\${WORKSPACE}"
export HERMES_NONINTERACTIVE=1
export HERMES_QUIET=1
export TRIM_APPNAME=trim.hermes
export TRIM_APPDEST="\${APP_ROOT}"
export TRIM_HERMES_DATA_ROOT="\${HERMES_ROOT}"
export TRIM_PKGVAR="\${HERMES_ROOT}"
export TRIM_UID=\$(id -u trim.hermes)
export TRIM_GID=\$(getent group trim.hermes | cut -d: -f3)
export TRIM_USERNAME=trim.hermes
export TRIM_GROUPNAME=trim.hermes
export TRIM_RUN_UID=\${TRIM_UID}
export TRIM_RUN_GID=\${TRIM_GID}
export TRIM_RUN_USERNAME=trim.hermes
export TRIM_RUN_GROUPNAME=trim.hermes
export TRIM_SERVICE_PORT=\${DASH_PORT}

if [ -f "\${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  . "\${ENV_FILE}"
  set +a
  echo "loaded env_file=\${ENV_FILE}"
fi

export HOME="\${HOME_DIR}"
export HERMES_HOME="\${HERMES_HOME}"
export HERMES_MANAGED_BY=trim.hermes
export HERMES_NODE="\${NODE_BIN}/node"
export HERMES_WRITE_SAFE_ROOT="\${WORKSPACE}"
export PATH="\${PY_BIN}:\${NODE_BIN}:\${HERMES_HOME}/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LD_LIBRARY_PATH="\${PY_BIN}/../system-libs"

: "\${HTTP_PROXY:=__HTTP_PROXY__}"
: "\${HTTPS_PROXY:=__HTTPS_PROXY__}"
: "\${http_proxy:=\${HTTP_PROXY}}"
: "\${https_proxy:=\${HTTPS_PROXY}}"
: "\${NO_PROXY:=__NO_PROXY__}"
: "\${no_proxy:=\${NO_PROXY}}"
export HTTP_PROXY HTTPS_PROXY http_proxy https_proxy NO_PROXY no_proxy

cd "\${WORKSPACE}"
export PWD="\${WORKSPACE}"
export TERMINAL_CWD="\${WORKSPACE}"

if [ -x "\${HERMES_BIN}" ]; then
  HCMD=("\${HERMES_BIN}")
else
  HCMD=("\${PYTHON}" -m hermes_cli.main)
fi
echo "hermes_cmd=\${HCMD[*]}"

if [ ! -S "\${WRAPPER_SOCK}" ]; then
  echo "waiting for wrapper sock"
  for i in \$(seq 1 90); do
    [ -S "\${WRAPPER_SOCK}" ] && break
    sleep 1
  done
fi
if [ -S "\${WRAPPER_SOCK}" ] && curl -fsS --unix-socket "\${WRAPPER_SOCK}" -m 3 http://localhost/health >/dev/null 2>&1; then
  echo "wrapper health OK"
else
  echo "WARN: wrapper not healthy yet"
fi

dashboard_owned_by_wrapper() {
  port_up "\${DASH_PORT}" || return 1
  local dpid wpid ppid
  dpid=\$(ss -lntp "sport = :\${DASH_PORT}" 2>/dev/null | sed -n 's/.*pid=\\([0-9]*\\).*/\\1/p' | head -1)
  [ -n "\${dpid}" ] || return 1
  wpid=\$(pgrep -f 'trim-hermes-wrapper' | head -1 || true)
  [ -n "\${wpid}" ] || return 1
  ppid=\$(awk '/^PPid:/{print \$2}' "/proc/\${dpid}/status" 2>/dev/null || true)
  [ "\${ppid}" = "\${wpid}" ]
}

stop_gateway_briefly() {
  echo "temporarily stopping gateway so wrapper preflight can bind-probe :\${GW_PORT}"
  "\${HCMD[@]}" gateway stop >>"\${LOG_DIR}/gateway-boot.log" 2>&1 || true
  local i
  for i in \$(seq 1 20); do
    port_up "\${GW_PORT}" || return 0
    sleep 1
  done
  fuser -k "\${GW_PORT}/tcp" 2>/dev/null || true
  sleep 1
}

start_dashboard_via_wrapper() {
  if [ ! -S "\${WRAPPER_SOCK}" ]; then
    echo "ERROR: no wrapper sock; cannot start shop dashboard"
    return 1
  fi
  if port_up "\${GW_PORT}"; then
    stop_gateway_briefly
  fi
  echo "starting dashboard via shop wrapper admin API"
  curl -fsS --unix-socket "\${WRAPPER_SOCK}" -m 90 \\
    -H 'X-Trim-Isadmin: true' \\
    -o /tmp/hermes-boot-panel.html \\
    "http://localhost/app/trim-hermes/" || true
  wait_port "\${DASH_PORT}" dashboard 45
}

start_gateway_cli() {
  if port_up "\${GW_PORT}"; then
    echo "gateway :\${GW_PORT} already LISTEN — skip"
    return 0
  fi
  echo "starting gateway via hermes CLI"
  setsid "\${HCMD[@]}" gateway run --replace --accept-hooks \\
    >>"\${LOG_DIR}/gateway.log" 2>&1 </dev/null &
  echo "spawned gateway setsid_pid=\$!"
  wait_port "\${GW_PORT}" gateway 60
  curl -fsS -m 3 "http://127.0.0.1:\${GW_PORT}/health" >/dev/null 2>&1 && echo "gateway health 200"
}

if dashboard_owned_by_wrapper; then
  echo "dashboard already owned by wrapper — ok"
elif port_up "\${DASH_PORT}"; then
  echo "dashboard on :\${DASH_PORT} but not wrapper-owned — leave as-is"
else
  start_dashboard_via_wrapper || {
    echo "ERROR: failed to start shop dashboard"
    exit 1
  }
fi

start_gateway_cli || {
  echo "ERROR: failed to start gateway"
  exit 1
}

echo "final:"
ss -lntp "sport = :\${DASH_PORT}" 2>/dev/null | head -n 2 || true
ss -lntp "sport = :\${GW_PORT}" 2>/dev/null | head -n 2 || true
if [ -S "\${WRAPPER_SOCK}" ]; then
  curl -fsS --unix-socket "\${WRAPPER_SOCK}" -m 15 -H 'X-Trim-Isadmin: true' \\
    -o /tmp/hermes-boot-panel-final.html "http://localhost/app/trim-hermes/" || true
  if grep -q 'Hermes Agent - Dashboard' /tmp/hermes-boot-panel-final.html 2>/dev/null; then
    echo "panel page OK (Hermes Agent - Dashboard)"
  elif grep -q 'Hermes could not start' /tmp/hermes-boot-panel-final.html 2>/dev/null; then
    echo "WARN: panel still error page (check preflight ownership)"
  fi
fi
echo "boot assist done"
exit 0
EOS

# 注入路径/端口/代理（避免 heredoc 变量在 root 安装时写死错环境）
sed -i \\
  -e "s|__GW_PORT__|\${GW_PORT}|g" \\
  -e "s|__DASH_PORT__|\${DASH_PORT}|g" \\
  -e "s|__APP_ROOT__|\${APP_ROOT}|g" \\
  -e "s|__HERMES_ROOT__|\${HERMES_ROOT}|g" \\
  -e "s|__HTTP_PROXY__|\${HTTP_PROXY_DEFAULT}|g" \\
  -e "s|__HTTPS_PROXY__|\${HTTPS_PROXY_DEFAULT}|g" \\
  -e "s|__NO_PROXY__|\${NO_PROXY_DEFAULT}|g" \\
  "\${SCRIPT}"
chmod 755 "\${SCRIPT}"

# 可选：把 NO_PROXY 精确 IP 合并进商店 .env（不覆盖已有密钥）
if [ -f "\${HERMES_HOME}/.env" ]; then
  if grep -qE '^[Nn][Oo]_[Pp][Rr][Oo][Xx][Yy]=' "\${HERMES_HOME}/.env"; then
    echo "==> 4) .env 已有 NO_PROXY，请人工确认是精确 IP（勿 CIDR）"
  else
    echo "==> 4) 追加 NO_PROXY 到 hermes/.env"
    {
      echo "NO_PROXY=\${NO_PROXY_DEFAULT}"
      echo "no_proxy=\${NO_PROXY_DEFAULT}"
    } >> "\${HERMES_HOME}/.env"
    chown trim.hermes:trim.hermes "\${HERMES_HOME}/.env" 2>/dev/null || true
  fi
else
  echo "==> 4) 无 .env，跳过（首次打开面板后商店会生成）"
fi

mkdir -p "\${WORKSPACE}" "\${HERMES_HOME}/logs"
chown -R trim.hermes:trim.hermes "\${WORKSPACE}" "\${HERMES_HOME}/logs" 2>/dev/null || true

echo "==> 5) enable + start oneshot"
systemctl daemon-reload
systemctl enable hermes-gateway-boot.service
systemctl start hermes-gateway-boot.service

echo "==> 6) 最小验收"
systemctl is-enabled hermes-gateway-boot.service
systemctl is-active hermes-gateway-boot.service   # 期望 active (exited)
ss -lntH "sport = :\${GW_PORT}" || true
ss -lntH "sport = :\${DASH_PORT}" || true
curl -sf -m 5 "http://127.0.0.1:\${GW_PORT}/health" && echo || echo "WARN: gateway health 未通，看 \${HERMES_HOME}/logs/gateway-boot.log"
echo
echo "备份目录: \${BACKUP_DIR}"
echo "日志: \${HERMES_HOME}/logs/gateway-boot.log"
echo "完成。建议再 reboot 做一次冷启动验收。"
`}</pre>

                    <h3>6.1 一键安装后的 30 秒自检</h3>
                    <pre>{`# unit 应为 oneshot 成功态
systemctl is-active hermes-gateway-boot.service    # active (exited)
systemctl is-enabled hermes-gateway-boot.service   # enabled

# 网关健康
curl -sf http://127.0.0.1:18642/health

# 关键：stop unit 不得杀网关（KillMode=none）
GW_PID=$(ss -lntp 'sport = :18642' | sed -n 's/.*pid=\\([0-9]*\\).*/\\1/p' | head -1)
systemctl stop hermes-gateway-boot.service
sleep 2
ss -lntH 'sport = :18642' | grep -q LISTEN && echo "gateway still up — OK"
curl -sf http://127.0.0.1:18642/health && echo

# 幂等再点一次
systemctl start hermes-gateway-boot.service
tail -n 40 /vol1/@appdata/trim.hermes/hermes/logs/gateway-boot.log`}</pre>

                    <h3>6.2 卸载 / 回滚</h3>
                    <pre>{`systemctl disable --now hermes-gateway-boot.service
# 可选：停网关（会断消息通道）
# runuser -u trim.hermes -- /vol1/@appcenter/trim.hermes/runtime/python/bin/hermes gateway stop
rm -f /etc/systemd/system/hermes-gateway-boot.service /usr/local/bin/hermes-gateway-boot.sh
systemctl daemon-reload
# 若需恢复旧 unit：从 /root/backup/hermes-residual-* 移回后 daemon-reload`}</pre>
                    <p>装完后若只要「开机自启网关」而不关心面板红条，到此即可。若还要面板绿，务必保证 Dashboard 由 wrapper 拉起（脚本已尽量走 admin 路径）；Go 二进制 preflight 无法改时，可能仍出现误报红条，以 <code>/health</code> 与渠道连通为准。</p>

                    <h2>七、运行态验收矩阵（复制到其它主机）</h2>

                    <pre>{`# 1) unit
systemctl cat hermes-gateway-boot.service
systemctl is-enabled hermes-gateway-boot.service   # enabled
systemctl is-active  hermes-gateway-boot.service   # active (exited)  ← oneshot 正常

# 2) 停 unit 不得杀网关（KillMode=none 验收）
GW_PID=$(ss -lntp 'sport = :18642' | sed -n 's/.*pid=\\([0-9]*\\).*/\\1/p' | head -1)
echo "gateway pid before stop: $GW_PID"
sudo systemctl stop hermes-gateway-boot.service
sleep 2
ss -lntH 'sport = :18642' | grep -q LISTEN && echo "gateway still up after stop unit — OK"
curl -sf -m 3 http://127.0.0.1:18642/health && echo

# 3) 进程角色
pgrep -af 'trim-hermes-wrapper|hermes_cli.main|gateway run' | grep -v grep

# 4) 端口（均 loopback）
ss -lntH 'sport = :19119'
ss -lntH 'sport = :18642'

# 5) 健康
curl -sf -m 3 http://127.0.0.1:18642/health
curl -sf -o /dev/null -m 3 -w 'dashboard_%{http_code}\\n' http://127.0.0.1:19119/

# 6) sock / lock / 属主
ls -l /vol1/@appcenter/trim.hermes/run/trim-hermes.sock
ls -l /vol1/@appdata/trim.hermes/hermes/gateway.lock
id trim.hermes
# HERMES_HOME 下文件属主应为 trim.hermes，不是 root

# 7) 日志（勿贴 Token）
tail -n 80 /vol1/@appdata/trim.hermes/hermes/logs/gateway-boot.log
tail -n 50 /vol1/@appdata/trim.hermes/hermes/logs/gateway.log

# 8) 幂等：端口已占再 start 应快速 skip
sudo systemctl start hermes-gateway-boot.service`}</pre>
                    <p>通过标准：Dashboard 与 Gateway 均 loopback 监听；Gateway <code>/health</code> 返回 ok；oneshot 为 <code>active (exited)</code>；stop unit 后网关仍存活；冷启动后无需每次手点面板「启动网关」。附加：<code>ss</code> 看 Dashboard 监听进程的 PPid 最好等于 <code>trim-hermes-wrapper</code>；Gateway 的 PPid 可为 1。systemd 对 <code>KillMode=none</code> 的 deprecation 告警可忽略（当前必要）。</p>

                    <h2>八、NO_PROXY 与代理：Python 生态的硬坑</h2>
                    <p>商店 Hermes 走 Python（httpx / OpenAI SDK）。若 Gateway 需要经内网代理访问外网 LLM，但要把内网 API（如 CLIProxyAPI、其它局域网服务）直连：</p>
                    <ul>
                        <li><code>HTTP(S)_PROXY</code> 指向内网出口（示例 <code>http://192.168.x.x:7890</code>）</li>
                        <li><code>NO_PROXY</code> / <code>no_proxy</code> <strong>必须写精确 IP 列表</strong></li>
                    </ul>
                    <pre>{`# ✅ 正确（示例）
NO_PROXY=localhost,127.0.0.1,192.168.x.2,192.168.x.5,192.168.x.10,::1

# ❌ 错误：httpx/requests 不认
NO_PROXY=localhost,127.0.0.1,192.168.x.0/24,::1     # CIDR
NO_PROXY=localhost,127.0.0.1,192.168.x.*,::1        # 通配
NO_PROXY=localhost,127.0.0.1,192.168.x.,::1         # 前缀`}</pre>
                    <p>错误症状：curl 直连内网 API 200，但 Hermes/Python 调用秒回 502——请求被错误塞给代理，代理拒绝转发内网。改 <code>hermes/.env</code> 与任何 systemd Environment 后记得重启 Gateway 再验。</p>

                    <h2>九、日常维护清单</h2>

                    <h3>9.1 更新商店 Hermes 前</h3>
                    <ol>
                        <li>备份 unit + 脚本 + <code>config.yaml</code> / <code>.env</code>（见下）。</li>
                        <li>优先用 Hermes CLI / 面板优雅停 Gateway，避免安装包替换时占用旧文件。</li>
                        <li>更新后检查 oneshot 两件套是否被覆盖；路径、runtime 是否变化。</li>
                        <li>再 <code>daemon-reload && systemctl start hermes-gateway-boot</code> 做热验收（6.1 / 第七节），必要时 reboot 冷验收。</li>
                    </ol>

                    <h3>9.2 建议备份范围</h3>
                    <pre>{`/etc/systemd/system/hermes-gateway-boot.service
/usr/local/bin/hermes-gateway-boot.sh
/vol1/@appdata/trim.hermes/hermes/config.yaml
/vol1/@appdata/trim.hermes/hermes/.env          # 含密钥，离线加密保存
# 可选：workspace / state，视是否需要会话连续性`}</pre>

                    <h3>9.3 权限铁律</h3>
                    <ul>
                        <li>不要用 root 长期写 <code>HERMES_HOME</code> 下配置/会话文件。</li>
                        <li>修复后统一：<code>chown -R trim.hermes:trim.hermes /vol1/@appdata/trim.hermes</code>（确认路径后再执行）。</li>
                        <li>unit 使用 <code>User=trim.hermes</code> 且 <code>Group=trim.hermes</code>（辅组 gid 与商店运行时对齐）。</li>
                        <li>禁止把另一套 Hermes/OpenClaw 的 HOME 挂到本实例目录。</li>
                    </ul>

                    <h3>9.4 职责边界（避免再踩）</h3>
                    <ul>
                        <li>oneshot：开机代拉 / 幂等补齐，不长期独占抢面板。</li>
                        <li>Dashboard <code>:19119</code>：归商店 wrapper。</li>
                        <li>Gateway <code>:18642</code>：原生 CLI + lock，Hermes 自管。</li>
                        <li>与 OpenClaw 完全独立（端口/用户/进程谱系均无重叠）。</li>
                    </ul>

                    <h2>十、排错速查</h2>
                    <pre>{`| 现象 | 优先检查 | 处置思路 |
|------|----------|----------|
| 面板 already in use :18642 | 是否有常驻 unit/野进程占端口；Dashboard 是否 wrapper 子进程 | 禁掉常驻 unit；必要时脚本短暂 gateway stop 再走 wrapper |
| 面板 already in use :19119 | 是否误启常驻 dashboard unit | disable 并移走 hermes-dashboard.service |
| oneshot 成功但 stop 后网关死了 | unit 是否漏 KillMode=none | 补 KillMode=none 并 daemon-reload |
| unit start timeout | wrapper sock 未起；卷未挂载；TimeoutStartSec 过短 | After=trim_app_center；TimeoutStartSec≥180；查 gateway-boot.log |
| Gateway 502 / 内网 API 秒失败 | NO_PROXY 是否 CIDR/通配 | 改精确 IP；验 Python 侧直连 |
| 权限 denied / 配置写不进 | 目录被 root 污染 | chown 回 trim.hermes |
| 冷启动偶发失败、热启动正常 | App Center / wrapper 未就绪 | 脚本内等 sock；After= 补齐；reboot 回归 |
| 点面板仍红但 /health 200 | wrapper preflight 不认外部已起 api_server | 倾向保自启；或接受先点面板；勿再 Restart=always |`}</pre>

                    <h2>十一、与商店版 OpenClaw 的对照</h2>
                    <pre>{`| 维度 | Hermes（本文） | OpenClaw（姊妹文） |
|------|----------------|--------------------|
| 商店用户 | trim.hermes | trim.openclaw |
| 控制面 | wrapper unix sock + Dashboard :19119 | Monitor unix sock + API |
| 业务端口 | Gateway :18642 | Gateway :25730（示例） |
| systemd 角色 | oneshot 脚本：wrapper 路径 + 原生 CLI 点火 | oneshot bootstrap：Monitor API action=start |
| 禁止项 | 常驻 Restart=always 监管 :18642；常驻抢 :19119 | ensure 直拉 Gateway 与面板抢进程 |
| 跳过条件 | :18642 已 LISTEN 则 skip | 业务端口已 LISTEN 则 skip |
| 共同原则 | App Center 先就绪；不长期抢端口；loopback；独立用户；可冷启动复刻 | 同左 |`}</pre>

                    <h2>十二、其它主机最小复刻 Checklist</h2>
                    <ol>
                        <li>商店安装 Hermes，确认用户 <code>trim.hermes</code> 与 <code>@appcenter / @appdata</code> 路径映射。</li>
                        <li>确认端口：Dashboard <code>19119</code>、Gateway <code>18642</code>（不同则全文替换）。</li>
                        <li><strong>推荐</strong>：改第六节一键脚本顶部 3 处变量后，root 执行整段落地（含清理旧 unit）。</li>
                        <li>或手动：清理旧常驻 → 写入 unit/脚本 → <code>daemon-reload && enable && start</code>。</li>
                        <li>跑 6.1 自检 + 第七节完整矩阵（含 stop unit 不杀网关）。</li>
                        <li><strong>reboot</strong> 冷启动验收。</li>
                        <li>两件套 + 密钥配置纳入备份；更新商店后复查路径与 unit。</li>
                    </ol>

                    <h2>十三、结语</h2>
                    <p>商店版 Hermes 的稳定关键，不在于「多写一个 Restart=always」，而在于<strong>尊重 wrapper 的硬 bind 预检，并让 systemd 只做开机协助</strong>。oneshot + <code>KillMode=none</code> + 商店同用户原生 CLI，能在冷启动后自动带起 Gateway，又尽量不和 App Center 抢生命周期。把 unit、脚本、NO_PROXY 精确 IP 与验收矩阵按本文固化后，换一台 FnOS 也可以完整复刻同一运行环境。</p>
                    <p>若你同时维护商店版 OpenClaw，建议两套 oneshot 引导一起备份、一起做冷启动回归，避免只修一侧、重启后另一侧回归翻车。</p>

                </div>
            </div>
        </section>
    );
}
