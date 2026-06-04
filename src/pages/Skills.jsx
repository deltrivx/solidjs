import { onMount, For } from 'solid-js';
import { initReveal, initTilt } from '../utils/animations';
import skillsData from '../data/skillsData';

export default function Skills() {
    onMount(() => {
        initReveal();
        initTilt();

        // 技能条滚动动画：进入视口时填充宽度
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fills = entry.target.querySelectorAll('.skill-bar-fill');
                    fills.forEach((fill, i) => {
                        const level = fill.dataset.level;
                        setTimeout(() => {
                            fill.style.width = level + '%';
                        }, i * 80);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        // 延迟等待 DOM 渲染后绑定观察器
        setTimeout(() => {
            document.querySelectorAll('.skill-bar-group').forEach(g => observer.observe(g));
        }, 100);
    });

    return (
        <section id="skills">
            <div class="section-header reveal">
                <h2><span class="gradient-text">技能栈</span></h2>
                <p>持续学习，不断突破技术边界</p>
            </div>
            <div class="skills-grid">
                <For each={skillsData}>
                    {(skill) => (
                        <div class="skill-card reveal tilt-card">
                            <div class="skill-icon">{skill.icon}</div>
                            <h3>{skill.title}</h3>
                            <p>{skill.description}</p>
                            <div class="skill-tags">
                                <For each={skill.tags}>
                                    {(tag) => <span class="skill-tag">{tag.name}</span>}
                                </For>
                            </div>
                            <div class="skill-bar-group">
                                <For each={skill.tags}>
                                    {(tag) => (
                                        <div class="skill-bar-item">
                                            <div class="skill-bar-header">
                                                <span>{tag.name}</span>
                                                <span>{tag.level}%</span>
                                            </div>
                                            <div class="skill-bar-track">
                                                <div class="skill-bar-fill" data-level={tag.level} style="width: 0"></div>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </section>
    );
}
