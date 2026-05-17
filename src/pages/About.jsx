export default function About() {
  return (
    <section id="about">
      <div class="section-header reveal">
        <h2><span class="gradient-text">关于我</span></h2>
        <p>了解我的背景和经历</p>
      </div>
      <div class="about-content" style="max-width:700px;margin:auto;">
        <h3 style="font-size:1.6rem;margin-bottom:1rem;">DeltrivX</h3>
        <p style="color:var(--text-secondary);margin-bottom:1rem;line-height:1.8;">
          全栈开发者，云原生爱好者。热衷于构建现代化的 Web 应用，探索 AI 与自动化的无限可能。
        </p>
        <div class="stats-row" style="display:flex;gap:2rem;margin-top:2rem;justify-content:center;">
          <div class="stat-item" style="text-align:center;">
            <div class="stat-number" style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">3+</div>
            <div class="stat-label" style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.3rem;">年经验</div>
          </div>
          <div class="stat-item" style="text-align:center;">
            <div class="stat-number" style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">10+</div>
            <div class="stat-label" style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.3rem;">项目</div>
          </div>
        </div>
      </div>
    </section>
  );
}

