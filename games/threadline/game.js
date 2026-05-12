// ==================================================
// INSTÄLLNINGAR FÖR THREADLINE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 800, // INSTÄLLNING - Ändra grundbredden på Threadline-spelytan.
    canvasHeight: 560, // INSTÄLLNING - Ändra grundhöjden på Threadline-spelytan.
    boardPadding: 60, // INSTÄLLNING - Ändra marginalen runt pusslet inuti spelrutan.
    nodeRadius: 14, // INSTÄLLNING - Ändra den visuella storleken på noderna.
    nodeHitRadius: 34, // INSTÄLLNING - Ändra hur nära man måste klicka för att träffa en nod. Högre värde gör spelet mer förlåtande.
    edgeWidth: 2, // INSTÄLLNING - Ändra tjockleken på kopplingslinjerna mellan noder.
    edgeOpacity: 0.15, // INSTÄLLNING - Ändra hur tydliga de obrukade linjerna är.
    pathWidth: 7, // INSTÄLLNING - Ändra tjockleken på den aktiva path-linjen.
    nodeGlowStrength: 15, // INSTÄLLNING - Ändra hur starkt noderna lyser (px).
    pathGlowStrength: 20, // INSTÄLLNING - Ändra hur starkt den dragna path-linjen lyser (px).
    invalidPulseDuration: 300, // INSTÄLLNING - Ändra hur länge felmarkeringen syns (ms).
    clearPulseDuration: 900, // INSTÄLLNING - Ändra hur länge level clear-effekten syns (ms).
    hintPulseDuration: 1200, // INSTÄLLNING - Ändra hur länge Hint-markeringen syns (ms).
    hintCooldown: 500, // INSTÄLLNING - Ändra hur snabbt Hint kan användas igen (ms).
    boardGlowStrength: 0.5, // INSTÄLLNING - Ändra hur starkt spelbrädet glöder.
    boardGridOpacity: 0.05, // INSTÄLLNING - Ändra hur synligt rutnätet i bakgrunden är.
    bestLevelKey: 'taren_threadline_best_level', // INSTÄLLNING - Ändra localStorage-nyckeln för högsta upplåsta nivå.
};

