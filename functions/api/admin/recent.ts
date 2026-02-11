interface Env {
    DB: D1Database;
}

function clampInt(v: string | null, def: number, min: number, max: number) {
    const n = v ? Number(v) : def;
    if (!Number.isFinite(n)) return def;
    return Math.max(min, Math.min(max, Math.floor(n)));
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);

    try {
        const rows = await env.DB.prepare(
            `SELECT ts,type,path,game,duration_ms,score
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
