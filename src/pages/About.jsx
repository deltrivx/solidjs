import { onMount } from 'solid-js';
import { initReveal } from '../utils/animations';

export default function About() {
    onMount(() => {
        initReveal();

        // 数字递增动画逻辑
        const statNumbers = document.querySelectorAll('.stat-number');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target);
                    let current = 0;
                    const increment = Math.max(1, Math.floor(target / 60));
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) { current = target; clearInterval(timer); }
                        el.textContent = current.toLocaleString() + '+';
                    }, 30);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(el => counterObserver.observe(el));
    });

    return (
        <section id="about">
            <div class="section-header reveal">
                <h2><span class="gradient-text">关于我</span></h2>
                <p>自建基础设施玩家 · AI 应用探索者</p>
            </div>
            <div class="about-grid">
                <div class="about-image-wrapper reveal"><div class="about-image">🏠</div></div>
                <div class="about-text reveal">
                    <h3>AI 折腾党 & 自建派</h3>
                    <p>我是 DeltrivX，一名热爱自建（self-hosting）的技术爱好者。从一台 FnOS 起步，逐步搭建起覆盖存储、影音、下载、AI 的家庭数据中心。</p>
                    <p>热衷于用 Docker 容器编排各类服务，打通 Cloudflare Tunnel 公网访问，构建属于自己的数字基础设施。同时也在探索 LLM 应用与 AIGC 的可能性。</p>
                    <div class="stats-row">
                        <div class="stat-item"><div class="stat-number" data-target="25">0</div><div class="stat-label">Docker 容器</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="20">0</div><div class="stat-label">自建服务</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="9">0</div><div class="stat-label">GitHub 仓库</div></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
