// ==================================================
// INSTÄLLNINGAR FÖR NIGHT ARRAY
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 760,           // INSTÄLLNING - Ändra grundbredden på Night Array-spelytan.
    canvasHeight: 520,          // INSTÄLLNING - Ändra grundhöjden på Night Array-spelytan.
    playerSpeed: 420,           // INSTÄLLNING - Ändra spelarens rörelsehastighet (px/s).
    projectileSpeed: 520,       // INSTÄLLNING - Ändra spelarens skotthastighet (px/s).
    fireCooldown: 260,          // INSTÄLLNING - Ändra tiden mellan spelarens skott (ms).
    allowHoldToFire: true,      // INSTÄLLNING - Ändra om Space kan hållas inne för automatisk eldgivning.
    enemyCols: 9,               // INSTÄLLNING - Ändra antal fiender per rad.
    enemyRows: 4,               // INSTÄLLNING - Ändra antal fienderader.
    enemyStepDown: 18,          // INSTÄLLNING - Ändra hur långt formationen går ned när den byter riktning.
    startingLives: 3,           // INSTÄLLNING - Ändra antal liv från start.
    bestScoreKey: "taren_night_array_best_score", // INSTÄLLNING - Ändra localStorage-nyckeln för bästa poäng.

    // VISUAL POLISH
    enemyCoreGlow: 20,          // INSTÄLLNING - Ändra hur starkt fiendernas kärnor lyser.
    cannonGlowStrength: 25,     // INSTÄLLNING - Ändra hur starkt spelarens kanon lyser.
    projectileTrailAlpha: 0.25, // INSTÄLLNING - Ändra hur tydlig projektilernas ljussvans är.
    gridAlpha: 0.04,            // INSTÄLLNING - Hur tydligt rutnätet i bakgrunden är.
};

class NightArray {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.wave = 1;
        this.bestScore = localStorage.getItem(CONFIG.bestScoreKey) || 0;
        
        this.gameState = 'ready'; // 'ready', 'playing', 'paused', 'game-over'
        
        this.player = { x: 0, y: 0, w: 30, h: 10 };
        this.projectiles = [];
        this.enemies = [];
        this.enemyProjectiles = [];
        this.enemyDir = 1; // 1 = right, -1 = left
        this.enemySpeed = 40;
        
        this.keys = {};
        this.lastTime = 0;
        this.lastFireTime = 0;
        