// Handcrafted 24 Solvable Levels with Fixed Starts
const LEVELS = [
    // 1-4: INTRODUCTION
    { id: 1, title: 'First Thread', diff: 'Easy', requiredStart: 0, nodes: [{id:0,x:0.25,y:0.5},{id:1,x:0.5,y:0.5},{id:2,x:0.75,y:0.5}], edges: [[0,1],[1,2]], solution: [0,1,2] },
    { id: 2, title: 'Corner', diff: 'Easy', requiredStart: 0, nodes: [{id:0,x:0.3,y:0.35},{id:1,x:0.7,y:0.35},{id:2,x:0.7,y:0.65}], edges: [[0,1],[1,2]], solution: [0,1,2] },
    { id: 3, title: 'The Arc', diff: 'Easy', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.6},{id:1,x:0.5,y:0.3},{id:2,x:0.8,y:0.6}], edges: [[0,1],[1,2]], solution: [0,1,2] },
    { id: 4, title: 'Square Path', diff: 'Easy', requiredStart: 0, nodes: [{id:0,x:0.35,y:0.35},{id:1,x:0.65,y:0.35},{id:2,x:0.65,y:0.65},{id:3,x:0.35,y:0.65}], edges: [[0,1],[1,2],[2,3],[3,0]], solution: [0,1,2,3] },
    // 5-8: BRANCHING
    { id: 5, title: 'The Loop', diff: 'Normal', requiredStart: 0, nodes: [{id:0,x:0.5,y:0.25},{id:1,x:0.75,y:0.5},{id:2,x:0.5,y:0.75},{id:3,x:0.25,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0]], solution: [0,1,2,3] },
    { id: 6, title: 'Diamond Fold', diff: 'Normal', requiredStart: 1, nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.8,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0],[0,4]], solution: [1,2,3,0,4] },
    { id: 7, title: 'Snake I', diff: 'Normal', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.4,y:0.3},{id:2,x:0.6,y:0.3},{id:3,x:0.8,y:0.3},{id:4,x:0.8,y:0.7},{id:5,x:0.6,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5]], solution: [0,1,2,3,4,5] },
    { id: 8, title: 'Zig Zag', diff: 'Normal', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.8,y:0.5},{id:4,x:0.8,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4]], solution: [0,1,2,3,4] },
    // 9-16: MEDIUM
    { id: 9, title: 'The Ladder', diff: 'Normal', requiredStart: 0, nodes: [{id:0,x:0.3,y:0.25},{id:1,x:0.7,y:0.25},{id:2,x:0.3,y:0.75},{id:3,x:0.7,y:0.75}], edges: [[0,1],[1,3],[3,2],[2,0]], solution: [0,1,3,2] },
    { id: 10, title: 'Asymmetry', diff: 'Normal', requiredStart: 1, nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.4,y:0.3},{id:2,x:0.6,y:0.3},{id:3,x:0.8,y:0.5},{id:4,x:0.5,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,4],[4,0]], solution: [1,2,3,4,0] },
    { id: 11, title: 'Double Star', diff: 'Hard', requiredStart: 0, nodes: [{id:0,x:0.5,y:0.15},{id:1,x:0.85,y:0.4},{id:2,x:0.7,y:0.85},{id:3,x:0.3,y:0.85},{id:4,x:0.15,y:0.4},{id:5,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,5],[1,5],[2,5],[3,5],[4,5]], solution: [0,4,3,2,1,5] },
    { id: 12, title: 'Grid Path', diff: 'Hard', requiredStart: 0, nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.7,y:0.3},{id:3,x:0.7,y:0.7},{id:4,x:0.5,y:0.7},{id:5,x:0.3,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]], solution: [0,1,2,3,4,5] },
    { id: 13, title: 'The Core', diff: 'Hard', requiredStart: 1, nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.8,y:0.8},{id:3,x:0.2,y:0.8},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0],[4,0],[4,1],[4,2],[4,3]], solution: [1,2,3,0,4] },
    { id: 14, title: 'Hourglass', diff: 'Hard', requiredStart: 0, nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.3,y:0.8},{id:4,x:0.7,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,2],[2,0]], solution: [0,1,2,3,4] },
    { id: 15, title: 'Butterfly', diff: 'Hard', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.25},{id:1,x:0.2,y:0.75},{id:2,x:0.5,y:0.5},{id:3,x:0.8,y:0.25},{id:4,x:0.8,y:0.75}], edges: [[0,1],[0,2],[1,2],[2,3],[2,4],[3,4]], solution: [0,1,2,3,4] },
    { id: 16, title: 'The Weaver', diff: 'Hard', requiredStart: 1, nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.4,y:0.2},{id:2,x:0.6,y:0.2},{id:3,x:0.8,y:0.5},{id:4,x:0.6,y:0.8},{id:5,x:0.4,y:0.8},{id:6,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[3,6]], solution: [1,2,3,4,5,0,6] },
    // 17-24: EXPERT
    { id: 17, title: 'Spider', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.8,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.4,y:0.4},{id:5,x:0.6,y:0.4},{id:6,x:0.6,y:0.6},{id:7,x:0.4,y:0.6}], edges: [[0,4],[4,5],[5,1],[1,6],[6,2],[2,7],[7,3],[3,4],[4,5],[5,6],[6,7],[7,4]], solution: [0,4,5,1,6,2,7,3] },
    { id: 18, title: 'Maze Grid', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.2},{id:3,x:0.8,y:0.5},{id:4,x:0.5,y:0.5},{id:5,x:0.2,y:0.5},{id:6,x:0.2,y:0.8},{id:7,x:0.5,y:0.8},{id:8,x:0.8,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[6,7],[7,8],[8,3]], solution: [0,1,2,3,8,7,6,5,4] },
    { id: 19, title: 'The Hook', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.2},{id:3,x:0.8,y:0.8},{id:4,x:0.5,y:0.8},{id:5,x:0.5,y:0.5},{id:6,x:0.2,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]], solution: [0,1,2,3,4,5,6] },
    { id: 20, title: 'Symmetry', diff: 'Expert', requiredStart: 5, nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.5,y:0.5},{id:3,x:0.3,y:0.7},{id:4,x:0.7,y:0.7},{id:5,x:0.1,y:0.5},{id:6,x:0.9,y:0.5}], edges: [[0,1],[1,6],[6,4],[4,3],[3,5],[5,0],[0,2],[1,2],[3,2],[4,2]], solution: [5,0,1,6,4,3,2] },
    { id: 21, title: 'Void Walk', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.8,y:0.3},{id:3,x:0.2,y:0.7},{id:4,x:0.5,y:0.7},{id:5,x:0.8,y:0.7}], edges: [[0,1],[1,4],[4,3],[3,0],[1,2],[2,5],[5,4]], solution: [0,3,4,1,2,5] },
    { id: 22, title: 'Fractured', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.2,y:0.1},{id:1,x:0.5,y:0.1},{id:2,x:0.8,y:0.1},{id:3,x:0.8,y:0.4},{id:4,x:0.5,y:0.4},{id:5,x:0.2,y:0.4},{id:6,x:0.2,y:0.7},{id:7,x:0.5,y:0.7},{id:8,x:0.8,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[6,7],[7,4],[4,8],[8,3]], solution: [0,1,2,3,8,4,7,6,5] },
    { id: 23, title: 'Threaded', diff: 'Expert', requiredStart: 5, nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.2,y:0.2},{id:2,x:0.8,y:0.2},{id:3,x:0.8,y:0.8},{id:4,x:0.2,y:0.8},{id:5,x:0.5,y:0.2},{id:6,x:0.8,y:0.5},{id:7,x:0.5,y:0.8},{id:8,x:0.2,y:0.5}], edges: [[1,5],[5,2],[2,6],[6,3],[3,7],[7,4],[4,8],[8,1],[1,0],[2,0],[3,0],[4,0]], solution: [5,1,8,4,7,3,6,2,0] },
    { id: 24, title: 'The Final Knot', diff: 'Master', requiredStart: 0, requiredEnd: 12, nodes: [
        {id:0,x:0.1,y:0.1},{id:1,x:0.5,y:0.1},{id:2,x:0.9,y:0.1},
        {id:3,x:0.9,y:0.5},{id:4,x:0.9,y:0.9},{id:5,x:0.5,y:0.9},
        {id:6,x:0.1,y:0.9},{id:7,x:0.1,y:0.5},{id:8,x:0.3,y:0.3},
        {id:9,x:0.7,y:0.3},{id:10,x:0.7,y:0.7},{id:11,x:0.3,y:0.7},
        {id:12,x:0.5,y:0.5}
    ], edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
        [0,8],[2,9],[4,10],[6,11],[8,9],[9,10],[10,11],[11,8],
        [1,12],[3,12],[5,12],[7,12]
    ], solution: [0,7,6,11,8,9,2,3,4,10,5,1,12] }
];

