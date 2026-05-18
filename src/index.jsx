import { render } from 'solid-js/web';
import { HashRouter, Route } from '@solidjs/router';
import { MetaProvider, Title, Meta } from '@solidjs/meta';
import App from './App';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './css/style.css'; // 引入全局样式

render(
  () => (
    <MetaProvider>
      <HashRouter root={App} viewTransitions={true}>
        <Route path="/" component={() => (
          <>
            <Title>DeltrivX | 个人主页</Title>
            <Meta name="description" content="DeltrivX - 全栈开发者、AI探索者、开源贡献者" />
            <Home />
          </>
        )} />
        <Route path="/about" component={() => (
          <>
            <Title>DeltrivX | 关于我</Title>
            <Meta name="description" content="了解 DeltrivX 的背景和经历" />
            <About />
          </>
        )} />
            <Skills />
          </>
        )} />
        <Route path="/projects" component={() => (
          <>
            <Title>DeltrivX | 精选项目</Title>
            <Meta name="description" content="DeltrivX 引以为豪的作品" />
            <Projects />
          </>
        )} />
            <Contact />
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
  ),
  document.getElementById('root')
);
