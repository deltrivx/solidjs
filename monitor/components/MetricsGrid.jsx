import { onMount } from 'solid-js';
import { initReveal } from '../utils/animations';

export default function MetricsGrid(props) {
  onMount(() => initReveal());

  const m = () => props.metrics || {};

  const cards = [
    { icon: '📋', label: '总任务数', value: m().totalTasks },
    { icon: '✅', label: '已完成', value: m().completedTasks },
    { icon: '❌', label: '失败', value: m().failedTasks },
    { icon: '⏱️', label: '平均响应', value: m().avgResponseTime },
    { icon: '🖥️', label: 'CPU 负载', value: m().cpuLoad },
    { icon: '💾', label: '内存', value: `${m().memoryPct || 0}%` },
    { icon: '🟢', label: '在线 Agent', value: m().agentsOnline },
    { icon: '⏳', label: '运行时长', value: m().uptime },
  ];

  return (
    <div class="metrics-grid">
      {cards.map((card) => (
        <div class="metric-card reveal">
          <div class="metric-icon">{card.icon}</div>
          <div class="metric-value">{card.value ?? '--'}</div>
          <div class="metric-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