let canvas, ctx;
let currentLevelIndex = 0;
let path = [];
let highestUnlockedLevel = 1;
let invalidPulseNodeId = null;
let invalidPulseTimer = 0;
let hintPulseNodeId = null;
let hintPulseTimer = 0;
let lastHintTime = 0;
let mousePos = { x: 0, y: 0 };
let isLevelCleared = false;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    validateLevels();
    loadProgress();
    setupEventListeners();
    generateLevelButtons();
    loadLevel(currentLevelIndex);
    requestAnimationFrame(gameLoop);
}

function validateLevels() {
    LEVELS.forEach((level, index) => {
        const nodeIds = level.nodes.map(n => n.id);
        const uniqueNodeIds = new Set(nodeIds);
        if (nodeIds.length !== uniqueNodeIds.size) {
            console.warn(`Level ${index + 1}: Duplicate node IDs.`);
        }

        level.edges.forEach(edge => {
            if (!nodeIds.includes(edge[0]) || !nodeIds.includes(edge[1])) {
                console.warn(`Level ${index + 1}: Edge references missing node.`);
            }
        });

        if (level.solution.length !== level.nodes.length) {
            console.warn(`Level ${index + 1}: Solution length (${level.solution.length}) does not match node count (${level.nodes.length}).`);
        }

        const uniqueSolution = new Set(level.solution);
        if (uniqueSolution.size !== level.solution.length) {
            console.warn(`Level ${index + 1}: Duplicate nodes in solution.`);
        }

        for (let i = 0; i < level.solution.length - 1; i++) {
            const n1 = level.solution[i];
            const n2 = level.solution[i + 1];
            const connected = level.edges.some(e => (e[0] === n1 && e[1] === n2) || (e[0] === n2 && e[1] === n1));
            if (!connected) {
                console.warn(`Level ${index + 1}: Solution path step ${i} (${n1} -> ${n2}) is not connected by an edge.`);
            }
        }

        if (level.requiredStart === undefined) {
            console.warn(`Level ${index + 1}: Missing requiredStart.`);
        } else if (level.requiredStart !== level.solution[0]) {
            console.warn(`Level ${index + 1}: requiredStart does not match solution[0].`);
        }
        
        if (level.requiredEnd !== undefined && level.requiredEnd !== level.solution[level.solution.length - 1]) {
            console.warn(`Level ${index + 1}: requiredEnd does not match solution last element.`);
        }
    });
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mousePos.x = (e.clientX - rect.left) * scaleX;
        mousePos.y = (e.clientY - rect.top) * scaleY;
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Backspace' || e.key.toLowerCase() === 'u') undoMove();
        if (e.key.toLowerCase() === 'r') resetLevel();
        if (e.key.toLowerCase() === 'h') useHint();
        if (e.key === 'Enter' && isLevelCleared) nextLevel();
    });

    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('reset-btn').addEventListener('click', resetLevel);
    document.getElementById('hint-btn').addEventListener('click', useHint);
    document.getElementById('next-btn').addEventListener('click', nextLevel);
}

