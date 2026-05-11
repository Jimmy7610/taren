// ==================================================
// INSTÄLLNINGAR FÖR LINEBOUND
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    gridSize: 10, // INSTÄLLNING - Nuvarande storlek på spelplanen. (10 eller 20)
    smallGridSize: 10, // INSTÄLLNING - Ändra första valbara spelplansstorleken.
    largeGridSize: 20, // INSTÄLLNING - Ändra andra valbara spelplansstorleken.
    minDotRadius: 2.5, // INSTÄLLNING - Ändra minsta prickstorlek när spelplanen är stor.
    maxDotRadius: 4, // INSTÄLLNING - Ändra största prickstorlek när spelplanen är mindre.
    minLineThickness: 2, // INSTÄLLNING - Ändra minsta linjetjocklek för stora spelplaner.
    maxLineThickness: 4, // INSTÄLLNING - Ändra största linjetjocklek för mindre spelplaner.
    edgeHitPadding: 18, // INSTÄLLNING - Ändra hur nära musen behöver vara en linje för att den ska kunna väljas. Högre värde = lättare att klicka.
    edgeClickableInset: 0.05, // INSTÄLLNING - Ändra hur mycket av linjens ytterkanter som inte ska räknas (0.05 = ca 90% är klickbar).
    aiThinkingDelay: 450, // INSTÄLLNING - Ändra hur länge AI väntar innan den gör sitt drag (i ms). Högre värde = mer mänsklig känsla.
    aiSafeMoveBias: 0.85, // INSTÄLLNING - Ändra hur ofta AI försöker välja ett säkert drag. Lägre värde = enklare AI.
    boxFillOpacity: 0.22, // INSTÄLLNING - Ändra hur tydligt fångade rutor fylls med färg.
    colors: {
        player: '#8b6cff', // INSTÄLLNING - Spelarens färg
        ai: '#4cc9f0',     // INSTÄLLNING - AI:s färg
        neutral: '#3f3f46',// INSTÄLLNING - Neutral/tom färg
        dot: '#fafafa'     // INSTÄLLNING - Prickarnas färg
    },
    audio: {
        masterVolume: 0.25, // INSTÄLLNING - Ändra total ljudvolym för Linebound.
        lineSoundVolume: 0.18, // INSTÄLLNING - Ändra ljudvolym när en linje dras.
        boxSoundVolume: 0.24, // INSTÄLLNING - Ändra ljudvolym när en ruta fångas.
    }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('game-container');

// UI Elements
const hud = document.getElementById('hud');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const turnDisplay = document.getElementById('turnDisplay');
const resultTitle = document.getElementById('resultTitle');
const finalScorePlayer = document.getElementById('finalScorePlayer');
const finalScoreAI = document.getElementById('finalScoreAI');

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let turn = 'PLAYER'; // PLAYER or AI
let playerScore = 0;
let aiScore = 0;

// Grid Data
let hLines = [];
let vLines = [];
let boxes = [];

// Input & Geometry
let mouseX = 0;
let mouseY = 0;
let hoveredLine = null; // { type: 'h'|'v', x, y }

let boardSize = 0;
let offsetX = 0;
let offsetY = 0;
let spacing = 0;

function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Calculate board size leaving some padding
    const padding = 60;
    boardSize = Math.min(canvas.width, canvas.height) - padding * 2;
    spacing = boardSize / SETTINGS.gridSize;
    
    offsetX = (canvas.width - boardSize) / 2;
    offsetY = (canvas.height - boardSize) / 2;
    
    draw();
}
window.addEventListener('resize', resize);
resize();

container.addEventListener('mousemove', (e) => {
    if (gameState !== 'PLAYING' || turn !== 'PLAYER') return;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    updateHover();
});

container.addEventListener('click', () => {
    if (gameState !== 'PLAYING' || turn !== 'PLAYER') return;
    if (hoveredLine) {
        placeLine(hoveredLine.type, hoveredLine.x, hoveredLine.y, 'PLAYER');
        hoveredLine = null;
    }
});

