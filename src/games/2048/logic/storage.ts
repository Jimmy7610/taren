const KEY_BEST = "taren:games:2048:bestScore";

export function loadBestScore(): number {
    try {
        const raw = localStorage.getItem(KEY_BEST);
        const n = raw ? Number(raw) : 0;
        return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
        return 0;
    }
}

export function saveBestScore(best: number): void {
    try {
        localStorage.setItem(KEY_BEST, String(best));
    } catch {
        // ignore
    }
}
