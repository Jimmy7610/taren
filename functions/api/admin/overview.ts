interface Env {
    DB: D1Database;
}

function getRanges(range: string) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const startOfToday = d.getTime();
    const now = Date.now();
    
    let duration = 24 * 60 * 60 * 1000;
    if (range === "7d") duration = 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") duration = 30 * 24 * 60 * 60 * 1000;

    const current_start = startOfToday - duration;
    const previous_start = current_start - duration;

    return { now, current_start, previous_start };
}

async function getMetrics(db: D1Database, start: number, end: number) {
    const [visitorsRes, pageViewsRes, mostPlayedRes, avgRunRes] = await Promise.all([
        db.prepare(`SELECT COUNT(DISTINCT session_id) as n FROM events WHERE ts >= ?1 AND ts < ?2`).bind(start, end).first<any>(),
        db.prepare(`SELECT COUNT(*) as n FROM events WHERE ts >= ?1 AND ts < ?2 AND type='page_view'`).bind(start, end).first<any>(),
        db.prepare(`SELECT game, COUNT(*) as n FROM events WHERE ts >= ?1 AND ts < ?2 AND type='game_start' AND game IS NOT NULL GROUP BY game ORDER BY n DESC LIMIT 1`).bind(start, end).first<any>(),
        db.prepare(`SELECT AVG(duration_ms) as n FROM events WHERE ts >= ?1 AND ts < ?2 AND type='game_end' AND duration_ms IS NOT NULL`).bind(start, end).first<any>()
    ]);

    return {
        visitors: visitorsRes?.n ?? 0,
        page_views: pageViewsRes?.n ?? 0,
        most_played: mostPlayedRes?.game ?? "—",
        most_played_starts: mostPlayedRes?.n ?? 0,
        avg_game_duration_ms: avgRunRes?.n ? Math.floor(avgRunRes.n) : 0,
    };
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "24h";
    const { now, current_start, previous_start } = getRanges(range);

    try {
        const current = await getMetrics(env.DB, current_start, now);
        const previous = await getMetrics(env.DB, previous_start, current_start);

        return new Response(JSON.stringify({
            ok: true,
            range,
            current,
            previous,
            // Legacy structure for basic fallback
            visitors: current.visitors,
            visitors_meta: "unique sessions",
            page_views: current.page_views,
            page_views_meta: "total views",
            most_played: current.most_played,
            most_played_meta: current.most_played_starts ? `${current.most_played_starts} starts` : "by starts",
            avg_game_duration_ms: current.avg_game_duration_ms,
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
