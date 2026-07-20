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
                    <h1>飞牛系统商店版 Hermes 启动优化实战：与 App Center 共存的 systemd 引导</h1>
                    <p class="article-subtitle">trim.hermes · trim-hermes-wrapper · dashboard :19119 · gateway :18642 · drop-in 20-boot-order · 可复刻维护清单</p>
                    <div class="article-meta">
                        <span class="article-date">2026-07-20</span>
                        <div class="article-tags">
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">Hermes</span>
                            <span class="tech-tag">systemd</span>
                            <span class="tech-tag">App Center</span>
                            <span class="tech-tag">Gateway</span>
                            <span class="tech-tag">维护</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、写在前面：本文解决什么问题</h2>
                    <p>飞牛系统（FnOS）商店版 Hermes 不是「随便起一个 Python 进程」这么简单。商店侧会由 App Center 拉起 <code>trim-hermes-wrapper</code>，wrapper 会先做<strong>端口预检</strong>（对 <code>:18642</code> 做硬绑定探测），再起 Dashboard。若 systemd 抢在预检前把 Hermes Gateway 拉起来，面板常见现象是：</p>
                    <ul>
                        <li>面板显示 “Hermes could not start” / 502</li>
                        <li>wrapper 报 “port not available”</li>
                        <li>Gateway 其实在跑，但商店生命周期与 systemd 互相抢端口</li>
                    </ul>
                    <p>本文记录一套在真实 FnOS 上已验证可复用的方案：用 <code>trim-hermes-gateway.service</code> + drop-in <code>20-boot-order.conf</code>，在<strong>不破坏商店 wrapper</strong>的前提下稳定拉起 Gateway，并给出可迁移到其它主机的路径、端口、验证与维护清单。</p>
                    <p>与商店版 OpenClaw 优化同属「App Center 范式」：systemd 只做引导/兜底，生命周期尽量与面板一致。OpenClaw 侧见 <A href="/article/fnos-openclaw-store-optimization">飞牛系统商店版 OpenClaw 优化实战</A>。</p>
                    <p>本文所有域名、Token、真实内网地址均做脱敏。示例中的 <code>example.com</code>、<code>192.168.x.x</code>、<code>&lt;TOKEN&gt;</code> 请替换为你自己的环境。商店用户名 <code>trim.hermes</code> 为 FnOS 常见约定，可按实际保留。</p>

                    <h2>二、目标架构</h2>
                    <pre>{`FnOS App Center / trim_app_center
  → /var/apps/trim.hermes
    → wrapper: trim-hermes-wrapper
         --socket  /vol1/@appcenter/trim.hermes/run/trim-hermes.sock
         --dashboard-host 127.0.0.1
         --dashboard-port 19119
         --app-root  /vol1/@appcenter/trim.hermes
         --data-root /vol1/@appdata/trim.hermes
      → preflightRuntimePorts（硬绑定探测 :18642）
      → Dashboard: 127.0.0.1:19119

systemd: trim-hermes-gateway.service （enabled）
  base unit: hermes gateway run --replace --accept-hooks
  drop-in 20-boot-order.conf:
    After/Wants=trim_app_center.service
    ExecCondition: :18642 已 LISTEN 则跳过（不抢已有 Gateway）
    ExecStartPre: 最多 90s 等待 http://127.0.0.1:19119/ 就绪
                  （证明 wrapper 预检已过、不会再硬绑 :18642）
    Restart=on-failure（避免 clean SIGTERM 被 always 重启刷屏）

Hermes Gateway
  → 127.0.0.1:18642  （loopback）
  → User=trim.hermes · HERMES_HOME=/vol1/@appdata/trim.hermes/hermes`}</pre>

                    <p>关键设计原则：</p>
                    <ul>
                        <li><strong>先 Dashboard、后 Gateway</strong>：Dashboard 起来说明 wrapper 预检已完成。</li>
                        <li><strong>端口已占用则跳过</strong>：App Center 或其它实例已占 <code>:18642</code> 时，systemd 不硬抢。</li>
                        <li><strong>商店用户运行</strong>：全程 <code>trim.hermes</code>，避免 root 污染权限。</li>
                        <li><strong>Gateway 优先 loopback</strong>：外网入口走反代 / Tunnel，不直暴进程端口。</li>
                        <li><strong>drop-in 可回滚</strong>：只覆盖启动顺序与条件，不改业务二进制。</li>
                    </ul>

                    <h2>三、路径与运行环境定位</h2>
                    <p>复刻前先在目标机核对（路径可能随卷名略有差异）：</p>
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
  run/trim-hermes.sock

