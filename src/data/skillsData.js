/**
 * 技能数据数组，用于动态渲染 Skills 页面。
 * 每项包含技能卡片的图标、标题、描述，以及技术标签（含熟练度）。
 * level: 0-100 熟练度百分比
 */
const skillsData = [
    {
        icon: '🎨',
        title: '前端开发',
        description: '构建响应式、交互丰富的现代 Web 应用',
        tags: [
            { name: 'SolidJS', level: 88 },
            { name: 'React', level: 82 },
            { name: 'TypeScript', level: 80 },
            { name: 'Vite', level: 88 },
            { name: 'Tailwind CSS', level: 75 },
        ]
    },
    {
        icon: '⚙️',
        title: '后端开发',
        description: '设计高可用、可扩展的服务端架构',
        tags: [
            { name: 'Node.js', level: 85 },
            { name: 'Python', level: 75 },
            { name: 'PostgreSQL', level: 70 },
            { name: 'REST API', level: 82 },
        ]
    },
    {
        icon: '☁️',
        title: 'DevOps & 云',
        description: '自动化部署，保障系统稳定运行',
        tags: [
            { name: 'Docker', level: 85 },
            { name: 'Cloudflare', level: 80 },
            { name: 'Nginx', level: 75 },
            { name: 'GitHub Actions', level: 80 },
            { name: 'Linux', level: 78 },
        ]
    },
    {
        icon: '🤖',
        title: 'AI 应用',
        description: '大模型应用开发与智能代理系统',
        tags: [
            { name: 'LLM', level: 85 },
            { name: 'RAG', level: 78 },
            { name: 'AI Agent', level: 85 },
            { name: 'TTS', level: 72 },
            { name: 'Prompt Engineering', level: 80 },
        ]
    },
    {
        icon: '🎬',
        title: '影视媒体',
        description: '全流程影视资源管理与媒体服务搭建',
        tags: [
            { name: 'Emby', level: 80 },
            { name: 'MoviePilot', level: 75 },
            { name: 'FFmpeg', level: 65 },
            { name: 'Aria2', level: 82 },
            { name: 'qBittorrent', level: 82 },
            { name: 'Transmission', level: 78 },
        ]
    },
    {
        icon: '🗄️',
        title: '数据与存储',
        description: '多类型数据存储方案与私有云基础设施',
        tags: [
            { name: 'PostgreSQL', level: 72 },
            { name: 'Redis', level: 70 },
            { name: 'Kvrocks', level: 65 },
            { name: 'NAS 私有云', level: 75 },
        ]
    },
];

export default skillsData;
