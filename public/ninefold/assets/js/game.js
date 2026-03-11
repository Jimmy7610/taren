(function () {
    /**
     * NINEFOLD - Core Logic
     */
    const CONFIG = {
        difficulty: {
            faint: 40, // Clues
            still: 32,
            deep: 24
        },
        mistakeLimit: 3
    };

    let state = {
        solution: [],
        grid: [],
        initial: [],
        notes: Array(81).fill().map(() => []),
        selected: null,
        notesMode: false,
        mistakes: 0,
        time: 0,
        history: [],
        level: 'still'
    };

    let timerInterval = null;

    // --- DOM ELEMENTS ---
    const elements = {
        setup: document.getElementById('nf-setup'),
        game: document.getElementById('nf-game'),
        grid: document.getElementById('nf-grid'),
        timer: document.getElementById('nf-timer'),
        mistakes: document.getElementById('nf-mistakes'),
        notesBtn: document.getElementById('nf-notes'),
        undoBtn: document.getElementById('nf-undo'),
        eraseBtn: document.getElementById('nf-erase'),
        overlay: document.getElementById('nf-overlay'),
        overlayTitle: document.getElementById('nf-overlay-title'),
        overlayText: document.getElementById('nf-overlay-text'),
        overlayBtn: document.getElementById('nf-overlay-btn'),
        newGameBtn: document.getElementById('nf-new-game')
    };

    // --- INITIALIZATION ---
    function init() {
        document.querySelectorAll('.nf-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => startNewGame(btn.dataset.level));
        });

        document.querySelectorAll('.nf-num').forEach(btn => {
            btn.addEventListener('click', () => handleInput(parseInt(btn.dataset.val)));
        });

        elements.notesBtn.addEventListener('click', toggleNotesMode);
        elements.undoBtn.addEventListener('click', undo);
        elements.eraseBtn.addEventListener('click', erase);
        elements.newGameBtn.addEventListener('click', () => {
            elements.game.classList.add('hidden');
            elements.setup.classList.remove('hidden');
            stopTimer();
        });

        elements.overlayBtn.addEventListener('click', () => {
            elements.overlay.classList.add('hidden');
            elements.game.classList.add('hidden');
            elements.setup.classList.remove('hidden');
        });

        window.addEventListener('keydown', handleKeydown);

        // Load saved game if exists
        const saved = localStorage.getItem('nf_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                // Wrap sets back? No, stored as arrays
                resumeGame();
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
    }

    // --- CORE SUDOKU LOGIC ---
    function generateSolution() {
        const board = Array(81).fill(0);
        solve(board);
        return board;
    }

    function solve(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (let n of nums) {
                    if (isValid(board, i, n)) {
                        board[i] = n;
                        if (solve(board)) return true;
                        board[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    function isValid(board, index, val) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === val) return false;
            if (board[i * 9 + col] === val) return false;
        }

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[(boxRow + r) * 9 + (boxCol + c)] === val) return false;
            }
        }
        return true;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createPuzzle(solution, clues) {
        const puzzle = [...solution];
        const indices = shuffle([...Array(81).keys()]);
        let removed = 0;
        const target = 81 - clues;

        for (let idx of indices) {
            if (removed >= target) break;
            puzzle[idx] = 0;
            removed++;
        }
        return puzzle;
    }

    // --- GAME FLOW ---
    function startNewGame(level) {
        const solution = generateSolution();
        const initial = createPuzzle(solution, CONFIG.difficulty[level]);
        
        state = {
            solution,
            grid: [...initial],
            initial: [...initial],
            notes: Array(81).fill().map(() => []),
            selected: null,
            notesMode: false,
            mistakes: 0,
            time: 0,
            history: [],
            level
        };

        elements.setup.classList.add('hidden');
        elements.game.classList.remove('hidden');
        elements.overlay.classList.add('hidden');
        
        renderGrid();
        updateStatus();
        startTimer();
        saveState();
    }

    function resumeGame() {
        elements.setup.classList.add('hidden');
        elements.game.classList.remove('hidden');
        renderGrid();
        updateStatus();
        startTimer();
    }

    // --- RENDERING ---
    function renderGrid() {
        elements.grid.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'nf-cell';
            if (state.initial[i] !== 0) cell.classList.add('nf-fixed');
            if (state.selected === i) cell.classList.add('nf-selected');
            
            const val = state.grid[i];
            if (val !== 0) {
                cell.textContent = val;
                if (val !== state.solution[i] && state.initial[i] === 0) {
                    cell.classList.add('nf-error');
                }
            } else if (state.notes[i].length > 0) {
                const notesGrid = document.createElement('div');
                notesGrid.className = 'nf-notes-grid';
                for (let n = 1; n <= 9; n++) {
                    const note = document.createElement('div');
                    note.className = 'nf-note';
                    note.textContent = state.notes[i].includes(n) ? n : '';
                    notesGrid.appendChild(note);
                }
                cell.appendChild(notesGrid);
            }

            // Highlighting same row/col/box (subtle)
            if (state.selected !== null && isRelated(state.selected, i)) {
                cell.classList.add('nf-highlight');
            }

            cell.addEventListener('click', () => selectCell(i));
            elements.grid.appendChild(cell);
        }
    }

    function isRelated(a, b) {
        if (a === b) return false;
        const ra = Math.floor(a / 9), ca = a % 9;
        const rb = Math.floor(b / 9), cb = b % 9;
        const ba = Math.floor(ra / 3) * 3 + Math.floor(ca / 3);
        const bb = Math.floor(rb / 3) * 3 + Math.floor(cb / 3);
        return ra === rb || ca === cb || ba === bb;
    }

    function selectCell(index) {
        state.selected = index;
        renderGrid();
    }

    function updateStatus() {
        elements.mistakes.textContent = `Mistakes: ${state.mistakes}/${CONFIG.mistakeLimit}`;
        elements.notesBtn.querySelector('.nf-badge').textContent = state.notesMode ? 'ON' : 'OFF';
        elements.notesBtn.classList.toggle('active', state.notesMode);
    }

    // --- ACTIONS ---
    function handleInput(val) {
        if (state.selected === null || state.initial[state.selected] !== 0) return;

        const idx = state.selected;
        
        // Push to history for undo (simplified)
        state.history.push(JSON.stringify({
            grid: state.grid,
            notes: state.notes,
            mistakes: state.mistakes
        }));
        if (state.history.length > 20) state.history.shift();

        if (state.notesMode) {
            const cellNotes = state.notes[idx];
            if (cellNotes.includes(val)) {
                state.notes[idx] = cellNotes.filter(n => n !== val);
            } else {
                state.notes[idx] = [...cellNotes, val].sort();
            }
            state.grid[idx] = 0; // Clear cell if putting notes
        } else {
            if (state.grid[idx] === val) return;
            
            state.grid[idx] = val;
            state.notes[idx] = []; // Clear notes if putting value

            if (val !== state.solution[idx]) {
                state.mistakes++;
                if (state.mistakes >= CONFIG.mistakeLimit) {
                    gameOver(false);
                }
            } else {
                checkWin();
            }
        }

        renderGrid();
        updateStatus();
        saveState();
    }

    function undo() {
        if (state.history.length === 0) return;
        const last = JSON.parse(state.history.pop());
        state.grid = last.grid;
        state.notes = last.notes;
        state.mistakes = last.mistakes;
        renderGrid();
        updateStatus();
        saveState();
    }

    function erase() {
        if (state.selected === null || state.initial[state.selected] !== 0) return;
        
        state.history.push(JSON.stringify({
            grid: state.grid,
            notes: state.notes,
            mistakes: state.mistakes
        }));

        state.grid[state.selected] = 0;
        state.notes[state.selected] = [];
        renderGrid();
        saveState();
    }

    function toggleNotesMode() {
        state.notesMode = !state.notesMode;
        updateStatus();
    }

    // --- UTILS ---
    function startTimer() {
        stopTimer();
        timerInterval = setInterval(() => {
            state.time++;
            const m = Math.floor(state.time / 60).toString().padStart(2, '0');
            const s = (state.time % 60).toString().padStart(2, '0');
            elements.timer.textContent = `${m}:${s}`;
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    function checkWin() {
        if (state.grid.every((val, i) => val === state.solution[i])) {
            gameOver(true);
        }
    }

    function gameOver(won) {
        stopTimer();
        elements.overlay.classList.remove('hidden');
        elements.overlayTitle.textContent = won ? "Complete" : "Faded";
        elements.overlayText.textContent = won ? "The pattern is balanced." : "Continuity lost.";
        localStorage.removeItem('nf_state');
    }

    function saveState() {
        localStorage.setItem('nf_state', JSON.stringify({
            grid: state.grid,
            initial: state.initial,
            solution: state.solution,
            notes: state.notes,
            mistakes: state.mistakes,
            time: state.time,
            level: state.level
        }));
    }

    function handleKeydown(e) {
        if (elements.game.classList.contains('hidden')) return;
        
        if (e.key >= '1' && e.key <= '9') {
            handleInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            erase();
        } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            undo();
        } else if (e.key === 'n') {
            toggleNotesMode();
        } else if (e.key.startsWith('Arrow')) {
            if (state.selected === null) {
                selectCell(0);
                return;
            }
            let idx = state.selected;
            if (e.key === 'ArrowUp') idx = (idx - 9 + 81) % 81;
            if (e.key === 'ArrowDown') idx = (idx + 9) % 81;
            if (e.key === 'ArrowLeft') idx = (idx - 1 + 81) % 81;
            if (e.key === 'ArrowRight') idx = (idx + 1) % 81;
            selectCell(idx);
        }
    }

    init();
})();
