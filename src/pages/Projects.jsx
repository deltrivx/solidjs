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
            links: [{ url: "https://homeassistant.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.3:8123", label: "🔗 内网" }],
        },
        {
            icon: "🌐",
            name: "Chromium",
            desc: "远程 Chromium 浏览器实例，支持自动化脚本和 Web 测试。",
            tech: ["Chromium", "浏览器"],
            links: [{ url: "https://chromium.deltrivx.com", label: "🌐 公网" }, { url: "http://localhost:3010", label: "🔗 内网" }],
        },
        {
            icon: "🐻",
            name: "Aria2",
            desc: "轻量级命令行下载工具，支持 HTTP/HTTPS/BT/Metalink 协议，搭配 AriaNg WebUI 管理。",
            tech: ["aria2", "下载"],
            links: [{ url: "https://aria2.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:6880", label: "🔗 内网" }],
        },
        {
            icon: "⚡",
            name: "qBittorrent",
            desc: "轻量级 BT/PT 下载客户端，功能完善，支持 WebUI 远程管理。",
            tech: ["qBittorrent", "BT/PT"],
            links: [{ url: "https://qbittorrent.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:8080", label: "🔗 内网" }],
        },
        {
            icon: "📡",
            name: "Transmission",
            desc: "轻量 BT 下载客户端，资源占用低，适合 7x24 运行。",
            tech: ["Transmission", "BT"],
            links: [{ url: "https://transmission.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:9091", label: "🔗 内网" }],
        },
        {
            icon: "🎛️",
            name: "Emby 影音中心",
            desc: "全平台媒体管理与串流服务器，整合影视资源库。",
            tech: ["Emby Server", "NAS"],
            links: [{ url: "https://emby.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:8096", label: "🔗 内网" }],
        },
        {
            icon: "🎯",
            name: "MoviePilot",
            desc: "自动化影视资源订阅与下载管理，辅以豆瓣榜单同步。",
            tech: ["MoviePilot", "自动化"],
            links: [{ url: "https://moviepilot.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:3000", label: "🔗 内网" }],
        },
        {
            icon: "📡",
            name: "PanSou 搜盘引擎",
            desc: "网盘资源搜索引擎，聚合多方盘源。",
            tech: ["搜索", "网盘"],
            links: [{ url: "https://pansou.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:8880", label: "🔗 内网" }],
        },
        {
            icon: "📥",
            name: "Telegram 下载器",
            desc: "自动抓取 Telegram 频道的媒体文件并下载到本地存储。",
            tech: ["Telegram API", "自动化"],
            links: [{ url: "https://telegram.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:5000", label: "🔗 内网" }],
        },
        {
            icon: "📊",
            name: "Portainer 容器管理",
            desc: "Docker 容器集群图形化管理面板。",
            tech: ["Docker", "管理"],
            links: [{ url: "https://portainer.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:9000", label: "🔗 内网" }],
        },
        {
            icon: "🔄",
            name: "DDNS-GO",
            desc: "自动更新域名解析记录，保障内网服务通过域名可达。",
            tech: ["DNS", "自动运维"],
            links: [{ url: "https://ddnsgo.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:9876", label: "🔗 内网" }],
        },
        {
            icon: "📂",
            name: "OpenList 目录索引",
            desc: "轻量级文件目录索引与分享系统。",
            tech: ["文件管理", "分享"],
            links: [{ url: "https://openlist.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:5244", label: "🔗 内网" }],
        },
        {
            icon: "🐧",
            name: "Xunlei 迅雷远程",
            desc: "远程迅雷下载服务，支持磁力链接与 BT 下载。",
            tech: ["下载", "P2P"],
            links: [{ url: "https://xunlei.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:2345", label: "🔗 内网" }],
        },
        {
            icon: "📖",
            name: "Byte-Muse 数字书房",
            desc: "个人知识管理与阅读平台。",
            tech: ["阅读", "知识管理"],
            links: [{ url: "https://bytemuse.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:3750", label: "🔗 内网" }],
        },
        {
            icon: "🔗",
            name: "OmniBox 综合工具",
            desc: "多功能集成工具箱。",
            tech: ["工具", "集成"],
            links: [{ url: "https://omnibox.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:7023", label: "🔗 内网" }],
        },
        {
            icon: "🎥",
            name: "咪咕视频助手",
            desc: "咪咕视频资源抓取与下载工具。",
            tech: ["视频", "抓取"],
            links: [{ url: "https://migu.deltrivx.com", label: "🌐 公网" }, { url: "http://192.168.31.2:1234", label: "🔗 内网" }],
        },
        {
            icon: "⚡",
            name: "KV Rocks 缓存",
            desc: "Apache Kvrocks 高性能键值存储，兼容 Redis 协议。",
            tech: ["Kvrocks", "Redis"], 
            links: [{ url: "http://192.168.31.2:6666", label: "🔗 内网" }],
        },

        {
            icon: "☁️",
            name: "Cloud Saver",
            desc: "云盘资源保存与同步工具。",
            tech: ["云盘", "同步"],
            links: [{ url: "http://192.168.31.2:8032", label: "🔗 内网" }],
        },
        {
            icon: "🛡️",
            name: "FlareSolverr",
            desc: "Cloudflare 挑战解析代理，为自动化工具提供免验证访问。",
            tech: ["代理", "反爬"],
            links: [{ url: "http://192.168.31.2:8191", label: "🔗 内网" }],
        },
        {
            icon: "🗄️",
            name: "PostgreSQL 数据库",
            desc: "PostgreSQL 17 关系型数据库，为各服务提供可靠的数据存储。",
            tech: ["PostgreSQL", "数据库"],
            links: [{ url: "http://192.168.31.2:5433", label: "🔗 内网" }],
        },
        {
            icon: "📦",
            name: "Redis 缓存",
            desc: "高性能内存缓存数据库，加速服务响应。",
            tech: ["Redis", "缓存"],
            links: [{ url: "http://192.168.31.2:6379", label: "🔗 内网" }],
        },
        {
            icon: "📺",
            name: "MDC 媒体下载中心",
            desc: "多平台媒体资源下载与聚合中心。",
            tech: ["媒体", "下载"],
            links: [{ url: "http://192.168.31.2:9208", label: "🔗 内网" }],
        },
        {
            icon: "🔐",
            name: "AllInSSL 证书管理",
            desc: "SSL 证书全生命周期管理工具。",
            tech: ["SSL", "证书"],
            links: [{ url: "http://192.168.31.2:8888/allinssl", label: "🔗 内网" }],
        },
        {
            icon: "🌐",
            name: "Nginx 反向代理",
            desc: "Web 服务反向代理与负载均衡网关。",
            tech: ["Nginx", "代理"],
            links: [{ url: "http://192.168.31.2:80", label: "🔗 内网" }],
        },

    ];

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
