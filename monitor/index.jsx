import { render } from 'solid-js/web';
import { HashRouter, Route } from '@solidjs/router';
import { MetaProvider, Title, Meta } from '@solidjs/meta';
import App from './App';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Tasks from './pages/Tasks';
import './css/style.css';

render(
  () => (
    <MetaProvider>
      <HashRouter root={App} viewTransitions={true}>
        <Route path="/" component={() => (
          <>
            <Title>三书六省 · AI Agent 监控面板</Title>
            <Meta name="description" content="三省六部 Multi-Agent 编排框架实时监控仪表盘" />
            <Dashboard />
          </>
        )} />
        <Route path="/agents" component={() => (
          <>
            <Title>三书六省 · Agent 列表</Title>
            <Agents />
          </>
        )} />
        <Route path="/tasks" component={() => (
          <>
            <Title>三书六省 · 任务队列</Title>
            <Tasks />
          </>
        )} />
        <Route path="*paramName" component={() => (
          <>
            <Title>404</Title>
            <Dashboard />
          </>
        )} />
      </HashRouter>
    </MetaProvider>
  ),
  document.getElementById('root')
);
