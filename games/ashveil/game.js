// ==================================================
// INSTÄLLNINGAR FÖR ASHVEIL
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    tileSize: 36,        // INSTÄLLNING - Ändra grundstorleken på varje ruta (används i CSS men kan styras här).
    tileGap: 3,         // INSTÄLLNING - Avståndet mellan rutorna.
    firstClickSafe: true, // INSTÄLLNING - Om första klicket alltid ska vara säkert.
    longPressDelay: 400, // INSTÄLLNING - Hur länge man håller (ms) på mobil för att markera (om touch-stöd används).
    bestTimeKeyPrefix: "taren_ashveil_best_", // INSTÄLLNING - Prefix för localStorage.
};

const DIFFICULTIES = {
    quiet: {
        label: "Quiet",
        cols: 9,      // INSTÄLLNING - Kolumner för Quiet.
        rows: 9,      // INSTÄLLNING - Rader för Quiet.
        embers: 10    // INSTÄLLNING - Antal farliga rutor för Quiet.
    },
    deep: {
        label: "Deep",
        cols: 16,     // INSTÄLLNING - Kolumner för Deep.
        rows: 12,     // INSTÄLLNING - Rader för Deep.
        embers: 28    // INSTÄLLNING - Antal farliga rutor för Deep.
    },
    abyss: {
        label: "Abyss",
        cols: 20,     // INSTÄLLNING - Kolumner för Abyss.
        rows: 14,     // INSTÄLLNING - Rader för Abyss.
        embers: 48    // INSTÄLLNING - Antal farliga rutor för Abyss.
    }
};

class Ashveil {
    constructor() {
        this.difficulty = 'quiet';
        this.board = []; // Array of cell objects: { isEmber, isRevealed, isMarked, neighborCount }
        this.gameActive = false;
        this.isFirstClick = true;
        this.mode = 'reveal'; // 'reveal' or 'mark'
        
        this.timer = 0;
        this.timerInterval = null;
        this.moves = 0;
        this.marksUsed = 0;

        // Elements
        this.fieldEl = document.getElementById('field');
        this.timerEl = document.getElementById('timer');
        this.marksEl = document.getElementById('marks-count');
        this.movesEl = document.getElementById('moves-count');
        this.bestEl = document.getElementById('best-time');
        this.statusEl = document.getElementById('status');

        this.init();
    }

