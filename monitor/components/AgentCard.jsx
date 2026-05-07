import { onMount } from 'solid-js';
import { initTilt } from '../utils/animations';

const statusColors = {
  online: '#00cec9',
  busy: '#fd79a8',
  offline: '#8888a0',
};

const statusLabels = {
  online: '在线',
  busy: '忙碌',
  offline: '离线',
};

export default function AgentCard(props) {
  onMount(() => initTilt());

  return (
    <div class="agent-card tilt-card">
      <div class="agent-card-header">
        <span class="agent-icon">{props.icon}</span>
        <span class="agent-status-dot" style={{ 'background-color': statusColors[props.status] }}></span>
      </div>
      <div class="agent-card-body">
        <h3>{props.name}</h3>
        <p class="agent-title">{props.title}</p>
        <span class="agent-status-label" style={{ color: statusColors[props.status] }}>
          {statusLabels[props.status]}
        </span>
      </div>
      <div class="agent-card-footer">
        <span>📋 {props.tasks} 任务</span>
        <span>🕐 {props.lastActive}</span>
      </div>
    </div>
  );
}
