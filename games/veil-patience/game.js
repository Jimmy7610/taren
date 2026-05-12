// ==================================================
// INSTÄLLNINGAR FÖR VEIL PATIENCE
// Alla kommentarer som börjar med "INSTÄLLNING -" är värden som Jimmy enkelt kan testa att ändra i VS Code.
// Ändra bara ett värde i taget och testa spelet efteråt.
// ==================================================

const CONFIG = {
    cardWidth: 72,             // INSTÄLLNING - Ändra kortens bredd.
    cardHeight: 104,           // INSTÄLLNING - Ändra kortens höjd.
    cardMinWidth: 56,          // INSTÄLLNING - Ändra minsta kortbredd.
    tableauGap: 18,            // INSTÄLLNING - Ändra avståndet mellan tableau-kolumner.
    boardHorizontalSafetyPadding: 18, // INSTÄLLNING - Säkerhetsmarginal i sidled.
    cardStackOffset: 26,       // INSTÄLLNING - Ändra hur långt ned varje synligt kort ligger i en kolumn.
    hiddenCardOffset: 14,      // INSTÄLLNING - Ändra avståndet mellan dolda kort i en kolumn.
    drawCount: 1,              // INSTÄLLNING - Ändra om stocken drar 1 eller 3 kort.
    bestTimeKey: "taren_veil_patience_best_time", // INSTÄLLNING - Ändra localStorage-nyckeln för bästa tid.

    // INTERACTION
    dragStartThreshold: 4,      // INSTÄLLNING - Ändra hur många pixlar musen måste röra sig innan ett klick räknas som drag.
    cardDragStackOffset: 26,    // INSTÄLLNING - Ändra avståndet mellan kort i en dragen stapel.

    // VISUAL POLISH
    cardGlowStrength: 0.15,      // INSTÄLLNING - Ändra hur starkt kortens kantglow syns.
    selectedCardGlow: 0.35,     // INSTÄLLNING - Ändra hur tydligt valt kort markeras.
    slotGlowStrength: 0.12,      // INSTÄLLNING - Ändra hur starkt tomma kortplatser glöder.
};

