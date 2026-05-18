export function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 100);
            }
        });
    }, { threshold: 0.15 });
    revealElements.forEach(el => observer.observe(el));
}

export function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        const inner = card.querySelector('.tilt-card-inner') || card;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // 旋转角度限制在 10 度以内
            const rotateY = ((x - centerX) / centerX) * 10;
            
            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
    });
}