// ==================================================
// INSTÄLLNINGAR FÖR THE LANTERN BELOW
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWorldWidth: 960, // INSTÄLLNING - Ändra den interna bredden på spelvärlden.
    canvasWorldHeight: 540, // INSTÄLLNING - Ändra den interna höjden på spelvärlden.
    playerSpeed: 170, // INSTÄLLNING - Ändra hur snabbt spelaren rör sig.
    playerRadius: 13, // INSTÄLLNING - Ändra spelarens storlek.
    lanternRadius: 175, // INSTÄLLNING - Ändra hur långt lyktan lyser runt spelaren.
    lanternSoftness: 90, // INSTÄLLNING - Ändra hur mjuk kanten på ljuset är.
    lanternPulseAmount: 8, // INSTÄLLNING - Ändra hur mycket lyktskenet pulserar.
    darknessOpacity: 0.82, // INSTÄLLNING - Ändra hur mörkt området utanför lyktan är.
    fragmentGoal: 7, // INSTÄLLNING - Ändra hur många ljusfragment som behövs i framtida versioner.
    particleCount: 42, // INSTÄLLNING - Ändra mängden damm-/ljuspartiklar.
    runePulseSpeed: 1.4, // INSTÄLLNING - Ändra hur snabbt runstenen pulserar.
    machinePulseSpeed: 1.1, // INSTÄLLNING - Ändra hur snabbt maskinen pulserar.
    lanternColor: '#f5d38a', // INSTÄLLNING - Ändra färgen på lyktans varma ljus.
    runeColor: '#8b6cff', // INSTÄLLNING - Ändra färgen på runstenen.
    machineColor: '#4cc9f0', // INSTÄLLNING - Ändra färgen på maskinen.
    bestProgressKey: 'taren_lantern_below_progress', // INSTÄLLNING - Ändra localStorage-nyckeln för framtida sparad progression.
    tileColor: '#0a0a0c', // INSTÄLLNING - Ändra färgen på golvplattorna.
    wallColor: '#121216', // INSTÄLLNING - Ändra färgen på väggarna.
};

// Game State
const state = {
    started: false,
    fragmentsCollected: 0,
    keys: 0,
    gateState: 'sealed',
    lastTime: 0,
};

const player = {
    x: CONFIG.canvasWorldWidth / 2,
    y: CONFIG.canvasWorldHeight - 100,
    vx: 0,
    vy: 0,
    radius: CONFIG.playerRadius,
};

const input = {
    up: false,
    down: false,
    left: false,
    right: false,
};

const particles = [];
const fragments = [
    { x: 150, y: 150, collected: false },
    { x: 800, y: 400, collected: false },
];

const ROOM = {
    walls: [
        // Outer boundaries
        { x: 0, y: 0, w: CONFIG.canvasWorldWidth, h: 20 },
        { x: 0, y: CONFIG.canvasWorldHeight - 20, w: CONFIG.canvasWorldWidth, h: 20 },
        { x: 0, y: 0, w: 20, h: CONFIG.canvasWorldHeight },
        { x: CONFIG.canvasWorldWidth - 20, y: 0, w: 20, h: CONFIG.canvasWorldHeight },
    ],
    gate: { x: CONFIG.canvasWorldWidth / 2 - 60, y: 0, w: 120, h: 25 },
    runeStone: { x: 100, y: 300, w: 40, h: 60 },
    machine: { x: 820, y: 150, w: 50, h: 50 },
};

// References
let canvas, ctx;
let offscreenCanvas, offscreenCtx;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = CONFIG.canvasWorldWidth;
    canvas.height = CONFIG.canvasWorldHeight;

    // Offscreen canvas for darkness mask
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = CONFIG.canvasWorldWidth;
    offscreenCanvas.height = CONFIG.canvasWorldHeight;
    offscreenCtx = offscreenCanvas.getContext('2d');

    // Create particles
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
            x: Math.random() * CONFIG.canvasWorldWidth,
            y: Math.random() * CONFIG.canvasWorldHeight,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2,
            angle: Math.random() * Math.PI * 2
        });
    }

    // Input listeners
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));

    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        state.started = true;
        document.getElementById('startScreen').classList.add('hidden');
        requestAnimationFrame(gameLoop);
    });

    updateHUD();
}

function handleKey(e, isDown) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') input.up = isDown;
    if (key === 's' || key === 'arrowdown') input.down = isDown;
    if (key === 'a' || key === 'arrowleft') input.left = isDown;
    if (key === 'd' || key === 'arrowright') input.right = isDown;
}

function gameLoop(timestamp) {
    const dt = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    if (dt < 0.1) { // Avoid huge jumps
        update(dt);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Movement
    player.vx = 0;
    player.vy = 0;

    if (input.up) player.vy = -CONFIG.playerSpeed;
    if (input.down) player.vy = CONFIG.playerSpeed;
    if (input.left) player.vx = -CONFIG.playerSpeed;
    if (input.right) player.vx = CONFIG.playerSpeed;

    // Apply movement with collision
    const nextX = player.x + player.vx * dt;
    const nextY = player.y + player.vy * dt;

    if (!checkCollision(nextX, player.y)) {
        player.x = nextX;
    }
    if (!checkCollision(player.x, nextY)) {
        player.y = nextY;
    }

    // Collection
    checkFragmentCollection();

    // Update particles
    particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = CONFIG.canvasWorldWidth;
        if (p.x > CONFIG.canvasWorldWidth) p.x = 0;
        if (p.y < 0) p.y = CONFIG.canvasWorldHeight;
        if (p.y > CONFIG.canvasWorldHeight) p.y = 0;
    });
}

