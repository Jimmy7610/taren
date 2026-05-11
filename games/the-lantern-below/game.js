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
    darknessOpacity: 0.85, // INSTÄLLNING - Ändra hur mörkt området utanför lyktan är.
    fragmentGoal: 7, // INSTÄLLNING - Ändra hur många ljusfragment som behövs.
    runeGoal: 3, // INSTÄLLNING - Ändra hur många runstenar som krävs.
    interactionRadius: 48, // INSTÄLLNING - Ändra hur nära spelaren måste vara för att interagera.
    doorTransitionPadding: 32, // INSTÄLLNING - Ändra hur långt in spelaren placeras efter rumsbyte.
    statusMessageDuration: 2500, // INSTÄLLNING - Ändra hur länge statusmeddelanden visas.
    machineGlowWhenAwakened: 1.8, // INSTÄLLNING - Ändra hur starkt maskinen lyser när den är aktiverad.
    particleCount: 48, // INSTÄLLNING - Ändra mängden damm-/ljuspartiklar.
    runePulseSpeed: 1.5, // INSTÄLLNING - Ändra hur snabbt runstenen pulserar.
    machinePulseSpeed: 1.2, // INSTÄLLNING - Ändra hur snabbt maskinen pulserar.
    lanternColor: '#f5d38a', // INSTÄLLNING - Ändra färgen på lyktans varma ljus.
    runeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på runstenen.
    machineColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på maskinen.
    tileColor: '#0a0a0c', // INSTÄLLNING - Ändra färgen på golvplattorna.
    wallColor: '#121216', // INSTÄLLNING - Ändra färgen på väggarna.
};

// Rooms Data
const ROOMS = {
    start_chamber: {
        name: 'The Descent',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 540 },
            // Interior walls
            { x: 200, y: 150, w: 20, h: 240 },
            { x: 740, y: 150, w: 20, h: 240 },
        ],
        exits: [
            { x: 430, y: 0, w: 100, h: 20, target: 'rune_hall', entryX: 480, entryY: 500 },
        ],
        fragments: [
            { id: 'f1', x: 480, y: 270 },
        ],
        runes: [],
        machines: [],
        key: null,
        gate: null
    },
    rune_hall: {
        name: 'The Hall of Runes',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 540 },
        ],
        exits: [
            { x: 430, y: 520, w: 100, h: 20, target: 'start_chamber', entryX: 480, entryY: 40 },
            { x: 940, y: 220, w: 20, h: 100, target: 'machine_room', entryX: 40, entryY: 270 },
            { x: 0, y: 220, w: 20, h: 100, target: 'fragment_vault', entryX: 920, entryY: 270 },
        ],
        fragments: [
            { id: 'f2', x: 100, y: 100 },
            { id: 'f3', x: 860, y: 100 },
        ],
        runes: [
            { id: 'r1', x: 250, y: 120, activated: false },
            { id: 'r2', x: 710, y: 120, activated: false },
        ],
        machines: [],
        key: null,
        gate: null
    },
    fragment_vault: {
        name: 'The Echo Vault',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 220, w: 20, h: 100, passage: true }, // Entrance
            { x: 940, y: 0, w: 20, h: 220 },
            { x: 940, y: 320, w: 20, h: 220 },
        ],
        exits: [
            { x: 940, y: 220, w: 20, h: 100, target: 'rune_hall', entryX: 40, entryY: 270 },
        ],
        fragments: [
            { id: 'f4', x: 100, y: 440 },
            { id: 'f5', x: 200, y: 100 },
        ],
        runes: [],
        machines: [],
        key: { x: 480, y: 270, collected: false },
        gate: null
    },
    machine_room: {
        name: 'The Deep Engine',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 220, w: 20, h: 100, passage: true }, // Entrance from hall
            { x: 0, y: 0, w: 20, h: 220 },
            { x: 0, y: 320, w: 20, h: 220 },
            { x: 940, y: 0, w: 20, h: 540 },
            // Passage to start_chamber
            { x: 430, y: 520, w: 100, h: 20, passage: true },
        ],
        exits: [
            { x: 0, y: 220, w: 20, h: 100, target: 'rune_hall', entryX: 920, entryY: 270 },
            { x: 430, y: 520, w: 100, h: 20, target: 'start_chamber', entryX: 480, entryY: 40 },
            { x: 430, y: 0, w: 100, h: 20, target: 'lower_gate', entryX: 480, entryY: 500, requiresGate: true },
        ],
        fragments: [
            { id: 'f6', x: 150, y: 400 },
        ],
        runes: [
            { id: 'r3', x: 480, y: 440, activated: false },
        ],
        machines: [
            { id: 'm1', x: 480, y: 270, activated: false },
        ],
        key: null,
        gate: { x: 430, y: 0, w: 100, h: 25, opened: false }
    },
    lower_gate: {
        name: 'The Lower Light',
        walls: [
            { x: 0, y: 0, w: 960, h: 20 },
            { x: 0, y: 520, w: 960, h: 20 },
            { x: 0, y: 0, w: 20, h: 540 },
            { x: 940, y: 0, w: 20, h: 540 },
        ],
        exits: [
            { x: 430, y: 520, w: 100, h: 20, target: 'machine_room', entryX: 480, entryY: 40 },
        ],
        fragments: [
            { id: 'f7', x: 480, y: 150 },
        ],
        runes: [],
        machines: [],
        key: null,
        gate: null,
        isFinalRoom: true
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
    interactPressed: false // For one-shot detection
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

    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
            angle: Math.random() * Math.PI * 2
        });
    }

    window.addEventListener('keydown', (e) => handleInput(e, true));
    window.addEventListener('keyup', (e) => handleInput(e, false));

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);

    updateHUD();
}

