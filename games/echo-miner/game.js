/**
 * Echo Miner - Build 108 Visual Cave Pass
 * A dark underground crystal-mining game.
 */

const SETTINGS = {
    roverSpeed: 2.8, // INSTÄLLNING - Ändra hur snabbt mining-fordonet rör sig.
    oxygenMax: 100, // INSTÄLLNING - Ändra max syrenivå.
    oxygenDrainRate: 0.012, // INSTÄLLNING - Ändra hur snabbt syret minskar under expeditionen.
    energyMax: 100, // INSTÄLLNING - Ändra max energinivå.
    energyDrainRate: 0.008, // INSTÄLLNING - Ändra hur snabbt energin minskar.
    crystalValue: 12, // INSTÄLLNING - Ändra hur mycket resurser vanliga kristaller ger.
    rareCrystalValue: 30, // INSTÄLLNING - Ändra resursvärde för sällsynta kristaller.
    darknessRamp: 0.0004, // INSTÄLLNING - Ändra hur snabbt darkness ökar med djup/distans.
    depthScale: 0.1, // INSTÄLLNING - Hur många meter djupet ökar per pixel neråt.
    audioVolume: 0.2, // INSTÄLLNING - Ändra standardvolym för ljud.
    
    // VISUAL SETTINGS - Build 108
    caveTextureOpacity: 0.22, // INSTÄLLNING - Ändra hur tydlig grottans golvstruktur är.
    wallSilhouetteOpacity: 0.40, // INSTÄLLNING - Ändra hur tydliga grottväggarnas silhuetter är.
    debrisDensity: 60, // INSTÄLLNING - Ändra hur mycket små stenfragment som syns i grottan.
    vignetteStrength: 0.60, // INSTÄLLNING - Ändra hur mörka kanterna i expeditionen är.
    roverBodyGlow: 0.45, // INSTÄLLNING - Ändra hur tydligt mining-riggens kropp lyser.
    headlightRange: 240, // INSTÄLLNING - Ändra hur långt fordonets ljuskägla når.
    headlightOpacity: 0.38, // INSTÄLLNING - Ändra hur starkt fordonets strålkastarljus är.
    utilityLightGlow: 0.60, // INSTÄLLNING - Ändra hur starka orangea lampor på riggen är.
    crystalGlowStrength: 0.75, // INSTÄLLNING - Ändra hur starkt blå kristaller lyser.
    crystalSizeMultiplier: 1.3, // INSTÄLLNING - Ändra generell storlek på kristaller.
    rareCrystalGlowStrength: 0.85, // INSTÄLLNING - Ändra hur starkt sällsynta kristaller lyser.
    baseAmbientLight: 0.22, // INSTÄLLNING - Ändra minsta ljusnivå i grottan.
    darknessVisualMultiplier: 0.65, // INSTÄLLNING - Ändra hur hårt darkness påverkar synligheten visuellt.
    crystalLightRadius: 85, // INSTÄLLNING - Ändra hur långt kristallglow lyser upp området.
    dustParticleCount: 100, // INSTÄLLNING - Ändra antal dammpartiklar i grottan.
    crystalMoteCount: 40, // INSTÄLLNING - Ändra antal blå ljuspartiklar runt kristaller.
};

