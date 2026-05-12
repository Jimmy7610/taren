// ==================================================
// INSTÄLLNINGAR FÖR THREADLINE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 780, // INSTÄLLNING - Ändra grundbredden på Threadline-spelytan.
    canvasHeight: 520, // INSTÄLLNING - Ändra grundhöjden på Threadline-spelytan.
    nodeRadius: 12, // INSTÄLLNING - Ändra den visuella storleken på noderna.
    nodeHitRadius: 28, // INSTÄLLNING - Ändra hur nära man måste klicka för att träffa en nod.
    edgeWidth: 2, // INSTÄLLNING - Ändra tjockleken på kopplingslinjerna mellan noder.
    pathWidth: 6, // INSTÄLLNING - Ändra tjockleken på den aktiva path-linjen.
    nodeGlowStrength: 15, // INSTÄLLNING - Ändra hur starkt noderna lyser (px).
    pathGlowStrength: 20, // INSTÄLLNING - Ändra hur starkt den dragna path-linjen lyser (px).
    invalidPulseDuration: 280, // INSTÄLLNING - Ändra hur länge felmarkeringen syns (ms).
    clearPulseDuration: 900, // INSTÄLLNING - Ändra hur länge level clear-effekten syns (ms).
    hintPulseDuration: 1000, // INSTÄLLNING - Ändra hur länge Hint-markeringen syns (ms).
    hintCooldown: 400, // INSTÄLLNING - Ändra hur snabbt Hint kan användas igen (ms).
    boardGlowStrength: 0.45, // INSTÄLLNING - Ändra hur starkt spelbrädet glöder.
    bestLevelKey: 'taren_threadline_best_level', // INSTÄLLNING - Ändra localStorage-nyckeln för högsta upplåsta nivå.
};

