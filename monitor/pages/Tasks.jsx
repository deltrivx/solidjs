import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';
import { taskQueue } from '../data/mockData';

const priorityColors = {
  high: '#fd79a8',
  medium: '#fdcb6e',
  low: '#8888a0',
};

const statusColors = {
  running: '#00cec9',
  pending: '#8888a0',
  completed: '#00b894',
  failed: '#e17055',
};

export default function Tasks() {
  onMount(() => {
    initReveal();
    initTilt();
    initSpotlight();
  });

  return (
    <>
      <div class="breadcrumb">
        <A href="/">🏛️ 总览</A>
        <span class="sep">/</span>
        <span>任务队列</span>
      </div>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">任务队列</span></h2>
          <p>实时任务调度状态</p>
        </div>

        <div class="task-stats-grid reveal">
          <div class="task-stat-card" style="border-color:#fdcb6e;">
            <div class="task-stat-value">{taskQueue.pending}</div>
            <div class="task-stat-label">待处理</div>
          </div>
          <div class="task-stat-card" style="border-color:#00cec9;">
            <div class="task-stat-value">{taskQueue.running}</div>
            <div class="task-stat-label">执行中</div>
          </div>
          <div class="task-stat-card" style="border-color:#00b894;">
            <div class="task-stat-value">{taskQueue.completed}</div>
            <div class="task-stat-label">已完成</div>
          </div>
          <div class="task-stat-card" style="border-color:#e17055;">
            <div class="task-stat-value">{taskQueue.failed}</div>
            <div class="task-stat-label">失败</div>
          </div>
        </div>

        <div class="task-list reveal">
          <h3 style="margin-bottom:1rem;">当前任务</h3>
          {taskQueue.items.map((task) => (
            <div class="task-item">
              <div class="task-item-left">
                <span class="task-id">{task.id}</span>
                <span class="task-name">{task.name}</span>
              </div>
              <div class="task-item-right">
                <span class="task-agent">{task.agent}</span>
                <span class="task-priority" style={{ color: priorityColors[task.priority] }}>
                  {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                </span>
                <span class="task-status" style={{ background: statusColors[task.status] }}>
                  {task.status === 'running' ? '执行中' : task.status === 'pending' ? '待处理' : task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