# 数据（配置、日志、工作区）
/vol1/@appdata/trim.hermes/
  hermes/                 # HERMES_HOME
  hermes/config.yaml
  hermes/.env
  hermes/logs/gateway.log
  home/
  workspace/
  trim.hermes.log
  trim.hermes.pid

# systemd
/etc/systemd/system/trim-hermes-gateway.service
/etc/systemd/system/trim-hermes-gateway.service.d/20-boot-order.conf`}</pre>

                    <p>端口约定（本机已验证，其它主机可按商店默认改，但全文需一致）：</p>
                    <pre>{`| 组件              | 地址              | 说明                    |
|-------------------|-------------------|-------------------------|
| Hermes Dashboard  | 127.0.0.1:19119   | wrapper 拉起的面板      |
| Hermes Gateway    | 127.0.0.1:18642   | 消息网关 / API 主端口   |
| wrapper unix sock | .../run/trim-hermes.sock | App Center 通信      |`}</pre>

                    <h2>四、根因：为什么「直接 systemd 起 Gateway」会翻车</h2>
                    <ol>
                        <li><code>trim_app_center</code> 拉起 <code>trim-hermes-wrapper</code>。</li>
                        <li>wrapper 在启动 Dashboard 前执行端口预检：对 <code>:18642</code> <strong>硬绑定测试</strong>。</li>
                        <li>若此时 systemd 已把 Gateway 绑在 <code>:18642</code>，预检失败 → 面板 502 / “could not start”。</li>
                        <li>即便你手动再起一次 Gateway，面板生命周期仍可能认为启动失败。</li>
                    </ol>
                    <p>因此正确顺序是：</p>
                    <pre>{`trim_app_center → wrapper 预检完成 → Dashboard :19119 可访问
  → 再允许 systemd 执行 hermes gateway run
  → Gateway :18642 LISTEN
  → wrapper ensure 循环通过 dashboard API 发现 gateway 已在跑`}</pre>

                    <h2>五、可复刻配置（其它主机按此落地）</h2>

                    <h3>5.1 base unit（示例）</h3>
                    <p>路径写入 <code>/etc/systemd/system/trim-hermes-gateway.service</code>。代理环境按你的出口改；没有代理可删相关行。</p>
                    <pre>{`[Unit]
Description=Hermes Gateway for Telegram/QQBot
Documentation=man:systemd.service(5)
Wants=network-online.target
After=network-online.target trim_connect.service

[Service]
Type=simple
User=trim.hermes
Group=trim.hermes
WorkingDirectory=/vol1/@appdata/trim.hermes

Environment=HOME=/vol1/@appdata/trim.hermes/home
Environment=HERMES_HOME=/vol1/@appdata/trim.hermes/hermes
Environment=PATH=/vol1/@appcenter/trim.hermes/runtime/python/bin:/vol1/@appcenter/trim.hermes/runtime/python/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=HTTP_PROXY=http://192.168.x.x:7890
Environment=HTTPS_PROXY=http://192.168.x.x:7890
Environment=http_proxy=http://192.168.x.x:7890
Environment=https_proxy=http://192.168.x.x:7890
Environment=NO_PROXY=localhost,127.0.0.1,192.168.x.0/24,::1
Environment=no_proxy=localhost,127.0.0.1,192.168.x.0/24,::1

ExecStart=/vol1/@appcenter/trim.hermes/runtime/python/bin/hermes gateway run --replace --accept-hooks
ExecStartPost=/bin/bash -c "for i in {1..30}; do ss -lntH sport = :18642 | grep -q LISTEN && exit 0; sleep 1; done; exit 1"
Restart=always
RestartSec=5
KillMode=process
TimeoutStartSec=45
TimeoutStopSec=20
StandardOutput=append:/vol1/@appdata/trim.hermes/hermes/logs/gateway.log
StandardError=append:/vol1/@appdata/trim.hermes/hermes/logs/gateway.log

[Install]
WantedBy=multi-user.target`}</pre>

                    <h3>5.2 drop-in：与 wrapper 共存（核心）</h3>
                    <p>路径：<code>/etc/systemd/system/trim-hermes-gateway.service.d/20-boot-order.conf</code></p>
                    <pre>{`# Drop-in: coexist with trim_app_center's trim-hermes-wrapper
