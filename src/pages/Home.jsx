import { A } from "@solidjs/router";

export default function Home() {
  return (
    <>
      <section class="hero">
        <div class="hero-content">
          <span class="hero-badge">👋 欢迎来到我的个人主页</span>
          <h1>Hi, I&apos;m <span class="gradient-text">DeltrivX</span></h1>
          <div class="typewriter">全栈开发者 &amp; 云原生工程师 <span class="cursor"></span></div>
          <div class="hero-buttons">
            <A href="/projects" class="btn btn-primary">🚀 查看项目</A>
            <A href="/contact" class="btn btn-outline" style="background:transparent;color:var(--text-primary);border:1px solid var(--glass-border);padding:0.85rem 2rem;border-radius:12px;font-weight:600;text-decoration:none;">💬 联系我</A>
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
          <A href="/about" class="nav-card reveal">
            <div class="nav-card-icon">👨💻</div>
            <h3>关于我</h3>
            <p>了解我的背景和经历</p>
          </A>
          <A href="/skills" class="nav-card reveal">
            <div class="nav-card-icon">⚡</div>
            <h3>技能栈</h3>
            <p>掌握的技术与工具</p>
          </A>
          <A href="/projects" class="nav-card reveal">
            <div class="nav-card-icon">🚀</div>
            <h3>精选项目</h3>
            <p>查看我的作品展示</p>
          </A>
          <A href="/contact" class="nav-card reveal">
            <div class="nav-card-icon">📧</div>
            <h3>联系我</h3>
            <p>期待与你的合作交流</p>
          </A>
        </div>
      </section>
    </>
  );
}

