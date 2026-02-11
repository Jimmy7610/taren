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
        // Top games: Group by game, count starts, average duration from ends
        const rows = await env.DB.prepare(
            `SELECT game,
              COUNT(CASE WHEN type='game_start' THEN 1 ELSE NULL END) as starts,
              AVG(CASE WHEN type='game_end' THEN duration_ms ELSE NULL END) as avg_duration_ms
       FROM events
       WHERE ts >= ?1 AND game IS NOT NULL
       GROUP BY game
       ORDER BY starts DESC
       LIMIT 10`
        ).bind(since).all<any>();

        return new Response(JSON.stringify({
            items: (rows.results || []).map(r => ({
                game: r.game,
                starts: Number(r.starts) || 0,
                avg_duration_ms: r.avg_duration_ms ? Math.floor(r.avg_duration_ms) : 0
            }))
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
