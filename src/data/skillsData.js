/**
 * 技能数据数组，用于动态渲染 Skills 页面。
 * 每个对象包含技能卡片的图标、标题、描述和技术标签列表。
 */
const skillsData = [
    // ===== 方案 A：优化原有类别 =====
    {
        icon: '🎨',
        title: '前端开发',
        description: '构建响应式、交互丰富的现代 Web 应用',
        tags: ['SolidJS', 'React', 'TypeScript', 'Vite', 'Tailwind CSS']
    },
    {
        icon: '⚙️',
        title: '后端开发',
        description: '设计高可用、可扩展的服务端架构',
        tags: ['Node.js', 'Python', 'PostgreSQL', 'REST API']
    },
    {
        icon: '☁️',
        title: 'DevOps & 云',
        description: '自动化部署，保障系统稳定运行',
        tags: ['Docker', 'Cloudflare', 'Nginx', 'GitHub Actions', 'Linux']
    },
    {
        icon: '🤖',
        title: 'AI & AIGC',
        description: '探索 LLM 应用与 AIGC 视频创作的无限可能',
        tags: [
            'LLM', 'RAG', 'AI Agent', 'TTS',
            'AIGC 视频', 'ComfyUI'
        ]
    },
    // ===== 方案 B：新增类别 =====
    {
        icon: '🎬',
        title: '影视媒体',
        description: '全流程影视资源管理与媒体服务搭建',
        tags: ['Emby', 'MoviePilot', 'FFmpeg', 'Aria2', 'qBittorrent', 'Transmission']
    },
    {
        icon: '🗄️',
        title: '数据与存储',
        description: '多类型数据存储方案与私有云基础设施',
        tags: ['PostgreSQL', 'Redis', 'Kvrocks', 'NAS 私有云']
    },
];

export default skillsData;
