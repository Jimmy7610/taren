// INSTÄLLNING - Partiklarnas storlek
const PARTICLE_SIZE = 1.5;
// INSTÄLLNING - Antal partiklar att rendera
const PARTICLE_COUNT = 3000;
// INSTÄLLNING - Vattnets dämpning (hur snabbt vågorna avtar, 0.9 - 0.99)
const DAMPING = 0.96;
// INSTÄLLNING - Hastighet för vågutbredning
const RIPPLE_SPEED = 0.08;

const canvas = document.getElementById('pondCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let ripples = [];

// Audio variables
let audioCtx = null;
let masterGain = null;
let droneOsc = null;
let isMuted = false;
let currentVolume = 0.5;

function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = 0;
        this.vy = 0;
        // INSTÄLLNING - Partiklarnas färg och genomskinlighet
        this.color = `rgba(139, 108, 255, ${Math.random() * 0.5 + 0.1})`;
    }

    update() {
        // Return to base position
        this.vx += (this.baseX - this.x) * 0.01;
        this.vy += (this.baseY - this.y) * 0.01;

        // Apply forces from ripples
        for (let r of ripples) {
            const dx = this.x - r.x;
            const dy = this.y - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (Math.abs(dist - r.radius) < 20) {
                const force = r.strength * Math.sin((dist - r.radius) * 0.1);
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }

        // Apply friction
        this.vx *= DAMPING;
        this.vy *= DAMPING;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, PARTICLE_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].radius += RIPPLE_SPEED * 50;
        ripples[i].strength *= 0.95;
        if (ripples[i].strength < 0.01) {
            ripples.splice(i, 1);
        }
    }

    // Update and draw particles
    for (let p of particles) {
        p.update();
        p.draw();
    }

    requestAnimationFrame(render);
}

function addRipple(x, y) {
    ripples.push({ x, y, radius: 0, strength: 2.0 });
    playRippleSound(x / width);
}

// Interaction
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.random() > 0.8) {
        addRipple(x, y);
    }
});

canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (Math.random() > 0.8) {
        addRipple(x, y);
    }
}, { passive: true });

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener('resize', resize);

// Audio System
document.getElementById('startAudioBtn').addEventListener('click', () => {
    initAudio();
    document.getElementById('startAudioBtn').classList.add('hidden');
    document.getElementById('audioMixer').classList.remove('hidden');
});

document.getElementById('muteBtn').addEventListener('click', (e) => {
    isMuted = !isMuted;
    e.target.innerText = isMuted ? 'Unmute' : 'Mute';
    e.target.classList.toggle('active');
    if (masterGain) {
        masterGain.gain.rampToValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime + 0.1);
    }
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    currentVolume = parseFloat(e.target.value);
    if (masterGain && !isMuted) {
        masterGain.gain.rampToValueAtTime(currentVolume, audioCtx.currentTime + 0.1);
    }
});

function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.value = currentVolume;
    masterGain.connect(audioCtx.destination);
    
    // Background drone
    droneOsc = audioCtx.createOscillator();
    // INSTÄLLNING - Basfrekvens för bakgrundsljudet
    droneOsc.frequency.value = 55; // A1
    droneOsc.type = 'sine';
    
    const droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.1;
    
    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start();
}

function playRippleSound(panValue) {
    if (!audioCtx || isMuted) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Stereo panner if available
    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    
    // INSTÄLLNING - Frekvensomfång för plinget (beror på X-position)
    const baseFreq = 220 + (panValue * 440);
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    if (panner) {
        panner.pan.value = (panValue * 2) - 1; // -1 to 1
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(masterGain);
    } else {
        osc.connect(gain);
        gain.connect(masterGain);
    }
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.6);
}

// Init
resize();
render();
