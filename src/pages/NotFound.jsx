import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center;">
      <div style="font-size: clamp(5rem, 15vw, 8rem); font-weight: 900; color: var(--neon-pink); text-shadow: 0 0 30px rgba(255,45,120,0.5); line-height: 1;">
        404
      </div>
      <h2 style="color: var(--neon-blue); margin: 1rem 0;">页面未找到</h2>
      <p style="color: var(--text-dim); margin-bottom: 1.5rem;">你访问的页面不存在或已被移除。</p>
      <A href="/" style="border: 1px solid var(--neon-blue); color: var(--neon-blue); padding: 0.5rem 1.5rem; text-decoration: none; transition: all 0.3s; border-radius: 2px;"
         onMouseOver={(e) => { e.target.style.background = "var(--neon-blue)"; e.target.style.color = "#0a0e17"; }}
         onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "var(--neon-blue)"; }}>
        ◁ 返回首页
      </A>
    </div>
  );
}

