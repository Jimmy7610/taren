export interface Env {
    DB: D1Database;
}

function json(data: any, init: ResponseInit = {}) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...(init.headers || {}),
        },
    });
}

function bad(msg: string, code = 400) {
    return json({ ok: false, error: msg }, { status: code });
}

function rangeToSinceMs(range: string): number {
    const now = Date.now();
    if (range === "24h") return now - 24 * 60 * 60 * 1000;
    if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
    return now - 24 * 60 * 60 * 1000;
}

function clampInt(v: string | null, def: number, min: number, max: number) {
    const n = v ? Number(v) : def;
    if (!Number.isFinite(n)) return def;
    return Math.max(min, Math.min(max, Math.floor(n)));
}

export default {
    async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(req.url);
        const path = url.pathname;

        // ---------------------------
        // POST /api/event (public)
        // ---------------------------
        if (path === "/api/event") {
            if (req.method !== "POST") return bad("Method not allowed", 405);

            let body: any;
            try { body = await req.json(); } catch { return bad("Invalid JSON"); }

            // Allow only anonymous fields; reject obvious PII keys
            const allowed = {
                ts: Number(body.ts) || Date.now(),
                type: String(body.type || "").slice(0, 64),
                path: body.path ? String(body.path).slice(0, 200) : null,
                game: body.game ? String(body.game).slice(0, 32) : null,
                session_id: body.session_id ? String(body.session_id).slice(0, 80) : null,
                duration_ms: body.duration_ms != null ? Number(body.duration_ms) : null,
                score: body.score != null ? Number(body.score) : null,
                moves: body.moves != null ? Number(body.moves) : null,
                device: body.device ? String(body.device).slice(0, 16) : null,
                country: req.headers.get("cf-ipcountry") || null,
            };

            if (!allowed.type) return bad("Missing type");
            if (!allowed.session_id) return bad("Missing session_id");

            // Drop if absurd values
            if (allowed.duration_ms != null && (allowed.duration_ms < 0 || allowed.duration_ms > 24 * 60 * 60 * 1000)) {
                return bad("Invalid duration_ms");
            }

            await env.DB.prepare(
                `INSERT INTO events (ts,type,path,game,session_id,duration_ms,score,moves,device,country)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`
            )
                .bind(
                    allowed.ts,
                    allowed.type,
                    allowed.path,
                    allowed.game,
                    allowed.session_id,
                    allowed.duration_ms,
                    allowed.score,
                    allowed.moves,
                    allowed.device,
                    allowed.country
                )
                .run();

            return json({ ok: true });
        }

        // ---------------------------
        // Admin APIs (protected by Cloudflare Access)
        // NOTE: Cloudflare Access policy must protect /api/admin/*
        // ---------------------------
        if (path.startsWith("/api/admin/")) {
            const range = url.searchParams.get("range") || "24h";
            const since = rangeToSinceMs(range);

            if (path === "/api/admin/overview") {
                const visitors = await env.DB.prepare(
                    `SELECT COUNT(DISTINCT session_id) as n FROM events WHERE ts >= ?1`
                ).bind(since).first<any>();

                const pageViews = await env.DB.prepare(
                    `SELECT COUNT(*) as n FROM events WHERE ts >= ?1 AND type='page_view'`
                ).bind(since).first<any>();

                const mostPlayed = await env.DB.prepare(
                    `SELECT game, COUNT(*) as n FROM events
           WHERE ts >= ?1 AND type='game_start' AND game IS NOT NULL
           GROUP BY game ORDER BY n DESC LIMIT 1`
                ).bind(since).first<any>();

                const avgRun = await env.DB.prepare(
                    `SELECT AVG(duration_ms) as n FROM events
           WHERE ts >= ?1 AND type='game_end' AND duration_ms IS NOT NULL`
                ).bind(since).first<any>();

                return json({
                    visitors: visitors?.n ?? 0,
                    visitors_meta: "unique sessions",
                    page_views: pageViews?.n ?? 0,
                    page_views_meta: "views",
                    most_played: mostPlayed?.game ?? "—",
                    most_played_meta: mostPlayed?.n ? `${mostPlayed.n} starts` : "by starts",
                    avg_game_duration_ms: avgRun?.n ? Math.floor(avgRun.n) : 0,
                    avg_game_duration_meta: "avg duration",
                });
            }

            if (path === "/api/admin/games") {
                const rows = await env.DB.prepare(
                    `SELECT game,
                  SUM(CASE WHEN type='game_start' THEN 1 ELSE 0 END) as starts,
                  AVG(CASE WHEN type='game_end' THEN duration_ms ELSE NULL END) as avg_duration_ms
           FROM events
           WHERE ts >= ?1 AND game IS NOT NULL
           GROUP BY game
           ORDER BY starts DESC
           LIMIT 10`
                ).bind(since).all<any>();

                return json({
                    items: (rows.results || []).map(r => ({
                        game: r.game,
                        starts: r.starts ?? 0,
                        avg_duration_ms: r.avg_duration_ms ? Math.floor(r.avg_duration_ms) : 0
                    }))
                });
            }

            if (path === "/api/admin/pages") {
                const rows = await env.DB.prepare(
                    `SELECT path, COUNT(*) as views
           FROM events
           WHERE ts >= ?1 AND type='page_view' AND path IS NOT NULL
           GROUP BY path
           ORDER BY views DESC
           LIMIT 12`
                ).bind(since).all<any>();

                return json({
                    items: (rows.results || []).map(r => ({
                        path: r.path,
                        views: r.views ?? 0
                    }))
                });
            }

            if (path === "/api/admin/recent") {
                const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
                const rows = await env.DB.prepare(
                    `SELECT ts,type,path,game,duration_ms,score
           FROM events
           ORDER BY ts DESC
           LIMIT ?1`
                ).bind(limit).all<any>();

                return json({ items: rows.results || [] });
            }

            return bad("Not found", 404);
        }

        return bad("Not found", 404);
    },
};
