/**
 * TAREN Telemetry
 * Privacy-first, anonymous event tracking.
 * No PII, no raw IP, no invasive tracking.
 */

// Persistent anonymous ID (localStorage survival)
function getSessionId(): string {
    const key = "taren:sid";
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const sid = `s_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    localStorage.setItem(key, sid);
    return sid;
}

// Simple device classifier
function deviceType(): "mobile" | "desktop" {
    const w = window.innerWidth || 1024;
    return w < 820 ? "mobile" : "desktop";
}

// Cache to prevent duplicate page_views in StrictMode/fast nav
let lastSentPath: string | null = null;

export type TelemetryEvent = {
    type: 'page_view' | 'game_start' | 'game_end' | 'game_open';
    path?: string;
    game?: string;
    duration_ms?: number;
    score?: number;
    moves?: number;
    result?: string;
};

export async function sendEvent(evt: TelemetryEvent): Promise<void> {
    // Respect DNT
    if (navigator.doNotTrack === "1") return;

    const path = evt.path ?? window.location.pathname;

    // Filter out API/Assets tracking
    if (path.startsWith("/api") || path.startsWith("/assets")) return;

    // Guard against duplicate page_views
    if (evt.type === 'page_view') {
        if (path === lastSentPath) return;
        lastSentPath = path;
    }

    const payload = {
        ts: Date.now(),
        session_id: getSessionId(),
        device: deviceType(),
        path: path,
        type: evt.type,
        game: evt.game ?? null,
        duration_ms: evt.duration_ms ?? null,
        score: evt.score ?? null,
        moves: evt.moves ?? null,
        result: evt.result ?? null,
    };

    try {
        // fetch with keepalive is the modern alternative to navigator.sendBeacon
        await fetch("/api/event", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    } catch {
        // silent
    }
}