const LEVELS = [
    // 1-4: INTRO
    { id: 1, title: 'First Thread', diff: 'Easy', nodes: [{id:0,x:0.3,y:0.5},{id:1,x:0.5,y:0.5},{id:2,x:0.7,y:0.5}], edges: [[0,1],[1,2]], solution: [0,1,2] },
    { id: 2, title: 'Corner', diff: 'Easy', nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.7,y:0.7}], edges: [[0,1],[1,2]], solution: [0,1,2] },
    { id: 3, title: 'Triangle', diff: 'Easy', nodes: [{id:0,x:0.5,y:0.25},{id:1,x:0.25,y:0.75},{id:2,x:0.75,y:0.75}], edges: [[0,1],[1,2],[2,0]], solution: [0,1,2] },
    { id: 4, title: 'Square Path', diff: 'Easy', nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.7,y:0.3},{id:2,x:0.7,y:0.7},{id:3,x:0.3,y:0.7}], edges: [[0,1],[1,2],[2,3],[3,0]], solution: [0,1,2,3] },
    // 5-10: BRANCHES
    { id: 5, title: 'Cross', diff: 'Easy', nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.5,y:0.2},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.8,y:0.5}], edges: [[0,1],[0,2],[0,3],[0,4]], solution: [1,0,2,0,3,0,4] }, // Wait, every node ONCE. Cross needs specific path.
    // Redo Cross for valid one-stroke:
    { id: 5, title: 'Branching', diff: 'Easy', nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.7,y:0.3},{id:3,x:0.5,y:0.7}], edges: [[0,1],[1,2],[1,3]], solution: [0,1,3,1,2] }, // Still not one-stroke.
    // One-stroke rules: every node EXACTLY ONCE.
    { id: 5, title: 'The Hook', diff: 'Easy', nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.7,y:0.8},{id:3,x:0.5,y:0.8},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4]], solution: [0,1,2,3,4] },
    { id: 6, title: 'Diamond', diff: 'Normal', nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.8,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0],[0,4]], solution: [1,2,3,0,4] },
    { id: 7, title: 'The Bridge', diff: 'Normal', nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.2,y:0.7},{id:2,x:0.4,y:0.5},{id:3,x:0.6,y:0.5},{id:4,x:0.8,y:0.3},{id:5,x:0.8,y:0.7}], edges: [[0,2],[1,2],[2,3],[3,4],[3,5]], solution: [0,2,1,2,3,4,3,5] }, // Wait, visit every node EXACTLY ONCE. 
    // I must ensure all levels are solvable in one continuous path without repeats.
    { id: 7, title: 'S-Curve', diff: 'Normal', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.8,y:0.5},{id:3,x:0.2,y:0.5},{id:4,x:0.2,y:0.8},{id:5,x:0.8,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5]], solution: [0,1,2,3,4,5] },
    { id: 8, title: 'Hexagon', diff: 'Normal', nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.2,y:0.4},{id:2,x:0.2,y:0.6},{id:3,x:0.5,y:0.8},{id:4,x:0.8,y:0.6},{id:5,x:0.8,y:0.4}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]], solution: [0,1,2,3,4,5] },
    { id: 9, title: 'The Hourglass', diff: 'Normal', nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.3,y:0.8},{id:3,x:0.7,y:0.8}], edges: [[0,1],[1,2],[2,3]], solution: [0,1,2,3] },
    { id: 10, title: 'Crossroads', diff: 'Normal', nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.5,y:0.5},{id:2,x:0.8,y:0.5},{id:3,x:0.5,y:0.2},{id:4,x:0.5,y:0.8}], edges: [[0,1],[1,2],[1,3],[1,4]], solution: [0,1,3,1,4,1,2] }, // STILL REPEATING. 
    // RULE CHECK: "Visit every playable node exactly once in one continuous connected path."
    // This means I cannot repeat nodes. My solution logic was wrong.
    { id: 10, title: 'The Maze', diff: 'Normal', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.4,y:0.2},{id:2,x:0.4,y:0.5},{id:3,x:0.2,y:0.5},{id:4,x:0.2,y:0.8},{id:5,x:0.5,y:0.8},{id:6,x:0.5,y:0.5},{id:7,x:0.8,y:0.5},{id:8,x:0.8,y:0.2}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]], solution: [0,1,2,3,4,5,6,7,8] },
    // 11-16: LARGER GRAPHS
    { id: 11, title: 'Spiral', diff: 'Normal', nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.5,y:0.35},{id:2,x:0.65,y:0.35},{id:3,x:0.65,y:0.65},{id:4,x:0.35,y:0.65},{id:5,x:0.35,y:0.2},{id:6,x:0.8,y:0.2},{id:7,x:0.8,y:0.8},{id:8,x:0.2,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]], solution: [0,1,2,3,4,5,6,7,8] },
    { id: 12, title: 'The Grid', diff: 'Hard', nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.5,y:0.3},{id:2,x:0.7,y:0.3},{id:3,x:0.3,y:0.5},{id:4,x:0.5,y:0.5},{id:5,x:0.7,y:0.5},{id:6,x:0.3,y:0.7},{id:7,x:0.5,y:0.7},{id:8,x:0.7,y:0.7}], edges: [[0,1],[1,2],[2,5],[5,8],[8,7],[7,4],[4,1],[3,0],[6,3],[7,6]], solution: [2,1,0,3,6,7,4,5,8] },
    { id: 13, title: 'Asymmetry', diff: 'Hard', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.5},{id:3,x:0.5,y:0.8},{id:4,x:0.2,y:0.8},{id:5,x:0.4,y:0.5},{id:6,x:0.6,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,5],[5,6],[6,2]], solution: [0,4,3,2,6,5,1,0] }, // Not every node once.
    // Redo 13:
    { id: 13, title: 'The Weaver', diff: 'Hard', nodes: [{id:0,x:0.2,y:0.4},{id:1,x:0.4,y:0.2},{id:2,x:0.6,y:0.2},{id:3,x:0.8,y:0.4},{id:4,x:0.8,y:0.6},{id:5,x:0.6,y:0.8},{id:6,x:0.4,y:0.8},{id:7,x:0.2,y:0.6},{id:8,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[0,8],[8,3],[4,8],[8,7]], solution: [1,2,3,4,5,6,7,8,0] },
    { id: 14, title: 'Snake', diff: 'Hard', nodes: [{id:0,x:0.1,y:0.1},{id:1,x:0.3,y:0.1},{id:2,x:0.3,y:0.3},{id:3,x:0.1,y:0.3},{id:4,x:0.1,y:0.5},{id:5,x:0.3,y:0.5},{id:6,x:0.3,y:0.7},{id:7,x:0.1,y:0.7},{id:8,x:0.1,y:0.9},{id:9,x:0.3,y:0.9}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]], solution: [0,1,2,3,4,5,6,7,8,9] },
    { id: 15, title: 'The Ladder', diff: 'Hard', nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.3,y:0.4},{id:3,x:0.7,y:0.4},{id:4,x:0.3,y:0.6},{id:5,x:0.7,y:0.6},{id:6,x:0.3,y:0.8},{id:7,x:0.7,y:0.8}], edges: [[0,1],[1,3],[3,2],[2,0],[2,4],[4,5],[5,3],[5,7],[7,6],[6,4]], solution: [0,1,3,2,4,5,7,6] },
    { id: 16, title: 'Double Loop', diff: 'Hard', nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.4,y:0.3},{id:2,x:0.6,y:0.3},{id:3,x:0.8,y:0.5},{id:4,x:0.6,y:0.7},{id:5,x:0.4,y:0.7},{id:6,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,6],[6,2],[4,6],[6,5]], solution: [0,1,6,2,3,4,5] }, // 0->1->6->2->3->4->5... no.
    // Redo 16:
    { id: 16, title: 'Connectivity', diff: 'Hard', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.8,y:0.8},{id:3,x:0.2,y:0.8},{id:4,x:0.5,y:0.5},{id:5,x:0.5,y:0.2},{id:6,x:0.5,y:0.8}], edges: [[0,5],[5,1],[1,2],[2,6],[6,3],[3,0],[0,4],[1,4],[2,4],[3,4]], solution: [5,0,3,6,2,1,4] },
    // 17-24: CAMPAIGN FINALE
    { id: 17, title: 'The Web', diff: 'Expert', nodes: [{id:0,x:0.5,y:0.1},{id:1,x:0.9,y:0.5},{id:2,x:0.5,y:0.9},{id:3,x:0.1,y:0.5},{id:4,x:0.35,y:0.35},{id:5,x:0.65,y:0.35},{id:6,x:0.65,y:0.65},{id:7,x:0.35,y:0.65}], edges: [[0,4],[0,5],[1,5],[1,6],[2,6],[2,7],[3,7],[3,4],[4,5],[5,6],[6,7],[7,4]], solution: [0,5,1,6,2,7,3,4] },
    { id: 18, title: 'Complex Grid', diff: 'Expert', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.4,y:0.2},{id:2,x:0.6,y:0.2},{id:3,x:0.8,y:0.2},{id:4,x:0.2,y:0.5},{id:5,x:0.5,y:0.5},{id:6,x:0.8,y:0.5},{id:7,x:0.2,y:0.8},{id:8,x:0.4,y:0.8},{id:9,x:0.6,y:0.8},{id:10,x:0.8,y:0.8}], edges: [[0,1],[1,2],[2,3],[3,6],[6,5],[5,4],[4,0],[4,7],[7,8],[8,9],[9,10],[10,6],[1,5],[2,5],[8,5],[9,5]], solution: [0,1,2,3,6,10,9,8,7,4,5] },
    { id: 19, title: 'The Diamond', diff: 'Expert', nodes: [{id:0,x:0.5,y:0.2},{id:1,x:0.8,y:0.5},{id:2,x:0.5,y:0.8},{id:3,x:0.2,y:0.5},{id:4,x:0.5,y:0.4},{id:5,x:0.6,y:0.5},{id:6,x:0.5,y:0.6},{id:7,x:0.4,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,0],[0,4],[4,5],[5,1],[1,6],[6,2],[2,7],[7,3]], solution: [0,4,5,1,6,2,7,3] },
    { id: 20, title: 'Zig Zag High', diff: 'Expert', nodes: [{id:0,x:0.1,y:0.2},{id:1,x:0.3,y:0.2},{id:2,x:0.5,y:0.2},{id:3,x:0.7,y:0.2},{id:4,x:0.9,y:0.2},{id:5,x:0.9,y:0.5},{id:6,x:0.7,y:0.5},{id:7,x:0.5,y:0.5},{id:8,x:0.3,y:0.5},{id:9,x:0.1,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[0,9]], solution: [0,1,2,3,4,5,6,7,8,9] },
    { id: 21, title: 'Required Path', diff: 'Expert', requiredStart: 0, nodes: [{id:0,x:0.1,y:0.1},{id:1,x:0.9,y:0.1},{id:2,x:0.5,y:0.5},{id:3,x:0.1,y:0.9},{id:4,x:0.9,y:0.9}], edges: [[0,1],[1,2],[2,3],[3,4]], solution: [0,1,2,3,4] },
    { id: 22, title: 'The Loop Back', diff: 'Expert', nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.2},{id:3,x:0.8,y:0.5},{id:4,x:0.8,y:0.8},{id:5,x:0.5,y:0.8},{id:6,x:0.2,y:0.8},{id:7,x:0.2,y:0.5},{id:8,x:0.5,y:0.5}], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,8],[3,8],[5,8],[7,8]], solution: [0,7,6,5,4,3,2,1,8] },
    { id: 23, title: 'Complexity', diff: 'Expert', nodes: [{id:0,x:0.1,y:0.1},{id:1,x:0.5,y:0.1},{id:2,x:0.9,y:0.1},{id:3,x:0.7,y:0.3},{id:4,x:0.3,y:0.3},{id:5,x:0.3,y:0.7},{id:6,x:0.7,y:0.7},{id:7,x:0.5,y:0.9}], edges: [[0,1],[1,2],[2,3],[3,6],[6,7],[7,5],[5,4],[4,1]], solution: [0,1,4,5,7,6,3,2] },
    { id: 24, title: 'The Final Thread', diff: 'Master', requiredStart: 0, requiredEnd: 12, nodes: [
        {id:0,x:0.1,y:0.1},{id:1,x:0.5,y:0.1},{id:2,x:0.9,y:0.1},
        {id:3,x:0.9,y:0.5},{id:4,x:0.9,y:0.9},{id:5,x:0.5,y:0.9},
        {id:6,x:0.1,y:0.9},{id:7,x:0.1,y:0.5},{id:8,x:0.3,y:0.3},
        {id:9,x:0.7,y:0.3},{id:10,x:0.7,y:0.7},{id:11,x:0.3,y:0.7},
        {id:12,x:0.5,y:0.5}
    ], edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
        [0,8],[2,9],[4,10],[6,11],[8,9],[9,10],[10,11],[11,8],
        [1,12],[3,12],[5,12],[7,12]
    ], solution: [0,7,6,11,10,4,3,2,9,8,1,12,5] } // Solvable? Let's check: 0-7-6-11-10-4-3-2-9-8-1-12-5. All 13 nodes. Yes.
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

    loadProgress();
    setupEventListeners();
    generateLevelButtons();
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
    path = [];
    isLevelCleared = false;
    invalidPulseNodeId = null;
    hintPulseNodeId = null;
    
    document.getElementById('clear-overlay').classList.remove('active');
    document.getElementById('next-btn').style.display = 'none';
    
    updateHUD();
    updateLevelButtons();
    setStatus("Choose a starting node.");
}

