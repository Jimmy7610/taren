// ==================================================
// INSTÄLLNINGAR FÖR THE LANTERN BELOW
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWorldWidth: 960, // INSTÄLLNING - Ändra den interna bredden på spelvärlden.
    canvasWorldHeight: 540, // INSTÄLLNING - Ändra den interna höjden på spelvärlden.
    playerSpeed: 185, // INSTÄLLNING - Ändra hur snabbt spelaren rör sig.
    playerRadius: 18, // INSTÄLLNING - Ändra spelarens storlek (större för Build 28).
    lanternRadius: 250, // INSTÄLLNING - Ändra hur långt lyktan lyser runt spelaren.
    lanternSoftness: 150, // INSTÄLLNING - Ändra hur mjuk kanten på lyktljuset är.
    lanternPulseAmount: 10, // INSTÄLLNING - Ändra hur mycket lyktskenet pulserar.
    darknessOpacity: 0.58, // INSTÄLLNING - Ändra hur mörk overlayen är utanför lyktan. Lägre värde = mer synligt rum.
    ambientRoomLight: 0.22, // INSTÄLLNING - Ändra hur mycket av rummet som syns även utanför lyktan. Högre värde = mindre svart skärm.
    visibleFloorContrast: 0.42, // INSTÄLLNING - Ändra hur tydligt stenplattor och golvdetaljer syns.
    wallVisibility: 0.65, // INSTÄLLNING - Ändra hur tydligt väggar och rumskanter syns i mörkret.
    fragmentGoal: 7, // INSTÄLLNING - Ändra hur många ljusfragment som behövs.
    runeGoal: 3, // INSTÄLLNING - Ändra hur många runstenar som krävs.
    interactionRadius: 52, // INSTÄLLNING - Ändra hur nära spelaren måste vara för att interagera.
    doorTransitionPadding: 40, // INSTÄLLNING - Ändra hur långt in spelaren placeras efter rumsbyte.
    statusMessageDuration: 2500, // INSTÄLLNING - Ändra hur länge statusmeddelanden visas.
    machineGlowWhenAwakened: 1.8, // INSTÄLLNING - Ändra hur starkt maskinen lyser när den är aktiverad.
    particleCount: 60, // INSTÄLLNING - Ändra mängden damm-/ljuspartiklar.
    runePulseSpeed: 1.5, // INSTÄLLNING - Ändra hur snabbt runstenen pulserar.
    machinePulseSpeed: 1.2, // INSTÄLLNING - Ändra hur snabbt maskinen pulserar.
    lanternColor: '#f5d38a', // INSTÄLLNING - Ändra färgen på lyktans varma ljus.
    runeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på runstenen.
    machineColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på maskinen.
    tileColor: '#1a1a20', // INSTÄLLNING - Grundfärg för stengolv.
    wallColor: '#252530', // INSTÄLLNING - Grundfärg för stenväggar.
    
    // Visual Polish
    lanternCoreGlow: 1.0, 
    lanternOuterGlow: 0.65, 
    vignetteStrength: 0.45, 
    floorDetailOpacity: 0.45, 
    fogOpacity: 0.15,
    roomGlowIntensity: 0.5,
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
            { x: 0, y: 0, w: 430, h: 40 }, { x: 530, y: 0, w: 430, h: 40 },
            { x: 0, y: 500, w: 960, h: 40 },
            { x: 0, y: 0, w: 40, h: 540 },
            { x: 920, y: 0, w: 40, h: 540 },
            { x: 220, y: 150, w: 30, h: 240 },
            { x: 710, y: 150, w: 30, h: 240 },
        ],
        exits: [{ x: 430, y: -20, w: 100, h: 60, target: 'rune_hall', entryX: 480, entryY: 460 }],
        fragments: [{ id: 'f1', x: 480, y: 270 }],
        runes: [],
        machines: [],
        key: null,
        gate: null,
        shadows: []
    },
    rune_hall: {
        name: 'The Hall of Runes',
        walls: [
            { x: 0, y: 0, w: 960, h: 40 },
            { x: 0, y: 500, w: 430, h: 40 }, { x: 530, y: 500, w: 430, h: 40 },
            { x: 0, y: 0, w: 40, h: 220 }, { x: 0, y: 320, w: 40, h: 220 },
            { x: 920, y: 0, w: 40, h: 220 }, { x: 920, y: 320, w: 40, h: 220 },
        ],
        exits: [
            { x: 430, y: 500, w: 100, h: 60, target: 'start_chamber', entryX: 480, entryY: 80 },
            { x: 920, y: 220, w: 60, h: 100, target: 'machine_room', entryX: 100, entryY: 270 },
            { x: -20, y: 220, w: 60, h: 100, target: 'fragment_vault', entryX: 860, entryY: 270 },
        ],
        fragments: [{ id: 'f2', x: 200, y: 400 }, { id: 'f3', x: 760, y: 400 }],
        runes: [{ id: 'r1', x: 250, y: 150, activated: false }, { id: 'r2', x: 710, y: 150, activated: false }],
        machines: [],
        key: null,
        gate: null,
        shadows: [{ x: 480, y: 200, points: [{x: 480, y: 150}, {x: 480, y: 350}], pIndex: 0 }]
    },
    fragment_vault: {
        name: 'The Echo Vault',
        walls: [
            { x: 0, y: 0, w: 960, h: 40 },
            { x: 0, y: 500, w: 960, h: 40 },
            { x: 0, y: 0, w: 40, h: 540 },
            { x: 920, y: 0, w: 40, h: 220 }, { x: 920, y: 320, w: 40, h: 220 },
        ],
        exits: [{ x: 920, y: 220, w: 60, h: 100, target: 'rune_hall', entryX: 100, entryY: 270 }],
        fragments: [{ id: 'f4', x: 140, y: 420 }, { id: 'f5', x: 220, y: 120 }],
        runes: [],
        machines: [],
        key: { x: 480, y: 270, collected: false },
        gate: null,
        shadows: [{ x: 120, y: 270, points: [{x: 120, y: 270}, {x: 420, y: 270}], pIndex: 0 }]
    },
    machine_room: {
        name: 'The Deep Engine',
        walls: [
            { x: 0, y: 0, w: 430, h: 40 }, { x: 530, y: 0, w: 430, h: 40 },
            { x: 0, y: 500, w: 430, h: 40 }, { x: 530, y: 500, w: 430, h: 40 },
            { x: 0, y: 0, w: 40, h: 220 }, { x: 0, y: 320, w: 40, h: 220 },
            { x: 920, y: 0, w: 40, h: 540 },
        ],
        exits: [
            { x: -20, y: 220, w: 60, h: 100, target: 'rune_hall', entryX: 860, entryY: 270 },
            { x: 430, y: 500, w: 100, h: 60, target: 'start_chamber', entryX: 480, entryY: 80 },
            { x: 430, y: -20, w: 100, h: 60, target: 'lower_gate', entryX: 480, entryY: 460, requiresGate: true },
        ],
        fragments: [{ id: 'f6', x: 200, y: 400 }],
        runes: [{ id: 'r3', x: 480, y: 420, activated: false }],
        machines: [{ id: 'm1', x: 480, y: 250, activated: false }],
        key: null,
        gate: { x: 430, y: 0, w: 100, h: 45, opened: false },
        shadows: [{ x: 750, y: 150, points: [{x: 750, y: 150}, {x: 750, y: 400}], pIndex: 0 }]
    },
    lower_gate: {
        name: 'The Lower Light',
        walls: [
            { x: 0, y: 0, w: 960, h: 40 },
            { x: 0, y: 500, w: 430, h: 40 }, { x: 530, y: 500, w: 430, h: 40 },
            { x: 0, y: 0, w: 40, h: 540 },
            { x: 920, y: 0, w: 40, h: 540 },
        ],
        exits: [{ x: 430, y: 500, w: 100, h: 60, target: 'machine_room', entryX: 480, entryY: 80 }],
        fragments: [{ id: 'f7', x: 480, y: 180 }],
        runes: [],
        machines: [],
        key: null,
        gate: null,
        isFinalRoom: true,
        shadows: []
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
    collectionEffect: 0
};

