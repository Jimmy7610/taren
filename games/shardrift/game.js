// ==================================================
// INSTÄLLNINGAR FÖR SHARDRIFT
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 780,           // INSTÄLLNING - Ändra grundbredden på Shardrift-spelytan.
    canvasHeight: 520,          // INSTÄLLNING - Ändra grundhöjden på Shardrift-spelytan.
    shipTurnSpeed: 4.8,         // INSTÄLLNING - Ändra hur snabbt skeppet roterar (radianer/s).
    shipThrust: 260,            // INSTÄLLNING - Ändra kraften när skeppet accelererar (px/s^2).
    shipFriction: 0.992,        // INSTÄLLNING - Ändra hur mycket skeppet bromsas över tid (0.0 - 1.0).
    projectileSpeed: 520,       // INSTÄLLNING - Ändra skottens hastighet (px/s).
    fireCooldown: 190,          // INSTÄLLNING - Ändra tiden mellan skott i millisekunder.
    allowHoldToFire: true,      // INSTÄLLNING - Ändra om Space kan hållas inne för automatisk eldgivning.
    startingLives: 3,           // INSTÄLLNING - Ändra antal liv från start.
    bestScoreKey: "taren_shardrift_best_score", // INSTÄLLNING - Ändra localStorage-nyckeln för bästa poäng.
};

class Shardrift {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.wave = 1;
        this.bestScore = localStorage.getItem(CONFIG.bestScoreKey) || 0;
        
        this.gameState = 'ready'; // 'ready', 'playing', 'paused', 'game-over'
        
