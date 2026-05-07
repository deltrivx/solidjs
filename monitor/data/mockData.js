export const agents = [
  { id: 1, name: '中书省', title: '草拟诏书 · 方案设计', status: 'online', lastActive: '刚刚', tasks: 2, icon: '📜' },
  { id: 2, name: '门下省', title: '封驳审核 · 质量把关', status: 'online', lastActive: '2分钟前', tasks: 1, icon: '🔍' },
  { id: 3, name: '尚书省', title: '统领六部 · 并行调度', status: 'online', lastActive: '5分钟前', tasks: 0, icon: '⚙️' },
  { id: 4, name: '吏部', title: '编排调度 · 任务路由', status: 'busy', lastActive: '1分钟前', tasks: 3, icon: '📋' },
  { id: 5, name: '户部', title: '数据中枢 · 持久化', status: 'online', lastActive: '3分钟前', tasks: 1, icon: '🗄️' },
  { id: 6, name: '礼部', title: '协议规范 · API 契约', status: 'offline', lastActive: '1小时前', tasks: 0, icon: '📐' },
  { id: 7, name: '兵部', title: '安全守护 · 权限管控', status: 'online', lastActive: '8分钟前', tasks: 0, icon: '🛡️' },
  { id: 8, name: '刑部', title: '质量审验 · 测试覆盖', status: 'busy', lastActive: '刚刚', tasks: 4, icon: '⚖️' },
  { id: 9, name: '工部', title: '基础设施 · CI/CD 部署', status: 'online', lastActive: '10分钟前', tasks: 2, icon: '🔧' },
];

export const metrics = {
  totalTasks: 128,
  completedTasks: 96,
  failedTasks: 3,
  avgResponseTime: '1.2s',
  uptime: '2天14小时',
  agentsOnline: 6,
};

export const recentActivities = [
  { id: 1, time: '刚刚', agent: '刑部', action: '完成代码质量审查', type: 'success' },
  { id: 2, time: '2分钟前', agent: '吏部', action: '分配新任务到工部', type: 'info' },
  { id: 3, time: '5分钟前', agent: '尚书省', action: '调度六部并行执行', type: 'info' },
  { id: 4, time: '8分钟前', agent: '兵部', action: '安全扫描未发现漏洞', type: 'success' },
  { id: 5, time: '12分钟前', agent: '中书省', action: '解析新需求并生成方案', type: 'info' },
  { id: 6, time: '15分钟前', agent: '门下省', action: '驳回方案：安全性不足', type: 'warning' },
  { id: 7, time: '20分钟前', agent: '工部', action: 'Docker 构建失败：内存不足', type: 'error' },
  { id: 8, time: '30分钟前', agent: '户部', action: '数据备份完成', type: 'success' },
];

export const taskQueue = {
  pending: 12,
  running: 5,
  completed: 96,
  failed: 3,
  items: [
    { id: 'T-001', name: '用户认证模块设计', agent: '中书省', status: 'running', priority: 'high' },
    { id: 'T-002', name: 'API 接口安全审计', agent: '兵部', status: 'running', priority: 'high' },
    { id: 'T-003', name: '数据库迁移脚本', agent: '工部', status: 'pending', priority: 'medium' },
    { id: 'T-004', name: '前端组件单元测试', agent: '刑部', status: 'pending', priority: 'medium' },
    { id: 'T-005', name: '日志采集配置', agent: '户部', status: 'pending', priority: 'low' },
  ],
};
