// ==================================================
// INSTÄLLNINGAR FÖR THE LANTERN BELOW
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWorldWidth: 960, // INSTÄLLNING - Ändra den interna bredden på spelvärlden.
    canvasWorldHeight: 540, // INSTÄLLNING - Ändra den interna höjden på spelvärlden.
    playerSpeed: 185, // INSTÄLLNING - Ändra hur snabbt spelaren rör sig.
    playerRadius: 12, // INSTÄLLNING - Ändra spelarens storlek.
    lanternRadius: 180, // INSTÄLLNING - Ändra hur långt lyktan lyser runt spelaren.
    lanternSoftness: 95, // INSTÄLLNING - Ändra hur mjuk kanten på ljuset är.
    lanternPulseAmount: 10, // INSTÄLLNING - Ändra hur mycket lyktskenet pulserar.
    darknessOpacity: 0.88, // INSTÄLLNING - Ändra hur mörkt området utanför lyktan är.
    fragmentGoal: 7, // INSTÄLLNING - Ändra hur många ljusfragment som behövs.
    runeGoal: 3, // INSTÄLLNING - Ändra hur många runstenar som krävs.
    interactionRadius: 48, // INSTÄLLNING - Ändra hur nära spelaren måste vara för att interagera.
    doorTransitionPadding: 32, // INSTÄLLNING - Ändra hur långt in spelaren placeras efter rumsbyte.
    statusMessageDuration: 2500, // INSTÄLLNING - Ändra hur länge statusmeddelanden visas.
    machineGlowWhenAwakened: 1.8, // INSTÄLLNING - Ändra hur starkt maskinen lyser när den är aktiverad.
    particleCount: 56, // INSTÄLLNING - Ändra mängden damm-/ljuspartiklar.
    runePulseSpeed: 1.5, // INSTÄLLNING - Ändra hur snabbt runstenen pulserar.
    machinePulseSpeed: 1.2, // INSTÄLLNING - Ändra hur snabbt maskinen pulserar.
    lanternColor: '#f5d38a', // INSTÄLLNING - Ändra färgen på lyktans varma ljus.
    runeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på runstenen.
    machineColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på maskinen.
    tileColor: '#0a0a0c', // INSTÄLLNING - Ändra färgen på golvplattorna.
    wallColor: '#121216', // INSTÄLLNING - Ändra färgen på väggarna.
    
    // BUILD 27 - Visual Upgrade Settings
    lanternCoreGlow: 1.0, // INSTÄLLNING - Ändra styrkan på lyktans varma kärnglöd.
    lanternOuterGlow: 0.55, // INSTÄLLNING - Ändra styrkan på det yttre ljuset runt lyktan.
    lanternDustVisibility: 0.7, // INSTÄLLNING - Ändra hur tydligt dammpartiklar syns i lyktljuset.
    vignetteStrength: 0.55, // INSTÄLLNING - Ändra hur mörka kanterna i spelvyn är.
    floorDetailOpacity: 0.35, // INSTÄLLNING - Ändra hur tydliga sprickor och golvdetaljer är.
    fogOpacity: 0.18, // INSTÄLLNING - Ändra hur tydlig dimman är i mörka rum.
    sparkleCount: 14, // INSTÄLLNING - Ändra mängden små glittrande partiklar runt magiska objekt.
    roomGlowIntensity: 0.45, // INSTÄLLNING - Ändra styrkan på rummens violetta/cyana atmosfärsglöd.
    
    // Shadow & Collision Settings
    shadowSpeed: 58, // INSTÄLLNING - Ändra hur snabbt skuggorna rör sig.
    shadowRadius: 20, // INSTÄLLNING - Ändra hur stor träffyta skuggorna har.
    shadowInvulnerabilityDuration: 1400, // INSTÄLLNING - Ändra hur länge spelaren är skyddad efter att ha träffats av en skugga.
    shadowColor: '#11091f', // INSTÄLLNING - Ändra skuggornas grundfärg.
    shadowEyeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på skuggornas svaga ögon/glöd.
    shadowLanternDimDuration: 2200, // INSTÄLLNING - Ändra hur länge lyktan blir svagare efter skuggträff.
    shadowLanternDimAmount: 0.68, // INSTÄLLNING - Ändra hur mycket lyktans ljus minskar efter skuggträff.
    gateOpenGlow: 1.6, // INSTÄLLNING - Ändra hur starkt porten lyser när den öppnas.
    runeActivatedGlow: 1.7, // INSTÄLLNING - Ändra hur starkt aktiverade runor lyser.
    ambientParticleBoost: 1.25, // INSTÄLLNING - Ändra mängden extra atmosfäriska partiklar.
};

