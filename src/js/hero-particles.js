/**
 * Рой частиц за hero: затухание при приближении к верху блока #how-it-works
 */
(function initHeroParticles() {
    const canvas = document.getElementById('hero-particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    const targetSection = document.getElementById('how-it-works');
    if (!hero || !ctx) return;

    let particles = [];
    let globalOpacity = 1;
    const count = 160;
    const mouse = { x: null, y: null, active: false };

    /** Рисование и движение частиц на H(hero) + столько px вниз; зона курсора = весь canvas */
    const extendBelow = 40;

    const config = {
        mainColor: '139, 92, 246',
        particleRadius: 1.5,
        lineDist: 130,
        mouseRadius: 180,
    };

    /**
     * Потухание привязано к верхней границе #how-it-works в вьюпорте:
     * пока верх блока ниже полосы — частицы на полную; к моменту, когда верх
     * доходит до верхней кромки окна (top === 0), прозрачность 0.
     */
    function updateOpacity() {
        if (!targetSection) return;

        const top = targetSection.getBoundingClientRect().top;
        const vh = window.innerHeight;
        const fadeBand = Math.min(220, vh * 0.32);

        if (top >= fadeBand) {
            globalOpacity = 1;
        } else if (top <= 0) {
            globalOpacity = 0;
        } else {
            globalOpacity = top / fadeBand;
        }
    }

    window.addEventListener('scroll', updateOpacity, { passive: true });
    window.addEventListener('resize', updateOpacity, { passive: true });

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
    });

    class Particle {
        constructor(w, h) {
            this.bounds = { w, h };
            this.init();
        }

        init() {
            const { w, h } = this.bounds;
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1.2;
            this.vy = (Math.random() - 0.5) * 1.2;
            this.accX = 0;
            this.accY = 0;
            this.friction = 0.98;
            this.noiseSeed = Math.random() * 1000;
        }

        setBounds(w, h) {
            this.bounds = { w, h };
            if (this.x > w) this.x = w;
            if (this.y > h) this.y = h;
        }

        update() {
            const { w, h } = this.bounds;

            this.accX += Math.cos(Date.now() * 0.0005 + this.noiseSeed) * 0.006;
            this.accY += Math.sin(Date.now() * 0.0005 + this.noiseSeed) * 0.006;

            if (mouse.active && globalOpacity > 0.1) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

                if (dist < config.mouseRadius) {
                    const force = (config.mouseRadius - dist) / config.mouseRadius;
                    this.accX += (dx / dist) * force * 0.6;
                    this.accY += (dy / dist) * force * 0.6;
                }
            }

            this.vx += this.accX;
            this.vy += this.accY;
            this.vx *= this.friction;
            this.vy *= this.friction;

            this.x += this.vx;
            this.y += this.vy;

            this.accX = 0;
            this.accY = 0;

            if (this.x < 0) this.x = w;
            if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h;
            if (this.y > h) this.y = 0;
        }

        draw() {
            if (globalOpacity <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, config.particleRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${config.mainColor}, ${0.8 * globalOpacity})`;
            ctx.fill();
        }
    }

    function initCanvas() {
        const w = hero.offsetWidth;
        const h = hero.offsetHeight + extendBelow;
        if (w < 1 || h < 1) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (particles.length === 0) {
            particles = Array.from({ length: count }, () => new Particle(w, h));
        } else {
            particles.forEach((p) => {
                p.setBounds(w, h);
            });
        }
        updateOpacity();
    }

    function animate() {
        const w = hero.offsetWidth;
        const h = hero.offsetHeight + extendBelow;
        ctx.clearRect(0, 0, w, h);

        if (globalOpacity > 0 && particles.length) {
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update();
                p1.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.lineDist) {
                        const opacity = (1 - dist / config.lineDist) * 0.25 * globalOpacity;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${config.mainColor}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', initCanvas);
    const ro = new ResizeObserver(() => initCanvas());
    ro.observe(hero);

    initCanvas();
    animate();
})();
