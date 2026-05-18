import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';

export default function Login() {
    const [username, setUsername] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [remember, setRemember] = createSignal(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // 预览阶段，登录成功后跳转回首页
        navigate('/');
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
                <div style="margin-bottom: 20px;">
                    <label><input type="checkbox" checked={remember()} onChange={(e) => setRemember(e.target.checked)} /> 记住我</label>
                </div>
                <button type="submit"
                    style="width: 100%; padding: 12px; background: #00d4ff; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">登录</button>
            </form>
        </div>
    );
}