// Rooms Data
const ROOMS = {
    start_chamber: {
        name: 'The Descent',
        walls: [
            { x: 0, y: 0, w: 430, h: 20 }, { x: 530, y: 0, w: 430, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 540 },
            { x: 200, y: 150, w: 20, h: 240 },
            { x: 740, y: 150, w: 20, h: 240 },
        ],
        exits: [{ x: 430, y: -20, w: 100, h: 40, target: 'rune_hall', entryX: 480, entryY: 480 }],
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
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 430, h: 20 }, { x: 530, y: 520, w: 430, h: 20 },
            { x: 0, y: 0, w: 20, h: 220 }, { x: 0, y: 320, w: 20, h: 220 },
            { x: 940, y: 0, w: 20, h: 220 }, { x: 940, y: 320, w: 20, h: 220 },
        ],
        exits: [
            { x: 430, y: 520, w: 100, h: 40, target: 'start_chamber', entryX: 480, entryY: 60 },
            { x: 940, y: 220, w: 40, h: 100, target: 'machine_room', entryX: 60, entryY: 270 },
            { x: -20, y: 220, w: 40, h: 100, target: 'fragment_vault', entryX: 900, entryY: 270 },
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
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 220 }, { x: 940, y: 320, w: 20, h: 220 },
        ],
        exits: [{ x: 940, y: 220, w: 40, h: 100, target: 'rune_hall', entryX: 60, entryY: 270 }],
        fragments: [{ id: 'f4', x: 100, y: 440 }, { id: 'f5', x: 200, y: 100 }],
        runes: [],
        machines: [],
        key: { x: 480, y: 270, collected: false },
        gate: null,
        shadows: [{ x: 100, y: 270, points: [{x: 100, y: 270}, {x: 400, y: 270}], pIndex: 0 }]
    },
    machine_room: {
        name: 'The Deep Engine',
        walls: [
            { x: 0, y: 0, w: 430, h: 20 }, { x: 530, y: 0, w: 430, h: 20 },
            { x: 0, y: 520, w: 430, h: 20 }, { x: 530, y: 520, w: 430, h: 20 },
            { x: 0, y: 0, w: 20, h: 220 }, { x: 0, y: 320, w: 20, h: 220 },
            { x: 940, y: 0, w: 20, h: 540 },
        ],
        exits: [
            { x: -20, y: 220, w: 40, h: 100, target: 'rune_hall', entryX: 900, entryY: 270 },
            { x: 430, y: 520, w: 100, h: 40, target: 'start_chamber', entryX: 480, entryY: 60 },
            { x: 430, y: -20, w: 100, h: 40, target: 'lower_gate', entryX: 480, entryY: 480, requiresGate: true },
        ],
        fragments: [{ id: 'f6', x: 150, y: 400 }],
        runes: [{ id: 'r3', x: 480, y: 440, activated: false }],
        machines: [{ id: 'm1', x: 480, y: 270, activated: false }],
        key: null,
        gate: { x: 430, y: 0, w: 100, h: 25, opened: false },
        shadows: [{ x: 700, y: 100, points: [{x: 700, y: 100}, {x: 700, y: 400}], pIndex: 0 }]
    },
    lower_gate: {
        name: 'The Lower Light',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 430, h: 20 }, { x: 530, y: 520, w: 430, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 540 },
        ],
        exits: [{ x: 430, y: 520, w: 100, h: 40, target: 'machine_room', entryX: 480, entryY: 60 }],
        fragments: [{ id: 'f7', x: 480, y: 150 }],
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
    
    // BUILD 27 - Polish state
    collectionEffect: 0, // Collection animation timer
    sparkles: []
};

