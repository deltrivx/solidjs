export default function Contact() {
  return (
    <section id="contact">
      <div class="section-header reveal" style="padding-top:3rem;">
        <h2><span class="gradient-text">联系我</span></h2>
        <p>期待与你的合作交流</p>
      </div>
      <div class="contact-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;max-width:600px;margin:2rem auto;">
        <a href="https://github.com/deltrivx" target="_blank" class="contact-card" style="display:block;padding:2rem;border-radius:16px;background:var(--glass-bg);border:1px solid var(--glass-border);text-decoration:none;color:var(--text-primary);text-align:center;transition:all 0.3s;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">🐙</div>
          <h3>GitHub</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;">github.com/deltrivx</p>
        </a>
        <a href="mailto:deltrivx@example.com" class="contact-card" style="display:block;padding:2rem;border-radius:16px;background:var(--glass-bg);border:1px solid var(--glass-border);text-decoration:none;color:var(--text-primary);text-align:center;transition:all 0.3s;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">📧</div>
          <h3>Email</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;">deltrivx@example.com</p>
        </a>
      </div>
    </section>
  );
}

