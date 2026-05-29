import { A } from '@solidjs/router';
import { onMount, onCleanup, createSignal } from 'solid-js';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    let navRef;
    const { isLoggedIn, username, logout } = useAuth();
    const [showDialog, setShowDialog] = createSignal(false);

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

    const handleLogout = () => {
        logout();
        setShowDialog(false);
    };

    return (
        <>
            <nav id="navbar" ref={navRef}>
                <A href="/" class="logo" style="text-decoration:none;">DeltrivX</A>
                <ul class="nav-links">
                    <li><A href="/about">关于</A></li>
                    <li><A href="/skills">技能</A></li>
                    <li><A href="/projects">项目</A></li>
                    <li><A href="/articles">文章</A></li>
                    <li>
                        {isLoggedIn() ? (
                            <span class="logged-in-text" onClick={() => setShowDialog(true)} style="cursor:pointer;color:#00d4ff;font-weight:bold;font-size:0.9rem;">已登录</span>
                        ) : (
                            <A href="/login" style="color:#007bff;font-weight:bold;">登录</A>
                        )}
                    </li>
                </ul>
            </nav>

            {showDialog() && (
                <>
                    <div class="dialog-overlay" onClick={() => setShowDialog(false)}></div>
                    <div class="dialog-box">
                        <p style="margin:0 0 6px;font-size:1rem;">当前用户：<strong>{username()}</strong></p>
                        <p style="margin:0 0 20px;color:#888;font-size:0.85rem;">确定要退出登录吗？退出后需重新输入密码访问项目链接。</p>
                        <div style="display:flex;gap:10px;justify-content:flex-end;">
                            <button onClick={() => setShowDialog(false)} style="padding:8px 20px;background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer;">取消</button>
                            <button onClick={handleLogout} style="padding:8px 20px;background:#d33;color:#fff;border:none;border-radius:6px;cursor:pointer;">退出登录</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
