const SETTINGS = {
    startSpeed: 2.2, // INSTÄLLNING - Ändra startfarten för Lumen Coil.
    maxSpeed: 5.2, // INSTÄLLNING - Ändra maxfarten när spelet blir svårare.
    turnResponsiveness: 0.16, // INSTÄLLNING - Ändra hur snabbt coilen svänger mot mus/touch.
    startLength: 20, // INSTÄLLNING - Ändra hur lång coilen är vid start.
    growAmount: 8, // INSTÄLLNING - Ändra hur mycket coilen växer vid varje fragment.
    lightFragmentScore: 10, // INSTÄLLNING - Ändra poäng för vanliga ljusfragment.
    rareFragmentScore: 50, // INSTÄLLNING - Ändra poäng för amber bonusfragment.
    corruptShardCountStart: 4, // INSTÄLLNING - Ändra antal farliga shards vid start.
    corruptShardMax: 22, // INSTÄLLNING - Ändra max antal farliga shards.
    difficultyRamp: 0.02, // INSTÄLLNING - Ändra hur snabbt spelet blir svårare.
    particleLimit: 150, // INSTÄLLNING - Ändra max antal visuella partiklar.
    audioVolume: 0.22, // INSTÄLLNING - Ändra standardvolym för ljud.
    pulseCooldownMs: 5200, // INSTÄLLNING - Ändra cooldown för Lumen Coil-pulsen.
    pulseRadius: 100, // INSTÄLLNING - Ändra hur långt pulsen når.
};

class Particle {
    constructor(x, y, color, size, vx, vy, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class LumenCoil {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('game-container');
        
        this.state = 'idle'; // idle, playing, gameover
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('taren_lumen_coil_best')) || 0;
        
        this.initDOM();
        this.initInput();
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initDOM() {
        this.ui = {
            length: document.getElementById('stat-length'),
            score: document.getElementById('stat-score'),
            best: document.getElementById('stat-best'),
            speed: document.getElementById('stat-speed'),
            status: document.getElementById('game-status'),
            pulseBtn: document.getElementById('btn-pulse'),
            startScreen: document.getElementById('game-start'),
            gameOverScreen: document.getElementById('game-over'),
            finalStats: document.getElementById('final-stats'),
            audioBtn: document.getElementById('btn-audio'),
            volumeControl: document.getElementById('volume-control'),
            volumeSlider: document.getElementById('volumeSlider')
        };
        
        this.ui.best.innerText = this.bestScore;
        this.ui.volumeSlider.value = SETTINGS.audioVolume;
        this.ui.volumeSlider.addEventListener('input', (e) => {
            SETTINGS.audioVolume = parseFloat(e.target.value);
            if (this.masterGain && !this.isMuted) {
                this.masterGain.gain.setTargetAtTime(SETTINGS.audioVolume, this.audioCtx.currentTime, 0.1);
            }
        });
    }

    initInput() {
        this.mouse = { x: 0, y: 0, active: false };
        this.keys = {};
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.active = true;
            this.inputMode = 'mouse';
        });

