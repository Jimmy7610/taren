// ==================================================
// INSTÄLLNINGAR FÖR NIGHTCOIL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    gridCols: 22,        // INSTÄLLNING - Antal kolumner i spelrutnätet.
    gridRows: 16,        // INSTÄLLNING - Antal rader i spelrutnätet.
    cellSize: 32,        // INSTÄLLNING - Grundstorleken på varje ruta.
    startSpeed: 7,       // INSTÄLLNING - Startfarten (uppdateringar per sekund).
    maxSpeed: 15,        // INSTÄLLNING - Högsta hastigheten.
    speedIncreaseEvery: 5, // INSTÄLLNING - Hur ofta hastigheten ökar (poäng / fragmentScore).
    fragmentScore: 100,  // INSTÄLLNING - Poäng per insamlat fragment.
    bestScoreKey: "taren_nightcoil_best_score", // INSTÄLLNING - localStorage-nyckel för bästa poäng.
    coilColor: "#4cc9f0", // INSTÄLLNING - Färg på spolens huvud.
    trailColor: "#8b6cff", // INSTÄLLNING - Färg på spolens svans.
    fragmentColor: "#fbbf24", // INSTÄLLNING - Färg på fragmentet.
};

class Nightcoil {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(CONFIG.bestScoreKey)) || 0;
        this.speed = CONFIG.startSpeed;
        this.paused = false;
        this.running = false;
        
        this.coil = []; // Array of {x, y}
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.fragment = { x: 0, y: 0 };
        
        this.lastUpdateTime = 0;
        
        this.init();
    }

    init() {
        this.canvas.width = CONFIG.gridCols * CONFIG.cellSize;
        this.canvas.height = CONFIG.gridRows * CONFIG.cellSize;
        
        document.getElementById('best-score').textContent = this.bestScore;
        
        window.addEventListener('keydown', (e) => this.handleInput(e));
        
        this.reset();
        requestAnimationFrame((t) => this.loop(t));
    }

    reset() {
        this.score = 0;
        this.speed = CONFIG.startSpeed;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.paused = false;
        this.running = true;
        
        // Start position
        const startX = Math.floor(CONFIG.gridCols / 4);
        const startY = Math.floor(CONFIG.gridRows / 2);
        this.coil = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        this.spawnFragment();
        this.updateHUD();
        
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-pause').classList.add('hidden');
    }

    spawnFragment() {
        let valid = false;
        while (!valid) {
            this.fragment.x = Math.floor(Math.random() * CONFIG.gridCols);
            this.fragment.y = Math.floor(Math.random() * CONFIG.gridRows);
            valid = !this.coil.some(segment => segment.x === this.fragment.x && segment.y === this.fragment.y);
        }
    }

    handleInput(e) {
        if (e.code === 'Space') {
            if (!this.running) this.reset();
            else this.togglePause();
            e.preventDefault();
        }
        if (e.key.toLowerCase() === 'p') this.togglePause();

        const keys = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            KeyW: { x: 0, y: -1 },
            KeyS: { x: 0, y: 1 },
            KeyA: { x: -1, y: 0 },
            KeyD: { x: 1, y: 0 }
        };

        if (keys[e.code]) {
            const dir = keys[e.code];
            // Prevent 180 turn
            if (dir.x !== -this.direction.x || dir.y !== -this.direction.y) {
                this.nextDirection = dir;
            }
            e.preventDefault();
        }
    }

    togglePause() {
        if (!this.running) return;
        this.paused = !this.paused;
        document.getElementById('game-pause').classList.toggle('hidden', !this.paused);
        document.getElementById('pause-btn').textContent = this.paused ? "Resume" : "Pause";
    }

    update() {
        if (!this.running || this.paused) return;

        this.direction = this.nextDirection;
        const head = { x: this.coil[0].x + this.direction.x, y: this.coil[0].y + this.direction.y };

        // Wall collision
        if (head.x < 0 || head.x >= CONFIG.gridCols || head.y < 0 || head.y >= CONFIG.gridRows) {
            this.gameOver();
            return;
        }

        // Self collision
        if (this.coil.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.coil.unshift(head);

        // Fragment collect
        if (head.x === this.fragment.x && head.y === this.fragment.y) {
            this.score += CONFIG.fragmentScore;
            this.spawnFragment();
            
            // Speed increase
            const fragments = this.score / CONFIG.fragmentScore;
            if (fragments % CONFIG.speedIncreaseEvery === 0) {
                this.speed = Math.min(CONFIG.maxSpeed, this.speed + 0.5);
            }
            
            this.updateHUD();
        } else {
            this.coil.pop();
        }
    }

    gameOver() {
        this.running = false;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(CONFIG.bestScoreKey, this.bestScore);
            document.getElementById('best-score').textContent = this.bestScore;
        }
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').classList.remove('hidden');
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('length').textContent = this.coil.length;
        document.getElementById('speed').textContent = Math.round(this.speed);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid (subtle)
        this.ctx.strokeStyle = '#161619';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= CONFIG.gridCols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONFIG.cellSize, 0);
            this.ctx.lineTo(i * CONFIG.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= CONFIG.gridRows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CONFIG.cellSize);
            this.ctx.lineTo(this.canvas.width, i * CONFIG.cellSize);
            this.ctx.stroke();
        }

        // Draw fragment
        const fSize = CONFIG.cellSize * 0.6;
        const fOffset = (CONFIG.cellSize - fSize) / 2;
        this.ctx.fillStyle = CONFIG.fragmentColor;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = CONFIG.fragmentColor;
        this.ctx.beginPath();
        this.ctx.arc(
            this.fragment.x * CONFIG.cellSize + CONFIG.cellSize / 2,
            this.fragment.y * CONFIG.cellSize + CONFIG.cellSize / 2,
            fSize / 2, 0, Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw coil
        this.coil.forEach((segment, i) => {
            const isHead = i === 0;
            const size = isHead ? CONFIG.cellSize - 4 : CONFIG.cellSize - 8;
            const offset = (CONFIG.cellSize - size) / 2;
            
            this.ctx.fillStyle = isHead ? CONFIG.coilColor : CONFIG.trailColor;
            if (isHead) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = CONFIG.coilColor;
            }
            
            this.ctx.fillRect(
                segment.x * CONFIG.cellSize + offset,
                segment.y * CONFIG.cellSize + offset,
                size, size
            );
            this.ctx.shadowBlur = 0;
        });
    }

    loop(timestamp) {
        const elapsed = timestamp - this.lastUpdateTime;
        const interval = 1000 / this.speed;

        if (elapsed > interval) {
            this.update();
            this.draw();
            this.lastUpdateTime = timestamp;
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new Nightcoil();
