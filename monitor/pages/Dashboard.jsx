import { onMount, createSignal, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';
import MetricsGrid from '../components/MetricsGrid';

const API_URL = '/solidjs/monitor/api/data.json';

export default function Dashboard() {
  const [data, setData] = createSignal({ metrics: {}, activities: [], gateway: {} });

  async function loadData() {
    try {
      const res = await fetch(API_URL + '?_=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setData({
          metrics: json.metrics || {},
          activities: json.recentActivities || [],
          gateway: json.gateway || {},
        });
      }
    } catch (e) {
      console.warn('Monitor API fetch failed:', e);
    }
  }

  onMount(() => {
    // 时间显示优化
    const updateTime = () => {
      const timeEl = document.getElementById("current-time");
      if (timeEl) timeEl.textContent = new Date().toLocaleString("zh-CN");
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    onCleanup(() => clearInterval(timeInterval));
    initReveal();
    initTilt();
    initSpotlight();
    loadData();
    const timer = setInterval(loadData, 30000);
    onCleanup(() => clearInterval(timer));
  });

  const m = () => data().metrics;
  const acts = () => data().activities;
  const gw = () => data().gateway;

  return (
    <>
      <section class="hero" style="min-height:60vh;">
        <div class="hero-content">
          <span class="hero-badge">🏛️ 三书六省</span>
          <h1><span class="gradient-text">AI Agent 监控面板</span></h1>
          <p style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:2rem;">
            中书 → 门下 → 尚书 → 六部并行 · 全链路实时可观测
          </p>
          <div class="hero-buttons">
            <A href="/solidjs/monitor/agents" class="btn btn-primary">👥 查看 Agent</A>
            <A href="/solidjs/monitor/tasks" class="btn btn-outline">📋 任务队列</A>
          </div>
          <div style="margin-top:1rem;font-size:0.8rem;color:var(--text-secondary);">
            最后更新: {gw().updatedAt || '加载中...'}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">系统指标</span></h2>
          <p>实时运行状态概览</p>
        </div>
        <MetricsGrid metrics={m()} />
      </section>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">近期活动</span></h2>
          <p>最近 30 分钟的任务动态</p>
        </div>
        <div class="activity-timeline">
          <For each={acts()}>
            {(act) => (
              <div class={`timeline-item reveal ${act.type}`}>
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="timeline-time">{act.time}</span>
                  <span class="timeline-agent">{act.agent}</span>
                  <span class="timeline-action">{act.action}</span>
                </div>
              </div>
            )}
          </For>
          <Show when={acts().length === 0}>
            <p style="text-align:center;color:var(--text-secondary);padding:2rem;">
              暂无活动记录
            </p>
          </Show>
        </div>
      </section>
    </>
  );
}
