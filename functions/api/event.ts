export const onRequest: PagesFunction = async (context) => {
    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
    });
};