let player = {
    x: 480,
    y: 400,
    vx: 0,
    vy: 0,
    radius: CONFIG.playerRadius,
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

    window.addEventListener('keydown', (e) => handleInput(e, true));
    window.addEventListener('keyup', (e) => handleInput(e, false));
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);

    validateAdventureContent();
    updateHUD();
}

function validateAdventureContent() {
    let totalF = 0; let totalR = 0; let totalK = 0;
    Object.values(ROOMS).forEach(r => {
        totalF += r.fragments.length; totalR += r.runes.length;
        if (r.key) totalK++;
    });
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
    setStatus("System reset.");
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

// Rendering
function render() {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStoneFloor();
    drawObjects();
    drawShadows();
    drawPlayer();
    drawLanternLight();
}

function drawStoneFloor() {
    const t = 80;
    for (let x = 0; x < canvas.width; x += t) {
        for (let y = 0; y < canvas.height; y += t) {
            ctx.fillStyle = CONFIG.tileColor;
            ctx.fillRect(x, y, t, t);
            ctx.strokeStyle = `rgba(255,255,255, ${0.05 * CONFIG.visibleFloorContrast})`;
            ctx.strokeRect(x, y, t, t);
            if ((x+y) % 17 === 0) {
                ctx.fillStyle = `rgba(255,255,255, ${0.08 * CONFIG.visibleFloorContrast})`;
                ctx.fillRect(x + 20, y + 30, 40, 1);
                ctx.fillRect(x + 20, y + 30, 1, 20);
            }
        }
    }
}

function drawObjects() {
    const room = ROOMS[state.currentRoomId];
    
    // Walls with Depth
    room.walls.forEach(w => {
        ctx.fillStyle = CONFIG.wallColor;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = `rgba(255,255,255, ${0.15 * CONFIG.wallVisibility})`;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = 'rgba(255,255,255, 0.05)';
        ctx.fillRect(w.x, w.y, w.w, 4); // Top highlight
        ctx.fillStyle = 'rgba(0,0,0, 0.2)';
        ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4); // Bottom shadow
    });

    // Gate
    if (room.gate) {
        const g = room.gate; const opened = state.gateOpened;
        ctx.fillStyle = opened ? '#0a0a12' : '#1a1a25';
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.strokeStyle = opened ? CONFIG.machineColor : '#555';
        ctx.lineWidth = 3; ctx.strokeRect(g.x, g.y, g.w, g.h); ctx.lineWidth = 1;
        if (!opened) {
            for(let i=0; i<6; i++) {
                ctx.fillStyle = '#444'; ctx.fillRect(g.x + 15 + i*18, g.y + 4, 6, g.h - 8);
            }
        } else {
            ctx.shadowBlur = 20; ctx.shadowColor = CONFIG.machineColor;
            ctx.strokeStyle = CONFIG.machineColor; ctx.strokeRect(g.x, g.y, g.w, g.h); ctx.shadowBlur = 0;
        }
    }

    // Runes
    room.runes.forEach(r => {
        const active = state.runesActivated.has(r.id);
        const pulse = Math.sin(Date.now() / 800) * 0.2 + 0.8;
        ctx.fillStyle = '#22222a'; ctx.fillRect(r.x - 30, r.y - 50, 60, 100);
        ctx.strokeStyle = CONFIG.runeColor; ctx.lineWidth = active ? 4 : 2;
        ctx.globalAlpha = active ? 1.0 : 0.4 * pulse;
        if (active) { ctx.shadowBlur = 25; ctx.shadowColor = CONFIG.runeColor; }
        ctx.strokeRect(r.x - 22, r.y - 42, 44, 84);
        ctx.beginPath(); ctx.arc(r.x, r.y, 15, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    // Machines
    room.machines.forEach(m => {
        const active = state.machineActivated; const ready = state.runesActivated.size >= CONFIG.runeGoal;
        const pulse = Math.sin(Date.now() / 600) * 0.3 + 0.7;
        ctx.fillStyle = '#22222a'; ctx.beginPath(); ctx.arc(m.x, m.y, 45, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = CONFIG.machineColor; ctx.lineWidth = active ? 5 : 2;
        ctx.globalAlpha = active ? 1.0 : (ready ? pulse : 0.3);
        if (active) { ctx.shadowBlur = 35; ctx.shadowColor = CONFIG.machineColor; }
        ctx.beginPath(); ctx.arc(m.x, m.y, 35, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(m.x, m.y, 55 + pulse*10, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    // Key
    if (room.key && !state.hasKey) {
        const p = Math.sin(Date.now()/400)*10;
        ctx.fillStyle = CONFIG.machineColor; ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.machineColor;
        ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 12, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 18, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Fragments
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            const p = Math.sin(Date.now()/500)*10;
            ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.lanternColor;
            ctx.beginPath(); ctx.moveTo(f.x, f.y - 20 - p); ctx.lineTo(f.x + 14, f.y - p); ctx.lineTo(f.x, f.y + 20 - p); ctx.lineTo(f.x - 14, f.y - p); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    if (room.isFinalRoom) {
        ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 80; ctx.shadowColor = CONFIG.lanternColor;
        ctx.beginPath(); ctx.arc(480, 180, 40 + Math.sin(Date.now()/600)*10, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
}

function drawShadows() {
    const room = ROOMS[state.currentRoomId];
    if (!room.shadows) return;
    room.shadows.forEach(s => {
        ctx.fillStyle = 'rgba(17, 9, 31, 0.8)'; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius + 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowColor; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowEyeColor; ctx.beginPath(); ctx.arc(s.x - 8, s.y - 5, 4, 0, Math.PI*2); ctx.arc(s.x + 8, s.y - 5, 4, 0, Math.PI*2); ctx.fill();
    });
}

function drawPlayer() {
    const p = Math.sin(Date.now()/800)*2;
    const inv = state.invulnerableTimer > 0 && Math.floor(Date.now()/100)%2 === 0;
    ctx.globalAlpha = inv ? 0.4 : 1.0;
    
    ctx.fillStyle = '#08080c';
    ctx.beginPath(); ctx.moveTo(player.x - 20, player.y + 20); ctx.lineTo(player.x, player.y - 25 - p); ctx.lineTo(player.x + 20, player.y + 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.fillStyle = '#101018'; ctx.beginPath(); ctx.arc(player.x, player.y - 15 - p, 12, 0, Math.PI*2); ctx.fill();

    const lp = { x: player.x + 12, y: player.y + 5 };
    ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.lanternColor;
    ctx.beginPath(); ctx.arc(lp.x, lp.y, 6 + p, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1.0;
}

function drawLanternLight() {
    const p = Math.sin(Date.now()/600)*CONFIG.lanternPulseAmount;
    let r = CONFIG.lanternRadius + p;
    if (state.lanternDimTimer > 0) r *= CONFIG.shadowLanternDimAmount;

    // Build 28 Ambient Light Logic
    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.darknessOpacity})`;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    const g = offscreenCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1 - CONFIG.lanternSoftness/200, 'rgba(0,0,0,0.9)');
    g.addColorStop(1, 'rgba(0,0,0,0)');

    offscreenCtx.globalCompositeOperation = 'destination-out';
    offscreenCtx.fillStyle = g;
    offscreenCtx.beginPath(); offscreenCtx.arc(player.x, player.y, r, 0, Math.PI*2); offscreenCtx.fill();

    ctx.drawImage(offscreenCanvas, 0, 0);

    // Warm Glow Blend
    const blm = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    blm.addColorStop(0, hexToRgba(CONFIG.lanternColor, 0.25));
    blm.addColorStop(0.7, hexToRgba(CONFIG.lanternColor, 0.1));
    blm.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = blm; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vignette
    const vig = ctx.createRadialGradient(480, 270, 250, 480, 270, 700);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, `rgba(0,0,0,${CONFIG.vignetteStrength})`);
    ctx.fillStyle = vig; ctx.fillRect(0,0,canvas.width,canvas.height);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.addEventListener('DOMContentLoaded', init);
