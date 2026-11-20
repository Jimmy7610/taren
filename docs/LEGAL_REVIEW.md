# Taren 2.3 — Legal, privacy and Ko-fi review

Date: 2026-11-18 · Branch `feature/taren-2.3-production-readiness` · Reviewer: engineering (not a lawyer).

> **Status: every legal text below requires the owner's approval before production.** This is a technical review of
> whether the website's wording matches what the website actually does. It is not legal advice. Points marked
> **OWNER** or **LEGAL** need a decision by the owner or a qualified adviser; nothing here was decided on their behalf.

Facts used: Taren is an independent creator project of Jimmy Eliasson in Sweden. No registered business,
organisation number, VAT number, physical address or legal entity is known, and none is stated or implied on the site.

## 1. Verified implementation facts (evidence)

| Claim on the site | Verified how | Result |
|---|---|---|
| No cookies | `Set-Cookie` on the preview and live taren.se responses; Playwright cookie jar after visiting all 7 public pages | ✅ 0 cookies |
| No local/session storage for tracking | Source search (`localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`): no use. Storage length after browsing: 0 | ✅ |
| No analytics, ads or third-party scripts/fonts | Every request while browsing all public pages goes to the site's own host only; no Cloudflare Web Analytics beacon in the HTML; CSP `default-src 'self'` would block one anyway | ✅ |
| No forms, accounts, comments | No `<form>` in the build; CSP `form-action 'none'` | ✅ |
| Ko-fi is a plain link, no embed | No Ko-fi script/iframe; CSP `frame-src 'none'` | ✅ |
| Hosted on Cloudflare | Response `server: cloudflare`, Pages project | ✅ |

**OWNER:** the new site never sets cookies itself, but Cloudflare *can* set its own (e.g. Bot Fight Mode `__cf_bm`) or
inject Web Analytics if those are switched on in the dashboard. Keep them off, or update the privacy page first.

## 2. Changes made to the texts in this branch (all need owner approval)

| Page | Before | After | Why |
|---|---|---|---|
| `/support/` | "One-time support is the default." | removed; "You choose whether to contribute and how much." | How the Ko-fi page is configured (one-time vs monthly) is not verifiable from the repository. |
| `/support/`, `/privacy/` | silent on what Ko-fi passes on | "Ko-fi may share details you give it, such as your name, message and email address, with Taren … used only to acknowledge and keep a record … not sold or shared." | A supporter's details can reach the creator through Ko-fi. Hedged ("may") because the exact data set depends on Ko-fi's settings. **OWNER: confirm what Ko-fi shows you, and that you do not use it otherwise.** |
| `/terms/` | "…design of this website belong to Taren." | "…are the work of Jimmy Eliasson, published under the name Taren. The fonts Inter and Sora are used under the SIL Open Font License." | Taren is not a legal entity, so it cannot own rights; the fonts are third-party (OFL). |
| `/studio/` | "Automated tests are part of every project" | "Automated tests are written wherever they are practical, and each product page says how its current build has been verified." | Lumen Capture has no automated test suite (`WINDOWS_APPS_AUDIT.md`), so "every project" was not true. |

No wording about analytics, cookies or telemetry needed to change: all such claims were verified as true (§1).

## 2b. Owner decisions applied (2026-11-18, branch `feature/taren-2.3-launch-copy`)

Owner decisions: contact email **Jbl_76@hotmail.com**; copyright **"© 2026 Jimmy Eliasson · Taren"**; repository stays
public; Pulse Garden is the only listed product; Lumen Capture and PDF Studio stay unpublished without downloads.

