// ==================================================
// INSTÄLLNINGAR FÖR FOURFOLD
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    columns: 7, // INSTÄLLNING - Ändra antal kolumner på spelbrädet.
    rows: 6, // INSTÄLLNING - Ändra antal rader på spelbrädet.
    dropAnimationDuration: 280, // INSTÄLLNING - Ändra hur snabbt brickorna faller ner i kolumnen (ms).
    computerTurnDelay: 600, // INSTÄLLNING - Ändra hur länge Computer väntar innan sitt drag (ms).
    pieceGlowStrength: 0.9, // INSTÄLLNING - Ändra hur starkt spelbrickorna lyser.
    hoverGlowStrength: 0.55, // INSTÄLLNING - Ändra hur tydligt en vald kolumn markeras vid hover.
    winPulseStrength: 1.15, // INSTÄLLNING - Ändra hur tydligt en vinnande rad pulserar.

    // VISUAL POLISH
    tokenGlowStrength: 0.28,    // INSTÄLLNING - Ändra hur starkt spelmarkerna lyser.
    boardSlotDepth: 0.20,       // INSTÄLLNING - Ändra hur djupa hålen i Fourfold-brädet upplevs.
    winGlowStrength: 0.42,      // INSTÄLLNING - Ändra hur tydlig vinstmarkeringen är.

    easyRandomness: 0.7, // INSTÄLLNING - Ändra hur slumpmässigt Easy spelar. Högre värde = svagare motstånd.
    normalCenterBias: 1.2, // INSTÄLLNING - Ändra hur mycket Normal prioriterar mittenkolumner.
    hardSearchDepth: 4, // INSTÄLLNING - Ändra hur djupt Hard analyserar framtida drag (Minimax depth).
    playerColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på dina brickor.
    computerColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på Computers brickor.
    boardBg: '#131722', // INSTÄLLNING - Ändra grundfärgen på spelbrädet.
    slotColor: '#0b0f18', // INSTÄLLNING - Ändra färgen på de tomma hålen/cellerna.
    scoreStorageKey: 'taren_fourfold_scores', // INSTÄLLNING - Ändra localStorage-nyckeln om du vill spara poäng separat.
    difficultyStorageKey: 'taren_fourfold_difficulty', // INSTÄLLNING - Ändra var svårighetsgrad sparas.
};

const EMPTY = 0;
const PLAYER = 1;
const COMPUTER = 2;

let board = [];
let isGameOver = false;
let currentTurn = PLAYER;
let scores = { player: 0, computer: 0, draws: 0 };
let currentDifficulty = 'normal';
let isAnimating = false;

