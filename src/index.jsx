import { render, lazy, Suspense } from 'solid-js/web';
import { HashRouter, Route } from '@solidjs/router';
import { MetaProvider, Title, Meta } from '@solidjs/meta';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Skills = lazy(() => import('./pages/Skills'));
const Projects = lazy(() => import('./pages/Projects'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDualStack = lazy(() => import('./pages/articles/ArticleDualStack'));
const ArticleHomenetQX = lazy(() => import('./pages/articles/ArticleHomenetQX'));
const ArticleFnosOpenClawStore = lazy(() => import('./pages/articles/ArticleFnosOpenClawStore'));
const ArticleFnosIgpuTemp = lazy(() => import('./pages/articles/ArticleFnosIgpuTemp'));
const ArticleMemoryEmbedOllama = lazy(() => import('./pages/articles/ArticleMemoryEmbedOllama'));
const ArticleSubstoreHomenetTraffic8443 = lazy(() => import('./pages/articles/ArticleSubstoreHomenetTraffic8443'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
import './css/style.css';

function PageLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--text-secondary)', fontSize: '1rem'
    }}>
      <span>加载中...</span>
    </div>
  );
}

function RouteWithMeta({ title, desc, Component }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Title>{title}</Title>
      <Meta name="description" content={desc} />
      <Component />
    </Suspense>
  );
}

render(
  () => (
    <AuthProvider>
      <MetaProvider>
        <HashRouter root={App}>
          <Route path="/" component={() => <RouteWithMeta title="DeltrivX | 个人主页" desc="DeltrivX - 全栈开发者、AI探索者、开源贡献者" Component={Home} />} />
          <Route path="/about" component={() => <RouteWithMeta title="DeltrivX | 关于我" desc="了解 DeltrivX 的背景和经历" Component={About} />} />
          <Route path="/skills" component={() => <RouteWithMeta title="DeltrivX | 技能栈" desc="DeltrivX 掌握的技术和工具" Component={Skills} />} />
          <Route path="/projects" component={() => <RouteWithMeta title="DeltrivX | 精选项目" desc="DeltrivX 引以为豪的作品展示" Component={Projects} />} />
          <Route path="/articles" component={() => <RouteWithMeta title="DeltrivX | 实战" desc="DeltrivX 分享的技术文章与思考" Component={Articles} />} />
          <Route path="/article/fnos-openclaw-store-optimization" component={() => <RouteWithMeta title="DeltrivX | 飞牛系统商店版 OpenClaw 优化实战" desc="FnOS 商店版 OpenClaw 优化实战" Component={ArticleFnosOpenClawStore} />} />
          <Route path="/article/homenet-qx" component={() => <RouteWithMeta title="DeltrivX | HomeNet QX 双节点实战" desc="iOS Quantumult X 异地接入内网" Component={ArticleHomenetQX} />} />
          <Route path="/article/dual-stack-domain" component={() => <RouteWithMeta title="DeltrivX | 双栈域名体系指南" desc="双栈域名体系完全指南" Component={ArticleDualStack} />} />
          <Route path="/article/substore-homenet-traffic-8443" component={() => <RouteWithMeta title="DeltrivX | SubStore HomeNet 优化实战" desc="SubStore 流量显示修复与 8443 独立链路" Component={ArticleSubstoreHomenetTraffic8443} />} />
          <Route path="/article/memory-embed-ollama" component={() => <RouteWithMeta title="DeltrivX | 记忆优化实战" desc="Ollama Embedding + memory-core" Component={ArticleMemoryEmbedOllama} />} />
          <Route path="/article/fnos-igpu-temp" component={() => <RouteWithMeta title="DeltrivX | FnOS 核显温度补丁" desc="FnOS 核显温度显示补丁从原理到实现" Component={ArticleFnosIgpuTemp} />} />
          <Route path="/login" component={() => <RouteWithMeta title="DeltrivX | 登录" desc="登录" Component={Login} />} />
          <Route path="*paramName" component={() => <RouteWithMeta title="404 - 页面未找到" desc="页面未找到" Component={NotFound} />} />
        </HashRouter>
      </MetaProvider>
    </AuthProvider>
  ),
  document.getElementById('root')
);
