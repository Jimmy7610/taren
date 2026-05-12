// ==================================================
// INSTÄLLNINGAR FÖR CORELOOM
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    gridSize: 4,               // INSTÄLLNING - Storlek på Coreloom-rutnätet (4x4).
    startingTiles: 2,          // INSTÄLLNING - Hur många brickor som finns från start.
    newTileChanceForFour: 0.1,  // INSTÄLLNING - Chansen (0.0 - 1.0) att en ny bricka blir 4 istället för 2.
    winValue: 2048,            // INSTÄLLNING - Värdet som räknas som stor milstolpe.
    animationDuration: 140,    // INSTÄLLNING - Hur snabbt (ms) brickanimationerna spelas.
    mergePulseDuration: 180,   // INSTÄLLNING - Hur länge (ms) merge-effekten i Coreloom syns.
    bestScoreKey: "taren_coreloom_best_score", // INSTÄLLNING - localStorage-nyckel för bästa poäng.

    // VISUAL POLISH
    tileGlowStrength: 0.15,      // INSTÄLLNING - Ändra hur starkt Coreloom-brickorna lyser.
    highValueGlowStrength: 0.4, // INSTÄLLNING - Ändra hur mycket höga värden ska framhävas.
    boardInnerGlow: 0.12,      // INSTÄLLNING - Ändra hur starkt brädets inre glow syns.
};

class Coreloom {
    constructor() {
        this.gridContainer = document.getElementById('grid-container');
        this.scoreEl = document.getElementById('score');
        this.bestScoreEl = document.getElementById('best-score');
        this.movesEl = document.getElementById('moves');
        this.peakEl = document.getElementById('peak');
        
        this.grid = []; // 2D array of tile values
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(CONFIG.bestScoreKey)) || 0;
        this.moves = 0;
        this.peak = 2;
        this.gameActive = false;
        
        this.history = []; // For undo
        
