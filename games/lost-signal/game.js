/**
 * Lost Signal - Foundation Rebuild
 * "Den dag Taren ringde tillbaka"
 */

import { scenes } from './data/scenes.js';
import { items } from './data/items.js';

class LostSignal {
    constructor() {
        this.state = {
            currentScene: 'pier',
            inventory: [],
            selectedItem: null,
            language: localStorage.getItem('taren_lang') || 'en',
            theme: localStorage.getItem('taren_theme') || 'dark',
            flags: {
                has_fuse: false,
                has_rag: false,
                fuse_cleaned: false,
                fuse_inserted: false,
                lever_state: 'OFF', // OFF, ON, MAYBE, NOT YET, ASK LATER
                station_awake: false
            }
        };

        this.ui = {
            viewport: document.getElementById('scene-viewport'),
            container: document.getElementById('scene-container'),
            hotspots: document.getElementById('hotspot-layer'),
            dialogue: document.getElementById('dialogue-text'),
            inventory: document.getElementById('inventory-bar'),
            objective: document.getElementById('current-objective'),
            sceneTitle: document.getElementById('scene-title'),
            signalMeter: document.getElementById('signal-value')
        };

        // INSTÄLLNING - Fade tider och hastighet
        this.config = {
            textSpeed: 30, // INSTÄLLNING - Millisekunder per tecken
            fadeTime: 500  // INSTÄLLNING - Scenövergångstid
        };
    }

    init() {
        this.bindEvents();
        this.loadState();
        this.renderScene();
        this.updateInventory();
        this.updateObjective();
        console.log("Lost Signal Foundation Rebuild initialized.");
    }

