// ==================================================
// INSTÄLLNINGAR FÖR STATIC BLOOM
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    gridSize: 6, // INSTÄLLNING - Ändra antal noder per rad i Static Bloom.
    bloomThreshold: 3, // INSTÄLLNING - Ändra hur mycket laddning en nod behöver innan den blommar (0-3).
    startingPulses: 8, // INSTÄLLNING - Ändra hur många klick/pulser spelaren har från start.
    baseTargetBlooms: 12, // INSTÄLLNING - Ändra hur många noder som måste blomma på första nivån.
    targetIncreasePerLevel: 3, // INSTÄLLNING - Ändra hur mycket målet ökar per nivå.
    nodeGap: 12, // INSTÄLLNING - Ändra avståndet mellan noderna.
    bloomDelay: 100, // INSTÄLLNING - Ändra tiden (ms) mellan steg i kedjereaktionen. Högre värde = långsammare reaktion.
    chainSpreadAmount: 1, // INSTÄLLNING - Ändra hur mycket laddning en blommande nod skickar till sina grannar.
    
    playerColor: '#8b6cff', // INSTÄLLNING - Färg för spelarens handlingar.
    accentColor: '#4cc9f0', // INSTÄLLNING - Accentfärg för kedjereaktioner.
    
    bloomGlowStrength: 0.30, // INSTÄLLNING - Ändra hur starkt Static Bloom-noderna lyser.
    chainPulseStrength: 0.44, // INSTÄLLNING - Ändra hur tydlig kedjereaktionen är visuellt.
    nodeIdleOpacity: 0.78, // INSTÄLLNING - Ändra hur synliga inaktiva noder är.
    
    masterVolume: 0.22, // INSTÄLLNING - Ändra total ljudvolym för Static Bloom.
    clickVolume: 0.12, // INSTÄLLNING - Ljudvolym när en nod klickas.
    bloomVolume: 0.18, // INSTÄLLNING - Ljudvolym när en nod blommar.
    clearVolume: 0.2, // INSTÄLLNING - Ljudvolym när nivån klaras.
    
    bestLevelKey: 'taren_static_bloom_best_level' // INSTÄLLNING - localStorage-nyckel för bästa nivå.
};

// Game State
let gameState = 'IDLE'; // IDLE, PLAYING, REACTING, WON, GAMEOVER
let level = 1;
let pulses = 0;
let blooms = 0;
let targetBlooms = 0;
let grid = []; // Array of node objects: { charge, bloomed, element }
let audioCtx = null;

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const levelDisplay = document.getElementById('levelDisplay');
const pulseDisplay = document.getElementById('pulseDisplay');
const bloomCountDisplay = document.getElementById('bloomCountDisplay');
const statusText = document.getElementById('statusText');
const startScreen = document.getElementById('startScreen');
const winScreen = document.getElementById('winScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');

