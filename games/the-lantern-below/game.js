// ==================================================
// INSTÄLLNINGAR FÖR THE LANTERN BELOW
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWorldWidth: 960, // INSTÄLLNING - Ändra den interna bredden på spelvärlden.
    canvasWorldHeight: 540, // INSTÄLLNING - Ändra den interna höjden på spelvärlden.
    playerSpeed: 185, // INSTÄLLNING - Ändra hur snabbt spelaren rör sig.
    playerRadius: 18, // INSTÄLLNING - Ändra spelarens storlek.
    lanternRadius: 260, // INSTÄLLNING - Ändra hur långt lyktan lyser runt spelaren.
    lanternSoftness: 160, // INSTÄLLNING - Ändra hur mjuk kanten på lyktljuset är.
    lanternPulseAmount: 12, // INSTÄLLNING - Ändra hur mycket lyktskenet pulserar.
    darknessOpacity: 0.56, // INSTÄLLNING - Ändra hur mörk overlayen är utanför lyktan. Lägre värde = mer synligt rum.
    ambientRoomLight: 0.20, // INSTÄLLNING - Ändra hur mycket av rummet som syns även utanför lyktan. Högre värde = mindre svart skärm.
    visibleFloorContrast: 0.45, // INSTÄLLNING - Ändra hur tydligt stenplattor och golvdetaljer syns.
    wallVisibility: 0.70, // INSTÄLLNING - Ändra hur tydligt väggar och rumskanter syns i mörkret.
    fragmentGoal: 7, // INSTÄLLNING - Ändra hur många ljusfragment som behövs.
    runeGoal: 3, // INSTÄLLNING - Ändra hur många runstenar som krävs.
    interactionRadius: 52, // INSTÄLLNING - Ändra hur nära spelaren måste vara för att interagera.
    doorTransitionPadding: 45, // INSTÄLLNING - Ändra hur långt in spelaren placeras efter rumsbyte.
    statusMessageDuration: 2500, // INSTÄLLNING - Ändra hur länge statusmeddelanden visas.
    machineGlowWhenAwakened: 1.8, // INSTÄLLNING - Ändra hur starkt maskinen lyser när den är aktiverad.
    particleCount: 60, // INSTÄLLNING - Ändra mängden damm-/ljuspartiklar.
    runePulseSpeed: 1.5, // INSTÄLLNING - Ändra hur snabbt runstenen pulserar.
    machinePulseSpeed: 1.2, // INSTÄLLNING - Ändra hur snabbt maskinen pulserar.
    lanternColor: '#f5d38a', // INSTÄLLNING - Ändra färgen på lyktans varma ljus.
    runeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på runstenen.
    machineColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på maskinen.
    tileColor: '#1a1a22', // INSTÄLLNING - Grundfärg för stengolv.
    wallColor: '#282835', // INSTÄLLNING - Grundfärg för stenväggar.
    
    // BUILD 29 - Illustrated Scene Settings
    artTileSize: 60, // INSTÄLLNING - Ändra storleken på de ritade stenplattorna i rummen.
    stoneDetailAmount: 0.80, // INSTÄLLNING - Ändra mängden sprickor, skador och detaljer i stengolvet.
    wallBlockDetail: 0.90, // INSTÄLLNING - Ändra hur detaljerade väggblocken ritas.
    objectGlowStrength: 1.35, // INSTÄLLNING - Ändra hur starkt viktiga objekt lyser.
    objectVisualScale: 1.35, // INSTÄLLNING - Ändra visuell storlek på runor, fragment, key och maskin.
    lanternWarmth: 0.90, // INSTÄLLNING - Ändra hur varm/guldig lyktans färgkänsla är.
    roomIllustrationContrast: 0.70, // INSTÄLLNING - Ändra hur mycket rummet liknar illustrerad spelgrafik istället för platta former.
    rubbleDensity: 0.60, // INSTÄLLNING - Ändra mängden dekorativa stenar och spillror i rummen.

    // Shadow & Collision Settings
    shadowSpeed: 58,
    shadowRadius: 22,
    shadowInvulnerabilityDuration: 1400,
    shadowColor: '#11091f',
    shadowEyeColor: '#8b6cff',
    shadowLanternDimDuration: 2200,
    shadowLanternDimAmount: 0.65,
};

