import { onMount, createSignal, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';

const API_URL = '/solidjs/monitor/api/data.json';

const priorityColors = { high: '#fd79a8', medium: '#fdcb6e', low: '#8888a0' };
const statusColors = { running: '#00cec9', pending: '#8888a0', completed: '#00b894', failed: '#e17055' };

export default function Tasks() {
  const [queue, setQueue] = createSignal({ pending: 0, running: 0, completed: 0, failed: 0, items: [] });

  async function loadData() {
    try {
      const res = await fetch(API_URL + '?_=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setQueue(json.taskQueue || { pending: 0, running: 0, completed: 0, failed: 0, items: [] });
      }
    } catch (e) {
      console.warn(e);
    }
  }

  onMount(() => {
    initReveal();
    initTilt();
    initSpotlight();
    loadData();
    const timer = setInterval(loadData, 30000);
    onCleanup(() => clearInterval(timer));
  });

  const q = () => queue();

  return (
    <>
      <div class="breadcrumb">
        <A href="/solidjs/monitor/">🏛️ 总览</A>
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
            <div class="task-stat-value">{q().pending}</div>
            <div class="task-stat-label">待处理</div>
          </div>
          <div class="task-stat-card" style="border-color:#00cec9;">
            <div class="task-stat-value">{q().running}</div>
            <div class="task-stat-label">执行中</div>
          </div>
          <div class="task-stat-card" style="border-color:#00b894;">
            <div class="task-stat-value">{q().completed}</div>
            <div class="task-stat-label">已完成</div>
          </div>
          <div class="task-stat-card" style="border-color:#e17055;">
            <div class="task-stat-value">{q().failed}</div>
            <div class="task-stat-label">失败</div>
          </div>
        </div>

        <div class="task-list reveal">
          <h3 style="margin-bottom:1rem;">当前任务</h3>
          <For each={q().items}>
            {(task) => (
              <div class="task-item">
                <div class="task-item-left">
                  <span class="task-id">{task.id}</span>
                  <span class="task-name">{task.name}</span>
                </div>
                <div class="task-item-right">
                  <span class="task-agent">{task.agent}</span>
                  <span class="task-priority" style={{ color: priorityColors[task.priority] || '#888' }}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                  <span class="task-status" style={{ background: statusColors[task.status] || '#888' }}>
                    {task.status === 'running' ? '执行中' : task.status === 'pending' ? '待处理' : task.status}
                  </span>
                </div>
              </div>
            )}
          </For>
          <Show when={q().items.length === 0}>
            <p style="text-align:center;color:var(--text-secondary);padding:2rem;">
              暂无待处理任务，一切正常 🎉
            </p>
          </Show>
        </div>
      </section>
    </>
  );
}
