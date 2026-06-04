import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function ArticleMemoryEmbedOllama() {
    onMount(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        window.scrollTo(0, 0);
    });

    return (
        <section id="article-detail">
            <div class="article-container reveal">
                <A href="/articles" class="back-link">← 返回文章列表</A>
                <div class="article-header">
                    <h1>OpenClaw 记忆优化实战：Ollama Embedding + memory-core 本地化部署</h1>
                    <p class="article-subtitle">Nomic Embed Text · Ollama 容器 · 多 OpenClaw 实例 provider 统一管理 · memory-core 语义搜索</p>
                    <div class="article-meta">
                        <span class="article-date">2026-06-01</span>
                        <div class="article-tags">
                            <span class="tech-tag">OpenClaw</span>
                            <span class="tech-tag">Ollama</span>
                            <span class="tech-tag">FnOS</span>
                            <span class="tech-tag">Docker</span>
                            <span class="tech-tag">Embedding</span>
                            <span class="tech-tag">Memory-Core</span>
                            <span class="tech-tag">Nomic</span>
                        </div>
                    </div>
                </div>
                <div class="article-content">

                    <h2>一、缘起：OpenAI 不可用之后</h2>
                    <p>OpenClaw 的 <code>memory-core</code> 插件负责对话记忆、语义搜索和 dreaming。默认使用 OpenAI <code>text-embedding-3-small</code> 作为嵌入模型。</p>
                    <p>但由于网络限制 + API 配额耗尽，OpenAI 嵌入接口持续返回 503，导致：</p>
                    <ul>
                        <li>记忆搜索（memory search）不可用</li>
                        <li>Dreaming 自动摘要无法写入</li>
                        <li>语义向量库（sqlite-vec）无法增量更新</li>
                    </ul>
                    <p>解决方案：用本地 Ollama 容器中的 <code>nomic-embed-text</code> 模型替代 OpenAI 嵌入服务，单机运行，零费用。</p>

                    <h2>二、整体架构</h2>
                    <p>本文涉及三个 OpenClaw 实例和一个 Ollama 容器：</p>

                    <pre>{`                          ┌───────────────────┐
                          │  Ollama Container  │
                          │  nomic-embed-text  │
                          │  127.0.0.1:11434   │
                          └────────┬──────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               ▼                   ▼                   ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  TencentOS 本机  │ │ FnOS Docker  │ │ FnOS 商店版      │
    │  del_openclaw_bot│ │del_xiaoxia_bot│ │ del_jinger_bot   │
    └──────────────────┘ └──────────────┘ └──────────────────┘`}</pre>

                    <p>三个独立的 OpenClaw 实例各自连接同一个 Ollama 容器，由 <code>memorySearch</code> 配置统一指向。Ollama 不参与对话推理，仅提供向量化嵌入服务。</p>

                    <h2>三、Ollama 容器部署</h2>

                    <h3>3.1 Docker Compose</h3>
                    <pre>{`services:
  ollama:
    container_name: ollama
    image: ollama/ollama:0.30.0-rc31
    restart: always
    network_mode: host
    hostname: ollama
    environment:
      - TZ=Asia/Shanghai
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_NUM_PARALLEL=4
      - OLLAMA_MAX_LOADED_MODELS=2
    volumes:
      - ./data:/root/.ollama
    cpus: 2
    mem_limit: 2g`}</pre>

                    <p>注意事项：</p>
                    <ul>
                        <li><strong>不要挂载 /dev/dri 设备</strong>：Intel 核显在 LLM 推理中反而慢于 CPU，Ollama 0.30 会自动丢弃 iGPU</li>
                        <li><strong>CPU 限额设为 2 核足够</strong>：embedding 模型仅 137M 参数，推理极快，单次毫秒级</li>
                        <li><strong>内存 2G 足够</strong>：nomic-embed-text 加载仅占 ~300MB</li>
                        <li><strong>network_mode: host</strong>：方便其他容器/主机通过 localhost 访问</li>
                        <li><strong>cgroup v2 警告</strong>：0.30 版本已修复</li>
                    </ul>

                    <h3>3.2 拉取嵌入模型</h3>
                    <pre>{`# 进入容器
docker exec -it ollama ollama pull nomic-embed-text

# 验证
curl http://127.0.0.1:11434/api/tags
# 输出应包含 nomic-embed-text (274MB, embedding-capable)

# 测试嵌入
curl http://127.0.0.1:11434/api/embed \\
  -d '{"model":"nomic-embed-text","input":["测试消息"]}'
# 输出: embeddings: 1x768`}</pre>

                    <p><code>nomic-embed-text</code> 是一个 137M 参数的 BERT 类模型，输出 768 维向量，完全本地运行，满足语义搜索需求。</p>

                    <h2>四、OpenClaw Provider 统一管理</h2>

                    <h3>4.1 核心概念</h3>
                    <p>OpenClaw 有两层模型配置：</p>
                    <ul>
                        <li><strong>openclaw.json</strong> → <code>models.providers</code> 是权威配置源</li>
                        <li><strong>models.json</strong> → 由 openclaw.json 通过 merge 模式生成的运行时产物</li>
                    </ul>
                    <p>两个文件的结构是完全一致的，只是存放位置不同。修改时必须同时保持两者同步。</p>

                    <h3>4.2 配置 Ollama Provider</h3>
                    <p>在 openclaw.json 和 models.json 的 providers 中添加：</p>
                    <pre>{`"ollama": {
  "baseUrl": "http://127.0.0.1:11434/v1",
  "apiKey": "ollama",
  "api": "openai-completions",
  "models": [
    {
      "id": "nomic-embed-text",
      "name": "nomic-embed-text",
      "input": ["text"]
    }
  ]
}`}</pre>
                    <p>注意：</p>
                    <ul>
                        <li>Ollama 不需要真实 API Key，填入任意占位即可</li>
                        <li>baseUrl 使用 <code>/v1</code> 后缀以兼容 OpenAI 接口格式</li>
                        <li><code>models</code> 列表填入 nomic-embed-text，使 OpenClaw 能自动发现嵌入模型</li>
                        <li>不要加 <code>capabilities</code> 字段——旧版 schema 不识别</li>
                    </ul>

                    <h3>4.3 memorySearch 配置</h3>
                    <p>在 agents.defaults 中配置 memorySearch：</p>
                    <pre>{`"memorySearch": {
  "provider": "ollama",
  "model": "nomic-embed-text"
}`}</pre>

                    <p>显式指定 <code>model</code> 是可选的——memory-core 能自动发现 provider 下的嵌入模型，但显式指定更安全可靠。</p>

                    <h3>4.4 不显示在模型切换列表</h3>
                    <p>Ollama 只用于嵌入，不应出现在对话模型的切换列表中。做法是不把 ollama/nomic-embed-text 加入 <code>agents.defaults.models</code> allowlist：</p>
                    <pre>{`"models": {
  "longcat-flash/LongCat-2.0-Preview": {},
  "openai/mimo-v2.5-pro": {},
  "openai/mimo-v2.5": {},
  "anthropic/claude-sonnet-4-6": {},
  // ... 不含 ollama
}`}</pre>

                    <p>ollama 保留在 <code>models.providers</code> 中供 embedding 使用，但在 allowlist 中不出现，模型切换器就不会展示它。</p>

                    <h2>五、多 OpenClaw 实例统一管理</h2>

                    <h3>5.1 实例总结</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>实例</th>
                                <th>Host</th>
                                <th>用户</th>
                                <th>Telegram Bot</th>
                                <th>端口</th>
                                <th>Embedding</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>TencentOS 本机</td>
                                <td>TentcentOS</td>
                                <td>root</td>
                                <td>del_openclaw_bot</td>
                                <td>18789</td>
                                <td>Ollama (192.168.31.2)</td>
                            </tr>
                            <tr>
                                <td>FnOS Docker</td>
                                <td>FnOS</td>
                                <td>root (容器内)</td>
                                <td>del_xiaoxia_bot</td>
                                <td>host 网络</td>
                                <td>Ollama (127.0.0.1)</td>
                            </tr>
                            <tr>
                                <td>FnOS 商店版</td>
                                <td>FnOS</td>
                                <td>trim.openclaw</td>
                                <td>del_jinger_bot</td>
                                <td>25730 (loopback)</td>
                                <td>Ollama (127.0.0.1)</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>5.2 Provider 同步策略</h3>
                    <p>多个实例使用同一套 provider 配置时，必须确保：</p>
                    <ul>
                        <li>两个文件都要改：<code>openclaw.json</code> 中的 <code>models.providers</code></li>
                        <li>和 <code>models.json</code> 中的 <code>providers</code></li>
                        <li>两个文件顺序也要一致</li>
                    </ul>

                    <p>推荐做法：先改 openclaw.json，然后</p>
                    <pre>{`# Python 同步两文件
import json
with open('openclaw.json') as f:
    cfg = json.load(f)
with open('models.json') as f:
    m = json.load(f)
# 复制 providers 并保持顺序
order = list(cfg['models']['providers'].keys())
m['providers'] = {k: m['providers'][k]
    for k in order if k in m['providers']}
# 补缺失的
for k in order:
    if k not in m['providers']:
        m['providers'][k] = cfg['models']['providers'][k]
with open('models.json', 'w') as f:
    json.dump(m, f, indent=2)`}</pre>

                    <p>注意：不要手动分别编辑两个文件，否则配置会失步导致 Gateway 报 Invalid config。</p>

                    <h3>5.3 ollama 地址差异</h3>
                    <p>同一个 Ollama 容器在不同实例中地址不同：</p>
                    <ul>
                        <li><strong>TencentOS 本机</strong>：<code>http://192.168.31.2:11434/v1</code>（跨主机访问）</li>
                        <li><strong>FnOS 上实例（Docker/商店版）</strong>：<code>http://127.0.0.1:11434/v1</code>（同机 localhost）</li>
                    </ul>
                    <p>这是唯一需要区分的地方，其余配置完全一致。</p>

                    <h2>六、Telegram 通道问题排查</h2>

                    <h3>6.1 代理依赖</h3>
                    <p>所有 OpenClaw 实例的 Telegram API 请求都经过代理 <code>192.168.31.10:7890</code>（某内网代理节点）。代理不稳时会表现为：</p>
                    <ul>
                        <li><code>fetch timeout after 15000ms</code></li>
                        <li><code>deleteWebhook failed: Network request failed</code></li>
                        <li><code>sendChatAction failed: Network request failed</code></li>
                        <li>Bot 看起来"没反应"</li>
                    </ul>

                    <p>Docker 版和商店版都需要在启动环境中设置代理变量：</p>
                    <pre>{`export http_proxy=http://192.168.31.10:7890
export https_proxy=http://192.168.31.10:7890
export no_proxy=localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8`}</pre>

                    <h3>6.2 Ingress 队列卡死</h3>
                    <p>容器重启时，若 Telegram 消息正在处理，会留下 <code>.json.processing</code> 锁文件阻塞后续所有消息：</p>
                    <pre>{`ingress-spool-default/
├── 0000000220042926.json.processing  ← ⛔ 锁残留
├── 0000000220042927.json             ← 排队等待
├── 0000000220042930.json  ("刚刚回复我了吗")
├── 0000000220042933.json  ("embedding接入成功了吗？")`}</pre>

                    <p>修复方法：删除锁文件即可自动恢复。</p>
                    <pre>{`find /telegram/ingress-spool-default/ \\
  -name '*.processing' -mmin +5 -delete`}</pre>

                    <h2>七、效果验证</h2>

                    <p>配置完成后，memory-core 的 embedding 状态从 unavailable 变为 ready：</p>
                    <pre>{`变更前:
  Provider: openai  (requested: openai)
  Model: text-embedding-3-small
  Embeddings: unavailable ❌
  Error: 503 Service Unavailable

变更后:
  Provider: ollama  (requested: ollama)
  Model: nomic-embed-text
  Embeddings: ready ✅`}</pre>

                    <p>此外还可通过 API 直接验证：</p>
                    <pre>{`$ curl http://127.0.0.1:11434/api/embed \\
  -d '{"model":"nomic-embed-text","input":["测试消息"]}'
→ embeddings: 1 x 768`}</pre>

                    <p>768 维向量正确返回，sqlite-vec 语义搜索库即可正常工作。</p>

                    <h2>八、总结</h2>
                    <p>通过将 OpenAI 嵌入模型替换为本地 Ollama 的 nomic-embed-text，实现了：</p>
                    <ul>
                        <li><strong>零成本</strong>：完全本地运行，无 API 调用费用</li>
                        <li><strong>零延迟</strong>：同机推理，毫秒级返回</li>
                        <li><strong>统一管理</strong>：三个 OpenClaw 实例共享同一嵌入服务</li>
                        <li><strong>Provider 维护规范</strong>：openclaw.json 与 models.json 保持同步，避免 Invalid config</li>
                        <li><strong>高可用</strong>：避免 OpenAI 503 导致记忆服务中断</li>
                    </ul>

                    <p>同时本文也记录了多 OpenClaw 实例的统一管理模式、Telegram 通道常见问题及修复方法，可作为 FnOS 上 OpenClaw 运维的参考。</p>

                </div>
            </div>
        </section>
    );
}