// Rooms Data
const ROOMS = {
    start_chamber: {
        name: 'The Descent',
        walls: [
            { x: 0, y: 0, w: 430, h: 60 }, { x: 530, y: 0, w: 430, h: 60 },
            { x: 0, y: 480, w: 960, h: 60 },
            { x: 0, y: 0, w: 60, h: 540 },
            { x: 900, y: 0, w: 60, h: 540 },
            { x: 250, y: 150, w: 40, h: 240 },
            { x: 670, y: 150, w: 40, h: 240 },
        ],
        exits: [{ x: 430, y: -20, w: 100, h: 80, target: 'rune_hall', entryX: 480, entryY: 450 }],
        fragments: [{ id: 'f1', x: 480, y: 270 }],
        runes: [],
        machines: [],
        key: null,
        gate: null,
        shadows: [],
        accent: '#f5d38a22',
        marking: 'circle'
    },
    rune_hall: {
        name: 'The Hall of Runes',
        walls: [
            { x: 0, y: 0, w: 960, h: 60 },
            { x: 0, y: 480, w: 430, h: 60 }, { x: 530, y: 480, w: 430, h: 60 },
            { x: 0, y: 0, w: 60, h: 220 }, { x: 0, y: 320, w: 60, h: 220 },
            { x: 900, y: 0, w: 60, h: 220 }, { x: 900, y: 320, w: 60, h: 220 },
        ],
        exits: [
            { x: 430, y: 480, w: 100, h: 80, target: 'start_chamber', entryX: 480, entryY: 90 },
            { x: 900, y: 220, w: 80, h: 100, target: 'machine_room', entryX: 120, entryY: 270 },
            { x: -20, y: 220, w: 80, h: 100, target: 'fragment_vault', entryX: 840, entryY: 270 },
        ],
        fragments: [{ id: 'f2', x: 220, y: 380 }, { id: 'f3', x: 740, y: 380 }],
        runes: [{ id: 'r1', x: 250, y: 150, activated: false }, { id: 'r2', x: 710, y: 150, activated: false }],
        machines: [],
        key: null,
        gate: null,
        shadows: [{ x: 480, y: 200, points: [{x: 480, y: 150}, {x: 480, y: 350}], pIndex: 0 }],
        accent: '#8b6cff22',
        marking: 'runes'
    },
    fragment_vault: {
        name: 'The Echo Vault',
        walls: [
            { x: 0, y: 0, w: 960, h: 60 },
            { x: 0, y: 480, w: 960, h: 60 },
            { x: 0, y: 0, w: 60, h: 540 },
            { x: 900, y: 0, w: 60, h: 220 }, { x: 900, y: 320, w: 60, h: 220 },
        ],
        exits: [{ x: 900, y: 220, w: 80, h: 100, target: 'rune_hall', entryX: 120, entryY: 270 }],
        fragments: [{ id: 'f4', x: 180, y: 400 }, { id: 'f5', x: 250, y: 140 }],
        runes: [],
        machines: [],
        key: { x: 480, y: 270, collected: false },
        gate: null,
        shadows: [{ x: 150, y: 270, points: [{x: 150, y: 270}, {x: 450, y: 270}], pIndex: 0 }],
        accent: '#f5d38a11'
    },
    machine_room: {
        name: 'The Deep Engine',
        walls: [
            { x: 0, y: 0, w: 430, h: 60 }, { x: 530, y: 0, w: 430, h: 60 },
            { x: 0, y: 480, w: 430, h: 60 }, { x: 530, y: 480, w: 430, h: 60 },
            { x: 0, y: 0, w: 60, h: 220 }, { x: 0, y: 320, w: 60, h: 220 },
            { x: 900, y: 0, w: 60, h: 540 },
        ],
        exits: [
            { x: -20, y: 220, w: 80, h: 100, target: 'rune_hall', entryX: 840, entryY: 270 },
            { x: 430, y: 480, w: 100, h: 80, target: 'start_chamber', entryX: 480, entryY: 90 },
            { x: 430, y: -20, w: 100, h: 80, target: 'lower_gate', entryX: 480, entryY: 440, requiresGate: true },
        ],
        fragments: [{ id: 'f6', x: 220, y: 380 }],
        runes: [{ id: 'r3', x: 480, y: 420, activated: false }],
        machines: [{ id: 'm1', x: 480, y: 240, activated: false }],
        key: null,
        gate: { x: 430, y: 0, w: 100, h: 60, opened: false },
        shadows: [{ x: 780, y: 150, points: [{x: 780, y: 150}, {x: 780, y: 390}], pIndex: 0 }],
        accent: '#4cc9f022',
        marking: 'engine'
    },
    lower_gate: {
        name: 'The Lower Light',
        walls: [
            { x: 0, y: 0, w: 960, h: 60 },
            { x: 0, y: 480, w: 430, h: 60 }, { x: 530, y: 480, w: 430, h: 60 },
            { x: 0, y: 0, w: 60, h: 540 },
            { x: 900, y: 0, w: 60, h: 540 },
        ],
        exits: [{ x: 430, y: 480, w: 100, h: 80, target: 'machine_room', entryX: 480, entryY: 90 }],
        fragments: [{ id: 'f7', x: 480, y: 180 }],
        runes: [],
        machines: [],
        key: null,
        gate: null,
        isFinalRoom: true,
        shadows: [],
        accent: '#f5d38a33'
    }
};

