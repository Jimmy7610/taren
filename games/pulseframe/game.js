/**
 * Pulseframe - Minimalist Reflex Game (Phase 1 Polish)
 */

// ==================================================
// INSTÄLLNINGAR FÖR PULSEFRAME
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    player: {
        smoothing: 18, // INSTÄLLNING - Ändra hur mjukt orben följer musen. Lägre värde = mer glid, högre värde = snabbare respons.
        radius: 8, // INSTÄLLNING - Ändra spelarorbens basstorlek. Högre värde = större orb och lättare att träffas.
        trailLengthMax: 20, // INSTÄLLNING - Ändra max antal punkter i spelarens svans vid hög fart.
        trailLengthMin: 12, // INSTÄLLNING - Ändra minsta antal punkter i spelarens svans.
        trailFadeSpeed: 8, // INSTÄLLNING - Ändra hur snabbt svansen bleknar bort.
        idlePulseSpeed: 4, // INSTÄLLNING - Ändra hur snabbt orben "andas" när den står still.
        idlePulseIntensity: 1.5, // INSTÄLLNING - Ändra hur mycket orben växer/krymper när den andas.
        microParticleSpeedThreshold: 200, // INSTÄLLNING - Ändra hur snabbt man måste röra sig för att släppa små partiklar.
        glowIntensityMult: 50, // INSTÄLLNING - Ändra hur mycket glöden ökar vid fart. Lägre = ökar snabbare.
    },
    nearMiss: {
        distancePadding: 35, // INSTÄLLNING - Ändra hur nära spelaren måste vara ett hot (utöver hitboxen) för att få Near Miss.
        bonus: 15, // INSTÄLLNING - Ändra hur många poäng en Near Miss ger.
        cooldown: 0.8, // INSTÄLLNING - Ändra hur ofta Near Miss kan triggas, i sekunder.
        timeDilationScale: 0.35, // INSTÄLLNING - Ändra hur mycket tiden saktas ner vid extremt nära Near Miss. Lägre värde = mer slowmotion.
        timeDilationRecovery: 3.5, // INSTÄLLNING - Ändra hur snabbt tiden återgår till normalt (högre = snabbare).
        arenaPulseScale: 1.02, // INSTÄLLNING - Ändra hur mycket arenan "hoppar" till vid en near miss.
        popupLifetime: 600, // INSTÄLLNING - Ändra hur länge "+15" texten visas, i millisekunder.
    },
    arena: {
        paddingMult: 0.85, // INSTÄLLNING - Ändra hur mycket marginal arenan har från fönstrets kant (0.85 = 85% av skärmen).
        baseAlpha: 0.15, // INSTÄLLNING - Ändra arenans grundglöd.
        pulseAlpha: 0.05, // INSTÄLLNING - Ändra hur mycket arenans kant pulserar i glöd.
        pulseSpeed: 800, // INSTÄLLNING - Ändra hastigheten på arenans andning (millisekunder per cykel).
    },
    scoring: {
        passiveRate: 15, // INSTÄLLNING - Ändra hur många poäng man får per sekund bara för att överleva.
        waveClearBonus: 250, // INSTÄLLNING - Ändra hur mycket bonus man får vid klarad våg.
        waveDuration: 25, // INSTÄLLNING - Ändra hur lång tid en våg varar (i sekunder).
        breatherDuration: 2.5, // INSTÄLLNING - Ändra hur lång andningspausen är mellan intensiva sekvenser. Högre värde = lugnare tempo.
    },
    threats: {
        enemyOrb: {
            baseSpeed: 150, // INSTÄLLNING - Ändra basfarten för studsande fiender.
            speedVariance: 100, // INSTÄLLNING - Ändra hur mycket fiendens fart kan slumpas.
            waveSpeedMult: 20, // INSTÄLLNING - Ändra hur mycket snabbare de blir per våg.
            radius: 10, // INSTÄLLNING - Ändra storleken på studsande fiender.
        },
        pulseWave: {
            baseSpeed: 100, // INSTÄLLNING - Ändra basfarten för expanderande vågor.
            waveSpeedMult: 15, // INSTÄLLNING - Ändra hur mycket snabbare vågorna expanderar per nivå.
            thickness: 12, // INSTÄLLNING - Ändra hur tjock den dödliga väggen är.
            maxRadiusMult: 1.3, // INSTÄLLNING - Ändra hur stor vågen blir jämfört med arenan innan den försvinner.
        },
        laser: {
            chargeTime: 1.2, // INSTÄLLNING - Ändra hur länge lasern siktar/varnar innan den skjuter (sekunder). Högre värde = lättare och mer rättvist.
            fireTime: 0.4, // INSTÄLLNING - Ändra hur länge lasern är aktiv/dödlig efter skottet (sekunder).
            collisionPadding: 10, // INSTÄLLNING - Ändra hur bred laserträffen är. Lägre värde = mer förlåtande.
            chargeTrackingSpeed: 2.5, // INSTÄLLNING - Ändra hur snabbt lasern följer efter spelaren under siktandet.
        }
    },
    pickups: {
        spawnChance: 0.05, // INSTÄLLNING - Ändra chansen (per spawn-tick) att en pickup dyker upp.
        maxOnScreen: 2, // INSTÄLLNING - Ändra hur många pickups som max får finnas samtidigt.
        scoreValue: 50, // INSTÄLLNING - Ändra hur många poäng en pickup ger.
        lifetime: 12, // INSTÄLLNING - Ändra hur länge en pickup lever innan den försvinner (sekunder).
        magnetDistance: 60, // INSTÄLLNING - Ändra hur nära spelaren måste vara för att suga åt sig en pickup.
        magnetStrength: 2, // INSTÄLLNING - Ändra hur starkt pickupen sugs mot spelaren.
        radius: 5, // INSTÄLLNING - Ändra storleken på pickups.
    },
    particles: {
        ambientCount: 30, // INSTÄLLNING - Ändra hur många ambient-partiklar som rör sig i bakgrunden.
        deathCount: 40, // INSTÄLLNING - Ändra hur många partiklar som sprängs ut vid död.
        pickupCount: 8, // INSTÄLLNING - Ändra hur många partiklar som flyger ut vid pickup.
    },
    audio: {
        droneVolume: 0.08, // INSTÄLLNING - Ändra volymen på bakgrundsbrummet.
        masterRampTime: 0.1, // INSTÄLLNING - Ändra hur mjukt ljudet startar.
    },
    ui: {
        deathOverlayDelay: 280, // INSTÄLLNING - Ändra hur snabbt Game Over-rutan visas efter död. Lägre värde = snabbare restart-känsla.
    }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('game-container');

