/**
 * Taren Game Template
 * Note: This is only a template, not a finished game.
 */

// ==================================================
// INSTÄLLNINGAR FÖR DETTA SPEL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const SETTINGS = {
    game: {
        localStorageKey: 'template_best_score', // INSTÄLLNING - Ändra nyckeln för att spara highscore unikt för detta spel.
    },
    player: {
        radius: 12, // INSTÄLLNING - Ändra spelarens storlek.
        speed: 200, // INSTÄLLNING - Ändra hur snabbt spelaren kan röra sig i pixlar per sekund.
    },
    particles: {
        ambientCount: 20, // INSTÄLLNING - Ändra antalet bakgrundspartiklar.
    }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('game-container');

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let lastTime = 0;
let score = 0;
let bestScore = localStorage.getItem(SETTINGS.game.localStorageKey) || 0;

// Arena/Layout Variables
let centerX, centerY;

// Resize handling
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}
window.addEventListener('resize', resize);
resize();

// Example Player Object
let player = {
    x: 0,
    y: 0,
    update: function(dt) {
        // Example: logic to move player goes here
    },
    draw: function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, SETTINGS.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
};

// Reset state
function resetGame() {
    player.x = centerX;
    player.y = centerY;
    score = 0;
    gameState = 'PLAYING';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

// End state
function killPlayer() {
    gameState = 'GAME_OVER';
    
    if (score > bestScore) {
        bestScore = Math.floor(score);
        localStorage.setItem(SETTINGS.game.localStorageKey, bestScore);
    }
    
    finalScoreEl.innerText = Math.floor(score);
    bestScoreEl.innerText = bestScore;
    
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

// Update loop (Logic)
function update(dt) {
    if (gameState !== 'PLAYING') return;

    // Simulate score going up
    score += dt * 10;

    // Example logic
    player.update(dt);
}

// Draw loop (Rendering)
function draw() {
    // Clear screen
    ctx.fillStyle = '#050507'; // Match CSS --template-bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        player.draw(ctx);
    }
}

// Main Engine Loop (requestAnimationFrame)
function loop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; // Cap dt to prevent huge jumps if tab was inactive
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// Setup listeners
document.getElementById('startBtn').addEventListener('click', resetGame);
document.getElementById('retryBtn').addEventListener('click', resetGame);

// Start engine
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
});