function loadLevel(index) {
    currentLevelIndex = index;
    const level = LEVELS[currentLevelIndex];
    
    // Auto-start at requiredStart
    path = [level.requiredStart];
    isLevelCleared = false;
    invalidPulseNodeId = null;
    hintPulseNodeId = null;
    
    document.getElementById('clear-overlay').classList.remove('active');
    document.getElementById('next-btn').style.display = 'none';
    
    updateHUD();
    updateLevelButtons();
    setStatus("Continue the thread.");
}

function handleMouseDown(e) {
    if (isLevelCleared) return;
    
    // Recalculate precisely on click to avoid sync issues
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    const level = LEVELS[currentLevelIndex];
    let clickedNodeId = -1;

    for (const node of level.nodes) {
        const nx = getCanvasPos(node.x, 'width');
        const ny = getCanvasPos(node.y, 'height');
        const dist = Math.sqrt((clickX - nx)**2 + (clickY - ny)**2);
        if (dist <= CONFIG.nodeHitRadius) {
            clickedNodeId = node.id;
            break;
        }
    }

    if (clickedNodeId !== -1) {
        tryAddNode(clickedNodeId);
    }
}

function getCanvasPos(ratio, dimension) {
    const size = dimension === 'width' ? canvas.width : canvas.height;
    return CONFIG.boardPadding + ratio * (size - CONFIG.boardPadding * 2);
}