        this.canvas.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.touches[0].clientX - rect.left;
            this.mouse.y = e.touches[0].clientY - rect.top;
            this.mouse.active = true;
            this.inputMode = 'mouse';
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.inputMode = 'keys';
            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerPulse();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
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
            this.ui.volumeControl.classList.remove('hidden');
        } else {
            this.isMuted = !this.isMuted;
            this.ui.audioBtn.innerText = this.isMuted ? 'Unmute' : 'Mute';
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : SETTINGS.audioVolume, this.audioCtx.currentTime, 0.1);
        }
    }

    playSound(freq, type = 'sine', duration = 0.1, volume = 0.5) {
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

    start() {
        this.ui.startScreen.classList.add('hidden');
        this.reset();
    }

    reset() {
        this.state = 'playing';
        this.score = 0;
        this.speed = SETTINGS.startSpeed;
        this.angle = 0;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        
        this.segments = [];
        this.path = [];
        for (let i = 0; i < SETTINGS.startLength; i++) {
            this.path.push({ x: this.x, y: this.y });
        }
        
        this.fragments = [];
        this.shards = [];
        this.particles = [];
        
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        
        this.pulseReady = true;
        this.pulseTimer = 0;
        this.pulseActive = 0;
        
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.status.innerText = 'Active';
        this.ui.status.style.color = '#4cc9f0';
        
        this.updateHUD();
        this.updatePulseButton();
    }

    gameOver() {
        this.state = 'gameover';
        this.ui.status.innerText = 'Signal Lost';
        this.ui.status.style.color = '#ff4a4a';
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.finalStats.innerText = `You reached a length of ${this.path.length} and score of ${Math.floor(this.score)}`;
        
        if (this.score > this.bestScore) {
            this.bestScore = Math.floor(this.score);
            localStorage.setItem('taren_lumen_coil_best', this.bestScore);
            this.ui.best.innerText = this.bestScore;
        }
        
        this.playSound(100, 'sawtooth', 0.5, 0.3);
    }

    triggerPulse() {
        if (!this.pulseReady || this.state !== 'playing') return;
        
        this.pulseReady = false;
        this.pulseTimer = SETTINGS.pulseCooldownMs;
        this.pulseActive = 20; // frames
        this.updatePulseButton();
        this.playSound(440, 'sine', 0.3, 0.4);
        
        // Repel shards
        this.shards.forEach(shard => {
            const dx = shard.x - this.x;
            const dy = shard.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < SETTINGS.pulseRadius) {
                const angle = Math.atan2(dy, dx);
                shard.vx = Math.cos(angle) * 10;
                shard.vy = Math.sin(angle) * 10;
            }
        });
    }

    updatePulseButton() {
        this.ui.pulseBtn.disabled = !this.pulseReady;
        if (this.pulseReady) {
            this.ui.pulseBtn.innerText = 'Lumen Pulse [Space]';
        } else {
            this.ui.pulseBtn.innerText = `Recharging...`;
        }
    }

    spawnFragment(isRare = false) {
        this.fragments.push({
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: Math.random() * (this.canvas.height - 40) + 20,
            isRare,
            pulse: 0
        });
    }

    spawnShard() {
        const edge = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        
        if (edge === 0) { x = 0; y = Math.random() * this.canvas.height; vx = 1; vy = (Math.random() - 0.5) * 2; }
        else if (edge === 1) { x = this.canvas.width; y = Math.random() * this.canvas.height; vx = -1; vy = (Math.random() - 0.5) * 2; }
        else if (edge === 2) { x = Math.random() * this.canvas.width; y = 0; vx = (Math.random() - 0.5) * 2; vy = 1; }
        else { x = Math.random() * this.canvas.width; y = this.canvas.height; vx = (Math.random() - 0.5) * 2; vy = -1; }
        
        this.shards.push({ x, y, vx, vy, size: Math.random() * 5 + 3 });
    }

    createExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length > SETTINGS.particleLimit) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push(new Particle(
                x, y, color, Math.random() * 3 + 1,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                Math.random() * 20 + 20
            ));
        }
    }

    updateHUD() {
        this.ui.length.innerText = this.path.length;
        this.ui.score.innerText = Math.floor(this.score);
        this.ui.speed.innerText = this.speed.toFixed(1);
    }

    animate(timestamp) {
        requestAnimationFrame(this.animate);
        
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        if (dt > 100) return;
        
        if (this.state === 'playing') {
            this.update(dt);
        }
        
        this.draw();
    }

    update(dt) {
        // Difficulty scaling
        this.difficultyTimer += dt;
        this.speed = Math.min(SETTINGS.maxSpeed, SETTINGS.startSpeed + (this.difficultyTimer / 1000) * SETTINGS.difficultyRamp);
        
        // Cooldown
        if (this.pulseTimer > 0) {
            this.pulseTimer -= dt;
            if (this.pulseTimer <= 0) {
                this.pulseReady = true;
                this.updatePulseButton();
            }
        }
        if (this.pulseActive > 0) this.pulseActive--;

        // Steer
        if (this.inputMode === 'keys') {
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.angle -= SETTINGS.turnResponsiveness;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) this.angle += SETTINGS.turnResponsiveness;
        } else if (this.mouse.active) {
            const targetAngle = Math.atan2(this.mouse.y - this.y, this.mouse.x - this.x);
            let da = targetAngle - this.angle;
            while (da < -Math.PI) da += Math.PI * 2;
            while (da > Math.PI) da -= Math.PI * 2;
            this.angle += da * SETTINGS.turnResponsiveness;
        }

        // Move
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Path / Trail
        this.path.unshift({ x: this.x, y: this.y });
        this.path.pop();

        // Spawn
        this.spawnTimer += dt;
        if (this.fragments.length < 3) this.spawnFragment(Math.random() > 0.95);
        
        const targetShardCount = Math.min(SETTINGS.corruptShardMax, SETTINGS.corruptShardCountStart + Math.floor(this.difficultyTimer / 5000));
        if (this.shards.length < targetShardCount && Math.random() > 0.98) this.spawnShard();

        // Collisions
        // Boundary
        if (this.x < 0 || this.x > this.canvas.width || this.y < 0 || this.y > this.canvas.height) {
            this.gameOver();
        }

        // Self
        for (let i = 20; i < this.path.length; i++) {
            const seg = this.path[i];
            const dist = Math.sqrt((this.x - seg.x) ** 2 + (this.y - seg.y) ** 2);
            if (dist < 5) {
                this.gameOver();
                return;
            }
        }

        // Fragments
        for (let i = this.fragments.length - 1; i >= 0; i--) {
            const frag = this.fragments[i];
            const dist = Math.sqrt((this.x - frag.x) ** 2 + (this.y - frag.y) ** 2);
            if (dist < 15) {
                const score = frag.isRare ? SETTINGS.rareFragmentScore : SETTINGS.lightFragmentScore;
                this.score += score;
                this.createExplosion(frag.x, frag.y, frag.isRare ? 'rgb(255, 183, 3)' : 'rgb(76, 201, 240)');
                this.playSound(frag.isRare ? 880 : 660, 'sine', 0.2, 0.2);
                
                for (let j = 0; j < SETTINGS.growAmount; j++) {
                    this.path.push({ ...this.path[this.path.length - 1] });
                }
                
                this.fragments.splice(i, 1);
                this.updateHUD();
            }
        }

        // Shards
        for (let i = this.shards.length - 1; i >= 0; i--) {
            const shard = this.shards[i];
            shard.x += shard.vx;
            shard.y += shard.vy;

            // Bounce shards off walls
            if (shard.x < 0 || shard.x > this.canvas.width) shard.vx *= -1;
            if (shard.y < 0 || shard.y > this.canvas.height) shard.vy *= -1;

            const dist = Math.sqrt((this.x - shard.x) ** 2 + (this.y - shard.y) ** 2);
            if (dist < 10) {
                this.gameOver();
                return;
            }
        }

        // Particles
        this.particles.forEach((p, i) => {
            p.update();
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        // Time score
        this.score += 0.01 * this.speed;
    }

    draw() {
        this.ctx.fillStyle = '#030305';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Boundary glow
        this.ctx.strokeStyle = 'rgba(76, 201, 240, 0.05)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);

        // Pulse effect
        if (this.pulseActive > 0) {
            const r = (20 - this.pulseActive) * (SETTINGS.pulseRadius / 20);
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(76, 201, 240, ${this.pulseActive / 20})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Fragments
        this.fragments.forEach(frag => {
            frag.pulse += 0.1;
            const glow = Math.sin(frag.pulse) * 5 + 10;
            
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = frag.isRare ? '#ffb703' : '#4cc9f0';
            this.ctx.fillStyle = frag.isRare ? '#ffb703' : '#4cc9f0';
            
            this.ctx.beginPath();
            this.ctx.arc(frag.x, frag.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;

        // Shards
        this.ctx.fillStyle = '#ff4a4a';
        this.shards.forEach(shard => {
            this.ctx.beginPath();
            this.ctx.moveTo(shard.x, shard.y - shard.size);
            this.ctx.lineTo(shard.x + shard.size, shard.y + shard.size);
            this.ctx.lineTo(shard.x - shard.size, shard.y + shard.size);
            this.ctx.closePath();
            this.ctx.fill();
        });

        // Coil Trail
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        for (let i = this.path.length - 1; i >= 0; i--) {
            const seg = this.path[i];
            const alpha = 1 - (i / this.path.length);
            const size = Math.max(1, 8 * alpha);
            
            this.ctx.beginPath();
            this.ctx.arc(seg.x, seg.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(76, 201, 240, ${alpha * 0.6})`;
            this.ctx.fill();
            
            if (i === 0) { // Head
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(seg.x, seg.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#4cc9f0';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }
        }

        // Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }
}

window.addEventListener('load', () => {
    window.game = new LumenCoil();
});
