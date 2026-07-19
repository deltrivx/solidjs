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
            title: 'FnOS 双 OpenClaw 实例并存实战：商店版 + 自装版隔离、端口与 systemd 复刻',
            subtitle: 'trim.openclaw · openclaw-user · loopback 端口隔离 · Monitor/Gateway 双链路 · 权限分用户',
            date: '2026-07-19',
            tags: ['FnOS', 'OpenClaw', '双实例', 'systemd', 'Gateway', '隔离'],
            summary: '记录同一台飞牛上并行两套 OpenClaw（商店版 + 用户自装版）的路径、用户、端口、systemd、Monitor、代理与权限隔离，附完整复刻步骤、验证矩阵与常见踩坑，便于新机按文落地。',
            slug: 'fnos-openclaw-dual-instance'
        },
        {
            title: '家庭内网双栈隧道架构：Cloudflare Tunnel + Nginx 统一域名入口实战',
            subtitle: 'Cloudflare Tunnel · CoreDNS · Nginx 反代 · 双栈 · 内网防回环 · 端口隔离 · Shadowsocks over WSS',
            date: '2026-07-10',
            tags: ['Cloudflare', 'Tunnel', 'Nginx', '双栈', '内网穿透', 'CoreDNS', 'HomeNet'],
            summary: '完整记录家庭内网域名统一接入体系：Cloudflare Tunnel 公网穿透、Nginx 18080 统一路由分发、CoreDNS 内网域名劫持、主路由 hosts 防回环、双栈 V4/V6 支持、Shadowsocks over WSS 直连节点。所有配置可完整复刻。',
            slug: 'tunnel-dualstack-full-guide'
        },
        {
            title: 'SubStore HomeNet 优化实战：流量显示修复与 ss-direct 8443 独立链路',
            subtitle: 'SubStore · Quantumult X · Shadowsocks over WSS · Cloudflare Tunnel · Nginx 端口隔离',
            date: '2026-06-12',
            tags: ['SubStore', 'Quantumult X', 'Cloudflare', 'Nginx', 'HomeNet', 'WSS'],
            summary: '完整记录 HomeNet 双节点优化：先修复 SubStore / Quantumult X 流量显示，再将 ss-direct 从 443 拆到 8443 独立 TLS 入口。文章全程域名脱敏，包含 Nginx、Node.js userinfo、QX 节点、gost 验证与回滚方案，新手可按步骤复刻。',
            slug: 'substore-homenet-traffic-8443'
        },
        {
            title: 'OpenClaw 记忆优化实战：Ollama Embedding + memory-core 本地化部署',
            subtitle: 'Nomic Embed Text · FnOS Ollama 容器 · 多 OpenClaw 实例 provider 统一管理 · memory-core 语义搜索恢复',
            date: '2026-06-01',
            tags: ['OpenClaw', 'Ollama', 'Embedding', 'Memory-Core', 'FnOS', 'Nomic'],
            summary: 'OpenAI embedding 503 → 自建 Ollama nomic-embed-text 向量化服务。多 OpenClaw 实例 provider 同步管理、Telegram 通道故障排查、ingress 锁文件恢复。从配置到运维全覆盖。',
            slug: 'memory-embed-ollama'
        },
        {
            title: '飞牛系统商店版 OpenClaw 优化实战：Monitor API 开机引导、状态修复与更新按钮',
            subtitle: 'FnOS App Center · trim.openclaw · bootstrap 引导 · Gateway loopback · 权限隔离',
            date: '2026-07-20',
            tags: ['FnOS', 'OpenClaw', 'systemd', 'Bun', 'Monitor', 'Gateway'],
            summary: '2026-07 修订：商店版 OpenClaw 开机由 trim-openclaw-gateway + bootstrap 经 Monitor API action=start 引导；废弃 ensure 直拉 Gateway。含路径、权限基线、更新顺序、备份清单与排错，可在另一台 FnOS 复刻。',
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
            title: '飞牛系统（FnOS）核显温度显示补丁：从原理到实现',
            subtitle: 'Intel iGPU · WebSocket 代理 · JS 注入 · bind-mount · FnOS 资源监控面板适配',
            date: '2026-05-24',
            tags: ['FnOS', 'iGPU', 'Intel', 'WebSocket', '系统补丁'],
            summary: 'Intel 核显在 FnOS 面板中温度显示为空的解决方案。通过 WebSocket 代理拦截资源监控通信，将 CPU 封装温度回填到 GPU 温度字段，配合 JS 注入和 bind-mount 挂载实现无痕补丁。文章附带完整的部署脚本、卸载方法、备份恢复流程和故障排查指南。',
            slug: 'fnos-igpu-temp'
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
                <h2><span class="gradient-text">技术实战</span></h2>
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