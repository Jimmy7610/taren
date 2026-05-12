// ==================================================
// INSTÄLLNINGAR FÖR LUMEN SEQUENCE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    padCount: 5,               // INSTÄLLNING - Ändra antal ljusnoder i spelet.
    startPlaybackDelay: 650,    // INSTÄLLNING - Ändra paus innan sekvensen börjar visas.
    baseFlashDuration: 520,     // INSTÄLLNING - Ändra hur länge varje ljus blinkar i början.
    minFlashDuration: 220,      // INSTÄLLNING - Ändra kortaste blinktid på svårare rundor.
    betweenFlashDelay: 180,     // INSTÄLLNING - Ändra pausen mellan ljusblinkningar.
    speedIncreasePerRound: 12,  // INSTÄLLNING - Ändra hur mycket snabbare spelet blir per runda.
    bestRoundKey: "taren_lumen_sequence_best_round", // INSTÄLLNING - Ändra localStorage-nyckeln för bästa runda.

    // VISUAL POLISH
    padGlowStrength: 0.26,      // INSTÄLLNING - Ändra hur starkt Lumen-knapparna lyser.
    activePulseStrength: 0.44,  // INSTÄLLNING - Ändra hur tydlig aktiv sekvenspuls är.
    failureGlowStrength: 0.34,  // INSTÄLLNING - Ändra hur tydlig misslyckad knapptryckning visas.
};

const FREQUENCIES = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5

class LumenSequence {
    constructor() {
        this.container = document.getElementById('lumen-container');
        this.roundEl = document.getElementById('round');
        this.scoreEl = document.getElementById('score');
        this.bestEl = document.getElementById('best-round');
        this.speedEl = document.getElementById('speed');
        
        this.sequence = [];
        this.playerIndex = 0;
        this.round = 1;
        this.score = 0;
        this.isPlaying = false;
        this.isInputEnabled = false;
        this.difficulty = 'calm';
        
        this.bestRound = localStorage.getItem(CONFIG.bestRoundKey) || 0;
        this.bestEl.textContent = this.bestRound;
        
        this.audioCtx = null;
        this.pads = [];
        
        this.initPads();
        this.initEventListeners();
    }

    initPads() {
        this.container.innerHTML = '';
        this.pads = [];
        const radius = 160; // Distance from center
        const centerX = 240;
        const centerY = 240;

        for (let i = 0; i < CONFIG.padCount; i++) {
            const angle = (i / CONFIG.padCount) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius - 50;
            const y = centerY + Math.sin(angle) * radius - 50;
            
            const pad = document.createElement('div');
            pad.className = `lumen-pad pad-${i}`;
            pad.style.left = `${x}px`;
            pad.style.top = `${y}px`;
            pad.innerHTML = `<span>${i + 1}</span>`;
            
            pad.onmousedown = () => this.handlePadInput(i);
            
            this.container.appendChild(pad);
            this.pads.push(pad);
        }
    }

    initEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isPlaying) this.start();
            if (e.key >= '1' && e.key <= CONFIG.padCount.toString()) {
                this.handlePadInput(parseInt(e.key) - 1);
            }
            if (e.key.toLowerCase() === 'r') this.reset();
        });
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    start() {
        this.initAudio();
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        this.isPlaying = true;
        this.round = 1;
        this.score = 0;
        this.sequence = [];
        this.updateHUD();
        this.nextRound();
    }

    reset() {
        this.start();
    }

    nextRound() {
        this.isInputEnabled = false;
        this.playerIndex = 0;
        this.sequence.push(Math.floor(Math.random() * CONFIG.padCount));
        this.updateHUD();
        
        setTimeout(() => this.playSequence(), CONFIG.startPlaybackDelay);
    }

    async playSequence() {
        const duration = Math.max(
            CONFIG.minFlashDuration, 
            CONFIG.baseFlashDuration - (this.round * CONFIG.speedIncreasePerRound)
        );
        const delay = CONFIG.betweenFlashDelay;

        for (let i = 0; i < this.sequence.length; i++) {
            await this.flashPad(this.sequence[i], duration);
            await new Promise(r => setTimeout(r, delay));
        }
        
        this.isInputEnabled = true;
    }

    async flashPad(index, duration) {
        const pad = this.pads[index];
        pad.classList.add('active');
        this.playSound(index, duration);
        await new Promise(r => setTimeout(r, duration));
        pad.classList.remove('active');
    }

    playSound(index, duration) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(FREQUENCIES[index % FREQUENCIES.length], this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration / 1000);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration / 1000);
    }

    handlePadInput(index) {
        if (!this.isInputEnabled) return;
        this.initAudio();

        const duration = 200;
        this.flashPad(index, duration);

        if (index === this.sequence[this.playerIndex]) {
            this.playerIndex++;
            if (this.playerIndex === this.sequence.length) {
                this.score += this.round * 10;
                this.round++;
                this.nextRound();
            }
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.isInputEnabled = false;
        if (this.round > this.bestRound) {
            this.bestRound = this.round;
            localStorage.setItem(CONFIG.bestRoundKey, this.bestRound);
        }
        document.getElementById('final-stats').textContent = `You reached Round ${this.round}`;
        document.getElementById('game-over').classList.remove('hidden');
        this.updateHUD();
    }

    setDifficulty(level) {
        this.difficulty = level;
        document.querySelectorAll('.difficulty-group .btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === level);
        });
        // In this simple version, difficulty could adjust speedIncreasePerRound
        if (level === 'calm') CONFIG.speedIncreasePerRound = 8;
        if (level === 'focus') CONFIG.speedIncreasePerRound = 15;
        if (level === 'sharp') CONFIG.speedIncreasePerRound = 25;
    }

    updateHUD() {
        this.roundEl.textContent = this.round;
        this.scoreEl.textContent = this.score;
        this.bestEl.textContent = this.bestRound;
        const speed = (1 + (this.round * CONFIG.speedIncreasePerRound) / 500).toFixed(1);
        this.speedEl.textContent = `${speed}x`;
    }
}

const game = new LumenSequence();
