// ==================================================
// INSTÄLLNINGAR FÖR ECHO HOLLOW
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const DIFFICULTIES = {
    quiet: {
        label: "Quiet",
        playerSpeed: 4.6,      // INSTÄLLNING - Ändra spelarens hastighet på Quiet.
        shadowSpeed: 3.1,      // INSTÄLLNING - Ändra skuggornas hastighet på Quiet.
        chaseStrength: 0.45    // INSTÄLLNING - Ändra hur aggressivt skuggorna jagar på Quiet.
    },
    drift: {
        label: "Drift",
        playerSpeed: 5.4,      // INSTÄLLNING - Ändra spelarens hastighet på Drift.
        shadowSpeed: 3.8,      // INSTÄLLNING - Ändra skuggornas hastighet på Drift.
        chaseStrength: 0.6     // INSTÄLLNING - Ändra hur aggressivt skuggorna jagar på Drift.
    },
    hunt: {
        label: "Hunt",
        playerSpeed: 6.2,      // INSTÄLLNING - Ändra spelarens hastighet på Hunt.
        shadowSpeed: 4.6,      // INSTÄLLNING - Ändra skuggornas hastighet på Hunt.
        chaseStrength: 0.78    // INSTÄLLNING - Ändra hur aggressivt skuggorna jagar på Hunt.
    }
};

const CONFIG = {
    tileSize: 28,               // INSTÄLLNING - Ändra storleken på varje ruta i labyrinten.
    powerDuration: 7000,        // INSTÄLLNING - Ändra hur länge echo power är aktivt.
    startingLives: 3,           // INSTÄLLNING - Ändra antal liv från start.
    lifeResetDelay: 900,        // INSTÄLLNING - Ändra pausen efter att spelaren förlorat ett liv.
    bestScoreKeyPrefix: "taren_echo_hollow_best_score_", // INSTÄLLNING - Prefix för bästa poäng per svårighet.
};

// Maze Layout: 1 = Wall, 0 = Path, 2 = Fragment, 3 = Echo Node, 4 = Player Start, 5 = Shadow Start
const MAZE_LAYOUT = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,5,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1,1],
    [1,0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,1],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,4,2,2,2,2,2,1,2,2,3,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

class EchoHollow {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.level = 1;
        this.difficulty = 'quiet';
        this.bestScore = 0;
        
        this.running = false;
        this.paused = false;
        this.powerActive = false;
        this.powerTimer = 0;
        