        this.init();
    }

    init() {
        this.canvas.width = CONFIG.canvasWidth;
        this.canvas.height = CONFIG.canvasHeight;
        
        document.getElementById('best-score').textContent = this.bestScore;
        
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                if (this.gameState === 'ready' || this.gameState === 'game-over') {
                    this.start();
                }
            }
            
            if (e.key.toLowerCase() === 'p') this.togglePause();
            if (e.key.toLowerCase() === 'r') this.reset();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        if (document.activeElement) document.activeElement.blur();
        
        this.gameState = 'playing';
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.wave = 1;
        this.player.x = (this.canvas.width - this.player.w) / 2;
        this.player.y = this.canvas.height - 40;
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.startWave();
        
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-pause').classList.add('hidden');
    }

    reset() {
        this.start();
    }

    startWave() {
        this.enemies = [];
        this.enemyDir = 1;
        this.enemySpeed = 40 + (this.wave * 10);
        this.particles = [];
        
        const spacingX = 60;
        const spacingY = 50;
        const startX = (this.canvas.width - (CONFIG.enemyCols - 1) * spacingX) / 2;
        const startY = 60;
        
        for (let r = 0; r < CONFIG.enemyRows; r++) {
            for (let c = 0; c < CONFIG.enemyCols; c++) {
                this.enemies.push({
                    x: startX + c * spacingX,
                    y: startY + r * spacingY,
                    w: 24,
                    h: 18,
                    type: r % 2
                });
            }
        }
        this.updateHUD();
    }

    togglePause() {
        if (this.gameState !== 'playing' && this.gameState !== 'paused') return;
        
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else {
            this.gameState = 'playing';
        }
        
        document.getElementById('game-pause').classList.toggle('hidden', this.gameState !== 'paused');
        document.getElementById('pause-btn').textContent = this.gameState === 'paused' ? "Resume" : "Pause";
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    update(dt) {
        if (this.gameState !== 'playing') return;

        this.updatePlayer(dt);
        this.updateProjectiles(dt);
        this.updateEnemies(dt);
        this.updateParticles(dt);
        this.checkCollisions();
        
        if (this.enemies.length === 0) {
            this.wave++;
            this.startWave();
        }
    }

    updatePlayer(dt) {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= CONFIG.playerSpeed * dt;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += CONFIG.playerSpeed * dt;
        
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.w, this.player.x));
        
        if (this.keys['Space']) {
            const now = Date.now();
            if (now - this.lastFireTime > CONFIG.fireCooldown) {
                this.fire();
                this.lastFireTime = now;
                
                // If hold to fire is disabled, we clear the key immediately
                if (!CONFIG.allowHoldToFire) {
                    this.keys['Space'] = false;
                }
            }
        }
    }

    fire() {
        this.projectiles.push({
            x: this.player.x + this.player.w / 2,
            y: this.player.y,
            vy: -CONFIG.projectileSpeed
        });
    }

    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.y += p.vy * dt;
            if (p.y < 0) this.projectiles.splice(i, 1);
        }
        
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            p.y += p.vy * dt;
            if (p.y > this.canvas.height) this.enemyProjectiles.splice(i, 1);
        }
    }

    updateEnemies(dt) {
        let edgeHit = false;
        const totalPossible = CONFIG.enemyCols * CONFIG.enemyRows;
        const currentSpeed = this.enemySpeed * (1 + (totalPossible - this.enemies.length) / totalPossible);
        
        this.enemies.forEach(e => {
            e.x += currentSpeed * this.enemyDir * dt;
            if (e.x < 10 || e.x + e.w > this.canvas.width - 10) edgeHit = true;
        });
        
        if (edgeHit) {
            this.enemyDir *= -1;
            this.enemies.forEach(e => {
                e.y += CONFIG.enemyStepDown;
                if (e.y + e.h > this.player.y) this.gameOver();
            });
        }
        
        // Randomly fire
        if (Math.random() < 0.02 * (1 + this.wave * 0.1) && this.enemies.length > 0) {
            const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            this.enemyProjectiles.push({
                x: shooter.x + shooter.w / 2,
                y: shooter.y + shooter.h,
                vy: 200 + this.wave * 10
            });
        }
    }

    updateParticles(dt) {
        if (!this.particles) this.particles = [];
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    createExplosion(x, y, color) {
        if (!this.particles) this.particles = [];
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.4 + Math.random() * 0.4,
                color
            });
        }
    }

    checkCollisions() {
        // Player Projectile vs Enemy
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                if (p.x > e.x && p.x < e.x + e.w && p.y > e.y && p.y < e.y + e.h) {
                    const color = e.type === 0 ? '#8b6cff' : '#fbbf24';
                    this.createExplosion(e.x + e.w/2, e.y + e.h/2, color);
                    this.enemies.splice(j, 1);
                    this.projectiles.splice(i, 1);
                    this.score += 100;
                    this.updateHUD();
                    break;
                }
            }
        }
        
        // Enemy Projectile vs Player
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            if (p.x > this.player.x && p.x < this.player.x + this.player.w && p.y > this.player.y && p.y < this.player.y + this.player.h) {
                this.createExplosion(p.x, p.y, '#4cc9f0');
                this.enemyProjectiles.splice(i, 1);
                this.lives--;
                this.updateHUD();
                if (this.lives <= 0) this.gameOver();
                break;
            }
        }
    }

    gameOver() {
        this.gameState = 'game-over';
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(CONFIG.bestScoreKey, this.bestScore);
        }
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').classList.remove('hidden');
    }

    draw() {
        // Tactical Night Arena Background
        const bgGrad = this.ctx.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 0, this.canvas.width/2, this.canvas.height/2, this.canvas.width);
        bgGrad.addColorStop(0, '#0c0c0e');
        bgGrad.addColorStop(1, '#050507');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Subtle Grid
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.gridAlpha})`;
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Particles
        if (this.particles) {
            this.particles.forEach(p => {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, 2, 2);
            });
            this.ctx.globalAlpha = 1.0;
        }
        
        // Enemies - Luminous Geometric Entities
        this.enemies.forEach(e => {
            const color = e.type === 0 ? '#8b6cff' : '#fbbf24';
            this.ctx.fillStyle = color;
            this.ctx.shadowBlur = CONFIG.enemyCoreGlow;
            this.ctx.shadowColor = color;
            
            this.ctx.beginPath();
            this.ctx.moveTo(e.x + e.w * 0.2, e.y);
            this.ctx.lineTo(e.x + e.w * 0.8, e.y);
            this.ctx.lineTo(e.x + e.w, e.y + e.h * 0.4);
            this.ctx.lineTo(e.x + e.w * 0.7, e.y + e.h);
            this.ctx.lineTo(e.x + e.w * 0.3, e.y + e.h);
            this.ctx.lineTo(e.x, e.y + e.h * 0.4);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Inner Core Glow
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.fillRect(e.x + e.w * 0.35, e.y + e.h * 0.4, e.w * 0.3, 2);
        });
        
        // Projectiles - Soft Glow & Trail
        this.projectiles.forEach(p => {
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = '#4cc9f0';
            this.ctx.shadowColor = '#4cc9f0';
            this.ctx.fillRect(p.x - 1, p.y, 2, 12);
            
            // Trail
            this.ctx.globalAlpha = CONFIG.projectileTrailAlpha;
            this.ctx.fillRect(p.x - 1, p.y + 12, 2, 8);
            this.ctx.globalAlpha = 1.0;
        });
        
        this.enemyProjectiles.forEach(p => {
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.shadowColor = '#fbbf24';
            this.ctx.fillRect(p.x - 1, p.y - 8, 2, 8);
            
            // Trail
            this.ctx.globalAlpha = CONFIG.projectileTrailAlpha;
            this.ctx.fillRect(p.x - 1, p.y - 14, 2, 6);
            this.ctx.globalAlpha = 1.0;
        });
        
        // Player Cannon - Luminous Defense Shape
        if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'ready') {
            const playerColor = '#4cc9f0';
            this.ctx.fillStyle = playerColor;
            this.ctx.shadowBlur = CONFIG.cannonGlowStrength;
            this.ctx.shadowColor = playerColor;
            
            const grad = this.ctx.createLinearGradient(this.player.x, this.player.y, this.player.x, this.player.y + this.player.h);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, playerColor);
            this.ctx.fillStyle = grad;

            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x, this.player.y + this.player.h);
            this.ctx.lineTo(this.player.x + this.player.w, this.player.y + this.player.h);
            this.ctx.lineTo(this.player.x + this.player.w, this.player.y + 4);
            this.ctx.lineTo(this.player.x + this.player.w / 2 + 5, this.player.y + 4);
            this.ctx.lineTo(this.player.x + this.player.w / 2, this.player.y);
            this.ctx.lineTo(this.player.x + this.player.w / 2 - 5, this.player.y + 4);
            this.ctx.lineTo(this.player.x, this.player.y + 4);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000); // Cap dt to prevent huge jumps
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new NightArray();