function checkCollision(x, y) {
    // Wall collisions
    for (const wall of ROOM.walls) {
        if (x + player.radius > wall.x && 
            x - player.radius < wall.x + wall.w && 
            y + player.radius > wall.y && 
            y - player.radius < wall.y + wall.h) {
            return true;
        }
    }
    // Gate
    const gate = ROOM.gate;
    if (x + player.radius > gate.x && 
        x - player.radius < gate.x + gate.w && 
        y + player.radius > gate.y && 
        y - player.radius < gate.y + gate.h) {
        return true;
    }
    return false;
}

function checkFragmentCollection() {
    fragments.forEach(f => {
        if (!f.collected) {
            const dx = player.x - f.x;
            const dy = player.y - f.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < player.radius + 15) {
                f.collected = true;
                state.fragmentsCollected++;
                updateHUD();
            }
        }
    });
}

function updateHUD() {
    document.getElementById('lightCount').innerText = `${state.fragmentsCollected} / ${CONFIG.fragmentGoal}`;
    document.getElementById('keyCount').innerText = state.keys;
    document.getElementById('gateStatus').innerText = state.gateState.charAt(0).toUpperCase() + state.gateState.slice(1);
}

function render() {
    // 1. Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Floor
    drawFloor();

    // 3. Draw Objects
    drawObjects();

    // 4. Draw Player
    drawPlayer();

    // 5. Draw Darkness & Lantern
    drawLanternLight();
}

function drawFloor() {
    ctx.fillStyle = CONFIG.tileColor;
    const tileSize = 60;
    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            ctx.strokeStyle = 'rgba(255,255,255,0.02)';
            ctx.strokeRect(x, y, tileSize, tileSize);
            
            // Random cracks/detail
            if ((x + y) % 13 === 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.01)';
                ctx.fillRect(x + 10, y + 10, 5, 2);
                ctx.fillStyle = CONFIG.tileColor;
            }
        }
    }
}

function drawObjects() {
    // Walls
    ctx.fillStyle = CONFIG.wallColor;
    ROOM.walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Gate
    const gate = ROOM.gate;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
    // Gate bars
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for(let i=0; i<6; i++) {
        ctx.fillRect(gate.x + 15 + i*18, gate.y, 4, gate.h);
    }

    // Rune Stone (Violet)
    const rune = ROOM.runeStone;
    const runePulse = Math.sin(Date.now() / 1000 * CONFIG.runePulseSpeed) * 0.2 + 0.8;
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(rune.x, rune.y, rune.w, rune.h);
    ctx.strokeStyle = CONFIG.runeColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = runePulse;
    ctx.strokeRect(rune.x + 5, rune.y + 5, rune.w - 10, rune.h - 10);
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 1;

    // Machine (Cyan)
    const machine = ROOM.machine;
    const machinePulse = Math.sin(Date.now() / 1000 * CONFIG.machinePulseSpeed) * 0.3 + 0.7;
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath();
    ctx.arc(machine.x + machine.w/2, machine.y + machine.h/2, machine.w/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = CONFIG.machineColor;
    ctx.globalAlpha = machinePulse;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Fragments
    fragments.forEach(f => {
        if (!f.collected) {
            const pulse = Math.sin(Date.now() / 500) * 5;
            ctx.fillStyle = CONFIG.lanternColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONFIG.lanternColor;
            ctx.beginPath();
            ctx.moveTo(f.x, f.y - 10 - pulse);
            ctx.lineTo(f.x + 7, f.y - pulse);
            ctx.lineTo(f.x, f.y + 10 - pulse);
            ctx.lineTo(f.x - 7, f.y - pulse);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlayer() {
    const pulse = Math.sin(Date.now() / 800) * 2;
    
    // Body
    ctx.fillStyle = '#121216';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // Lantern Glow (Internal)
    ctx.fillStyle = CONFIG.lanternColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.lanternColor;
    ctx.beginPath();
    ctx.arc(player.x + 5, player.y - 5, 4 + pulse/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawLanternLight() {
    const pulse = Math.sin(Date.now() / 600) * CONFIG.lanternPulseAmount;
    const r = CONFIG.lanternRadius + pulse;

    // Fill offscreen canvas with darkness
    offscreenCtx.globalCompositeOperation = 'source-over';
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${CONFIG.darknessOpacity})`;
    offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out light circle
    const grad = offscreenCtx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    grad.addColorStop(0, 'rgba(0,0,0,1)'); // Full reveal
    grad.addColorStop(1 - CONFIG.lanternSoftness/200, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)'); // Dark

    offscreenCtx.globalCompositeOperation = 'destination-out';
    offscreenCtx.fillStyle = grad;
    offscreenCtx.beginPath();
    offscreenCtx.arc(player.x, player.y, r, 0, Math.PI * 2);
    offscreenCtx.fill();

    // Draw darkness onto main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Add warm bloom around player
    const bloom = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r);
    bloom.addColorStop(0, 'rgba(245, 211, 138, 0.15)');
    bloom.addColorStop(0.5, 'rgba(245, 211, 138, 0.05)');
    bloom.addColorStop(1, 'rgba(245, 211, 138, 0)');
    
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Start
document.addEventListener('DOMContentLoaded', init);