    init() {
        this.setDifficulty(this.difficulty);
        
        // Prevent context menu on the field
        this.fieldEl.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') this.reset();
            if (e.key === '1') this.setDifficulty('quiet');
            if (e.key === '2') this.setDifficulty('deep');
            if (e.key === '3') this.setDifficulty('abyss');
        });
    }

    setDifficulty(key) {
        if (!DIFFICULTIES[key]) return;
        this.difficulty = key;
        
        // Update UI
        document.querySelectorAll('.ash-controls .btn').forEach(btn => btn.classList.remove('btn-primary'));
        document.querySelectorAll('.ash-controls .btn').forEach(btn => btn.classList.add('btn-secondary'));
        document.getElementById(`btn-${key}`).classList.remove('btn-secondary');
        document.getElementById(`btn-${key}`).classList.add('btn-primary');
        
        this.reset();
        this.loadBest();
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('mode-reveal').classList.toggle('active', mode === 'reveal');
        document.getElementById('mode-mark').classList.toggle('active', mode === 'mark');
    }

    reset() {
        this.stopTimer();
        this.timer = 0;
        this.moves = 0;
        this.marksUsed = 0;
        this.isFirstClick = true;
        this.gameActive = true;
        this.updateHUD();
        this.setStatus("Read the field.");
        
        const config = DIFFICULTIES[this.difficulty];
        this.createBoard(config.cols, config.rows);
        this.render();
    }

    createBoard(cols, rows) {
        this.board = [];
        const total = cols * rows;
        for (let i = 0; i < total; i++) {
            this.board.push({
                isEmber: false,
                isRevealed: false,
                isMarked: false,
                neighborCount: 0
            });
        }
        
        this.fieldEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.fieldEl.style.width = `calc(${cols} * (var(--tile-size) + var(--tile-gap)))`;
    }

    // Place embers AFTER first click to guarantee safety
    placeEmbers(safeIndex) {
        const config = DIFFICULTIES[this.difficulty];
        const totalCells = config.cols * config.rows;
        let embersPlaced = 0;
        
        // Get neighbors of safeIndex to keep them safe too if possible (for a better start)
        const safeNeighbors = this.getNeighbors(safeIndex);
        const ultraSafe = [safeIndex, ...safeNeighbors];

        while (embersPlaced < config.embers) {
            const index = Math.floor(Math.random() * totalCells);
            if (!this.board[index].isEmber && !ultraSafe.includes(index)) {
                this.board[index].isEmber = true;
                embersPlaced++;
            }
        }
        
        this.calculateNumbers();
    }

    calculateNumbers() {
        const config = DIFFICULTIES[this.difficulty];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].isEmber) continue;
            
            const neighbors = this.getNeighbors(i);
            let count = 0;
            neighbors.forEach(nIndex => {
                if (this.board[nIndex].isEmber) count++;
            });
            this.board[i].neighborCount = count;
        }
    }

    getNeighbors(index) {
        const config = DIFFICULTIES[this.difficulty];
        const neighbors = [];
        const col = index % config.cols;
        const row = Math.floor(index / config.cols);

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const nr = row + dr;
                const nc = col + dc;
                
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                    neighbors.push(nr * config.cols + nc);
                }
            }
        }
        return neighbors;
    }

    handleTileClick(index, isRightClick = false) {
        if (!this.gameActive) return;

        if (isRightClick || this.mode === 'mark') {
            this.toggleMark(index);
        } else {
            this.revealTile(index);
        }
    }

    toggleMark(index) {
        const cell = this.board[index];
        if (cell.isRevealed) return;

        cell.isMarked = !cell.isMarked;
        this.marksUsed += cell.isMarked ? 1 : -1;
        this.updateHUD();
        this.setStatus(cell.isMarked ? "Mark placed." : "Mark removed.");
        this.render();
    }

    revealTile(index) {
        const cell = this.board[index];
        if (cell.isRevealed || cell.isMarked) return;

        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeEmbers(index);
            this.startTimer();
        }

        this.moves++;
        
        if (cell.isEmber) {
            this.lose(index);
        } else {
            this.floodReveal(index);
            this.updateHUD();
            this.checkWin();
        }
        this.render();
    }

    floodReveal(index) {
        const cell = this.board[index];
        if (cell.isRevealed || cell.isMarked || cell.isEmber) return;

        cell.isRevealed = true;

        if (cell.neighborCount === 0) {
            const neighbors = this.getNeighbors(index);
            neighbors.forEach(nIndex => this.floodReveal(nIndex));
        }
    }

    checkWin() {
        const config = DIFFICULTIES[this.difficulty];
        const safeTiles = this.board.filter(c => !c.isEmber);
        const revealedSafe = safeTiles.filter(c => c.isRevealed);
        
        if (revealedSafe.length === safeTiles.length) {
            this.win();
        }
    }

    win() {
        this.gameActive = false;
        this.stopTimer();
        this.setStatus("The field is clear.");
        this.saveBest();
        
        // Mark remaining embers
        this.board.forEach(c => {
            if (c.isEmber) c.isMarked = true;
        });
    }

    lose(triggerIndex) {
        this.gameActive = false;
        this.stopTimer();
        this.setStatus("Something woke below.");
        
        // Reveal all embers
        this.board.forEach((c, idx) => {
            if (c.isEmber) c.isRevealed = true;
        });
        
        // Highlight the one that killed you
        setTimeout(() => {
            const el = this.fieldEl.children[triggerIndex];
            if (el) el.classList.add('ember-revealed');
        }, 50);
    }

    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateHUD();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    updateHUD() {
        const config = DIFFICULTIES[this.difficulty];
        
        // Timer format
        const mins = Math.floor(this.timer / 60);
        const secs = this.timer % 60;
        this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        this.marksEl.textContent = Math.max(0, config.embers - this.marksUsed);
        this.movesEl.textContent = this.moves;
    }

    setStatus(msg) {
        this.statusEl.textContent = msg;
    }

    saveBest() {
        const key = `${CONFIG.bestTimeKeyPrefix}${this.difficulty}`;
        const currentBest = localStorage.getItem(key);
        if (!currentBest || this.timer < parseInt(currentBest)) {
            localStorage.setItem(key, this.timer);
            this.loadBest();
        }
    }

    loadBest() {
        const key = `${CONFIG.bestTimeKeyPrefix}${this.difficulty}`;
        const best = localStorage.getItem(key);
        if (best) {
            const mins = Math.floor(best / 60);
            const secs = best % 60;
            this.bestEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            this.bestEl.textContent = "--";
        }
    }

    render() {
        // Clear or create elements
        if (this.fieldEl.children.length !== this.board.length) {
            this.fieldEl.innerHTML = '';
            this.board.forEach((_, i) => {
                const tile = document.createElement('div');
                tile.className = 'ash-tile';
                tile.addEventListener('click', () => this.handleTileClick(i));
                tile.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleTileClick(i, true);
                });
                this.fieldEl.appendChild(tile);
            });
        }

        // Update classes and content
        this.board.forEach((cell, i) => {
            const el = this.fieldEl.children[i];
            el.className = 'ash-tile';
            el.textContent = '';

            if (cell.isRevealed) {
                el.classList.add('revealed');
                if (cell.isEmber) {
                    el.classList.add('ember');
                    el.textContent = '●';
                } else if (cell.neighborCount > 0) {
                    el.textContent = cell.neighborCount;
                    el.classList.add(`n-${cell.neighborCount}`);
                }
            } else if (cell.isMarked) {
                el.classList.add('marked');
            }
        });
    }
}

// Start game
const game = new Ashveil();
