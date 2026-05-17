import { onMount } from "solid-js";

export default function About() {
  return (
    <div>
      <div class="post-header">
        <h1 style="font-size: 2rem;">关于我</h1>
        <div class="meta">// SYSTEM_PROFILE.deltrivx</div>
      </div>
      <div class="post-content">
        <section style="margin-bottom: 2rem;">
          <h2>DeltrivX</h2>
          <p>代码与文字的赛博旅人。热衷前端、云原生与自动化，偶尔写写东西。</p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2>技能</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.8rem;">
            {["SolidJS", "React", "Vue", "Node.js", "Python", "Docker", "K8s", "Cloudflare", "GitHub Actions", "Linux"].map((s) => (
              <span style="border: 1px solid var(--neon-blue); color: var(--neon-blue); padding: 0.2rem 0.6rem; font-size: 0.8rem; border-radius: 2px;">
                [{s}]
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2>联系</h2>
          <p>GitHub: <a href="https://github.com/deltrivx" target="_blank">github.com/deltrivx</a></p>
          <p>Blog: <a href="https://www.deltrivx.com" target="_blank">www.deltrivx.com</a></p>
        </section>
      </div>
    </div>
  );
}

