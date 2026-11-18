# Legacy retirement plan — Parakollen and Ninefold (Taren 2.2)

Owner decision (2026-11-18): **Parakollen is retired** from the Taren website. **Ninefold** (a Sudoku
browser game) is **excluded** from Taren 2.2. Sources stay in Git; production is not changed until cutover.

## Inventory (from `main` @ `b4b001d`, the live site)

| Item | Parakollen | Ninefold |
|---|---|---|
| What | Paralympics Milano Cortina 2026 tracker | Sudoku game ("CORE SUDOKU LOGIC" in `game.js`) |
| Static files | `public/parakollen/` — `index.html`, `assets/css/parakollen.css`, `assets/js/{api,i18n,parakollen,theme,utils}.js`, `assets/data/{fallback,tv_tabla}.json` | `public/ninefold/` — `index.html`, `assets/css/style.css`, `assets/js/game.js` |
| Live URLs | `https://taren.se/public/parakollen/` | `https://taren.se/public/ninefold/` |
| Pages Functions | `functions/parakollen/api/{medals,schedule,today,news,results}.ts` (+ `_shared.ts`, `_schedule_data.ts`) → `/parakollen/api/*` | none |
| Bindings / secrets | Only `ASSETS`; Cache API key `https://cache.taren.se/<key>`; CORS allow-list `https://taren.se`, `https://www.taren.se`. No KV, D1, R2, secrets or env vars. | none |
| External calls | Static links to svt.se, aftonbladet.se, tv4.se, expressen.se (content data); no API keys | none |
| Workers | none (the separate `workers/taren-analytics` Worker is unrelated) | none |
| Linked from other pages | No (only binary Visual Studio index files mention them) | No |
| Independent repo | `Jimmy7610/Parakollen` — **keep; do not delete** | none |

## New behaviour (implemented on `feature/taren-2.0`, effective only after cutover)

| Route | Response | Implementation |
|---|---|---|
| `/public/parakollen/*` | **410 Gone** + retired page, `noindex` | `site/functions/public/[[path]].ts` → `src/lib/legacy.ts` |
| `/public/ninefold/*` | **410 Gone** | same |
| `/parakollen`, `/parakollen/api/*` | **410 Gone** | `site/functions/parakollen/[[path]].ts` |
| other `/public/*` | normal 404 page | handler falls through (`context.next()`) |

No 301s: there is no relevant replacement page (directive: no homepage dumping). Unit-tested
(`legacy-and-config.test.ts`, `deploy-files.test.ts`); verify 410s on the preview with:
```bash
for p in /public/parakollen/ /public/ninefold/ /parakollen/api/medals; do curl -s -o /dev/null -w "%{http_code} $p\n" https://taren-2-preview.pages.dev$p; done
```

## What is NOT done (needs owner approval)
- No files are deleted from `main`; the legacy site keeps serving both apps until cutover.
- Removing `public/parakollen`, `public/ninefold` and `functions/parakollen` from the repository root is
  an optional clean-up **after** cutover (history keeps them either way).
- If Parakollen should live on elsewhere, deploy `Jimmy7610/Parakollen` as its own Pages project first.
