import { marked } from "marked";
import matter from "gray-matter";

// 文章列表（手动维护，每新增一篇文章在此添加）
const POSTS = [
  {
    slug: "hello-world",
    title: "Hello, Cyber World",
    date: "2026-05-17",
    tags: ["SolidJS", "博客", "赛博朋克"],
    excerpt: "欢迎来到我的赛博朋克风格个人博客。",
  },
];

export function getAllPosts() {
  return POSTS;
}

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}

export async function renderMarkdown(slug) {
  try {
    const resp = await fetch(`/posts/${slug}.md`);
    if (!resp.ok) return null;
    const text = await resp.text();
    const { content } = matter(text);
    return marked(content);
  } catch {
    return null;
  }
}

