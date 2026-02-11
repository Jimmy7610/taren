const $ = (id) => document.getElementById(id);

let RANGE = "24h";

function fmtMs(ms) {
    if (!ms || ms <= 0) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
}

async function api(path) {
    const res = await fetch(path, { credentials: "include" });
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
    return res.json();
}

async function load() {
    const overview = await api(`/api/admin/overview?range=${encodeURIComponent(RANGE)}`);
    $("kpiVisitors").textContent = overview.visitors ?? "—";
    $("kpiVisitorsMeta").textContent = overview.visitors_meta ?? "unique sessions";
    $("kpiPageViews").textContent = overview.page_views ?? "—";
    $("kpiPageViewsMeta").textContent = overview.page_views_meta ?? "views";
    $("kpiMostPlayed").textContent = overview.most_played ?? "—";
    $("kpiMostPlayedMeta").textContent = overview.most_played_meta ?? "by starts";
    $("kpiAvgRun").textContent = fmtMs(overview.avg_game_duration_ms);
    $("kpiAvgRunMeta").textContent = overview.avg_game_duration_meta ?? "avg duration";

    const games = await api(`/api/admin/games?range=${encodeURIComponent(RANGE)}`);
    const gamesBody = $("topGamesBody");
    gamesBody.innerHTML = "";
    for (const g of games.items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${g.game}</td>
      <td class="num">${g.starts}</td>
      <td class="num">${fmtMs(g.avg_duration_ms)}</td>
    `;
        gamesBody.appendChild(tr);
    }

    const pages = await api(`/api/admin/pages?range=${encodeURIComponent(RANGE)}`);
    const pagesBody = $("topPagesBody");
    pagesBody.innerHTML = "";
    for (const p of pages.items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${p.path}</td>
      <td class="num">${p.views}</td>
    `;
        pagesBody.appendChild(tr);
    }

    const recent = await api(`/api/admin/recent?limit=50`);
    const recentBody = $("recentBody");
    recentBody.innerHTML = "";
    for (const e of recent.items) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${fmtTime(e.ts)}</td>
      <td>${e.type}</td>
      <td>${e.path ?? ""}</td>
      <td>${e.game ?? ""}</td>
      <td class="num">${fmtMs(e.duration_ms)}</td>
      <td class="num">${e.score ?? ""}</td>
    `;
        recentBody.appendChild(tr);
    }
}

document.querySelectorAll(".segmented__btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        document.querySelectorAll(".segmented__btn").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        RANGE = btn.dataset.range;
        await load();
    });
});

load().catch(err => {
    console.error(err);
    alert("Admin API not reachable. Check Cloudflare Access + Worker routes.");
});
