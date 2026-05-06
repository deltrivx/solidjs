import { onMount, For } from 'solid-js'; // 导入 For 组件
import { initReveal, initTilt } from './animations';
import skillsData from './skillsData'; // 导入技能数据

export default function Skills() {
    onMount(() => {
        initReveal();
        initTilt();
    });

    return (
        <section id="skills">
            <div class="section-header reveal">
                <h2><span class="gradient-text">技能栈</span></h2>
                <p>持续学习，不断突破技术边界</p>
            </div>
            <div class="skills-grid">
                {/* 使用 SolidJS 的 For 组件动态渲染技能卡片 */}
                <For each={skillsData}>
                    {(skill) => (
                        <div class="skill-card reveal tilt-card">
                            <div class="skill-icon">{skill.icon}</div>
                            <h3>{skill.title}</h3>
                            <p>{skill.description}</p>
                            <div class="skill-tags">
                                {/* 动态渲染每个技能卡片的标签 */}
                                <For each={skill.tags}>
                                    {(tag) => <span class="skill-tag">{tag}</span>}
                                </For>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </section>
    );
}