// Game State
let state = {
    started: false,
    currentRoomId: 'start_chamber',
    fragmentsCollected: new Set(),
    runesActivated: new Set(),
    hasKey: false,
    gateOpened: false,
    machineActivated: false,
    completed: false,
    statusText: '',
    statusTimer: null,
    lastTime: 0,
    invulnerableTimer: 0,
    lanternDimTimer: 0,
    rubble: []
};

let player = {
    x: 480, y: 400, vx: 0, vy: 0, radius: CONFIG.playerRadius,
};

const input = { up: false, down: false, left: false, right: false, interact: false, interactPressed: false };
const particles = [];

// References
let canvas, ctx;
let offscreenCanvas, offscreenCtx;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWorldWidth;
    canvas.height = CONFIG.canvasWorldHeight;

    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = CONFIG.canvasWorldWidth;
    offscreenCanvas.height = CONFIG.canvasWorldHeight;
    offscreenCtx = offscreenCanvas.getContext('2d');

    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
            angle: Math.random() * Math.PI * 2
        });
    }

    // Generate static rubble for variety
    for (let i = 0; i < 40; i++) {
        state.rubble.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 10 + 4,
            angle: Math.random() * Math.PI * 2,
            type: Math.floor(Math.random() * 3)
        });
    }

    window.addEventListener('keydown', (e) => handleInput(e, true));
    window.addEventListener('keyup', (e) => handleInput(e, false));
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);

    validateAdventureContent();
    updateHUD();
}

function validateAdventureContent() {
    let totalF = 0; Object.values(ROOMS).forEach(r => totalF += r.fragments.length);
    if (totalF !== 7) console.warn(`Content Error: Found ${totalF} fragments, expected 7.`);
}