function tryAddNode(nodeId) {
    if (path.includes(nodeId)) {
        triggerInvalid(nodeId);
        setStatus("Node already visited.");
        return;
    }

    const lastNodeId = path[path.length - 1];
    if (isConnected(lastNodeId, nodeId)) {
        path.push(nodeId);
        updateHUD();
        checkLevelComplete();
    } else {
        triggerInvalid(nodeId);
        setStatus("Not connected.");
    }
}

function isConnected(id1, id2) {
    const level = LEVELS[currentLevelIndex];
    return level.edges.some(e => (e[0] === id1 && e[1] === id2) || (e[0] === id2 && e[1] === id1));
}

function undoMove() {
    if (isLevelCleared || path.length <= 1) {
        if (path.length === 1) setStatus("Start point remains fixed.");
        return;
    }
    path.pop();
    setStatus("Last move undone.");
    updateHUD();
}

function resetLevel() {
    if (isLevelCleared) return;
    const level = LEVELS[currentLevelIndex];
    path = [level.requiredStart];
    setStatus("Thread reset.");
    updateHUD();
}

function useHint() {
    if (isLevelCleared) return;
    const now = Date.now();
    if (now - lastHintTime < CONFIG.hintCooldown) return;
    lastHintTime = now;

    const level = LEVELS[currentLevelIndex];
    const solution = level.solution;

    // Check if current path follows solution
    let follows = true;
    for (let i = 0; i < path.length; i++) {
        if (path[i] !== solution[i]) {
            follows = false;
            break;
        }
    }

    if (follows) {
        if (path.length < solution.length) {
            hintPulseNodeId = solution[path.length];
            hintPulseTimer = CONFIG.hintPulseDuration;
            setStatus("Hint shown.");
        }
    } else {
        setStatus("Undo or reset to return to the known thread.");
    }
}

function checkLevelComplete() {
    const level = LEVELS[currentLevelIndex];
    if (path.length === level.nodes.length) {
        if (level.requiredEnd !== undefined && path[path.length - 1] !== level.requiredEnd) {
            setStatus("Path must end on the required final node.");
            return;
        }
        
        isLevelCleared = true;
        document.getElementById('clear-overlay').classList.add('active');
        document.getElementById('next-btn').style.display = 'block';
        setStatus("Level cleared.");
        saveProgress();
    } else {
        setStatus("Continue the thread.");
    }
}

function nextLevel() {
    if (currentLevelIndex < LEVELS.length - 1) {
        loadLevel(currentLevelIndex + 1);
    }
}

function selectLevel(index) {
    if (index + 1 <= highestUnlockedLevel) {
        loadLevel(index);
    }
}

function triggerInvalid(nodeId) {
    invalidPulseNodeId = nodeId;
    invalidPulseTimer = CONFIG.invalidPulseDuration;
}

function updateHUD() {
    const level = LEVELS[currentLevelIndex];
    document.getElementById('level-num').innerText = String(level.id).padStart(2, '0');
    document.getElementById('visited-count').innerText = path.length;
    document.getElementById('remaining-count').innerText = level.nodes.length - path.length;
}

function setStatus(msg) {
    document.getElementById('status-text').innerText = msg;
}

function generateLevelButtons() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    LEVELS.forEach((level, index) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerText = level.id;
        btn.onclick = () => selectLevel(index);
        grid.appendChild(btn);
    });
}

function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current', 'cleared', 'locked');
        if (index === currentLevelIndex) btn.classList.add('current');
        if (index + 1 < highestUnlockedLevel) btn.classList.add('cleared');
        if (index + 1 > highestUnlockedLevel) btn.classList.add('locked');
    });
}

function saveProgress() {
    if (currentLevelIndex + 2 > highestUnlockedLevel) {
        highestUnlockedLevel = Math.min(currentLevelIndex + 2, LEVELS.length);
        localStorage.setItem(CONFIG.bestLevelKey, highestUnlockedLevel);
        updateLevelButtons();
    }
}