// Initialize Grid
function initGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${SETTINGS.gridSize}, 1fr)`;
    gridContainer.style.gap = `${SETTINGS.nodeGap}px`;
    
    grid = [];
    const totalNodes = SETTINGS.gridSize * SETTINGS.gridSize;
    
    for (let i = 0; i < totalNodes; i++) {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.dataset.index = i;
        
        nodeEl.addEventListener('mousedown', () => handleNodeClick(i));
        nodeEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNodeClick(i);
        });
        
        gridContainer.appendChild(nodeEl);
        grid.push({
            charge: 0,
            bloomed: false,
            element: nodeEl
        });
    }
}

// Audio Engine
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, type = 'sine', volume = 0.1, duration = 0.2) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume * SETTINGS.masterVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Game Logic
function startGame() {
    initAudio();
    level = 1;
    startLevel();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function startLevel() {
    initGrid();
    pulses = SETTINGS.startingPulses;
    blooms = 0;
    targetBlooms = SETTINGS.baseTargetBlooms + (level - 1) * SETTINGS.targetIncreasePerLevel;
    
    // Add some random initial charge to make it a puzzle
    const initialNodes = Math.floor(grid.length * 0.25);
    for (let i = 0; i < initialNodes; i++) {
        const idx = Math.floor(Math.random() * grid.length);
        grid[idx].charge = Math.floor(Math.random() * SETTINGS.bloomThreshold);
        updateNodeVisual(idx);
    }
    
    updateHUD();
    gameState = 'PLAYING';
    statusText.innerText = 'Grid Active';
    statusText.className = 'status-text active';
    winScreen.classList.add('hidden');
}

function updateHUD() {
    levelDisplay.innerText = level;
    pulseDisplay.innerText = pulses;
    bloomCountDisplay.innerText = `${blooms} / ${targetBlooms}`;
}

function updateNodeVisual(index) {
    const node = grid[index];
    node.element.className = 'node';
    if (gameState === 'PLAYING') node.element.classList.add('interactive');
    if (node.bloomed) {
        node.element.classList.add('bloomed');
    } else if (node.charge > 0) {
        node.element.classList.add(`charge-${node.charge}`);
    }
}

async function handleNodeClick(index) {
    if (gameState !== 'PLAYING') return;
    const node = grid[index];
    if (node.bloomed) return;
    
    pulses--;
    updateHUD();
    
    gameState = 'REACTING';
    playTone(330, 'sine', SETTINGS.clickVolume, 0.1);
    
    await addCharge(index);
    
    checkPostReaction();
}

async function addCharge(index) {
    const node = grid[index];
    if (node.bloomed) return;
    
    node.charge += SETTINGS.chainSpreadAmount;
    
    if (node.charge >= SETTINGS.bloomThreshold) {
        await bloom(index);
    } else {
        updateNodeVisual(index);
    }
}

async function bloom(index) {
    const node = grid[index];
    if (node.bloomed) return;
    
    node.bloomed = true;
    node.charge = SETTINGS.bloomThreshold;
    blooms++;
    updateHUD();
    updateNodeVisual(index);
    
    playTone(440 + (blooms * 10), 'triangle', SETTINGS.bloomVolume, 0.3);
    
    await new Promise(r => setTimeout(r, SETTINGS.bloomDelay));
    
    // Spread to neighbors
    const neighbors = getNeighbors(index);
    const spreadPromises = neighbors.map(nIdx => addCharge(nIdx));
    await Promise.all(spreadPromises);
}

function getNeighbors(index) {
    const neighbors = [];
    const x = index % SETTINGS.gridSize;
    const y = Math.floor(index / SETTINGS.gridSize);
    
    if (x > 0) neighbors.push(index - 1); // Left
    if (x < SETTINGS.gridSize - 1) neighbors.push(index + 1); // Right
    if (y > 0) neighbors.push(index - SETTINGS.gridSize); // Up
    if (y < SETTINGS.gridSize - 1) neighbors.push(index + SETTINGS.gridSize); // Down
    
    return neighbors;
}

function checkPostReaction() {
    if (blooms >= targetBlooms) {
        levelWin();
    } else if (pulses <= 0) {
        gameOver();
    } else {
        gameState = 'PLAYING';
        statusText.innerText = 'Grid Stable';
        // Update all node interactions
        grid.forEach((_, i) => updateNodeVisual(i));
    }
}

function levelWin() {
    gameState = 'WON';
    statusText.innerText = 'Target Reached';
    statusText.className = 'status-text success';
    
    const best = localStorage.getItem(SETTINGS.bestLevelKey) || 0;
    if (level > best) {
        localStorage.setItem(SETTINGS.bestLevelKey, level);
    }
    
    playTone(660, 'sine', SETTINGS.clearVolume, 0.5);
    document.getElementById('game-container').classList.add('level-clear-flash');
    setTimeout(() => document.getElementById('game-container').classList.remove('level-clear-flash'), 600);
    
    setTimeout(() => {
        document.getElementById('winMessage').innerText = `Level ${level} Signal Stabilized.`;
        winScreen.classList.remove('hidden');
    }, 800);
}

function gameOver() {
    gameState = 'GAMEOVER';
    statusText.innerText = 'Signal Faded';
    statusText.className = 'status-text error';
    playTone(110, 'sawtooth', SETTINGS.clickVolume, 0.4);
    
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 1000);
}

// Event Listeners
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', () => {
    level++;
    startLevel();
});

// Init
initGrid();