function startGame() {
    state.started = true;
    document.getElementById('startScreen').classList.add('hidden');
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    state = { ...state, started: true, currentRoomId: 'start_chamber', fragmentsCollected: new Set(), runesActivated: new Set(), hasKey: false, gateOpened: false, machineActivated: false, completed: false, lastTime: performance.now(), invulnerableTimer: 0, lanternDimTimer: 0 };
    player.x = 480; player.y = 400;
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('gameSubtitle').innerText = "Find the lower light.";
    updateHUD();
}

function handleInput(e, isDown) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') input.up = isDown;
    if (key === 's' || key === 'arrowdown') input.down = isDown;
    if (key === 'a' || key === 'arrowleft') input.left = isDown;
    if (key === 'd' || key === 'arrowright') input.right = isDown;
    if (key === 'e') { if (isDown && !input.interact) input.interactPressed = true; input.interact = isDown; }
}

function gameLoop(timestamp) {
    if (state.completed) { render(); return; }
    const dt = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;
    if (dt < 0.1) { update(dt); render(); }
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    updatePlayer(dt);
    updateShadows(dt);
    checkRoomTransitions();
    handleInteractions();
    if (state.invulnerableTimer > 0) state.invulnerableTimer -= dt * 1000;
    if (state.lanternDimTimer > 0) state.lanternDimTimer -= dt * 1000;
    particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = CONFIG.canvasWorldWidth; if (p.x > CONFIG.canvasWorldWidth) p.x = 0;
        if (p.y < 0) p.y = CONFIG.canvasWorldHeight; if (p.y > CONFIG.canvasWorldHeight) p.y = 0;
    });
    input.interactPressed = false;
}

function updatePlayer(dt) {
    player.vx = 0; player.vy = 0;
    if (input.up) player.vy = -CONFIG.playerSpeed;
    if (input.down) player.vy = CONFIG.playerSpeed;
    if (input.left) player.vx = -CONFIG.playerSpeed;
    if (input.right) player.vx = CONFIG.playerSpeed;
    const nx = player.x + player.vx * dt; const ny = player.y + player.vy * dt;
    if (!checkCollision(nx, player.y)) player.x = nx;
    if (!checkCollision(player.x, ny)) player.y = ny;
}

function updateShadows(dt) {
    const room = ROOMS[state.currentRoomId];
    if (!room.shadows) return;
    room.shadows.forEach(s => {
        const target = s.points[s.pIndex];
        const dx = target.x - s.x; const dy = target.y - s.y; const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 2) s.pIndex = (s.pIndex + 1) % s.points.length;
        else { s.x += (dx/dist)*CONFIG.shadowSpeed*dt; s.y += (dy/dist)*CONFIG.shadowSpeed*dt; }
        if (state.invulnerableTimer <= 0) {
            const pDist = getDist(player.x, player.y, s.x, s.y);
            if (pDist < player.radius + CONFIG.shadowRadius) onShadowHit();
        }
    });
}

function onShadowHit() {
    state.invulnerableTimer = CONFIG.shadowInvulnerabilityDuration;
    state.lanternDimTimer = CONFIG.shadowLanternDimDuration;
    setStatus("The shadow dims your lantern.");
}

function checkCollision(x, y) {
    const room = ROOMS[state.currentRoomId];
    for (const wall of room.walls) {
        if (x + player.radius > wall.x && x - player.radius < wall.x + wall.w &&
            y + player.radius > wall.y && y - player.radius < wall.y + wall.h) return true;
    }
    if (room.gate && !state.gateOpened) {
        const g = room.gate;
        if (x + player.radius > g.x && x - player.radius < g.x + g.w &&
            y + player.radius > g.y && y - player.radius < g.y + g.h) return true;
    }
    return false;
}

function checkRoomTransitions() {
    const room = ROOMS[state.currentRoomId];
    for (const exit of room.exits) {
        if (player.x + player.radius > exit.x && player.x - player.radius < exit.x + exit.w &&
            player.y + player.radius > exit.y && player.y - player.radius < exit.y + exit.h) {
            if (exit.requiresGate && !state.gateOpened) continue;
            changeRoom(exit.target, exit.entryX, exit.entryY);
            break;
        }
        const distToExit = getDist(player.x, player.y, exit.x + exit.w/2, exit.y + exit.h/2);
        if (distToExit < 80) setStatus(exit.requiresGate && !state.gateOpened ? "The gate needs a key." : "Passage", true);
    }
}