| Page | Change | Basis |
|---|---|---|
| Footer (all pages) | "© 2026 Taren. All rights reserved." → **"© 2026 Jimmy Eliasson · Taren"** (fixed year as approved) | Owner decision L2; names the person, no company implied |
| `/privacy/` | Contact: GitHub → "For questions about privacy or this website, email Jbl_76@hotmail.com." | Owner decision L1 |
| `/privacy/` | New section **"If you email Taren"**: "If you send an email, your address and message are used to read and answer it. They are kept in that mailbox, which is provided by Microsoft's Outlook.com service." | Factual: the site now invites email; hotmail.com is an Outlook.com mailbox. **Owner: confirm you use emails only to reply.** |
| `/privacy/` | Your rights: "…there is usually nothing held about you unless you have emailed Taren or contributed through Ko-fi. To ask, email Jbl_76@hotmail.com." | Factual consequence of the email + Ko-fi |
| `/terms/` | Liability: "Taren is not liable" → "Jimmy Eliasson (Taren) is not liable" | Factual: Taren is a name, not a legal person. **Owner approval required (legal wording).** |
| `/terms/` | Contact: GitHub → "Questions are welcome by email: Jbl_76@hotmail.com." | L1 |
| `/studio/` | Get in touch: "Email Jbl_76@hotmail.com for anything about Taren or its products." + separate line "Public code is on GitHub (@Jimmy7610)." | L1; GitHub kept as code profile, not as contact |
| `/support/` | New section **"Questions"**: "Questions about supporting Taren are welcome by email: Jbl_76@hotmail.com." | L1 |

The address is rendered as a plain `mailto:` link whose visible text is the address (accessible name), no new tab.
No other personal data was added.

**Deliberately not added** (not assessed — would be invented): a GDPR legal basis for Cloudflare's processing, any data
retention period (email, Ko-fi), a governing-law clause, a registered business, organisation/VAT number or address.
These stay open below (L3, L4, L13).

## 3. Points that need owner or legal review

| # | Topic | Finding | Recommendation | Owner |
|---|---|---|---|---|
| L1 ✅ | **Contact / GDPR controller details** (resolved: Jbl_76@hotmail.com, 2026-11-18) | Privacy and terms name Jimmy Eliasson and give GitHub as the only contact. A GDPR privacy notice must give the controller's contact details; a public GitHub profile is not a private channel for data requests. | Add a dedicated contact email (e.g. on taren.se) to `SITE` in `src/config/site.ts`; it then appears on privacy, terms and studio. | OWNER |
| L2 ✅ | **Footer** (resolved: "© 2026 Jimmy Eliasson · Taren") | Taren is a name, not an entity. Common practice, but inconsistent with the corrected terms. | Consider "© 2026 Jimmy Eliasson (Taren)". Not changed: it is a visible brand decision. | OWNER |
| L3 | **Cloudflare as processor** | Request data (IP, user agent) is processed by Cloudflare. Cloudflare's customer DPA is part of its self-serve terms. | Confirm the account's terms/DPA cover this; keep logs/analytics features off unless the privacy page is updated. | OWNER |
| L4 | **Ko-fi data** | See §2. If you export or store supporter data elsewhere, the privacy page must say so (purpose, retention). | Decide retention (e.g. as long as bookkeeping requires). | OWNER |
| L5 | **Taxes on Ko-fi income** | Contributions to a private individual in Sweden may be taxable (Skatteverket decides whether it is income from employment-like activity or business). Not stated on the site. | Ask Skatteverket or an accountant; keep Ko-fi/PayPal/Stripe statements. If the activity is a business, registration (F-skatt, possibly VAT) may follow. | OWNER/LEGAL |
| L6 | **Ko-fi eligibility / payouts** | Not verifiable from here: account verification, payout method (PayPal/Stripe), Ko-fi's fee plan and its terms for Sweden. | Check in the Ko-fi dashboard; the site does not depend on these settings. | OWNER |
| L7 ✅ | **Ko-fi shop, memberships, commissions** (owner-confirmed 2026-11-18: voluntary donations only, no shop or memberships; no donations received yet — confirmed by the owner, not inspected by engineering) | The site describes contributions as tips that buy nothing. If shop items, memberships with perks or commissions are enabled on Ko-fi, those are sales. | Either keep Ko-fi to tips only, or update `/support/` and review consumer law (L9) first. | OWNER |
| L8 | **App licences / EULAs** | No product has a licence or terms yet. PDF Studio: licence "not decided" (its own release checklist). Lumen Capture vendors whisper.cpp (MIT) and RNNoise (BSD), which require their notices to ship with the app. | Gate 2 (`PUBLICATION_WORKFLOW.md`) requires a licence and third-party notices before any download. | OWNER/LEGAL |
| L9 | **Selling software later** | Selling to consumers in the EU brings distance-selling information duties, a 14-day withdrawal right for digital content unless the buyer expressly waives it before delivery, conformity/update obligations (EU Digital Content Directive 2019/770 as implemented in Sweden), VAT on digital services (EU VAT OSS), and possibly the European Accessibility Act for e-commerce (microenterprises have exemptions). | Do not add prices or paid downloads until these are settled; using a store (Microsoft Store, App Store) shifts much of this to the store. | LEGAL |
| L10 | **App Store privacy URL** | Apple requires a privacy policy URL for Pulse Garden. The website privacy page covers the website only. | Add a product-specific privacy section before App Store submission (Pulse Garden: offline, no accounts — per its brief). | OWNER |
| L11 | **Names and trademarks** | "Taren", "Pulse Garden", "Lumen Capture" and "PDF Studio" are not stated as registered trademarks, and the site makes no such claim. "PDF Studio" is a generic name (its own checklist lists the final name as open). | Run a name search before release; do not add ™/® without a basis. | OWNER |
| L13 | **Legal basis, retention, governing law** | The privacy page states what happens to data but no GDPR legal basis or retention periods (email, Ko-fi); the terms have no governing-law clause. Not assessed, so not written. | Decide with a qualified adviser if wanted; the texts are accurate without them but not legally reviewed. | LEGAL |
| L14 | **Public email address** | The address is now in the HTML of 4 pages as plain text (spam harvesting possible). Cloudflare's *Email Address Obfuscation* would rewrite it and inject a script. | Keep *Email Address Obfuscation* **off** (the site's CSP and privacy statement assume no injected scripts); use your mail provider's spam filtering. | OWNER |
| L12 | **Legacy analytics data** | The legacy site's analytics (`/api/event`, D1 `taren-analytics`) collected page/game events. The new site removes the endpoint, but data in D1 remains. | Decide retention/deletion of the D1 data at cutover (`PRODUCTION_CUTOVER_PLAN.md` §7). The old site's privacy statement (if any) governed that collection. | OWNER |