#
# Root cause:
#   wrapper preflight hard-binds :18642. If systemd starts gateway first,
#   panel shows "Hermes could not start" / 502.
#
# Fix: wait until dashboard :19119 is up (preflight finished),
#      then start gateway; skip if :18642 already LISTEN.

[Unit]
After=trim_app_center.service
Wants=trim_app_center.service

[Service]
ExecCondition=/bin/bash -c '! ss -lntH sport = :18642 | grep -q LISTEN'

ExecStartPre=/bin/bash -c 'for i in $(seq 1 90); do curl -sf -o /dev/null -m 2 http://127.0.0.1:19119/ && exit 0; sleep 1; done; echo "dashboard never came up on :19119, starting gateway anyway" >&2; exit 0'

Restart=on-failure
TimeoutStopSec=60s`}</pre>

                    <h3>5.3 启用与加载</h3>
                    <pre>{`sudo systemctl daemon-reload
sudo systemctl enable trim-hermes-gateway.service
# 冷启动验证建议 reboot 一次；热验证可用：
sudo systemctl restart trim_app_center.service
# 待 Dashboard 起来后再：
sudo systemctl restart trim-hermes-gateway.service`}</pre>

                    <h2>六、运行态验收矩阵（复制到其它主机）</h2>
                    <pre>{`# 1) unit / drop-in
systemctl cat trim-hermes-gateway.service
systemctl is-enabled trim-hermes-gateway.service   # enabled
systemctl is-active  trim-hermes-gateway.service   # active (running)

# 2) 进程角色
# wrapper + dashboard + gateway 分属不同 PID
ps aux | grep -E 'trim-hermes-wrapper|hermes_cli.main' | grep -v grep

# 3) 端口
ss -lntH 'sport = :19119'    # Dashboard loopback
ss -lntH 'sport = :18642'    # Gateway loopback

# 4) Dashboard HTTP
curl -sf -o /dev/null -m 3 http://127.0.0.1:19119/ && echo dashboard_ok

# 5) sock
ls -l /vol1/@appcenter/trim.hermes/run/trim-hermes.sock

# 6) 属主
id trim.hermes
# 数据目录属主应为 trim.hermes，而不是 root

# 7) 日志（只看结构，勿贴 Token）
tail -n 50 /vol1/@appdata/trim.hermes/hermes/logs/gateway.log`}</pre>
                    <p>通过标准：Dashboard 与 Gateway 均 loopback 监听；unit active；面板不再 502；冷启动后无需人工再点一次「启动」。</p>

                    <h2>七、日常维护清单</h2>

                    <h3>7.1 更新商店 Hermes 前</h3>
                    <ol>
                        <li>备份 unit + drop-in + 数据目录关键文件（见下节）。</li>
                        <li>优先在面板停止/优雅停 Gateway，避免安装包替换时仍占用旧文件。</li>
                        <li>更新后检查 drop-in 是否被商店安装覆盖；若覆盖，重新放下 <code>20-boot-order.conf</code> 并 <code>daemon-reload</code>。</li>
                    </ol>

                    <h3>7.2 建议备份范围</h3>
                    <pre>{`/etc/systemd/system/trim-hermes-gateway.service