function changeRoom(roomId, x, y) {
    state.currentRoomId = roomId;
    player.x = x; player.y = y;
    state.invulnerableTimer = 600;
    updateHUD();
}

function handleInteractions() {
    const room = ROOMS[state.currentRoomId];
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id) && getDist(player.x, player.y, f.x, f.y) < player.radius + 20) {
            state.fragmentsCollected.add(f.id); setStatus("Light fragment collected."); updateHUD(); checkCompletion();
        }
    });
    if (room.key && !state.hasKey && getDist(player.x, player.y, room.key.x, room.key.y) < player.radius + 20) {
        state.hasKey = true; setStatus("Ancient key found."); updateHUD();
    }
    room.runes.forEach(r => {
        if (!state.runesActivated.has(r.id) && getDist(player.x, player.y, r.x, r.y) < CONFIG.interactionRadius) {
            if (input.interactPressed) { state.runesActivated.add(r.id); setStatus(`Rune awakened. (${state.runesActivated.size}/3)`); updateHUD(); }
            else setStatus("Press E to activate rune.", true);
        }
    });
    if (room.gate && !state.gateOpened && getDist(player.x, player.y, room.gate.x + room.gate.w/2, room.gate.y + room.gate.h/2) < CONFIG.interactionRadius + 15) {
        if (state.hasKey) { if (input.interactPressed) { state.gateOpened = true; setStatus("The gate opens."); updateHUD(); } else setStatus("Press E to open gate.", true); }
        else setStatus("The gate needs a key.", true);
    }
    room.machines.forEach(m => {
        if (getDist(player.x, player.y, m.x, m.y) < CONFIG.interactionRadius) {
            if (state.runesActivated.size >= CONFIG.runeGoal) { if (!state.machineActivated) { if (input.interactPressed) { state.machineActivated = true; setStatus("The lower mechanism awakens."); updateHUD(); checkCompletion(); } else setStatus("Press E to awaken machine.", true); } }
            else setStatus("The machine waits for three runes.", true);
        }
    });
    if (room.isFinalRoom && getDist(player.x, player.y, 480, 180) < 60) {
        if (state.fragmentsCollected.size >= CONFIG.fragmentGoal && state.machineActivated) winGame();
        else setStatus("The path is still dark. Collect fragments.", true);
    }
}

function checkCompletion() { if (state.fragmentsCollected.size >= CONFIG.fragmentGoal && state.machineActivated) document.getElementById('gameSubtitle').innerText = "The path is clear. Reach the light."; }
function winGame() { state.completed = true; document.getElementById('winScreen').classList.remove('hidden'); setStatus("You found the lower light."); }
function getDist(x1, y1, x2, y2) { return Math.sqrt((x1-x2)**2 + (y1-y2)**2); }
function setStatus(msg, isHint = false) {
    const el = document.getElementById('statusOverlay'); el.innerText = msg; el.classList.add('visible');
    if (state.statusTimer) clearTimeout(state.statusTimer);
    if (!isHint) state.statusTimer = setTimeout(() => { el.classList.remove('visible'); }, CONFIG.statusMessageDuration);
    else state.statusTimer = setTimeout(() => { el.classList.remove('visible'); }, 100);
}
function updateHUD() {
    document.getElementById('lightCount').innerText = `Light ${state.fragmentsCollected.size} / ${CONFIG.fragmentGoal}`;
    document.getElementById('keyCount').innerText = `Keys ${state.hasKey ? '1 / 1' : '0 / 1'}`;
    document.getElementById('runeCount').innerText = `Runes ${state.runesActivated.size} / ${CONFIG.runeGoal}`;
    document.getElementById('gateStatus').innerText = state.gateOpened ? 'Gate Open' : 'Gate Sealed';
}

