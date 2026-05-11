/**
 * main.js
 * Minimal JavaScript for UI enhancements.
 * Game logic is strictly forbidden here.
 */

document.addEventListener('DOMContentLoaded', () => {
    // JavaScript visual generation removed in favor of thematic CSS in global.css

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
