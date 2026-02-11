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
        // Filter out API and Assets noise
        const rows = await env.DB.prepare(
            `SELECT path, COUNT(*) as views
       FROM events
       WHERE ts >= ?1 AND type='page_view' AND path IS NOT NULL
       AND path NOT LIKE '/api/%' AND path NOT LIKE '/assets/%'
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`
        ).bind(since).all<any>();

        return new Response(JSON.stringify({
            items: (rows.results || []).map(r => ({
                path: r.path,
                views: r.views ?? 0
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