// Initialize
function init() {
    loadGameState();
    createBoard();
    setupEventListeners();
    updateHUD();
    updateDifficultyUI();
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${CONFIG.columns}, 1fr)`;
    board = [];

    for (let r = 0; r < CONFIG.rows; r++) {
        board[r] = [];
        for (let c = 0; c < CONFIG.columns; c++) {
            board[r][c] = EMPTY;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('mouseenter', () => highlightColumn(c, true));
            cell.addEventListener('mouseleave', () => highlightColumn(c, false));
            cell.addEventListener('click', () => handlePlayerMove(c));
            boardEl.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    document.getElementById('newRoundBtn').addEventListener('click', resetRound);
    document.getElementById('resetScoreBtn').addEventListener('click', resetScores);
    
    // Difficulty toggle logic
    const diffBtns = document.querySelectorAll('.diff-btn');
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isAnimating || (currentTurn === COMPUTER && !isGameOver)) return;
            const diff = btn.dataset.value;
            setDifficulty(diff);
        });
    });
}

function setDifficulty(diff) {
    currentDifficulty = diff;
    localStorage.setItem(CONFIG.difficultyStorageKey, diff);
    updateDifficultyUI();
    resetRound();
}

function updateDifficultyUI() {
    const diffBtns = document.querySelectorAll('.diff-btn');
    diffBtns.forEach(btn => {
        const isActive = btn.dataset.value === currentDifficulty;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
}

function highlightColumn(col, active) {
    if (isGameOver || isAnimating || currentTurn !== PLAYER) return;
    const cells = document.querySelectorAll(`.cell[data-col="${col}"]`);
    cells.forEach(cell => {
        if (active) cell.classList.add('column-hover');
        else cell.classList.remove('column-hover');
    });
}

function handlePlayerMove(col) {
    if (isGameOver || isAnimating || currentTurn !== PLAYER) return;

    const row = findAvailableRow(col);
    if (row === -1) return;

    makeMove(row, col, PLAYER);
}

function makeMove(row, col, playerType) {
    isAnimating = true;
    board[row][col] = playerType;
    
    animatePieceDrop(row, col, playerType, () => {
        isAnimating = false;
        const winningLine = checkWinner(board, playerType);
        
        if (winningLine) {
            handleWin(playerType, winningLine);
        } else if (checkDraw(board)) {
            handleDraw();
        } else {
            currentTurn = (playerType === PLAYER) ? COMPUTER : PLAYER;
            updateHUD();
            if (currentTurn === COMPUTER) {
                setTimeout(handleComputerMove, CONFIG.computerTurnDelay);
            }
        }
    });
}

function findAvailableRow(col) {
    for (let r = CONFIG.rows - 1; r >= 0; r--) {
        if (board[r][col] === EMPTY) return r;
    }
    return -1;
}

function animatePieceDrop(row, col, playerType, callback) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.classList.add(playerType === PLAYER ? 'player' : 'computer');
    cell.appendChild(piece);

    // Trigger animation
    requestAnimationFrame(() => {
        piece.classList.add('dropped');
    });

    setTimeout(callback, CONFIG.dropAnimationDuration);
}

function handleWin(winner, line) {
    isGameOver = true;
    if (winner === PLAYER) scores.player++;
    else scores.computer++;
    
    saveGameState();
    updateHUD();
    
    // Highlight winning line
    line.forEach(pos => {
        const cell = document.querySelector(`.cell[data-row="${pos.r}"][data-col="${pos.c}"]`);
        const piece = cell.querySelector('.piece');
        piece.classList.add('win-highlight');
        piece.style.color = winner === PLAYER ? CONFIG.playerColor : CONFIG.computerColor;
    });

    showStatus(winner === PLAYER ? 'You win.' : 'Computer wins.');
}

function handleDraw() {
    isGameOver = true;
    scores.draws++;
    saveGameState();
    updateHUD();
    showStatus('Draw.');
}

function showStatus(text) {
    const overlay = document.getElementById('statusOverlay');
    overlay.innerText = text;
    overlay.classList.add('visible');
}

function resetRound() {
    isGameOver = false;
    currentTurn = PLAYER;
    isAnimating = false;
    document.getElementById('statusOverlay').classList.remove('visible');
    createBoard();
    updateHUD();
}

function resetScores() {
    scores = { player: 0, computer: 0, draws: 0 };
    saveGameState();
    resetRound();
}

function updateHUD() {
    document.getElementById('playerScore').innerText = scores.player;
    document.getElementById('computerScore').innerText = scores.computer;
    document.getElementById('drawScore').innerText = scores.draws;
    document.getElementById('turnDisplay').innerText = currentTurn === PLAYER ? 'You' : 'Computer';
    document.getElementById('turnDisplay').style.color = currentTurn === PLAYER ? CONFIG.playerColor : CONFIG.computerColor;
}

// Computer AI Logic
function handleComputerMove() {
    if (isGameOver) return;
    
    let col;
    if (currentDifficulty === 'easy') {
        col = getEasyMove();
    } else if (currentDifficulty === 'normal') {
        col = getNormalMove();
    } else {
        col = getHardMove();
    }

    const row = findAvailableRow(col);
    if (row !== -1) {
        makeMove(row, col, COMPUTER);
    }
}

function getEasyMove() {
    // Check for immediate win
    for (let c = 0; c < CONFIG.columns; c++) {
        const r = findAvailableRow(c);
        if (r !== -1) {
            const tempBoard = copyBoard(board);
            tempBoard[r][c] = COMPUTER;
            if (checkWinner(tempBoard, COMPUTER)) return c;
        }
    }

    // Otherwise mostly random
    if (Math.random() < CONFIG.easyRandomness) {
        const validMoves = getValidMoves();
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    
    return getNormalMove();
}

function getNormalMove() {
    // 1. Take immediate win
    for (let c = 0; c < CONFIG.columns; c++) {
        const r = findAvailableRow(c);
        if (r !== -1) {
            const tempBoard = copyBoard(board);
            tempBoard[r][c] = COMPUTER;
            if (checkWinner(tempBoard, COMPUTER)) return c;
        }
    }

    // 2. Block player immediate win
    for (let c = 0; c < CONFIG.columns; c++) {
        const r = findAvailableRow(c);
        if (r !== -1) {
            const tempBoard = copyBoard(board);
            tempBoard[r][c] = PLAYER;
            if (checkWinner(tempBoard, PLAYER)) return c;
        }
    }

    // 3. Prefer center
    const validMoves = getValidMoves();
    const center = Math.floor(CONFIG.columns / 2);
    validMoves.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    
    // Add some weight to center columns
    if (Math.random() < 0.6) return validMoves[0];
    
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getHardMove() {
    const result = minimax(board, CONFIG.hardSearchDepth, -Infinity, Infinity, true);
    return result.column;
}

// Minimax with Alpha-Beta Pruning
function minimax(tempBoard, depth, alpha, beta, maximizingPlayer) {
    const validMoves = getValidMoves(tempBoard);
    const isTerminal = validMoves.length === 0 || checkWinner(tempBoard, PLAYER) || checkWinner(tempBoard, COMPUTER);

    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (checkWinner(tempBoard, COMPUTER)) return { value: 1000000000000 };
            if (checkWinner(tempBoard, PLAYER)) return { value: -1000000000000 };
            return { value: 0 };
        }
        return { value: evaluateBoard(tempBoard) };
    }

    if (maximizingPlayer) {
        let value = -Infinity;
        let column = validMoves[Math.floor(Math.random() * validMoves.length)];
        for (const col of validMoves) {
            const row = findAvailableRowInBoard(tempBoard, col);
            const bCopy = copyBoard(tempBoard);
            bCopy[row][col] = COMPUTER;
            const newScore = minimax(bCopy, depth - 1, alpha, beta, false).value;
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }
        return { column, value };
    } else {
        let value = Infinity;
        let column = validMoves[Math.floor(Math.random() * validMoves.length)];
        for (const col of validMoves) {
            const row = findAvailableRowInBoard(tempBoard, col);
            const bCopy = copyBoard(tempBoard);
            bCopy[row][col] = PLAYER;
            const newScore = minimax(bCopy, depth - 1, alpha, beta, true).value;
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) break;
        }
        return { column, value };
    }
}

function evaluateBoard(b) {
    let score = 0;
    const centerCol = Math.floor(CONFIG.columns / 2);
    let centerCount = 0;
    for (let r = 0; r < CONFIG.rows; r++) {
        if (b[r][centerCol] === COMPUTER) centerCount++;
    }
    score += centerCount * 3;

    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            score += evaluateWindow([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]]);
        }
    }
    for (let c = 0; c < CONFIG.columns; c++) {
        for (let r = 0; r < CONFIG.rows - 3; r++) {
            score += evaluateWindow([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]]);
        }
    }
    for (let r = 0; r < CONFIG.rows - 3; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            score += evaluateWindow([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]]);
        }
    }
    for (let r = 3; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            score += evaluateWindow([b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]]);
        }
    }
    return score;
}

function evaluateWindow(window) {
    let score = 0;
    const comp = window.filter(p => p === COMPUTER).length;
    const player = window.filter(p => p === PLAYER).length;
    const empty = window.filter(p => p === EMPTY).length;

    if (comp === 4) score += 100;
    else if (comp === 3 && empty === 1) score += 5;
    else if (comp === 2 && empty === 2) score += 2;

    if (player === 3 && empty === 1) score -= 4;

    return score;
}

function getValidMoves(b = board) {
    const moves = [];
    for (let c = 0; c < CONFIG.columns; c++) {
        if (b[0][c] === EMPTY) moves.push(c);
    }
    return moves;
}

function findAvailableRowInBoard(b, col) {
    for (let r = CONFIG.rows - 1; r >= 0; r--) {
        if (b[r][col] === EMPTY) return r;
    }
    return -1;
}

function copyBoard(b) {
    return b.map(row => [...row]);
}

function checkWinner(b, p) {
    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) {
                return [{r, c}, {r, c: c+1}, {r, c: c+2}, {r, c: c+3}];
            }
        }
    }
    for (let c = 0; c < CONFIG.columns; c++) {
        for (let r = 0; r < CONFIG.rows - 3; r++) {
            if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) {
                return [{r, c}, {r: r+1, c}, {r: r+2, c}, {r: r+3, c}];
            }
        }
    }
    for (let r = 0; r < CONFIG.rows - 3; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            if (b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) {
                return [{r, c}, {r: r+1, c: c+1}, {r: r+2, c: c+2}, {r: r+3, c: c+3}];
            }
        }
    }
    for (let r = 3; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.columns - 3; c++) {
            if (b[r][c] === p && b[r-1][c+1] === p && b[r-2][c+2] === p && b[r-3][c+3] === p) {
                return [{r, c}, {r: r-1, c: c+1}, {r: r-2, c: c+2}, {r: r-3, c: c+3}];
            }
        }
    }
    return null;
}

function checkDraw(b) { return getValidMoves(b).length === 0; }

function saveGameState() {
    localStorage.setItem(CONFIG.scoreStorageKey, JSON.stringify(scores));
    localStorage.setItem(CONFIG.difficultyStorageKey, currentDifficulty);
}

function loadGameState() {
    const savedScores = localStorage.getItem(CONFIG.scoreStorageKey);
    if (savedScores) {
        try { scores = JSON.parse(savedScores); } catch (e) { console.error("Could not load scores", e); }
    }
    const savedDiff = localStorage.getItem(CONFIG.difficultyStorageKey);
    if (savedDiff) currentDifficulty = savedDiff;
}

document.addEventListener('DOMContentLoaded', init);
