import { onMount, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt } from '../utils/animations';

export default function Home() {
    let typewriterEl;
    let timer;

    onMount(() => {
        initReveal();
        initTilt();
        
        const phrases = ['全栈开发者 🚀', 'UI/UX 设计爱好者 🎨', '开源贡献者 💡', '终身学习者 📚', 'AI 探索者 🤖'];
        let phraseIndex = 0, charIndex = 0, isDeleting = false;

        function typeWriter() {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typewriterEl.innerHTML = currentPhrase.substring(0, charIndex - 1) + '<span class="cursor"></span>';
                charIndex--;
            } else {
                typewriterEl.innerHTML = currentPhrase.substring(0, charIndex + 1) + '<span class="cursor"></span>';
                charIndex++;
            }
            let speed = isDeleting ? 40 : 80;
            if (!isDeleting && charIndex === currentPhrase.length) { speed = 2000; isDeleting = true; }
            else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = 500; }
            timer = setTimeout(typeWriter, speed);
        }
        typeWriter();
    });

    onCleanup(() => clearTimeout(timer));

    return (
        <>
            <section class="hero">
                <div class="hero-content">
                    <span class="hero-badge">👋 欢迎来到我的个人主页</span>
                    <h1>Hi, I'm <span class="gradient-text">DeltrivX</span></h1>
                    <div class="typewriter" ref={typewriterEl}></div>
                    <div class="hero-buttons">
                        <A href="/projects" class="btn btn-primary">🚀 查看项目</A>
                        <A href="/contact" class="btn btn-outline">💬 联系我</A>
                    </div>
                </div>
                <div class="scroll-indicator"><span></span></div>
            </section>

            <section class="explore-section">
                <div class="section-header reveal">
                    <h2><span class="gradient-text">探索更多</span></h2>
                    <p>了解我的技能、项目和联系方式</p>
                </div>
                <div class="nav-cards-grid">
                    <A href="/about" class="nav-card reveal tilt-card">
                        <div class="nav-card-icon">👨‍💻</div>
                        <h3>关于我</h3>
                        <p>了解我的背景和经历</p>
                    </A>
                    <A href="/skills" class="nav-card reveal tilt-card">
                        <div class="nav-card-icon">⚡</div>
                        <h3>技能栈</h3>
                        <p>掌握的技术与工具</p>
                    </A>
                    <A href="/projects" class="nav-card reveal tilt-card">
                        <div class="nav-card-icon">🚀</div>
                        <h3>精选项目</h3>
                        <p>查看我的作品展示</p>
                    </A>
                    <A href="/contact" class="nav-card reveal tilt-card">
                        <div class="nav-card-icon">📧</div>
                        <h3>联系我</h3>
                        <p>期待与你的合作交流</p>
                    </A>
                </div>
            </section>
        </>
    );
}
