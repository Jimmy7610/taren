// ==================================================
// INSTÄLLNINGAR FÖR VOIDBREAKER
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    canvasWidth: 760, // INSTÄLLNING - Ändra grundbredden på spelområdet.
    canvasHeight: 520, // INSTÄLLNING - Ändra grundhöjden på spelområdet.
    startingLives: 3, // INSTÄLLNING - Ändra hur många liv spelaren börjar med.
    paddleWidth: 110, // INSTÄLLNING - Ändra paddelns bredd.
    paddleHeight: 14, // INSTÄLLNING - Ändra paddelns höjd.
    paddleSpeed: 620, // INSTÄLLNING - Ändra paddelns hastighet vid tangentbordsstyrning.
    ballRadius: 8, // INSTÄLLNING - Ändra bollens storlek.
    ballSpeed: 360, // INSTÄLLNING - Ändra bollens starthastighet.
    maxBallSpeed: 620, // INSTÄLLNING - Ändra högsta tillåtna bollhastighet.
    paddleBounceInfluence: 0.85, // INSTÄLLNING - Ändra hur mycket studsvinkeln påverkas av träffpunkten på paddeln.
    brickRows: 6, // INSTÄLLNING - Ändra standardantalet rader för nivåmönster.
    brickCols: 10, // INSTÄLLNING - Ändra standardantalet kolumner för nivåmönster.
    brickGap: 8, // INSTÄLLNING - Ändra mellanrummet mellan blocken.
    brickTopOffset: 76, // INSTÄLLNING - Ändra hur långt ner blockformationen börjar.
    impactParticleCount: 10, // INSTÄLLNING - Ändra antal partiklar när ett block går sönder.
    particleLifetime: 0.38, // INSTÄLLNING - Ändra hur länge partiklarna syns (sekunder).
    pauseOverlayOpacity: 0.55, // INSTÄLLNING - Ändra mörkheten i pause/game over-overlay.
    bestScoreKey: 'taren_voidbreaker_best_score', // INSTÄLLNING - Ändra localStorage-nyckeln för bästa poäng.
};

const LEVELS = [
    // Level 1: Simple wall
    [
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0]
    ],
    // Level 2: Pyramid / Arc
    [
        [0,0,0,2,2,2,2,0,0,0],
        [0,0,2,1,1,1,1,2,0,0],
        [0,2,1,1,1,1,1,1,2,0],
        [2,1,1,1,1,1,1,1,1,2]
    ],
    // Level 3: Split Lanes
    [
        [3,0,0,3,0,0,3,0,0,3],
        [3,0,0,3,0,0,3,0,0,3],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    // Level 4: Central Fortress
    [
        [0,0,0,0,3,3,0,0,0,0],
        [0,0,2,2,3,3,2,2,0,0],
        [0,2,1,1,2,2,1,1,2,0],
        [2,1,1,1,1,1,1,1,1,2]
    ],
    // Level 5: Final Fractured Field
    [
        [3,2,3,2,3,2,3,2,3,2],
        [2,3,2,3,2,3,2,3,2,3],
        [3,2,3,2,3,2,3,2,3,2],
        [2,3,2,3,2,3,2,3,2,3]
    ]
];

const COLORS = {
    paddle: '#4cc9f0',
    ball: '#f72585',
    brick1: 'rgba(76, 201, 240, 0.8)',
    brick2: 'rgba(139, 108, 255, 0.8)',
    brick3: 'rgba(247, 37, 133, 0.9)',
    text: '#fff'
};

let canvas, ctx;
let paddle, ball, bricks = [], particles = [];
let score = 0, lives = CONFIG.startingLives, level = 1, bestScore = 0;
let isPaused = false, isGameOver = false, isVictory = false, isReady = true;
let keys = {};

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    loadBestScore();
    setupEventListeners();
    resetGame();
    requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
        if (e.key.toLowerCase() === 'p') togglePause();
        if (e.key === ' ' && isReady) launchBall();
    });
    window.addEventListener('keyup', e => keys[e.key] = false);
    
    canvas.addEventListener('mousemove', e => {
        if (isPaused || isGameOver || isVictory) return;
        const rect = canvas.getBoundingClientRect();
        const root = document.documentElement;
        const mouseX = e.clientX - rect.left - root.scrollLeft;
        paddle.x = mouseX - paddle.width / 2;
        keepPaddleInBounds();
        if (isReady) ball.x = paddle.x + paddle.width / 2;
    });

    document.getElementById('new-game-btn').addEventListener('click', resetGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
}

function resetGame() {
    score = 0;
    lives = CONFIG.startingLives;
    level = 1;
    isGameOver = false;
    isVictory = false;
    bricks = [];
    particles = [];
    loadLevel(level - 1);
    resetBallAndPaddle();
    updateHUD();
    hideOverlay();
}

function resetBallAndPaddle() {
    paddle = {
        x: canvas.width / 2 - CONFIG.paddleWidth / 2,
        y: canvas.height - 40,
        width: CONFIG.paddleWidth,
        height: CONFIG.paddleHeight
    };
    ball = {
        x: paddle.x + paddle.width / 2,
        y: paddle.y - CONFIG.ballRadius,
        dx: 0,
        dy: 0,
        radius: CONFIG.ballRadius,
        speed: CONFIG.ballSpeed
    };
    isReady = true;
    showOverlay('Ready', 'Press Space or Click to launch');
}

function launchBall() {
    if (!isReady) return;
    ball.dx = (Math.random() - 0.5) * ball.speed;
    ball.dy = -ball.speed;
    isReady = false;
    hideOverlay();
}