/etc/systemd/system/trim-hermes-gateway.service.d/20-boot-order.conf
/vol1/@appdata/trim.hermes/hermes/config.yaml
/vol1/@appdata/trim.hermes/hermes/.env          # 含密钥，离线加密保存
# 可选：workspace / state，视你是否需要会话连续性`}</pre>

                    <h3>7.3 代理与 NO_PROXY</h3>
                    <p>若 Gateway 需要经内网代理访问外网 LLM/渠道，请同时配置：</p>
                    <ul>
                        <li><code>HTTP(S)_PROXY</code> 指向内网出口</li>
                        <li><code>NO_PROXY</code> 必须包含 <code>localhost,127.0.0.1</code> 与内网网段，避免把 Dashboard/loopback 请求拐走</li>
                    </ul>

                    <h3>7.4 权限铁律</h3>
                    <ul>
                        <li>不要用 root 长期写 <code>HERMES_HOME</code> 下配置/会话文件。</li>
                        <li>修复后统一：<code>chown -R trim.hermes:trim.hermes /vol1/@appdata/trim.hermes</code>（确认路径后再执行）。</li>
                        <li>禁止把另一套 Hermes/OpenClaw 的 HOME 挂到本实例目录。</li>
                    </ul>

                    <h3>7.5 日志与重启策略</h3>
                    <ul>
                        <li>base unit 若写 <code>Restart=always</code>，建议由 drop-in 改为 <code>on-failure</code>，减少 clean exit / 面板停服时的无意义重启。</li>
                        <li>网关日志路径：<code>.../hermes/logs/gateway.log</code>；商店侧还有 <code>trim.hermes.log</code>。</li>
                        <li>渠道断线重连（如 QQBot websocket 4009）属渠道侧常见现象，与启动顺序无关；单独看渠道配置与网络。</li>
                    </ul>

                    <h2>八、排错速查</h2>
                    <pre>{`| 现象                         | 优先检查                                      | 处置思路 |
|------------------------------|-----------------------------------------------|----------|
| 面板 502 / could not start   | 启动瞬间 :18642 是否被 systemd 抢占           | 加强 After + ExecStartPre 等 Dashboard |
| unit failed / start timeout  | Dashboard 是否 90s 内未起；磁盘卷是否未挂载   | 查 trim_app_center、卷就绪、延长等待 |
| ExecCondition 失败直接跳过   | 已有进程占用 :18642                           | ss/lsof 查占用；确认是否要复用已有进程 |
| 权限 denied / 配置写不进     | 目录属主是否被 root 污染                      | chown 回 trim.hermes                 |
| 外网可通但面板异常           | 是否把 Gateway 绑到了 0.0.0.0 且与预检冲突    | 保持 loopback；外网走反代            |
| 冷启动偶发失败、热启动正常   | After= 是否漏了 trim_app_center               | 补 drop-in 并 reboot 验证            |`}</pre>

                    <h2>九、与商店版 OpenClaw 的对照（方便一套运维习惯）</h2>
                    <pre>{`| 维度           | Hermes（本文）                         | OpenClaw（旧文）                              |
|----------------|----------------------------------------|-----------------------------------------------|
| 商店用户       | trim.hermes                            | trim.openclaw                                 |
| 面板/控制面    | wrapper + Dashboard :19119             | Monitor unix sock + API                       |
| 业务端口       | Gateway :18642                         | Gateway :25730                                |
| systemd 角色   | 条件等待后直接 gateway run             | oneshot bootstrap → Monitor API action=start  |
| 跳过条件       | :18642 已 LISTEN                       | :25730 已 LISTEN                              |
| drop-in 名字   | 20-boot-order.conf                     | 20-boot-order.conf                            |
| 共同原则       | App Center 先就绪；不抢端口；loopback；独立用户 | 同左 |`}</pre>

                    <h2>十、其它主机最小复刻步骤（Checklist）</h2>
                    <ol>
                        <li>商店安装 Hermes，确认用户 <code>trim.hermes</code> 与路径映射存在。</li>
                        <li>确认默认端口：Dashboard <code>19119</code>、Gateway <code>18642</code>（若不同，全文替换）。</li>
                        <li>写入 base unit + drop-in，<code>daemon-reload && enable</code>。</li>
                        <li>配置代理 / <code>NO_PROXY</code>（如需要）。</li>
                        <li><strong>reboot</strong> 做冷启动验证（比热重启更能暴露顺序问题）。</li>
                        <li>跑第六节验收矩阵，全部打勾再投入生产。</li>
                        <li>把 unit/drop-in 与密钥配置纳入备份计划。</li>
                    </ol>

                    <h2>十一、结语</h2>
                    <p>商店版 Hermes 的稳定关键，不在于「多写一个 restart」，而在于<strong>尊重 wrapper 的端口预检时序</strong>。用 Dashboard 就绪作为信号、用端口占用作为跳过条件，就能让 systemd 与 App Center 共存，而不是互抢。把 unit、drop-in、路径和验收矩阵按本文固化后，换一台 FnOS 也可以在一小时内复刻出相同效果。</p>
                    <p>若你同时维护商店版 OpenClaw，建议两套 drop-in 一起备份、一起做冷启动回归，避免只修一侧、重启后另一侧回归翻车。</p>

                </div>
            </div>
        </section>
    );
}
