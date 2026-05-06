import { render } from 'solid-js/web';
import { HashRouter, Route } from '@solidjs/router';
import { MetaProvider, Title, Meta } from '@solidjs/meta';
import App from './App';
import Home from './Home';
import About from './About';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';
import NotFound from './NotFound';
import './css/style.css'; // 引入全局样式

render(
  () => (
    <MetaProvider>
      <HashRouter root={App} viewTransitions={true}>
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
        <Route path="/contact" component={() => (
          <>
            <Title>Kris | 联系我</Title>
            <Meta name="description" content="与 Kris 取得联系" />
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