// ==================================================
// INSTÄLLNINGAR FÖR MEMORY DRIFT
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    gridSize: 3, // INSTÄLLNING - Ändra antal rutor per rad i Memory Drift. 3 betyder ett 3x3-rutnät.
    tileGap: 14, // INSTÄLLNING - Ändra avståndet mellan rutorna. Högre värde = luftigare spelplan.
    sequenceStartLength: 1, // INSTÄLLNING - Ändra hur lång första sekvensen är.
    sequenceAddPerRound: 1, // INSTÄLLNING - Ändra hur många steg som läggs till varje runda.
    showStepDuration: 520, // INSTÄLLNING - Ändra hur länge varje sekvensruta lyser när spelet visar mönstret.
    showStepGap: 180, // INSTÄLLNING - Ändra pausen mellan visade steg i sekvensen.
    inputFlashDuration: 180, // INSTÄLLNING - Ändra hur länge en ruta lyser när spelaren klickar.
    interRoundDelay: 800, // INSTÄLLNING - Ändra hur länge spelet väntar innan nästa runda börjar.
    mistakesAllowed: 1, // INSTÄLLNING - Ändra hur många misstag som tillåts innan spelet är över.
    
    playerColor: '#8b6cff', // INSTÄLLNING - Ändra huvudfärgen för spelarens glow.
    accentColor: '#4cc9f0', // INSTÄLLNING - Ändra accentfärgen för extra glow och highlights.
    
    memoryPadGlowStrength: 0.26, // INSTÄLLNING - Ändra hur starkt Memory Drift-rutorna lyser.
    memoryActivePulse: 0.42, // INSTÄLLNING - Ändra hur tydlig aktiv sekvenspuls är.
    memoryFailureGlow: 0.32, // INSTÄLLNING - Ändra hur tydlig misslyckad inmatning visas.
    
    masterVolume: 0.22, // INSTÄLLNING - Ändra total ljudvolym för Memory Drift.
    showToneVolume: 0.16, // INSTÄLLNING - Ändra ljudvolym när spelet visar sekvensen.
    inputToneVolume: 0.18, // INSTÄLLNING - Ändra ljudvolym när spelaren klickar.
    errorToneVolume: 0.14, // INSTÄLLNING - Ändra ljudvolym för feltonen.
    
    bestScoreKey: 'taren_memory_drift_best', // INSTÄLLNING - Ändra localStorage-nyckeln för bästa resultat.
};

// Game State
let gameState = 'IDLE'; // IDLE, WATCHING, PLAYING, GAMEOVER
let sequence = [];
let userSequence = [];
let round = 1;
let score = 0;
let bestScore = 0;
let audioCtx = null;

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const roundDisplay = document.getElementById('roundDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const statusText = document.getElementById('statusText');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

// Initialize Grid
function initGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${SETTINGS.gridSize}, 1fr)`;
    gridContainer.style.gap = `${SETTINGS.tileGap}px`;
    
    const totalTiles = SETTINGS.gridSize * SETTINGS.gridSize;
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        tile.addEventListener('mousedown', () => handleTileClick(i));
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTileClick(i);
        });
        gridContainer.appendChild(tile);
    }
}

// Audio Engine
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(index, type = 'normal') {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'normal') {
        // Higher index = higher pitch
        const freq = 200 + (index * 40);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);
        gainNode.gain.setValueAtTime(SETTINGS.showToneVolume * SETTINGS.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'player') {
        const freq = 220 + (index * 44);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gainNode.gain.setValueAtTime(SETTINGS.inputToneVolume * SETTINGS.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(55, now + 0.3);
        gainNode.gain.setValueAtTime(SETTINGS.errorToneVolume * SETTINGS.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

// Game Logic
function startGame() {
    initAudio();
    round = 1;
    score = 0;
    sequence = [];
    bestScore = localStorage.getItem(SETTINGS.bestScoreKey) || 0;
    
    bestScoreDisplay.innerText = bestScore;
    scoreDisplay.innerText = score;
    roundDisplay.innerText = round;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    nextRound();
}

function nextRound() {
    userSequence = [];
    roundDisplay.innerText = round;
    
    // Add new steps to sequence
    for (let i = 0; i < SETTINGS.sequenceAddPerRound; i++) {
        const randomIndex = Math.floor(Math.random() * (SETTINGS.gridSize * SETTINGS.gridSize));
        sequence.push(randomIndex);
    }
    
    playSequence();
}

async function playSequence() {
    gameState = 'WATCHING';
    statusText.innerText = 'Watch';
    statusText.className = 'status-text watch';
    
    // Disable interactions
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(t => t.classList.remove('interactive'));
    
    await new Promise(r => setTimeout(r, 600));
    
    for (let i = 0; i < sequence.length; i++) {
        const tileIndex = sequence[i];
        const tile = gridContainer.children[tileIndex];
        
        // Flash tile
        tile.classList.add('glow-show');
        tile.style.setProperty('--accent-glow', SETTINGS.accentColor);
        playTone(tileIndex, 'normal');
        
        await new Promise(r => setTimeout(r, SETTINGS.showStepDuration));
        tile.classList.remove('glow-show');
        
        await new Promise(r => setTimeout(r, SETTINGS.showStepGap));
    }
    
    gameState = 'PLAYING';
    statusText.innerText = 'Your Turn';
    statusText.className = 'status-text play';
    tiles.forEach(t => t.classList.add('interactive'));
}

function handleTileClick(index) {
    if (gameState !== 'PLAYING') return;
    
    const tile = gridContainer.children[index];
    userSequence.push(index);
    
    // Flash tile feedback
    tile.classList.add('glow-input');
    tile.style.setProperty('--accent-glow', SETTINGS.playerColor);
    playTone(index, 'player');
    
    setTimeout(() => {
        tile.classList.remove('glow-input');
    }, SETTINGS.inputFlashDuration);
    
    // Check correctness
    const currentStep = userSequence.length - 1;
    if (userSequence[currentStep] !== sequence[currentStep]) {
        gameOver();
        return;
    }
    
    // Check completion
    if (userSequence.length === sequence.length) {
        success();
    }
}

function success() {
    gameState = 'IDLE';
    score++;
    scoreDisplay.innerText = score;
    scoreDisplay.classList.add('score-pulse');
    setTimeout(() => scoreDisplay.classList.remove('score-pulse'), 300);
    
    statusText.innerText = 'Correct';
    
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.innerText = bestScore;
        localStorage.setItem(SETTINGS.bestScoreKey, bestScore);
    }
    
    round++;
    setTimeout(nextRound, SETTINGS.interRoundDelay);
}

function gameOver() {
    gameState = 'GAMEOVER';
    statusText.innerText = 'Sequence Lost';
    statusText.className = 'status-text error';
    
    // Flash all tiles or error tile
    const errorTile = gridContainer.children[userSequence[userSequence.length - 1]];
    if (errorTile) errorTile.classList.add('glow-error');
    
    playTone(0, 'error');
    
    setTimeout(() => {
        finalScoreDisplay.innerText = `You reached round ${round} with ${score} patterns.`;
        gameOverScreen.classList.remove('hidden');
        if (errorTile) errorTile.classList.remove('glow-error');
    }, 1000);
}

// Event Listeners
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

// Initialize
initGrid();
bestScore = localStorage.getItem(SETTINGS.bestScoreKey) || 0;
bestScoreDisplay.innerText = bestScore;