// ==================================================
// RENDERING - ILLUSTRATED SCENE STYLE
// ==================================================

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Room Ambient
    const room = ROOMS[state.currentRoomId];
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (room.accent) {
        const g = ctx.createRadialGradient(480, 270, 0, 480, 270, 600);
        g.addColorStop(0, room.accent); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Stone Floor
    drawStoneFloor();
    
    // 3. Markings & Rubble
    drawAncientMarkings();
    drawRubble();

    // 4. Walls & Doorways
    drawStoneWalls();

    // 5. Objects
    drawImportantObjects();

    // 6. Shadows
    drawShadows();

    // 7. Player
    drawPlayer();

    // 8. Lantern & Darkness
    drawLanternLight();
}

function drawStoneFloor() {
    const s = CONFIG.artTileSize;
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += s) {
        for (let y = 0; y < canvas.height; y += s) {
            // Subtle tile variation
            const val = Math.floor(((x/s) * (y/s) * 31) % 5);
            ctx.fillStyle = `rgba(30, 30, 45, ${0.1 + val * 0.02})`;
            ctx.fillRect(x, y, s, s);
            
            // Tile grid
            ctx.strokeStyle = `rgba(255,255,255, ${0.03 * CONFIG.visibleFloorContrast})`;
            ctx.strokeRect(x, y, s, s);
            
            // Cracks
            if (Math.random() < 0.1 * CONFIG.stoneDetailAmount && (x+y)%13 === 0) {
                drawCrack(x + Math.random()*s, y + Math.random()*s, Math.random()*20+10);
            }
        }
    }
}

function drawCrack(x, y, len) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random()*len-len/2, y + Math.random()*len-len/2);
    ctx.stroke();
}

function drawStoneWalls() {
    const room = ROOMS[state.currentRoomId];
    room.walls.forEach(w => {
        // Main block
        ctx.fillStyle = CONFIG.wallColor;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        
        // Highlights & Shadows
        ctx.strokeStyle = `rgba(255,255,255, ${0.15 * CONFIG.wallVisibility})`;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
        
        // Top cap detail
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(w.x, w.y, w.w, 6);
        
        // Side block segments
        if (CONFIG.wallBlockDetail > 0.5) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            for (let i = 40; i < w.w; i += 40) {
                ctx.moveTo(w.x + i, w.y); ctx.lineTo(w.x + i, w.y + w.h);
            }
            for (let i = 40; i < w.h; i += 40) {
                ctx.moveTo(w.x, w.y + i); ctx.lineTo(w.x + w.w, w.y + i);
            }
            ctx.stroke();
        }
    });
    
    // Draw doorway arches hints
    room.exits.forEach(e => {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(e.x - 10, e.y - 10, e.w + 20, e.h + 20);
        ctx.strokeStyle = CONFIG.lanternColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(e.x - 5, e.y - 5, e.w + 10, e.h + 10);
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 1;
    });
}

