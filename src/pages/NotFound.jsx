import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <div class="not-found">
      <div class="code">404</div>
      <h2 style="margin-bottom:0.8rem;">页面未找到</h2>
      <p style="color:var(--text-secondary);margin-bottom:2rem;">你访问的页面不存在或已被移除。</p>
      <A href="/" class="btn btn-primary">◁ 返回首页</A>
    </div>
  );
}

