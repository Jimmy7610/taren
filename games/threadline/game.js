// ==================================================
// INSTÄLLNINGAR FÖR THREADLINE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 720, // INSTÄLLNING - Ändra grundbredden på Threadline-spelytan.
    canvasHeight: 500, // INSTÄLLNING - Ändra grundhöjden på Threadline-spelytan.
    nodeRadius: 12, // INSTÄLLNING - Ändra den visuella storleken på noderna.
    nodeHitRadius: 26, // INSTÄLLNING - Ändra hur nära man måste klicka för att träffa en nod.
    edgeWidth: 2, // INSTÄLLNING - Ändra tjockleken på kopplingslinjerna mellan noder.
    pathWidth: 6, // INSTÄLLNING - Ändra tjockleken på den aktiva path-linjen.
    nodeGlowStrength: 15, // INSTÄLLNING - Ändra hur starkt noderna lyser (px).
    pathGlowStrength: 20, // INSTÄLLNING - Ändra hur starkt den dragna path-linjen lyser (px).
    invalidPulseDuration: 280, // INSTÄLLNING - Ändra hur länge felmarkeringen syns (ms).
    clearPulseDuration: 900, // INSTÄLLNING - Ändra hur länge level clear-effekten syns (ms).
    boardGlowStrength: 0.45, // INSTÄLLNING - Ändra hur starkt spelbrädet glöder.
    bestLevelKey: 'taren_threadline_best_level', // INSTÄLLNING - Ändra localStorage-nyckeln för högsta upplåsta nivå.
};

