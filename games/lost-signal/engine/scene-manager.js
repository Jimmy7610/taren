/**
 * Lost Signal - Scene Manager
 * Handles loading and switching between game scenes.
 */

class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.scenes = {};
    }

    async loadScenes() {
        const response = await fetch('data/scenes.json');
        this.scenes = await response.json();
    }

    setScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) {
            console.error(`Scene ${sceneId} not found.`);
            return;
        }

        this.currentScene = scene;
        this.renderScene();
        this.game.hotspotManager.loadHotspots(scene.hotspots);
        
        // Update UI
        const titleEl = document.getElementById('scene-title');
        if (titleEl) titleEl.innerText = scene.name;

        // INSTÄLLNING - Logga scenskiftet för debugging
        console.log(`Scene changed to: ${scene.name}`);
    }

    renderScene() {
        const container = document.getElementById('scene-container');
        container.style.backgroundImage = `url(${this.game.getAssetUrl(this.currentScene.background)})`;
        
        // INSTÄLLNING - Om bakgrundsbild saknas, använd en placeholder färg
        if (!this.currentScene.background || this.currentScene.background.includes('placeholder')) {
            container.style.backgroundColor = '#1a1a2e'; // Mörkblå nattkänsla
        } else {
            container.style.backgroundColor = 'transparent';
        }

        // Real Assets - Fog & Glow
        const fogLayer = document.querySelector('.vfx-layer.fog');
        const glowLayer = document.querySelector('.vfx-layer.lights');
        
        const scenePath = this.currentScene.background.substring(0, this.currentScene.background.lastIndexOf('/'));
        
        // INSTÄLLNING - Försök ladda real assets om de finns
        const fogUrl = this.game.getAssetUrl(`${scenePath}/fog.webp`);
        const glowUrl = this.game.getAssetUrl(`${scenePath}/signal-glow.webp`);
        
        fogLayer.style.backgroundImage = `url(${fogUrl})`;
        glowLayer.style.backgroundImage = `url(${glowUrl})`;
        
        // Diagnostik i konsolen
        console.group(`Scene Layers: ${this.currentScene.name}`);
        console.log(`Main Background: ${this.currentScene.background}`);
        console.log(`Fog Overlay: ${fogUrl}`);
        console.log(`Glow Overlay: ${glowUrl}`);
        console.groupEnd();
    }
}

export default SceneManager;