function loadLevel(index) {
    bricks = [];
    const pattern = LEVELS[index];
    const brickWidth = (canvas.width - (CONFIG.brickCols + 1) * CONFIG.brickGap) / CONFIG.brickCols;
    const brickHeight = 24;

    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c] > 0) {
                bricks.push({
                    x: c * (brickWidth + CONFIG.brickGap) + CONFIG.brickGap,
                    y: r * (brickHeight + CONFIG.brickGap) + CONFIG.brickTopOffset,
                    width: brickWidth,
                    height: brickHeight,
                    durability: pattern[r][c],
                    maxDurability: pattern[r][c]
                });
            }
        }
    }
}

function updatePaddle(dt) {
    if (keys['ArrowLeft'] || keys['a']) paddle.x -= CONFIG.paddleSpeed * dt;
    if (keys['ArrowRight'] || keys['d']) paddle.x += CONFIG.paddleSpeed * dt;
    keepPaddleInBounds();
    if (isReady) ball.x = paddle.x + paddle.width / 2;
}

function keepPaddleInBounds() {
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function updateBall(dt) {
    if (isReady) return;

    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx *= -1;
        ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
        ball.y = ball.radius;
    }

    // Paddle collision
    if (ball.dy > 0 && 
        ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
        
        const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const angle = hitPos * Math.PI / 3 * CONFIG.paddleBounceInfluence;
        
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
        
        // Increase speed slightly
        ball.speed = Math.min(CONFIG.maxBallSpeed, ball.speed * 1.02);
    }

    // Brick collisions
    for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
            ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
            
            // Basic collision resolution
            const fromLeft = ball.x < b.x;
            const fromRight = ball.x > b.x + b.width;
            const fromTop = ball.y < b.y;
            const fromBottom = ball.y > b.y + b.height;

            if (fromLeft || fromRight) ball.dx *= -1;
            else if (fromTop || fromBottom) ball.dy *= -1;
            else ball.dy *= -1; // Fallback

            damageBrick(i);
            break;
        }
    }

    // Lose life
    if (ball.y + ball.radius > canvas.height) {
        loseLife();
    }
}

function damageBrick(index) {
    const b = bricks[index];
    b.durability--;
    score += 50;
    
    if (b.durability <= 0) {
        score += b.maxDurability * 50;
        spawnImpactParticles(b.x + b.width / 2, b.y + b.height / 2, b.maxDurability);
        bricks.splice(index, 1);
        if (bricks.length === 0) clearLevel();
    } else {
        spawnImpactParticles(ball.x, ball.y, 1);
    }
    updateHUD();
}

function clearLevel() {
    score += 500;
    level++;
    if (level > LEVELS.length) {
        victory();
    } else {
        showOverlay('Level Cleared', 'Prepare for Level ' + level);
        setTimeout(() => {
            loadLevel(level - 1);
            resetBallAndPaddle();
            updateHUD();
        }, 1500);
    }
}

function loseLife() {
    lives--;
    updateHUD();
    if (lives <= 0) {
        gameOver();
    } else {
        resetBallAndPaddle();
    }
}

function gameOver() {
    isGameOver = true;
    showOverlay('Void Reclaimed', 'Game Over - Score: ' + score);
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
    }
}

function victory() {
    isVictory = true;
    showOverlay('Light Restored', 'Victory! Final Score: ' + score);
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
    }
}

function spawnImpactParticles(x, y, count) {
    const pCount = CONFIG.impactParticleCount * count;
    for (let i = 0; i < pCount; i++) {
        particles.push({
            x, y,
            dx: (Math.random() - 0.5) * 200,
            dy: (Math.random() - 0.5) * 200,
            life: CONFIG.particleLifetime,
            color: COLORS.brick3
        });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function togglePause() {
    if (isGameOver || isVictory) return;
    isPaused = !isPaused;
    if (isPaused) {
        showOverlay('Paused', 'Press P to resume');
    } else {
        if (isReady) showOverlay('Ready', 'Press Space or Click to launch');
        else hideOverlay();
    }
}

function gameLoop(time) {
    const dt = 1/60; // Fixed timestep for simplicity
    
    if (!isPaused && !isGameOver && !isVictory) {
        updatePaddle(dt);
        updateBall(dt);
        updateParticles(dt);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render bricks
    bricks.forEach(b => {
        ctx.fillStyle = COLORS['brick' + b.durability];
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS['brick' + b.durability];
        
        // Shard-like drawing
        ctx.beginPath();
        ctx.rect(b.x, b.y, b.width, b.height);
        ctx.fill();
        
        // Cracks for damaged bricks
        if (b.durability < b.maxDurability) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(b.x + 5, b.y + 5);
            ctx.lineTo(b.x + b.width - 5, b.y + b.height - 5);
            ctx.stroke();
        }
    });
    ctx.shadowBlur = 0;

    // Render paddle
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.paddle;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render ball
    ctx.fillStyle = COLORS.ball;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life / CONFIG.particleLifetime;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

function showOverlay(title, subtitle) {
    document.getElementById('status-title').innerText = title;
    document.getElementById('status-subtitle').innerText = subtitle;
    document.getElementById('status-overlay').classList.add('visible');
}

function hideOverlay() {
    document.getElementById('status-overlay').classList.remove('visible');
}

function updateHUD() {
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;
    document.getElementById('level').innerText = level;
    document.getElementById('best-score').innerText = bestScore;
}

function saveBestScore() {
    localStorage.setItem(CONFIG.bestScoreKey, bestScore);
}

function loadBestScore() {
    const saved = localStorage.getItem(CONFIG.bestScoreKey);
    if (saved) {
        bestScore = parseInt(saved);
        updateHUD();
    }
}

document.addEventListener('DOMContentLoaded', init);
