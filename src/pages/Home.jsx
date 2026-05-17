import { A } from "@solidjs/router";
import { getAllPosts } from "../utils/posts";

export default function Home() {
  const posts = getAllPosts();
  return (
    <div>
      <section class="hero">
        <h1 class="glitch" data-text="DELTRIVX">DELTRIVX</h1>
        <div class="neo-divider"></div>
        <p>// 赛博空间中的文字碎片 //</p>
      </section>

      <section>
        <h2 style="color: var(--neon-blue); font-size: 1rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">
          ▸ 最新文章
        </h2>
        <div class="post-list">
          {posts.map((post) => (
            <A href={`/post/${post.slug}`} class="post-card">
              <div class="date">[ {post.date} ]</div>
              <h3>{post.title}</h3>
              <p style="color: var(--text-dim); font-size: 0.85rem; margin-top: 0.3rem;">
                {post.excerpt}
              </p>
              <div class="tags">
                {post.tags.map((tag) => (
                  <span class="tag">#{tag}</span>
                ))}
              </div>
            </A>
          ))}
        </div>
      </section>
    </div>
  );
}

