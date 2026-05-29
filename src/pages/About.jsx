import { onMount, createSignal } from 'solid-js';
import { initReveal } from '../utils/animations';

export default function About() {
    const [status, setStatus] = createSignal({ text: "🚀 发送消息", bg: "" });
    let isSubmitting = false;

    onMount(() => {
        initReveal();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;
        const form = e.target;
        setStatus({ text: "⏳ 发送中...", bg: "" });

        try {
            const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } });
            if (res.ok) {
                setStatus({ text: "✅ 已发送！", bg: "linear-gradient(135deg, #00b894, #00cec9)" });
                form.reset();
            } else throw new Error("发送失败");
        } catch {
            setStatus({ text: "❌ 发送失败，请直接邮件联系", bg: "linear-gradient(135deg, #d63031, #e17055)" });
        }
        setTimeout(() => {
            isSubmitting = false;
            setStatus({ text: "🚀 发送消息", bg: "" });
        }, 3000);
    };

    return (
        <section id="about">
            <div class="about-grid">
                <div class="about-image-wrapper reveal"><div class="about-image">🖥️</div></div>
                <div class="about-text reveal">
                    <h3>AI 折腾党 & 自建派</h3>
                    <p>我是 DeltrivX，一名热爱自建（self-hosting）的技术爱好者。从一台 FnOS 起步，逐步搭建起覆盖存储、影音、下载、AI 的家庭数据中心。</p>
                    <p>热衷于用 Docker 容器编排各类服务，打通 Cloudflare Tunnel 公网访问，构建属于自己的数字基础设施。同时也在探索 LLM 应用与 AIGC 的可能性。</p>
                    <div class="stats-row">
                        <div class="stat-item"><div class="stat-number" data-target="27">0</div><div class="stat-label">Docker 容器</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="20">0</div><div class="stat-label">自建服务</div></div>
                        <div class="stat-item"><div class="stat-number" data-target="9">0</div><div class="stat-label">GitHub 仓库</div></div>
                    </div>
                </div>
            </div>

            <div class="contact-wrapper reveal">
                <div class="contact-info">
                    <h3>保持联系 🤝</h3>
                    <p>无论是项目合作、技术交流还是随便聊聊，都欢迎联系我。</p>
                    <div class="contact-links">
                        <a href="mailto:deltrivx@icloud.com" class="contact-link-item">
                            <span class="contact-link-icon">📧</span>
                            <div class="contact-link-text"><strong>Email</strong><span>deltrivx@icloud.com</span></div>
                        </a>
                        <a href="https://github.com/deltrivx" target="_blank" rel="noopener" class="contact-link-item">
                            <span class="contact-link-icon">🐙</span>
                            <div class="contact-link-text"><strong>GitHub</strong><span>DeltrivX</span></div>
                        </a>
                        <a href="https://x.com/deltrivx" target="_blank" rel="noopener" class="contact-link-item">
                            <span class="contact-link-icon">🐦</span>
                            <div class="contact-link-text"><strong>Twitter（X）</strong><span>@deltrivx</span></div>
                        </a>
                    </div>
                </div>
                <form class="contact-form" action="https://formspree.io/f/placeholder" onSubmit={handleSubmit}>
                    <div class="form-group"><input type="text" name="name" placeholder="你的名字" required /></div>
                    <div class="form-group"><input type="email" name="email" placeholder="你的邮箱" required /></div>
                    <div class="form-group"><textarea name="message" placeholder="你想说什么..." required></textarea></div>
                    <button type="submit" class="btn btn-primary" style={`width:100%;justify-content:center;background:${status().bg}`} disabled={isSubmitting}>
                        {status().text}
                    </button>
                </form>
            </div>
        </section>
    );
}