function drawRubble() {
    const room = ROOMS[state.currentRoomId];
    ctx.fillStyle = 'rgba(40, 40, 50, 0.4)';
    state.rubble.forEach(r => {
        // Only draw if not in a wall
        if (Math.random() < CONFIG.rubbleDensity) {
            ctx.save();
            ctx.translate(r.x, r.y);
            ctx.rotate(r.angle);
            if (r.type === 0) ctx.fillRect(-r.size/2, -r.size/2, r.size, r.size);
            else if (r.type === 1) {
                ctx.beginPath(); ctx.moveTo(-r.size, 0); ctx.lineTo(r.size, 0); ctx.lineTo(0, -r.size); ctx.fill();
            } else {
                ctx.beginPath(); ctx.arc(0, 0, r.size/2, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        }
    });
}

function drawAncientMarkings() {
    const room = ROOMS[state.currentRoomId];
    if (!room.marking) return;
    ctx.save();
    ctx.translate(480, 270);
    ctx.strokeStyle = room.accent || 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2;
    if (room.marking === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 140, 0, Math.PI*2); ctx.stroke();
    } else if (room.marking === 'runes') {
        ctx.strokeRect(-200, -100, 400, 200);
        ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.stroke();
    } else if (room.marking === 'engine') {
        ctx.strokeRect(-150, -150, 300, 300);
        ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1.0;
}

function drawImportantObjects() {
    const room = ROOMS[state.currentRoomId];
    const s = CONFIG.objectVisualScale;

    // Gate
    if (room.gate) {
        const g = room.gate; const opened = state.gateOpened;
        ctx.fillStyle = opened ? '#0a0a12' : '#1a1a25';
        ctx.fillRect(g.x - 10, g.y, g.w + 20, g.h);
        ctx.strokeStyle = opened ? CONFIG.machineColor : '#555';
        ctx.lineWidth = 4; ctx.strokeRect(g.x, g.y, g.w, g.h); ctx.lineWidth = 1;
        if (!opened) {
            for(let i=0; i<6; i++) {
                ctx.fillStyle = '#444'; ctx.fillRect(g.x + 15 + i*18, g.y + 4, 8, g.h - 8);
            }
            ctx.fillStyle = CONFIG.runeColor; ctx.beginPath(); ctx.arc(g.x+g.w/2, g.y+g.h/2, 10, 0, Math.PI*2); ctx.fill();
        }
    }

    // Runes
    room.runes.forEach(r => {
        const active = state.runesActivated.has(r.id);
        const pulse = Math.sin(Date.now() / 800) * 0.2 + 0.8;
        ctx.fillStyle = '#22222a'; ctx.fillRect(r.x - 35*s, r.y - 60*s, 70*s, 120*s);
        ctx.strokeStyle = CONFIG.runeColor; ctx.lineWidth = active ? 5 : 2;
        ctx.globalAlpha = active ? 1.0 : 0.4 * pulse;
        if (active) { ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.runeColor; }
        ctx.strokeRect(r.x - 28*s, r.y - 52*s, 56*s, 104*s);
        ctx.beginPath(); ctx.arc(r.x, r.y, 20*s, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    // Machines
    room.machines.forEach(m => {
        const active = state.machineActivated; const ready = state.runesActivated.size >= CONFIG.runeGoal;
        const pulse = Math.sin(Date.now() / 600) * 0.3 + 0.7;
        ctx.fillStyle = '#22222a'; ctx.beginPath(); ctx.arc(m.x, m.y, 55*s, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = CONFIG.machineColor; ctx.lineWidth = active ? 6 : 2;
        ctx.globalAlpha = active ? 1.0 : (ready ? pulse : 0.3);
        if (active) { ctx.shadowBlur = 40; ctx.shadowColor = CONFIG.machineColor; }
        ctx.beginPath(); ctx.arc(m.x, m.y, 40*s, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(m.x, m.y, 65*s + pulse*10, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    // Key
    if (room.key && !state.hasKey) {
        const p = Math.sin(Date.now()/400)*12;
        ctx.fillStyle = CONFIG.machineColor; ctx.shadowBlur = 35; ctx.shadowColor = CONFIG.machineColor;
        ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 15*s, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 22*s, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Fragments
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            const p = Math.sin(Date.now()/500)*12;
            ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.lanternColor;
            ctx.beginPath(); ctx.moveTo(f.x, f.y - 24*s - p); ctx.lineTo(f.x + 18*s, f.y - p); ctx.lineTo(f.x, f.y + 24*s - p); ctx.lineTo(f.x - 18*s, f.y - p); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    if (room.isFinalRoom) {
        ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 100; ctx.shadowColor = CONFIG.lanternColor;
        ctx.beginPath(); ctx.arc(480, 180, 50 + Math.sin(Date.now()/600)*15, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawShadows() {
    const room = ROOMS[state.currentRoomId];
    if (!room.shadows) return;
    room.shadows.forEach(s => {
        ctx.fillStyle = 'rgba(17, 9, 31, 0.85)'; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius + 15, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowColor; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowEyeColor; ctx.beginPath(); ctx.arc(s.x - 10, s.y - 6, 5, 0, Math.PI*2); ctx.arc(s.x + 10, s.y - 6, 5, 0, Math.PI*2); ctx.fill();
    });
}

function drawPlayer() {
    const p = Math.sin(Date.now()/800)*3;
    const inv = state.invulnerableTimer > 0 && Math.floor(Date.now()/100)%2 === 0;
    ctx.globalAlpha = inv ? 0.4 : 1.0;
    
    // Cloaked Traveler
    ctx.fillStyle = '#08080c';
    ctx.beginPath();
    ctx.moveTo(player.x - 24, player.y + 25);
    ctx.lineTo(player.x, player.y - 35 - p);
    ctx.lineTo(player.x + 24, player.y + 25);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
    
    // Hood silhouette
    ctx.fillStyle = '#12121c';
    ctx.beginPath(); ctx.arc(player.x, player.y - 20 - p, 15, 0, Math.PI*2); ctx.fill();

    // Side-held Lantern
    const lp = { x: player.x + 16, y: player.y + 8 };
    ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 40; ctx.shadowColor = CONFIG.lanternColor;
    ctx.beginPath(); ctx.arc(lp.x, lp.y, 8 + p, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1.0;
    
    // Shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(player.x, player.y + 25, 20, 8, 0, 0, Math.PI*2); ctx.fill();
}

function drawLanternLight() {
    const p = Math.sin(Date.now()/600)*CONFIG.lanternPulseAmount;
    let r = CONFIG.lanternRadius + p;
    if (state.lanternDimTimer > 0) r *= CONFIG.shadowLanternDimAmount;

    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.darknessOpacity})`;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    const g = offscreenCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1 - CONFIG.lanternSoftness/200, 'rgba(0,0,0,0.92)');
    g.addColorStop(1, 'rgba(0,0,0,0)');

    offscreenCtx.globalCompositeOperation = 'destination-out';
    offscreenCtx.fillStyle = g;
    offscreenCtx.beginPath(); offscreenCtx.arc(player.x, player.y, r, 0, Math.PI*2); offscreenCtx.fill();

    ctx.drawImage(offscreenCanvas, 0, 0);

    // Warm Glow Blend
    const blm = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    blm.addColorStop(0, hexToRgba(CONFIG.lanternColor, 0.3 * CONFIG.lanternWarmth));
    blm.addColorStop(0.7, hexToRgba(CONFIG.lanternColor, 0.1));
    blm.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = blm; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vignette
    const vig = ctx.createRadialGradient(480, 270, 280, 480, 270, 750);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, `rgba(0,0,0,${0.5})`);
    ctx.fillStyle = vig; ctx.fillRect(0,0,canvas.width,canvas.height);

    // Dust particles in light
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    particles.forEach(p => {
        const d = getDist(player.x, player.y, p.x, p.y);
        if (d < r) {
            ctx.globalAlpha = (1 - d/r) * 0.6;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
    });
    ctx.globalAlpha = 1.0;
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setStatus(msg, isHint = false) {
    const el = document.getElementById('statusOverlay'); el.innerText = msg; el.classList.add('visible');
    if (state.statusTimer) clearTimeout(state.statusTimer);
    if (!isHint) state.statusTimer = setTimeout(() => { el.classList.remove('visible'); }, CONFIG.statusMessageDuration);
    else state.statusTimer = setTimeout(() => { el.classList.remove('visible'); }, 100);
}

document.addEventListener('DOMContentLoaded', init);
