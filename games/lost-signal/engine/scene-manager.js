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
        
        // INSTÄLLNING - Logga scenskiftet för debugging
        console.log(`Scene changed to: ${scene.name}`);
    }

    renderScene() {
        const container = document.getElementById('scene-container');
        container.style.backgroundImage = `url(${this.currentScene.background})`;
        
        // INSTÄLLNING - Om bakgrundsbild saknas, använd en placeholder färg
        if (!this.currentScene.background || this.currentScene.background.includes('placeholder')) {
            container.style.backgroundColor = '#1a1a2e'; // Mörkblå nattkänsla
        }
    }
}

export default SceneManager;
