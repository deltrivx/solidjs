import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';
import MetricsGrid from '../components/MetricsGrid';
import { metrics, recentActivities } from '../data/mockData';

export default function Dashboard() {
  onMount(() => {
    initReveal();
    initTilt();
    initSpotlight();
  });

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
            <A href="/agents" class="btn btn-primary">👥 查看 Agent</A>
            <A href="/tasks" class="btn btn-outline">📋 任务队列</A>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">系统指标</span></h2>
          <p>实时运行状态概览</p>
        </div>
        <MetricsGrid metrics={metrics} />
      </section>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">近期活动</span></h2>
          <p>最近 30 分钟的任务动态</p>
        </div>
        <div class="activity-timeline">
          {recentActivities.map((act) => (
            <div class={`timeline-item reveal ${act.type}`}>
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-time">{act.time}</span>
                <span class="timeline-agent">{act.agent}</span>
                <span class="timeline-action">{act.action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