let player = {
    x: 480,
    y: 400,
    vx: 0,
    vy: 0,
    radius: CONFIG.playerRadius,
};

const input = {
    up: false, down: false, left: false, right: false,
    interact: false,
    interactPressed: false
};

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

    const pCount = Math.floor(CONFIG.particleCount * CONFIG.ambientParticleBoost);
    for (let i = 0; i < pCount; i++) {
        particles.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
            angle: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < CONFIG.sparkleCount; i++) {
        state.sparkles.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 1.5,
            alpha: Math.random(),
            speed: Math.random() * 0.2 + 0.1
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
    let totalF = 0; let totalR = 0; let totalK = 0; let hasMachine = false; let hasGate = false;
    Object.values(ROOMS).forEach(r => {
        totalF += r.fragments.length; totalR += r.runes.length;
        if (r.key) totalK++; if (r.machines.length > 0) hasMachine = true; if (r.gate) hasGate = true;
    });
    if (totalF !== 7) console.warn(`Content Error: Found ${totalF} fragments, expected 7.`);
    if (totalR !== 3) console.warn(`Content Error: Found ${totalR} runes, expected 3.`);
}

function startGame() {
    state.started = true;
    document.getElementById('startScreen').classList.add('hidden');
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    state = {
        ...state,
        started: true,
        currentRoomId: 'start_chamber',
        fragmentsCollected: new Set(),
        runesActivated: new Set(),
        hasKey: false,
        gateOpened: false,
        machineActivated: false,
        completed: false,
        statusText: '',
        statusTimer: null,
        lastTime: performance.now(),
        invulnerableTimer: 0,
        lanternDimTimer: 0,
        collectionEffect: 0
    };
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
    if (key === 'e') {
        if (isDown && !input.interact) input.interactPressed = true;
        input.interact = isDown;
    }
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
    if (state.collectionEffect > 0) state.collectionEffect -= dt;

    particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = CONFIG.canvasWorldWidth;
        if (p.x > CONFIG.canvasWorldWidth) p.x = 0;
        if (p.y < 0) p.y = CONFIG.canvasWorldHeight;
        if (p.y > CONFIG.canvasWorldHeight) p.y = 0;
    });

    state.sparkles.forEach(s => {
        s.alpha = (Math.sin(Date.now() / 300) + 1) / 2;
    });

    input.interactPressed = false;
}

function updatePlayer(dt) {
    player.vx = 0; player.vy = 0;
    if (input.up) player.vy = -CONFIG.playerSpeed;
    if (input.down) player.vy = CONFIG.playerSpeed;
    if (input.left) player.vx = -CONFIG.playerSpeed;
    if (input.right) player.vx = CONFIG.playerSpeed;
    const nx = player.x + player.vx * dt;
    const ny = player.y + player.vy * dt;
    if (!checkCollision(nx, player.y)) player.x = nx;
    if (!checkCollision(player.x, ny)) player.y = ny;
}

function updateShadows(dt) {
    const room = ROOMS[state.currentRoomId];
    if (!room.shadows) return;
    room.shadows.forEach(s => {
        const target = s.points[s.pIndex];
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) { s.pIndex = (s.pIndex + 1) % s.points.length; }
        else { s.x += (dx / dist) * CONFIG.shadowSpeed * dt; s.y += (dy / dist) * CONFIG.shadowSpeed * dt; }
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
            if (exit.requiresGate && !state.gateOpened) { setStatus("The gate is sealed.", true); continue; }
            changeRoom(exit.target, exit.entryX, exit.entryY);
            break;
        }
        const distToExit = getDist(player.x, player.y, exit.x + exit.w/2, exit.y + exit.h/2);
        if (distToExit < 60) {
            if (exit.requiresGate && !state.gateOpened) setStatus("The gate needs a key.", true);
            else setStatus("Passage", true);
        }
    }
}

