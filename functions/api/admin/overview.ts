interface Env {
    DB: D1Database;
}

function rangeToSinceMs(range: string): number {
    const now = Date.now();
    if (range === "24h") return now - 24 * 60 * 60 * 1000;
    if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
    return now - 24 * 60 * 60 * 1000;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "24h";
    const since = rangeToSinceMs(range);

    try {
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

        return new Response(JSON.stringify({
            visitors: visitors?.n ?? 0,
            visitors_meta: "unique sessions",
            page_views: pageViews?.n ?? 0,
            page_views_meta: "views",
            most_played: mostPlayed?.game ?? "—",
            most_played_meta: mostPlayed?.n ? `${mostPlayed.n} starts` : "by starts",
            avg_game_duration_ms: avgRun?.n ? Math.floor(avgRun.n) : 0,
            avg_game_duration_meta: "avg duration",
        }), {
            headers: { "content-type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};
