// ==================================================
// INSTÄLLNINGAR FÖR NIGHT SIGNAL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    startingLives: 3, // INSTÄLLNING - Hur många missar man tål.
    pulseIntervalMin: 1200, // INSTÄLLNING - Minsta tid mellan pulser (ms).
    pulseIntervalMax: 2400, // INSTÄLLNING - Max tid mellan pulser (ms).
    pulseTravelDuration: 2500, // INSTÄLLNING - Hur lång tid en puls tar att expandera (ms).
    hitWindowRange: 0.1, // INSTÄLLNING - Hur nära ringen (0-1 skala) man måste vara. 0.1 = 10%.
    falseSignalChance: 0.35, // INSTÄLLNING - Sannolikhet för en falsk puls.
    scorePerHit: 1, // INSTÄLLNING - Poäng per träff.
    speedIncrease: 50, // INSTÄLLNING - Hur mycket pulserna snabbas upp per träff (ms avdrag).
    
    nightPulseGlow: 0.36, // INSTÄLLNING - Ändra hur starkt natt-signalen lyser.
    timingWindowGlow: 0.26, // INSTÄLLNING - Ändra hur tydligt timingfönstret syns.
    missFeedbackOpacity: 0.24, // INSTÄLLNING - Ändra hur tydlig miss-feedback är.
    
    bestScoreKey: 'taren_night_signal_best_score' // INSTÄLLNING - LocalStorage nyckel.
};

// Game State
let score = 0;
let lives = 0;
let bestScore = 0;
let gameState = 'IDLE';
let pulses = [];
let nextPulseTimeout = null;

// DOM
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const gameContainer = document.getElementById('game-container');
const targetRing = document.getElementById('target-ring');
const pulsesContainer = document.getElementById('pulses-container');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

function init() {
    bestScore = localStorage.getItem(SETTINGS.bestScoreKey) || 0;
    bestScoreDisplay.innerText = bestScore;

    gameContainer.addEventListener('mousedown', handleClick);
    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    requestAnimationFrame(update);
}

function startGame() {
    score = 0;
    lives = SETTINGS.startingLives;
    pulses = [];
    gameState = 'PLAYING';
    updateHUD();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scheduleNextPulse();
}

function updateHUD() {
    scoreDisplay.innerText = score;
    livesDisplay.innerText = lives;
}

function scheduleNextPulse() {
    if (gameState !== 'PLAYING') return;
    const delay = Math.max(800, Math.random() * (SETTINGS.pulseIntervalMax - SETTINGS.pulseIntervalMin) + SETTINGS.pulseIntervalMin - (score * SETTINGS.speedIncrease));
    nextPulseTimeout = setTimeout(spawnPulse, delay);
}

function spawnPulse() {
    if (gameState !== 'PLAYING') return;
    
    const isTrue = Math.random() > SETTINGS.falseSignalChance;
    const pulseEl = document.createElement('div');
    pulseEl.className = `pulse ${isTrue ? 'true' : 'false'}`;
    pulsesContainer.appendChild(pulseEl);

    const pulse = {
        element: pulseEl,
        isTrue: isTrue,
        progress: 0,
        startTime: Date.now()
    };
    pulses.push(pulse);

    scheduleNextPulse();
}

function handleClick() {
    if (gameState !== 'PLAYING') return;

    // Check for pulses in hit window
    let hitFound = false;
    for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        // Target ring is at 80% width. Our pulses expand from 0 to 100%.
        // So they hit the ring at progress 0.8.
        const distToRing = Math.abs(p.progress - 0.8);

        if (distToRing < SETTINGS.hitWindowRange) {
            if (p.isTrue) {
                handleHit(i);
                hitFound = true;
                break;
            } else {
                handleMiss();
                removePulse(i);
                hitFound = true;
                break;
            }
        }
    }

    if (!hitFound) {
        handleMiss();
    }
}

function handleHit(index) {
    score += SETTINGS.scorePerHit;
    updateHUD();
    removePulse(index);
    
    targetRing.className = 'hit';
    setTimeout(() => { if(targetRing.className === 'hit') targetRing.className = ''; }, 200);
}

function handleMiss() {
    lives--;
    updateHUD();
    targetRing.className = 'miss';
    setTimeout(() => { if(targetRing.className === 'miss') targetRing.className = ''; }, 200);
    
    if (lives <= 0) gameOver();
}

function removePulse(index) {
    const p = pulses[index];
    if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element);
    }
    pulses.splice(index, 1);
}

function update() {
    if (gameState === 'PLAYING') {
        const now = Date.now();
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.progress = (now - p.startTime) / SETTINGS.pulseTravelDuration;
            
            if (p.progress > 1) {
                if (p.isTrue) handleMiss(); // Missed a true signal
                removePulse(i);
                continue;
            }

            p.element.style.width = `${p.progress * 100}%`;
            p.element.style.height = `${p.progress * 100}%`;
            p.element.style.opacity = 1 - p.progress;
        }
    }
    requestAnimationFrame(update);
}

function gameOver() {
    gameState = 'GAMEOVER';
    clearTimeout(nextPulseTimeout);
    finalScoreText.innerText = `Final Score: ${score}`;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(SETTINGS.bestScoreKey, bestScore);
        bestScoreDisplay.innerText = bestScore;
    }
    gameOverScreen.classList.remove('hidden');
    pulses.forEach(p => {
        if (p.element && p.element.parentNode) p.element.parentNode.removeChild(p.element);
    });
    pulses = [];
}

document.addEventListener('DOMContentLoaded', init);
