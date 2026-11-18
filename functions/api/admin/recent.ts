interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    // Clamp to 1..200. A negative LIMIT means "no limit" in SQLite, so it must never pass through.
    const requested = Math.floor(Number(url.searchParams.get("limit")));
    const limit = Number.isFinite(requested) && requested >= 1 ? Math.min(requested, 200) : 50;

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
    } catch {
        return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};
