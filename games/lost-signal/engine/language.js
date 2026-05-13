/**
 * Lost Signal - Language System
 * Manages English and Swedish translations.
 */

class LanguageSystem {
    constructor(game) {
        this.game = game;
        this.current = 'en';
        this.data = {};
    }

    async setLanguage(lang) {
        this.current = lang;
        this.game.saveSystem.state.language = lang;
        this.game.saveSystem.save();

        const response = await fetch(`data/lang-${lang}.json`);
        this.data = await response.json();
        
        this.updateUI();
        
        // INSTÄLLNING - Språkändring logg
        console.log(`Language set to: ${lang}`);
    }

    get(key) {
        return this.data[key] || key;
    }

    updateUI() {
        // Uppdatera element med data-lang-key
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-lang-key');
            el.innerText = this.get(key);
        });
    }
}

export default LanguageSystem;
