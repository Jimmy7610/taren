/**
 * Lost Signal - Dialogue
 * Handles displaying messages and dialogue to the player.
 */

class Dialogue {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('dialogue-panel');
        this.textElement = document.getElementById('dialogue-text');
        this.active = false;

        document.addEventListener('click', (e) => {
            if (this.active && !this.container.contains(e.target)) {
                this.hide();
            }
        });
    }

    show(dialogueId) {
        // INSTÄLLNING - Hämta text från språksystemet
        const text = this.game.language.get(dialogueId);
        
        if (text) {
            this.textElement.innerText = text;
            this.container.classList.add('active');
            this.active = true;
            
            // INSTÄLLNING - Automatiskt stänga efter en stund (valfritt)
            // setTimeout(() => this.hide(), 5000);
        }
    }

    hide() {
        this.container.classList.remove('active');
        this.active = false;
    }
}

export default Dialogue;
