/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;
    const url = new URL(request.url);

    // Default to 5 minutes window
    const windowParam = url.searchParams.get("window") || "5m";
    let windowMs = 5 * 60 * 1000;

    if (windowParam === "1m") windowMs = 1 * 60 * 1000;
    else if (windowParam === "10m") windowMs = 10 * 60 * 1000;
    else if (windowParam === "30m") windowMs = 30 * 60 * 1000;

    const since = Date.now() - windowMs;

    try {
        const result = await env.DB.prepare(
            "SELECT COUNT(*) as n FROM events WHERE ts >= ?1"
        ).bind(since).first<{ n: number }>();

        return new Response(JSON.stringify({
            ok: true,
            count: result?.n ?? 0,
            window: windowParam
        }), {
            headers: { "content-type": "application/json" }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" }
        });
    }
};
