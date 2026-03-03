var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-8CKAw0/functionsWorker-0.4456092187073084.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function rangeToSinceMs(range) {
  const now = Date.now();
  if (range === "24h") return now - 24 * 60 * 60 * 1e3;
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1e3;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1e3;
  return now - 24 * 60 * 60 * 1e3;
}
__name(rangeToSinceMs, "rangeToSinceMs");
__name2(rangeToSinceMs, "rangeToSinceMs");
var onRequestGet = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "24h";
  const since = rangeToSinceMs(range);
  try {
    const rows = await env.DB.prepare(
      `SELECT game,
              COUNT(CASE WHEN type='game_start' THEN 1 ELSE NULL END) as starts,
              AVG(CASE WHEN type='game_end' THEN duration_ms ELSE NULL END) as avg_duration_ms
       FROM events
       WHERE ts >= ?1 AND game IS NOT NULL
       GROUP BY game
       ORDER BY starts DESC
       LIMIT 10`
    ).bind(since).all();
    return new Response(JSON.stringify({
      items: (rows.results || []).map((r) => ({
        game: r.game,
        starts: Number(r.starts) || 0,
        avg_duration_ms: r.avg_duration_ms ? Math.floor(r.avg_duration_ms) : 0
      }))
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
var onRequestGet2 = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const windowParam = url.searchParams.get("window") || "5m";
  let windowMs = 5 * 60 * 1e3;
  if (windowParam === "1m") windowMs = 1 * 60 * 1e3;
  else if (windowParam === "10m") windowMs = 10 * 60 * 1e3;
  else if (windowParam === "30m") windowMs = 30 * 60 * 1e3;
  const since = Date.now() - windowMs;
  try {
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM events WHERE ts >= ?1"
    ).bind(since).first();
    return new Response(JSON.stringify({
      ok: true,
      count: result?.n ?? 0,
      window: windowParam
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
function getRanges(range) {
  const now = Date.now();
  let duration = 24 * 60 * 60 * 1e3;
  if (range === "7d") duration = 7 * 24 * 60 * 60 * 1e3;
  if (range === "30d") duration = 30 * 24 * 60 * 60 * 1e3;
  const current_start = now - duration;
  const previous_start = current_start - duration;
  return { now, current_start, previous_start };
}
__name(getRanges, "getRanges");
__name2(getRanges, "getRanges");
async function getMetrics(db, start, end) {
  const visitors = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) as n FROM events WHERE ts >= ?1 AND ts < ?2`
  ).bind(start, end).first();
  const pageViews = await db.prepare(
    `SELECT COUNT(*) as n FROM events WHERE ts >= ?1 AND ts < ?2 AND type='page_view'`
  ).bind(start, end).first();
  const mostPlayed = await db.prepare(
    `SELECT game, COUNT(*) as n FROM events
     WHERE ts >= ?1 AND ts < ?2 AND type='game_start' AND game IS NOT NULL
     GROUP BY game ORDER BY n DESC LIMIT 1`
  ).bind(start, end).first();
  const avgRun = await db.prepare(
    `SELECT AVG(duration_ms) as n FROM events
     WHERE ts >= ?1 AND ts < ?2 AND type='game_end' AND duration_ms IS NOT NULL`
  ).bind(start, end).first();
  return {
    visitors: visitors?.n ?? 0,
    page_views: pageViews?.n ?? 0,
    most_played: mostPlayed?.game ?? "\u2014",
    most_played_starts: mostPlayed?.n ?? 0,
    avg_game_duration_ms: avgRun?.n ? Math.floor(avgRun.n) : 0
  };
}
__name(getMetrics, "getMetrics");
__name2(getMetrics, "getMetrics");
var onRequestGet3 = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "24h";
  const { now, current_start, previous_start } = getRanges(range);
  try {
    const current = await getMetrics(env.DB, current_start, now);
    const previous = await getMetrics(env.DB, previous_start, current_start);
    return new Response(JSON.stringify({
      ok: true,
      range,
      current,
      previous,
      // Legacy structure for basic fallback
      visitors: current.visitors,
      visitors_meta: "unique sessions",
      page_views: current.page_views,
      page_views_meta: "total views",
      most_played: current.most_played,
      most_played_meta: current.most_played_starts ? `${current.most_played_starts} starts` : "by starts",
      avg_game_duration_ms: current.avg_game_duration_ms,
      avg_game_duration_meta: "avg duration"
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
function rangeToSinceMs2(range) {
  const now = Date.now();
  if (range === "24h") return now - 24 * 60 * 60 * 1e3;
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1e3;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1e3;
  return now - 24 * 60 * 60 * 1e3;
}
__name(rangeToSinceMs2, "rangeToSinceMs2");
__name2(rangeToSinceMs2, "rangeToSinceMs");
var onRequestGet4 = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "24h";
  const since = rangeToSinceMs2(range);
  try {
    const rows = await env.DB.prepare(
      `SELECT path, COUNT(*) as views
       FROM events
       WHERE ts >= ?1 AND type='page_view' AND path IS NOT NULL
       AND path NOT LIKE '/api/%' AND path NOT LIKE '/assets/%'
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`
    ).bind(since).all();
    return new Response(JSON.stringify({
      items: (rows.results || []).map((r) => ({
        path: r.path,
        views: r.views ?? 0
      }))
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
var onRequestGet5 = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  try {
    const rows = await env.DB.prepare(
      `SELECT ts, type, path, game, duration_ms, score, device, country
       FROM events
       ORDER BY ts DESC
       LIMIT ?1`
    ).bind(limit).all();
    return new Response(JSON.stringify({ items: rows.results || [] }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
var onRequestGet6 = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "24h";
  const now = Date.now();
  let duration = 24 * 60 * 60 * 1e3;
  let bucketFormat = "%Y-%m-%d %H:00";
  if (range === "7d") {
    duration = 7 * 24 * 60 * 60 * 1e3;
    bucketFormat = "%Y-%m-%d";
  } else if (range === "30d") {
    duration = 30 * 24 * 60 * 60 * 1e3;
    bucketFormat = "%Y-%m-%d";
  }
  const start = now - duration;
  try {
    const query = `
      SELECT 
        strftime('${bucketFormat}', ts / 1000, 'unixepoch') as bucket,
        COUNT(CASE WHEN type='page_view' THEN 1 END) as views,
        COUNT(CASE WHEN type='game_start' THEN 1 END) as starts
      FROM events
      WHERE ts >= ?1
      GROUP BY bucket
      ORDER BY bucket ASC
    `;
    const results = await env.DB.prepare(query).bind(start).all();
    return new Response(JSON.stringify({
      ok: true,
      range,
      bins: results.results || []
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestGet");
var ALLOWED_ORIGINS = [
  "https://taren.se",
  "https://www.taren.se",
  "http://localhost:5173",
  // dev
  "http://localhost:8788"
  // wrangler pages dev
];
function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
function handleOptions(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
__name(handleOptions, "handleOptions");
__name2(handleOptions, "handleOptions");
function jsonResponse(data, request, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...corsHeaders(request)
    }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
function todayStockholm() {
  const now = /* @__PURE__ */ new Date();
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return fmt.format(now);
}
__name(todayStockholm, "todayStockholm");
__name2(todayStockholm, "todayStockholm");
function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN((/* @__PURE__ */ new Date(dateStr + "T00:00:00")).getTime());
}
__name(isValidDate, "isValidDate");
__name2(isValidDate, "isValidDate");
function makeApiMeta(sources, error) {
  return {
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    sources,
    ...error ? { error: true } : {}
  };
}
__name(makeApiMeta, "makeApiMeta");
__name2(makeApiMeta, "makeApiMeta");
function getMedalTable() {
  const nations = [
    "CHN",
    "UKR",
    "USA",
    "FRA",
    "GER",
    "CAN",
    "AUT",
    "NOR",
    "GBR",
    "SWE",
    "FIN",
    "JPN",
    "NZL",
    "SUI",
    "NED",
    "AUS",
    "ITA",
    "KOR",
    "CZE",
    "SVK"
  ];
  return nations.map((nation, i) => ({
    nation,
    gold: 0,
    silver: 0,
    bronze: 0,
    total: 0,
    rank: i + 1
  }));
}
__name(getMedalTable, "getMedalTable");
__name2(getMedalTable, "getMedalTable");
async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions(context.request);
  const table = getMedalTable();
  const data = { table };
  const response = {
    meta: makeApiMeta(["fallback"]),
    data
  };
  return jsonResponse(response, context.request);
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
function getNews() {
  return [
    {
      title: "Paralympics 2026: Allt du beh\xF6ver veta om Milano Cortina",
      sourceName: "SVT",
      publishedAt: "2026-03-03T08:00:00+01:00",
      url: "https://www.svt.se",
      summary: "Den 6 mars sm\xE4ller det ig\xE5ng \u2013 Sveriges paralympier siktar p\xE5 medaljsk\xF6rd i Italien.",
      category: "preview"
    },
    {
      title: "Zebastian Modin: 'Vi \xE4r redo f\xF6r Milano'",
      sourceName: "Aftonbladet",
      publishedAt: "2026-03-02T16:30:00+01:00",
      url: "https://www.aftonbladet.se",
      summary: "Sveriges skidskyttestj\xE4rna laddar f\xF6r sin tredje Paralympics.",
      category: "interview"
    },
    {
      title: "Guide: S\xE5 f\xF6ljer du Paralympics 2026 p\xE5 TV",
      sourceName: "TV4",
      publishedAt: "2026-03-02T10:00:00+01:00",
      url: "https://www.tv4.se",
      summary: "TV-tabl\xE5er och streamingtips f\xF6r kommande Paralympics.",
      category: "guide"
    },
    {
      title: "Rullstolscurlinglaget satsar p\xE5 guld i Cortina",
      sourceName: "Expressen",
      publishedAt: "2026-03-01T14:00:00+01:00",
      url: "https://www.expressen.se",
      summary: "Det svenska curlinglaget har haft sin b\xE4sta s\xE4song och siktar h\xF6gt.",
      category: "preview"
    },
    {
      title: "Paraishockey-VM: Sverige utanf\xF6r \u2013 men hoppas p\xE5 framtiden",
      sourceName: "SVT",
      publishedAt: "2026-02-28T09:00:00+01:00",
      url: "https://www.svt.se",
      summary: "Sverige saknas i paraishockeyn men jobbar f\xF6r att bygga ett lag inf\xF6r 2030.",
      category: "feature"
    },
    {
      title: "Milano Cortina: Arenorna som tar emot Paralympics",
      sourceName: "TV4",
      publishedAt: "2026-02-27T12:00:00+01:00",
      url: "https://www.tv4.se",
      summary: "Bormio, Anterselva, Tesero och Milano \u2013 en guide till Paralympics-arenorna.",
      category: "guide"
    }
  ];
}
__name(getNews, "getNews");
__name2(getNews, "getNews");
async function onRequest2(context) {
  if (context.request.method === "OPTIONS") return handleOptions(context.request);
  const items = getNews();
  const data = { items };
  const response = {
    meta: makeApiMeta(["fallback"]),
    data
  };
  return jsonResponse(response, context.request);
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
function getResults(_date) {
  return [];
}
__name(getResults, "getResults");
__name2(getResults, "getResults");
async function onRequest3(context) {
  if (context.request.method === "OPTIONS") return handleOptions(context.request);
  const url = new URL(context.request.url);
  const date = url.searchParams.get("date") || "";
  const sport = url.searchParams.get("sport") || "";
  let events = getResults(date);
  if (sport) events = events.filter((e) => e.sport === sport);
  events.sort((a, b) => {
    const ae = a.endTime || a.startTime;
    const be = b.endTime || b.startTime;
    return new Date(be).getTime() - new Date(ae).getTime();
  });
  const data = { events };
  const response = {
    meta: makeApiMeta(["fallback"]),
    data
  };
  return jsonResponse(response, context.request);
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
var PARALYMPIC_SPORTS = [
  "Alpint",
  "Skidskytte",
  "L\xE4ngdskid\xE5kning",
  "Paraishockey",
  "Snowboard",
  "Rullstolscurling"
];
function ev(id, date, time, status, sport, discipline, venue, participants, isSWE, resultSummary) {
  const startTime = `${date}T${time}:00+01:00`;
  const nations = [...new Set(participants.map((p) => p.nation).filter(Boolean))];
  if (isSWE && !nations.includes("SWE")) nations.push("SWE");
  return {
    id,
    startTime,
    endTime: null,
    status,
    sport,
    discipline,
    venue,
    participants,
    nations,
    isSWE,
    resultSummary: resultSummary || null,
    links: []
  };
}
__name(ev, "ev");
__name2(ev, "ev");
function athlete(name, nation) {
  return { name, nation, role: "athlete", bib: null };
}
__name(athlete, "athlete");
__name2(athlete, "athlete");
function getScheduleForDate(date) {
  const schedule = {
    // ── Mar 4 (Tue) – Wheelchair curling mixed doubles starts ──
    "2026-03-04": [
      ev("pk-0304-cur1", date, "09:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false),
      ev("pk-0304-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false)
    ],
    // ── Mar 5 (Wed) – Curling mixed doubles continues ──
    "2026-03-05": [
      ev("pk-0305-cur1", date, "09:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false),
      ev("pk-0305-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false)
    ],
    // ── Mar 6 (Fri) – Opening Ceremony ──
    "2026-03-06": [
      ev("pk-0306-cur1", date, "09:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false),
      ev("pk-0306-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Mixed Doubles, gruppspel", "Cortina", [], false),
      ev("pk-0306-open", date, "20:00", "upcoming", "Ceremoni", "Invigningsceremoni", "Arena di Verona", [], false)
    ],
    // ── Mar 7 (Sat) – First medals! ──
    "2026-03-07": [
      // Alpine – Downhill
      ev(
        "pk-0307-alp1",
        date,
        "09:30",
        "upcoming",
        "Alpint",
        "St\xF6rtlopp, synneds\xE4ttning",
        "Tofane, Cortina",
        [athlete("Ebba \xC5rsj\xF6", "SWE")],
        true
      ),
      ev("pk-0307-alp2", date, "11:00", "upcoming", "Alpint", "St\xF6rtlopp, st\xE5ende", "Tofane, Cortina", [], false),
      ev("pk-0307-alp3", date, "12:30", "upcoming", "Alpint", "St\xF6rtlopp, sittande", "Tofane, Cortina", [], false),
      // Biathlon – Sprint
      ev(
        "pk-0307-bth1",
        date,
        "10:00",
        "upcoming",
        "Skidskytte",
        "Sprint, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      ev("pk-0307-bth2", date, "11:30", "upcoming", "Skidskytte", "Sprint, st\xE5ende", "Tesero", [], false),
      ev("pk-0307-bth3", date, "13:00", "upcoming", "Skidskytte", "Sprint, sittande", "Tesero", [], false),
      // Snowboard – Cross seeding
      ev("pk-0307-sb1", date, "11:00", "upcoming", "Snowboard", "Snowboardcross, seeding", "Cortina", [], false),
      // Wheelchair curling – Team round robin
      ev(
        "pk-0307-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel: NOR\u2013SWE",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev(
        "pk-0307-cur2",
        date,
        "18:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel: SWE\u2013KOR",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      // Hockey
      ev("pk-0307-hoc1", date, "12:00", "upcoming", "Paraishockey", "Gruppspel", "Milano", [], false),
      ev("pk-0307-hoc2", date, "16:30", "upcoming", "Paraishockey", "Gruppspel", "Milano", [], false)
    ],
    // ── Mar 8 (Sun) ──
    "2026-03-08": [
      // Alpine – Super-G
      ev(
        "pk-0308-alp1",
        date,
        "09:30",
        "upcoming",
        "Alpint",
        "Super-G, synneds\xE4ttning",
        "Tofane, Cortina",
        [athlete("Ebba \xC5rsj\xF6", "SWE")],
        true
      ),
      ev("pk-0308-alp2", date, "11:00", "upcoming", "Alpint", "Super-G, st\xE5ende", "Tofane, Cortina", [], false),
      ev("pk-0308-alp3", date, "12:30", "upcoming", "Alpint", "Super-G, sittande", "Tofane, Cortina", [], false),
      // Biathlon – Pursuit
      ev(
        "pk-0308-bth1",
        date,
        "10:00",
        "upcoming",
        "Skidskytte",
        "Jaktstart, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      ev("pk-0308-bth2", date, "11:30", "upcoming", "Skidskytte", "Jaktstart, st\xE5ende", "Tesero", [], false),
      ev("pk-0308-bth3", date, "13:00", "upcoming", "Skidskytte", "Jaktstart, sittande", "Tesero", [], false),
      // Snowboard – Cross finals
      ev("pk-0308-sb1", date, "11:00", "upcoming", "Snowboard", "Snowboardcross, final", "Cortina", [], false),
      // Curling
      ev(
        "pk-0308-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev("pk-0308-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Gruppspel", "Cortina", [], false),
      // Hockey
      ev("pk-0308-hoc1", date, "12:00", "upcoming", "Paraishockey", "Gruppspel", "Milano", [], false),
      ev("pk-0308-hoc2", date, "16:30", "upcoming", "Paraishockey", "Gruppspel", "Milano", [], false)
    ],
    // ── Mar 9 (Mon) ──
    "2026-03-09": [
      // Alpine – Combined
      ev("pk-0309-alp1", date, "09:00", "upcoming", "Alpint", "Kombination, Super-G", "Tofane, Cortina", [], false),
      ev("pk-0309-alp2", date, "13:00", "upcoming", "Alpint", "Kombination, Slalom", "Tofane, Cortina", [], false),
      // Curling
      ev(
        "pk-0309-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev("pk-0309-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Gruppspel", "Cortina", [], false),
      // Hockey
      ev("pk-0309-hoc1", date, "12:00", "upcoming", "Paraishockey", "Gruppspel", "Milano", [], false)
    ],
    // ── Mar 10 (Tue) ──
    "2026-03-10": [
      // Alpine – Giant Slalom (Women)
      ev("pk-0310-alp1", date, "09:00", "upcoming", "Alpint", "Storslalom, \xE5k 1 (damer)", "Tofane, Cortina", [], false),
      ev("pk-0310-alp2", date, "12:30", "upcoming", "Alpint", "Storslalom, \xE5k 2 (damer)", "Tofane, Cortina", [], false),
      // XC Skiing – 10 km
      ev(
        "pk-0310-xc1",
        date,
        "09:45",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "10 km klassiskt, sittande",
        "Tesero",
        [athlete("Arnt-Christian Furuberg", "SWE")],
        true
      ),
      ev(
        "pk-0310-xc2",
        date,
        "11:30",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "10 km klassiskt, st\xE5ende",
        "Tesero",
        [athlete("Ellen Westerlund", "SWE"), athlete("Alice Morelius", "SWE")],
        true
      ),
      ev(
        "pk-0310-xc3",
        date,
        "13:30",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "10 km klassiskt, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      // Curling
      ev(
        "pk-0310-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev("pk-0310-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Gruppspel", "Cortina", [], false),
      // Hockey
      ev("pk-0310-hoc1", date, "12:00", "upcoming", "Paraishockey", "Kvartsfinal", "Milano", [], false)
    ],
    // ── Mar 11 (Wed) ──
    "2026-03-11": [
      // Alpine – Giant Slalom (Men)
      ev("pk-0311-alp1", date, "09:00", "upcoming", "Alpint", "Storslalom, \xE5k 1 (herrar)", "Tofane, Cortina", [], false),
      ev("pk-0311-alp2", date, "12:30", "upcoming", "Alpint", "Storslalom, \xE5k 2 (herrar)", "Tofane, Cortina", [], false),
      // Biathlon – Middle distance
      ev(
        "pk-0311-bth1",
        date,
        "10:00",
        "upcoming",
        "Skidskytte",
        "Medeldistans, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      ev("pk-0311-bth2", date, "11:30", "upcoming", "Skidskytte", "Medeldistans, st\xE5ende", "Tesero", [], false),
      ev("pk-0311-bth3", date, "13:00", "upcoming", "Skidskytte", "Medeldistans, sittande", "Tesero", [], false),
      // XC Skiing – Sprint
      ev("pk-0311-xc1", date, "10:00", "upcoming", "L\xE4ngdskid\xE5kning", "Sprint, sittande", "Tesero", [], false),
      ev(
        "pk-0311-xc2",
        date,
        "11:00",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "Sprint, st\xE5ende",
        "Tesero",
        [athlete("Ellen Westerlund", "SWE")],
        true
      ),
      ev(
        "pk-0311-xc3",
        date,
        "12:00",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "Sprint, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      // Curling
      ev(
        "pk-0311-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev("pk-0311-cur2", date, "18:35", "upcoming", "Rullstolscurling", "Gruppspel", "Cortina", [], false)
    ],
    // ── Mar 12 (Thu) ──
    "2026-03-12": [
      // Curling – semifinals begin
      ev(
        "pk-0312-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Gruppspel",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      ),
      ev("pk-0312-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Gruppspel", "Cortina", [], false),
      // Hockey
      ev("pk-0312-hoc1", date, "12:00", "upcoming", "Paraishockey", "Semifinal", "Milano", [], false),
      ev("pk-0312-hoc2", date, "16:30", "upcoming", "Paraishockey", "Semifinal", "Milano", [], false)
    ],
    // ── Mar 13 (Fri) ──
    "2026-03-13": [
      // Alpine – Slalom (Women)
      ev("pk-0313-alp1", date, "09:00", "upcoming", "Alpint", "Slalom, \xE5k 1 (damer)", "Tofane, Cortina", [], false),
      ev("pk-0313-alp2", date, "13:00", "upcoming", "Alpint", "Slalom, \xE5k 2 (damer)", "Tofane, Cortina", [], false),
      // Biathlon – Individual
      ev(
        "pk-0313-bth1",
        date,
        "10:00",
        "upcoming",
        "Skidskytte",
        "Individuellt, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      ev("pk-0313-bth2", date, "11:30", "upcoming", "Skidskytte", "Individuellt, st\xE5ende", "Tesero", [], false),
      ev("pk-0313-bth3", date, "13:00", "upcoming", "Skidskytte", "Individuellt, sittande", "Tesero", [], false),
      // Curling
      ev(
        "pk-0313-cur1",
        date,
        "09:35",
        "upcoming",
        "Rullstolscurling",
        "Semifinal",
        "Cortina",
        [athlete("Ronny Persson", "SWE")],
        true
      )
    ],
    // ── Mar 14 (Sat) ──
    "2026-03-14": [
      // Alpine – Slalom (Men)
      ev("pk-0314-alp1", date, "09:00", "upcoming", "Alpint", "Slalom, \xE5k 1 (herrar)", "Tofane, Cortina", [], false),
      ev("pk-0314-alp2", date, "12:00", "upcoming", "Alpint", "Slalom, \xE5k 2 (herrar)", "Tofane, Cortina", [], false),
      // XC Skiing – Relay
      ev(
        "pk-0314-xc1",
        date,
        "10:00",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "4\xD72.5 km stafett, mixed",
        "Tesero",
        [athlete("Ellen Westerlund", "SWE"), athlete("Alice Morelius", "SWE")],
        true
      ),
      ev("pk-0314-xc2", date, "11:15", "upcoming", "L\xE4ngdskid\xE5kning", "4\xD72.5 km stafett, \xF6ppen", "Tesero", [], false),
      // Snowboard – Banked Slalom
      ev("pk-0314-sb1", date, "10:00", "upcoming", "Snowboard", "Banked Slalom, \xE5k 1", "Cortina", [], false),
      ev("pk-0314-sb2", date, "12:00", "upcoming", "Snowboard", "Banked Slalom, \xE5k 2", "Cortina", [], false),
      ev("pk-0314-sb3", date, "14:00", "upcoming", "Snowboard", "Banked Slalom, \xE5k 3", "Cortina", [], false),
      // Curling – Finals
      ev("pk-0314-cur1", date, "09:35", "upcoming", "Rullstolscurling", "Bronsmatch", "Cortina", [], false),
      ev("pk-0314-cur2", date, "14:35", "upcoming", "Rullstolscurling", "Final", "Cortina", [], false),
      // Hockey
      ev("pk-0314-hoc1", date, "12:00", "upcoming", "Paraishockey", "Bronsmatch", "Milano", [], false)
    ],
    // ── Mar 15 (Sun) – Final day ──
    "2026-03-15": [
      // XC Skiing – 20 km
      ev("pk-0315-xc1", date, "09:00", "upcoming", "L\xE4ngdskid\xE5kning", "20 km fritt, sittande", "Tesero", [], false),
      ev(
        "pk-0315-xc2",
        date,
        "10:30",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "20 km fritt, st\xE5ende",
        "Tesero",
        [athlete("Ellen Westerlund", "SWE"), athlete("Alice Morelius", "SWE")],
        true
      ),
      ev(
        "pk-0315-xc3",
        date,
        "12:30",
        "upcoming",
        "L\xE4ngdskid\xE5kning",
        "20 km fritt, synneds\xE4ttning",
        "Tesero",
        [athlete("Zebastian Modin", "SWE")],
        true
      ),
      // Hockey – Gold medal game
      ev("pk-0315-hoc1", date, "12:00", "upcoming", "Paraishockey", "Guldmatch", "Milano", [], false),
      // Closing ceremony
      ev("pk-0315-close", date, "18:00", "upcoming", "Ceremoni", "Avslutningsceremoni", "Cortina Olympic Ice Stadium", [], false)
    ]
  };
  return schedule[date] || [];
}
__name(getScheduleForDate, "getScheduleForDate");
__name2(getScheduleForDate, "getScheduleForDate");
function getTodayEvents(todayDate) {
  const gameStart = "2026-03-04";
  const gameEnd = "2026-03-15";
  if (todayDate < gameStart) {
    return getScheduleForDate("2026-03-06");
  }
  if (todayDate > gameEnd) {
    return [];
  }
  return getScheduleForDate(todayDate);
}
__name(getTodayEvents, "getTodayEvents");
__name2(getTodayEvents, "getTodayEvents");
async function onRequest4(context) {
  if (context.request.method === "OPTIONS") return handleOptions(context.request);
  const url = new URL(context.request.url);
  const rawDate = url.searchParams.get("date") || "";
  const date = rawDate && isValidDate(rawDate) ? rawDate : todayStockholm();
  const sport = url.searchParams.get("sport") || "";
  const discipline = url.searchParams.get("discipline") || "";
  let events = getScheduleForDate(date);
  if (sport) events = events.filter((e) => e.sport === sport);
  if (discipline) events = events.filter((e) => e.discipline === discipline);
  const data = { events, sports: PARALYMPIC_SPORTS };
  const response = {
    meta: makeApiMeta(["ipc", "parasport.se", "worldcurling.org"]),
    data
  };
  return jsonResponse(response, context.request);
}
__name(onRequest4, "onRequest4");
__name2(onRequest4, "onRequest");
function getFallbackNews() {
  return [
    {
      title: "Paralympics 2026: Allt du beh\xF6ver veta om Milano Cortina",
      sourceName: "SVT",
      publishedAt: "2026-03-03T08:00:00+01:00",
      url: "https://www.svt.se",
      summary: "Den 6 mars sm\xE4ller det ig\xE5ng \u2013 Sveriges paralympier siktar p\xE5 medaljsk\xF6rd i Italien.",
      category: "preview"
    },
    {
      title: "Zebastian Modin: 'Vi \xE4r redo f\xF6r Milano'",
      sourceName: "Aftonbladet",
      publishedAt: "2026-03-02T16:30:00+01:00",
      url: "https://www.aftonbladet.se",
      summary: "Sveriges skidskyttestj\xE4rna laddar f\xF6r sin tredje Paralympics.",
      category: "interview"
    },
    {
      title: "Guide: S\xE5 f\xF6ljer du Paralympics 2026 p\xE5 TV",
      sourceName: "TV4",
      publishedAt: "2026-03-02T10:00:00+01:00",
      url: "https://www.tv4.se",
      summary: "TV-tabl\xE5er och streamingtips f\xF6r kommande Paralympics.",
      category: "guide"
    }
  ];
}
__name(getFallbackNews, "getFallbackNews");
__name2(getFallbackNews, "getFallbackNews");
async function onRequest5(context) {
  if (context.request.method === "OPTIONS") return handleOptions(context.request);
  const today = todayStockholm();
  const events = getTodayEvents(today);
  const news = getFallbackNews();
  const data = { events, news, sports: PARALYMPIC_SPORTS };
  const response = {
    meta: makeApiMeta(["ipc", "parasport.se", "worldcurling.org"]),
    data
  };
  return jsonResponse(response, context.request);
}
__name(onRequest5, "onRequest5");
__name2(onRequest5, "onRequest");
var onRequestPost = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
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
  if (type === "page_view" && (path?.startsWith("/api") || path?.startsWith("/assets"))) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { "content-type": "application/json" }
    });
  }
  const allowed = {
    ts: Number(body.ts) || Date.now(),
    type,
    path,
    game,
    session_id: sessionId,
    duration_ms: body.duration_ms != null ? Math.min(Number(body.duration_ms), 36e5) : null,
    score: body.score != null ? Number(body.score) : null,
    device: body.device ? String(body.device).slice(0, 32) : null,
    country: request.headers.get("cf-ipcountry") || null
  };
  try {
    await env.DB.prepare(
      `INSERT INTO events (ts, type, path, game, session_id, duration_ms, score, device, country)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    ).bind(
      allowed.ts,
      allowed.type,
      allowed.path,
      allowed.game,
      allowed.session_id,
      allowed.duration_ms,
      allowed.score,
      allowed.device,
      allowed.country
    ).run();
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}, "onRequestPost");
var onRequestGet7 = /* @__PURE__ */ __name2(async () => {
  return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json" }
  });
}, "onRequestGet");
async function onRequest6(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname.startsWith("/admin/")) {
    return context.env.ASSETS.fetch(url.origin + "/index.html");
  }
  if (url.pathname.includes(".") || url.pathname.startsWith("/api")) {
    return context.next();
  }
  const res = await context.next();
  if (res.status === 404) {
    return context.env.ASSETS.fetch(new Request(new URL("/index.html", url), context.request));
  }
  return res;
}
__name(onRequest6, "onRequest6");
__name2(onRequest6, "onRequest");
var routes = [
  {
    routePath: "/api/admin/games",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/admin/live",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/admin/overview",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/admin/pages",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/admin/recent",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/admin/timeseries",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/parakollen/api/medals",
    mountPath: "/parakollen/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/parakollen/api/news",
    mountPath: "/parakollen/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/parakollen/api/results",
    mountPath: "/parakollen/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/parakollen/api/schedule",
    mountPath: "/parakollen/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/parakollen/api/today",
    mountPath: "/parakollen/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/event",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/event",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-qh0fBK/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-qh0fBK/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.4456092187073084.js.map
