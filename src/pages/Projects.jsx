import { A } from "@solidjs/router";
export default function Projects() {
  const projects = [
    { icon: "📝", title: "DeltrivX Blog", desc: "赛博朋克风格个人博客，SolidJS + Vite + GitHub Pages", tags: ["SolidJS","Vite","Cloudflare"], color: "linear-gradient(135deg,#6c5ce7,#a29bfe)", link: "https://github.com/deltrivx/solidjs" },
    { icon: "🎬", title: "MoonTVPlus", desc: "现代化视频聚合播放平台", tags: ["Next.js","React","Node.js"], color: "linear-gradient(135deg,#00cec9,#81ecec)", link: "https://github.com/deltrivx/moontvplus" },
    { icon: "⚡", title: "Quantumult X", desc: "自用脚本整合", tags: ["JavaScript","Shell"], color: "linear-gradient(135deg,#fd79a8,#fab1a0)", link: "https://github.com/deltrivx/Quantumult-X" },
  ];
  return (
    <section id="projects">
      <div class="section-header reveal" style="padding-top:3rem;">
        <h2><span class="gradient-text">精选项目</span></h2>
        <p>一些我引以为豪的作品</p>
      </div>
      <div class="projects-grid">
        {projects.map(p => (
          <div class="project-card reveal">
            <div class="project-preview">
              <div class="project-preview-bg" style={`background:${p.color};width:100%;height:180px;display:flex;align-items:center;justify-content:center;font-size:4rem;`}>{p.icon}</div>
            </div>
            <div class="project-info">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div class="project-tech">{p.tags.map(t => <span class="tech-tag">{t}</span>)}</div>
              <div class="project-links"><a href={p.link} target="_blank">GitHub →</a></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