class Particle {
    constructor(x, y, type = 'dust') {
        this.type = type;
        this.reset(x, y);
    }
    reset(x, y) {
        this.x = x || Math.random() * 2500 - 250;
        this.y = y || Math.random() * 6000;
        this.size = Math.random() * (this.type === 'mote' ? 3 : 2);
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() * 0.2 + 0.1) * (this.type === 'mote' ? -1.5 : -1);
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = this.type === 'mote' ? 'rgba(0, 163, 255,' : 'rgba(100, 150, 255,';
    }
    update(camX, camY, canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around camera view for optimization if needed, or just reset when out of bounds
        if (this.y < camY - 200 || this.y > camY + canvasHeight + 200 || 
            this.x < camX - 200 || this.x > camX + canvasWidth + 200) {
            this.reset(camX + Math.random() * (canvasWidth + 400) - 200, camY + canvasHeight + 100);
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Crystal {
    constructor(x, y, isRare = false) {
        this.x = x;
        this.y = y;
        this.isRare = isRare;
        this.collected = false;
        this.pulse = Math.random() * Math.PI * 2;
        this.size = (isRare ? 14 : 10) * SETTINGS.crystalSizeMultiplier;
        
        // Cluster crystals
        this.subCrystals = [];
        const count = Math.floor(Math.random() * 4) + 1;
        for(let i = 0; i < count; i++) {
            this.subCrystals.push({
                ox: (Math.random() - 0.5) * 30,
                oy: (Math.random() - 0.5) * 30,
                size: this.size * (0.3 + Math.random() * 0.4),
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    draw(ctx, camX, camY) {
        if (this.collected) return;
        this.pulse += 0.035;
        const glow = Math.sin(this.pulse) * 4 + 12;
        const screenX = this.x - camX;
        const screenY = this.y - camY;

        ctx.save();
        ctx.translate(screenX, screenY);
        
        const mainColor = this.isRare ? 'rgba(255, 180, 0, ' : 'rgba(0, 163, 255, ';
        const strength = this.isRare ? SETTINGS.rareCrystalGlowStrength : SETTINGS.crystalGlowStrength;

        // Ground glow
        const groundGrad = ctx.createRadialGradient(0, 5, 0, 0, 5, SETTINGS.crystalLightRadius);
        groundGrad.addColorStop(0, mainColor + (0.3 * strength) + ')');
        groundGrad.addColorStop(1, mainColor + '0)');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5, SETTINGS.crystalLightRadius, SETTINGS.crystalLightRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glow * 2.5);
        grad.addColorStop(0, mainColor + (0.5 * strength) + ')');
        grad.addColorStop(1, mainColor + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, glow * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Sub-crystals
        this.subCrystals.forEach(sc => {
            ctx.save();
            ctx.translate(sc.ox, sc.oy);
            ctx.rotate(sc.angle + this.pulse * 0.5);
            ctx.fillStyle = this.isRare ? '#ffb400' : '#00a3ff';
            ctx.beginPath();
            ctx.moveTo(0, -sc.size);
            ctx.lineTo(sc.size * 0.6, 0);
            ctx.lineTo(0, sc.size);
            ctx.lineTo(-sc.size * 0.6, 0);
            ctx.closePath();
            ctx.fill();
            
            // Highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        });

        // Main Crystal core
        ctx.save();
        ctx.rotate(this.pulse * 0.2);
        ctx.fillStyle = this.isRare ? '#ffcc33' : '#33ccff';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.7, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        
        // Shine/Facet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.3, 0);
        ctx.lineTo(0, this.size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
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

    generateCaveFeatures() {
        this.caveFloor = [];
        for (let i = 0; i < 200; i++) {
            this.caveFloor.push({
                x: Math.random() * 2500 - 250,
                y: Math.random() * 6000,
                size: Math.random() * 100 + 50,
                color: `rgba(20, 25, 40, ${Math.random() * 0.1 + 0.05})`,
                sides: Math.floor(Math.random() * 3) + 5
            });
        }
        
        this.debris = [];
        for (let i = 0; i < SETTINGS.debrisDensity; i++) {
            this.debris.push({
                x: Math.random() * 2500 - 250,
                y: Math.random() * 6000,
                size: Math.random() * 4 + 1,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        this.walls = [];
        for (let i = 0; i < 40; i++) {
            this.walls.push({
                x: Math.random() > 0.5 ? -100 : 2100,
                y: Math.random() * 6000,
                w: Math.random() * 200 + 100,
                h: Math.random() * 400 + 200,
                rot: (Math.random() - 0.5) * 0.5
            });
        }
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
            facing: 1, // 1 right, -1 left
            oxygen: SETTINGS.oxygenMax,
            energy: SETTINGS.energyMax,
            resources: 0,
            depth: 0,
            startTime: Date.now()
        };

        this.camera = { x: 0, y: 0 };
        this.crystals = [];
        this.particles = [];
        this.generateCaveFeatures();
        
        for (let i = 0; i < SETTINGS.dustParticleCount; i++) this.particles.push(new Particle(null, null, 'dust'));
        for (let i = 0; i < SETTINGS.crystalMoteCount; i++) this.particles.push(new Particle(null, null, 'mote'));

        // Generate crystals clusters
        for (let i = 0; i < 40; i++) {
            const cx = Math.random() * 2000;
            const cy = 400 + Math.random() * 5500;
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
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) { moveX = -1; this.rover.facing = -1; }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) { moveX = 1; this.rover.facing = 1; }

        if (moveX !== 0 || moveY !== 0) {
            this.rover.vx += moveX * 0.5;
            this.rover.vy += moveY * 0.5;
            this.rover.energy -= SETTINGS.energyDrainRate;
            
            // Random sparks
            if (Math.random() < 0.1) {
                this.particles.push(new Particle(this.rover.x, this.rover.y, 'dust'));
                if (this.particles.length > 200) this.particles.shift();
            }
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
        this.rover.oxygen -= SETTINGS.oxygenDrainRate * (1 + this.rover.depth / 1500);
        
        // Check for return to base zone
        if (this.rover.y < 60 && this.rover.depth > 0) {
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
            if (dist < 40) {
                c.collected = true;
                this.rover.resources += c.isRare ? SETTINGS.rareCrystalValue : SETTINGS.crystalValue;
                this.playSound(c.isRare ? 880 : 523, 'sine', 0.2, 0.2);
            }
        });

        // Camera follow
        this.camera.x += (this.rover.x - this.canvas.width / 2 - this.camera.x) * 0.1;
        this.camera.y += (this.rover.y - this.canvas.height / 2 - this.camera.y) * 0.1;

        // Update particles
        this.particles.forEach(p => p.update(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height));

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

        // Draw Cave Background / Texture
        this.ctx.globalAlpha = SETTINGS.caveTextureOpacity;
        this.caveFloor.forEach(f => {
            this.ctx.fillStyle = f.color;
            this.ctx.save();
            this.ctx.translate(f.x, f.y);
            this.ctx.beginPath();
            for(let i = 0; i < f.sides; i++) {
                const ang = (i / f.sides) * Math.PI * 2;
                const r = f.size * (0.8 + Math.random() * 0.4);
                this.ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Debris
        this.ctx.globalAlpha = 1;
        this.debris.forEach(d => {
            this.ctx.fillStyle = `rgba(100, 120, 150, ${d.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Wall Silhouettes
        this.ctx.globalAlpha = SETTINGS.wallSilhouetteOpacity;
        this.walls.forEach(w => {
            this.ctx.save();
            this.ctx.translate(w.x, w.y);
            this.ctx.rotate(w.rot);
            this.ctx.fillStyle = '#050a14';
            this.ctx.beginPath();
            this.ctx.moveTo(-w.w/2, -w.h/2);
            this.ctx.lineTo(w.w/2, -w.h/2 * 0.8);
            this.ctx.lineTo(w.w/2 * 0.7, w.h/2);
            this.ctx.lineTo(-w.w/2 * 0.9, w.h/2 * 1.1);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        });
        this.ctx.globalAlpha = 1;

        // Draw extraction area
        this.drawExtractionArea();

        // Draw crystals
        this.crystals.forEach(c => c.draw(this.ctx, 0, 0));

        // Draw atmosphere particles
        this.particles.forEach(p => p.draw(this.ctx));

        // Draw Rover
        if (this.rover) {
            this.drawRover(this.rover.x, this.rover.y);
        }

        this.ctx.restore();

        // Lighting Pass
        this.drawLighting();
    }

    drawExtractionArea() {
        const y = 80;
        const grad = this.ctx.createLinearGradient(0, y - 50, 0, y + 50);
        grad.addColorStop(0, 'rgba(0, 163, 255, 0)');
        grad.addColorStop(0.5, `rgba(0, 163, 255, ${SETTINGS.extractionZoneGlow})`);
        grad.addColorStop(1, 'rgba(0, 163, 255, 0)');
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, y - 50, 2000, 100);
        
        this.ctx.strokeStyle = `rgba(0, 210, 255, ${SETTINGS.extractionZoneGlow * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(2000, y);
        this.ctx.stroke();
        
        this.ctx.save();
        this.ctx.globalAlpha = SETTINGS.extractionLabelOpacity;
        this.ctx.fillStyle = '#00f2fe';
        this.ctx.font = 'bold 14px var(--font-mono, monospace)';
        this.ctx.textAlign = 'center';
        for(let i = 0; i < 5; i++) {
            this.ctx.fillText('▼ EXTRACTION GATE ▼', 200 + i * 400, y - 15);
        }
        this.ctx.restore();
    }

    drawLighting() {
        // Darkness Overlay
        const depthFactor = (this.rover ? this.rover.depth : 0) * SETTINGS.darknessRamp;
        const darknessAlpha = Math.min(0.95, (SETTINGS.baseAmbientLight + depthFactor) * SETTINGS.darknessVisualMultiplier);
        
        // Use a temporary canvas approach for lighting cutout if needed, but for 2D standard globalComposite is fine
        this.ctx.save();
        
        // 1. Fill entire screen with darkness
        this.ctx.fillStyle = `rgba(0, 0, 0, ${darknessAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Headlights / Rover Light
        if (this.rover && this.state === 'EXPEDITION') {
            this.ctx.globalCompositeOperation = 'destination-out';
            
            // Circular ambient around rover
            const ambGrad = this.ctx.createRadialGradient(
                this.rover.x - this.camera.x, this.rover.y - this.camera.y, 0,
                this.rover.x - this.camera.x, this.rover.y - this.camera.y, 150
            );
            ambGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            ambGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = ambGrad;
            this.ctx.beginPath();
            this.ctx.arc(this.rover.x - this.camera.x, this.rover.y - this.camera.y, 150, 0, Math.PI * 2);
            this.ctx.fill();

            // Directional Headlight Cone
            this.ctx.save();
            this.ctx.translate(this.rover.x - this.camera.x, this.rover.y - this.camera.y);
            const coneAngle = this.rover.facing === 1 ? 0 : Math.PI;
            
            const coneGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, SETTINGS.headlightRange);
            coneGrad.addColorStop(0, `rgba(255, 255, 255, ${SETTINGS.headlightOpacity})`);
            coneGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = coneGrad;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, SETTINGS.headlightRange, coneAngle - 0.5, coneAngle + 0.5);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
            
            // 3. Crystal Cutouts (they glow through the dark)
            this.crystals.forEach(c => {
                if(c.collected) return;
                const screenX = c.x - this.camera.x;
                const screenY = c.y - this.camera.y;
                if(screenX > -100 && screenX < this.canvas.width + 100 && screenY > -100 && screenY < this.canvas.height + 100) {
                    const cGrad = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, SETTINGS.crystalLightRadius);
                    cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    cGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = cGrad;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, SETTINGS.crystalLightRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }
        
        this.ctx.restore();
        
        // Final Vignette
        const vignGrad = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.2,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.8
        );
        vignGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vignGrad.addColorStop(1, `rgba(0,0,0,${SETTINGS.vignetteStrength})`);
        this.ctx.fillStyle = vignGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRover(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(this.rover.facing, 1);
        
        // Body Glow
        const bodyGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
        bodyGlow.addColorStop(0, `rgba(0, 163, 255, ${SETTINGS.roverBodyGlow * 0.3})`);
        bodyGlow.addColorStop(1, 'rgba(0, 163, 255, 0)');
        this.ctx.fillStyle = bodyGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
        this.ctx.fill();

        // Main chassis
        this.ctx.fillStyle = '#10141d';
        this.ctx.strokeStyle = '#00a3ff';
        this.ctx.lineWidth = 2;
        
        // Chassis shape
        this.ctx.beginPath();
        this.ctx.roundRect(-22, -12, 44, 24, 4);
        this.ctx.fill();
        this.ctx.stroke();

        // Cockpit / Core
        this.ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.roundRect(-8, -18, 20, 12, 4);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Utility orange lights
        const orangeGlow = SETTINGS.utilityLightGlow;
        this.ctx.fillStyle = `rgba(255, 180, 0, ${orangeGlow})`;
        this.ctx.beginPath();
        this.ctx.arc(15, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wheels / Tracks
        this.ctx.fillStyle = '#0a0d12';
        this.ctx.fillRect(-18, 8, 10, 8);
        this.ctx.fillRect(8, 8, 10, 8);
        
        // Drill / Scanner head
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.beginPath();
        this.ctx.moveTo(22, 0);
        this.ctx.lineTo(32, 0);
        this.ctx.stroke();

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
