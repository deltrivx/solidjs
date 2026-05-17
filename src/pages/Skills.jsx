export default function Skills() {
  const skills = [
    { icon: "🎨", title: "前端开发", desc: "构建响应式、交互丰富的现代 Web 应用", tags: ["SolidJS","React","Vue","TypeScript","Tailwind"] },
    { icon: "⚙️", title: "后端开发", desc: "设计高可用、可扩展的服务端架构", tags: ["Node.js","Python","Go","PostgreSQL"] },
    { icon: "☁️", title: "DevOps & 云", desc: "自动化部署，保障系统稳定运行", tags: ["Docker","K8s","Cloudflare","CI/CD"] },
    { icon: "🤖", title: "AI & AIGC", desc: "探索 AI 与自动化", tags: ["LLM","RAG","Agent","AIGC"] },
  ];
  return (
    <section id="skills">
      <div class="section-header reveal" style="padding-top:3rem;">
        <h2><span class="gradient-text">技能栈</span></h2>
        <p>掌握的技术与工具</p>
      </div>
      <div class="skills-grid">
        {skills.map(s => (
          <div class="skill-card reveal">
            <div class="skill-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <div class="skill-tags">
              {s.tags.map(t => <span class="skill-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

