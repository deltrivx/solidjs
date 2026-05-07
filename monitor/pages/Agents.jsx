import { onMount, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';
import AgentCard from '../components/AgentCard';
import { getAgents, getMetrics } from '../data/mockData';

export default function Agents() {
  const [agents, setAgents] = createSignal, For([]);
  const [metrics, setMetrics] = createSignal, For({});

  onMount(async () => {
    initReveal();
    initTilt();
    initSpotlight();
    setAgents(await getAgents());
    setMetrics(await getMetrics());
  });

  return (
    <>
      <div class="breadcrumb">
        <A href="/solidjs/monitor/">🏛️ 总览</A>
        <span class="sep">/</span>
        <span>Agent 列表</span>
      </div>

      <section class="section">
        <div class="section-header reveal">
          <h2><span class="gradient-text">九部 Agent</span></h2>
          <p>三省六部 · {metrics().agentsOnline || '?'}/9 在线</p>
        </div>
        <div class="agents-grid">
          <For each={agents()}>
            {(agent) => (
              <AgentCard
                name={agent.name}
                title={agent.title}
                status={agent.status}
                icon={agent.icon}
                tasks={agent.tasks || 0}
                lastActive={agent.lastActive || '--'}
              />
            )}
          </For>
        </div>
      </section>
    </>
  );
}
