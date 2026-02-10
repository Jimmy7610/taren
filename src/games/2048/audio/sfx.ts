/**
 * TAREN 2048 – SFX helpers
 * Subtle "ceramic" beeps for game events.
 */
import { AudioEngine } from "./audio";

/** Soft click on valid move */
export function sfxMove(a: AudioEngine) {
    a.beep(220, 55, "sine", 0.04);
}

/** Brighter tone on merge — pitch scales with gained value */
export function sfxMerge(a: AudioEngine, gained: number) {
    const base = 280;
    const freq = Math.min(720, base + Math.log2(Math.max(2, gained)) * 60);
    a.beep(freq, 70, "triangle", 0.055);
}

/** Low double-tone on game over */
export function sfxGameOver(a: AudioEngine) {
    a.beep(160, 120, "sine", 0.05);
    setTimeout(() => a.beep(120, 140, "sine", 0.05), 130);
}

/** Bright cheerful tone on win */
export function sfxWin(a: AudioEngine) {
    a.beep(440, 80, "triangle", 0.05);
    setTimeout(() => a.beep(660, 100, "triangle", 0.05), 100);
    setTimeout(() => a.beep(880, 120, "triangle", 0.04), 220);
}
