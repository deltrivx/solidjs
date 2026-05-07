import { onMount } from 'solid-js';
import { A } from '@solidjs/router';

export default function Navbar() {
  let navRef;
  
  onMount(() => {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 100) {
        navRef.classList.add('hidden');
      } else {
        navRef.classList.remove('hidden');
      }
      lastScroll = current;
    });
  });

  return (
    <nav ref={navRef}>
      <A href="/solidjs-monitor" class="logo">🏛️ 三书六省</A>
      <ul class="nav-links">
        <li><A href="/solidjs-monitor">总览</A></li>
        <li><A href="/solidjs-monitor/agents">Agent</A></li>
        <li><A href="/solidjs-monitor/tasks">任务</A></li>
      </ul>
    </nav>
  );
}