const SUITS = ['hearts', 'diamonds', 'spades', 'clubs'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_SYMBOLS = {
    'hearts': '♥',
    'diamonds': '♦',
    'spades': '♠',
    'clubs': '♣'
};

class VeilPatience {
    constructor() {
        this.board = document.getElementById('game-container');
        this.timerEl = document.getElementById('timer');
        this.movesEl = document.getElementById('moves');
        this.stockCountEl = document.getElementById('stock-count');
        this.bestTimeEl = document.getElementById('best-time');
        
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        
        this.selected = null; // { type, pileIndex, cardIndex }
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.undoStack = [];
        
        this.bestTime = localStorage.getItem(CONFIG.bestTimeKey) || null;
        if (this.bestTime) {
            this.bestTimeEl.textContent = this.formatTime(parseInt(this.bestTime));
        }

        this.dragState = {
            active: false,
            source: null, // { type, pileIndex, cardIndex }
            cards: [],
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,
            didMove: false
        };

        this.initEventListeners();
        this.resizeBoard();
        this.initGame();
    }

    initEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') this.initGame();
            if (e.key.toLowerCase() === 'u') this.undo();
        });
        window.addEventListener('resize', () => this.resizeBoard());

        // Pointer events for dragging
        this.board.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        window.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
    }

    resizeBoard() {
        const wrapper = this.board.parentElement;
        const availableWidth = (wrapper.clientWidth || 800) - CONFIG.boardHorizontalSafetyPadding * 2;
        
        // We have 7 columns and 6 gaps
        // availableWidth = 7*W + 6*G
        // Let's assume G = W * 0.25 (standard ratio)
        // availableWidth = 7*W + 6*(W*0.25) = 7*W + 1.5*W = 8.5*W
        let w = availableWidth / 8.5;
        w = Math.min(w, CONFIG.cardWidth);
        w = Math.max(w, CONFIG.cardMinWidth);
        
        const h = w * (CONFIG.cardHeight / CONFIG.cardWidth);
        const gap = w * 0.25;

        document.documentElement.style.setProperty('--card-width', `${w}px`);
        document.documentElement.style.setProperty('--card-height', `${h}px`);
        document.documentElement.style.setProperty('--tableau-gap', `${gap}px`);
    }

    initGame() {
        // Reset state
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.selected = null;
        this.moves = 0;
        this.undoStack = [];
        this.movesEl.textContent = '0';
        this.stopTimer();
        this.timerEl.textContent = '00:00';
        document.getElementById('game-over').classList.add('hidden');

        // Create and shuffle deck
        const deck = [];
        SUITS.forEach(suit => {
            VALUES.forEach(value => {
                deck.push({ suit, value, faceUp: false });
            });
        });
        this.shuffle(deck);

        // Deal tableau
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = deck.pop();
                if (j === i) card.faceUp = true;
                this.tableau[i].push(card);
            }
        }

        // Remaining cards to stock
        this.stock = deck;
        this.stockCountEl.textContent = this.stock.length;

        this.render();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startTimer() {
        if (this.startTime) return;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerEl.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.startTime = null;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    saveState() {
        const state = JSON.stringify({
            stock: this.stock,
            waste: this.waste,
            foundations: this.foundations,
            tableau: this.tableau,
            moves: this.moves
        });
        this.undoStack.push(state);
        if (this.undoStack.length > 50) this.undoStack.shift();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const state = JSON.parse(this.undoStack.pop());
        this.stock = state.stock;
        this.waste = state.waste;
        this.foundations = state.foundations;
        this.tableau = state.tableau;
        this.moves = state.moves;
        this.movesEl.textContent = this.moves;
        this.selected = null;
        this.render();
    }

    handleCardClick(type, pileIndex, cardIndex) {
        this.startTimer();
        
        // If clicking stock
        if (type === 'stock') {
            this.saveState();
            if (this.stock.length > 0) {
                const count = Math.min(CONFIG.drawCount, this.stock.length);
                for (let i = 0; i < count; i++) {
                    const card = this.stock.pop();
                    card.faceUp = true;
                    this.waste.push(card);
                }
            } else {
                // Recycle waste
                this.stock = this.waste.reverse().map(c => ({ ...c, faceUp: false }));
                this.waste = [];
            }
            this.selected = null;
            this.moves++;
            this.movesEl.textContent = this.moves;
            this.render();
            return;
        }

        const currentPile = this.getPile(type, pileIndex);
        const card = currentPile[cardIndex];

        // Ace Auto-Move logic
        if (card && card.faceUp && card.value === 'A' && !this.selected) {
            if (this.tryAutoMoveToFoundation(type, pileIndex, cardIndex)) {
                return;
            }
        }

        // If something is already selected, try to move
        if (this.selected) {
            // Check if clicking same card to deselect
            if (this.selected.type === type && this.selected.pileIndex === pileIndex && this.selected.cardIndex === cardIndex) {
                this.selected = null;
                this.render();
                return;
            }

            // Try move
            if (this.tryMove(type, pileIndex)) {
                this.selected = null;
                this.moves++;
                this.movesEl.textContent = this.moves;
                this.checkWin();
                this.render();
                return;
            }
        }

        // Selection logic
        if (card && card.faceUp) {
            this.selected = { type, pileIndex, cardIndex };
        } else if (!card && this.selected) {
            // Clicking empty slot
            if (this.tryMove(type, pileIndex)) {
                this.selected = null;
                this.moves++;
                this.movesEl.textContent = this.moves;
                
                // Add status message for foundation
                if (type === 'foundation') {
                    console.log("Core placed.");
                }

                this.checkWin();
            }
        } else {
            this.selected = null;
        }
        
        this.render();
    }

    tryAutoMoveToFoundation(type, pileIndex, cardIndex) {
        const pile = this.getPile(type, pileIndex);
        const card = pile[cardIndex];
        
        // Only allow moving the top card of a stack or waste
        if (cardIndex !== pile.length - 1) return false;

        // Find empty foundation
        for (let i = 0; i < 4; i++) {
            const fPile = this.foundations[i];
            if (fPile.length === 0) {
                if (card.value === 'A') {
                    this.selected = { type, pileIndex, cardIndex };
                    this.executeMove('foundation', i);
                    this.selected = null;
                    this.moves++;
                    this.movesEl.textContent = this.moves;
                    this.checkWin();
                    this.render();
                    return true;
                }
            }
        }
        return false;
    }

    getPile(type, index) {
        if (type === 'waste') return this.waste;
        if (type === 'foundation') return this.foundations[index];
        if (type === 'tableau') return this.tableau[index];
        return [];
    }

    tryMove(toType, toIndex) {
        const fromPile = this.getPile(this.selected.type, this.selected.pileIndex);
        const toPile = this.getPile(toType, toIndex);
        const movingCards = fromPile.slice(this.selected.cardIndex);
        const firstMoving = movingCards[0];

        if (toType === 'foundation') {
            if (movingCards.length !== 1) return false;
            const target = toPile.length === 0 ? null : toPile[toPile.length - 1];
            
            if (!target) {
                if (firstMoving.value === 'A') {
                    this.executeMove(toType, toIndex);
                    return true;
                }
            } else {
                if (firstMoving.suit === target.suit && this.getValueIndex(firstMoving.value) === this.getValueIndex(target.value) + 1) {
                    this.executeMove(toType, toIndex);
                    return true;
                }
            }
        }

        if (toType === 'tableau') {
            const target = toPile.length === 0 ? null : toPile[toPile.length - 1];
            
            if (!target) {
                if (firstMoving.value === 'K') {
                    this.executeMove(toType, toIndex);
                    return true;
                }
            } else {
                if (this.isOppositeColor(firstMoving.suit, target.suit) && this.getValueIndex(firstMoving.value) === this.getValueIndex(target.value) - 1) {
                    this.executeMove(toType, toIndex);
                    return true;
                }
            }
        }

        return false;
    }

    executeMove(toType, toIndex) {
        this.saveState();
        const fromPile = this.getPile(this.selected.type, this.selected.pileIndex);
        const toPile = this.getPile(toType, toIndex);
        const cards = fromPile.splice(this.selected.cardIndex);
        cards.forEach(c => toPile.push(c));

        // Auto-reveal
        if (fromPile.length > 0) {
            fromPile[fromPile.length - 1].faceUp = true;
        }
    }

    getValueIndex(val) {
        return VALUES.indexOf(val);
    }

    isOppositeColor(s1, s2) {
        const red = ['hearts', 'diamonds'];
        const isS1Red = red.includes(s1);
        const isS2Red = red.includes(s2);
        return isS1Red !== isS2Red;
    }

    checkWin() {
        const win = this.foundations.every(f => f.length === 13);
        if (win) {
            this.stopTimer();
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            if (!this.bestTime || elapsed < parseInt(this.bestTime)) {
                this.bestTime = elapsed;
                localStorage.setItem(CONFIG.bestTimeKey, elapsed);
                this.bestTimeEl.textContent = this.formatTime(elapsed);
            }
            document.getElementById('final-stats').textContent = `Time: ${this.formatTime(elapsed)} | Moves: ${this.moves}`;
            document.getElementById('game-over').classList.remove('hidden');
        }
    }

    render() {
        this.board.innerHTML = '';
        
        // Render Top Section (Stock, Waste, Empty, Foundations)
        const topRow = document.createElement('div');
        topRow.className = 'top-piles';
        
        // Stock
        const stockSlot = this.createSlot('stock', 0);
        if (this.stock.length > 0) {
            const cardEl = this.createCardEl({ faceUp: false }, 'stock', 0, this.stock.length - 1);
            stockSlot.appendChild(cardEl);
        } else {
            stockSlot.classList.add('empty-stock');
            stockSlot.innerHTML = '<span style="opacity: 0.2; font-size: 2rem; display:flex; align-items:center; justify-content:center; height:100%;">↻</span>';
        }
        topRow.appendChild(stockSlot);

        // Waste
        const wasteSlot = this.createSlot('waste', 0);
        if (this.waste.length > 0) {
            // If dragging from waste, hide it
            if (!(this.dragState.active && this.dragState.source.type === 'waste')) {
                const cardEl = this.createCardEl(this.waste[this.waste.length - 1], 'waste', 0, this.waste.length - 1);
                wasteSlot.appendChild(cardEl);
            }
        }
        topRow.appendChild(wasteSlot);

        // Spacer
        topRow.appendChild(document.createElement('div'));

        // Foundations
        for (let i = 0; i < 4; i++) {
            const slot = this.createSlot('foundation', i);
            if (this.foundations[i].length > 0) {
                const cardEl = this.createCardEl(this.foundations[i][this.foundations[i].length - 1], 'foundation', i, this.foundations[i].length - 1);
                slot.appendChild(cardEl);
            } else {
                slot.innerHTML = '<span style="opacity: 0.1; font-size: 2rem; display:flex; align-items:center; justify-content:center; height:100%;">A</span>';
            }
            topRow.appendChild(slot);
        }

        this.board.appendChild(topRow);

        // Render Tableau
        const tableauRow = document.createElement('div');
        tableauRow.className = 'tableau-piles';
        
        for (let i = 0; i < 7; i++) {
            const slot = this.createSlot('tableau', i);
            this.tableau[i].forEach((card, j) => {
                // If dragging this card or stack, hide it in the original position
                if (this.dragState.active && 
                    this.dragState.source.type === 'tableau' && 
                    this.dragState.source.pileIndex === i && 
                    j >= this.dragState.source.cardIndex) {
                    return;
                }
                const cardEl = this.createCardEl(card, 'tableau', i, j);
                const offset = card.faceUp ? CONFIG.cardStackOffset : CONFIG.hiddenCardOffset;
                cardEl.style.top = `${j * offset}px`;
                slot.appendChild(cardEl);
            });
            tableauRow.appendChild(slot);
        }

        this.board.appendChild(tableauRow);
        
        this.stockCountEl.textContent = this.stock.length;
    }

    createSlot(type, index) {
        const slot = document.createElement('div');
        slot.className = 'card-slot';
        slot.dataset.type = type;
        slot.dataset.pileIndex = index;
        slot.dataset.cardIndex = -1;
        return slot;
    }

    createCardEl(card, type, pileIndex, cardIndex) {
        const el = document.createElement('div');
        el.className = `card suit-${card.suit}`;
        el.dataset.type = type;
        el.dataset.pileIndex = pileIndex;
        el.dataset.cardIndex = cardIndex;

        if (!card.faceUp) el.classList.add('face-down');
        if (this.selected && this.selected.type === type && this.selected.pileIndex === pileIndex && this.selected.cardIndex === cardIndex) {
            el.classList.add('selected');
        }

        if (card.faceUp) {
            el.innerHTML = `
                <div class="card-top">
                    <span>${card.value}</span>
                    <span>${SUIT_SYMBOLS[card.suit]}</span>
                </div>
                <div class="card-suit-big">${SUIT_SYMBOLS[card.suit]}</div>
            `;
        }

        // Removed el.onclick to use pointer events for dragging
        return el;
    }

    // Pointer Event Handlers
    handlePointerDown(e) {
        const cardEl = e.target.closest('.card');
        const slotEl = e.target.closest('.card-slot');
        
        if (!cardEl && !slotEl) return;

        const type = cardEl ? cardEl.dataset.type : slotEl.dataset.type;
        const pileIndex = parseInt(cardEl ? cardEl.dataset.pileIndex : slotEl.dataset.pileIndex);
        const cardIndex = parseInt(cardEl ? cardEl.dataset.cardIndex : slotEl.dataset.cardIndex);

        if (type === 'stock') {
            this.handleCardClick(type, pileIndex, cardIndex);
            return;
        }

        if (cardEl) {
            const pile = this.getPile(type, pileIndex);
            const card = pile[cardIndex];

            if (card && card.faceUp) {
                this.dragState.active = false; // Wait for movement threshold
                this.dragState.source = { type, pileIndex, cardIndex };
                this.dragState.startX = e.clientX;
                this.dragState.startY = e.clientY;
                this.dragState.didMove = false;

                const rect = cardEl.getBoundingClientRect();
                this.dragState.offsetX = e.clientX - rect.left;
                this.dragState.offsetY = e.clientY - rect.top;
            }
        }
    }

    handlePointerMove(e) {
        if (!this.dragState.source) return;

        if (!this.dragState.active) {
            const dist = Math.sqrt((e.clientX - this.dragState.startX)**2 + (e.clientY - this.dragState.startY)**2);
            if (dist > CONFIG.dragStartThreshold) {
                this.dragState.active = true;
                this.startDragging();
            }
        }

        if (this.dragState.active) {
            this.dragState.currentX = e.clientX;
            this.dragState.currentY = e.clientY;
            this.updateDragPosition();
        }
    }

    handlePointerUp(e) {
        if (!this.dragState.source) return;

        if (this.dragState.active) {
            this.stopDragging(e);
        } else {
            // Treat as click
            this.handleCardClick(this.dragState.source.type, this.dragState.source.pileIndex, this.dragState.source.cardIndex);
        }

        this.dragState.source = null;
        this.dragState.active = false;
        this.dragState.cards = [];
    }

    startDragging() {
        const { type, pileIndex, cardIndex } = this.dragState.source;
        const pile = this.getPile(type, pileIndex);
        this.dragState.cards = pile.slice(cardIndex);

        // Create drag container if not exists
        let container = document.getElementById('drag-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'drag-container';
            container.className = 'drag-container';
            document.body.appendChild(container);
        }
        container.innerHTML = '';

        this.dragState.cards.forEach((card, i) => {
            const el = this.createCardEl(card, type, pileIndex, cardIndex + i);
            el.classList.add('dragging');
            el.style.position = 'absolute';
            el.style.top = `${i * CONFIG.cardDragStackOffset}px`;
            container.appendChild(el);
        });

        // Hide original cards being dragged
        this.render(); 
    }

    updateDragPosition() {
        const container = document.getElementById('drag-container');
        if (!container) return;
        container.style.transform = `translate(${this.dragState.currentX - this.dragState.offsetX}px, ${this.dragState.currentY - this.dragState.offsetY}px)`;
    }

    stopDragging(e) {
        const container = document.getElementById('drag-container');
        if (container) container.innerHTML = '';

        // Find drop target
        const dropEl = document.elementFromPoint(e.clientX, e.clientY);
        const targetSlot = dropEl?.closest('.card-slot');
        const targetCard = dropEl?.closest('.card:not(.dragging)');

        let handled = false;
        if (targetSlot || targetCard) {
            const type = targetSlot ? targetSlot.dataset.type : targetCard.dataset.type;
            const pileIndex = parseInt(targetSlot ? targetSlot.dataset.pileIndex : targetCard.dataset.pileIndex);
            
            // Try move
            this.selected = this.dragState.source;
            if (this.tryMove(type, pileIndex)) {
                this.selected = null;
                this.moves++;
                this.movesEl.textContent = this.moves;
                this.checkWin();
                handled = true;
            }
            this.selected = null;
        }

        this.render();
    }
}

const game = new VeilPatience();