## 4. Ko-fi review (Phase 4)

Every Ko-fi link was audited in the production and draft builds (static scan of `dist/` + Playwright):

| Check | Result |
|---|---|
| URL | ✅ exactly `https://ko-fi.com/taren` everywhere; one source of truth (`KOFI_URL` in `src/config/site.ts`) |
| Locations | `/support/` (button + inline link in the text), support panel on Home and the Pulse Garden page, `/privacy/` (inline), footer and mobile menu on every page |
| Security | ✅ `target="_blank" rel="noopener noreferrer"` on every instance (no `window.opener`, no referrer) |
| Accessibility | ✅ visible ↗ arrow plus screen-reader text "(opens in a new tab)"; buttons 52 px, menu 48 px, footer 44 px tall (measured); inline text links are exempt from WCAG 2.5.8; e2e `support.spec.ts` |
| Mobile | ✅ footer and mobile-menu links tested at 320–932 px (no overflow, targets ≥ 24 px) |
| Wording | ✅ "optional", "never required", "does not buy a product, a service, a licence or priority", no guilt, no countdowns, no popups |
| Payment data | ✅ the site collects nothing; Ko-fi and its providers handle payment; stated on `/support/` |
| External service identified | ✅ "Payments are handled entirely by Ko-fi and its payment providers … Ko-fi's own terms and privacy policy apply" |
| Embeds | ✅ none (no widget, no script, no iframe) |
| Fix made | Mobile-menu Ko-fi link was missing the `data-kofi-link` marker the other links use (consistency for tests) |

**Not verified by anyone yet** (the site makes none of these claims): tips-only mode, payouts, eligibility, tax.

