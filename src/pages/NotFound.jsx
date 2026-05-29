import { A } from '@solidjs/router';

export default function NotFound() {
    return (
        <div class="content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center;">
            <div class="code" style="font-size: clamp(6rem, 20vw, 10rem); font-weight: 900; background: linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 1rem;">
                404
            </div>
            <h1 style="font-size: 1.5rem; margin-bottom: 0.8rem; font-weight: 600;">页面未找到</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1rem; line-height: 1.6;">
                你访问的页面不存在或已被移除。<br />别担心，让我们回到正轨。
            </p>
            <A href="/" class="btn btn-primary">🏠 返回首页</A>
        </div>
    );
}
