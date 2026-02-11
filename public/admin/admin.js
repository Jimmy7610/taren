const $ = (id) => document.getElementById(id);

let RANGE = "24h";

function fmtMs(ms) {
    if (ms === null || ms === undefined || ms <= 0) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function fmtTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString();
}

/**
 * Enhanced API fetcher with diagnostic logging and granular error objects.
 */
async function apiFetch(endpoint) {
    try {
        const res = await fetch(endpoint, { credentials: "include" });
        if (!res.ok) {
            let errorDetail = "";
            try {
                const errData = await res.json();
                errorDetail = errData.error || "";
            } catch { }

            console.warn(`[ADMIN API] ${endpoint} failed`, {
                status: res.status,
                detail: errorDetail
            });
            return { ok: false, status: res.status, error: errorDetail || res.statusText };
        }
        const data = await res.json();
        return { ok: true, data };
    } catch (err) {
        console.error(`[ADMIN API] ${endpoint} fetch error`, err);
        return { ok: false, error: err.message };
    }
}

function renderError(parent, message) {
    const div = document.createElement("div");
    div.className = "inline-error";
    div.textContent = `⚠️ ${message}`;
    parent.appendChild(div);
}

async function loadKPIs() {
    const res = await apiFetch(`/api/admin/overview?range=${encodeURIComponent(RANGE)}`);
    const elements = ['kpiVisitors', 'kpiPageViews', 'kpiMostPlayed', 'kpiAvgRun'];

    if (!res.ok) {
        elements.forEach(id => $(id).textContent = "ERR");
        console.warn("KPIs failed to load", res.error);
        return;
    }

    const { data } = res;
    $("kpiVisitors").textContent = data.visitors ?? "—";
    $("kpiVisitorsMeta").textContent = data.visitors_meta ?? "unique sessions";
    $("kpiPageViews").textContent = data.page_views ?? "—";
    $("kpiPageViewsMeta").textContent = data.page_views_meta ?? "views";
    $("kpiMostPlayed").textContent = data.most_played ?? "—";
    $("kpiMostPlayedMeta").textContent = data.most_played_meta ?? "by starts";
    $("kpiAvgRun").textContent = fmtMs(data.avg_game_duration_ms);
    $("kpiAvgRunMeta").textContent = data.avg_game_duration_meta ?? "avg duration";
}

async function loadTopGames() {
    const body = $("topGamesBody");
    body.innerHTML = "";
    const res = await apiFetch(`/api/admin/games?range=${encodeURIComponent(RANGE)}`);

    if (!res.ok) {
        body.innerHTML = `<tr><td colspan="3" class="err-cell">Error ${res.status || ''}: ${res.error}</td></tr>`;
        return;
    }

    const items = res.data.items || [];
    if (items.length === 0) {
        body.innerHTML = `<tr><td colspan="3" class="muted-cell">No data available</td></tr>`;
        return;
    }

    for (const g of items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${g.game}</td>
            <td class="num">${g.starts}</td>
            <td class="num">${fmtMs(g.avg_duration_ms)}</td>
        `;
        body.appendChild(tr);
    }
}

async function loadTopPages() {
    const body = $("topPagesBody");
    body.innerHTML = "";
    const res = await apiFetch(`/api/admin/pages?range=${encodeURIComponent(RANGE)}`);

    if (!res.ok) {
        body.innerHTML = `<tr><td colspan="2" class="err-cell">Error ${res.status || ''}: ${res.error}</td></tr>`;
        return;
    }

    const items = res.data.items || [];
    if (items.length === 0) {
        body.innerHTML = `<tr><td colspan="2" class="muted-cell">No data available</td></tr>`;
        return;
    }

    for (const p of items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.path}</td>
            <td class="num">${p.views}</td>
        `;
        body.appendChild(tr);
    }
}

async function loadRecentEvents() {
    const body = $("recentBody");
    body.innerHTML = "";
    const res = await apiFetch(`/api/admin/recent?limit=50`);

    if (!res.ok) {
        body.innerHTML = `<tr><td colspan="6" class="err-cell">Error ${res.status || ''}: ${res.error}</td></tr>`;
        return;
    }

    const items = res.data.items || [];
    if (items.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="muted-cell">No recent events captured</td></tr>`;
        return;
    }

    for (const e of items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${fmtTime(e.ts)}</td>
            <td><span class="badge badge--${e.type || 'unknown'}">${e.type}</span></td>
            <td>${e.path ?? ""}</td>
            <td>${e.game ?? ""}</td>
            <td class="num">${fmtMs(e.duration_ms)}</td>
            <td class="num">${e.score ?? ""}</td>
        `;
        body.appendChild(tr);
    }
}

async function loadAll() {
    // Fire all requests in parallel for speed, but handle them gracefully
    await Promise.allSettled([
        loadKPIs(),
        loadTopGames(),
        loadTopPages(),
        loadRecentEvents()
    ]);
}

// Event Listeners
document.querySelectorAll(".segmented__btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        if (btn.classList.contains("is-active")) return;
        document.querySelectorAll(".segmented__btn").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        RANGE = btn.dataset.range;
        await loadAll();
    });
});

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    loadAll();
});
