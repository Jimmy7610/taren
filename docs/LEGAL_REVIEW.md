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
| L7 | **Ko-fi shop, memberships, commissions** | The site describes contributions as tips that buy nothing. If shop items, memberships with perks or commissions are enabled on Ko-fi, those are sales. | Either keep Ko-fi to tips only, or update `/support/` and review consumer law (L9) first. | OWNER |
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

## 5. Approval

| Text | Approved by owner | Date |
|---|---|---|
| `/privacy/` (incl. 2b changes) | ☐ | |
| `/terms/` | ☐ | |
| `/support/` | ☐ | |
| `/studio/` | ☐ | |
