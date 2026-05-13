/**
 * Echo Miner - Build 106 Prototype
 * A dark underground crystal-mining game.
 */

const SETTINGS = {
    roverSpeed: 2.8, // INSTÄLLNING - Ändra hur snabbt mining-fordonet rör sig.
    oxygenMax: 100, // INSTÄLLNING - Ändra max syrenivå.
    oxygenDrainRate: 0.015, // INSTÄLLNING - Ändra hur snabbt syret minskar under expeditionen.
    energyMax: 100, // INSTÄLLNING - Ändra max energinivå.
    energyDrainRate: 0.010, // INSTÄLLNING - Ändra hur snabbt energin minskar.
    crystalValue: 12, // INSTÄLLNING - Ändra hur mycket resurser vanliga kristaller ger.
    rareCrystalValue: 30, // INSTÄLLNING - Ändra resursvärde för sällsynta kristaller.
    darknessRamp: 0.0005, // INSTÄLLNING - Ändra hur snabbt darkness ökar med djup/distans.
    depthScale: 0.1, // INSTÄLLNING - Hur många meter djupet ökar per pixel neråt.
    particleLimit: 60, // INSTÄLLNING - Ändra max antal visuella partiklar (damm i luften).
    audioVolume: 0.2, // INSTÄLLNING - Ändra standardvolym för ljud.
};

class Particle {
    constructor(x, y) {
        this.reset(x, y);
    }
    reset(x, y) {
        this.x = x || Math.random() * 2000;
        this.y = y || Math.random() * 2000;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.2 + 0.1;
        this.opacity = Math.random() * 0.5;
    }
    update(camY) {
        this.y -= this.speed;
        if (this.y < camY - 200) this.reset(Math.random() * 2000, camY + 800);
    }
}

class Crystal {
    constructor(x, y, isRare = false) {
        this.x = x;
        this.y = y;
        this.isRare = isRare;
        this.collected = false;
        this.pulse = Math.random() * Math.PI * 2;
        this.size = isRare ? 12 : 8;
    }

    draw(ctx, camX, camY) {
        if (this.collected) return;
        this.pulse += 0.03;
        const glow = Math.sin(this.pulse) * 5 + 10;
        const screenX = this.x - camX;
        const screenY = this.y - camY;

        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Glow effect
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glow * 2);
        const color = this.isRare ? 'rgba(255, 180, 0, ' : 'rgba(0, 163, 255, ';
        grad.addColorStop(0, color + '0.6)');
        grad.addColorStop(1, color + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, glow * 2, 0, Math.PI * 2);
        ctx.fill();

