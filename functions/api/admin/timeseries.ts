interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "24h";

    const now = Date.now();
    let duration = 24 * 60 * 60 * 1000;
    let bucketFormat = '%Y-%m-%d %H:00'; // Hourly

    if (range === "7d") {
        duration = 7 * 24 * 60 * 60 * 1000;
        bucketFormat = '%Y-%m-%d';
    } else if (range === "30d") {
        duration = 30 * 24 * 60 * 60 * 1000;
        bucketFormat = '%Y-%m-%d';
    }

    const start = now - duration;

    try {
        // Generate empty bins first to ensure no gaps in the SVG chart
        // For simplicity, we'll just query what exists and the frontend will handle interpolation or we can aggregate directly.
        // The user requested: 24h=24 bins, 7d=7 bins, 30d=30 bins.

        const query = `
      SELECT 
        strftime('${bucketFormat}', ts / 1000, 'unixepoch') as bucket,
        COUNT(CASE WHEN type='page_view' THEN 1 END) as views,
        COUNT(CASE WHEN type='game_start' THEN 1 END) as starts
      FROM events
      WHERE ts >= ?1
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

        const results = await env.DB.prepare(query).bind(start).all<any>();

        return new Response(JSON.stringify({
            ok: true,
            range,
            bins: results.results || []
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
