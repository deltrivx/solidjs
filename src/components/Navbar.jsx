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
            <A href="/" class="logo" style="text-decoration:none;">DeltrivX</A>
            <ul class="nav-links">
                <li><A href="/about">关于</A></li>
                <li><A href="/projects">项目</A></li>
            </ul>
        </nav>
    );
}
