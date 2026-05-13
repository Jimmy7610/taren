/**
 * Lost Signal - Inventory
 * Manages player items and the inventory UI.
 */

class Inventory {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.selectedItem = null;
        this.container = document.getElementById('inventory-bar');
    }

    addItem(itemId) {
        if (!this.items.includes(itemId)) {
            this.items.push(itemId);
            this.game.saveSystem.state.hasFuse = true; // Specific to build 001
            this.game.saveSystem.save();
            this.render();
            
            // INSTÄLLNING - Feedback vid insamling
            console.log(`Item collected: ${itemId}`);
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(id => id !== itemId);
        if (this.selectedItem === itemId) this.selectedItem = null;
        this.render();
    }

    selectItem(itemId) {
        if (this.selectedItem === itemId) {
            this.selectedItem = null;
        } else {
            this.selectedItem = itemId;
        }
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.items.forEach(itemId => {
            const div = document.createElement('div');
            div.className = `inventory-item ${this.selectedItem === itemId ? 'selected' : ''}`;
            div.dataset.id = itemId;
            
            // Item Icon
            const img = document.createElement('div');
            img.className = 'item-icon-placeholder';
            // INSTÄLLNING - Använd den riktiga ikonen om den finns
            const iconPath = `assets/items/${itemId.replace('_', '-')}.webp`;
            img.style.backgroundImage = `url(${this.game.getAssetUrl(iconPath)})`;
            
            div.appendChild(img);
            div.addEventListener('click', () => this.selectItem(itemId));
            this.container.appendChild(div);
        });
    }
}

export default Inventory;