        this.ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, radius: 12 };
        this.projectiles = [];
        this.shards = [];
        this.particles = [];
        
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
        this.resetShip();
        this.projectiles = [];
        this.particles = [];
        this.startWave();
        
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-pause').classList.add('hidden');
    }

    reset() {
        this.start();
    }

    resetShip() {
        this.ship.x = this.canvas.width / 2;
        this.ship.y = this.canvas.height / 2;
        this.ship.vx = 0;
        this.ship.vy = 0;
        this.ship.angle = -Math.PI / 2;
        this.ship.invulnerable = 120; // frames
    }

    startWave() {
        this.shards = [];
        const shardCount = 2 + this.wave;
        for (let i = 0; i < shardCount; i++) {
            this.createShard();
        }
        this.updateHUD();
    }

    createShard(x, y, size = 3) {
        if (x === undefined) {
            // Spawn at edge
            if (Math.random() > 0.5) {
                x = Math.random() > 0.5 ? 0 : this.canvas.width;
                y = Math.random() * this.canvas.height;
            } else {
                x = Math.random() * this.canvas.width;
                y = Math.random() > 0.5 ? 0 : this.canvas.height;
            }
        }
        
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random() * 1.5) * (4 - size);
        
        // Random polygon for shard shape
        const points = [];
        const vertices = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < vertices; i++) {
            const a = (i / vertices) * Math.PI * 2;
            const r = (size * 12) * (0.7 + Math.random() * 0.6);
            points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        
        this.shards.push({
            x, y, 
            vx: Math.cos(angle) * speed * 60, 
            vy: Math.sin(angle) * speed * 60,
            radius: size * 12,
            size,
            points,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05
        });
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

        this.updateShip(dt);
        this.updateProjectiles(dt);
        this.updateShards(dt);
        this.updateParticles(dt);
        this.checkCollisions();
        
        if (this.shards.length === 0) {
            this.wave++;
            this.startWave();
        }
    }

    updateShip(dt) {
        const s = this.ship;
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) s.angle -= CONFIG.shipTurnSpeed * dt;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) s.angle += CONFIG.shipTurnSpeed * dt;
        
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            s.vx += Math.cos(s.angle) * CONFIG.shipThrust * dt;
            s.vy += Math.sin(s.angle) * CONFIG.shipThrust * dt;
        }
        
        s.vx *= CONFIG.shipFriction;
        s.vy *= CONFIG.shipFriction;
        
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        
        // Wrap
        if (s.x < 0) s.x = this.canvas.width;
        if (s.x > this.canvas.width) s.x = 0;
        if (s.y < 0) s.y = this.canvas.height;
        if (s.y > this.canvas.height) s.y = 0;
        
        if (s.invulnerable > 0) s.invulnerable--;
        
        // Fire
        if (this.keys['Space']) {
            const now = Date.now();
            if (now - this.lastFireTime > CONFIG.fireCooldown) {
                this.fire();
                this.lastFireTime = now;
                
                if (!CONFIG.allowHoldToFire) {
                    this.keys['Space'] = false;
                }
            }
        }
    }

    fire() {
        const s = this.ship;
        this.projectiles.push({
            x: s.x + Math.cos(s.angle) * s.radius,
            y: s.y + Math.sin(s.angle) * s.radius,
            vx: Math.cos(s.angle) * CONFIG.projectileSpeed,
            vy: Math.sin(s.angle) * CONFIG.projectileSpeed,
            life: 1.2 // seconds
        });
    }

    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            
            // Wrap
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            if (p.life <= 0) this.projectiles.splice(i, 1);
        }
    }

    updateShards(dt) {
        this.shards.forEach(s => {
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.angle += s.rotSpeed;
            
            if (s.x < 0) s.x = this.canvas.width;
            if (s.x > this.canvas.width) s.x = 0;
            if (s.y < 0) s.y = this.canvas.height;
            if (s.y > this.canvas.height) s.y = 0;
        });
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    checkCollisions() {
        const s = this.ship;
        
        // Projectile vs Shard
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            for (let j = this.shards.length - 1; j >= 0; j--) {
                const sh = this.shards[j];
                const dist = Math.sqrt((p.x - sh.x)**2 + (p.y - sh.y)**2);
                if (dist < sh.radius) {
                    this.score += (4 - sh.size) * 100;
                    this.createExplosion(sh.x, sh.y, sh.size * 5);
                    this.projectiles.splice(i, 1);
                    if (sh.size > 1) {
                        this.createShard(sh.x, sh.y, sh.size - 1);
                        this.createShard(sh.x, sh.y, sh.size - 1);
                    }
                    this.shards.splice(j, 1);
                    this.updateHUD();
                    break;
                }
            }
        }
        
        // Ship vs Shard
        if (s.invulnerable <= 0 && this.gameState === 'playing') {
            for (let sh of this.shards) {
                const dist = Math.sqrt((s.x - sh.x)**2 + (s.y - sh.y)**2);
                if (dist < s.radius + sh.radius) {
                    this.lives--;
                    this.createExplosion(s.x, s.y, 20);
                    this.updateHUD();
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetShip();
                    }
                    break;
                }
            }
        }
    }

    createExplosion(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? '#8b6cff' : '#4cc9f0'
            });
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
        this.ctx.fillStyle = '#09090b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 2, 2);
        });
        this.ctx.globalAlpha = 1.0;
        
        // Shards
        this.ctx.strokeStyle = '#8b6cff';
        this.ctx.lineWidth = 1.5;
        this.shards.forEach(s => {
            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.angle);
            this.ctx.beginPath();
            this.ctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++) {
                this.ctx.lineTo(s.points[i].x, s.points[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
        });
        
        // Projectiles
        this.ctx.fillStyle = '#4cc9f0';
        this.projectiles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Ship
        if ((this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'ready') && (this.ship.invulnerable <= 0 || Math.floor(Date.now() / 100) % 2 === 0)) {
            this.ctx.save();
            this.ctx.translate(this.ship.x, this.ship.y);
            this.ctx.rotate(this.ship.angle);
            
            this.ctx.strokeStyle = '#fafafa';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#4cc9f0';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(15, 0);
            this.ctx.lineTo(-10, -10);
            this.ctx.lineTo(-10, 10);
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Thrust flame
            if (this.keys['ArrowUp'] || this.keys['KeyW']) {
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0);
                this.ctx.lineTo(-20 - Math.random() * 10, 0);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
        
        this.ctx.shadowBlur = 0;
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000); // Cap dt
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new Shardrift();
