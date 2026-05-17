import { A } from "@solidjs/router";
import { getAllPosts } from "../utils/posts";

export default function Home() {
  const posts = getAllPosts();
  return (
    <div>
      <section class="hero">
        <div class="hero-content">
          <h1><span class="gradient-text">DELTRIVX</span></h1>
          <p class="subtitle">赛博空间中的文字碎片</p>
          <div class="hero-buttons">
            <A href="/blog" class="btn btn-primary">📝 阅读博客</A>
            <A href="/about" class="btn btn-outline" style="background:transparent;color:var(--text-primary);border:1px solid var(--glass-border);padding:0.85rem 2rem;border-radius:12px;font-weight:600;text-decoration:none;transition:all 0.3s;">ℹ️ 关于我</A>
          </div>
        </div>
      </section>

      <section>
        <h2 class="page-title">▸ 最新文章</h2>
        <div class="post-list">
          {posts.map((post) => (
            <A href={`/post/${post.slug}`} class="post-card">
              <div class="date">{post.date}</div>
              <h3>{post.title}</h3>
              <p class="excerpt">{post.excerpt}</p>
              <div class="tags">
                {post.tags.map((tag) => <span class="tag">#{tag}</span>)}
              </div>
            </A>
          ))}
        </div>
      </section>
    </div>
  );
}

