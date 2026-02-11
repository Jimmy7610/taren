function getSessionId(): string {
    const key = "taren:sid";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;

    const sid = `s_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    sessionStorage.setItem(key, sid);
    return sid;
}

function deviceType(): "mobile" | "desktop" {
    const w = window.innerWidth || 1024;
    return w < 820 ? "mobile" : "desktop";
}

export type TelemetryEvent = {
    type: string;
    path?: string;
    game?: string;
    duration_ms?: number;
    score?: number;
    moves?: number;
};

export async function sendEvent(evt: TelemetryEvent): Promise<void> {
    // Respect DNT (optional, but very TAREN)
    if (navigator.doNotTrack === "1") return;

    const payload = {
        ts: Date.now(),
        session_id: getSessionId(),
        device: deviceType(),
        path: evt.path ?? location.pathname,
        type: evt.type,
        game: evt.game ?? null,
        duration_ms: evt.duration_ms ?? null,
        score: evt.score ?? null,
        moves: evt.moves ?? null,
    };

    try {
        await fetch("/api/event", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    } catch {
        // silent by design
    }
}
