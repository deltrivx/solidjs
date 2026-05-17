import { getAllPosts } from "../utils/posts";
import { A } from "@solidjs/router";

export default function Blog() {
  const posts = getAllPosts();
  return (
    <div>
      <h2 style="color: var(--neon-pink); font-size: 1.3rem; margin-bottom: 1.5rem;">
        ▸ 文章归档
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
    </div>
  );
}

