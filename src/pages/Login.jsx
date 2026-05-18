import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../context/AuthContext';

function getRedirectParam() {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash;
    const idx = hash.indexOf('?');
    if (idx === -1) return '/';
    const params = new URLSearchParams(hash.slice(idx + 1));
    return params.get('redirect') || '/';
}

export default function Login() {
    const [username, setUsername] = createSignal('DeltrivX');
    const [password, setPassword] = createSignal('');
    const [remember, setRemember] = createSignal(false);
    const [error, setError] = createSignal('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!username().trim()) { setError('请输入用户名'); return; }
        const ok = await login(username(), password());
        if (ok) {
            const redirect = getRedirectParam();
            navigate(redirect, { replace: true });
        } else {
            setError('用户名或密码错误，请重试');
        }
    };

    return (
        <div style="max-width: 400px; margin: 100px auto; padding: 40px 20px;">
            <h1 style="text-align: center; margin-bottom: 30px;">登录</h1>
            <form onSubmit={handleLogin}>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 6px;">用户名</label>
                    <input type="text" value={username()} onInput={(e) => setUsername(e.target.value)}
                        style="width: 100%; padding: 10px; background: #1a1a2e; border: 1px solid #333; color: #fff; border-radius: 6px;" />
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 6px;">密码</label>
                    <input type="password" value={password()} onInput={(e) => setPassword(e.target.value)}
                        style="width: 100%; padding: 10px; background: #1a1a2e; border: 1px solid #333; color: #fff; border-radius: 6px;" />
                </div>
                {error() && <p style="color: #ff4444; margin-bottom: 15px;">{error()}</p>}
                <div style="margin-bottom: 20px;">
                    <label><input type="checkbox" checked={remember()} onChange={(e) => setRemember(e.target.checked)} /> 记住我</label>
                </div>
                <button type="submit"
                    style="width: 100%; padding: 12px; background: #00d4ff; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">登录</button>
            </form>
        </div>
    );
}