function changeRoom(roomId, x, y) {
    state.currentRoomId = roomId;
    player.x = x; player.y = y;
    state.invulnerableTimer = 500;
    updateHUD();
}

function handleInteractions() {
    const room = ROOMS[state.currentRoomId];
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            if (getDist(player.x, player.y, f.x, f.y) < player.radius + 15) {
                state.fragmentsCollected.add(f.id);
                state.collectionEffect = 0.6;
                setStatus("Light fragment collected.");
                updateHUD(); checkCompletion();
            }
        }
    });
    if (room.key && !state.hasKey) {
        if (getDist(player.x, player.y, room.key.x, room.key.y) < player.radius + 15) {
            state.hasKey = true; setStatus("Ancient key found."); updateHUD();
        }
    }
    room.runes.forEach(r => {
        if (!state.runesActivated.has(r.id)) {
            if (getDist(player.x, player.y, r.x, r.y) < CONFIG.interactionRadius) {
                if (input.interactPressed) {
                    state.runesActivated.add(r.id); setStatus(`Rune awakened. (${state.runesActivated.size}/3)`); updateHUD();
                } else setStatus("Press E to activate rune.", true);
            }
        }
    });
    if (room.gate && !state.gateOpened) {
        if (getDist(player.x, player.y, room.gate.x + room.gate.w/2, room.gate.y + room.gate.h/2) < CONFIG.interactionRadius + 10) {
            if (state.hasKey) {
                if (input.interactPressed) { state.gateOpened = true; setStatus("The gate opens."); updateHUD(); }
                else setStatus("Press E to open gate.", true);
            } else setStatus("The gate needs a key.", true);
        }
    }
    room.machines.forEach(m => {
        if (getDist(player.x, player.y, m.x, m.y) < CONFIG.interactionRadius) {
            if (state.runesActivated.size >= CONFIG.runeGoal) {
                if (!state.machineActivated) {
                    if (input.interactPressed) { state.machineActivated = true; setStatus("The lower mechanism awakens."); updateHUD(); checkCompletion(); }
                    else setStatus("Press E to awaken machine.", true);
                }
            } else setStatus("The machine waits for three runes.", true);
        }
    });
    if (room.isFinalRoom && getDist(player.x, player.y, 480, 150) < 40) {
        if (state.fragmentsCollected.size >= CONFIG.fragmentGoal && state.machineActivated) winGame();
        else setStatus("The path is still dark. Collect fragments.", true);
    }
}

function checkCompletion() {
    if (state.fragmentsCollected.size >= CONFIG.fragmentGoal && state.machineActivated) {
        document.getElementById('gameSubtitle').innerText = "The path is clear. Reach the light.";
    }
}

function winGame() {
    state.completed = true;
    document.getElementById('winScreen').classList.remove('hidden');
    setStatus("You found the lower light.");
}

function getDist(x1, y1, x2, y2) { return Math.sqrt((x1-x2)**2 + (y1-y2)**2); }

function setStatus(msg, isHint = false) {
    const el = document.getElementById('statusOverlay');
    el.innerText = msg; el.classList.add('visible');
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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFloor();
    drawObjects();
    drawShadows();
    drawPlayer();
    drawLanternLight();
}

function drawFloor() {
    ctx.fillStyle = CONFIG.tileColor;
    const t = 60;
    for (let x = 0; x < canvas.width; x += t) {
        for (let y = 0; y < canvas.height; y += t) {
            ctx.strokeStyle = 'rgba(255,255,255,0.015)';
            ctx.strokeRect(x, y, t, t);
            if ((x * y) % 31 === 0) {
                ctx.globalAlpha = CONFIG.floorDetailOpacity;
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                ctx.fillRect(x + 15, y + 20, 30, 1);
                ctx.fillRect(x + 15, y + 20, 1, 15);
                ctx.globalAlpha = 1.0;
            }
        }
    }
    // Room accent glow
    if (state.currentRoomId === 'rune_hall') drawRoomAccent(CONFIG.runeColor);
    if (state.currentRoomId === 'machine_room') drawRoomAccent(CONFIG.machineColor);
}