const LEVELS = [
    // 1-4: Introduction
    { name: "The Line", nodes: [{id:0,x:0.3,y:0.5},{id:1,x:0.5,y:0.5},{id:2,x:0.7,y:0.5}], edges: [[0,1],[1,2]] },
    { name: "Corner", nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.7,y:0.7}], edges: [[0,1],[1,2]] },
    { name: "Triangle", nodes: [{id:0,x:0.5,y:0.3},{id:1,x:0.3,y:0.7},{id:2,x:0.7,y:0.7}], edges: [[0,1],[1,2],[2,0]] },
    { name: "Square Path", nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.7,y:0.7},{id:3,x:0.3,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,0]] },
    // 5-10: Small Grids & Branches
    { name: "Cross", nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.5,y:0.2},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.8,y:0.5}], edges: [[0,1],[0,2],[0,3],[0,4]] },
    { name: "Zig Zag", nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.8,y:0.5},{id:4,x:0.8,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4]] },
    { name: "Ladder", nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.3,y:0.7},{id:3,x:0.7,y:0.7},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,3],[3,2],[2,0],[0,4],[1,4],[2,4],[3,4]] },
    { name: "Loop", nodes: [{id:0,x:0.2,y:0.4},{id:1,x:0.4,y:0.2},{id:2,x:0.6,y:0.2},{id:3,x:0.8,y:0.4},{id:4,x:0.8,y:0.6},{id:5,x:0.6,y:0.8},{id:6,x:0.4,y:0.8},{id:7,x:0.2,y:0.6}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]] },
    { name: "Diamond", nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.8,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]] },
    { name: "Split", nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.4,y:0.5},{id:2,x:0.6,y:0.3},{id:3,x:0.6,y:0.7},{id:4,x:0.8,y:0.5}], edges: [[0,1],[1,2],[1,3],[2,4],[3,4]] },
    // 11-16: Complexity Increases
    { name: "Hourglass", nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.3,y:0.8},{id:4,x:0.7,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,2],[2,0]] },
    { name: "Grid 3x2", nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.7,y:0.3},{id:3,x:0.3,y:0.7},{id:4,x:0.5,y:0.7},{id:5,x:0.7,y:0.7}], edges: [[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]] },
    { name: "Star", nodes: [{id:0,x:0.5,y:0.1},{id:1,x:0.8,y:0.3},{id:2,x:0.7,y:0.8},{id:3,x:0.3,y:0.8},{id:4,x:0.2,y:0.3},{id:5,x:0.5,y:0.5}], edges: [[0,5],[1,5],[2,5],[3,5],[4,5],[0,1],[1,2],[2,3],[3,4],[4,0]] },
    { name: "Bridge", nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.2,y:0.7},{id:2,x:0.4,y:0.5},{id:3,x:0.6,y:0.5},{id:4,x:0.8,y:0.3},{id:5,x:0.8,y:0.7}], edges: [[0,1],[0,2],[1,2],[2,3],[3,4],[3,5],[4,5]] },
    { name: "Serpent", nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.4,y:0.2},{id:2,x:0.6,y:0.2},{id:3,x:0.8,y:0.2},{id:4,x:0.8,y:0.8},{id:5,x:0.6,y:0.8},{id:6,x:0.4,y:0.8},{id:7,x:0.2,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,6],[2,5]] },
    { name: "The Hive", nodes: [{id:0,x:0.5,y:0.3},{id:1,x:0.3,y:0.4},{id:2,x:0.3,y:0.6},{id:3,x:0.5,y:0.7},{id:4,x:0.7,y:0.6},{id:5,x:0.7,y:0.4},{id:6,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6]] },
    // 17-24: Difficult
    { name: "Tunnels", nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.5,y:0.2},{id:3,x:0.5,y:0.8},{id:4,x:0.2,y:0.8},{id:5,x:0.8,y:0.8},{id:6,x:0.5,y:0.5}], edges: [[0,2],[2,1],[1,5],[5,3],[3,4],[4,0],[2,6],[3,6],[6,0],[6,1],[6,4],[6,5]] },
    { name: "Web", nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.2,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.8,y:0.5},{id:4,x:0.35,y:0.35},{id:5,x:0.65,y:0.35},{id:6,x:0.65,y:0.65},{id:7,x:0.35,y:0.65}], edges: [[0,4],[4,1],[1,7],[7,2],[2,6],[6,3],[3,5],[5,0],[4,5],[5,6],[6,7],[7,4]] },
    { name: "Grid 3x3", nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.7,y:0.3},{id:3,x:0.3,y:0.5},{id:4,x:0.5,y:0.5},{id:5,x:0.7,y:0.5},{id:6,x:0.3,y:0.7},{id:7,x:0.5,y:0.7},{id:8,x:0.7,y:0.7}], edges: [[0,1],[1,2],[3,4],[4,5],[6,7],[7,8],[0,3],[3,6],[1,4],[4,7],[2,5],[5,8]] },
    { name: "Complex Serpent", nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.2},{id:3,x:0.8,y:0.5},{id:4,x:0.8,y:0.8},{id:5,x:0.5,y:0.8},{id:6,x:0.2,y:0.8},{id:7,x:0.2,y:0.5},{id:8,x:0.4,y:0.4},{id:9,x:0.6,y:0.4},{id:10,x:0.6,y:0.6},{id:11,x:0.4,y:0.6}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,8],[1,9],[5,10],[5,11],[8,9],[9,10],[10,11],[11,8]] },
    { name: "Butterfly", nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.3,y:0.5},{id:2,x:0.2,y:0.7},{id:3,x:0.5,y:0.5},{id:4,x:0.8,y:0.3},{id:5,x:0.7,y:0.5},{id:6,x:0.8,y:0.7},{id:7,x:0.5,y:0.2},{id:8,x:0.5,y:0.8}], edges: [[0,1],[1,2],[0,7],[7,4],[4,5],[5,6],[2,8],[8,6],[1,3],[3,5],[7,3],[3,8]] },
    { name: "The Eye", nodes: [{id:0,x:0.1,y:0.5},{id:1,x:0.3,y:0.3},{id:2,x:0.5,y:0.2},{id:3,x:0.7,y:0.3},{id:4,x:0.9,y:0.5},{id:5,x:0.7,y:0.7},{id:6,x:0.5,y:0.8},{id:7,x:0.3,y:0.7},{id:8,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[0,8],[2,8],[4,8],[6,8],[1,8],[3,8],[5,8],[7,8]] },
    { name: "Mandala", nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.3,y:0.2},{id:2,x:0.7,y:0.2},{id:3,x:0.9,y:0.5},{id:4,x:0.7,y:0.8},{id:5,x:0.3,y:0.8},{id:6,x:0.1,y:0.5},{id:7,x:0.5,y:0.1},{id:8,x:0.5,y:0.9}], edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[7,1],[7,2],[8,4],[8,5],[6,1],[6,5],[3,2],[3,4],[7,0],[8,0]] },
    { name: "Final Thread", nodes: [{id:0,x:0.1,y:0.1},{id:1,x:0.5,y:0.1},{id:2,x:0.9,y:0.1},{id:3,x:0.9,y:0.5},{id:4,x:0.9,y:0.9},{id:5,x:0.5,y:0.9},{id:6,x:0.1,y:0.9},{id:7,x:0.1,y:0.5},{id:8,x:0.3,y:0.3},{id:9,x:0.7,y:0.3},{id:10,x:0.7,y:0.7},{id:11,x:0.3,y:0.7},{id:12,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,12],[3,12],[5,12],[7,12],[0,8],[2,9],[4,10],[6,11],[8,9],[9,10],[10,11],[11,8],[8,12],[9,12],[10,12],[11,12]] }
];