// Audio System
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = false;
let masterGain;

function initAudio() {
    if (!audioEnabled && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (!audioEnabled) {
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = SETTINGS.audio.masterVolume;
    }
    audioEnabled = true;
}

function playSound(type) {
    if (!audioEnabled) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    const now = audioCtx.currentTime;
    
    if (type === 'line') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(SETTINGS.audio.lineSoundVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'box_player') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gainNode.gain.setValueAtTime(SETTINGS.audio.boxSoundVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'box_ai') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gainNode.gain.setValueAtTime(SETTINGS.audio.boxSoundVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

function resetGame() {
    const s = SETTINGS.gridSize;
    playerScore = 0;
    aiScore = 0;
    turn = 'PLAYER';
    
    hLines = Array(s + 1).fill(0).map(() => Array(s).fill(0));
    vLines = Array(s + 1).fill(0).map(() => Array(s).fill(0));
    boxes = Array(s).fill(0).map(() => Array(s).fill(0));
    
    updateScoreUI();
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    draw();
}

function updateScoreUI() {
    scoreDisplay.innerText = `You: ${playerScore} | Computer: ${aiScore}`;
    
    scoreDisplay.classList.remove('score-pulse');
    void scoreDisplay.offsetWidth;
    scoreDisplay.classList.add('score-pulse');
    setTimeout(() => scoreDisplay.classList.remove('score-pulse'), 150);
    
    if (turn === 'PLAYER') {
        turnDisplay.innerText = "Your Turn";
        turnDisplay.className = "turn-player";
    } else {
        turnDisplay.innerText = "Computer Turn";
        turnDisplay.className = "turn-ai";
    }
}

// Point to line segment distance
function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return {
        dist: Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1))),
        t: t
    };
}

function updateHover() {
    hoveredLine = null;
    let minDist = SETTINGS.edgeHitPadding;
    
    const s = SETTINGS.gridSize;
    
    // Check horizontal lines
    for (let y = 0; y <= s; y++) {
        for (let x = 0; x < s; x++) {
            if (hLines[y][x] !== 0) continue;
            
            const px1 = offsetX + x * spacing;
            const py1 = offsetY + y * spacing;
            const px2 = px1 + spacing;
            const py2 = py1;
            
            const res = distToSegment(mouseX, mouseY, px1, py1, px2, py2);
            if (res.dist < minDist && res.t > SETTINGS.edgeClickableInset && res.t < (1 - SETTINGS.edgeClickableInset)) {
                minDist = res.dist;
                hoveredLine = { type: 'h', x, y };
            }
        }
    }
    
    // Check vertical lines
    for (let x = 0; x <= s; x++) {
        for (let y = 0; y < s; y++) {
            if (vLines[x][y] !== 0) continue;
            
            const px1 = offsetX + x * spacing;
            const py1 = offsetY + y * spacing;
            const px2 = px1;
            const py2 = py1 + spacing;
            
            const res = distToSegment(mouseX, mouseY, px1, py1, px2, py2);
            if (res.dist < minDist && res.t > SETTINGS.edgeClickableInset && res.t < (1 - SETTINGS.edgeClickableInset)) {
                minDist = res.dist;
                hoveredLine = { type: 'v', x, y };
            }
        }
    }
    
    draw();
}

function checkBoxes() {
    const s = SETTINGS.gridSize;
    let boxesCompleted = 0;
    
    for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
            if (boxes[y][x] === 0) {
                if (hLines[y][x] !== 0 && hLines[y+1][x] !== 0 && vLines[x][y] !== 0 && vLines[x+1][y] !== 0) {
                    boxes[y][x] = (turn === 'PLAYER') ? 1 : 2;
                    boxesCompleted++;
                    if (turn === 'PLAYER') playerScore++;
                    else aiScore++;
                }
            }
        }
    }
    return boxesCompleted;
}