**Owner must inspect manually in the Ko-fi dashboard (logged in) and on https://ko-fi.com/taren (logged out):**
1. Public page: name, avatar and text show Taren correctly; the URL is exactly `ko-fi.com/taren`.
2. *Shop*, *Memberships* and *Commissions* are switched **off** (otherwise contributions buy something and `/support/` must change — L7).
3. *Payments*: which payout method is connected (PayPal/Stripe) and that it is verified and active (L6).
4. *Supporters* view: which details you actually receive (name, message, email) — must match the privacy/support text (L4).
5. Whether supporter emails are exported anywhere else (would need a privacy-page update).
6. Tax: ask Skatteverket or an accountant how voluntary tips to you are treated (L5). Keep Ko-fi/PayPal/Stripe statements.

## 5. Final review before the production PR (2026-11-18)

Owner facts used (stated by the owner, not independently verified): public contact Jimmy Eliasson,
Jbl_76@hotmail.com; the address is used for correspondence; copyright "© 2026 Jimmy Eliasson · Taren"; Ko-fi takes
voluntary donations only, with no shop or memberships, and no donations have been received yet.

**These texts are not legally certified.** This is an engineering check of accuracy and completeness against the
implementation and the owner's facts.

### 5.1 Result per topic

| Topic | Current text says | Assessment | Action |
|---|---|---|---|
| **Controller and contact (GDPR Art. 13(1)(a))** | Run by Jimmy Eliasson; email Jbl_76@hotmail.com for privacy questions | ✅ Identity and contact given | — |
| **Purposes** | Email: "used to read and answer it"; Ko-fi details: "only to acknowledge and keep a record"; Cloudflare data: delivery and abuse protection | ✅ Matches the owner's stated use (correspondence) | — |
| **Legal basis (Art. 13(1)(c))** | Not stated | ⚠️ **Gap.** Art. 13 asks for the legal basis of each processing. Not written because it has not been assessed. | **LEGAL/OWNER** — L13 |
| **Retention (Art. 13(2)(a))** | Not stated (email, Ko-fi records) | ⚠️ **Gap.** A period *or the criteria* for it is expected. Not invented. | **OWNER** — decide e.g. criteria for deleting old correspondence; bookkeeping rules may set a minimum for donation records. L13 |
| **Recipients / processors** | Cloudflare (hosting), Microsoft Outlook.com (mailbox), Ko-fi and its payment providers | ✅ Named | — |
| **Transfers outside the EU/EEA (Art. 13(1)(f))** | Not stated | ⚠️ **Gap.** Cloudflare, Microsoft and Ko-fi may process data outside the EEA; where and on what safeguard was not verified. | **LEGAL** — add once confirmed from each provider's terms |
| **Data-subject rights and complaint** | Access, correction, deletion "including"; complaint to IMY | ✅ Complaint right present. Listing *all* rights (restriction, objection, portability) would be more complete. | Optional wording improvement — **LEGAL** |
| **Cookies / analytics / third-party scripts** | None | ✅ Verified (0 cookies, 0 storage, single host). Depends on Cloudflare features staying off (L14, §1). | Cloudflare checklist |
| **Ko-fi supporter information** | "Ko-fi may share details … name, message and email … with Taren" | ✅ Hedged correctly; no donations yet, so nothing is held. Accurate for donations-only. | Owner: re-check once the first donation arrives (L4) |
| **Ko-fi as voluntary** | "voluntary tip … does not buy a product, a service, a licence or priority" | ✅ Consistent with donations only (owner-confirmed) | — |
| **Payments** | "handled entirely by Ko-fi and its payment providers. Taren never sees or stores your card or bank details." | ✅ Plain link, no embed; card data never reaches the site | — |
| **Liability disclaimer** | "To the extent the law allows, Jimmy Eliasson (Taren) is not liable for losses arising from use of the website." + consumer-law saving clause | ✅ Qualified ("to the extent the law allows") and names the person. Whether it is effective in a given case is a legal question; it does not claim to override mandatory law. | LEGAL (optional) |
| **Mandatory consumer rights** | "Nothing in these terms limits rights you have under consumer law that cannot be limited." | ✅ Present. Nothing is sold, so no distance-selling information is needed today (L9 applies if that changes). | — |
| **"By using the site, you agree to these terms"** | Browse-wrap acceptance | ℹ️ Common, but its effect against consumers is limited. Harmless for an information site. | LEGAL (optional) |
| **Governing law** | Not stated | ℹ️ Not required for a free information site; not invented. | LEGAL (optional) — L13 |
| **Third-party statements** | Cloudflare privacy policy link; Microsoft Outlook.com provides the mailbox; fonts under SIL OFL; Ko-fi's own terms apply | ✅ All factual (hotmail.com is an Outlook.com mailbox; Inter and Sora are OFL) | — |
| **Studio facts** | One-person studio, real name, Godot for games, Astro for the site, tests "wherever practical" | ✅ Accurate | — |
| **No company implied** | Footer names the person; no business, org. no., VAT or address anywhere | ✅ e2e test forbids company/registration wording on every page | — |

