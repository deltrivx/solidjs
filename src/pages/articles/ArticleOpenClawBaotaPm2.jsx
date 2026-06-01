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
                    <h1>宝塔插件 OpenClaw 部署实录：从左侧菜单修复到 PM2 迁移与环境变量优化</h1>
                    <p class="article-subtitle">软件商店安装 · 左侧菜单修复 · Node 转 PM2 · 更新按钮环境变量 · 控制面板优化</p>
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
                    <p>OpenClaw（又名 Clawdbot / 龙虾）是一款个人 AI 助手框架，支持接入多种消息平台、安装技能扩展能力。2025 年底，宝塔面板上线了<strong>宿主机安装版 OpenClaw 插件</strong>（非 Docker 版），直接整合到面板中进行安装和管理。</p>
                    <p>本文记录在 TencentOS + 宝塔面板 9.x 环境下安装 OpenClaw 插件后遇到的一系列问题及完整的优化过程。</p>

                    <h2>二、安装与踩坑</h2>

                    <h3>2.1 软件商店安装</h3>
                    <p>打开宝塔面板 → 软件商店 → 搜索「OpenClaw」→ 安装插件。如果搜索不到，需要先点击右上角「更新软件列表」。</p>
                    <p>安装过程中，插件会执行以下操作：</p>
                    <pre>{`# 安装 Node.js（如未安装）
# 全局安装 OpenClaw
npm i -g openclaw

# 启动 Gateway
openclaw gateway start`}</pre>
                    <p>安装完成后，Gateway 默认以 <code>openclaw gateway</code> 进程运行在 <code>0.0.0.0:18789</code>。</p>

                    <h3>2.2 左侧菜单不显示</h3>
                    <p>安装后进入宝塔面板左侧菜单，发现 OpenClaw 插件入口<strong>没有出现</strong>。这是因为插件的菜单注册需要刷新面板缓存。</p>
                    <p>修复方法：</p>
                    <pre>{`# 宝塔面板 → 设置 → 清除缓存
# 或 SSH 执行
bt 9    # 清除面板缓存
bt 16   # 修复面板（可选）`}</pre>
                    <p>清除缓存后刷新页面，左侧菜单即可显示 OpenClaw 入口。</p>

                    <h2>三、开通后能做什么</h2>
                    <p>宝塔插件版 OpenClaw 的面板集成度很高，安装后左侧菜单会显示以下功能模块：</p>
                    <ul>
                        <li><strong>AI 对话</strong>：直接发起对话、切换角色、新建会话，集成默认模型（qwen3.5-plus）</li>
                        <li><strong>角色管理</strong>：新建、编辑角色，支持身份、定义、性格等详细配置</li>
                        <li><strong>模型管理</strong>：添加/编辑/删除模型供应商，设置默认模型</li>
                        <li><strong>技能管理</strong>：已安装技能列表，在线技能市场搜索和安装</li>
                        <li><strong>消息平台</strong>：接入 QQ、飞书、钉钉、企业微信、Telegram</li>
                        <li><strong>服务管理</strong>：查看运行状态、停止/重启、日志、端口、配置文件路径</li>
                        <li><strong>WebUI</strong>：查看启用状态和访问地址</li>
                        <li><strong>安全检查</strong>：安全基线扫描</li>
                    </ul>
                    <p>安装目录位于：</p>
                    <pre>{`/www/server/panel/plugin/openclaw/
├── index.html              # Vue 面板前端
├── openclaw_main.py        # Python 后端
├── install.sh              # 安装脚本
└── info.json               # 插件元信息`}</pre>

                    <h2>四、PM2 在先，插件在后的部署顺序</h2>

                    <h3>4.1 实际部署时间线</h3>
                    <p>这台服务器的实际顺序并非「插件自带 PM2」，而是：</p>
                    <ol>
                        <li><strong>先手动安装 PM2</strong>：用于管理已有的 Node.js 服务进程</li>
                        <li><strong>后从宝塔软件商店安装 OpenClaw 插件</strong></li>
                        <li>插件安装时执行 <code>npm i -g openclaw</code> 安装 OpenClaw 本体</li>
                        <li>用已存在的 PM2 接管 Gateway 进程</li>
                    </ol>

                    <h3>4.2 PM2 管理 Gateway</h3>
                    <pre>{`$ pm2 start openclaw -- gateway --port 18789
$ pm2 save
$ pm2 startup

$ pm2 list
┌────┬───────────┬──────────┬──────┬──────────┬──────┬───────────┐
│ id │ name      │ version  │ pid  │ uptime   │ ↺    │ status    │
├────┼───────────┼──────────┼──────┼──────────┼──────┼───────────┤
│ 2  │ openclaw  │ 2026.5.…│409876│ 3h       │ 23   │ online    │
└────┴───────────┴──────────┴──────┴──────────┴──────┴───────────┘`}</pre>

                    <p><strong>注意 restart 计数（↺=23）</strong>：重启次数过高说明配置有异常，常见原因见第五节。</p>

                    <h3>4.3 重启频繁的根因</h3>
                    <p>通过 PM2 错误日志排查：</p>
                    <pre>{`$ tail -50 /root/.pm2/logs/openclaw-error.log`}</pre>
                    <p>常见原因：</p>
                    <ul>
                        <li><strong>Invalid config</strong>：openclaw.json 包含 schema 不认识的字段（如 capabilities）</li>
                        <li><strong>代理超时</strong>：无法连接 Telegram API，fetch timeout</li>
                        <li><strong>models.json 失步</strong>：openclaw.json 和 models.json 的 providers 不一致</li>
                    </ul>

                    <h2>五、更新按钮与环境变量优化</h2>

                    <h3>5.1 更新按钮的底层逻辑</h3>
                    <p>宝塔插件面板的「检查更新」按钮走的是 <strong>Vue 前端 → Python 后端 → npm → PM2</strong> 链路：</p>
                    <pre>{`宝塔插件面板（点击检查更新）
  → openclaw_main.py（Python）
    → ExecShell("npm update -g openclaw")
      → npm 下载最新包
        → PM2 自动重启应用新版本`}</pre>

                    <h3>5.2 更新失败的原因</h3>
                    <p>更新按钮失效的原因是 <strong>环境变量未透传</strong>。PM2 启动的进程缺少：</p>
                    <ul>
                        <li><code>PATH</code> 不包含 Node.js bin 目录 → 找不到 npm</li>
                        <li><code>NVM_DIR</code> / <code>NVM_BIN</code> 未设置 → npm 找不到全局模块</li>
                        <li>工作目录（cwd）不正确 → OpenClaw 找不到配置文件</li>
                    </ul>

                    <h3>5.3 解决方案：PM2 Ecosystem 配置</h3>
                    <p>创建 <code>ecosystem.config.cjs</code> 确保环境变量完整：</p>
                    <pre>{`module.exports = {
  apps: [{
    name: 'openclaw',
    script: '/www/server/nvm/versions/node/v24.16.0/bin/openclaw',
    args: 'gateway --port 18789',
    cwd: '/root/.openclaw',
    env: {
      NODE_ENV: 'production',
      OPENCLAW_HIDE_BANNER: '1',
      OPENCLAW_GATEWAY_PORT: '18789',
      NVM_DIR: '/www/server/nvm',
      NVM_BIN: '/www/server/nvm/versions/node/v24.16.0/bin',
      PATH: '/www/server/nvm/versions/node/v24.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      http_proxy: 'http://192.168.31.10:7890',
      https_proxy: 'http://192.168.31.10:7890',
      no_proxy: 'localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8',
    },
    error_file: '/root/logs/openclaw-error.log',
    out_file: '/root/logs/openclaw-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_restarts: 10,
    min_uptime: '30s',
    restart_delay: 5000,
  }]
};`}</pre>

                    <p>配置好后重载：</p>
                    <pre>{`pm2 reload openclaw       # 零停机重载
pm2 restart openclaw      # 完全重启`}</pre>

                    <h2>六、Telegram 代理配置</h2>
                    <p>国内服务器无法直连 Telegram API。如果不配置代理，Gateay 日志会反复出现：</p>
                    <pre>{`[fetch-timeout] fetch timeout after 15000ms
[telegram] DNS-resolved IP unreachable
[telegram] transport attempt marked temporarily unhealthy`}</pre>
                    <p>解决方案：在 PM2 environment 中传入代理变量（如上节所示），或在系统级设置：</p>
                    <pre>{`export http_proxy=http://192.168.31.10:7890
export https_proxy=http://192.168.31.10:7890
export no_proxy=localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8`}</pre>

                    <h2>七、完整运维命令</h2>

                    <pre>{`# PM2 管理
pm2 list                           # 查看所有进程
pm2 show openclaw                  # 进程详情
pm2 restart openclaw               # 重启
pm2 reload openclaw                # 零停机重载
pm2 stop openclaw                  # 停止
pm2 delete openclaw                # 删除进程

# 日志
pm2 logs openclaw --lines 100      # 最近日志
pm2 logs openclaw --err            # 错误日志
tail -f /www/server/panel/plugin/openclaw/openclaw_main.log

# 更新
npm update -g openclaw
pm2 restart openclaw               # 应用新版本

# 开机自启
pm2 startup                        # 生成 systemd 单元
pm2 save                           # 保存进程列表

# 宝塔插件维护
bt 9                               # 清除面板缓存
bt 16                              # 修复面板

# 直接访问插件接口
/www/server/panel/plugin/openclaw/openclaw_main.py`}</pre>

                    <h2>八、总结</h2>
                    <p>宝塔插件版 OpenClaw 提供了一个宿主机安装的面板管理方案，但安装后需要解决：</p>
                    <ul>
                        <li><strong>左侧菜单不显示</strong>：清除面板缓存即可恢复</li>
                        <li><strong>进程管理升级</strong>：从裸进程转到 PM2，获得自动重启和日志管理能力</li>
                        <li><strong>更新按钮修复</strong>：通过 PM2 ecosystem 显式设置环境变量，确保 npm update 可执行</li>
                        <li><strong>Telegram 通道</strong>：配置代理环境变量，解决国内服务器无法连接 API 的问题</li>
                        <li><strong>频繁重启排查</strong>：检查 Invalid config、models.json 失步、代理超时等常见原因</li>
                    </ul>
                    <p>这套方案已在 TencentOS + 宝塔面板 9.x 环境中生产运行。</p>

                </div>
            </div>
        </section>
    );
}
