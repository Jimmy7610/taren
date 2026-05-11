/**
 * main.js
 * Minimal JavaScript for UI enhancements.
 * Game logic is strictly forbidden here.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Generate unique visuals for each placeholder card
    const visuals = document.querySelectorAll('.card-visual-inner');
    
    const colors = [
        ['#8b6cff', '#4f3e99'],
        ['#4ade80', '#14532d'],
        ['#60a5fa', '#1e3a8a'],
        ['#f472b6', '#831843'],
        ['#c084fc', '#581c87'],
        ['#2dd4bf', '#134e4a'],
        ['#fbbf24', '#78350f'],
        ['#f87171', '#7f1d1d'],
        ['#94a3b8', '#334155']
    ];

    visuals.forEach((visual, index) => {
        const [primary, secondary] = colors[index % colors.length];
        
        // Abstract gradient generation
        const angle = 45 + (index * 35) % 360;
        const xPos = 20 + (index * 15) % 60;
        const yPos = 30 + (index * 25) % 40;
        
        if (index % 3 === 0) {
            visual.style.background = `radial-gradient(circle at ${xPos}% ${yPos}%, ${primary}40, ${secondary}80, transparent)`;
        } else if (index % 3 === 1) {
            visual.style.background = `linear-gradient(${angle}deg, ${primary}30, ${secondary}90)`;
        } else {
            visual.style.background = `conic-gradient(from ${angle}deg at ${xPos}% ${yPos}%, ${primary}50, ${secondary}90, #18181b)`;
        }

        // Add CSS glowing orb effect
        const orb = document.createElement('div');
        orb.style.position = 'absolute';
        orb.style.width = '100px';
        orb.style.height = '100px';
        orb.style.borderRadius = '50%';
        orb.style.background = primary;
        orb.style.filter = 'blur(40px)';
        orb.style.opacity = '0.4';
        orb.style.top = `${yPos}%`;
        orb.style.left = `${xPos}%`;
        orb.style.transform = 'translate(-50%, -50%)';
        
        visual.appendChild(orb);
    });

    // Ambient Particles for Homepage
    const ambientCanvas = document.getElementById('ambient-canvas');
    if (ambientCanvas) {
        const ctx = ambientCanvas.getContext('2d', { alpha: true });
        
        const PARTICLE_COUNT = 18; // INSTÄLLNING - Ändra hur många ambient particles som visas på startsidan.
        const PARTICLE_SPEED = 0.15; // INSTÄLLNING - Ändra hur snabbt partiklarna rör sig i bakgrunden.
        
        let width, height;
        let particles = [];
        
        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            ambientCanvas.width = width;
            ambientCanvas.height = height;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        class AmbientMote {
            constructor() {
                this.reset(true);
            }
            reset(randomize = false) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                if (randomize) {
                    this.size = 1 + Math.random() * 3;
                    this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
                    this.vy = -PARTICLE_SPEED - Math.random() * PARTICLE_SPEED;
                    this.opacity = 0.05 + Math.random() * 0.15;
                    this.phase = Math.random() * Math.PI * 2;
                }
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.phase += 0.01;
                
                if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                    this.reset();
                    this.y = height + 10;
                }
            }
            draw(ctx) {
                const currentOpacity = this.opacity * (0.5 + Math.sin(this.phase) * 0.5);
                ctx.fillStyle = `rgba(139, 108, 255, ${currentOpacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new AmbientMote());
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });
            requestAnimationFrame(animate);
        }
        
        animate();
    }
});