function checkGameOver() {
    const s = SETTINGS.gridSize;
    if (playerScore + aiScore === s * s) {
        gameState = 'GAMEOVER';
        
        finalScorePlayer.innerText = playerScore;
        finalScoreAI.innerText = aiScore;
        
        if (playerScore > aiScore) {
            resultTitle.innerText = "You Win";
            resultTitle.style.color = SETTINGS.colors.player;
        } else if (aiScore > playerScore) {
            resultTitle.innerText = "Linebound Wins";
            resultTitle.style.color = SETTINGS.colors.ai;
        } else {
            resultTitle.innerText = "Draw";
            resultTitle.style.color = SETTINGS.colors.dot;
        }
        
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 500);
        return true;
    }
    return false;
}

function placeLine(type, x, y, actor) {
    if (type === 'h') hLines[y][x] = (actor === 'PLAYER') ? 1 : 2;
    if (type === 'v') vLines[x][y] = (actor === 'PLAYER') ? 1 : 2;
    
    playSound('line');
    
    const boxesMade = checkBoxes();
    
    if (boxesMade > 0) {
        playSound(actor === 'PLAYER' ? 'box_player' : 'box_ai');
        updateScoreUI();
        draw();
        if (checkGameOver()) return;
        
        if (actor === 'AI') {
            setTimeout(aiMove, SETTINGS.aiThinkingDelay);
        }
    } else {
        turn = (actor === 'PLAYER') ? 'AI' : 'PLAYER';
        updateScoreUI();
        draw();
        
        if (turn === 'AI') {
            setTimeout(aiMove, SETTINGS.aiThinkingDelay);
        }
    }
}

// AI Logic
function countBoxSides(x, y) {
    let count = 0;
    if (hLines[y][x] !== 0) count++;
    if (hLines[y+1][x] !== 0) count++;
    if (vLines[x][y] !== 0) count++;
    if (vLines[x+1][y] !== 0) count++;
    return count;
}

function causesThirdSide(type, lx, ly) {
    // Check if placing this line makes any adjacent box have exactly 3 sides.
    const s = SETTINGS.gridSize;
    
    if (type === 'h') {
        // Above box
        if (ly > 0) {
            const count = countBoxSides(lx, ly - 1);
            if (count === 2) return true;
        }
        // Below box
        if (ly < s) {
            const count = countBoxSides(lx, ly);
            if (count === 2) return true;
        }
    } else if (type === 'v') {
        // Left box
        if (lx > 0) {
            const count = countBoxSides(lx - 1, ly);
            if (count === 2) return true;
        }
        // Right box
        if (lx < s) {
            const count = countBoxSides(lx, ly);
            if (count === 2) return true;
        }
    }
    return false;
}

