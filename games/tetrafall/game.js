// ==================================================
// INSTÄLLNINGAR FÖR TETRAFALL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    columns: 10, // INSTÄLLNING - Ändra antal kolumner på spelbrädet.
    rows: 20, // INSTÄLLNING - Ändra antal rader på spelbrädet.
    cellSize: 24, // INSTÄLLNING - Ändra grundstorleken på varje blockcell.
    startDropInterval: 850, // INSTÄLLNING - Ändra hur snabbt blocken faller på level 1 (ms). Lägre värde = snabbare spel.
    minDropInterval: 100, // INSTÄLLNING - Ändra snabbaste tillåtna fallhastigheten (ms).
    dropSpeedIncreasePerLevel: 80, // INSTÄLLNING - Ändra hur mycket snabbare spelet blir per level (ms).
    softDropScore: 1, // INSTÄLLNING - Ändra poängbonus per soft drop-steg.
    hardDropScore: 2, // INSTÄLLNING - Ändra poängbonus per hard drop-steg.
    linesPerLevel: 10, // INSTÄLLNING - Ändra hur många rader som krävs för att gå upp en level.
    lineClearFlashDuration: 260, // INSTÄLLNING - Ändra hur länge radrensnings-effekten syns (ms).
    lockDelay: 200, // INSTÄLLNING - Ändra liten fördröjning innan en bit låses efter landning (ms).
    pieceGlowStrength: 0.9, // INSTÄLLNING - Ändra hur starkt blocken lyser.
    ghostOpacity: 0.24, // INSTÄLLNING - Ändra hur tydlig ghost piece/landningsförhandsvisningen är.
    boardGlowStrength: 0.55, // INSTÄLLNING - Ändra hur starkt spelbrädet glöder.
    bestScoreKey: 'taren_tetrafall_best_score', // INSTÄLLNING - Ändra localStorage-nyckeln för bästa poäng.
};

const SHAPES = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]],
    'O': [[1,1], [1,1]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'T': [[0,1,0], [1,1,1], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]]
};

const COLORS = {
    'I': 'color-i',
    'J': 'color-j',
    'L': 'color-l',
    'O': 'color-o',
    'S': 'color-s',
    'T': 'color-t',
    'Z': 'color-z'
};

let board = [];
let score = 0;
let level = 1;
let linesCleared = 0;
let bestScore = 0;
let isPaused = false;
let isGameOver = false;

let currentPiece = null;
let nextPieceType = '';
let holdPieceType = '';
let canHold = true;

let lastDropTime = 0;
let dropInterval = CONFIG.startDropInterval;

// Initialize
function init() {
    loadBestScore();
    createBoard();
    resetGame();
    setupEventListeners();
    requestAnimationFrame(update);
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = [];
    for (let r = 0; r < CONFIG.rows; r++) {
        board[r] = [];
        for (let c = 0; c < CONFIG.columns; c++) {
            board[r][c] = null;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            boardEl.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', resetGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);

    window.addEventListener('keydown', e => {
        if (isGameOver) return;
        
        if (e.key.toLowerCase() === 'p') togglePause();
        if (isPaused) return;

        switch(e.key) {
            case 'ArrowLeft': case 'a': case 'A': movePiece(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D': movePiece(1, 0); break;
            case 'ArrowDown': case 's': case 'S': softDrop(); break;
            case 'ArrowUp': case 'w': case 'W': rotatePiece(); break;
            case ' ': e.preventDefault(); hardDrop(); break;
            case 'c': case 'C': holdPiece(); break;
        }
    });
}

function resetGame() {
    score = 0;
    level = 1;
    linesCleared = 0;
    isPaused = false;
    isGameOver = false;
    dropInterval = CONFIG.startDropInterval;
    holdPieceType = '';
    canHold = true;

    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns; c++) {
            board[r][c] = null;
        }
    }

    nextPieceType = getRandomPieceType();
    spawnPiece();
    updateHUD();
    document.getElementById('status-overlay').classList.remove('visible');
    document.getElementById('pause-btn').innerText = 'Pause';
}

function spawnPiece() {
    const type = nextPieceType;
    nextPieceType = getRandomPieceType();
    currentPiece = {
        type: type,
        matrix: SHAPES[type],
        x: Math.floor(CONFIG.columns / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };

    if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.matrix)) {
        gameOver();
    }
    
    canHold = true;
    renderPreviews();
}

function getRandomPieceType() {
    const types = Object.keys(SHAPES);
    return types[Math.floor(Math.random() * types.length)];
}

function movePiece(dx, dy) {
    if (!checkCollision(currentPiece.x + dx, currentPiece.y + dy, currentPiece.matrix)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

function rotatePiece() {
    const m = currentPiece.matrix;
    const rotated = m[0].map((_, i) => m.map(row => row[i]).reverse());
    
    // Simple wall kick
    let offset = 0;
    if (checkCollision(currentPiece.x, currentPiece.y, rotated)) {
        offset = currentPiece.x > CONFIG.columns / 2 ? -1 : 1;
        if (checkCollision(currentPiece.x + offset, currentPiece.y, rotated)) {
            return; // Cannot rotate
        }
    }
    
    currentPiece.x += offset;
    currentPiece.matrix = rotated;
}

function softDrop() {
    if (movePiece(0, 1)) {
        score += CONFIG.softDropScore;
        updateHUD();
    }
}

function hardDrop() {
    let droppedLines = 0;
    while (movePiece(0, 1)) {
        droppedLines++;
    }
    score += droppedLines * CONFIG.hardDropScore;
    mergePiece();
    updateHUD();
}

function holdPiece() {
    if (!canHold) return;
    
    if (holdPieceType === '') {
        holdPieceType = currentPiece.type;
        spawnPiece();
    } else {
        const temp = currentPiece.type;
        currentPiece = {
            type: holdPieceType,
            matrix: SHAPES[holdPieceType],
            x: Math.floor(CONFIG.columns / 2) - Math.floor(SHAPES[holdPieceType][0].length / 2),
            y: 0
        };
        holdPieceType = temp;
    }
    
    canHold = false;
    renderPreviews();
}

function checkCollision(x, y, matrix) {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
                const newX = x + c;
                const newY = y + r;
                if (newX < 0 || newX >= CONFIG.columns || newY >= CONFIG.rows) return true;
                if (newY >= 0 && board[newY][newX]) return true;
            }
        }
    }
    return false;
}

