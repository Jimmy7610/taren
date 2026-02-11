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

    // Allow only anonymous fields; reject obvious PII keys
    const allowed = {
        ts: Number(body.ts) || Date.now(),
        type: String(body.type || "").slice(0, 64),
        path: body.path ? String(body.path).slice(0, 200) : null,
        game: body.game ? String(body.game).slice(0, 32) : null,
        session_id: body.session_id ? String(body.session_id).slice(0, 80) : null,
        duration_ms: body.duration_ms != null ? Number(body.duration_ms) : null,
        score: body.score != null ? Number(body.score) : null,
        moves: body.moves != null ? Number(body.moves) : null,
        device: body.device ? String(body.device).slice(0, 16) : null,
        country: request.headers.get("cf-ipcountry") || null,
    };

    if (!allowed.type) {
        return new Response(JSON.stringify({ ok: false, error: "Missing type" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }
    if (!allowed.session_id) {
        return new Response(JSON.stringify({ ok: false, error: "Missing session_id" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    // Drop if absurd values
    if (allowed.duration_ms != null && (allowed.duration_ms < 0 || allowed.duration_ms > 24 * 60 * 60 * 1000)) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid duration_ms" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    try {
        await env.DB.prepare(
            `INSERT INTO events (ts,type,path,game,session_id,duration_ms,score,moves,device,country)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`
        )
            .bind(
                allowed.ts,
                allowed.type,
                allowed.path,
                allowed.game,
                allowed.session_id,
                allowed.duration_ms,
                allowed.score,
                allowed.moves,
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
