import { onMount } from 'solid-js';
import { initReveal } from './animations';

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
                <p>热爱技术，热爱生活，用代码创造美好世界</p>
            </div>
            <div class="about-grid">
                <div class="about-image-wrapper reveal"><div class="about-image">👨‍💻</div></div>
                <div class="about-text reveal">
                    <h3>全栈开发者 & 创意极客</h3>
                    <p>我是一名热爱技术的全栈开发者，专注于构建优雅、高性能的 Web 应用。喜欢探索新技术，将创意转化为现实。</p>
                    <p>在工作之余，我喜欢摄影、阅读和参与开源项目。我相信好的代码不仅是工具，更是艺术。</p>
                    <div class="stats-row">
                        <div class="stat-item"><div class="stat-number" data-target="5">0</div><div class="stat-label">年经验</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="30">0</div><div class="stat-label">完成项目</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="1200">0</div><div class="stat-label">GitHub Stars</div></div>
                    </div>
                </div>
            </div>
        </section>
    );
}