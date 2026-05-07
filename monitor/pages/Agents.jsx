import { onMount, createSignal, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { initReveal, initTilt, initSpotlight } from '../utils/animations';
import AgentCard from '../components/AgentCard';

const API_URL = '/solidjs/monitor/api/data.json';

export default function Agents() {
  const [agents, setAgents] = createSignal([]);
  const [online, setOnline] = createSignal(0);

  async function loadData() {
    try {
      const res = await fetch(API_URL + '?_=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setAgents(json.agents || []);
        const count = (json.agents || []).filter(a => a.status === 'online').length;
        setOnline(count);
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
          <p>三省六部 · {online()}/9 在线</p>
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
