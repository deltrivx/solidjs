import { onMount } from "solid-js";
import { initReveal, initTilt } from "../utils/animations";

export default function Projects() {
    onMount(() => {
        initReveal();
        initTilt();
    });

    const projects = [
        {
            icon: "🐮",
            name: "飞牛系统",
            desc: "FnOS 私有云系统，提供存储、影音、下载等一站式服务。",
            tech: ["FnOS", "NAS"],
            links: [{ url: "https://fnos.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:5080", label: "🔗 内网" }],
        },
        {
            icon: "🪟",
            name: "宝塔面板",
            desc: "服务器运维管理面板，可视化网站、数据库、FTP 管理。",
            tech: ["面板", "运维"],
            links: [{ url: "https://baota.deltrivx.com/btpanel", label: "🌐 公网" }, { url: "http://192.168.31.5:19190/btpanel", label: "🔗 内网" }],
        },
        {
            icon: "🏠",
            name: "HomeAssistant",
            desc: "智能家居控制系统，集成灯光、传感器、自动化场景等设备。",
            tech: ["IoT", "智能家居"],
            links: [{ url: "http://192.168.31.3:8123", label: "🔗 内网" }],
        },
        {
            icon: "🌐",
            name: "Chromium",
            desc: "远程 Chromium 浏览器实例，支持自动化脚本和 Web 测试。",
            tech: ["Chromium", "浏览器"],
            links: [{ url: "https://chromium.deltrivx.com", label: "🌐 公网" }],
        },


    return (
        <section id="projects">
            <div class="section-header reveal">
                <h2><span class="gradient-text">精选项目</span></h2>
                <p>一些我引以为豪的作品</p>
            </div>
            <div class="projects-grid">
                {projects.map((p, i) => (
                    <div class="project-card reveal tilt-card" style={{ animationDelay: i * 0.1 + "s" }}>
                        <div class="project-preview">
                            <div class="project-preview-bg" style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                {p.icon}
                            </div>
                        </div>
                        <div class="project-info">
                            <h3>{p.name}</h3>
                            <p>{p.desc}</p>
                            <div class="project-tech">
                                {p.tech.map(t => <span class="tech-tag">{t}</span>)}
                            </div>
                            <div class="project-links">
                                {p.links.map(lk => <a href={lk.url} target="_blank" rel="noopener">{lk.label}</a>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
