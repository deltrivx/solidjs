import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt } from '../utils/animations';

export default function Projects() {
    onMount(() => {
        initReveal();
        initTilt();
    });

    return (
        <section id="projects">
            <div class="section-header reveal">
                <h2><span class="gradient-text">精选项目</span></h2>
                <p>一些我引以为豪的作品</p>
            </div>
            <div class="projects-grid">
                {/* 项目一：AI 智能助手平台 */}
                <div class="project-card reveal tilt-card">
                    {/* 项目预览图展示区 */}
                    <div class="project-preview">
                        <div class="project-preview-bg pp-1">🧠</div>
                    </div>
                    <div class="project-info">
                        <h3>AI 智能助手平台</h3>
                        <p>基于大语言模型的智能对话平台，支持多轮对话、知识库检索和插件扩展。</p>
                        {/* 项目使用的技术栈 */}
                        <div class="project-tech">
                            <span class="tech-tag">React</span>
                            <span class="tech-tag">Python</span>
                            <span class="tech-tag">LangChain</span>
                        </div>
                        {/* 项目链接 */}
                        <div class="project-links">
                            <A href="#">🔗 在线演示</A>
                            <A href="https://github.com/deltrivx" target="_blank" rel="noopener">📂 GitHub</A>
                        </div>
                    </div>
                </div>
                {/* 项目二：实时数据可视化 */}
                <div class="project-card reveal tilt-card">
                    <div class="project-preview">
                        <div class="project-preview-bg pp-2">📊</div>
                    </div>
                    <div class="project-info">
                        <h3>实时数据可视化</h3>
                        <p>高性能实时数据仪表盘，支持海量数据的流畅渲染和交互式分析。</p>
                        <div class="project-tech">
                            <span class="tech-tag">Vue.js</span>
                            <span class="tech-tag">D3.js</span>
                            <span class="tech-tag">WebSocket</span>
                        </div>
                        <div class="project-links">
                            <A href="#">🔗 在线演示</A>
                            <A href="https://github.com/deltrivx" target="_blank" rel="noopener">📂 GitHub</A>
                        </div>
                    </div>
                </div>
                {/* 项目三：音乐创作工具 */}
                <div class="project-card reveal tilt-card">
                    <div class="project-preview">
                        <div class="project-preview-bg pp-3">🎵</div>
                    </div>
                    <div class="project-info">
                        <h3>音乐创作工具</h3>
                        <p>基于 Web Audio API 的在线音乐创作平台，支持 MIDI 和实时混音。</p>
                        <div class="project-tech">
                            <span class="tech-tag">TypeScript</span>
                            <span class="tech-tag">Web Audio</span>
                            <span class="tech-tag">WASM</span>
                        </div>
                        <div class="project-links">
                            <A href="#">🔗 在线演示</A>
                            <A href="https://github.com/deltrivx" target="_blank" rel="noopener">📂 GitHub</A>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}