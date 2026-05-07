// 实时数据采集 - 使用 createResource 支持异步加载和 Suspense
import { createResource } from 'solid-js';

const API_BASE = '/solidjs/monitor/api';

async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/data.json?_=${Date.now()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// createResource 信号：自动在 mount 时触发，支持 Suspense
export function createDashboardResource() {
  return createResource(fetchDashboard, { initialValue: null });
}

export function useAgents(source) {
  return () => source()?.agents || [];
}

export function useMetrics(source) {
  return () => source()?.metrics || {};
}

export function useRecentActivities(source) {
  return () => source()?.recentActivities || [];
}

export function useTaskQueue(source) {
  return () => source()?.taskQueue || { pending: 0, running: 0, completed: 0, failed: 0, items: [] };
}

export function useGateway(source) {
  return () => source()?.gateway || {};
}
