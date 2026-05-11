// ==================================================
// INSTÄLLNINGAR FÖR HOLLOW PATH
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    gridSize: 8, // INSTÄLLNING - Storlek på griddet (8x8).
    startingMoves: 20, // INSTÄLLNING - Hur många drag man har på nivå 1.
    movesIncrease: 5, // INSTÄLLNING - Hur många drag man får extra per nivå.
    visibilityRadius: 2, // INSTÄLLNING - Hur långt man ser (antal noder).
    playerColor: '#8b6cff', // INSTÄLLNING - Spelarens färg.
    exitColor: '#ffffff', // INSTÄLLNING - Utgångens färg.
    bestLevelKey: 'taren_hollow_path_best_level' // INSTÄLLNING - LocalStorage nyckel.
};

// Game State
let level = 1;
let bestLevel = 0;
let moves = 0;
let playerPos = { x: 0, y: 0 };
let exitPos = { x: 0, y: 0 };
let collapsed = new Set(); // Set of "x,y" strings
let gameState = 'IDLE'; // IDLE, PLAYING, WON, GAMEOVER

// DOM
const levelDisplay = document.getElementById('levelDisplay');
const moveDisplay = document.getElementById('moveDisplay');
const bestLevelDisplay = document.getElementById('bestLevelDisplay');
const gridContainer = document.getElementById('grid-container');
const startScreen = document.getElementById('startScreen');
const winScreen = document.getElementById('winScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');

function init() {
    bestLevel = localStorage.getItem(SETTINGS.bestLevelKey) || 0;
    bestLevelDisplay.innerText = bestLevel;

    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);
    nextBtn.addEventListener('click', () => {
        level++;
        startLevel();
    });
}

function startGame() {
    level = 1;
    startLevel();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function startLevel() {
    moves = SETTINGS.startingMoves + (level - 1) * SETTINGS.movesIncrease;
    collapsed = new Set();
    playerPos = { x: 0, y: 0 };
    exitPos = { x: SETTINGS.gridSize - 1, y: SETTINGS.gridSize - 1 };
    
    gameState = 'PLAYING';
    updateHUD();
    renderGrid();
    winScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function updateHUD() {
    levelDisplay.innerText = level;
    moveDisplay.innerText = moves;
}

function renderGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${SETTINGS.gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${SETTINGS.gridSize}, 1fr)`;

    for (let y = 0; y < SETTINGS.gridSize; y++) {
        for (let x = 0; x < SETTINGS.gridSize; x++) {
            const node = document.createElement('div');
            node.className = 'node';
            
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isExit = exitPos.x === x && exitPos.y === y;
            const isCollapsed = collapsed.has(`${x},${y}`);
            
            const dist = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
            const isVisible = dist <= SETTINGS.visibilityRadius;

            if (isPlayer) node.classList.add('player');
            if (isExit && isVisible) node.classList.add('exit');
            if (isCollapsed) node.classList.add('collapsed');
            if (isVisible) node.classList.add('visible');

            // Check if adjacent and not collapsed
            const isAdjacent = dist === 1;
            if (isAdjacent && !isCollapsed && gameState === 'PLAYING') {
                node.classList.add('interactive');
                node.addEventListener('click', () => handleMove(x, y));
            }

            gridContainer.appendChild(node);
        }
    }
}

function handleMove(nx, ny) {
    if (gameState !== 'PLAYING') return;

    // Collapse previous position
    collapsed.add(`${playerPos.x},${playerPos.y}`);
    
    playerPos = { x: nx, y: ny };
    moves--;
    updateHUD();

    if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
        levelWin();
    } else if (moves <= 0) {
        gameOver();
    } else {
        renderGrid();
    }
}

function levelWin() {
    gameState = 'WON';
    if (level > bestLevel) {
        bestLevel = level;
        localStorage.setItem(SETTINGS.bestLevelKey, bestLevel);
        bestLevelDisplay.innerText = bestLevel;
    }
    renderGrid();
    setTimeout(() => {
        winScreen.classList.remove('hidden');
    }, 500);
}

function gameOver() {
    gameState = 'GAMEOVER';
    renderGrid();
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

document.addEventListener('DOMContentLoaded', init);
