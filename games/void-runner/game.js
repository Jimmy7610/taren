// ==================================================
// INSTÄLLNINGAR FÖR VOID RUNNER
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    playerRadius: 10, // INSTÄLLNING - Ändra storleken på spelaren.
    playerSpeed: 0.15, // INSTÄLLNING - Hur snabbt spelaren svarar på musrörelser.
    hazardSpawnRate: 0.03, // INSTÄLLNING - Sannolikhet att en hazard skapas varje frame.
    hazardBaseSpeed: 3, // INSTÄLLNING - Bas-fart för hazards.
    hazardRadiusMin: 8, // INSTÄLLNING - Minsta storlek på hazards.
    hazardRadiusMax: 20, // INSTÄLLNING - Största storlek på hazards.
    fragmentSpawnRate: 0.015, // INSTÄLLNING - Sannolikhet att ett fragment skapas varje frame.
    fragmentScore: 10, // INSTÄLLNING - Poäng per fragment.
    speedIncreasePerSecond: 0.05, // INSTÄLLNING - Hur mycket farten ökar per sekund.
    playerColor: '#8b6cff', // INSTÄLLNING - Färg på spelaren.
    hazardColor: '#2a2a35', // INSTÄLLNING - Färg på hazards.
    fragmentColor: '#4cc9f0', // INSTÄLLNING - Färg på fragments.
    
    runnerGlowStrength: 0.32, // INSTÄLLNING - Ändra hur starkt Void Runner-spelaren lyser.
    voidTrailAlpha: 0.18, // INSTÄLLNING - Ändra hur tydlig rörelsesvansen är.
    hazardGlowStrength: 0.24, // INSTÄLLNING - Ändra hur tydligt hinder glöder.
    
    bestScoreKey: 'taren_void_runner_best_score' // INSTÄLLNING - LocalStorage nyckel.
};

// Game State
let canvas, ctx;
let score = 0;
let bestScore = 0;
let gameState = 'IDLE'; // IDLE, PLAYING, GAMEOVER
let player = { x: 100, y: 0 };
let hazards = [];
let fragments = [];
let frameCount = 0;
let startTime = 0;

// DOM
const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    
    bestScore = localStorage.getItem(SETTINGS.bestScoreKey) || 0;
    bestScoreDisplay.innerText = bestScore;

    canvas.addEventListener('mousemove', handleInput);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleInput(e.touches[0]);
    }, { passive: false });

    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);

    requestAnimationFrame(update);
}

function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Update player position if in IDLE to keep it centered
    if (gameState === 'IDLE') {
        player.y = canvas.height / 2;
    }
}

function handleInput(e) {
    if (gameState !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const targetY = e.clientY - rect.top;
    player.y += (targetY - player.y) * SETTINGS.playerSpeed;
    
    // Bounds
    player.y = Math.max(SETTINGS.playerRadius, Math.min(canvas.height - SETTINGS.playerRadius, player.y));
}

function startGame() {
    resize();
    score = 0;
    hazards = [];
    fragments = [];
    frameCount = 0;
    startTime = Date.now();
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function update() {
    if (gameState === 'PLAYING') {
        frameCount++;
        const elapsed = (Date.now() - startTime) / 1000;
        const currentHazardSpeed = SETTINGS.hazardBaseSpeed + (elapsed * SETTINGS.speedIncreasePerSecond);

        // Spawn
        if (Math.random() < SETTINGS.hazardSpawnRate) {
            hazards.push({
                x: canvas.width + 50,
                y: Math.random() * canvas.height,
                radius: SETTINGS.hazardRadiusMin + Math.random() * (SETTINGS.hazardRadiusMax - SETTINGS.hazardRadiusMin),
                speed: currentHazardSpeed * (0.8 + Math.random() * 0.4)
            });
        }

        if (Math.random() < SETTINGS.fragmentSpawnRate) {
            fragments.push({
                x: canvas.width + 50,
                y: Math.random() * canvas.height,
                radius: 6,
                speed: currentHazardSpeed * 0.7
            });
        }

        // Move
        hazards.forEach((h, i) => {
            h.x -= h.speed;
            if (h.x < -h.radius) hazards.splice(i, 1);

            // Collision
            const dist = Math.hypot(player.x - h.x, player.y - h.y);
            if (dist < SETTINGS.playerRadius + h.radius) gameOver();
        });

        fragments.forEach((f, i) => {
            f.x -= f.speed;
            if (f.x < -f.radius) fragments.splice(i, 1);

            const dist = Math.hypot(player.x - f.x, player.y - f.y);
            if (dist < SETTINGS.playerRadius + f.radius) {
                fragments.splice(i, 1);
                score += SETTINGS.fragmentScore;
                scoreDisplay.innerText = score;
            }
        });
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Persistent trail effect
    ctx.fillStyle = `rgba(5, 5, 7, ${1 - SETTINGS.voidTrailAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Background Lines (cinematic scanner feel)
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 24) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    if (gameState === 'PLAYING') {
        // Player (Luminous energy core)
        ctx.shadowBlur = 20 * SETTINGS.runnerGlowStrength;
        ctx.shadowColor = SETTINGS.playerColor;
        ctx.fillStyle = SETTINGS.playerColor;
        ctx.beginPath();
        ctx.arc(player.x, player.y, SETTINGS.playerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(player.x, player.y, SETTINGS.playerRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hazards (Void matter)
        hazards.forEach(h => {
            ctx.shadowBlur = 10 * SETTINGS.hazardGlowStrength;
            ctx.shadowColor = 'rgba(255,255,255,0.05)';
            ctx.fillStyle = SETTINGS.hazardColor;
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Rim light
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Fragments (Signal shards)
        ctx.shadowBlur = 15 * SETTINGS.runnerGlowStrength;
        ctx.shadowColor = SETTINGS.fragmentColor;
        ctx.fillStyle = SETTINGS.fragmentColor;
        fragments.forEach(f => {
            ctx.beginPath();
            // Diamond shape for shards
            ctx.moveTo(f.x, f.y - f.radius);
            ctx.lineTo(f.x + f.radius, f.y);
            ctx.lineTo(f.x, f.y + f.radius);
            ctx.lineTo(f.x - f.radius, f.y);
            ctx.closePath();
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    finalScoreText.innerText = `Score: ${score}`;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(SETTINGS.bestScoreKey, bestScore);
        bestScoreDisplay.innerText = bestScore;
    }
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', init);