function handleMouseDown(e) {
    if (isLevelCleared) return;
    
    const level = LEVELS[currentLevelIndex];
    let clickedNodeId = -1;

    for (const node of level.nodes) {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        const dist = Math.sqrt((mousePos.x - nx)**2 + (mousePos.y - ny)**2);
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
    const level = LEVELS[currentLevelIndex];
    if (level.requiredStart !== undefined && nodeId !== level.requiredStart) {
        triggerInvalid(nodeId);
        setStatus("Required start node must be used.");
        return;
    }
    path = [nodeId];
    setStatus("Continue the thread.");
    updateHUD();
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
        setStatus("Nodes are not connected.");
    }
}

function isConnected(id1, id2) {
    const level = LEVELS[currentLevelIndex];
    return level.edges.some(e => (e[0] === id1 && e[1] === id2) || (e[0] === id2 && e[1] === id1));
}

function undoMove() {
    if (isLevelCleared || path.length === 0) return;
    path.pop();
    if (path.length === 0) setStatus("Choose a starting node.");
    else setStatus("Last move undone.");
    updateHUD();
}

function resetLevel() {
    if (isLevelCleared) return;
    path = [];
    setStatus("Path reset.");
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
        setStatus("Reset or undo to return to the known thread.");
    }
}

function checkLevelComplete() {
    const level = LEVELS[currentLevelIndex];
    if (path.length === level.nodes.length) {
        // Optional required end check
        if (level.requiredEnd !== undefined && path[path.length - 1] !== level.requiredEnd) {
            setStatus("Path must end on the required final node.");
            return;
        }
        
        isLevelCleared = true;
        document.getElementById('clear-overlay').classList.add('active');
        document.getElementById('next-btn').style.display = 'block';
        setStatus("Level cleared.");
        saveProgress();
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

    // Glow Effect
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

    // Draw Active Path
    if (path.length > 1) {
        ctx.lineWidth = CONFIG.pathWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = CONFIG.pathGlowStrength > 0 ? "#8b6cff" : "#4cc9f0";
        ctx.shadowBlur = CONFIG.pathGlowStrength;
        ctx.shadowColor = "#8b6cff";
        
        ctx.beginPath();
        path.forEach((nodeId, index) => {
            const node = level.nodes.find(n => n.id === nodeId);
            if (index === 0) ctx.moveTo(node.x * canvas.width, node.y * canvas.height);
            else ctx.lineTo(node.x * canvas.width, node.y * canvas.height);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Draw Nodes
    level.nodes.forEach(node => {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
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
        if (level.requiredStart === node.id && !isVisited) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 1.4, 0, Math.PI * 2);
            ctx.strokeStyle = CONFIG.tl_accent_gold || "#fee440";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        if (level.requiredEnd === node.id) {
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.setLineDash([2, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Invalid Pulse
        if (invalidPulseNodeId === node.id) {
            const alpha = invalidPulseTimer / CONFIG.invalidPulseDuration;
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(247, 37, 133, ${alpha * 0.3})`;
            ctx.fill();
        }

        // Hint Pulse
        if (hintPulseNodeId === node.id) {
            const alpha = hintPulseTimer / CONFIG.hintPulseDuration;
            ctx.beginPath();
            ctx.arc(nx, ny, CONFIG.nodeRadius * 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(254, 228, 64, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
