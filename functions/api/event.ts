interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    const { request, env } = ctx;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    // Basic validation
    const type = String(body.type || "");
    const path = body.path ? String(body.path).slice(0, 255) : null;
    const game = body.game ? String(body.game).slice(0, 64) : null;
    const sessionId = body.session_id ? String(body.session_id).slice(0, 128) : null;

    if (!["page_view", "game_start", "game_end", "game_open"].includes(type)) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid type" }), { status: 400 });
    }

    if (!sessionId) {
        return new Response(JSON.stringify({ ok: false, error: "Missing session_id" }), { status: 400 });
    }

    // Server-side guard: ignore page_views for /api or /assets
    if (type === "page_view" && (path?.startsWith("/api") || path?.startsWith("/assets"))) {
        return new Response(JSON.stringify({ ok: true, ignored: true }), {
            headers: { "content-type": "application/json" },
        });
    }

    const allowed = {
        ts: Number(body.ts) || Date.now(),
        type,
        path,
        game,
        session_id: sessionId,
        duration_ms: body.duration_ms != null ? Math.min(Number(body.duration_ms), 3600000) : null,
        score: body.score != null ? Number(body.score) : null,
        result: body.result ? String(body.result).slice(0, 32) : null,
        device: body.device ? String(body.device).slice(0, 32) : null,
        country: request.headers.get("cf-ipcountry") || null,
    };

    try {
        await env.DB.prepare(
            `INSERT INTO events (ts, type, path, game, session_id, duration_ms, score, result, device, country)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        )
            .bind(
                allowed.ts,
                allowed.type,
                allowed.path,
                allowed.game,
                allowed.session_id,
                allowed.duration_ms,
                allowed.score,
                allowed.result,
                allowed.device,
                allowed.country
            )
            .run();
    } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
    });
};

export const onRequestGet: PagesFunction = async () => {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
    });
};