        this.maze = [];
        this.player = { x: 0, y: 0, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } };
        this.shadows = [];
        this.totalFragments = 0;
        this.collectedFragments = 0;
        
        this.keys = {};
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.canvas.width = MAZE_LAYOUT[0].length * CONFIG.tileSize;
        this.canvas.height = MAZE_LAYOUT.length * CONFIG.tileSize;
        
        this.loadBestScore();
        this.updateDifficultyUI();
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' && !this.running) this.start();
            if (e.key.toLowerCase() === 'p') this.togglePause();
            if (e.key.toLowerCase() === 'r') this.reset();
            
            // Movement input
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.player.nextDir = { x: 0, y: -1 };
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.player.nextDir = { x: 0, y: 1 };
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.player.nextDir = { x: -1, y: 0 };
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.player.nextDir = { x: 1, y: 0 };
        });
        
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        
        requestAnimationFrame((t) => this.loop(t));
    }

    loadBestScore() {
        this.bestScore = localStorage.getItem(CONFIG.bestScoreKeyPrefix + this.difficulty) || 0;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        this.updateDifficultyUI();
        this.loadBestScore();
        if (this.running) this.reset();
    }

    updateDifficultyUI() {
        ['quiet', 'drift', 'hunt'].forEach(d => {
            const btn = document.getElementById(`btn-${d}`);
            if (btn) {
                btn.classList.toggle('btn-primary', this.difficulty === d);
                btn.classList.toggle('btn-secondary', this.difficulty !== d);
            }
        });
    }

    setStatus(text) {
        const el = document.getElementById('game-status');
        if (el) el.textContent = text;
    }

    start() {
        this.running = true;
        this.paused = false;
        this.score = 0;
        this.lives = CONFIG.startingLives;
        this.level = 1;
        this.resetLevel();
        this.setStatus("Gather every signal.");
        document.getElementById('game-start').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
    }

    reset() {
        this.start();
    }

    resetLevel() {
        this.maze = MAZE_LAYOUT.map(row => [...row]);
        this.shadows = [];
        this.totalFragments = 0;
        this.collectedFragments = 0;
        this.powerActive = false;
        
        const diffSettings = DIFFICULTIES[this.difficulty];
        
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const val = this.maze[y][x];
                if (val === 2 || val === 3) this.totalFragments++;
                if (val === 4) {
                    this.player.x = x * CONFIG.tileSize + CONFIG.tileSize / 2;
                    this.player.y = y * CONFIG.tileSize + CONFIG.tileSize / 2;
                    this.player.dir = { x: 0, y: 0 };
                    this.player.nextDir = { x: 0, y: 0 };
                }
                if (val === 5) {
                    this.shadows.push({
                        x: x * CONFIG.tileSize + CONFIG.tileSize / 2,
                        y: y * CONFIG.tileSize + CONFIG.tileSize / 2,
                        startX: x * CONFIG.tileSize + CONFIG.tileSize / 2,
                        startY: y * CONFIG.tileSize + CONFIG.tileSize / 2,
                        dir: { x: 1, y: 0 },
                        speed: diffSettings.shadowSpeed + (this.level * 0.2),
                        frightened: false
                    });
                }
            }
        }
        
        // Add more shadows for higher levels
        if (this.level > 1 && this.shadows.length < 4) {
            for (let i = 0; i < Math.min(3, this.level - 1); i++) {
                this.shadows.push({
                    x: 10 * CONFIG.tileSize + CONFIG.tileSize / 2,
                    y: 8 * CONFIG.tileSize + CONFIG.tileSize / 2,
                    startX: 10 * CONFIG.tileSize + CONFIG.tileSize / 2,
                    startY: 8 * CONFIG.tileSize + CONFIG.tileSize / 2,
                    dir: { x: -1, y: 0 },
                    speed: diffSettings.shadowSpeed + (this.level * 0.2),
                    frightened: false
                });
            }
        }

        this.updateHUD();
    }

    togglePause() {
        if (!this.running) return;
        this.paused = !this.paused;
        document.getElementById('game-pause').classList.toggle('hidden', !this.paused);
        document.getElementById('pause-btn').textContent = this.paused ? "Resume" : "Pause";
        if (this.paused) this.setStatus("Paused.");
        else this.setStatus("Gather every signal.");
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    update(dt) {
        if (!this.running || this.paused) return;

        if (this.powerActive) {
            this.powerTimer -= dt * 1000;
            if (this.powerTimer <= 0) {
                this.powerActive = false;
                this.shadows.forEach(s => s.frightened = false);
                this.setStatus("Gather every signal.");
            }
        }

        this.updatePlayer(dt);
        this.updateShadows(dt);
        this.checkCollisions();
    }

    updatePlayer(dt) {
        const p = this.player;
        const diffSettings = DIFFICULTIES[this.difficulty];
        const speed = diffSettings.playerSpeed * 60 * dt;
        
        // Try to change direction if we are near tile center
        const gridX = Math.floor(p.x / CONFIG.tileSize);
        const gridY = Math.floor(p.y / CONFIG.tileSize);
        const centerX = gridX * CONFIG.tileSize + CONFIG.tileSize / 2;
        const centerY = gridY * CONFIG.tileSize + CONFIG.tileSize / 2;
        
        const distToCenter = Math.sqrt((p.x - centerX)**2 + (p.y - centerY)**2);
        
        if (distToCenter < speed) {
            // Check if nextDir is possible
            if (p.nextDir.x !== 0 || p.nextDir.y !== 0) {
                if (!this.isWall(gridX + p.nextDir.x, gridY + p.nextDir.y)) {
                    p.dir = { ...p.nextDir };
                    p.x = centerX;
                    p.y = centerY;
                }
            }
            
            // Check if current dir is blocked
            if (this.isWall(gridX + p.dir.x, gridY + p.dir.y)) {
                p.dir = { x: 0, y: 0 };
                p.x = centerX;
                p.y = centerY;
            }
            
            // Collect fragment
            const val = this.maze[gridY][gridX];
            if (val === 2) {
                this.maze[gridY][gridX] = 0;
                this.score += 10;
                this.collectedFragments++;
                this.checkLevelClear();
            } else if (val === 3) {
                this.maze[gridY][gridX] = 0;
                this.score += 50;
                this.collectedFragments++;
                this.activatePower();
                this.checkLevelClear();
            }
        }
        
        p.x += p.dir.x * speed;
        p.y += p.dir.y * speed;
        
        // Tunneling (simple wrap)
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
    }

    updateShadows(dt) {
        const diffSettings = DIFFICULTIES[this.difficulty];
        this.shadows.forEach(s => {
            const speed = (s.frightened ? s.speed * 0.5 : s.speed) * 60 * dt;
            
            const gridX = Math.floor(s.x / CONFIG.tileSize);
            const gridY = Math.floor(s.y / CONFIG.tileSize);
            const centerX = gridX * CONFIG.tileSize + CONFIG.tileSize / 2;
            const centerY = gridY * CONFIG.tileSize + CONFIG.tileSize / 2;
            
            const distToCenter = Math.sqrt((s.x - centerX)**2 + (s.y - centerY)**2);
            
            if (distToCenter < speed) {
                s.x = centerX;
                s.y = centerY;
                
                // Choose new direction at intersections
                const possibleDirs = [
                    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
                ].filter(d => {
                    // Don't reverse immediately unless blocked
                    if (d.x === -s.dir.x && d.y === -s.dir.y) return false;
                    return !this.isWall(gridX + d.x, gridY + d.y);
                });
                
                if (possibleDirs.length > 0) {
                    if (s.frightened) {
                        s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    } else {
                        // Chase: pick dir that gets closer to player
                        possibleDirs.sort((a, b) => {
                            const distA = Math.sqrt((s.x + a.x * CONFIG.tileSize - this.player.x)**2 + (s.y + a.y * CONFIG.tileSize - this.player.y)**2);
                            const distB = Math.sqrt((s.x + b.x * CONFIG.tileSize - this.player.x)**2 + (s.y + b.y * CONFIG.tileSize - this.player.y)**2);
                            return distA - distB;
                        });
                        // Use chaseStrength for randomness
                        if (Math.random() < diffSettings.chaseStrength) s.dir = possibleDirs[0];
                        else s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    }
                } else {
                    // Turn back if stuck
                    s.dir = { x: -s.dir.x, y: -s.dir.y };
                }
            }
            
            s.x += s.dir.x * speed;
            s.y += s.dir.y * speed;
            
            if (s.x < 0) s.x = this.canvas.width;
            if (s.x > this.canvas.width) s.x = 0;
        });
    }

    isWall(x, y) {
        if (y < 0 || y >= this.maze.length || x < 0 || x >= this.maze[0].length) return false;
        return this.maze[y][x] === 1;
    }

    activatePower() {
        this.powerActive = true;
        this.powerTimer = CONFIG.powerDuration;
        this.shadows.forEach(s => s.frightened = true);
        this.setStatus("The shadows drift away.");
    }

    checkCollisions() {
        for (let s of this.shadows) {
            const dist = Math.sqrt((s.x - this.player.x)**2 + (s.y - this.player.y)**2);
            if (dist < CONFIG.tileSize * 0.8) {
                if (s.frightened) {
                    // Eat shadow
                    this.score += 200;
                    s.x = s.startX;
                    s.y = s.startY;
                    s.frightened = false;
                    this.updateHUD();
                } else {
                    // Hit by shadow
                    this.lives--;
                    this.updateHUD();
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                    }
                    break;
                }
            }
        }
    }

    resetPositions() {
        // Reset player and shadows to start points without clearing fragments
        for (let y = 0; y < MAZE_LAYOUT.length; y++) {
            for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
                if (MAZE_LAYOUT[y][x] === 4) {
                    this.player.x = x * CONFIG.tileSize + CONFIG.tileSize / 2;
                    this.player.y = y * CONFIG.tileSize + CONFIG.tileSize / 2;
                    this.player.dir = { x: 0, y: 0 };
                    this.player.nextDir = { x: 0, y: 0 };
                }
            }
        }
        this.shadows.forEach(s => {
            s.x = s.startX;
            s.y = s.startY;
            s.dir = { x: 1, y: 0 };
            s.frightened = false;
        });
        this.powerActive = false;
        this.paused = true;
        this.setStatus("The hollow settles.");
        setTimeout(() => {
            this.paused = false;
            this.setStatus("Gather every signal.");
        }, CONFIG.lifeResetDelay);
    }

    checkLevelClear() {
        if (this.collectedFragments >= this.totalFragments) {
            this.level++;
            this.resetLevel();
        }
        this.updateHUD();
    }

    gameOver() {
        this.running = false;
        this.setStatus("The signal fades.");
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(CONFIG.bestScoreKeyPrefix + this.difficulty, this.bestScore);
        }
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').classList.remove('hidden');
    }

    draw() {
        this.ctx.fillStyle = '#09090b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Walls
        this.ctx.strokeStyle = '#1a1528';
        this.ctx.lineWidth = 2;
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillStyle = '#1a1528';
                    this.ctx.fillRect(x * CONFIG.tileSize + 2, y * CONFIG.tileSize + 2, CONFIG.tileSize - 4, CONFIG.tileSize - 4);
                    this.ctx.strokeStyle = '#2d2442';
                    this.ctx.strokeRect(x * CONFIG.tileSize + 2, y * CONFIG.tileSize + 2, CONFIG.tileSize - 4, CONFIG.tileSize - 4);
                } else if (this.maze[y][x] === 2) {
                    // Fragment
                    this.ctx.fillStyle = '#4cc9f0';
                    this.ctx.beginPath();
                    this.ctx.arc(x * CONFIG.tileSize + CONFIG.tileSize / 2, y * CONFIG.tileSize + CONFIG.tileSize / 2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (this.maze[y][x] === 3) {
                    // Echo Node
                    this.ctx.fillStyle = '#fbbf24';
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#fbbf24';
                    this.ctx.beginPath();
                    this.ctx.arc(x * CONFIG.tileSize + CONFIG.tileSize / 2, y * CONFIG.tileSize + CONFIG.tileSize / 2, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
        
        // Player
        this.ctx.fillStyle = '#fafafa';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, CONFIG.tileSize * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Shadows
        this.shadows.forEach(s => {
            this.ctx.fillStyle = s.frightened ? '#4cc9f0' : '#8b6cff';
            if (s.frightened && this.powerTimer < 2000 && Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.fillStyle = '#fafafa';
            }
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.ctx.fillStyle;
            
            // Draw a soft ghost-like shape
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y - 2, CONFIG.tileSize * 0.35, Math.PI, 0);
            this.ctx.lineTo(s.x + CONFIG.tileSize * 0.35, s.y + CONFIG.tileSize * 0.35);
            this.ctx.lineTo(s.x - CONFIG.tileSize * 0.35, s.y + CONFIG.tileSize * 0.35);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(s.x - 3, s.y - 4, 2, 0, Math.PI * 2);
            this.ctx.arc(s.x + 3, s.y - 4, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

const game = new EchoHollow();
