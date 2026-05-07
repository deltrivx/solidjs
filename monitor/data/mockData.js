// 实时数据采集 - 从服务器 API 获取
const API_BASE = '/solidjs/monitor/api';

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/data.json`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 缓存上一次数据，用于 fallback
let cached = null;

export async function getAgents() {
  try {
    const data = await fetchDashboard();
    cached = data;
    return data.agents;
  } catch {
    return cached?.agents || [];
  }
}

export async function getMetrics() {
  try {
    const data = await fetchDashboard();
    cached = data;
    return data.metrics;
  } catch {
    return cached?.metrics || {};
  }
}

export async function getRecentActivities() {
  try {
    const data = await fetchDashboard();
    cached = data;
    return data.recentActivities;
  } catch {
    return cached?.recentActivities || [];
  }
}

export async function getTaskQueue() {
  try {
    const data = await fetchDashboard();
    cached = data;
    return data.taskQueue;
  } catch {
    return cached?.taskQueue || { pending: 0, running: 0, completed: 0, failed: 0, items: [] };
  }
}

export async function getGateway() {
  try {
    const data = await fetchDashboard();
    cached = data;
    return data.gateway;
  } catch {
    return cached?.gateway || {};
  }
}
