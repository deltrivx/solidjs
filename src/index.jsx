import { render } from 'solid-js/web';
import { HashRouter, Route } from '@solidjs/router';
import { MetaProvider, Title, Meta } from '@solidjs/meta';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Articles from './pages/Articles';
import ArticleDualStack from './pages/articles/ArticleDualStack';
import ArticleHomenetQX from './pages/articles/ArticleHomenetQX';
import ArticleFnosOpenClawStore from './pages/articles/ArticleFnosOpenClawStore';
import ArticleFnosIgpuTemp from './pages/articles/ArticleFnosIgpuTemp';
import ArticleOpenclawBaota from './pages/articles/ArticleOpenclawBaota';
import ArticleMemoryEmbedOllama from './pages/articles/ArticleMemoryEmbedOllama';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './css/style.css';

render(
  () => (
    <AuthProvider>
      <MetaProvider>
        <HashRouter root={App} >
          <Route path="/" component={() => (
            <>
              <Title>Kris | 个人主页</Title>
              <Meta name="description" content="Kris - 全栈开发者、AI探索者、开源贡献者" />
              <Home />
            </>
          )} />
          <Route path="/about" component={() => (
            <>
              <Title>Kris | 关于我</Title>
              <Meta name="description" content="了解 Kris 的背景和经历" />
              <About />
            </>
          )} />
          <Route path="/skills" component={() => (
            <>
              <Title>Kris | 技能栈</Title>
              <Meta name="description" content="Kris 掌握的技术和工具" />
              <Skills />
            </>
          )} />
          <Route path="/projects" component={() => (
            <>
              <Title>Kris | 精选项目</Title>
              <Meta name="description" content="Kris 引以为豪的作品" />
              <Projects />
            </>
          )} />
          <Route path="/articles" component={() => (
            <>
              <Title>Kris | 文章</Title>
              <Meta name="description" content="Kris 分享的技术文章与思考" />
              <Articles />
            </>
          )} />
<Route path="/article/fnos-openclaw-store-optimization" component={() => (
            <>
              <Title>Kris | 飞牛系统商店版 OpenClaw 优化实战</Title>
              <ArticleFnosOpenClawStore />
            </>
          )} />
          <Route path="/article/homenet-qx" component={() => (
            <>
              <Title>Kris | iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南</Title>
              <ArticleHomenetQX />
            </>
          )} />
          <Route path="/article/dual-stack-domain" component={() => (
            <>
              <Title>Kris | 双栈域名体系完全指南</Title>
              <ArticleDualStack />
            </>
          )} />
          <Route path="/article/memory-embed-ollama" component={() => (
            <>
              <Title>Kris | OpenClaw 记忆优化：Ollama Embedding + memory-core</Title>
              <ArticleMemoryEmbedOllama />
            </>
          )} />
          <Route path="/article/fnos-igpu-temp" component={() => (
            <>
              <Title>Kris | FnOS 核显温度显示补丁：从原理到实现</Title>
              <ArticleFnosIgpuTemp />
            </>
          )} />
          <Route path="/article/openclaw-baota-pm2" component={() => (
            <>
              <Title>Kris | 宝塔插件 OpenClaw 部署实录</Title>
              <ArticleOpenclawBaota />
            </>
          )} />
          <Route path="/login" component={() => (
            <>
              <Title>Kris | 登录</Title>
              <Login />
            </>
          )} />
          <Route path="*paramName" component={() => (
            <>
              <Title>404 - 页面未找到</Title>
              <NotFound />
            </>
          )} />
        </HashRouter>
      </MetaProvider>
    </AuthProvider>
  ),
  document.getElementById('root')
);
