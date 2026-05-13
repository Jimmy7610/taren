/**
 * Lost Signal - Save System
 * Manages game state persistence using localStorage.
 */

class SaveSystem {
    constructor(game) {
        this.game = game;
        this.prefix = 'taren_lost_signal_';
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            hasFuse: false,
            powerOn: false,
            language: 'en',
            theme: 'dark',
            mute: false
        };
    }

    load() {
        const saved = localStorage.getItem(`${this.prefix}state`);
        if (saved) {
            this.state = { ...this.getInitialState(), ...JSON.parse(saved) };
            console.log('Game state loaded.');
        }
    }

    save() {
        localStorage.setItem(`${this.prefix}state`, JSON.stringify(this.state));
        // INSTÄLLNING - Bekräfta sparning för användaren
        console.log('Game state saved.');
    }

    reset() {
        localStorage.removeItem(`${this.prefix}state`);
        this.state = this.getInitialState();
        window.location.reload();
    }
}

export default SaveSystem;
