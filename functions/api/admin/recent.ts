interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

    try {
        const rows = await env.DB.prepare(
            `SELECT ts, type, path, game, duration_ms, score, device, country
       FROM events
       ORDER BY ts DESC
       LIMIT ?1`
        ).bind(limit).all<any>();

        return new Response(JSON.stringify({ items: rows.results || [] }), {
            headers: { "content-type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};
