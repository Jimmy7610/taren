// ==================================================
// INSTÄLLNINGAR FÖR CROSSHUSH
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    cols: 11,                  // INSTÄLLNING - Ändra antal kolumner i Crosshush.
    rows: 9,                   // INSTÄLLNING - Ändra antal rader i Crosshush.
    cellSize: 52,              // INSTÄLLNING - Ändra grundstorleken på varje ruta.
    startingLives: 3,          // INSTÄLLNING - Ändra antal liv från start.
    hazardBaseSpeed: 95,       // INSTÄLLNING - Ändra grundhastigheten för hinder.
    levelSpeedIncrease: 12,    // INSTÄLLNING - Ändra hur mycket snabbare hinder blir per level.
    stepScore: 10,             // INSTÄLLNING - Ändra poäng per säkert steg.
    levelClearScore: 500,      // INSTÄLLNING - Ändra poängbonus när en level klaras.
    bestScoreKey: "taren_crosshush_best_score", // INSTÄLLNING - Ändra localStorage-nyckeln för bästa poäng.
};

class Crosshush {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.level = 1;
        this.bestScore = localStorage.getItem(CONFIG.bestScoreKey) || 0;
        
        this.gameState = 'ready'; // 'ready', 'playing', 'paused', 'game-over'
        
        this.player = { x: 0, y: 0 };
        this.lanes = [];
        this.highestRow = 0;
        
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.canvas.width = CONFIG.cols * CONFIG.cellSize;
        this.canvas.height = CONFIG.rows * CONFIG.cellSize;
        
        document.getElementById('best-score').textContent = this.bestScore;
        
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
                this.handleMove(e.code);
            }
            if (e.key.toLowerCase() === 'p') this.togglePause();
            if (e.key.toLowerCase() === 'r') this.reset();
            if (e.code === 'Space' && this.gameState !== 'playing') this.start();
        });
        
        this.initLanes();
        requestAnimationFrame((t) => this.loop(t));
    }

    initLanes() {
        this.lanes = [];
        // Row 0: Goal (Safe)
        // Rows 1-3: Hazards
        // Row 4: Safe Zone
        // Rows 5-7: Hazards
        // Row 8: Start (Safe)
        
        for (let r = 0; r < CONFIG.rows; r++) {
            const lane = {
                y: r * CONFIG.cellSize,
                type: (r === 0 || r === 4 || r === CONFIG.rows - 1) ? 'safe' : 'hazard',
                hazards: [],
                speed: (Math.random() * 0.5 + 0.5) * CONFIG.hazardBaseSpeed * (Math.random() > 0.5 ? 1 : -1) * (1 + (this.level - 1) * 0.1),
                color: (r === 0 || r === 4 || r === CONFIG.rows - 1) ? '#18181b' : '#111114'
            };
            
            if (lane.type === 'hazard') {
                const hazardCount = 2 + Math.floor(Math.random() * 2);
                const spacing = this.canvas.width / hazardCount;
                for (let i = 0; i < hazardCount; i++) {
                    lane.hazards.push({
                        x: i * spacing,
                        w: CONFIG.cellSize * (1 + Math.random())
                    });
                }
            }
            this.lanes.push(lane);
        }
    }

    start() {
        if (document.activeElement) document.activeElement.blur();
        this.gameState = 'playing';
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.level = 1;
        this.resetPlayer();
        this.initLanes();
        this.updateHUD();
        
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-pause').classList.add('hidden');
    }

    reset() {
        this.start();
    }

    resetPlayer() {
        this.player.x = Math.floor(CONFIG.cols / 2);
        this.player.y = CONFIG.rows - 1;
        this.highestRow = CONFIG.rows - 1;
    }

    handleMove(code) {
        if (this.gameState !== 'playing') return;

        let dx = 0;
        let dy = 0;

        if (code === 'ArrowUp' || code === 'KeyW') dy = -1;
        if (code === 'ArrowDown' || code === 'KeyS') dy = 1;
        if (code === 'ArrowLeft' || code === 'KeyA') dx = -1;
        if (code === 'ArrowRight' || code === 'KeyD') dx = 1;

        const nextX = this.player.x + dx;
        const nextY = this.player.y + dy;

        if (nextX >= 0 && nextX < CONFIG.cols && nextY >= 0 && nextY < CONFIG.rows) {
            this.player.x = nextX;
            this.player.y = nextY;

            if (this.player.y < this.highestRow) {
                this.score += CONFIG.stepScore;
                this.highestRow = this.player.y;
                this.updateHUD();
            }

            if (this.player.y === 0) {
                this.levelWin();
            }
        }
    }

    levelWin() {
        this.score += CONFIG.levelClearScore;
        this.level++;
        this.resetPlayer();
        this.initLanes();
        this.updateHUD();
    }

    togglePause() {
        if (this.gameState !== 'playing' && this.gameState !== 'paused') return;
        this.gameState = (this.gameState === 'playing') ? 'paused' : 'playing';
        document.getElementById('game-pause').classList.toggle('hidden', this.gameState !== 'paused');
        document.getElementById('pause-btn').textContent = (this.gameState === 'paused') ? "Resume" : "Pause";
    }

    update(dt) {
        if (this.gameState !== 'playing') return;

        // Update hazards
        this.lanes.forEach(lane => {
            if (lane.type === 'hazard') {
                lane.hazards.forEach(h => {
                    h.x += lane.speed * dt;
                    if (lane.speed > 0 && h.x > this.canvas.width) h.x = -h.w;
                    if (lane.speed < 0 && h.x < -h.w) h.x = this.canvas.width;
                });
            }
        });

        // Check collisions
        const currentLane = this.lanes[this.player.y];
        if (currentLane.type === 'hazard') {
            const px = this.player.x * CONFIG.cellSize + CONFIG.cellSize * 0.2;
            const pw = CONFIG.cellSize * 0.6;
            
            for (let h of currentLane.hazards) {
                if (px < h.x + h.w && px + pw > h.x) {
                    this.die();
                    break;
                }
            }
        }
    }

    die() {
        this.lives--;
        this.updateHUD();
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPlayer();
        }
    }

    gameOver() {
        this.gameState = 'game-over';
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(CONFIG.bestScoreKey, this.bestScore);
        }
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').classList.remove('hidden');
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Lanes
        this.lanes.forEach((lane, r) => {
            this.ctx.fillStyle = lane.color;
            this.ctx.fillRect(0, lane.y, this.canvas.width, CONFIG.cellSize);
            
            // Draw separators
            this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, lane.y);
            this.ctx.lineTo(this.canvas.width, lane.y);
            this.ctx.stroke();

            // Draw Hazards
            if (lane.type === 'hazard') {
                this.ctx.fillStyle = '#8b6cff';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#8b6cff';
                lane.hazards.forEach(h => {
                    this.ctx.fillRect(h.x, lane.y + 10, h.w, CONFIG.cellSize - 20);
                });
                this.ctx.shadowBlur = 0;
            }

            // Goal visual
            if (r === 0) {
                this.ctx.fillStyle = 'rgba(76, 201, 240, 0.1)';
                this.ctx.fillRect(0, 0, this.canvas.width, CONFIG.cellSize);
            }
        });

        // Draw Player
        if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'ready') {
            const px = this.player.x * CONFIG.cellSize + CONFIG.cellSize * 0.5;
            const py = this.player.y * CONFIG.cellSize + CONFIG.cellSize * 0.5;
            
            this.ctx.fillStyle = '#4cc9f0';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#4cc9f0';
            this.ctx.beginPath();
            this.ctx.arc(px, py, CONFIG.cellSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new Crosshush();