    bindEvents() {
        document.getElementById('start-btn')?.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-ui').classList.remove('hidden');
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => this.resetGame());
        document.getElementById('lang-toggle')?.addEventListener('click', () => this.toggleLanguage());
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Background click to clear dialogue
        this.ui.viewport.addEventListener('click', (e) => {
            if (e.target === this.ui.viewport || e.target === this.ui.container) {
                this.clearDialogue();
            }
        });
    }

    renderScene() {
        const scene = scenes[this.state.currentScene];
        this.ui.sceneTitle.innerText = scene.name[this.state.language];
        
        // INSTÄLLNING - Scenövergång och fallbacks
        this.ui.container.className = ''; // Reset classes
        this.ui.container.classList.add(`scene-${scene.id}`);
        
        console.info("[Lost Signal] Loading scene image:", scene.background);

        // Försök ladda bakgrundsbilden
        const img = new Image();
        img.onload = () => {
            this.ui.container.style.backgroundImage = `url(${scene.background})`;
            this.ui.container.classList.remove('fallback-active');
        };
        img.onerror = () => {
            // INSTÄLLNING - Dev-loggning för saknade assets
            console.warn(`[Lost Signal] Scene asset missing: ${scene.background}. Using atmospheric CSS fallback for "${scene.id}".`);
            this.ui.container.style.backgroundImage = 'none';
            this.ui.container.classList.add('fallback-active');
        };
        img.src = scene.background;

        this.ui.container.classList.add('scene-fade-in');
        
        // Render Hotspots
        this.ui.hotspots.innerHTML = '';
        scene.hotspots.forEach(hs => {
            const el = document.createElement('div');
            el.className = 'hotspot';
            el.style.left = `${hs.x}%`;
            el.style.top = `${hs.y}%`;
            el.style.width = `${hs.w}%`;
            el.style.height = `${hs.h}%`;
            el.setAttribute('tabindex', '0'); // För tillgänglighet och focus-styling
            
            const label = document.createElement('span');
            label.className = 'hotspot-label';
            label.innerText = hs.name[this.state.language];
            el.appendChild(label);

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleHotspot(hs);
            });

            // Enter key support for hotspots
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleHotspot(hs);
                }
            });
            
            this.ui.hotspots.appendChild(el);
        });

        this.showText(scene.description[this.state.language]);
        setTimeout(() => this.ui.container.classList.remove('scene-fade-in'), this.config.fadeTime);
    }

    handleHotspot(hs) {
        // If an item is selected, try using it
        if (this.state.selectedItem) {
            this.useItem(this.state.selectedItem, hs);
            return;
        }

        // Normal interaction
        if (hs.interact) {
            const act = hs.interact;
            
            if (act.action === 'transition') {
                this.state.currentScene = act.target;
                this.renderScene();
                return;
            }

            if (act.action === 'pickup') {
                if (this.checkCondition(act.condition)) {
                    this.pickupItem(act.itemId);
                    this.showText(act.success[this.state.language]);
                } else {
                    this.showText(this.state.language === 'en' ? "There's nothing left here." : "Det finns inget kvar här.");
                }
                return;
            }

            if (act.action === 'puzzle' && act.id === 'fuse_puzzle') {
                this.handleFuseBox();
                return;
            }

            if (act.action === 'dialogue') {
                this.showText(act.text[this.state.language]);
                return;
            }
            
            if (act.action === 'funny_button') {
                const lines = this.state.language === 'en' ? [
                    "The button appears to know exactly how interesting it is.",
                    "Not yet. Especially not because you want to.",
                    "This is precisely the sort of behavior the warning label was trying to prevent."
                ] : [
                    "Knappen verkar veta exakt hur intressant den är.",
                    "Inte än. Särskilt inte bara för att du vill det.",
                    "Det här är precis den sortens beteende som varningsskylten försökte förhindra."
                ];
                this.showText(lines[Math.floor(Math.random() * lines.length)]);
                return;
            }

            if (act.action === 'printer_output') {
                this.showText(this.state.language === 'en' ? 
                    "SIGNAL FRAGMENT 01\nSOURCE: NOT SEA\nSOURCE: NOT SKY\nSOURCE: HERE" : 
                    "SIGNALFRAGMENT 01\nKÄLLA: EJ HAV\nKÄLLA: EJ HIMMEL\nKÄLLA: HÄR");
                return;
            }
        }

        // Fallback to look
        if (hs.look) {
            this.showText(hs.look[this.state.language]);
        }
    }

    checkCondition(cond) {
        if (cond === 'not_has_fuse') return !this.state.flags.has_fuse;
        if (cond === 'not_has_rag') return !this.state.flags.has_rag;
        return true;
    }

    pickupItem(itemId) {
        this.state.inventory.push(itemId);
        if (itemId === 'rusty_fuse') this.state.flags.has_fuse = true;
        if (itemId === 'rag') this.state.flags.has_rag = true;
        this.updateInventory();
        this.saveState();
    }

    useItem(itemId, hs) {
        // Item + Item logic (Rag + Rusty Fuse)
        if (itemId === 'rag' && hs.id === 'toolbox' && this.state.flags.has_fuse) {
             // Handle case where item is used on its origin or if we want to combine in inventory
             // For now, let's allow "Use Rag on Rusty Fuse" in inventory logic
        }

        // Rag on Rusty Fuse (if selected fuse, use rag? or vice versa)
        // Let's implement a simple combine in inventory
        
        // Exterior Fuse Box
        if (hs.id === 'fuse_box') {
            if (itemId === 'clean_fuse') {
                this.state.flags.fuse_inserted = true;
                this.removeItem('clean_fuse');
                this.showText(this.state.language === 'en' ? 
                    "The clean fuse fits perfectly. The box looks slightly less judgmental now." : 
                    "Den rena säkringen passar perfekt. Boxen ser något mindre dömande ut nu.");
                this.saveState();
                return;
            }
            if (itemId === 'rusty_fuse') {
                this.showText(this.state.language === 'en' ? 
                    "The fuse is too rusty to make a connection. It needs a good scrub." : 
                    "Säkringen är för rostig för att få kontakt. Den behöver skrubbas ordentligt.");
                return;
            }
        }

        this.showText(this.state.language === 'en' ? 
            "Bold idea. Not a good idea, but definitely bold." : 
            "Djärv idé. Ingen bra idé, men definitivt djärv.");
        
        this.state.selectedItem = null;
        this.updateInventory();
    }

    handleFuseBox() {
        if (!this.state.flags.fuse_inserted) {
            this.showText(this.state.language === 'en' ? 
                "The fuse box is empty. It's waiting for someone to do their job." : 
                "Säkringsboxen är tom. Den väntar på att någon ska göra sitt jobb.");
            return;
        }

        const states = ['OFF', 'MAYBE', 'ON', 'NOT YET', 'ASK LATER'];
        let idx = states.indexOf(this.state.flags.lever_state);
        idx = (idx + 1) % states.length;
        this.state.flags.lever_state = states[idx];
        
        let msg = `${this.state.language === 'en' ? 'Lever set to' : 'Spak inställd på'}: ${this.state.flags.lever_state}`;
        
        if (this.state.flags.lever_state === 'ON' && this.state.flags.fuse_inserted) {
            this.state.flags.station_awake = true;
            msg += `\n\n${this.state.language === 'en' ? 
                "The station wakes with the sound of an old friend reluctantly admitting it was asleep." : 
                "Stationen vaknar med ljudet av en gammal vän som motvilligt erkänner att den sov."}`;
            this.updateObjective();
            this.applyWorldChanges();
        }

        this.showText(msg);
        this.saveState();
    }

    applyWorldChanges() {
        if (this.state.flags.station_awake) {
            // Update exterior scene logic to unlock door
            const exterior = scenes.exterior;
            const door = exterior.hotspots.find(h => h.id === 'locked_door');
            if (door) {
                door.interact = {
                    action: "transition",
                    target: "control_room"
                };
            }
            this.ui.signalMeter.style.width = '25%';
        }
    }

    showText(text) {
        if (!text) return;
        this.ui.dialogue.textContent = '';
        let i = 0;
        const type = () => {
            if (i < text.length) {
                this.ui.dialogue.textContent += text.charAt(i);
                i++;
                setTimeout(type, this.config.textSpeed);
            }
        };
        type();
    }

    clearDialogue() {
        this.ui.dialogue.innerText = '';
    }

    updateInventory() {
        this.ui.inventory.innerHTML = '';
        this.state.inventory.forEach(itemId => {
            const item = items[itemId];
            const el = document.createElement('div');
            el.className = `inventory-item ${this.state.selectedItem === itemId ? 'selected' : ''}`;
            el.innerHTML = `<span class="item-name">${item.name[this.state.language]}</span>`;
            
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(itemId);
            });
            
            this.ui.inventory.appendChild(el);
        });

        // Special Combine Logic in Inventory
        if (this.state.inventory.includes('rusty_fuse') && this.state.inventory.includes('rag')) {
            const combineBtn = document.createElement('button');
            combineBtn.className = 'btn-tiny combine-btn';
            combineBtn.innerText = this.state.language === 'en' ? "Clean Fuse with Rag" : "Rengör säkring med trasa";
            combineBtn.onclick = () => {
                this.removeItem('rusty_fuse');
                this.state.inventory.push('clean_fuse');
                this.state.flags.fuse_cleaned = true;
                this.showText(this.state.language === 'en' ? 
                    "You scrub the fuse. It's still a fuse, but now it's a fuse with a brighter future." : 
                    "Du skrubbar säkringen. Det är fortfarande en säkring, men nu är det en säkring med en ljusare framtid.");
                this.updateInventory();
                this.saveState();
            };
            this.ui.inventory.appendChild(combineBtn);
        }
    }

    selectItem(itemId) {
        if (this.state.selectedItem === itemId) {
            this.state.selectedItem = null;
        } else {
            this.state.selectedItem = itemId;
            const item = items[itemId];
            this.showText(item.description[this.state.language]);
        }
        this.updateInventory();
    }

    removeItem(itemId) {
        this.state.inventory = this.state.inventory.filter(id => id !== itemId);
        if (this.state.selectedItem === itemId) this.state.selectedItem = null;
        this.updateInventory();
    }

    updateObjective() {
        if (this.state.flags.station_awake) {
            this.ui.objective.innerText = this.state.language === 'en' ? "Explore the station." : "Utforska stationen.";
        } else {
            this.ui.objective.innerText = this.state.language === 'en' ? "Restore power to the station." : "Återställ strömmen till stationen.";
        }
    }

    toggleLanguage() {
        this.state.language = this.state.language === 'en' ? 'sv' : 'en';
        localStorage.setItem('taren_lang', this.state.language);
        this.renderScene();
        this.updateInventory();
        this.updateObjective();
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        document.body.className = this.state.theme + '-mode';
        localStorage.setItem('taren_theme', this.state.theme);
    }

    saveState() {
        localStorage.setItem('lost_signal_state', JSON.stringify(this.state));
    }

    loadState() {
        const saved = localStorage.getItem('lost_signal_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.inventory = parsed.inventory || [];
            this.state.flags = parsed.flags || this.state.flags;
            this.state.currentScene = parsed.currentScene || 'pier';
            this.applyWorldChanges();
        }
        document.body.className = this.state.theme + '-mode';
    }

    resetGame() {
        localStorage.removeItem('lost_signal_state');
        location.reload();
    }
}

const game = new LostSignal();
window.addEventListener('DOMContentLoaded', () => game.init());
