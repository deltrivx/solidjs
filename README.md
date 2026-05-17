# 🚀 DeltrivX Blog

> **赛博朋克风格个人博客** — SolidJS + Vite + GitHub Pages + Cloudflare

<p align="center">
  <img src="https://www.deltrivx.com/favicon.svg" width="64" alt="logo" />
</p>

<p align="center">
  <a href="https://www.deltrivx.com" target="_blank"><strong>🌐 www.deltrivx.com</strong></a>
</p>

---

## ✨ 特性

| | |
|---|---|
| ⚡ **SolidJS** | 高性能响应式前端框架，无虚拟 DOM 开销 |
| 🎨 **赛博朋克设计** | 深色磨砂玻璃主题 · 紫青渐变 · 粒子动画背景 |
| 📝 **Markdown 驱动** | 文章以 Markdown 编写，前端解析渲染 |
| 🚀 **GitHub Actions** | 推送即自动构建部署，零运维成本 |
| 🌍 **Cloudflare CDN** | 全球加速 + DDoS 防护 + Tunnel 内网穿透 |
| 📱 **响应式布局** | 完美适配桌面与移动端 |

## 🏗️ 技术栈

```
Frontend      SolidJS · Vite · @solidjs/router
Styling       CSS Custom Properties · Glassmorphism
Content       Markdown · gray-matter · marked
CI/CD         GitHub Actions · peaceiris/gh-pages
Infra         Cloudflare DNS · Cloudflare Tunnel
```

## 📂 项目结构

```
src/
├── index.jsx           # 入口
├── App.jsx             # 路由配置
├── App.css             # 全局样式
├── components/         # 通用组件
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── Particles.jsx   # 粒子背景动画
└── pages/              # 页面
    ├── Home.jsx        # 首页 · Hero + 探索卡片
    ├── About.jsx       # 关于
    ├── Skills.jsx      # 技能栈
    ├── Projects.jsx    # 精选项目
    └── Contact.jsx     # 联系方式
public/
└── posts/              # Markdown 文章
```

## 🚀 快速开始

```bash
# 克隆
git clone https://github.com/deltrivx/solidjs.git
cd solidjs

# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build
```

## 📝 新增文章

1. 在 `src/utils/posts.js` 的 `POSTS` 数组中添加条目
2. 在 `public/posts/` 下创建对应的 `.md` 文件
3. 推送至 `main` 分支，GitHub Actions 自动构建部署

## 🔗 相关链接

- [博客主页](https://www.deltrivx.com)
- [Cloudflare Tunnel Manager Skill](https://github.com/deltrivx/solidjs)
- [宝塔面板](https://www.bt.cn)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/deltrivx">DeltrivX</a>
</p>
