/**
 * Lost Signal - Audio Manager
 * Manages sound effects and background music.
 */

class AudioManager {
    constructor(game) {
        this.game = game;
        this.muted = false;
        // INSTÄLLNING - Volymnivåer
        this.sfxVolume = 0.5;
        this.bgmVolume = 0.3;
    }

    toggleMute() {
        this.muted = !this.muted;
        this.game.saveSystem.state.mute = this.muted;
        this.game.saveSystem.save();
        
        // INSTÄLLNING - Visuell feedback på mute
        console.log(`Audio ${this.muted ? 'muted' : 'unmuted'}`);
    }

    playSFX(id) {
        if (this.muted) return;
        // INSTÄLLNING - Framtida ljudfiler laddas här
        // const audio = new Audio(`assets/audio/sfx/${id}.mp3`);
        // audio.volume = this.sfxVolume;
        // audio.play();
    }
}

export default AudioManager;
