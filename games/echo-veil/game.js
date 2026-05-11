// ==================================================
// INSTÄLLNINGAR FÖR ECHO VEIL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    startingEchoes: 3, // INSTÄLLNING - Hur många ekon som visas på nivå 1.
    echoesIncrease: 1, // INSTÄLLNING - Hur många fler ekon per nivå.
    revealDuration: 1200, // INSTÄLLNING - Hur länge ekona syns (ms).
    clickTolerance: 30, // INSTÄLLNING - Hur nära man måste klicka (px).
    pulseDelay: 500, // INSTÄLLNING - Fördröjning innan pulsen startar (ms).
    bestRoundKey: 'taren_echo_veil_best_round' // INSTÄLLNING - LocalStorage nyckel.
};

// Game State
let round = 1;
let bestRound = 0;
let targets = []; // { x, y, found }
let foundCount = 0;
let gameState = 'IDLE'; // IDLE, PULSING, REVEALING, GUESSING, WON, GAMEOVER

// DOM
const roundDisplay = document.getElementById('roundDisplay');
const targetDisplay = document.getElementById('targetDisplay');
const bestRoundDisplay = document.getElementById('bestRoundDisplay');
const gameContainer = document.getElementById('game-container');
const echoPointsContainer = document.getElementById('echo-points');
const pulseRing = document.getElementById('pulse-ring');
const statusText = document.getElementById('statusText');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

function init() {
    bestRound = localStorage.getItem(SETTINGS.bestRoundKey) || 0;
    bestRoundDisplay.innerText = bestRound;

    gameContainer.addEventListener('mousedown', handleInput);
    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);
}

function startGame() {
    round = 1;
    startRound();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function startRound() {
    gameState = 'PULSING';
    targets = [];
    foundCount = 0;
    echoPointsContainer.innerHTML = '';
    roundDisplay.innerText = round;
    updateHUD();
    
    statusText.innerText = 'Concentrate...';
    statusText.className = 'instruction-text active';

    // Generate targets
    const count = SETTINGS.startingEchoes + (round - 1) * SETTINGS.echoesIncrease;
    for (let i = 0; i < count; i++) {
        targets.push({
            x: 10 + Math.random() * 80, // 10% to 90%
            y: 10 + Math.random() * 80,
            found: false
        });
    }

    // Trigger Pulse
    setTimeout(() => {
        pulseRing.classList.remove('pulse-animation');
        void pulseRing.offsetWidth; // trigger reflow
        pulseRing.classList.add('pulse-animation');
        
        setTimeout(revealTargets, 800);
    }, SETTINGS.pulseDelay);
}

function revealTargets() {
    gameState = 'REVEALING';
    targets.forEach(t => {
        const el = document.createElement('div');
        el.className = 'echo-point revealed';
        el.style.left = `${t.x}%`;
        el.style.top = `${t.y}%`;
        echoPointsContainer.appendChild(el);
        t.element = el;
    });

    setTimeout(() => {
        targets.forEach(t => t.element.classList.remove('revealed'));
        gameState = 'GUESSING';
        statusText.innerText = 'Find the echoes.';
        statusText.className = 'instruction-text';
    }, SETTINGS.revealDuration);
}

function handleInput(e) {
    if (gameState !== 'GUESSING') return;

    const rect = gameContainer.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let hit = false;
    for (let t of targets) {
        if (t.found) continue;
        
        // Convert % to pixels for tolerance check
        const dx = (t.x - clickX) * (rect.width / 100);
        const dy = (t.y - clickY) * (rect.height / 100);
        const dist = Math.hypot(dx, dy);

        if (dist < SETTINGS.clickTolerance) {
            t.found = true;
            t.element.classList.add('found');
            foundCount++;
            updateHUD();
            hit = true;
            break;
        }
    }

    if (!hit) {
        gameOver();
    } else if (foundCount === targets.length) {
        roundWin();
    }
}

function updateHUD() {
    targetDisplay.innerText = `${foundCount} / ${targets.length}`;
}

function roundWin() {
    gameState = 'WON';
    statusText.innerText = 'Memory stable.';
    if (round > bestRound) {
        bestRound = round;
        localStorage.setItem(SETTINGS.bestRoundKey, bestRound);
        bestRoundDisplay.innerText = bestRound;
    }

    setTimeout(() => {
        round++;
        startRound();
    }, 1200);
}

function gameOver() {
    gameState = 'GAMEOVER';
    statusText.innerText = 'Memory faded.';
    // Reveal all
    targets.forEach(t => {
        if (!t.found) {
            t.element.style.backgroundColor = '#ff4c4c';
            t.element.style.boxShadow = '0 0 15px #ff4c4c';
            t.element.classList.add('revealed');
        }
    });

    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