function drawRoomAccent(color) {
    const g = ctx.createRadialGradient(480, 270, 0, 480, 270, 600);
    g.addColorStop(0, hexToRgba(color, CONFIG.roomGlowIntensity * 0.05));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObjects() {
    const room = ROOMS[state.currentRoomId];
    room.exits.forEach(e => {
        const g = ctx.createRadialGradient(e.x + e.w/2, e.y + e.h/2, 0, e.x + e.w/2, e.y + e.h/2, 60);
        g.addColorStop(0, 'rgba(245, 211, 138, 0.08)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(e.x - 30, e.y - 30, e.w + 60, e.h + 60);
    });

    ctx.fillStyle = CONFIG.wallColor;
    room.walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    if (room.gate) {
        const g = room.gate; const opened = state.gateOpened;
        ctx.fillStyle = opened ? '#050507' : '#0e0e14';
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.strokeStyle = opened ? CONFIG.machineColor : '#444';
        if (opened) { ctx.shadowBlur = 25; ctx.shadowColor = CONFIG.machineColor; ctx.globalAlpha = CONFIG.gateOpenGlow * 0.6; }
        ctx.strokeRect(g.x, g.y, g.w, g.h);
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
        if (!opened) {
            for(let i=0; i<6; i++) {
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(g.x + 15 + i*18, g.y, 4, g.h);
            }
        }
    }

    room.runes.forEach(r => {
        const active = state.runesActivated.has(r.id);
        const pDist = getDist(player.x, player.y, r.x, r.y);
        const pulse = Math.sin(Date.now() / 1000 * CONFIG.runePulseSpeed) * 0.15 + 0.85;
        ctx.fillStyle = '#1a1a25';
        ctx.fillRect(r.x - 25, r.y - 45, 50, 90);
        ctx.strokeStyle = CONFIG.runeColor;
        ctx.lineWidth = active ? 3 : 1;
        ctx.globalAlpha = active ? CONFIG.runeActivatedGlow * 0.7 : (pDist < 120 ? 0.8 : pulse * 0.4);
        if (active) {
            ctx.shadowBlur = 30; ctx.shadowColor = CONFIG.runeColor;
            ctx.beginPath(); ctx.arc(r.x, r.y, 50 + Math.sin(Date.now()/250)*5, 0, Math.PI*2); ctx.stroke();
        }
        ctx.strokeRect(r.x - 18, r.y - 38, 36, 76);
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    room.machines.forEach(m => {
        const active = state.machineActivated; const ready = state.runesActivated.size >= CONFIG.runeGoal;
        const pulse = Math.sin(Date.now() / 1000 * CONFIG.machinePulseSpeed) * 0.3 + 0.7;
        ctx.fillStyle = '#1a1a25';
        ctx.beginPath(); ctx.arc(m.x, m.y, 38, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = CONFIG.machineColor;
        ctx.lineWidth = active ? 4 : (ready ? 2 : 1);
        ctx.globalAlpha = active ? CONFIG.machineGlowWhenAwakened * 0.7 : (ready ? pulse : 0.3);
        if (active) {
            ctx.shadowBlur = 40; ctx.shadowColor = CONFIG.machineColor;
            ctx.beginPath(); ctx.arc(m.x, m.y, 55 + pulse*10, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(m.x - 60, m.y); ctx.lineTo(m.x + 60, m.y); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(m.x, m.y, 32, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; ctx.lineWidth = 1;
    });

    if (room.key && !state.hasKey) {
        const p = Math.sin(Date.now() / 400) * 8;
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 25; ctx.shadowColor = CONFIG.machineColor;
        ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = CONFIG.machineColor; ctx.beginPath(); ctx.arc(room.key.x, room.key.y + p, 14, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            const p = Math.sin(Date.now() / 500) * 8;
            ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 25; ctx.shadowColor = CONFIG.lanternColor;
            ctx.beginPath(); ctx.moveTo(f.x, f.y - 18 - p); ctx.lineTo(f.x + 12, f.y - p); ctx.lineTo(f.x, f.y + 18 - p); ctx.lineTo(f.x - 12, f.y - p); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Special Final Light
    if (room.isFinalRoom) {
        const p = Math.sin(Date.now() / 800) * 12;
        ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 60; ctx.shadowColor = CONFIG.lanternColor;
        ctx.beginPath(); ctx.arc(480, 150, 30 + p/2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(480, 150, 50 + p, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
}

function drawShadows() {
    const room = ROOMS[state.currentRoomId];
    if (!room.shadows) return;
    room.shadows.forEach(s => {
        const p = Math.sin(Date.now() / 400) * 5;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, CONFIG.shadowRadius + 20);
        g.addColorStop(0, 'rgba(17, 9, 31, 0.8)'); g.addColorStop(1, 'rgba(17, 9, 31, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius + 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowColor; ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.shadowRadius + p, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = CONFIG.shadowEyeColor; ctx.shadowBlur = 12; ctx.shadowColor = CONFIG.shadowEyeColor;
        ctx.beginPath(); ctx.arc(s.x - 6, s.y - 4, 3, 0, Math.PI * 2); ctx.arc(s.x + 6, s.y - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawPlayer() {
    const p = Math.sin(Date.now() / 800) * 1.5;
    const inv = state.invulnerableTimer > 0 && Math.floor(Date.now()/100)%2 === 0;
    ctx.globalAlpha = inv ? 0.5 : 1.0;
    
    // Cloak/Body
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(player.x - 14, player.y + 15);
    ctx.lineTo(player.x, player.y - 18 - p);
    ctx.lineTo(player.x + 14, player.y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // Hood
    ctx.fillStyle = '#121218';
    ctx.beginPath(); ctx.arc(player.x, player.y - 10 - p, 9, 0, Math.PI * 2); ctx.fill();

    // Lantern Point
    const lp = { x: player.x + 8, y: player.y + 2 };
    ctx.fillStyle = CONFIG.lanternColor; ctx.shadowBlur = 20; ctx.shadowColor = CONFIG.lanternColor;
    ctx.beginPath(); ctx.arc(lp.x, lp.y, 4 + p, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1.0;
}

function drawLanternLight() {
    const p = Math.sin(Date.now() / 600) * CONFIG.lanternPulseAmount;
    let r = CONFIG.lanternRadius + p;
    if (state.lanternDimTimer > 0) r *= CONFIG.shadowLanternDimAmount;

    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.darknessOpacity})`;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    const g = offscreenCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1 - CONFIG.lanternSoftness/200, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');

    offscreenCtx.globalCompositeOperation = 'destination-out';
    offscreenCtx.fillStyle = g;
    offscreenCtx.beginPath(); offscreenCtx.arc(player.x, player.y, r, 0, Math.PI * 2); offscreenCtx.fill();

    ctx.drawImage(offscreenCanvas, 0, 0);

    // Fog & Vignette
    const fog = state.currentRoomId === 'lower_gate' ? CONFIG.fogOpacity * 2 : CONFIG.fogOpacity;
    ctx.fillStyle = hexToRgba('#000000', fog);
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    const vig = ctx.createRadialGradient(480, 270, 200, 480, 270, 600);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(0,0,0,${CONFIG.vignetteStrength})`);
    ctx.fillStyle = vig; ctx.fillRect(0,0,canvas.width,canvas.height);

    const blm = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    blm.addColorStop(0, hexToRgba(CONFIG.lanternColor, CONFIG.lanternCoreGlow * 0.18));
    blm.addColorStop(0.6, hexToRgba(CONFIG.lanternColor, CONFIG.lanternOuterGlow * 0.08));
    blm.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = blm; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.addEventListener('DOMContentLoaded', init);