let canvas, ctx;
let currentLevelIndex = 0;
let path = [];
let levelCleared = false;
let bestUnlockedLevel = 1;
let invalidPulse = 0;
let clearPulse = 0;
let mousePos = { x: 0, y: 0 };

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    loadProgress();
    setupEventListeners();
    loadLevel(currentLevelIndex);
    requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Backspace' || e.key.toLowerCase() === 'u') undoMove();
        if (e.key.toLowerCase() === 'r') restartLevel();
        if (e.key === 'Enter' && levelCleared) nextLevel();
    });

    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('restart-btn').addEventListener('click', restartLevel);
    document.getElementById('next-btn').addEventListener('click', nextLevel);
}

function loadLevel(index) {
    currentLevelIndex = index;
    path = [];
    levelCleared = false;
    clearPulse = 0;
    invalidPulse = 0;
    updateHUD();
    document.getElementById('next-btn').style.display = 'none';
    setStatus("Choose a starting node");
}

function handleMouseDown(e) {
    if (levelCleared) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const level = LEVELS[currentLevelIndex];
    let clickedNodeId = -1;

    for (let node of level.nodes) {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        if (dist <= CONFIG.nodeHitRadius) {
            clickedNodeId = node.id;
            break;
        }
    }

    if (clickedNodeId !== -1) {
        if (path.length === 0) {
            startPath(clickedNodeId);
        } else {
            tryAddNode(clickedNodeId);
        }
    }
}

function startPath(nodeId) {
    path = [nodeId];
    setStatus("Continue the thread");
    updateHUD();
}

function tryAddNode(nodeId) {
    if (path.includes(nodeId)) {
        triggerInvalid();
        setStatus("Node already visited");
        return;
    }

    const lastNodeId = path[path.length - 1];
    if (isConnected(lastNodeId, nodeId)) {
        path.push(nodeId);
        updateHUD();
        checkLevelComplete();
        if (!levelCleared) setStatus("Continue the thread");
    } else {
        triggerInvalid();
        setStatus("Not connected");
    }
}

function isConnected(idA, idB) {
    const edges = LEVELS[currentLevelIndex].edges;
    return edges.some(e => (e[0] === idA && e[1] === idB) || (e[1] === idA && e[0] === idB));
}

function undoMove() {
    if (levelCleared) return;
    if (path.length > 0) {
        path.pop();
        if (path.length === 0) setStatus("Choose a starting node");
        else setStatus("Last move undone");
        updateHUD();
    }
}

function restartLevel() {
    if (levelCleared) return;
    path = [];
    setStatus("Path reset");
    updateHUD();
}

function nextLevel() {
    if (!levelCleared) return;
    if (currentLevelIndex < LEVELS.length - 1) {
        loadLevel(currentLevelIndex + 1);
    }
}

function checkLevelComplete() {
    const totalNodes = LEVELS[currentLevelIndex].nodes.length;
    if (path.length === totalNodes) {
        levelCleared = true;
        clearPulse = CONFIG.clearPulseDuration;
        setStatus("Level cleared", true);
        document.getElementById('next-btn').style.display = 'block';
        saveProgress();
    }
}

