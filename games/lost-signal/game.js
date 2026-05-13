/**
 * Lost Signal - Main Game Engine
 * Orchestrates the game systems and state.
 */

import SceneManager from './engine/scene-manager.js';
import HotspotManager from './engine/hotspot-manager.js';
import Inventory from './engine/inventory.js';
import Dialogue from './engine/dialogue.js';
import SaveSystem from './engine/save-system.js';
import AudioManager from './engine/audio-manager.js';
import LanguageSystem from './engine/language.js';
import SettingsManager from './engine/settings.js';

class LostSignal {
    constructor() {
        this.saveSystem = new SaveSystem(this);
        this.language = new LanguageSystem(this);
        this.settings = new SettingsManager(this);
        this.audio = new AudioManager(this);
        this.sceneManager = new SceneManager(this);
        this.hotspotManager = new HotspotManager(this);
        this.inventory = new Inventory(this);
        this.dialogue = new Dialogue(this);

        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Load systems
        this.saveSystem.load();
        await this.language.setLanguage(this.saveSystem.state.language);
        this.settings.setTheme(this.saveSystem.state.theme);
        
        await this.sceneManager.loadScenes();

        // Bind UI events
        this.bindEvents();

        // Check for existing progress
        if (this.saveSystem.state.hasFuse) {
            this.inventory.addItem('rusty_fuse');
        }
        if (this.saveSystem.state.powerOn) {
            this.applyPowerOnEffects();
        }

        this.initialized = true;
        console.log('Lost Signal Build 001 initialized.');
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.saveSystem.reset());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('theme-toggle').addEventListener('click', () => this.settings.toggleTheme());
        document.getElementById('mute-toggle').addEventListener('click', () => this.audio.toggleMute());
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        // INSTÄLLNING - Startscen
        this.sceneManager.setScene('dock');
    }

    toggleLanguage() {
        const next = this.language.current === 'en' ? 'sv' : 'en';
        this.language.setLanguage(next);
    }

    solvePuzzle(puzzleId) {
        if (puzzleId === 'power_station') {
            this.saveSystem.state.powerOn = true;
            this.inventory.removeItem('rusty_fuse');
            this.saveSystem.save();
            
            this.applyPowerOnEffects();
            this.dialogue.show('msg_power_on');
        }
    }

    applyPowerOnEffects() {
        const viewport = document.getElementById('scene-viewport');
        viewport.classList.add('powered');
        
        // INSTÄLLNING - Eventuella extra visuella ändringar vid strömpåslag
        console.log('Station power is ON - visual effects applied.');
    }
}

// Global instance for console access
window.game = new LostSignal();

document.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});
