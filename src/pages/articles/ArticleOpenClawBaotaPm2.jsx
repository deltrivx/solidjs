import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function ArticleOpenClawBaotaPm2() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>宝塔插件 OpenClaw 完全指南：安装配置、环境变量优化与 PM2 进程管理</h1>
                    <p class="article-subtitle">宝塔软件商店 · 插件面板管理 · 环境变量透传 · PM2 底层运维 · 更新按钮修复</p>
                    <div class="article-meta">
                        <span class="article-date">2026-06-01</span>
                        <div class="article-tags">
                            <span class="tech-tag">OpenClaw</span>
                            <span class="tech-tag">宝塔面板</span>
                            <span class="tech-tag">PM2</span>
                            <span class="tech-tag">TencentOS</span>
                            <span class="tech-tag">Node.js</span>
                            <span class="tech-tag">运维</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、概述</h2>
                    <p>OpenClaw 提供多种安装方式。对于国内服务器（TencentOS / CentOS）使用者，最便捷的方式是通过<strong>宝塔软件商店</strong>安装插件版 OpenClaw。</p>
                    <p>该方案的特点是：</p>
                    <ul>
                        <li><strong>宝塔插件面板</strong>：一个功能完整的 Vue 面板，集成在宝塔左侧菜单中</li>
                        <li><strong>内置 PM2 管理</strong>：OpenClaw Gateway 由 PM2 守护，自动重启、日志轮转</li>
                        <li><strong>更新按钮</strong>：面板内置「检查更新」功能，可一键升级</li>
                        <li><strong>备份/恢复</strong>：面板自带一键备份与恢复功能</li>
                        <li><strong>技能管理</strong>：支持在线安装/卸载技能（Skills）</li>
                    </ul>

                    <h2>二、安装后的组件结构</h2>

                    <h3>2.1 插件目录</h3>
                    <pre>{`/www/server/panel/plugin/openclaw/
├── index.html           # Vue 编译后的面板前端
├── openclaw_main.py     # Python 后端（宝塔插件接口）
├── install.sh           # 安装脚本
├── info.json            # 插件元信息
├── icon.png
├── rules/               # 安全检测规则
├── data/backup/         # 备份目录
└── clawhub_registry.json`}</pre>

                    <h3>2.2 OpenClaw 核心组件</h3>
                    <pre>{`# 全局安装路径（由插件 install.sh 执行 npm i -g openclaw）
/www/server/nvm/versions/node/v24.16.0/lib/node_modules/openclaw/
└── openclaw.mjs      # 入口
└── dist/             # 编译产物
└── CHANGELOG.md      # 版本记录

# 可执行文件
/usr/local/bin/openclaw -> /www/server/nvm/versions/node/v24.16.0/bin/openclaw
  -> ../lib/node_modules/openclaw/openclaw.mjs

# 数据目录
~/.openclaw/
└── openclaw.json     # 核心配置
└── agents/           # Agent 配置
└── workspace/        # 工作区`}</pre>

                    <h3>2.3 PM2 进程管理</h3>
                    <p>安装后，Gateway 以 PM2 进程形式运行：</p>
                    <pre>{`$ pm2 list
┌────┬───────────┬──────────┬──────┬──────────┬──────┬───────────┐
│ id │ name      │ version  │ pid  │ uptime   │ ↺    │ status    │
├────┼───────────┼──────────┼──────┼──────────┼──────┼───────────┤
│ 2  │ openclaw  │ 2026.5.…│409876│ 3h       │ 23   │ online    │
└────┴───────────┴──────────┴──────┴──────────┴──────┴───────────┘

$ pm2 show openclaw
script path: .../node_modules/openclaw/dist/index.js
script args: gateway --port 18789`}</pre>

                    <p><strong>注意 restart 计数（↺）</strong>：重启次数过多说明有异常（如配置错误、代理超时等）。</p>

                    <h2>三、更新按钮与环境变量优化</h2>

                    <h3>3.1 更新按钮的调用链路</h3>
                    <p>宝塔插件面板的「检查更新」按钮走的是 <strong>Python 后端 → npm update → PM2 重启</strong> 链路：</p>
                    <pre>{`宝塔面板前端 (Vue)
  → openclaw_main.py (Python)
    → ExecShell("npm update -g openclaw")
      → ExecShell("pm2 restart openclaw")
        → Gateway 使用新版本启动`}</pre>

                    <h3>3.2 更新失败的原因</h3>
                    <p>更新按钮可能失效，原因是 npm 更新命令或 PM2 命令缺少正确的<strong>环境变量</strong>：</p>
                    <ul>
                        <li><code>PATH</code> 中缺少 Node.js 的 bin 目录 → 找不到 npm 命令</li>
                        <li>缺少 <code>NVM_BIN</code> / <code>NVM_DIR</code> → npm 找不到全局模块</li>
                        <li>PM2 进程环境变量不完整 → Gateway 启动后配置错误</li>
                        <li>代理变量未设置 → 无法连接 Telegram API</li>
                    </ul>

                    <h3>3.3 解决方案</h3>
                    <p>需要在 PM2 的 ecosystem 或启动环境中显式设置以下变量：</p>

                    <pre>{`# 在 PM2 启动命令或 ecosystem 中配置
export NVM_DIR="/www/server/nvm"
export NVM_BIN="/www/server/nvm/versions/node/v24.16.0/bin"
export PATH="$NVM_BIN:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export OPENCLAW_GATEWAY_PORT="18789"

# 代理变量（如需 Telegram 等外连通道）
export http_proxy="http://192.168.31.10:7890"
export https_proxy="http://192.168.31.10:7890"
export no_proxy="localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8"`}</pre>

                    <p>如果使用 PM2 ecosystem 配置文件：</p>
                    <pre>{`module.exports = {
  apps: [{
    name: 'openclaw',
    script: '/www/server/nvm/versions/node/v24.16.0/bin/openclaw',
    args: 'gateway --port 18789',
    cwd: '/root/.openclaw',
    env: {
      OPENCLAW_HIDE_BANNER: '1',
      OPENCLAW_GATEWAY_PORT: '18789',
      NVM_DIR: '/www/server/nvm',
      NVM_BIN: '/www/server/nvm/versions/node/v24.16.0/bin',
      http_proxy: 'http://192.168.31.10:7890',
      https_proxy: 'http://192.168.31.10:7890',
      no_proxy: 'localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8',
    },
    error_file: '/root/logs/openclaw-error.log',
    out_file: '/root/logs/openclaw-out.log',
    max_restarts: 10,
    min_uptime: '30s',
    restart_delay: 5000,
  }]
};`}</pre>

                    <p>配置后执行：</p>
                    <pre>{`$ pm2 reload openclaw        # 零停机重载
$ pm2 restart openclaw       # 完全重启`}</pre>

                    <h2>四、控制面板优化</h2>

                    <h3>4.1 端口与反代</h3>
                    <p>Gateway 默认监听 <code>0.0.0.0:18789</code>（LAN 模式）。可通过宝塔面板的「反向代理」功能，将域名绑定到该端口：</p>
                    <pre>{`# 宝塔 → 网站 → 添加反向代理
目标 URL: http://127.0.0.1:18789
SSL: 自动申请 Let's Encrypt 证书`}</pre>

                    <p>同时在 openclaw.json 中确保 controlUi 允许跨域来源：</p>
                    <pre>{`"gateway": {
  "port": 18789,
  "bind": "lan",
  "controlUi": {
    "enabled": true,
    "allowedOrigins": ["*"]
  }
}`}</pre>

                    <h3>4.2 安全加固</h3>
                    <ul>
                        <li><strong>Token 认证</strong>：设置 gateway.auth.token</li>
                        <li><strong>设备绑定</strong>：开启设备确认模式</li>
                        <li><strong>禁止 IP 直访</strong>：仅允许通过域名 HTTPS 访问控制面板</li>
                    </ul>

                    <h3>4.3 日志与监控</h3>
                    <pre>{`# PM2 日志管理
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 5

# 实时监控
pm2 monit          # 终端实时面板
pm2 show openclaw  # 进程详情

# 查看日志
pm2 logs openclaw --lines 100
pm2 logs openclaw --err          # 仅错误日志`}</pre>

                    <h2>五、常见问题排查</h2>

                    <h3>5.1 Gateway 频繁重启（↺ 数字过高）</h3>
                    <p>查看 PM2 错误日志：</p>
                    <pre>{`$ tail -50 /root/.pm2/logs/openclaw-error.log`}</pre>
                    <p>常见原因：</p>
                    <ul>
                        <li><strong>Invalid config</strong>：openclaw.json 或 models.json 包含 schema 不认识的字段</li>
                        <li><strong>端口被占用</strong>：18789 被其他进程占用</li>
                        <li><strong>models.json 失步</strong>：openclaw.json 和 models.json 的 providers 列表不一致</li>
                        <li><strong>代理超时</strong>：Telegram/DingTalk 初始化时 fetch timeout</li>
                    </ul>

                    <h3>5.2 Telegram 通道无响应</h3>
                    <p>国内服务器无法直连 Telegram API，必须配置代理环境变量。在 PM2 ecosystem 中填入正确的 <code>http_proxy</code> 即可。</p>

                    <h3>5.3 更新后版本号未变</h3>
                    <pre>{`# 清除 npm 缓存重试
npm cache clean --force
npm install -g openclaw@latest

# 强制指定版本
npm install -g openclaw@2026.5.30

# 验证
openclaw --version
pm2 restart openclaw`}</pre>

                    <h2>六、完整运维命令</h2>

                    <pre>{`# 进程管理
pm2 list                        # 查看所有进程
pm2 show openclaw               # 进程详情
pm2 restart openclaw            # 重启
pm2 reload openclaw             # 零停机重载
pm2 stop openclaw               # 停止
pm2 delete openclaw             # 删除进程记录

# 日志
pm2 logs openclaw --lines 100   # 最近日志
pm2 logs openclaw --err         # 错误日志

# 更新
npm update -g openclaw          # npm 更新
pm2 restart openclaw            # 应用新版本

# 开机自启
pm2 startup                     # 生成 systemd 单元
pm2 save                        # 保存进程列表

# 资源监控
pm2 monit                       # 实时监控面板

# 宝塔插件接口
/www/server/panel/plugin/openclaw/openclaw_main.py  # Python 后端
/www/server/panel/plugin/openclaw/index.html        # Vue 前端`}</pre>

                    <h2>七、总结</h2>
                    <p>宝塔插件版 OpenClaw 提供了一个开箱即用的方案：</p>
                    <ul>
                        <li>安装即用：宝塔软件商店一键安装，底层 PM2 自动守护</li>
                        <li>面板管理：技能安装、模型配置、安全扫描、备份恢复一应俱全</li>
                        <li>更新修复：配置正确的环境变量后，面板更新按钮可正常使用</li>
                        <li>运维体系：PM2 + npm + 宝塔面板三位一体</li>
                    </ul>
                    <p>这套方案已在 TencentOS + 宝塔面板 9.x 环境中生产运行，适合国内服务器用户。</p>

                </div>
            </div>
        </section>
    );
}
