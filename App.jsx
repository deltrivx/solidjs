import { onMount, onCleanup } from 'solid-js';
import Navbar from './Navbar';
import Footer from './Footer';
import Particles from './Particles';

export default function App(props) {
  let spotlightRef;

  onMount(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    onCleanup(() => window.removeEventListener('mousemove', handleMouseMove));
  });

  return (
    <>
      {/* 鼠标聚光灯层 */}
      <div class="spotlight" ref={spotlightRef}></div>
      {/* 全局粒子背景 */}
      <Particles />
      {/* 顶部导航 */}
      <Navbar />
      <main>
        {props.children}
      </main>
      <Footer />
    </>
  );
}