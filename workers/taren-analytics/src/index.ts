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
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const startOfToday = d.getTime();
    
    if (range === "24h") return startOfToday - 24 * 60 * 60 * 1000;
    if (range === "7d") return startOfToday - 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") return startOfToday - 30 * 24 * 60 * 60 * 1000;
    return startOfToday - 24 * 60 * 60 * 1000;
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

            // Security: Enforce freshness (reject ts more than 5m in future or 1h in past)
            const now = Date.now();
            const ts = Number(body.ts) || now;
            if (ts > now + 300000 || ts < now - 3600000) {
                return bad("Invalid timestamp: out of sync with real-time reality");
            }

            // Allow only anonymous fields; reject obvious PII keys
            const allowed = {
                ts,
                type: String(body.type || "").slice(0, 64),
                path: body.path ? String(body.path).slice(0, 200) : null,
                game: body.game ? String(body.game).slice(0, 32) : null,
                session_id: body.session_id ? String(body.session_id).slice(0, 80) : null,
                duration_ms: body.duration_ms != null ? Number(body.duration_ms) : null,
                score: body.score != null ? Number(body.score) : null,
                moves: body.moves != null ? Number(body.moves) : null,
                result: body.result ? String(body.result).slice(0, 32) : null,
                device: body.device ? String(body.device).slice(0, 16) : null,
                country: req.headers.get("cf-ipcountry") || null,
            };

            if (!allowed.type) return bad("Missing type");
            if (!allowed.session_id) return bad("Missing session_id");

            // Drop if absurd values
            if (allowed.duration_ms != null && (allowed.duration_ms < 0 || allowed.duration_ms > 24 * 60 * 60 * 1000)) {
                return bad("Invalid duration_ms");
            }

            try {
                await env.DB.prepare(
                    `INSERT INTO events (ts,type,path,game,session_id,duration_ms,score,moves,result,device,country)
                     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)`
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
                        allowed.result,
                        allowed.device,
                        allowed.country
                    )
                    .run();
                return json({ ok: true });
            } catch (err: any) {
                console.error("D1 Ingest Failure:", err);
                return bad("Persistence failure", 500);
            }
        }

        // ---------------------------
        // Admin APIs (protected by Cloudflare Access)
        // ---------------------------
        if (path.startsWith("/api/admin/")) {
            const range = url.searchParams.get("range") || "24h";
            const since = rangeToSinceMs(range);
            
            // Align overview with nested dashboard expectations
            if (path === "/api/admin/overview") {
                const getMetrics = async (sinceTs: number) => {
                    const visitors = await env.DB.prepare(`SELECT COUNT(DISTINCT session_id) as n FROM events WHERE ts >= ?1`).bind(sinceTs).first<any>();
                    const pageViews = await env.DB.prepare(`SELECT COUNT(*) as n FROM events WHERE ts >= ?1 AND type='page_view'`).bind(sinceTs).first<any>();
                    const mostPlayed = await env.DB.prepare(`SELECT game, COUNT(*) as n FROM events WHERE ts >= ?1 AND type='game_start' AND game IS NOT NULL GROUP BY game ORDER BY n DESC LIMIT 1`).bind(sinceTs).first<any>();
                    const avgRun = await env.DB.prepare(`SELECT AVG(duration_ms) as n FROM events WHERE ts >= ?1 AND type='game_end' AND duration_ms IS NOT NULL`).bind(sinceTs).first<any>();
                    
                    return {
                        visitors: visitors?.n ?? 0,
                        page_views: pageViews?.n ?? 0,
                        most_played: mostPlayed?.game ?? "—",
                        most_played_starts: mostPlayed?.n ?? 0,
                        avg_game_duration_ms: avgRun?.n ? Math.floor(avgRun.n) : 0,
                    };
                };

                const now = Date.now();
                const d = new Date(); d.setHours(0,0,0,0);
                const startOfToday = d.getTime();
                let duration = 24 * 60 * 60 * 1000;
                if (range === "7d") duration = 7 * 24 * 60 * 60 * 1000;
                if (range === "30d") duration = 30 * 24 * 60 * 60 * 1000;

                const currentStart = startOfToday - duration;
                const previousStart = currentStart - duration;

                try {
                    const [current, previous] = await Promise.all([
                        getMetrics(currentStart),
                        getMetrics(previousStart)
                    ]);

                    return json({
                        ok: true,
                        range,
                        current,
                        previous,
                        // Fallback flat fields for legacy UI if any
                        visitors: current.visitors,
                        page_views: current.page_views,
                        most_played: current.most_played,
                        avg_game_duration_ms: current.avg_game_duration_ms
                    });
                } catch (err: any) {
                    console.error("Admin Overview Failure:", err);
                    return bad("Internal analytics failure", 500);
                }
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