function triggerInvalid() {
    invalidPulse = CONFIG.invalidPulseDuration;
}

function setStatus(msg, isClear = false) {
    const el = document.getElementById('status-display');
    el.innerText = msg;
    if (isClear) el.classList.add('cleared');
    else el.classList.remove('cleared');
}

function updateHUD() {
    const level = LEVELS[currentLevelIndex];
    document.getElementById('level-display').innerText = currentLevelIndex + 1;
    document.getElementById('visited-display').innerText = `${path.length} / ${level.nodes.length}`;
    document.getElementById('best-display').innerText = bestUnlockedLevel;
}

function saveProgress() {
    if (currentLevelIndex + 2 > bestUnlockedLevel) {
        bestUnlockedLevel = currentLevelIndex + 2;
        localStorage.setItem(CONFIG.bestLevelKey, bestUnlockedLevel);
    }
}

function loadProgress() {
    const saved = localStorage.getItem(CONFIG.bestLevelKey);
    if (saved) {
        bestUnlockedLevel = parseInt(saved);
        currentLevelIndex = Math.min(bestUnlockedLevel - 1, LEVELS.length - 1);
    }
}

function gameLoop(time) {
    update(1/60);
    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (invalidPulse > 0) invalidPulse -= dt * 1000;
    if (clearPulse > 0) clearPulse -= dt * 1000;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = LEVELS[currentLevelIndex];

    // Draw Board Glow
    ctx.shadowBlur = 40 * CONFIG.boardGlowStrength;
    ctx.shadowColor = "rgba(76, 201, 240, 0.1)";

    // Draw Edges
    ctx.lineWidth = CONFIG.edgeWidth;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    level.edges.forEach(edge => {
        const n1 = level.nodes.find(n => n.id === edge[0]);
        const n2 = level.nodes.find(n => n.id === edge[1]);
        ctx.beginPath();
        ctx.moveTo(n1.x * canvas.width, n1.y * canvas.height);
        ctx.lineTo(n2.x * canvas.width, n2.y * canvas.height);
        ctx.stroke();
    });

    // Draw Path
    if (path.length > 1) {
        ctx.lineWidth = CONFIG.pathWidth;
        ctx.strokeStyle = "#8b6cff";
        ctx.shadowBlur = CONFIG.pathGlowStrength;
        ctx.shadowColor = "#8b6cff";
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const node = level.nodes.find(n => n.id === path[i]);
            if (i === 0) ctx.moveTo(node.x * canvas.width, node.y * canvas.height);
            else ctx.lineTo(node.x * canvas.width, node.y * canvas.height);
        }
        ctx.stroke();
    }

    // Draw Nodes
    level.nodes.forEach(node => {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        const isVisited = path.includes(node.id);
        const isLast = path.length > 0 && path[path.length - 1] === node.id;
        const isHovered = !levelCleared && Math.sqrt((mousePos.x - nx)**2 + (mousePos.y - ny)**2) <= CONFIG.nodeRadius * 1.5;

        // Base Node
        ctx.beginPath();
        ctx.arc(nx, ny, CONFIG.nodeRadius, 0, Math.PI * 2);
        
        if (isVisited) {
            ctx.fillStyle = "#8b6cff";
            ctx.shadowBlur = CONFIG.nodeGlowStrength;
            ctx.shadowColor = "#8b6cff";
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.shadowBlur = isHovered ? 15 : 0;
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
        }
        ctx.fill();

        // Node Inner Circle
        if (isLast) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = "#4cc9f0";
            ctx.fill();
        }

        // Invalid Pulse
        if (invalidPulse > 0 && isHovered) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 1.8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(247, 37, 133, ${invalidPulse / CONFIG.invalidPulseDuration})`;
            ctx.stroke();
        }
    });

    // Clear Pulse
    if (levelCleared && clearPulse > 0) {
        ctx.fillStyle = `rgba(76, 201, 240, ${0.1 * (clearPulse / CONFIG.clearPulseDuration)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

document.addEventListener('DOMContentLoaded', init);