function aiMove() {
    if (gameState !== 'PLAYING') return;
    
    const s = SETTINGS.gridSize;
    let availableMoves = [];
    let completingMoves = [];
    let safeMoves = [];
    
    for (let y = 0; y <= s; y++) {
        for (let x = 0; x < s; x++) {
            if (hLines[y][x] === 0) {
                let move = { type: 'h', x, y };
                availableMoves.push(move);
                
                let completes = false;
                if (y > 0 && countBoxSides(x, y - 1) === 3) completes = true;
                if (y < s && countBoxSides(x, y) === 3) completes = true;
                
                if (completes) completingMoves.push(move);
                else if (!causesThirdSide('h', x, y)) safeMoves.push(move);
            }
        }
    }
    
    for (let x = 0; x <= s; x++) {
        for (let y = 0; y < s; y++) {
            if (vLines[x][y] === 0) {
                let move = { type: 'v', x, y };
                availableMoves.push(move);
                
                let completes = false;
                if (x > 0 && countBoxSides(x - 1, y) === 3) completes = true;
                if (x < s && countBoxSides(x, y) === 3) completes = true;
                
                if (completes) completingMoves.push(move);
                else if (!causesThirdSide('v', x, y)) safeMoves.push(move);
            }
        }
    }
    
    if (availableMoves.length === 0) return;
    
    let chosenMove = null;
    
    if (completingMoves.length > 0) {
        chosenMove = completingMoves[Math.floor(Math.random() * completingMoves.length)];
    } else if (safeMoves.length > 0 && Math.random() < SETTINGS.aiSafeMoveBias) {
        chosenMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    } else {
        chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    placeLine(chosenMove.type, chosenMove.x, chosenMove.y, 'AI');
}

// Rendering
function draw() {
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'MENU') return;
    
    const s = SETTINGS.gridSize;
    
    // Dynamic scaling
    const tRatio = (s - SETTINGS.smallGridSize) / Math.max(1, SETTINGS.largeGridSize - SETTINGS.smallGridSize);
    const dotRad = SETTINGS.maxDotRadius - tRatio * (SETTINGS.maxDotRadius - SETTINGS.minDotRadius);
    const lineThick = SETTINGS.maxLineThickness - tRatio * (SETTINGS.maxLineThickness - SETTINGS.minLineThickness);
    
    // Draw filled boxes
    for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
            if (boxes[y][x] !== 0) {
                const px = offsetX + x * spacing;
                const py = offsetY + y * spacing;
                
                ctx.fillStyle = (boxes[y][x] === 1) ? SETTINGS.colors.player : SETTINGS.colors.ai;
                ctx.globalAlpha = SETTINGS.boxFillOpacity;
                ctx.fillRect(px, py, spacing, spacing);
                ctx.globalAlpha = 1.0;
            }
        }
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= s; y++) {
        for (let x = 0; x < s; x++) {
            const px = offsetX + x * spacing;
            const py = offsetY + y * spacing;
            
            if (hLines[y][x] !== 0) {
                ctx.strokeStyle = (hLines[y][x] === 1) ? SETTINGS.colors.player : SETTINGS.colors.ai;
                ctx.lineWidth = lineThick;
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.strokeStyle;
                
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + spacing, py);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (hoveredLine && hoveredLine.type === 'h' && hoveredLine.x === x && hoveredLine.y === y) {
                ctx.strokeStyle = SETTINGS.colors.player;
                ctx.lineWidth = lineThick;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + spacing, py);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.strokeStyle = SETTINGS.colors.neutral;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + spacing, py);
                ctx.stroke();
            }
        }
    }
    
    // Draw vertical lines
    for (let x = 0; x <= s; x++) {
        for (let y = 0; y < s; y++) {
            const px = offsetX + x * spacing;
            const py = offsetY + y * spacing;
            
            if (vLines[x][y] !== 0) {
                ctx.strokeStyle = (vLines[x][y] === 1) ? SETTINGS.colors.player : SETTINGS.colors.ai;
                ctx.lineWidth = lineThick;
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.strokeStyle;
                
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + spacing);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (hoveredLine && hoveredLine.type === 'v' && hoveredLine.x === x && hoveredLine.y === y) {
                ctx.strokeStyle = SETTINGS.colors.player;
                ctx.lineWidth = lineThick;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + spacing);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            } else {
                ctx.strokeStyle = SETTINGS.colors.neutral;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + spacing);
                ctx.stroke();
            }
        }
    }
    
    // Draw dots
    ctx.fillStyle = SETTINGS.colors.dot;
    for (let y = 0; y <= s; y++) {
        for (let x = 0; x <= s; x++) {
            const px = offsetX + x * spacing;
            const py = offsetY + y * spacing;
            
            ctx.beginPath();
            ctx.arc(px, py, dotRad, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    initAudio();
    resetGame();
});

document.getElementById('retryBtn').addEventListener('click', () => {
    initAudio();
    resetGame();
});

// Board Size Selection
const sizeBtns = document.querySelectorAll('.btn-size');
sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SETTINGS.gridSize = parseInt(btn.getAttribute('data-size'));
        initAudio();
        resize(); // Recalculate layout immediately
        resetGame();
    });
});
