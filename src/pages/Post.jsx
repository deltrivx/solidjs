import { createSignal, createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import { getPost, renderMarkdown } from "../utils/posts";

export default function Post() {
  const params = useParams();
  const [html, setHtml] = createSignal("");
  const [post, setPost] = createSignal(null);

  createEffect(async () => {
    const p = getPost(params.slug);
    setPost(p);
    if (p) {
      const h = await renderMarkdown(params.slug);
      setHtml(h || "<p>文章加载失败</p>");
    }
  });

  return (
    <div>
      {post() ? (
        <>
          <div class="post-header">
            <h1>{post().title}</h1>
            <div class="meta">
              [ {post().date} ] &nbsp;|&nbsp; {post().tags.map((t) => `#${t}`).join(" ")}
            </div>
          </div>
          <div class="post-content" innerHTML={html()}></div>
        </>
      ) : (
        <p style="color: var(--text-dim);">文章不存在</p>
      )}
    </div>
  );
}