        // Crystal core
        ctx.fillStyle = this.isRare ? '#ffb400' : '#00a3ff';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.7, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class EchoMiner {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('game-container');
        
        this.state = 'BASE'; // BASE, EXPEDITION, SUCCESS, FAILURE
        this.resources = 0;
        this.totalResources = parseInt(localStorage.getItem('taren_echo_miner_best_resources')) || 0;
        this.bestDepth = parseInt(localStorage.getItem('taren_echo_miner_best_depth')) || 0;
        
        this.initHUD();
        this.initInput();
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initHUD() {
        this.ui = {
            depth: document.getElementById('stat-depth'),
            resources: document.getElementById('stat-resources'),
            darkness: document.getElementById('stat-darkness'),
            bestDepth: document.getElementById('stat-best-depth'),
            energyBar: document.getElementById('bar-energy'),
            energyVal: document.getElementById('val-energy'),
            oxygenBar: document.getElementById('bar-oxygen'),
            oxygenVal: document.getElementById('val-oxygen'),
            status: document.getElementById('game-status'),
            overlayBase: document.getElementById('overlay-base'),
            overlaySummary: document.getElementById('overlay-summary'),
            summaryTitle: document.getElementById('summary-title'),
            summaryMsg: document.getElementById('summary-msg'),
            sumDepth: document.getElementById('sum-depth'),
            sumResources: document.getElementById('sum-resources'),
            sumTime: document.getElementById('sum-time'),
            audioBtn: document.getElementById('btn-audio'),
            volumeSlider: document.getElementById('volumeSlider')
        };
        this.ui.bestDepth.innerText = this.bestDepth + 'm';
        this.ui.volumeSlider.addEventListener('input', (e) => {
            SETTINGS.audioVolume = parseFloat(e.target.value);
            if (this.masterGain) this.masterGain.gain.setTargetAtTime(SETTINGS.audioVolume, this.audioCtx.currentTime, 0.1);
        });
    }

    initInput() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    initAudio() {
        if (this.audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = SETTINGS.audioVolume;
        this.masterGain.connect(this.audioCtx.destination);
    }

    toggleAudio() {
        if (!this.audioCtx) {
            this.initAudio();
            this.ui.audioBtn.innerText = 'Mute';
            document.getElementById('volume-control').classList.remove('hidden');
        } else {
            this.isMuted = !this.isMuted;
            this.ui.audioBtn.innerText = this.isMuted ? 'Unmute' : 'Mute';
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : SETTINGS.audioVolume, this.audioCtx.currentTime, 0.1);
        }
    }

    playSound(freq, type = 'sine', duration = 0.2, volume = 0.5) {
        if (!this.audioCtx || this.isMuted) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    startExpedition() {
        this.state = 'EXPEDITION';
        this.ui.overlayBase.classList.add('hidden');
        this.ui.status.innerText = 'EXPEDITION ACTIVE';
        this.ui.status.style.color = '#00a3ff';
        
        this.rover = {
            x: 400,
            y: 100,
            vx: 0,
            vy: 0,
            angle: 0,
            oxygen: SETTINGS.oxygenMax,
            energy: SETTINGS.energyMax,
            resources: 0,
            depth: 0,
            startTime: Date.now()
        };

        this.camera = { x: 0, y: 0 };
        this.crystals = [];
        this.particles = [];
        for (let i = 0; i < SETTINGS.particleLimit; i++) this.particles.push(new Particle());

        // Generate cave features (clusters of crystals)
        for (let i = 0; i < 50; i++) {
            const cx = Math.random() * 2000;
            const cy = 300 + Math.random() * 5000;
            this.crystals.push(new Crystal(cx, cy, Math.random() > 0.9));
        }

        this.playSound(440, 'sine', 0.5, 0.2);
    }

    returnToBase() {
        this.state = 'BASE';
        this.ui.overlaySummary.classList.add('hidden');
        this.ui.overlayBase.classList.remove('hidden');
        this.ui.status.innerText = 'BASE STATION';
        this.ui.status.style.color = '';
    }

    endExpedition(success = true, message = "") {
        this.state = success ? 'SUCCESS' : 'FAILURE';
        this.ui.overlaySummary.classList.remove('hidden');
        this.ui.summaryTitle.innerText = success ? 'Expedition Complete' : 'Expedition Terminated';
        this.ui.summaryTitle.style.color = success ? '#00a3ff' : '#ff4a4a';
        this.ui.summaryMsg.innerText = message || (success ? 'Rig safely returned to garage.' : 'Critical systems offline.');
        
        this.ui.sumDepth.innerText = Math.floor(this.rover.depth) + 'm';
        this.ui.sumResources.innerText = this.rover.resources;
        this.ui.sumTime.innerText = Math.floor((Date.now() - this.rover.startTime) / 1000) + 's';

        if (success) {
            this.totalResources += this.rover.resources;
            localStorage.setItem('taren_echo_miner_best_resources', this.totalResources);
            if (this.rover.depth > this.bestDepth) {
                this.bestDepth = Math.floor(this.rover.depth);
                localStorage.setItem('taren_echo_miner_best_depth', this.bestDepth);
                this.ui.bestDepth.innerText = this.bestDepth + 'm';
            }
            this.playSound(660, 'sine', 0.5, 0.3);
        } else {
            this.playSound(110, 'sawtooth', 0.8, 0.4);
        }
    }

    update(dt) {
        if (this.state !== 'EXPEDITION') return;

        // Controls
        let moveX = 0;
        let moveY = 0;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY = -1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY = 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX = -1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX = 1;

        if (moveX !== 0 || moveY !== 0) {
            this.rover.vx += moveX * 0.5;
            this.rover.vy += moveY * 0.5;
            this.rover.energy -= SETTINGS.energyDrainRate;
        }

        // Apply friction
        this.rover.vx *= 0.95;
        this.rover.vy *= 0.95;

        // Move rover
        this.rover.x += this.rover.vx;
        this.rover.y += this.rover.vy;

        // Clamp to world
        this.rover.x = Math.max(0, Math.min(2000, this.rover.x));
        this.rover.y = Math.max(0, this.rover.y);

        // Update stats
        this.rover.depth = Math.max(0, (this.rover.y - 100) * SETTINGS.depthScale);
        this.rover.oxygen -= SETTINGS.oxygenDrainRate * (1 + this.rover.depth / 1000);
        
        // Check for return to base zone
        if (this.rover.y < 50 && this.rover.depth > 0) {
            this.endExpedition(true);
        }

        // Check for failures
        if (this.rover.oxygen <= 0) {
            this.endExpedition(false, 'Oxygen supply exhausted.');
        } else if (this.rover.energy <= 0) {
            this.endExpedition(false, 'Power systems critical. Rig immobilized.');
        }

        // Collect crystals
        this.crystals.forEach(c => {
            if (c.collected) return;
            const dx = this.rover.x - c.x;
            const dy = this.rover.y - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 30) {
                c.collected = true;
                this.rover.resources += c.isRare ? SETTINGS.rareCrystalValue : SETTINGS.crystalValue;
                this.playSound(c.isRare ? 880 : 523, 'sine', 0.2, 0.2);
            }
        });

        // Camera follow
        this.camera.x += (this.rover.x - this.canvas.width / 2 - this.camera.x) * 0.1;
        this.camera.y += (this.rover.y - this.canvas.height / 2 - this.camera.y) * 0.1;

        this.updateHUD();
    }

    updateHUD() {
        this.ui.depth.innerText = Math.floor(this.rover.depth) + 'm';
        this.ui.resources.innerText = this.rover.resources;
        const darkness = Math.min(100, Math.floor(this.rover.depth * SETTINGS.darknessRamp * 100));
        this.ui.darkness.innerText = darkness + '%';

        this.ui.energyVal.innerText = Math.max(0, Math.floor(this.rover.energy)) + '%';
        this.ui.energyBar.style.width = this.rover.energy + '%';
        
        this.ui.oxygenVal.innerText = Math.max(0, Math.floor(this.rover.oxygen)) + '%';
        this.ui.oxygenBar.style.width = this.rover.oxygen + '%';

        if (this.rover.oxygen < 20 || this.rover.energy < 20) {
            this.ui.status.style.color = '#ff4a4a';
            this.ui.status.innerText = 'WARNING: CRITICAL SYSTEMS';
        } else {
            this.ui.status.style.color = '#00a3ff';
            this.ui.status.innerText = 'EXPEDITION ACTIVE';
        }
    }

    draw() {
        this.ctx.fillStyle = '#020408';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw cave atmosphere (particles)
        this.particles.forEach(p => {
            p.update(this.camera.y);
            this.ctx.fillStyle = `rgba(100, 150, 255, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw crystals
        this.crystals.forEach(c => c.draw(this.ctx, 0, 0));

        // Draw Base/Surface entrance
        if (this.camera.y < 300) {
            this.ctx.fillStyle = 'rgba(0, 163, 255, 0.05)';
            this.ctx.fillRect(0, 0, 2000, 200);
            this.ctx.strokeStyle = 'rgba(0, 163, 255, 0.2)';
            this.ctx.setLineDash([10, 10]);
            this.ctx.strokeRect(0, 0, 2000, 200);
            this.ctx.setLineDash([]);
            
            this.ctx.fillStyle = 'rgba(0, 163, 255, 0.4)';
            this.ctx.font = '24px monospace';
            this.ctx.fillText('GARAGE ACCESS POINT', 800, 100);
        }

        // Draw Rover
        if (this.rover) {
            this.drawRover(this.rover.x, this.rover.y);
        }

        this.ctx.restore();

        // Darkness Overlay
        const darknessAlpha = Math.min(0.9, (this.rover ? this.rover.depth : 0) * SETTINGS.darknessRamp);
        this.ctx.fillStyle = `rgba(0, 0, 0, ${darknessAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Spotlights from rover
        if (this.rover && this.state === 'EXPEDITION') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            const grad = this.ctx.createRadialGradient(
                this.rover.x - this.camera.x, this.rover.y - this.camera.y, 0,
                this.rover.x - this.camera.x, this.rover.y - this.camera.y, 250
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(this.rover.x - this.camera.x, this.rover.y - this.camera.y, 250, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawRover(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Sci-fi rig body
        this.ctx.fillStyle = '#1a1d23';
        this.ctx.strokeStyle = '#00a3ff';
        this.ctx.lineWidth = 2;
        
        // Main chassis
        this.ctx.beginPath();
        this.ctx.rect(-20, -15, 40, 30);
        this.ctx.fill();
        this.ctx.stroke();

        // Cabin
        this.ctx.fillStyle = 'rgba(0, 163, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.rect(-10, -10, 20, 10);
        this.ctx.fill();
        this.ctx.stroke();

        // Utility lights
        this.ctx.fillStyle = '#ffb400';
        this.ctx.beginPath();
        this.ctx.arc(15, 5, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    animate(timestamp) {
        requestAnimationFrame(this.animate);
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        if (dt > 100) return;

        this.update(dt);
        this.draw();
    }
}

window.addEventListener('load', () => {
    window.game = new EchoMiner();
});
