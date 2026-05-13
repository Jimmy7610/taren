/**
 * Lost Signal - Hotspot Manager
 * Handles interactive areas within a scene.
 */

class HotspotManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('hotspot-layer');
    }

    loadHotspots(hotspots) {
        this.container.innerHTML = '';
        hotspots.forEach(hs => this.createHotspot(hs));
    }

    createHotspot(hs) {
        const div = document.createElement('div');
        div.className = 'hotspot';
        div.dataset.id = hs.id;
        
        // INSTÄLLNING - Använd procentuella koordinater för responsivitet
        div.style.left = `${hs.x}%`;
        div.style.top = `${hs.y}%`;
        div.style.width = `${hs.width}%`;
        div.style.height = `${hs.height}%`;

        // Hover label
        const label = document.createElement('span');
        label.className = 'hotspot-label';
        label.innerText = hs.name;
        div.appendChild(label);

        div.addEventListener('click', () => this.handleInteraction(hs));
        
        this.container.appendChild(div);
    }

    handleInteraction(hs) {
        // Special logic for fuse box collection (first build simulation)
        if (hs.id === 'old_sign' && !this.game.saveSystem.state.hasFuse && !this.game.saveSystem.state.powerOn) {
            // Secretly find fuse at sign if not found? 
            // Actually, let's keep it simple: fuse is at the sign in this first build.
            this.game.inventory.addItem('rusty_fuse');
            this.game.dialogue.show('collect_fuse');
            return;
        }

        if (hs.id === 'fuse_box') {
            if (this.game.saveSystem.state.powerOn) {
                this.game.dialogue.show('dock_fuse_box_solved');
            } else if (this.game.inventory.selectedItem === 'rusty_fuse') {
                this.game.solvePuzzle('power_station');
            } else {
                this.game.dialogue.show('dock_fuse_box');
            }
            return;
        }

        if (hs.id === 'signal_door') {
            if (this.game.saveSystem.state.powerOn) {
                this.game.dialogue.show('dock_door_powered');
            } else {
                this.game.dialogue.show('dock_door');
            }
            return;
        }

        if (hs.dialogue) {
            this.game.dialogue.show(hs.dialogue);
        }
    }
}

export default HotspotManager;
