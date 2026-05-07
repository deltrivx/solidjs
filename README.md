# DeltrivX 个人主页 (SolidJS 版)

这个项目已经从传统的静态 HTML 迁移到了现代的 **SolidJS** 框架，并集成了多种炫酷的交互特效。

## 🚀 核心特性
- **框架**: SolidJS + @solidjs/router (v0.14)
- **打包工具**: Vite
- **交互特效**:
  - 鼠标跟随聚光灯背景
  - 卡片 3D 物理倾斜效果 (Tilt Effect)
  - 标题流光霓虹动画
  - 页面平滑过渡 (View Transitions API)
- **部署优化**:
  - 自动路由重定向 (via .htaccess & index.php)
  - Hash 路由模式，兼容所有服务器环境

## 📁 目录结构
- `src/`: 核心源代码目录
  - `components/`: 可复用的页面组件
  - `pages/`: 独立视图/页面组件
  - `data/`: 静态数据
  - `utils/`: 动画及工具函数
  - `css/style.css`: 全局样式表
  - `App.jsx` & `index.jsx`: 根组件与应用入口
- `dist/`: 打包生成的正式上线文件
- `vite.config.js`: 构建配置文件

## 🛠️ 开发与构建
### 安装依赖
```bash
npm install
```

### 开发环境预览
```bash
npm run dev
```

### 生产打包
```bash
npm run build
```

### 生产环境预览
```bash
npm run serve
```

---
*Made with ❤️ by DeltrivX*

## 🙏 致谢

感谢原作者 [KrisChan](https://github.com/Chan-Kris) 开发的优秀 SolidJS 博客模板。本项目基于 [Kris-personal_blog](https://github.com/Chan-Kris/Kris-personal_blog) 项目进行个性化修改和部署。