function startGame() {
    state.started = true;
    document.getElementById('startScreen').classList.add('hidden');
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    state = {
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
    };
    player.x = 480;
    player.y = 400;
    
    // Reset room state in data if needed, but we use Sets in 'state' instead
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
    if (state.completed) {
        render();
        return;
    }

    const dt = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    if (dt < 0.1) {
        update(dt);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    updatePlayer(dt);
    checkRoomTransitions();
    handleInteractions();
    
    // Update particles
    particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = CONFIG.canvasWorldWidth;
        if (p.x > CONFIG.canvasWorldWidth) p.x = 0;
        if (p.y < 0) p.y = CONFIG.canvasWorldHeight;
        if (p.y > CONFIG.canvasWorldHeight) p.y = 0;
    });

    // Reset one-shot input
    input.interactPressed = false;
}

function updatePlayer(dt) {
    player.vx = 0;
    player.vy = 0;

    if (input.up) player.vy = -CONFIG.playerSpeed;
    if (input.down) player.vy = CONFIG.playerSpeed;
    if (input.left) player.vx = -CONFIG.playerSpeed;
    if (input.right) player.vx = CONFIG.playerSpeed;

    const nx = player.x + player.vx * dt;
    const ny = player.y + player.vy * dt;

    if (!checkCollision(nx, player.y)) player.x = nx;
    if (!checkCollision(player.x, ny)) player.y = ny;
}

function checkCollision(x, y) {
    const room = ROOMS[state.currentRoomId];
    // Walls
    for (const wall of room.walls) {
        if (x + player.radius > wall.x && x - player.radius < wall.x + wall.w &&
            y + player.radius > wall.y && y - player.radius < wall.y + wall.h) {
            return true;
        }
    }
    // Gate
    if (room.gate && !state.gateOpened) {
        const g = room.gate;
        if (x + player.radius > g.x && x - player.radius < g.x + g.w &&
            y + player.radius > g.y && y - player.radius < g.y + g.h) {
            return true;
        }
    }
    return false;
}

function checkRoomTransitions() {
    const room = ROOMS[state.currentRoomId];
    for (const exit of room.exits) {
        if (player.x + player.radius > exit.x && player.x - player.radius < exit.x + exit.w &&
            player.y + player.radius > exit.y && player.y - player.radius < exit.y + exit.h) {
            
            // Check gate requirements
            if (exit.requiresGate && !state.gateOpened) {
                setStatus("The gate is sealed.");
                // Push player back slightly
                if (player.y < 50) player.y = 50;
                continue;
            }

            changeRoom(exit.target, exit.entryX, exit.entryY);
            break;
        }
    }
}

