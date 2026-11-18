# Taren 2.3 — Godkännandepaket för produktionslansering

Datum: 2026-11-18 · Release-kandidat: `f39692f12e0af14f97cb69a760f691480b94a741`
(gren `feature/taren-2.3-production-readiness`, live på https://preview-drafts.taren-2-preview.pages.dev)

> Inget i det här paketet har ändrat produktion, DNS, Cloudflare eller den publika sajten. Allt nedan är
> förslag som kräver ditt uttryckliga godkännande. Detta är en teknisk granskning, inte juridisk rådgivning.

---

## 0. Kort sammanfattning

- **Tekniskt redo:** alla tester gröna, och release-kandidaten är verifierad live på förhandsversionen (290/290 webbläsartester).
- **Rekommendation: GO när fyra beslut är fattade** (avsnitt 6): de juridiska texterna, kontaktväg, copyright-raden och Cloudflare-kontrollerna i steg B och E.
- **Säkerhet:** dagens taren.se exponerar interna projektfiler. **Repot är dock publikt på GitHub**, så samma filer är redan offentliga där. Inga hemligheter hittades, varken i nuvarande kod eller i hela Git-historiken. Lanseringen tar bort exponeringen från webbplatsen.

---

## 1. Vad som redan är klart

| Område | Status |
|---|---|
| Ny Astro-sajt (7 publika sidor, 404, 410) | ✅ Byggd, testad och live på förhandsversionen |
| Produkter | ✅ Pulse Garden publicerad (under utveckling, inga nedladdningar). Lumen Capture och PDF Studio är **opublicerade utkast**. |
| Nedladdningar | ✅ Inga. Schemat kräver ditt release-godkännande (`releaseApproval`) för varje nedladdningslänk, även på utkast. |
| Säkerhetsheaders | ✅ CSP utan `unsafe-*`, HSTS, X-Frame-Options med flera, nu även på 410-sidor |
| Sökmotorer | ✅ `noindex` på alla `*.pages.dev`; taren.se förblir indexerbar (verifierat i Cloudflares egen runtime) |
| Pensionerade adresser | ✅ Gamla spel, Parakollen och Ninefold ger 410; `/about` ger 301 till `/studio/` |
| Integritet | ✅ Verifierat: 0 cookies, 0 lagring, ingen analys, inga tredjepartsanrop |
| Ko-fi | ✅ En enda URL (`https://ko-fi.com/taren`), ny flik, `noopener noreferrer`, frivillig formulering |
| Tester | ✅ 88 enhetstester, 290 Playwright-tester, Lighthouse 100/100/100/100 på alla 7 sidor, 55 Cloudflare-kontroller |
| Admin-API på nuvarande produktion | ✅ Säkrat (PR #1): 401 utan inloggning |
| Planer | ✅ Cutover-plan, rollback, juridisk granskning, publiceringsflöde |

---

## 2. Juridiska texter — nuvarande förslag, rekommendationer och beslut

Sajten är på engelska; citaten nedan är **exakt den text som ligger live på förhandsversionen nu**. Förslag på ny
text skrivs också på engelska, så att de kan klistras in direkt. Inget är ändrat på sajten; varje ändring blir en liten
uppföljande commit som testas om innan lansering.

### 2.1 Integritetspolicy (`/privacy/`)

**Nuvarande text (förkortad till de delar som berörs):**
> **Who is responsible** — taren.se is run by Jimmy Eliasson, an independent developer in Sweden, under the name Taren.
> You can get in touch through GitHub (@Jimmy7610).
>
> **What this website does not do** — It has no user accounts, sign-up forms, newsletters or comment fields. It sets no
> cookies and does not use local storage for tracking. It runs no analytics, advertising or tracking scripts. It loads no
> third-party scripts, fonts or embeds. Fonts and images are served from taren.se itself.
>
> **Hosting** — The site is hosted on Cloudflare. To deliver pages and protect the site against abuse, Cloudflare
> necessarily processes technical information about each request, such as your IP address, browser user agent and the
> page you asked for. Taren does not use this information to identify or profile visitors. […]
>
> **Links to other sites** — […] If you contribute through Ko-fi, Ko-fi may share details you give it, such as your name,
> message and email address, with Taren. Taren uses them only to acknowledge and keep a record of the contribution and
> does not sell or share them.
>
> **Your rights** — If you are in the EU or EEA, the GDPR gives you rights […]. You can also contact the Swedish
> Authority for Privacy Protection (IMY).

**Bedömning:** påståendena om cookies, analys och tredjepart stämmer, det har jag verifierat. Det som saknas är en
riktig kontaktväg (en publik GitHub-profil är inte en privat kanal för dataförfrågningar), rättslig grund och
lagringstid.

**Rekommenderade ändringar:**
| # | Förslag | Behöver ditt beslut |
|---|---|---|
| P1 | Byt kontaktvägen till en e-postadress som **du själv väljer** (skrivs in i `src/config/site.ts`, och slår då igenom på privacy, terms och studio). | **Ja** — vilken adress |
| P2 | Lägg till efter Hosting-stycket: *"Cloudflare processes this information on the basis of Taren's legitimate interest in delivering and securing the website (GDPR Article 6(1)(f)). Taren does not keep its own copies of these logs."* | **Ja** — bekräfta att du inte har Logpush eller egen loggning påslagen |
| P3 | Lägg till i Ko-fi-stycket: *"Taren keeps these details only for as long as bookkeeping requires."* | **Ja** — bekräfta lagringstiden |
| P4 | Sätt "Last updated" till lanseringsdatumet. | Nej (görs vid lansering) |

### 2.2 Villkor (`/terms/`)

**Nuvarande text (berörda delar):**
> **About this website** — taren.se presents the work of Taren, an independent software studio run by Jimmy Eliasson in
> Sweden. By using the site, you agree to these terms.
>
> **Content and trademarks** — Unless stated otherwise, the text, images, screenshots and design of this website are the
> work of Jimmy Eliasson, published under the name Taren. The fonts Inter and Sora are used under the SIL Open Font
> License. […]
>
> **Product information** — […] a product may never be released. Nothing on this site is an offer to sell.
>
> **No warranty** — […] To the extent the law allows, Taren is not liable for losses arising from use of the website.
> Nothing in these terms limits rights you have under consumer law that cannot be limited.
>
> **Contact and changes** — Questions are welcome through GitHub (@Jimmy7610). […]

**Rekommenderade ändringar:**
| # | Förslag | Behöver ditt beslut |
|---|---|---|
| T1 | Samma kontaktväg som P1. | **Ja** (samma beslut som P1) |
| T2 | Ändra *"Taren is not liable"* till *"the person behind Taren is not liable"*. Taren är ett namn, inte en juridisk person. | Rekommenderas |
| T3 | Lägg till: *"These terms are governed by Swedish law. This does not remove protection you have under mandatory consumer law where you live."* | **Ja** — gärna efter kontroll med en jurist |

### 2.3 Support och Ko-fi (`/support/`)

**Nuvarande text (berörda delar):**
> **Completely optional** — Support is never required. Nothing on this site, and nothing in a free Taren project, is
> locked behind a contribution. […]
>
> **What your support does** — […] A contribution is a voluntary tip: it does not buy a product, a service, a licence or
> priority […]
>
> **How payments work** — Payments are handled entirely by Ko-fi and its payment providers. Taren never sees or stores
> your card or bank details. · You choose whether to contribute and how much. · Ko-fi may pass details you give it, such
> as your name, message and email address, on to Taren so the contribution can be acknowledged. […]

**Bedömning:** formuleringen är frivillig och utan skuldbeläggande, och den lovar inget köp. Den stämmer bara om
**Ko-fi är inställt på enbart dricks** (inga butiksvaror, medlemskap med förmåner eller beställningar).

| # | Förslag | Behöver ditt beslut |
|---|---|---|
| S1 | Bekräfta i Ko-fi att endast dricks/donation är påslaget. Om butik eller medlemskap används måste texten skrivas om och konsumenträtt utredas först. | **Ja** |
| S2 | Kontrollera i Ko-fi vilka uppgifter du faktiskt ser om en supporter (namn, meddelande, e-post). | **Ja** |
| S3 | Skatt: frivilliga bidrag till en privatperson kan vara skattepliktiga. Fråga Skatteverket eller en redovisningskonsult. Påverkar inte sajttexten. | **Ja** (din egen kontroll) |
| S4 | Valfritt: rubriken *"Enjoying what we're building?"* säger "we" om en enpersonsstudio. Alternativ: *"Enjoying what Taren is building?"* | Valfritt |

### 2.4 Studioinformation (`/studio/`)

**Nuvarande text (berörda delar):**
> **Who is behind Taren** — Taren is created by Jimmy Eliasson, an independent developer in Sweden. There is no team
> behind the name and no company pretending to be bigger than it is […]
>
> **How it started** — Taren began as a personal creative lab on taren.se: a calm place for small, strange browser games
> and sketches, vibe-coded and refined step by step. […] Taren 2.0 turns those lessons into a home for finished,
> separately branded products.
>
> **How things are built** — […] Automated tests are written wherever they are practical, and each product page says how
> its current build has been verified.
>
> **Get in touch** — The best way to reach the studio right now is through GitHub (@Jimmy7610).

| # | Förslag | Behöver ditt beslut |
|---|---|---|
| ST1 | Bekräfta att ditt fullständiga namn ska stå publikt (på studio, privacy, terms och i strukturerad data). | **Ja** |
| ST2 | Valfritt: ersätt *"Taren 2.0 turns those lessons into…"* (versionsnummer är intern jargong) med *"Today, taren.se is a home for finished, separately branded products."* | Valfritt |
| ST3 | Bekräfta ordvalet *"vibe-coded"*. | Valfritt |
| ST4 | Kontaktväg enligt P1. | (samma beslut) |

### 2.5 Copyright-rad (sidfoten)

**Nuvarande:** *"© 2026 Taren. All rights reserved."* och *"Made in Sweden."*

Taren är inte en juridisk person, och de rättade villkoren säger nu att innehållet är ditt verk. Raden är vanlig praxis
men går emot villkoren.

| Alternativ | Text |
|---|---|
| A (oförändrat) | © 2026 Taren. All rights reserved. |
| **B (rekommenderas)** | © 2026 Jimmy Eliasson · Taren |
| C | © 2026 Jimmy Eliasson (Taren). All rights reserved. |

**Ditt beslut:** A, B eller C.

### 2.6 Kontaktinformation

**Nuvarande:** GitHub-profilen `@Jimmy7610` är enda kontaktvägen (privacy, terms, studio). Den gamla About-sidan på
taren.se visar en personlig e-postadress. Den sidan försvinner vid lanseringen.

| Alternativ | Konsekvens |
|---|---|
| **A (rekommenderas)** | En e-postadress du skapar för Taren. Bäst för GDPR-förfrågningar och App Store. |
| B | Behåll GitHub vid lansering och lägg till e-post senare. Fungerar, men ger en svagare GDPR-kontaktväg. |

Jag har **inte** hittat på någon adress. Du anger den själv.

---

## 3. Cloudflare — steg för steg i dashboarden

> Menynamnen är på engelska som i dashboarden och kan skilja sig något om Cloudflare har ändrat gränssnittet.
> **Steg A–E ändrar ingenting.** Steg F är själva lanseringen och kräver ditt godkännande.

### A. Hitta rätt projekt (läsa)
1. ☐ Logga in på dash.cloudflare.com och kontrollera att kontot har 2FA (My Profile → Authentication).
2. ☐ **Workers & Pages** → listan ska visa två Pages-projekt: **`taren`** (produktion) och **`taren-2-preview`** (förhandsversion).
3. ☐ Öppna **`taren`** → fliken **Custom domains**: `taren.se` ska stå som **Active**. (Om domänen står på ett annat projekt: stoppa och meddela mig.)

### B. Dokumentera nuvarande konfiguration (läsa och ta skärmdumpar)
4. ☐ `taren` → **Settings → Build** → Build configuration. Förväntat nu: Build command *tomt*, Build output directory `/` eller tomt, Root directory *tomt*. Notera även Build system version.
5. ☐ **Settings → Branch control**: Production branch = `main`.
6. ☐ **Settings → Variables and Secrets** (Production och Preview): notera **endast namnen**. Förväntat: `ADMIN_API_TOKEN`, `ADMIN_EMAILS`, `ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, `ANALYTICS_ALLOWED_ORIGINS`, `ANALYTICS_INGEST`. Kontrollera att token-värdena är av typen *Secret* (krypterade). Skriv aldrig av värdena.
7. ☐ **Settings → Bindings**: D1-bindning `DB` → notera databasens namn.
8. ☐ **Settings → Runtime/Functions**: notera compatibility date och flags.
9. ☐ **Deployments**: notera ID för nuvarande Production-deployment och att den är byggd från commit **`7438a6a`**. *Det är din rollback-punkt.*

### C. Bevara nuvarande deployment för rollback
10. ☐ Radera **inga** deployments. Cloudflare behåller tidigare deployments, och "Rollback to this deployment" fungerar direkt.
11. ☐ (Valfritt, kräver ditt OK) Jag kan skapa en Git-tagg `legacy-production-7438a6a` som permanent markör i repot.

### D. DNS och domäner (läsa)
12. ☐ **Websites → taren.se → DNS → Records**: apex `taren.se` ska peka på `taren.pages.dev` (CNAME, proxied/orange moln). **Ändra ingenting.** Lanseringen kräver ingen DNS-ändring.
13. ☐ `www.taren.se` har i dag ingen fungerande post (den svarar inte). Inget att flytta. Att lägga till www med omdirigering är ett senare, separat beslut.
14. ☐ **SSL/TLS → Edge Certificates**: certifikatet för taren.se ska vara Active.

### E. Inställningar som måste vara AV (annars bryts integritetslöften eller CSP)
15. ☐ **Analytics & Logs → Web Analytics**: ingen automatisk injicering för taren.se. Kontrollera även Pages-projektets *Web Analytics*.
16. ☐ **Zaraz**: avstängt eller tomt för taren.se.
17. ☐ **Security → Bots → Bot Fight Mode**: av. Annars kan Cloudflare sätta cookien `__cf_bm`, och privacy-sidan lovar inga cookies.
18. ☐ **Speed → Optimization → Rocket Loader**: av. Den injicerar skript som CSP blockerar.
19. ☐ **Scrape Shield → Email Address Obfuscation**: av eller verkningslös (den injicerar skript).
20. ☐ **Rules → Transform Rules (Modify Response Header)**: inga regler som sätter `X-Robots-Tag`, `Content-Security-Policy` eller cookies för taren.se.
21. ☐ **Analytics & Logs → Logpush**: notera om något är påslaget (påverkar P2).

### F. Lanseringen (kräver ditt GO — se avsnitt 5)
22. ☐ Jag öppnar en PR `feature/taren-2.3-production-readiness` → `main` (med de textändringar du godkänt). CI måste vara grön. **Ingen merge än.**
23. ☐ `taren` → **Settings → Build**: Root directory `site`, Build command `npm ci && npm run build`, Build output directory `dist`. **Variables:** lägg till `NODE_VERSION` = `22` (Production och Preview). Se till att `TAREN_SHOW_DRAFTS` **inte** finns. Spara (sparandet startar ingen build).
    - *Om något pushas till `main` innan merge byggs det med nya inställningar, och bygget misslyckas eftersom `site/` saknas på main. Då ligger den gamla sajten kvar. Ofarligt, men gör steg 23 och 24 nära varandra.*
24. ☐ Merga PR:en. Cloudflare bygger `main` med de nya inställningarna.
25. ☐ **Deployments**: följ bygget. Det ska visa `npm ci`, `astro build`, att Functions-katalogen hittas och att `dist` laddas upp. Misslyckas bygget fortsätter den gamla sajten att visas.

### G. Verifiering efter lansering (jag kör kommandona; du tittar i mobilen)
26. ☐ **Sidor:** `/`, `/products/`, `/products/pulse-garden/`, `/studio/`, `/support/`, `/privacy/`, `/terms/`, `/sitemap.xml` och `/robots.txt` ger 200.
27. ☐ **noindex:** `curl -sI https://taren.se/ | grep -i x-robots-tag` ger **inget** (taren.se ska indexeras). `curl -sI https://taren.pages.dev/ | grep -i x-robots-tag` ger `noindex, nofollow`.
28. ☐ **Interna filer borta (båda värdnamnen):** `/README.md`, `/.gitignore`, `/docs/current-status.md`, `/.agent/ARCHITECTURE.md`, `/workers/taren-analytics/wrangler.toml` och `/tests/security/package.json` ger **404** på både `https://taren.se` och `https://taren.pages.dev`.
29. ☐ **Pensionerat:** `/games/`, `/public/parakollen/` och `/public/ninefold/` ger 410 med säkerhetsheaders. `/api/admin/overview` och `/api/event` ger 404.
30. ☐ **Utkast dolda:** `/products/lumen-capture/` och `/products/pdfstudio/` ger 404 och syns inte på `/products/`.
31. ☐ **I mobilen:** startsidan, menyn, Pulse Gardens galleri och ljuslåda, Ko-fi-länken (ny flik) och en 404-sida.

### H. Resurser som måste bevaras (radera inget vid lanseringen)
| Resurs | Åtgärd vid lansering | Senare (ditt beslut) |
|---|---|---|
| Pages-projekt `taren` | Byggkonfigurationen ändras | — |
| Tidigare deployments i `taren` | **Behåll** (rollback) | — |
| Secrets och variabler i `taren` (namnen ovan) | **Behåll** (rollback behöver dem) | Ta bort efter en stabil vecka |
| D1-bindning `DB` och D1-databasen | **Behåll** | Exportera, och behåll eller radera datan (beslut L12) |
| Worker `taren-analytics` | **Behåll**, påverkas inte | Behåll, stäng av eller radera |
| Cloudflare Access-applikationen för admin-API:t | **Behåll** | Ta bort efter secrets |
| Pages-projekt `taren-2-preview` | **Behåll** | — |
| GitHub-repot `Jimmy7610/Parakollen` | **Behåll** | — |

---

## 4. Säkerhet — interna filer på nuvarande taren.se

### 4.1 Fakta (verifierat 2026-11-18)
- Nuvarande produktion serverar hela repo-roten. **Exponerat (byte-identiskt med Git):**
  - `.agent/` (200 filer: agentinstruktioner och Python-skript),
  - `docs/` (9 filer, bland annat en beskrivning av admin-API:ts skydd),
  - `tests/security/` (9 filer),
  - `workers/taren-analytics/` (källkod, databasschema och `wrangler.toml` med D1-databasens ID),
  - `.vs/` (Visual Studio-index, som kan innehålla lokala sökvägar),
  - `templates/`, `.github/workflows/`, `README.md` och `.gitignore`.
- **Samma filer exponeras på `taren.pages.dev`.**
- **Inte exponerat:** källkoden för Pages Functions (inklusive admin-autentiseringen) och `CLAUDE.md` (finns inte på `main`; tidigare felaktigt listad i audit F1, nu rättat).
- **Inga hemligheter:** en mönstersökning efter nycklar, tokens, privata nycklar och `.env`-filer gav 0 träffar, både i nuvarande `main` och i **hela Git-historiken**. De e-postadresser och Access-domäner som finns i testerna är påhittade testvärden.
- **Viktigt:** repot `Jimmy7610/taren` är **publikt på GitHub**. Allt ovan är alltså redan offentligt där, och webbexponeringen lägger i praktiken bara till ett andra ställe att läsa samma sak.

### 4.2 Riskbedömning
Låg till medel. Inga inloggningsuppgifter läcker. Det som syns är arkitekturen (hur admin-API:t skyddas, hur
analysdatabasen ser ut) och D1-databasens ID. ID:t är ingen nyckel; det kräver en API-token med rätt behörighet.

### 4.3 Åtgärdsplan (i prioritetsordning)
| # | Åtgärd | Täcker | Kräver |
|---|---|---|---|
| **M1 (rekommenderas)** | **Genomför lanseringen** (avsnitt 3F). Endast `dist/` serveras därefter, och bygget stoppas automatiskt om interna filer skulle hamna där (`check:site`). | taren.se **och** taren.pages.dev | Ditt GO |
| M2 (bara om lanseringen dröjer mer än cirka en vecka) | WAF-regel för zonen taren.se (Security → WAF → Custom rules, Action *Block*) på sökvägar som börjar med `/.agent/`, `/.vs/`, `/docs/`, `/workers/`, `/tests/` och `/templates/`, samt `/README.md` och `/.gitignore`. Direkt verkan och lätt att ta bort. | **Bara taren.se**, inte taren.pages.dev | Ditt OK, ändring i dashboarden |
| M3 (alternativ till M2) | Liten ändring i den gamla catch-all-funktionen på `main` som ger 404 för samma sökvägar. | Båda värdnamnen | Ditt OK, PR till `main` |
| M4 | Efter lansering: kontrollera i Google Search Console om interna filer har indexerats (`site:taren.se inurl:docs` och liknande) och begär borttagning vid behov. | Sökresultat | — |
| M5 | Beslut: ska repot fortsätta vara **publikt**? Om inte: gör det privat (Cloudflare Pages fungerar med privata repon via GitHub-appen). Inget i repot är hemligt i dag, men alla dokument, inklusive dessa rapporter, är offentliga så länge repot är publikt. | GitHub | **Ditt beslut** |
| M6 | Efter en stabil vecka: städ-PR som tar bort `.agent/`, `.vs/` och de gamla mapparna från repo-roten (historiken finns kvar). | Repot | Ditt OK |

### 4.4 Hemligheter och åtkomst att granska manuellt (inga värden visas här)
- ☐ Pages `taren`: kontrollera att `ADMIN_API_TOKEN`, `ADMIN_EMAILS`, `ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, `ANALYTICS_ALLOWED_ORIGINS` och `ANALYTICS_INGEST` är lagrade som *Secret* där det är känsligt. F1 har **inte** exponerat värdena. Byt `ADMIN_API_TOKEN` om den någon gång har klistrats in i chatt, e-post eller ett ärende.
- ☐ Cloudflare Zero Trust → Access → Applications: admin-applikationens policy (vilka e-postadresser som släpps in, sessionslängd).
- ☐ My Profile → API Tokens: ta bort oanvända tokens, särskilt sådana med Pages-, Workers- eller D1-behörighet.
- ☐ Manage Account → Members: endast du, med 2FA.
- ☐ Worker `taren-analytics`: dess routes, egna secrets och vem som kan anropa den.
- ☐ GitHub: branch protection på `main` (kräv PR och grön CI), samt vilka repon Cloudflare-appen har åtkomst till.

---

## 5. Lanseringsförslag

### 5.1 GO / NO-GO-checklista
**Alla rader måste vara ✅ för GO.**

| # | Villkor | Status |
|---|---|---|
| 1 | Release-kandidaten (`f39692f`) är verifierad på förhandsversionen | ✅ |
| 2 | Du har granskat förhandsversionen i din mobil | ☐ |
| 3 | Juridiska texter godkända, eventuellt med ändringarna P1–P3, T2–T3, S4 och ST2 | ☐ |
| 4 | Beslut om kontaktväg (2.6) och copyright-rad (2.5) | ☐ |
| 5 | Ko-fi bekräftat som enbart dricks (S1) | ☐ |
| 6 | Cloudflare-kontrollerna A–E gjorda; inga cookie- eller skriptinjicerande funktioner påslagna | ☐ |
| 7 | Om texterna ändras: ny commit, alla tester gröna igen och ny förhandsgranskning | ☐ |
| 8 | Du har 30 minuter tillgängliga vid lanseringen, vid en lugn tid | ☐ |
| 9 | Pulse Garden synlig; Lumen Capture och PDF Studio opublicerade; inga nedladdningar | ✅ (enforcerat i koden och testat) |
| 10 | Rollback-punkten noterad (steg B9) | ☐ |

**NO-GO om:** något test fallerar, `X-Robots-Tag` dyker upp på taren.se, ett utkast syns, eller du är osäker på texterna.

### 5.2 Säkraste ordningen
1. Du fattar besluten i avsnitt 2 och gör kontrollerna A–E.
2. Jag gör de godkända textändringarna i en ny commit, kör hela testsviten och `verify:cloudflare`, och lägger ut den på förhandsversionen.
3. Du godkänner förhandsversionen i mobilen.
4. Jag öppnar PR:en mot `main`; CI blir grön.
5. Lansering (steg F23–F25) vid en lugn tid. Inställningarna ändras precis före merge.
6. Verifiering (steg G26–G31) direkt efteråt.
7. Dag 0: skicka in sitemap i Google Search Console och Bing.
8. Efter en stabil vecka: ta bort gamla secrets och bindningar, besluta om analysdatan och Workern, och gör städ-PR:en (M6).

### 5.3 Rollback
- **Direkt (cirka 1 minut):** `taren` → **Deployments** → deploymenten byggd från `7438a6a` → ⋯ → **Rollback to this deployment**. Den gamla sajten visas genast.
- **Permanent:** återställ byggkonfigurationen från skärmdumparna i steg B (Root directory tomt, Build command tomt, Output `/`, ta bort `NODE_VERSION`). Gör sedan revert av merge-commiten på `main` via PR, eller låt den ligga kvar.
- **Kontroll:** den gamla titeln visas på `/`, `/api/admin/overview` ger 401 och `/games/` ger 200.
- **Observera:** en rollback gör de interna filerna (F1) publika igen tills lanseringen görs om.
- **Enskild produkt:** `published: false`, och sidan försvinner vid nästa deploy.
- Inget raderas vid lanseringen, så det finns inget som behöver återskapas.

---

## 6. Rekommendation

**GO, villkorat.** Tekniskt är release-kandidaten redo och mer genomtestad än dagens produktion, och lanseringen
tar dessutom bort exponeringen av interna filer. Starta lanseringen först när rad 2–8 i 5.1 är ✅.

Minsta väg till GO:
1. Godkänn texterna. Ändra åtminstone kontaktvägen (2.6 A) och copyright-raden (2.5 B).
2. Bekräfta Ko-fi som enbart dricks.
3. Gör Cloudflare-kontrollerna A–E.
4. Godkänn förhandsversionen efter de ändringarna.

Om du vill lansera **utan** textändringar (texterna godkänns som de är och GitHub behålls som kontakt) är det
tekniskt möjligt direkt. Jag rekommenderar ändå att kontaktvägen åtgärdas först.