// UI Elements
const hud = document.querySelector('.game-stats-grid');
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
let arenaBaseAlpha = SETTINGS.arena.baseAlpha;
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
let enemyTimeScale = 1;

// Resize handling
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    arenaRadius = Math.min(centerX, centerY) * SETTINGS.arena.paddingMult;
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
        
        droneOsc = audioCtx.createOscillator();
        droneGain = audioCtx.createGain();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 55;
        droneGain.gain.value = 0;
        
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
    masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, SETTINGS.audio.masterRampTime);
    droneGain.gain.setTargetAtTime(SETTINGS.audio.droneVolume, audioCtx.currentTime, 2);
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
        
        masterGain.gain.setValueAtTime(1, now);
        masterGain.gain.setTargetAtTime(0.2, now, 0.05);
        masterGain.gain.setTargetAtTime(1, now + 0.5, 0.5);
        
        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'nearmiss') {
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
        osc.frequency.exponentialRampToValueAtTime(800, now + SETTINGS.threats.laser.chargeTime);
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + SETTINGS.threats.laser.chargeTime);
        osc.start(now);
        osc.stop(now + SETTINGS.threats.laser.chargeTime);
    } else if (type === 'laserFire') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + SETTINGS.threats.laser.fireTime);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + SETTINGS.threats.laser.fireTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(8000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + SETTINGS.threats.laser.fireTime);
        osc.start(now);
        osc.stop(now + SETTINGS.threats.laser.fireTime);
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
        this.baseRadius = SETTINGS.player.radius;
        this.radius = SETTINGS.player.radius;
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

        const oldX = this.x;
        const oldY = this.y;
        
        this.x = lerp(this.x, targetX, SETTINGS.player.smoothing * dt);
        this.y = lerp(this.y, targetY, SETTINGS.player.smoothing * dt);
        
        this.vx = (this.x - oldX) / dt;
        this.vy = (this.y - oldY) / dt;
        this.speed = Math.hypot(this.vx, this.vy);

        const idlePulse = Math.sin(this.time * SETTINGS.player.idlePulseSpeed) * SETTINGS.player.idlePulseIntensity;
        this.radius = this.baseRadius + (this.speed < 50 ? idlePulse : 0);

        this.trail.push({ x: this.x, y: this.y, alpha: 1, speed: this.speed });
        const maxTrail = Math.min(SETTINGS.player.trailLengthMax, SETTINGS.player.trailLengthMin + Math.floor(this.speed / 100));
        while (this.trail.length > maxTrail) this.trail.shift();
        
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha -= SETTINGS.player.trailFadeSpeed * dt;
        }

        if (this.speed > SETTINGS.player.microParticleSpeedThreshold && Math.random() < 0.3) {
            const angle = Math.atan2(-this.vy, -this.vx) + (Math.random() - 0.5);
            particles.push(new MicroParticle(this.x, this.y, angle));
        }
    }

    draw(ctx) {
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            const glowStrength = Math.min(1, this.speed / 1000);
            ctx.strokeStyle = `rgba(139, 108, 255, ${0.3 + glowStrength * 0.3})`;
            ctx.lineWidth = this.radius * 1.4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15 + Math.min(20, this.speed / SETTINGS.player.glowIntensityMult);
        ctx.shadowColor = '#8b6cff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class EnemyOrb {
    constructor() {
        this.radius = SETTINGS.threats.enemyOrb.radius;
        const angle = Math.random() * Math.PI * 2;
        this.x = centerX + Math.cos(angle) * arenaRadius;
        this.y = centerY + Math.sin(angle) * arenaRadius;
        
        const speed = SETTINGS.threats.enemyOrb.baseSpeed + Math.random() * SETTINGS.threats.enemyOrb.speedVariance + (wave * SETTINGS.threats.enemyOrb.waveSpeedMult);
        const targetAngle = angle + Math.PI + (Math.random() - 0.5) * 1.5;
        this.vx = Math.cos(targetAngle) * speed;
        this.vy = Math.sin(targetAngle) * speed;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

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
        this.maxRadius = arenaRadius * SETTINGS.threats.pulseWave.maxRadiusMult;
        this.speed = SETTINGS.threats.pulseWave.baseSpeed + (wave * SETTINGS.threats.pulseWave.waveSpeedMult);
        this.thickness = SETTINGS.threats.pulseWave.thickness;
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
        } else if (distanceToEdge < this.thickness / 2 + player.radius + SETTINGS.nearMiss.distancePadding) {
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
        this.chargeTime = SETTINGS.threats.laser.chargeTime;
        this.fireTime = SETTINGS.threats.laser.fireTime;
        this.state = 'CHARGE';
        this.markedForDeletion = false;
        
        playSound('laserCharge');
    }

    update(dt) {
        if (this.state === 'CHARGE') {
            this.chargeTime -= dt;
            
            const targetAngle = Math.atan2(player.y - centerY, player.x - centerX);
            let diff = targetAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            const trackingSpeed = Math.max(0.5, this.chargeTime * SETTINGS.threats.laser.chargeTrackingSpeed);
            this.angle += diff * trackingSpeed * dt;

            if (Math.random() < 0.4) {
                createParticles(centerX, centerY, '#c084fc', 1, 50);
            }

            if (this.chargeTime <= 0) {
                this.state = 'FIRE';
                playSound('laserFire');
                arenaFlashIntensity = 0.5;
            }
        } else if (this.state === 'FIRE') {
            this.fireTime -= dt;
            
            const dx = Math.cos(this.angle);
            const dy = Math.sin(this.angle);
            const px = player.x - centerX;
            const py = player.y - centerY;
            
            const distance = Math.abs(dx * py - dy * px);
            const dot = px * dx + py * dy;
            
            if (distance < player.radius + SETTINGS.threats.laser.collisionPadding && dot > 0) {
                killPlayer();
            } else if (distance < player.radius + SETTINGS.threats.laser.collisionPadding + SETTINGS.nearMiss.distancePadding && dot > 0) {
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
            const chargeRatio = 1 - (this.chargeTime / SETTINGS.threats.laser.chargeTime);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(192, 132, 252, ${chargeRatio * 0.8})`;
            ctx.lineWidth = 2 + chargeRatio * 4;
            ctx.setLineDash([10, 15]);
            ctx.lineDashOffset = -Date.now() / 20;
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5 + chargeRatio * 15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192, 132, 252, ${chargeRatio})`;
            ctx.fill();
        } else {
            const fireRatio = this.fireTime / SETTINGS.threats.laser.fireTime;
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
        this.radius = SETTINGS.pickups.radius;
        this.markedForDeletion = false;
        this.life = SETTINGS.pickups.lifetime;
        this.time = 0;
    }

    update(dt) {
        this.life -= dt;
        this.time += dt;
        if (this.life <= 0) this.markedForDeletion = true;

        const d = dist(player.x, player.y, this.x, this.y);
        if (d < SETTINGS.pickups.magnetDistance) {
            const amt = SETTINGS.pickups.magnetStrength * dt;
            this.x = lerp(this.x, player.x, amt);
            this.y = lerp(this.y, player.y, amt);
        }

        if (d < player.radius + this.radius + 5) {
            addScore(SETTINGS.pickups.scoreValue);
            playSound('pickup');
            this.markedForDeletion = true;
            createParticles(this.x, this.y, '#fafafa', SETTINGS.particles.pickupCount, 150);
        }
    }

    draw(ctx) {
        const pulse = Math.sin(this.time * 6) * 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#fafafa';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        
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
            this.vy = -10 - Math.random() * 20;
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
    for (let i = 0; i < SETTINGS.particles.ambientCount; i++) {
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
    } else if (d < player.radius + er + SETTINGS.nearMiss.distancePadding) {
        triggerNearMiss();
    }
}

function triggerNearMiss() {
    if (nearMissCooldown <= 0 && gameState === 'PLAYING') {
        addScore(SETTINGS.nearMiss.bonus);
        playSound('nearmiss');
        nearMissCooldown = SETTINGS.nearMiss.cooldown;
        
        enemyTimeScale = SETTINGS.nearMiss.timeDilationScale;
        arenaPulseScale = SETTINGS.nearMiss.arenaPulseScale;
        
        nearMissIndicator.classList.remove('hidden');
        nearMissIndicator.classList.remove('near-miss-anim');
        void nearMissIndicator.offsetWidth; 
        
        const rect = canvas.getBoundingClientRect();
        const screenX = rect.left + player.x;
        const screenY = rect.top + player.y - 30; 
        
        nearMissIndicator.style.left = `${screenX}px`;
        nearMissIndicator.style.top = `${screenY}px`;
        nearMissIndicator.classList.add('near-miss-anim');
        
        setTimeout(() => {
            if (nearMissIndicator.classList.contains('near-miss-anim')) {
                nearMissIndicator.classList.add('hidden');
                nearMissIndicator.classList.remove('near-miss-anim');
            }
        }, SETTINGS.nearMiss.popupLifetime);
    }
}

function triggerArenaFlash(intensity, x, y) {
    arenaFlashIntensity = Math.max(arenaFlashIntensity, intensity);
}

function addScore(amount) {
    score += amount;
    displayScore = Math.floor(score);
    scoreDisplay.innerText = `Score: ${displayScore}`;
    
    scoreDisplay.classList.remove('score-pulse');
    void scoreDisplay.offsetWidth;
    scoreDisplay.classList.add('score-pulse');
    setTimeout(() => scoreDisplay.classList.remove('score-pulse'), 150);
}

function killPlayer() {
    gameState = 'GAME_OVER';
    playSound('death');
    stopDrone();
    
    player.trail = [];
    
    createParticles(player.x, player.y, '#fff', SETTINGS.particles.deathCount, 500);
    createParticles(player.x, player.y, '#8b6cff', SETTINGS.particles.deathCount, 400);
    
    arenaFlashIntensity = 1.0;
    hud.classList.add('hidden');
    
    if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem('pulseframe_best', bestScore);
    }
    
    finalScoreEl.innerText = Math.floor(score);
    bestScoreEl.innerText = bestScore;
    
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, SETTINGS.ui.deathOverlayDelay);
}

function spawnThreats() {
    let enemyCount = enemies.length;
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

    if (Math.random() < SETTINGS.pickups.spawnChance && pickups.length < SETTINGS.pickups.maxOnScreen) {
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
    ambientParticles.forEach(p => p.update(dt));
    
    if (gameState !== 'PLAYING') {
        particles.forEach(p => p.update(dt));
        particles = particles.filter(p => !p.markedForDeletion);
        if (arenaFlashIntensity > 0) arenaFlashIntensity = Math.max(0, arenaFlashIntensity - dt * 2);
        return;
    }

    addScore(dt * SETTINGS.scoring.passiveRate);
    waveTime += dt;
    
    if (enemyTimeScale < 1) {
        enemyTimeScale += dt * SETTINGS.nearMiss.timeDilationRecovery;
        if (enemyTimeScale > 1) enemyTimeScale = 1;
    }
    
    if (nearMissCooldown > 0) nearMissCooldown -= dt;
    if (arenaPulseScale > 1) arenaPulseScale = Math.max(1, arenaPulseScale - dt * 0.5);
    if (arenaFlashIntensity > 0) arenaFlashIntensity = Math.max(0, arenaFlashIntensity - dt * 2);

    if (waveTime > SETTINGS.scoring.waveDuration && wave < 5) {
        wave++;
        waveTime = 0;
        addScore(SETTINGS.scoring.waveClearBonus);
        waveDisplay.innerText = `Wave ${wave}`;
        waveDisplay.classList.add('score-pulse');
        setTimeout(() => waveDisplay.classList.remove('score-pulse'), 300);
        
        arenaFlashIntensity = 0.3;
        nextSpawnTime = SETTINGS.scoring.breatherDuration;
    } else if (wave === 5 && waveTime > SETTINGS.scoring.waveDuration) {
        wave++;
        waveTime = 0;
        waveDisplay.innerText = `Wave ${wave}`;
    }

    nextSpawnTime -= dt;
    if (nextSpawnTime <= 0) {
        spawnThreats();
        nextSpawnTime = Math.max(0.2, 0.6 - (wave * 0.05));
    }

    player.update(dt);

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

    ambientParticles.forEach(p => p.draw(ctx));

    ctx.save();
    
    if (arenaPulseScale > 1) {
        ctx.translate(centerX, centerY);
        ctx.scale(arenaPulseScale, arenaPulseScale);
        ctx.translate(-centerX, -centerY);
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    
    const baseAlpha = gameState === 'GAME_OVER' ? 0.05 : SETTINGS.arena.baseAlpha;
    const pulseAlpha = Math.sin(Date.now() / SETTINGS.arena.pulseSpeed) * SETTINGS.arena.pulseAlpha;
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
    if (dt > 0.05) dt = 0.05;
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

document.getElementById('overlayRetryBtn').addEventListener('click', () => {
    initAudio();
    resetGame();
});

initAmbient();

// Start loop
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
});