function changeRoom(roomId, x, y) {
    state.currentRoomId = roomId;
    player.x = x;
    player.y = y;
    updateHUD();
}

function handleInteractions() {
    const room = ROOMS[state.currentRoomId];
    
    // Fragments (auto-collect)
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            const dist = getDist(player.x, player.y, f.x, f.y);
            if (dist < player.radius + 15) {
                state.fragmentsCollected.add(f.id);
                setStatus("Light fragment found.");
                updateHUD();
                checkCompletion();
            }
        }
    });

    // Key
    if (room.key && !state.hasKey) {
        const dist = getDist(player.x, player.y, room.key.x, room.key.y);
        if (dist < player.radius + 15) {
            state.hasKey = true;
            setStatus("Ancient key obtained.");
            updateHUD();
        }
    }

    // Rune interactions (Press E)
    room.runes.forEach(r => {
        if (!state.runesActivated.has(r.id)) {
            const dist = getDist(player.x, player.y, r.x, r.y);
            if (dist < CONFIG.interactionRadius) {
                if (input.interactPressed) {
                    state.runesActivated.add(r.id);
                    setStatus(`Rune activated. (${state.runesActivated.size}/3)`);
                    updateHUD();
                } else {
                    setStatus("Press E to activate rune.", true);
                }
            }
        }
    });

    // Gate interaction (Press E)
    if (room.gate && !state.gateOpened) {
        const dist = getDist(player.x, player.y, room.gate.x + room.gate.w/2, room.gate.y + room.gate.h/2);
        if (dist < CONFIG.interactionRadius + 10) {
            if (state.hasKey) {
                if (input.interactPressed) {
                    state.gateOpened = true;
                    setStatus("The gate grinds open.");
                    updateHUD();
                } else {
                    setStatus("Press E to open gate.", true);
                }
            } else {
                setStatus("The gate requires a key.", true);
            }
        }
    }

    // Machine interaction (Press E)
    room.machines.forEach(m => {
        const dist = getDist(player.x, player.y, m.x, m.y);
        if (dist < CONFIG.interactionRadius) {
            if (state.runesActivated.size >= CONFIG.runeGoal) {
                if (!state.machineActivated) {
                    if (input.interactPressed) {
                        state.machineActivated = true;
                        setStatus("The lower mechanism awakens.");
                        updateHUD();
                        checkCompletion();
                    } else {
                        setStatus("Press E to awaken machine.", true);
                    }
                }
            } else {
                setStatus("The machine waits for three runes.", true);
            }
        }
    });

    // Final Objective in Final Room
    if (room.isFinalRoom) {
        const dist = getDist(player.x, player.y, 480, 150);
        if (dist < 40) {
            if (state.fragmentsCollected.size >= CONFIG.fragmentGoal && state.machineActivated) {
                winGame();
            } else {
                setStatus("The lower gate is still dark.", true);
            }
        }
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

function getDist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function setStatus(msg, isHint = false) {
    const el = document.getElementById('statusOverlay');
    el.innerText = msg;
    el.classList.add('visible');
    
    if (state.statusTimer) clearTimeout(state.statusTimer);
    
    if (!isHint) {
        state.statusTimer = setTimeout(() => {
            el.classList.remove('visible');
        }, CONFIG.statusMessageDuration);
    } else {
        // Hints disappear quickly if not near
        state.statusTimer = setTimeout(() => {
            el.classList.remove('visible');
        }, 100);
    }
}

function updateHUD() {
    document.getElementById('lightCount').innerText = `${state.fragmentsCollected.size} / ${CONFIG.fragmentGoal}`;
    document.getElementById('keyCount').innerText = state.hasKey ? '1 / 1' : '0 / 1';
    document.getElementById('runeCount').innerText = `${state.runesActivated.size} / ${CONFIG.runeGoal}`;
    document.getElementById('gateStatus').innerText = state.gateOpened ? 'Open' : 'Sealed';
}

// Rendering
function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFloor();
    drawObjects();
    drawPlayer();
    drawLanternLight();
}