function loadProgress() {
    const saved = localStorage.getItem(CONFIG.bestLevelKey);
    if (saved) {
        highestUnlockedLevel = parseInt(saved);
        currentLevelIndex = Math.min(highestUnlockedLevel - 1, LEVELS.length - 1);
    }
}

function gameLoop(time) {
    update(1/60);
    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (invalidPulseTimer > 0) {
        invalidPulseTimer -= dt * 1000;
        if (invalidPulseTimer <= 0) invalidPulseNodeId = null;
    }
    if (hintPulseTimer > 0) {
        hintPulseTimer -= dt * 1000;
        if (hintPulseTimer <= 0) hintPulseNodeId = null;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const level = LEVELS[currentLevelIndex];

    // Radial background glow
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    grad.addColorStop(0, "rgba(12, 12, 20, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid
    ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.boardGridOpacity})`;
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Board inner glow
    ctx.shadowBlur = 40 * CONFIG.boardGlowStrength;
    ctx.shadowColor = "rgba(76, 201, 240, 0.1)";

    // Draw Edges
    ctx.lineWidth = CONFIG.edgeWidth;
    ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.edgeOpacity})`;
    level.edges.forEach(edge => {
        const n1 = level.nodes.find(n => n.id === edge[0]);
        const n2 = level.nodes.find(n => n.id === edge[1]);
        ctx.beginPath();
        ctx.moveTo(getCanvasPos(n1.x, 'width'), getCanvasPos(n1.y, 'height'));
        ctx.lineTo(getCanvasPos(n2.x, 'width'), getCanvasPos(n2.y, 'height'));
        ctx.stroke();
    });

    // Draw Active Path
    if (path.length > 1) {
        ctx.lineWidth = CONFIG.pathWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = "#8b6cff";
        ctx.shadowBlur = CONFIG.pathGlowStrength;
        ctx.shadowColor = "#8b6cff";
        
        ctx.beginPath();
        path.forEach((nodeId, index) => {
            const node = level.nodes.find(n => n.id === nodeId);
            const nx = getCanvasPos(node.x, 'width');
            const ny = getCanvasPos(node.y, 'height');
            if (index === 0) ctx.moveTo(nx, ny);
            else ctx.lineTo(nx, ny);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Draw Nodes
    level.nodes.forEach(node => {
        const nx = getCanvasPos(node.x, 'width');
        const ny = getCanvasPos(node.y, 'height');
        const isVisited = path.includes(node.id);
        const isLast = path.length > 0 && path[path.length - 1] === node.id;
        const isHovered = !isLevelCleared && Math.sqrt((mousePos.x - nx)**2 + (mousePos.y - ny)**2) <= CONFIG.nodeRadius * 1.5;

        // Pulse for current/last node
        if (isLast && !isLevelCleared) {
            const s = 1 + Math.sin(Date.now() / 200) * 0.2;
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * s * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(139, 108, 255, 0.15)";
            ctx.fill();
        }

        // Draw Node
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
        ctx.shadowBlur = 0;

        // Inner marker for last node
        if (isLast) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "#4cc9f0";
            ctx.fill();
        }

        // Markers for Required Start/End
        if (level.requiredStart === node.id) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 1.4, 0, Math.PI * 2);
            ctx.strokeStyle = "#fee440";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        if (level.requiredEnd === node.id) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.setLineDash([2, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Invalid Pulse
        if (invalidPulseNodeId === node.id) {
            const alpha = invalidPulseTimer / CONFIG.invalidPulseDuration;
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(247, 37, 133, ${alpha * 0.4})`;
            ctx.fill();
        }

        // Hint Pulse
        if (hintPulseNodeId === node.id) {
            const alpha = hintPulseTimer / CONFIG.hintPulseDuration;
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(254, 228, 64, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
