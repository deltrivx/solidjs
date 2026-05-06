import { A } from '@solidjs/router';
import { onMount, onCleanup } from 'solid-js';

export default function Navbar() {
    let navRef;

    onMount(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = Math.max(0, window.scrollY);
            if (currentScrollY > lastScrollY && currentScrollY > 100) navRef.classList.add('hidden');
            else navRef.classList.remove('hidden');
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll);
        onCleanup(() => window.removeEventListener('scroll', handleScroll));
    });

    return (
        <nav id="navbar" ref={navRef}>
            {/* 在 Solid Router 中，使用 A 标签代替普通的 a 标签来进行前端路由无刷新跳转 */}
            <A href="/" class="logo" style="text-decoration:none;">chkris.com</A>
            <ul class="nav-links">
                <li><A href="/about">关于</A></li>
                <li><A href="/skills">技能</A></li>
                <li><A href="/projects">项目</A></li>
                <li><A href="/contact">联系</A></li>
            </ul>
        </nav>
    );
}