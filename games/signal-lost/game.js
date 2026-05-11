// ==================================================
// INSTÄLLNINGAR FÖR SIGNAL LOST
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    roundTimeLimit: 20, // INSTÄLLNING - Sekunder per runda.
    baseTolerance: 4.0, // INSTÄLLNING - Hur nära frekvensen man måste vara (0-100 skala).
    toleranceDecrease: 0.5, // INSTÄLLNING - Hur mycket svårare det blir per runda.
    minTolerance: 0.8, // INSTÄLLNING - Den minsta toleransen som spelet kan nå.
    lockTimeRequired: 1.5, // INSTÄLLNING - Sekunder man måste hålla sig inom toleransen för att låsa.
    signalColor: '#8b6cff', // INSTÄLLNING - Färgen på signalvågen.
    lockColor: '#4cc9f0', // INSTÄLLNING - Färgen när man är nära.
    bestRoundKey: 'taren_signal_lost_best_round' // INSTÄLLNING - LocalStorage nyckel.
};

// Game State
let round = 1;
let bestRound = 0;
let timeLeft = 0;
let targetFreq = 0;
let currentFreq = 50;
let lockProgress = 0; // 0 to 1
let gameState = 'IDLE'; // IDLE, SEARCHING, LOCKED, GAMEOVER
let lastFrameTime = 0;

// DOM
const roundDisplay = document.getElementById('roundDisplay');
const bestRoundDisplay = document.getElementById('bestRoundDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const freqSlider = document.getElementById('freqSlider');
const strengthBar = document.getElementById('strengthBar');
const wavePath = document.getElementById('wave-path');
const lockIndicator = document.getElementById('lock-indicator');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

function init() {
    bestRound = localStorage.getItem(SETTINGS.bestRoundKey) || 0;
    bestRoundDisplay.innerText = bestRound;

    freqSlider.addEventListener('input', (e) => {
        currentFreq = parseFloat(e.target.value);
    });

    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    requestAnimationFrame(update);
}

function startGame() {
    round = 1;
    startRound();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function startRound() {
    targetFreq = Math.random() * 80 + 10; // 10 to 90
    timeLeft = SETTINGS.roundTimeLimit;
    lockProgress = 0;
    gameState = 'SEARCHING';
    roundDisplay.innerText = round;
    lockIndicator.classList.add('hidden');
    wavePath.style.stroke = SETTINGS.signalColor;
}

function update(time) {
    const dt = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    if (gameState === 'SEARCHING') {
        timeLeft -= dt;
        if (timeLeft <= 0) {
            timeLeft = 0;
            gameOver();
        }
        timeDisplay.innerText = Math.ceil(timeLeft);

        const diff = Math.abs(currentFreq - targetFreq);
        const currentTolerance = Math.max(SETTINGS.minTolerance, SETTINGS.baseTolerance - (round - 1) * SETTINGS.toleranceDecrease);
        
        // Strength
        const strength = Math.pow(Math.max(0, 1 - (diff / 15)), 3);
        document.getElementById('strength-bar').style.width = `${strength * 100}%`;

        // Lock Progress
        if (diff < currentTolerance) {
            lockProgress += dt / SETTINGS.lockTimeRequired;
            wavePath.style.stroke = SETTINGS.lockColor;
            if (lockProgress >= 1) {
                roundWin();
            }
        } else {
            lockProgress = Math.max(0, lockProgress - dt * 2);
            wavePath.style.stroke = SETTINGS.signalColor;
        }

        drawWave(diff, strength);
    }

    requestAnimationFrame(update);
}

function drawWave(diff, strength) {
    let d = "M 0 10 ";
    const segments = 100;
    const noise = Math.max(0, diff - 2) * 0.5;
    
    for (let i = 0; i <= segments; i++) {
        const x = i;
        const y = 10 + Math.sin(i * 0.3 + Date.now() * 0.01) * (2 + strength * 8) 
                 + (Math.random() - 0.5) * noise;
        d += `L ${x} ${y} `;
    }
    wavePath.setAttribute('d', d);
}

function roundWin() {
    gameState = 'LOCKED';
    lockIndicator.classList.remove('hidden');
    document.getElementById('strength-bar').style.width = '100%';
    
    if (round > bestRound) {
        bestRound = round;
        localStorage.setItem(SETTINGS.bestRoundKey, bestRound);
        bestRoundDisplay.innerText = bestRound;
    }

    setTimeout(() => {
        round++;
        startRound();
    }, 1500);
}

function gameOver() {
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', init);
