/**
 * POST /api/event — anonymous analytics ingestion into D1.
 *
 * FAIL CLOSED: ingestion is OFF unless the Pages environment variable ANALYTICS_INGEST is "on".
 * No first-party page currently sends events, so off is the safe default. When enabled, writes
 * are only accepted from allowed browser origins, as small JSON bodies, with fresh timestamps
 * and validated fields. Ingestion is write-only: it can never read data back.
 *
 * Note: a public, anonymous write endpoint cannot be fully authenticated (any client can forge
 * an Origin header). The checks below block cross-site browser abuse and malformed data; volume
 * abuse should be handled with a Cloudflare rate-limiting rule (see docs/SECURITY_ADMIN_API.md).
 */
interface Env {
    DB: D1Database;
    ANALYTICS_INGEST?: string;
    ANALYTICS_ALLOWED_ORIGINS?: string;
}

const MAX_BODY_BYTES = 4096;
const ALLOWED_TYPES = ["page_view", "game_start", "game_end", "game_open"];
const DEFAULT_ORIGINS = "https://taren.se";

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
    });
}

function finiteOrNull(v: unknown): number | null {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;

    if (env.ANALYTICS_INGEST !== "on") {
        return json(403, { ok: false, error: "Ingestion disabled" });
    }

    // Origin allowlist (browsers always send Origin on cross-origin and same-origin POSTs).
    const allowedOrigins = (env.ANALYTICS_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const origin = request.headers.get("origin");
    if (!origin || !allowedOrigins.includes(origin)) {
        return json(403, { ok: false, error: "Forbidden origin" });
    }

    if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
        return json(415, { ok: false, error: "Unsupported media type" });
    }

    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        return json(413, { ok: false, error: "Payload too large" });
    }
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
        return json(413, { ok: false, error: "Payload too large" });
    }

    let body: any;
    try {
        body = JSON.parse(raw);
    } catch {
        return json(400, { ok: false, error: "Invalid JSON" });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json(400, { ok: false, error: "Invalid JSON" });
    }

    const type = String(body.type || "");
    const path = body.path ? String(body.path).slice(0, 255) : null;
    const game = body.game ? String(body.game).slice(0, 64) : null;
    const sessionId = body.session_id ? String(body.session_id).slice(0, 128) : null;

    if (!ALLOWED_TYPES.includes(type)) {
        return json(400, { ok: false, error: "Invalid type" });
    }
    if (!sessionId) {
        return json(400, { ok: false, error: "Missing session_id" });
    }

    // Server-side guard: ignore page_views for /api or /assets
    if (type === "page_view" && (path?.startsWith("/api") || path?.startsWith("/assets"))) {
        return json(200, { ok: true, ignored: true });
    }

    // Reject timestamps more than 5 minutes ahead or 1 hour behind server time.
    const now = Date.now();
    const ts = finiteOrNull(body.ts) ?? now;
    if (ts > now + 5 * 60 * 1000 || ts < now - 60 * 60 * 1000) {
        return json(400, { ok: false, error: "Invalid timestamp" });
    }

    const rawDuration = finiteOrNull(body.duration_ms);
    if (rawDuration != null && rawDuration < 0) {
        return json(400, { ok: false, error: "Invalid duration_ms" });
    }
    // Same cap as before: durations above one hour are clamped.
    const duration = rawDuration == null ? null : Math.min(rawDuration, 3600000);

    const allowed = {
        ts,
        type,
        path,
        game,
        session_id: sessionId,
        duration_ms: duration,
        score: finiteOrNull(body.score),
        device: body.device ? String(body.device).slice(0, 32) : null,
        country: request.headers.get("cf-ipcountry") || null,
    };

    try {
        await env.DB.prepare(
            `INSERT INTO events (ts, type, path, game, session_id, duration_ms, score, device, country)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
        )
            .bind(
                allowed.ts,
                allowed.type,
                allowed.path,
                allowed.game,
                allowed.session_id,
                allowed.duration_ms,
                allowed.score,
                allowed.device,
                allowed.country
            )
            .run();
    } catch {
        return json(500, { ok: false, error: "Internal error" });
    }

    return json(200, { ok: true });
};

export const onRequestGet: PagesFunction = async () => {
    return json(405, { ok: false, error: "Method not allowed" }, { allow: "POST" });
};
