/**
 * Lost Signal - Settings Manager
 * Handles UI settings like dark/light mode.
 */

class SettingsManager {
    constructor(game) {
        this.game = game;
    }

    toggleTheme() {
        const current = this.game.saveSystem.state.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    }

    setTheme(theme) {
        this.game.saveSystem.state.theme = theme;
        this.game.saveSystem.save();
        document.body.className = `${theme}-mode`;
        
        // INSTÄLLNING - Bekräfta temaändring
        console.log(`Theme set to: ${theme}`);
    }
}

export default SettingsManager;
