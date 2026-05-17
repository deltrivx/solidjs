import { A } from "@solidjs/router";

export default function About() {
  return (
    <div>
      <div class="post-header">
        <h1>关于我</h1>
        <div class="meta">// SYSTEM_PROFILE.deltrivx</div>
      </div>
      <div class="post-content">
        <section style="margin-bottom:2rem;">
          <h2>DeltrivX</h2>
          <p>代码与文字的赛博旅人。热衷前端、云原生与自动化。</p>
        </section>
        <section style="margin-bottom:2rem;">
          <h2>技能</h2>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.8rem;">
            {["SolidJS","React","Vue","Node.js","Python","Docker","K8s","Cloudflare","GitHub Actions","Linux"].map(s => (
              <span class="tag">#{s}</span>
            ))}
          </div>
        </section>
        <section>
          <h2>联系</h2>
          <p>GitHub: <A href="https://github.com/deltrivx" target="_blank">github.com/deltrivx</A></p>
          <p>Blog: <A href="https://www.deltrivx.com" target="_blank">www.deltrivx.com</A></p>
        </section>
      </div>
    </div>
  );
}

