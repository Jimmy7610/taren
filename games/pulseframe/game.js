/**
 * Pulseframe - Minimalist Reflex Game
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('game-container');

// UI Elements
const hud = document.getElementById('hud');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const waveDisplay = document.getElementById('waveDisplay');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const nearMissIndicator = document.getElementById('nearMissIndicator');

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let lastTime = 0;
let score = 0;
let wave = 1;
let waveTime = 0;
let bestScore = localStorage.getItem('pulseframe_best') || 0;

// Arena
let centerX, centerY, arenaRadius;

// Entities
let player;
let enemies = [];
let pickups = [];
let particles = [];

// Input
let mouseX = 0;
let mouseY = 0;

// Mechanics
let nearMissCooldown = 0;
let nextSpawnTime = 0;

// Resize handling
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    // Keep arena circular and padded from edges
    arenaRadius = Math.min(centerX, centerY) * 0.9;
}
window.addEventListener('resize', resize);
resize();

// Input listeners
container.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Audio System (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = false;

function initAudio() {
    if (!audioEnabled && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    audioEnabled = true;
}

function playSound(type) {
    if (!audioEnabled) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'nearmiss') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'laser') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// Math Utils
function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

// Classes
class Player {
    constructor() {
        this.x = centerX;
        this.y = centerY;
        this.radius = 8;
        this.trail = [];
    }

    update(dt) {
        // Constrain mouse target to arena
        let targetX = mouseX;
        let targetY = mouseY;
        const d = dist(centerX, centerY, targetX, targetY);
        if (d > arenaRadius - this.radius) {
            const angle = Math.atan2(targetY - centerY, targetX - centerX);
            targetX = centerX + Math.cos(angle) * (arenaRadius - this.radius);
            targetY = centerY + Math.sin(angle) * (arenaRadius - this.radius);
        }

        // Smooth movement
        this.x = lerp(this.x, targetX, 15 * dt);
        this.y = lerp(this.y, targetY, 15 * dt);

        // Trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 15) this.trail.shift();
        
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha -= 5 * dt;
        }
    }

    draw(ctx) {
        // Draw trail
        ctx.beginPath();
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
        }
        ctx.strokeStyle = `rgba(139, 108, 255, 0.4)`;
        ctx.lineWidth = this.radius * 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#8b6cff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class EnemyOrb {
    constructor() {
        this.radius = 10;
        const angle = Math.random() * Math.PI * 2;
        this.x = centerX + Math.cos(angle) * arenaRadius;
        this.y = centerY + Math.sin(angle) * arenaRadius;
        
        const speed = 150 + Math.random() * 100 + (wave * 20);
        // Target somewhere near center
        const targetAngle = angle + Math.PI + (Math.random() - 0.5) * 1.5;
        this.vx = Math.cos(targetAngle) * speed;
        this.vy = Math.sin(targetAngle) * speed;
        this.markedForDeletion = false;
        this.active = true;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Bounce off arena
        const d = dist(centerX, centerY, this.x, this.y);
        if (d > arenaRadius - this.radius) {
            // Push back inside
            const angle = Math.atan2(this.y - centerY, this.x - centerX);
            this.x = centerX + Math.cos(angle) * (arenaRadius - this.radius - 1);
            this.y = centerY + Math.sin(angle) * (arenaRadius - this.radius - 1);
            
            // Reflect velocity
            const normalX = -Math.cos(angle);
            const normalY = -Math.sin(angle);
            const dot = this.vx * normalX + this.vy * normalY;
            this.vx = this.vx - 2 * dot * normalX;
            this.vy = this.vy - 2 * dot * normalY;
        }

        checkCollision(this.x, this.y, this.radius);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f87171';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class PulseWave {
    constructor() {
        this.x = centerX + (Math.random() - 0.5) * arenaRadius * 0.5;
        this.y = centerY + (Math.random() - 0.5) * arenaRadius * 0.5;
        this.radius = 1;
        this.maxRadius = arenaRadius * 1.2;
        this.speed = 100 + (wave * 20);
        this.thickness = 10;
        this.markedForDeletion = false;
        this.active = true;
    }

    update(dt) {
        this.radius += this.speed * dt;
        if (this.radius > this.maxRadius) {
            this.markedForDeletion = true;
        }

        const d = dist(player.x, player.y, this.x, this.y);
        if (Math.abs(d - this.radius) < this.thickness / 2 + player.radius) {
            killPlayer();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(192, 132, 252, ${1 - this.radius/this.maxRadius})`;
        ctx.lineWidth = this.thickness;
        ctx.stroke();
    }
}

class LaserSweep {
    constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.chargeTime = 1.5;
        this.fireTime = 0.5;
        this.state = 'CHARGE';
        this.markedForDeletion = false;
        this.active = true;
    }

    update(dt) {
        if (this.state === 'CHARGE') {
            this.chargeTime -= dt;
            // Track player slowly
            const targetAngle = Math.atan2(player.y - centerY, player.x - centerX);
            // Simple angle lerp
            let diff = targetAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.angle += diff * 2 * dt;

            if (this.chargeTime <= 0) {
                this.state = 'FIRE';
                playSound('laser');
            }
        } else if (this.state === 'FIRE') {
            this.fireTime -= dt;
            
            // Math for line segment collision
            const dx = Math.cos(this.angle);
            const dy = Math.sin(this.angle);
            const px = player.x - centerX;
            const py = player.y - centerY;
            
            // Cross product to get distance from point to line passing through center
            const distance = Math.abs(dx * py - dy * px);
            // Check if player is on the correct side of the center (laser is a ray, not a full line)
            const dot = px * dx + py * dy;
            
            if (distance < player.radius + 15 && dot > 0) {
                killPlayer();
            }

            if (this.fireTime <= 0) {
                this.markedForDeletion = true;
            }
        }
    }

    draw(ctx) {
        const endX = centerX + Math.cos(this.angle) * arenaRadius * 2;
        const endY = centerY + Math.sin(this.angle) * arenaRadius * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        
        if (this.state === 'CHARGE') {
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 30 * (this.fireTime / 0.5);
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#2dd4bf';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

class Pickup {
    constructor() {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (arenaRadius * 0.8);
        this.x = centerX + Math.cos(angle) * r;
        this.y = centerY + Math.sin(angle) * r;
        this.radius = 6;
        this.markedForDeletion = false;
        this.life = 10;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.markedForDeletion = true;

        const d = dist(player.x, player.y, this.x, this.y);
        if (d < player.radius + this.radius) {
            score += 50;
            updateHUD();
            playSound('pickup');
            this.markedForDeletion = true;
            createParticles(this.x, this.y, '#4ade80', 10);
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80';
        ctx.globalAlpha = Math.min(1, this.life);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.color = color;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Systems
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function checkCollision(ex, ey, er) {
    if (gameState !== 'PLAYING') return;
    const d = dist(player.x, player.y, ex, ey);
    
    if (d < player.radius + er) {
        killPlayer();
    } else if (d < player.radius + er + 30) {
        // Near miss
        if (nearMissCooldown <= 0) {
            score += 15;
            updateHUD();
            playSound('nearmiss');
            nearMissCooldown = 1.5;
            
            nearMissIndicator.classList.remove('hidden');
            // reset animation
            nearMissIndicator.style.animation = 'none';
            nearMissIndicator.offsetHeight; /* trigger reflow */
            nearMissIndicator.style.animation = null;
            
            setTimeout(() => {
                nearMissIndicator.classList.add('hidden');
            }, 1000);
        }
    }
}

