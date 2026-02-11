interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
    return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" }
    });
};
