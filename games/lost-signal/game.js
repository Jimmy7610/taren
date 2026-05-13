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
import PlayerManager from './engine/player-manager.js';

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
        this.debugMode = false;
        this.lastClickedCoords = { x: 0, y: 0 };
        this.buildVersion = 115;
    }

    async init() {
        if (this.initialized) return;

        // Load systems
        this.saveSystem.load();
        await this.language.setLanguage(this.saveSystem.state.language);
        this.settings.setTheme(this.saveSystem.state.theme);
        
        await this.sceneManager.loadScenes();

        this.player = new PlayerManager(this);

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
        console.log(`Lost Signal Build 002 (Taren ${this.buildVersion}) initialized.`);
        this.runDiagnostics();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.saveSystem.reset());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('theme-toggle').addEventListener('click', () => this.settings.toggleTheme());
        document.getElementById('mute-toggle').addEventListener('click', () => this.audio.toggleMute());
        document.getElementById('debug-toggle').addEventListener('click', () => this.toggleDebug());
        document.getElementById('copy-coords-btn').addEventListener('click', () => this.copyCoords());
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

    toggleDebug() {
        this.debugMode = !this.debugMode;
        const debugLayer = document.getElementById('debug-layer');
        if (this.debugMode) {
            debugLayer.classList.remove('hidden');
            this.renderDebugHotspots();
            this.renderWalkArea();
        } else {
            debugLayer.classList.add('hidden');
        }
    }

    updateDebugCoords(x, y) {
        this.lastClickedCoords = { x: x.toFixed(1), y: y.toFixed(1) };
        document.getElementById('debug-coords').innerHTML = `
            x: ${this.lastClickedCoords.x}, y: ${this.lastClickedCoords.y}
            <button id="copy-coords-btn" class="btn-tiny">Copy</button>
        `;
        // Re-bind since we innerHTML'd
        document.getElementById('copy-coords-btn').addEventListener('click', () => this.copyCoords());
    }

    copyCoords() {
        const text = `x: ${this.lastClickedCoords.x}, y: ${this.lastClickedCoords.y}`;
        navigator.clipboard.writeText(text).then(() => {
            console.log('Coordinates copied to clipboard');
        });
    }

    renderDebugHotspots() {
        const layer = document.getElementById('debug-layer');
        // Clear old ones but keep svg and panel
        const existing = layer.querySelectorAll('.debug-hotspot, .walk-to-point');
        existing.forEach(e => e.remove());

        const hotspots = this.sceneManager.currentScene.hotspots;
        hotspots.forEach(hs => {
            const div = document.createElement('div');
            div.className = 'hotspot debug-hotspot';
            div.style.left = `${hs.x}%`;
            div.style.top = `${hs.y}%`;
            div.style.width = `${hs.width}%`;
            div.style.height = `${hs.height}%`;
            layer.appendChild(div);

            if (hs.walkTo) {
                const pt = document.createElement('div');
                pt.className = 'walk-to-point';
                pt.style.left = `${hs.walkTo.x}%`;
                pt.style.top = `${hs.walkTo.y}%`;
                layer.appendChild(pt);
            }
        });
    }

    renderWalkArea() {
        const svg = document.getElementById('walk-area-svg');
        const area = this.sceneManager.currentScene.walkArea;
        if (area) {
            const points = area.map(p => `${p.x},${p.y}`).join(' ');
            svg.innerHTML = `<polygon points="${points}" />`;
        }
    }

    getAssetUrl(path) {
        if (!path) return '';
        // INSTÄLLNING - Cache busting
        return `${path}?v=${this.buildVersion}`;
    }

    runDiagnostics() {
        console.group('Lost Signal - Asset Diagnostics');
        const assets = [
            'assets/scenes/dock/background.webp',
            'assets/characters/nilo-idle.webp',
            'assets/items/rusty-fuse.webp'
        ];

        assets.forEach(path => {
            const img = new Image();
            img.onload = () => console.log(`%c✓ LOADED: ${path}`, 'color: lime');
            img.onerror = () => console.warn(`%c✗ FAILED: ${path}`, 'color: orange');
            img.src = this.getAssetUrl(path);
        });
        console.groupEnd();
    }
}

// Global instance for console access
window.game = new LostSignal();

document.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});