function drawFloor() {
    ctx.fillStyle = CONFIG.tileColor;
    const tileSize = 60;
    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            ctx.strokeStyle = 'rgba(255,255,255,0.02)';
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    }
}

function drawObjects() {
    const room = ROOMS[state.currentRoomId];
    
    // Walls
    ctx.fillStyle = CONFIG.wallColor;
    room.walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Exits
    ctx.fillStyle = 'rgba(0,0,0,1)';
    room.exits.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);
    });

    // Gate
    if (room.gate && !state.gateOpened) {
        const g = room.gate;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.strokeStyle = CONFIG.machineColor;
        ctx.globalAlpha = 0.4;
        ctx.strokeRect(g.x, g.y, g.w, g.h);
        ctx.globalAlpha = 1.0;
        for(let i=0; i<6; i++) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(g.x + 15 + i*18, g.y, 4, g.h);
        }
    }

    // Runes
    room.runes.forEach(r => {
        const active = state.runesActivated.has(r.id);
        const pulse = Math.sin(Date.now() / 1000 * CONFIG.runePulseSpeed) * 0.2 + 0.8;
        ctx.fillStyle = '#1a1a25';
        ctx.fillRect(r.x - 20, r.y - 30, 40, 60);
        ctx.strokeStyle = CONFIG.runeColor;
        ctx.lineWidth = active ? 3 : 1;
        ctx.globalAlpha = active ? 1 : pulse * 0.4;
        ctx.strokeRect(r.x - 15, r.y - 25, 30, 50);
        if (active) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONFIG.runeColor;
            ctx.strokeRect(r.x - 10, r.y - 20, 20, 40);
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
    });

    // Machines
    room.machines.forEach(m => {
        const active = state.machineActivated;
        const pulse = Math.sin(Date.now() / 1000 * CONFIG.machinePulseSpeed) * 0.3 + 0.7;
        ctx.fillStyle = '#1a1a25';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = CONFIG.machineColor;
        ctx.lineWidth = active ? 3 : 1;
        ctx.globalAlpha = active ? pulse : 0.3;
        ctx.stroke();
        if (active) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.machineColor;
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
    });

    // Key
    if (room.key && !state.hasKey) {
        const pulse = Math.sin(Date.now() / 600) * 4;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.fillRect(room.key.x - 5, room.key.y - 5 + pulse, 10, 10);
        ctx.shadowBlur = 0;
    }

    // Fragments
    room.fragments.forEach(f => {
        if (!state.fragmentsCollected.has(f.id)) {
            const pulse = Math.sin(Date.now() / 500) * 5;
            ctx.fillStyle = CONFIG.lanternColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONFIG.lanternColor;
            ctx.beginPath();
            ctx.moveTo(f.x, f.y - 12 - pulse);
            ctx.lineTo(f.x + 8, f.y - pulse);
            ctx.lineTo(f.x, f.y + 12 - pulse);
            ctx.lineTo(f.x - 8, f.y - pulse);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlayer() {
    const pulse = Math.sin(Date.now() / 800) * 2;
    ctx.fillStyle = '#121216';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();

    ctx.fillStyle = CONFIG.lanternColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.lanternColor;
    ctx.beginPath();
    ctx.arc(player.x + 4, player.y - 4, 3.5 + pulse/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawLanternLight() {
    const pulse = Math.sin(Date.now() / 600) * CONFIG.lanternPulseAmount;
    const r = CONFIG.lanternRadius + pulse;

    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.darknessOpacity})`;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = offscreenCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1 - CONFIG.lanternSoftness/200, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    offscreenCtx.globalCompositeOperation = 'destination-out';
    offscreenCtx.fillStyle = grad;
    offscreenCtx.beginPath();
    offscreenCtx.arc(player.x, player.y, r, 0, Math.PI * 2);
    offscreenCtx.fill();

    ctx.drawImage(offscreenCanvas, 0, 0);

    const bloom = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    bloom.addColorStop(0, 'rgba(245, 211, 138, 0.12)');
    bloom.addColorStop(0.6, 'rgba(245, 211, 138, 0.04)');
    bloom.addColorStop(1, 'rgba(245, 211, 138, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('DOMContentLoaded', init);