function killPlayer() {
    gameState = 'GAME_OVER';
    playSound('death');
    createParticles(player.x, player.y, '#fff', 30);
    createParticles(player.x, player.y, '#8b6cff', 30);
    
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem('pulseframe_best', bestScore);
    }
    
    finalScoreEl.innerText = Math.floor(score);
    bestScoreEl.innerText = bestScore;
}

function updateHUD() {
    scoreDisplay.innerText = `Score: ${Math.floor(score)}`;
    waveDisplay.innerText = `Wave ${wave}`;
}

function spawnThreats() {
    // Wave definitions
    let enemyCount = enemies.length;
    let maxEnemies = 3 + wave * 2;
    
    if (enemyCount < maxEnemies) {
        const rand = Math.random();
        if (wave === 1) {
            enemies.push(new EnemyOrb());
        } else if (wave === 2) {
            if (rand < 0.2) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        } else if (wave === 3) {
            if (rand < 0.15) enemies.push(new LaserSweep());
            else if (rand < 0.3) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        } else {
            // Mix
            if (rand < 0.2) enemies.push(new LaserSweep());
            else if (rand < 0.4) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        }
    }

    if (Math.random() < 0.02 && pickups.length < 2) {
        pickups.push(new Pickup());
    }
}

function resetGame() {
    player = new Player();
    mouseX = centerX;
    mouseY = centerY;
    enemies = [];
    pickups = [];
    particles = [];
    score = 0;
    wave = 1;
    waveTime = 0;
    nearMissCooldown = 0;
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    updateHUD();
}

// Main Loop
function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Passive score
    score += dt * 10;
    waveTime += dt;
    
    if (nearMissCooldown > 0) nearMissCooldown -= dt;

    // Wave progression
    if (waveTime > 20 && wave < 5) {
        wave++;
        waveTime = 0;
        score += 500; // Wave clear bonus
        updateHUD();
    } else if (wave === 5 && waveTime > 20) {
        // Endless intensification
        wave++;
        waveTime = 0;
        updateHUD();
    }

    nextSpawnTime -= dt;
    if (nextSpawnTime <= 0) {
        spawnThreats();
        nextSpawnTime = 0.5 - Math.min(0.4, wave * 0.05);
    }

    player.update(dt);

    enemies.forEach(e => e.update(dt));
    pickups.forEach(p => p.update(dt));
    particles.forEach(p => p.update(dt));

    enemies = enemies.filter(e => !e.markedForDeletion);
    pickups = pickups.filter(p => !p.markedForDeletion);
    particles = particles.filter(p => !p.markedForDeletion);
    
    // Update score display frame by frame
    updateHUD();
}

function draw() {
    // Clear screen with a slight fade for motion blur effect on the arena
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Arena
    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(139, 108, 255, ${0.1 + Math.sin(Date.now()/500)*0.05})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (gameState === 'PLAYING') {
        pickups.forEach(p => p.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        player.draw(ctx);
    }
    
    particles.forEach(p => p.draw(ctx));
}

function loop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; // Cap dt to prevent massive jumps on tab switch
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// Setup listeners
document.getElementById('startBtn').addEventListener('click', () => {
    initAudio();
    resetGame();
});

document.getElementById('retryBtn').addEventListener('click', () => {
    initAudio();
    resetGame();
});

// Start loop
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
});