### 5.2 Unresolved legal concerns (for the owner and, if wanted, an adviser)
1. **Art. 13 completeness:** legal basis, retention criteria and third-country transfers are not stated (L13).
   The texts are *accurate*, but not *complete* by the letter of Art. 13. The risk is low for a small information site
   that collects no data itself, but it is a known gap.
2. **Retention of correspondence and donation records:** owner decision (bookkeeping law may require keeping
   donation records; deletion criteria for ordinary email are up to the owner).
3. **Tax treatment of donations** (L5) and **Ko-fi payout setup** (L6): not verified; no donations yet.
4. **Public email address:** spam exposure accepted by the owner; Email Address Obfuscation must stay off (L14).

No change was made to the site texts in this step: every open point needs a decision that has not been taken.

## 6. Approval

| Text | Approved by owner | Date |
|---|---|---|
| `/privacy/` (incl. 2b changes) | ☐ | |
| `/terms/` | ☐ | |
| `/support/` | ☐ | |
| `/studio/` | ☐ | |

## 7. Windows apps before the public beta (2026-11-20)

Branch `docs/privacy-downloads-beta2`, with lumen-capture `fix/license-bundle-beta2` and PDFStudio
`fix/license-texts-beta2`. Engineering review, not legal advice; every text below needs the owner's approval.

| # | Topic | Status | Where |
|---|---|---|---|
| L8 | App licences / EULAs | **Proposal written**: bilingual beta licence `LICENSE.txt` in both apps (free use to try the beta, no resale or redistribution, as-is, consumer-law saving clause). Full third-party licence texts now ship in the installer **and** the portable package of both apps; the builds fail if one is missing. | `docs/legal/` in each app repo |
| L15 | Product privacy information | **Proposal written**: `PRIVACY.txt` in each app, every statement traced to the code (`docs/legal/README.md`). PDF Studio: signature validation no longer downloads certificates (it could before, via Windows AIA retrieval). | `docs/legal/` in each app repo |
| L16 | Downloads and in-app updates on `/privacy/` | **Proposal written** (this branch): new section *Downloads and app updates* and a product summary replacing "products will have their own privacy information". It deliberately makes no claim about download statistics: **OWNER**, confirm whether R2/Cloudflare analytics or logs are enabled for downloads.taren.se. | `site/src/views/copy/{en,sv}/Privacy.astro` |
| L11 | Product names | **PDF Studio: medium–high risk** (Qoppa/Apryse *PDF Studio*, sold since the 2000s; US filing 85114421 abandoned, no EU/SE registration, but long prior use). **Lumen Capture: low–medium** (no *Lumen Capture* marks; many *LUMEN* class 9 marks). | PDFStudio `docs/NAME_TRADEMARK_RISK.md` |

| Text | Approved by owner | Date |
|---|---|---|
| Lumen Capture `LICENSE.txt` / `PRIVACY.txt` | ☐ | |
| PDF Studio `LICENSE.txt` / `PRIVACY.txt` | ☐ | |
| `/privacy/` section *Downloads and app updates* + *Products* | ☐ | |
