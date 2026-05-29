import { onMount } from 'solid-js';
import { initReveal, initTilt } from '../utils/animations';
import { A } from '@solidjs/router';

export default function Articles() {
    onMount(() => {
        initReveal();
        initTilt();
    });

    const articles = [
        {
            title: '飞牛系统商店版 OpenClaw 优化实战：启动守护、路径复刻与更新按钮增强',
            subtitle: 'FnOS App Center · trim.openclaw · systemd 兜底自启 · Gateway loopback · 插件优先更新',
            date: '2026-05-29',
            tags: ['FnOS', 'OpenClaw', 'systemd', 'Bun', 'Gateway'],
            summary: '完整记录飞牛系统商店版 OpenClaw 的运行路径、用户权限、systemd 兜底启动脚本、控制面板检查更新按钮逻辑，以及更新前检查商店插件、优先升级渠道插件的优化方案。按文中路径与脚本，可在另一台 FnOS 设备复刻一致运行环境。',
            slug: 'fnos-openclaw-store-optimization'
        },
        {
            title: 'iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南',
            subtitle: 'Cloudflare Tunnel + Sub-Store + Shadowsocks over WSS · 从零到可用的内网回家方案',
            date: '2026-05-29',
            tags: ['iOS', 'Quantumult X', 'Cloudflare', 'Sub-Store', '内网穿透', 'Shadowsocks'],
            summary: '从 Cloudflare Tunnel 创建到 Nginx IPv6 直连加速、Sub-Store 订阅分发，再到 Quantumult X 双节点策略组配置，完整覆盖 iOS 设备异地接入内网的整个链路。双路径冗余：Fast 路径提供最低延迟，CF 路径提供最大兼容性。',
            slug: 'homenet-qx'
        },
        {
            title: '从零搭建双栈域名体系：Cloudflare Tunnel + 内网穿透完全指南',
            subtitle: 'V4/V6 双栈 · 域名统一接入 · 内外网分流防回环',
            date: '2026-05-28',
            tags: ['Cloudflare', 'Tunnel', '双栈', '内网穿透', 'DNS'],
            summary: '详解如何通过 Cloudflare Tunnel 实现域名的 V4+V6 双栈接入，涵盖 CF 前期准备、Tunnel 部署、DNS 批量配置、内网防回环方案，以及最终的双栈验证方法。',
            slug: 'dual-stack-domain'
        },
    ];

    return (
        <section id="articles">
            <div class="section-header reveal">
                <h2><span class="gradient-text">文章</span></h2>
                <p>分享我的思考和见解</p>
            </div>
            <div class="articles-list">
                {articles.map((a, i) => (
                    <A href={`/article/${a.slug}`} class="article-card reveal tilt-card" style={{ animationDelay: i * 0.1 + 's' }}>
                        <div class="article-meta">
                            <span class="article-date">{a.date}</span>
                            <div class="article-tags">
                                {a.tags.map(t => <span class="tech-tag">{t}</span>)}
                            </div>
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.summary}</p>
                        <span class="read-more">阅读更多 →</span>
                    </A>
                ))}
            </div>
        </section>
    );
}