        this.init();
    }

    init() {
        // Build background grid
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < CONFIG.gridSize * CONFIG.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridContainer.appendChild(cell);
        }
        
        this.bestScoreEl.textContent = this.bestScore;
        
        window.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Touch support
        let touchStartX, touchStartY;
        this.gridContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.gridContainer.addEventListener('touchend', (e) => {
            if (!this.gameActive) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.move(dx > 0 ? 'right' : 'left');
                } else {
                    this.move(dy > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });

        this.reset();
    }

    reset() {
        this.grid = Array(CONFIG.gridSize).fill().map(() => Array(CONFIG.gridSize).fill(0));
        this.score = 0;
        this.moves = 0;
        this.peak = 2;
        this.history = [];
        this.gameActive = true;
        
        document.getElementById('game-over').classList.add('hidden');
        
        for (let i = 0; i < CONFIG.startingTiles; i++) {
            this.addRandomTile();
        }
        
        this.updateUI();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < CONFIG.gridSize; r++) {
            for (let c = 0; c < CONFIG.gridSize; c++) {
                if (this.grid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[r][c] = Math.random() < CONFIG.newTileChanceForFour ? 4 : 2;
        }
    }

    handleInput(e) {
        if (!this.gameActive) return;
        
        if (e.key.toLowerCase() === 'r') this.reset();
        if (e.key.toLowerCase() === 'u') this.undo();

        const keys = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right'
        };

        if (keys[e.code]) {
            this.move(keys[e.code]);
            e.preventDefault();
        }
    }

    undo() {
        if (this.history.length === 0) return;
        const lastState = this.history.pop();
        this.grid = JSON.parse(JSON.stringify(lastState.grid));
        this.score = lastState.score;
        this.moves = lastState.moves;
        this.updateUI();
    }

    saveHistory() {
        this.history.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            moves: this.moves
        });
        if (this.history.length > 20) this.history.shift();
    }

    move(direction) {
        if (!this.gameActive) return;
        this.saveHistory();
        
        let moved = false;
        let mergedPositions = [];
        
        const rotate = (times) => {
            for (let t = 0; t < times; t++) {
                const newGrid = Array(CONFIG.gridSize).fill().map(() => Array(CONFIG.gridSize).fill(0));
                for (let r = 0; r < CONFIG.gridSize; r++) {
                    for (let c = 0; c < CONFIG.gridSize; c++) {
                        newGrid[c][CONFIG.gridSize - 1 - r] = this.grid[r][c];
                    }
                }
                this.grid = newGrid;
            }
        };

        // Align grid so we always "move left"
        if (direction === 'up') rotate(3);
        if (direction === 'right') rotate(2);
        if (direction === 'down') rotate(1);

        // Actual logic (move left)
        for (let r = 0; r < CONFIG.gridSize; r++) {
            let row = this.grid[r].filter(v => v !== 0);
            let newRow = [];
            
            for (let i = 0; i < row.length; i++) {
                if (i < row.length - 1 && row[i] === row[i + 1]) {
                    const newVal = row[i] * 2;
                    newRow.push(newVal);
                    this.score += newVal;
                    if (newVal > this.peak) this.peak = newVal;
                    mergedPositions.push({ r, c: newRow.length - 1 });
                    i++;
                    moved = true;
                } else {
                    newRow.push(row[i]);
                }
            }
            
            while (newRow.length < CONFIG.gridSize) newRow.push(0);
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) moved = true;
            this.grid[r] = newRow;
        }

        // Restore alignment
        const restoreRotate = (times, mergeArr) => {
            for (let t = 0; t < times; t++) {
                const newGrid = Array(CONFIG.gridSize).fill().map(() => Array(CONFIG.gridSize).fill(0));
                mergeArr.forEach(pos => {
                    const newR = pos.c;
                    const newC = CONFIG.gridSize - 1 - pos.r;
                    pos.r = newR;
                    pos.c = newC;
                });
                for (let r = 0; r < CONFIG.gridSize; r++) {
                    for (let c = 0; c < CONFIG.gridSize; c++) {
                        newGrid[c][CONFIG.gridSize - 1 - r] = this.grid[r][c];
                    }
                }
                this.grid = newGrid;
            }
        };

        if (direction === 'up') restoreRotate(1, mergedPositions);
        if (direction === 'right') restoreRotate(2, mergedPositions);
        if (direction === 'down') restoreRotate(3, mergedPositions);

        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateUI(mergedPositions);
            if (this.isGameOver()) {
                this.gameOver();
            }
        } else {
            this.history.pop();
        }
    }

    isGameOver() {
        for (let r = 0; r < CONFIG.gridSize; r++) {
            for (let c = 0; c < CONFIG.gridSize; c++) {
                if (this.grid[r][c] === 0) return false;
                if (r < CONFIG.gridSize - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
                if (c < CONFIG.gridSize - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
            }
        }
        return true;
    }

    gameOver() {
        this.gameActive = false;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(CONFIG.bestScoreKey, this.bestScore);
        }
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('game-over').classList.remove('hidden');
    }

    updateUI(mergedPositions = []) {
        this.scoreEl.textContent = this.score;
        this.bestScoreEl.textContent = this.bestScore;
        this.movesEl.textContent = this.moves;
        this.peakEl.textContent = this.peak;
        
        // Remove old tiles
        const tiles = this.gridContainer.querySelectorAll('.tile');
        tiles.forEach(t => t.remove());
        
        for (let r = 0; r < CONFIG.gridSize; r++) {
            for (let c = 0; c < CONFIG.gridSize; c++) {
                if (this.grid[r][c] !== 0) {
                    const tile = document.createElement('div');
                    const val = this.grid[r][c];
                    const isMerged = mergedPositions.some(p => p.r === r && p.c === c);
                    
                    tile.className = `tile tile-${val} ${isMerged ? 'tile-merge' : ''}`;
                    tile.textContent = val;
                    
                    tile.style.top = `calc(${r} * (var(--tile-size) + var(--tile-gap)))`;
                    tile.style.left = `calc(${c} * (var(--tile-size) + var(--tile-gap)))`;
                    
                    this.gridContainer.appendChild(tile);
                }
            }
        }
    }
}

const game = new Coreloom();
