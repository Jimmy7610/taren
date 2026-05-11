/**
 * Pulseframe - Minimalist Reflex Game (Phase 1 Polish)
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
let displayScore = 0;
let wave = 1;
let waveTime = 0;
let bestScore = localStorage.getItem('pulseframe_best') || 0;

// Arena
let centerX, centerY, arenaRadius;
let arenaPulseScale = 1;
let arenaBaseAlpha = 0.1;
let arenaFlashIntensity = 0;

// Entities
let player;
let enemies = [];
let pickups = [];
let particles = [];
let ambientParticles = [];

// Input
let mouseX = 0;
let mouseY = 0;

// Mechanics
let nearMissCooldown = 0;
let nextSpawnTime = 0;
let enemyTimeScale = 1; // Used for ultra-subtle near-miss time dilation

// Resize handling
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    arenaRadius = Math.min(centerX, centerY) * 0.85; // slightly more padding
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
let masterGain, droneOsc, droneGain;

function initAudio() {
    if (!audioEnabled && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (!audioEnabled) {
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 1;
        
        // Ambient Drone
        droneOsc = audioCtx.createOscillator();
        droneGain = audioCtx.createGain();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 55; // Low hum
        droneGain.gain.value = 0; // Starts silent
        
        // Add subtle LFO to drone
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.5;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(droneOsc.frequency);
        
        droneOsc.connect(droneGain);
        droneGain.connect(masterGain);
        droneOsc.start();
        lfo.start();
    }
    audioEnabled = true;
    masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.1);
    droneGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 2);
}

function stopDrone() {
    if (droneGain) {
        droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 1);
    }
}

function playSound(type) {
    if (!audioEnabled) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(masterGain);
    
    const now = audioCtx.currentTime;
    
    if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.value = 5000;
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        
        // Silence drop effect
        masterGain.gain.setValueAtTime(1, now);
        masterGain.gain.setTargetAtTime(0.2, now, 0.05);
        masterGain.gain.setTargetAtTime(1, now + 0.5, 0.5);
        
        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'nearmiss') {
        // High frequency, sharp tick
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'laserCharge') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 1.5);
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
    } else if (type === 'laserFire') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(8000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
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
        this.vx = 0;
        this.vy = 0;
        this.baseRadius = 8;
        this.radius = 8;
        this.trail = [];
        this.speed = 0;
        this.time = 0;
    }

    update(dt) {
        this.time += dt;
        
        let targetX = mouseX;
        let targetY = mouseY;
        
        const d = dist(centerX, centerY, targetX, targetY);
        if (d > arenaRadius - this.baseRadius) {
            const angle = Math.atan2(targetY - centerY, targetX - centerX);
            targetX = centerX + Math.cos(angle) * (arenaRadius - this.baseRadius);
            targetY = centerY + Math.sin(angle) * (arenaRadius - this.baseRadius);
        }

        // Interpolation
        const oldX = this.x;
        const oldY = this.y;
        
        // Use smooth damping
        this.x = lerp(this.x, targetX, 15 * dt);
        this.y = lerp(this.y, targetY, 15 * dt);
        
        // Calculate velocity vector
        this.vx = (this.x - oldX) / dt;
        this.vy = (this.y - oldY) / dt;
        this.speed = Math.hypot(this.vx, this.vy);

        // Subtle breathing when idle
        const idlePulse = Math.sin(this.time * 4) * 1.5;
        this.radius = this.baseRadius + (this.speed < 50 ? idlePulse : 0);

        // Trail stretching based on speed
        this.trail.push({ x: this.x, y: this.y, alpha: 1, speed: this.speed });
        const maxTrail = Math.min(25, 10 + Math.floor(this.speed / 100));
        while (this.trail.length > maxTrail) this.trail.shift();
        
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha -= 6 * dt;
        }

        // Micro-particles when moving fast
        if (this.speed > 300 && Math.random() < 0.3) {
            const angle = Math.atan2(-this.vy, -this.vx) + (Math.random() - 0.5);
            particles.push(new MicroParticle(this.x, this.y, angle));
        }
    }

    draw(ctx) {
        // Draw trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            // Glow intensifies with speed
            const glowStrength = Math.min(1, this.speed / 1000);
            ctx.strokeStyle = `rgba(139, 108, 255, ${0.3 + glowStrength * 0.3})`;
            ctx.lineWidth = this.radius * 1.4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15 + Math.min(20, this.speed / 50);
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
        const targetAngle = angle + Math.PI + (Math.random() - 0.5) * 1.5;
        this.vx = Math.cos(targetAngle) * speed;
        this.vy = Math.sin(targetAngle) * speed;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Bounce
        const d = dist(centerX, centerY, this.x, this.y);
        if (d > arenaRadius - this.radius) {
            const angle = Math.atan2(this.y - centerY, this.x - centerX);
            this.x = centerX + Math.cos(angle) * (arenaRadius - this.radius - 1);
            this.y = centerY + Math.sin(angle) * (arenaRadius - this.radius - 1);
            
            const normalX = -Math.cos(angle);
            const normalY = -Math.sin(angle);
            const dot = this.vx * normalX + this.vy * normalY;
            this.vx = this.vx - 2 * dot * normalX;
            this.vy = this.vy - 2 * dot * normalY;
            
            // Arena edge reaction
            triggerArenaFlash(0.2, this.x, this.y);
        }

        checkCollision(this.x, this.y, this.radius);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(248, 113, 113, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class PulseWave {
    constructor() {
        this.x = centerX + (Math.random() - 0.5) * arenaRadius * 0.6;
        this.y = centerY + (Math.random() - 0.5) * arenaRadius * 0.6;
        this.radius = 1;
        this.maxRadius = arenaRadius * 1.3;
        this.speed = 100 + (wave * 15);
        this.thickness = 12;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.radius += this.speed * dt;
        if (this.radius > this.maxRadius) {
            this.markedForDeletion = true;
        }

        const d = dist(player.x, player.y, this.x, this.y);
        const distanceToEdge = Math.abs(d - this.radius);
        
        if (distanceToEdge < this.thickness / 2 + player.radius) {
            killPlayer();
        } else if (distanceToEdge < this.thickness / 2 + player.radius + 25) {
            triggerNearMiss();
        }
    }

    draw(ctx) {
        const alpha = Math.max(0, 1 - Math.pow(this.radius/this.maxRadius, 2));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.lineWidth = this.thickness;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(45, 212, 191, 0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class LaserSweep {
    constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.chargeTime = 1.5;
        this.fireTime = 0.4;
        this.state = 'CHARGE';
        this.markedForDeletion = false;
        
        playSound('laserCharge');
    }

    update(dt) {
        if (this.state === 'CHARGE') {
            this.chargeTime -= dt;
            
            // Smooth tracking
            const targetAngle = Math.atan2(player.y - centerY, player.x - centerX);
            let diff = targetAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            // Track slower as it gets closer to firing
            const trackingSpeed = Math.max(0.5, this.chargeTime * 2);
            this.angle += diff * trackingSpeed * dt;

            // Spawn charge sparks
            if (Math.random() < 0.4) {
                createParticles(centerX, centerY, '#c084fc', 1, 50);
            }

            if (this.chargeTime <= 0) {
                this.state = 'FIRE';
                playSound('laserFire');
                arenaFlashIntensity = 0.5; // Big arena flash on fire
            }
        } else if (this.state === 'FIRE') {
            this.fireTime -= dt;
            
            const dx = Math.cos(this.angle);
            const dy = Math.sin(this.angle);
            const px = player.x - centerX;
            const py = player.y - centerY;
            
            const distance = Math.abs(dx * py - dy * px);
            const dot = px * dx + py * dy;
            
            if (distance < player.radius + 12 && dot > 0) {
                killPlayer();
            } else if (distance < player.radius + 35 && dot > 0) {
                triggerNearMiss();
            }

            if (this.fireTime <= 0) {
                this.markedForDeletion = true;
            }
        }
    }

    draw(ctx) {
        const endX = centerX + Math.cos(this.angle) * arenaRadius * 1.5;
        const endY = centerY + Math.sin(this.angle) * arenaRadius * 1.5;

        if (this.state === 'CHARGE') {
            const chargeRatio = 1 - (this.chargeTime / 1.5);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(192, 132, 252, ${chargeRatio * 0.8})`;
            ctx.lineWidth = 2 + chargeRatio * 4;
            ctx.setLineDash([10, 15]);
            ctx.lineDashOffset = -Date.now() / 20;
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Core origin glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5 + chargeRatio * 15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192, 132, 252, ${chargeRatio})`;
            ctx.fill();
        } else {
            const fireRatio = this.fireTime / 0.4; // 1 to 0
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 25 * fireRatio;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 30 * fireRatio;
            ctx.shadowColor = '#c084fc';
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // White core beam
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 8 * fireRatio;
            ctx.stroke();
        }
    }
}

class Pickup {
    constructor() {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (arenaRadius * 0.7);
        this.x = centerX + Math.cos(angle) * r;
        this.y = centerY + Math.sin(angle) * r;
        this.radius = 5;
        this.markedForDeletion = false;
        this.life = 12;
        this.time = 0;
    }

    update(dt) {
        this.life -= dt;
        this.time += dt;
        if (this.life <= 0) this.markedForDeletion = true;

        // Subtle magnetism if close
        const d = dist(player.x, player.y, this.x, this.y);
        if (d < 60) {
            const amt = 2 * dt;
            this.x = lerp(this.x, player.x, amt);
            this.y = lerp(this.y, player.y, amt);
        }

        if (d < player.radius + this.radius + 5) {
            addScore(50);
            playSound('pickup');
            this.markedForDeletion = true;
            createParticles(this.x, this.y, '#fafafa', 8, 150);
        }
    }

    draw(ctx) {
        const pulse = Math.sin(this.time * 6) * 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#fafafa';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        
        // Blink when dying
        if (this.life < 3) {
            ctx.globalAlpha = Math.sin(this.life * 20) > 0 ? 1 : 0.3;
        } else {
            ctx.globalAlpha = 1;
        }
        
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color, maxSpeed = 300) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * maxSpeed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = 1 + Math.random();
        this.color = color;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // friction
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        this.life -= dt * this.decay;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class MicroParticle {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        const spread = (Math.random() - 0.5) * 0.5;
        const speed = 20 + Math.random() * 50;
        this.vx = Math.cos(angle + spread) * speed;
        this.vy = Math.sin(angle + spread) * speed;
        this.life = 0.5 + Math.random() * 0.5;
        this.markedForDeletion = false;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2;
        if (this.life <= 0) this.markedForDeletion = true;
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(139, 108, 255, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class AmbientParticle {
    constructor() {
        this.reset(true);
    }
    reset(randomizeParams = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        if (randomizeParams) {
            this.size = 2 + Math.random() * 6;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = -10 - Math.random() * 20; // Float up slowly
            this.opacity = 0.02 + Math.random() * 0.05;
        }
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
            this.reset();
            this.y = canvas.height + 10;
        }
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(139, 108, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Systems
function initAmbient() {
    ambientParticles = [];
    for (let i = 0; i < 30; i++) {
        ambientParticles.push(new AmbientParticle());
    }
}

function createParticles(x, y, color, count, maxSpeed = 300) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, maxSpeed));
    }
}

function checkCollision(ex, ey, er) {
    if (gameState !== 'PLAYING') return;
    const d = dist(player.x, player.y, ex, ey);
    
    if (d < player.radius + er) {
        killPlayer();
    } else if (d < player.radius + er + 35) {
        triggerNearMiss();
    }
}

function triggerNearMiss() {
    if (nearMissCooldown <= 0 && gameState === 'PLAYING') {
        addScore(15);
        playSound('nearmiss');
        nearMissCooldown = 1.5;
        
        // Time dilation: slow enemies, not player
        enemyTimeScale = 0.2;
        
        // Tiny cinematic pulse
        arenaPulseScale = 1.02;
        
        // Score popup styling
        nearMissIndicator.classList.remove('hidden');
        nearMissIndicator.classList.remove('near-miss-anim');
        void nearMissIndicator.offsetWidth; // force reflow
        
        // Map canvas coords to screen for absolute positioning
        const rect = canvas.getBoundingClientRect();
        const screenX = rect.left + player.x;
        const screenY = rect.top + player.y - 30; // Above player
        
        nearMissIndicator.style.left = `${screenX}px`;
        nearMissIndicator.style.top = `${screenY}px`;
        nearMissIndicator.classList.add('near-miss-anim');
        
        setTimeout(() => {
            if (nearMissIndicator.classList.contains('near-miss-anim')) {
                nearMissIndicator.classList.add('hidden');
                nearMissIndicator.classList.remove('near-miss-anim');
            }
        }, 800);
    }
}

function triggerArenaFlash(intensity, x, y) {
    arenaFlashIntensity = Math.max(arenaFlashIntensity, intensity);
    // Optional: could use x,y to draw a localized glow on the edge in draw()
}

function addScore(amount) {
    score += amount;
    displayScore = Math.floor(score);
    scoreDisplay.innerText = `Score: ${displayScore}`;
    
    // UI Pulse animation
    scoreDisplay.classList.remove('score-pulse');
    void scoreDisplay.offsetWidth;
    scoreDisplay.classList.add('score-pulse');
    setTimeout(() => scoreDisplay.classList.remove('score-pulse'), 150);
}

function killPlayer() {
    gameState = 'GAME_OVER';
    playSound('death');
    stopDrone();
    
    // Implosion effect
    // 1. Suck trail in
    player.trail = [];
    
    // 2. Burst out
    createParticles(player.x, player.y, '#fff', 40, 500);
    createParticles(player.x, player.y, '#8b6cff', 40, 400);
    
    arenaFlashIntensity = 1.0;
    
    hud.classList.add('hidden');
    
    if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem('pulseframe_best', bestScore);
    }
    
    finalScoreEl.innerText = Math.floor(score);
    bestScoreEl.innerText = bestScore;
    
    // Smooth delay for death screen
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 800);
}

function spawnThreats() {
    let enemyCount = enemies.length;
    // Smoother ramping
    let maxEnemies = Math.floor(2 + wave * 1.5);
    
    if (enemyCount < maxEnemies) {
        const rand = Math.random();
        if (wave === 1) {
            enemies.push(new EnemyOrb());
        } else if (wave === 2) {
            if (rand < 0.25) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        } else if (wave === 3) {
            if (rand < 0.2) enemies.push(new LaserSweep());
            else if (rand < 0.3) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        } else {
            if (rand < 0.25) enemies.push(new LaserSweep());
            else if (rand < 0.35) enemies.push(new PulseWave());
            else enemies.push(new EnemyOrb());
        }
    }

    if (Math.random() < 0.05 && pickups.length < 2) {
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
    displayScore = 0;
    wave = 1;
    waveTime = 0;
    nearMissCooldown = 0;
    enemyTimeScale = 1;
    arenaPulseScale = 1;
    arenaFlashIntensity = 0;
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    scoreDisplay.innerText = `Score: 0`;
    waveDisplay.innerText = `Wave 1`;
    
    initAmbient();
}

// Main Loop
function update(dt) {
    // Ambient always updates
    ambientParticles.forEach(p => p.update(dt));
    
    if (gameState !== 'PLAYING') {
        particles.forEach(p => p.update(dt));
        particles = particles.filter(p => !p.markedForDeletion);
        // Fade arena flash
        if (arenaFlashIntensity > 0) arenaFlashIntensity = Math.max(0, arenaFlashIntensity - dt * 2);
        return;
    }

    // Passive score
    addScore(dt * 15);
    waveTime += dt;
    
    // Recover time scale from near miss
    if (enemyTimeScale < 1) {
        enemyTimeScale += dt * 0.8;
        if (enemyTimeScale > 1) enemyTimeScale = 1;
    }
    
    if (nearMissCooldown > 0) nearMissCooldown -= dt;
    if (arenaPulseScale > 1) arenaPulseScale = Math.max(1, arenaPulseScale - dt * 0.5);
    if (arenaFlashIntensity > 0) arenaFlashIntensity = Math.max(0, arenaFlashIntensity - dt * 2);

    // Wave progression with breathing space
    if (waveTime > 25 && wave < 5) {
        wave++;
        waveTime = 0;
        addScore(500);
        waveDisplay.innerText = `Wave ${wave}`;
        waveDisplay.classList.add('score-pulse');
        setTimeout(() => waveDisplay.classList.remove('score-pulse'), 300);
        
        // Clear board logic / breather
        arenaFlashIntensity = 0.3;
        nextSpawnTime = 2.0; // 2 seconds of breathing room
    } else if (wave === 5 && waveTime > 25) {
        wave++;
        waveTime = 0;
        waveDisplay.innerText = `Wave ${wave}`;
    }

    nextSpawnTime -= dt;
    if (nextSpawnTime <= 0) {
        spawnThreats();
        // Dynamic spawn rate
        nextSpawnTime = Math.max(0.2, 0.6 - (wave * 0.05));
    }

    // Player updates at normal time
    player.update(dt);

    // Enemies update at dilated time
    const enemyDt = dt * enemyTimeScale;
    enemies.forEach(e => e.update(enemyDt));
    pickups.forEach(p => p.update(dt));
    particles.forEach(p => p.update(dt));

    enemies = enemies.filter(e => !e.markedForDeletion);
    pickups = pickups.filter(p => !p.markedForDeletion);
    particles = particles.filter(p => !p.markedForDeletion);
}

function draw() {
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ambient background
    ambientParticles.forEach(p => p.draw(ctx));

    ctx.save();
    
    // Cinematic scale pulse
    if (arenaPulseScale > 1) {
        ctx.translate(centerX, centerY);
        ctx.scale(arenaPulseScale, arenaPulseScale);
        ctx.translate(-centerX, -centerY);
    }

    // Draw Arena
    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    
    const baseAlpha = gameState === 'GAME_OVER' ? 0.05 : 0.15;
    const pulseAlpha = Math.sin(Date.now() / 800) * 0.05;
    const currentAlpha = baseAlpha + pulseAlpha + arenaFlashIntensity;
    
    ctx.strokeStyle = `rgba(139, 108, 255, ${Math.min(1, currentAlpha)})`;
    ctx.lineWidth = 2 + arenaFlashIntensity * 5;
    
    if (arenaFlashIntensity > 0) {
        ctx.shadowBlur = 20 * arenaFlashIntensity;
        ctx.shadowColor = '#8b6cff';
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    if (gameState === 'PLAYING') {
        pickups.forEach(p => p.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        player.draw(ctx);
    }
    
    particles.forEach(p => p.draw(ctx));
    
    ctx.restore();
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

initAmbient();

// Start loop
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
});
