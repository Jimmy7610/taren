/**
 * TAREN 2048 – Audio Engine
 * Web Audio API oscillator-based SFX. No external assets needed.
 * Unlocks only on user gesture (browser policy safe).
 */

const KEY_MUTE = "taren:games:2048:mute";

export function loadMute(): boolean {
    try { return localStorage.getItem(KEY_MUTE) === "1"; } catch { return false; }
}

export function saveMute(muted: boolean) {
    try { localStorage.setItem(KEY_MUTE, muted ? "1" : "0"); } catch { /* noop */ }
}

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private gain: GainNode | null = null;
    private muted = false;
    private unlocked = false;

    constructor(initialMute: boolean) {
        this.muted = initialMute;
    }

    isMuted() { return this.muted; }
    isUnlocked() { return this.unlocked; }

    /** Must be called from a user gesture (click/keydown) handler. */
    async unlock() {
        if (this.unlocked) return;
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;

        this.ctx = new Ctx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = this.muted ? 0 : 1;
        this.gain.connect(this.ctx.destination);

        try { await this.ctx.resume(); } catch { /* noop */ }
        this.unlocked = true;
    }

    setMuted(muted: boolean) {
        this.muted = muted;
        if (this.gain) this.gain.gain.value = muted ? 0 : 1;
    }

    /** Play a subtle oscillator beep — "ceramic" aesthetic. */
    beep(freq: number, ms: number, type: OscillatorType = "sine", vol = 0.06) {
        if (!this.ctx || !this.gain || !this.unlocked) return;

        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.01);
        g.gain.linearRampToValueAtTime(0, now + ms / 1000);

        osc.connect(g);
        g.connect(this.gain);

        osc.start(now);
        osc.stop(now + ms / 1000 + 0.02);
    }
}