function mergePiece() {
    const m = currentPiece.matrix;
    for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
            if (m[r][c]) {
                const boardY = currentPiece.y + r;
                const boardX = currentPiece.x + c;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }
    clearLines();
    spawnPiece();
}

function clearLines() {
    let linesToClear = [];
    for (let r = CONFIG.rows - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== null)) {
            linesToClear.push(r);
        }
    }

    if (linesToClear.length > 0) {
        // Line clear scores: 100, 300, 500, 800
        const linePoints = [0, 100, 300, 500, 800];
        score += linePoints[linesToClear.length] * level;
        linesCleared += linesToClear.length;
        
        // Level up
        if (linesCleared >= level * CONFIG.linesPerLevel) {
            level++;
            dropInterval = Math.max(CONFIG.minDropInterval, CONFIG.startDropInterval - (level - 1) * CONFIG.dropSpeedIncreasePerLevel);
        }

        // Animation flash
        linesToClear.forEach(r => {
            for (let c = 0; c < CONFIG.columns; c++) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                cell.classList.add('flash');
            }
        });

        setTimeout(() => {
            linesToClear.forEach(r => {
                board.splice(r, 1);
                board.unshift(new Array(CONFIG.columns).fill(null));
            });
            updateHUD();
        }, CONFIG.lineClearFlashDuration);
    }
}

function getGhostPiece() {
    let ghostY = currentPiece.y;
    while (!checkCollision(currentPiece.x, ghostY + 1, currentPiece.matrix)) {
        ghostY++;
    }
    return { ...currentPiece, y: ghostY };
}

function update(time = 0) {
    if (!isPaused && !isGameOver) {
        const deltaTime = time - lastDropTime;
        if (deltaTime > dropInterval) {
            if (!movePiece(0, 1)) {
                mergePiece();
            }
            lastDropTime = time;
        }
        render();
    }
    requestAnimationFrame(update);
}

function render() {
    // Clear styles
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('flash');
    });

    // Render locked blocks
    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns; c++) {
            if (board[r][c]) {
                drawBlock(r, c, board[r][c]);
            }
        }
    }

    // Render ghost piece
    const ghost = getGhostPiece();
    drawPiece(ghost, true);

    // Render active piece
    drawPiece(currentPiece);
}

function drawPiece(piece, isGhost = false) {
    const m = piece.matrix;
    for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
            if (m[r][c]) {
                drawBlock(piece.y + r, piece.x + c, piece.type, isGhost);
            }
        }
    }
}

function drawBlock(r, c, type, isGhost = false) {
    if (r < 0 || r >= CONFIG.rows || c < 0 || c >= CONFIG.columns) return;
    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.classList.add(COLORS[type]);
        if (isGhost) block.classList.add('ghost');
        cell.appendChild(block);
    }
}

function renderPreviews() {
    renderPreview('hold-preview', holdPieceType);
    renderPreview('next-preview', nextPieceType);
}

function renderPreview(containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (type === '') return;
    
    const matrix = SHAPES[type];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const cell = document.createElement('div');
            cell.style.width = '14px';
            cell.style.height = '14px';
            cell.style.background = 'transparent';
            cell.style.borderRadius = '2px';
            
            if (matrix[r] && matrix[r][c]) {
                const block = document.createElement('div');
                block.style.width = '100%';
                block.style.height = '100%';
                block.style.borderRadius = '2px';
                block.classList.add('block', COLORS[type]);
                cell.appendChild(block);
            }
            container.appendChild(cell);
        }
    }
}

function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    const overlay = document.getElementById('status-overlay');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (isPaused) {
        overlay.innerHTML = '<div class="status-title">Paused</div><p>Press P to resume</p>';
        overlay.classList.add('visible');
        pauseBtn.innerText = 'Resume';
    } else {
        overlay.classList.remove('visible');
        pauseBtn.innerText = 'Pause';
    }
}

function gameOver() {
    isGameOver = true;
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
    }
    const overlay = document.getElementById('status-overlay');
    overlay.innerHTML = `<div class="status-title">Game Over</div><p>Score: ${score}</p><button class="btn btn-primary mt-4" onclick="resetGame()">Try Again</button>`;
    overlay.classList.add('visible');
}

function updateHUD() {
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
    document.getElementById('lines').innerText = linesCleared;
    document.getElementById('best-score').innerText = bestScore;
}

function saveBestScore() {
    localStorage.setItem(CONFIG.bestScoreKey, bestScore);
}

function loadBestScore() {
    const saved = localStorage.getItem(CONFIG.bestScoreKey);
    if (saved) bestScore = parseInt(saved);
}

document.addEventListener('DOMContentLoaded', init);
window.resetGame = resetGame; // Expose for Try Again button
