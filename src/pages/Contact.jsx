import { onMount, createSignal } from "solid-js";
import { initReveal } from "../utils/animations";

export default function Contact() {
    const [status, setStatus] = createSignal({ text: "🚀 发送消息", bg: "" });
    let isSubmitting = false;

    onMount(() => initReveal());

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
        <section id="contact">
            <div class="section-header reveal">
                <h2><span class="gradient-text">联系我</span></h2>
            </div>
            <div class="contact-wrapper">
                <div class="contact-info reveal">
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
                            <div class="contact-link-text"><strong>X</strong><span>@deltrivx</span></div>
                        </a>
                    </div>
                </div>
                <form class="contact-form reveal" action="https://formspree.io/f/placeholder" onSubmit={handleSubmit}>
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
