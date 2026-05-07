import { onMount } from 'solid-js';
import { initReveal } from '../utils/animations';

export default function MetricsGrid(props) {
  onMount(() => initReveal());

  const cards = [
    { icon: '📋', label: '总任务数', value: props.metrics.totalTasks },
    { icon: '✅', label: '已完成', value: props.metrics.completedTasks },
    { icon: '❌', label: '失败', value: props.metrics.failedTasks },
    { icon: '⏱️', label: '平均响应', value: props.metrics.avgResponseTime },
    { icon: '🟢', label: '在线 Agent', value: props.metrics.agentsOnline },
    { icon: '⏳', label: '运行时长', value: props.metrics.uptime },
  ];

  return (
    <div class="metrics-grid">
      {cards.map((card) => (
        <div class="metric-card reveal">
          <div class="metric-icon">{card.icon}</div>
          <div class="metric-value">{card.value}</div>
          <div class="metric-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
