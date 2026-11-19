/**
 * Shared, visitor-facing UI strings for every locale.
 *
 * `en` is the source of truth. Every other dictionary is typed as `UiDictionary`, so a missing or misspelled
 * key is a TypeScript error (`npm run typecheck`, CI) — a page can never silently fall back to English.
 * Placeholders use {name} and are filled by `t(key, { name })`. Product and brand names (Taren, Lumen Capture,
 * PDF Studio, Pulse Garden, Ko-fi) are never translated. Guidelines: docs/LOCALIZATION.md.
 */
const en = {
  // Site
  'site.tagline': 'Software built with curiosity.',
  'site.description':
    'Taren is an independent software studio in Sweden making thoughtful applications, original games and experiments in creative technology.',
  'site.ogImageAlt': 'TAREN — Software built with curiosity.',
  'site.studioIn': 'An independent software studio in Sweden.',
  'site.madeIn': 'Made in Sweden.',
  'site.country': 'Sweden',

  // Navigation and chrome
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.studio': 'Studio',
  'nav.support': 'Support',
  'nav.privacy': 'Privacy',
  'nav.terms': 'Terms',
  'nav.primary': 'Primary',
  'nav.footer': 'Footer',
  'nav.mobile': 'Mobile',
  'nav.menu': 'Menu',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.skip': 'Skip to content',
  'nav.homeLabel': 'Taren — home',
  'nav.featured': 'Featured',
  'nav.breadcrumb': 'Breadcrumb',
  'footer.explore': 'Explore',
  'footer.legal': 'Legal & support',
  'lang.label': 'Language',
  'lang.current': 'current language',

  // Common
  'common.newTab': '(opens in a new tab)',
  'kofi.cta': 'Support on Ko-fi',

  // Product status and categories
  'status.prefix': 'Status: ',
  'status.released': 'Released',
  'status.beta': 'Beta',
  'status.in-development': 'In development',
  'status.coming-soon': 'Coming soon',
  'category.App': 'App',
  'category.Game': 'Game',
  'category.Tool': 'Tool',
  'category.Experiment': 'Experiment',

  // Product cards, showcase and teaser
  'card.category': 'Category: ',
  'card.platforms': 'Platforms: ',
  'card.view': 'View product',
  'card.draft': 'Draft',
  'showcase.explore': 'Explore {name}',
  'showcase.screenshots': 'Screenshots',
  'showcase.glance': '{name} at a glance',
  'media.placeholder': '{name} — artwork coming later',

  // Product page
  'product.status': 'Status',
  'product.platforms': 'Platforms',
  'product.download': 'Download',
  'product.website': 'Visit website',
  'product.seeScreenshots': 'See screenshots',
  'product.source': 'Source on GitHub',
  'product.draftStrong': 'Draft preview',
  'product.draftText':
    '— this product page is not published. It is hidden from navigation, search engines and the sitemap until approved.',
  'product.about': 'About {name}',
  'product.stepsDefault': '{name} in {count} steps',
  'product.highlightsEyebrow': 'Highlights',
  'product.highlightsTitle': 'What makes it work',
  'product.screenshotsEyebrow': 'Screenshots',
  'product.screenshotsTitle': 'From the current build',
  'product.screenshotsDefault': 'Real captures of {name} as it is today.',
  'product.screenshotsSuffix': 'Details will change before release.',
  'product.progressEyebrow': 'Progress',
  'product.progressTitle': 'Where it stands',
  'product.progressIntro': 'An honest view of what is finished, what is being worked on and what comes next.',
  'product.beforeRelease': 'Before a public release',
  'product.requirementsEyebrow': 'Requirements',
  'product.requirementsTitle': 'What {name} needs',
  'product.requirementsIntro': 'Verified with the current development build. Final requirements may change before release.',
  'product.related': 'Related products',
  'timeline.done': 'Done',
  'timeline.in-progress': 'In progress',
  'timeline.next': 'Next',
  'timeline.planned': 'Planned',
  'timeline.source': 'Source: {source}.',
  'attribution.eyebrow': 'A Taren App',
  'attribution.title': 'Made by Taren',
  'attribution.text':
    '{name} keeps its own name and icon. Its About screen credits the studio behind it — the official Taren symbol, “A Taren App” and a link to taren.se.',
  'attribution.more': 'More about the studio:',

  // Screenshot gallery (also used by its script through data attributes)
  'gallery.label': '{name} screenshots',
  'gallery.count': '{total} screenshots',
  'gallery.range': '{from}–{to} of {total}',
  'gallery.single': '{from} of {total}',
  'gallery.hintTouch': 'Swipe sideways or select one to enlarge.',
  'gallery.hintFine': 'Use the arrows, scroll sideways or select one to enlarge.',
  'gallery.prev': 'Previous screenshots',
  'gallery.next': 'Next screenshots',
  'gallery.open': ' — open larger view',
  'gallery.viewer': '{label} viewer',
  'gallery.close': 'Close viewer',
  'gallery.prevShot': 'Previous screenshot',
  'gallery.nextShot': 'Next screenshot',

  // Support call-to-action (shared panel)
  'supportCta.eyebrow': 'Optional support',
  'supportCta.title': 'Enjoying what we’re building?',
  'supportCta.text':
    'Taren projects are created independently. If you enjoy the work, you can support future development with a small, optional contribution.',
  'supportCta.learnMore': 'How support works',

  // Error pages
  'error.home': 'Back to home',
  'error.products': 'See products',
  'error.404.title': 'Page not found',
  'error.404.heading': 'This page doesn’t exist.',
  'error.404.message':
    'The link may be mistyped, or the page may have moved. Everything Taren is working on can be found from the home page.',
  'error.404.description': 'The page you were looking for does not exist on taren.se.',
  'error.410.title': 'Page retired',
  'error.410.heading': 'This page has been retired.',
  'error.410.message':
    'The small browser games and experiments that used to live here have been permanently removed as Taren became a product studio. Thanks for playing.',
  'error.410.description': 'This page has been permanently removed from taren.se.',

  // Text pages
  'textPage.updated': 'Last updated:',

  // Home
  'home.eyebrowLead': 'Independent ',
  'home.eyebrowRest': 'software studio',
  'home.titleLead': 'Software built with',
  'home.titleAccent': 'curiosity.',
  'home.lead':
    'Taren makes thoughtful applications, original games and experiments in creative technology — designed with care and released when they are ready.',
  'home.explore': 'Explore products',
  'home.aboutStudio': 'About the studio',
  'home.whatEyebrow': 'What Taren makes',
  'home.whatTitle': 'Few things, made carefully.',
  'home.appsTitle': 'Applications',
  'home.appsText': 'Focused tools that do one job well and respect your time and attention.',
  'home.gamesTitle': 'Original games',
  'home.gamesText': 'Games built around a single clear idea, explored until it becomes deep.',
  'home.expTitle': 'Experiments',
  'home.expText': 'Creative technology tried out in the open, kept only when it earns its place.',
  'home.workEyebrow': 'Selected work',
  'home.workTitle': 'In the studio now',
  'home.allProducts': 'All products',
  'home.studioEyebrow': 'The studio',
  'home.studioTitle': 'Independent, on purpose.',
  'home.studioText':
    'Taren is a one-person software studio in Sweden. It started as a small lab for browser games and experiments, and has grown into a home for finished, separately branded products.',
  'home.studioCta': 'Read about the studio',
  'home.p1Title': 'Curiosity first',
  'home.p1Text': 'Every project starts with a question worth exploring, not a feature list.',
  'home.p2Title': 'Made with care',
  'home.p2Text': 'Fast, accessible and calm to use. No dark patterns, no manipulative design.',
  'home.p3Title': 'Honest status',
  'home.p3Text': 'Products are labelled for exactly what they are. Nothing is called released until you can get it.',

  // Products catalogue
  'products.title': 'Products',
  'products.description':
    'Applications, games and experiments from Taren, an independent software studio in Sweden. Each product has its own page and an honest status.',
  'products.eyebrow': 'Products',
  'products.heading': 'Selected work',
  'products.intro':
    'Every product has its own page with an honest status. Released means you can get it today; in development means it is real, being built, and not finished yet.',
  'products.listLabel': 'Product list',
  'products.more': 'More products',
  'products.workshop': 'More projects are in the workshop. They will appear here when there is something real to show — not before.',
  'products.empty': 'The first products will appear here when they are ready to show.',
} as const;

export type UiKey = keyof typeof en;
export type UiDictionary = { readonly [K in UiKey]: string };

const sv: UiDictionary = {
  'site.tagline': 'Mjukvara byggd med nyfikenhet.',
  'site.description':
    'Taren är en oberoende mjukvarustudio i Sverige som gör genomtänkta applikationer, egna spel och experiment inom kreativ teknik.',
  'site.ogImageAlt': 'TAREN — Mjukvara byggd med nyfikenhet.',
  'site.studioIn': 'En oberoende mjukvarustudio i Sverige.',
  'site.madeIn': 'Gjort i Sverige.',
  'site.country': 'Sverige',

  'nav.home': 'Hem',
  'nav.products': 'Produkter',
  'nav.studio': 'Studion',
  'nav.support': 'Stöd',
  'nav.privacy': 'Integritet',
  'nav.terms': 'Villkor',
  'nav.primary': 'Huvudmeny',
  'nav.footer': 'Sidfot',
  'nav.mobile': 'Mobilmeny',
  'nav.menu': 'Meny',
  'nav.openMenu': 'Öppna menyn',
  'nav.closeMenu': 'Stäng menyn',
  'nav.skip': 'Hoppa till innehållet',
  'nav.homeLabel': 'Taren — startsidan',
  'nav.featured': 'Utvald',
  'nav.breadcrumb': 'Brödsmulor',
  'footer.explore': 'Utforska',
  'footer.legal': 'Juridik och stöd',
  'lang.label': 'Språk',
  'lang.current': 'valt språk',

  'common.newTab': '(öppnas i en ny flik)',
  'kofi.cta': 'Stöd på Ko-fi',

  'status.prefix': 'Status: ',
  'status.released': 'Släppt',
  'status.beta': 'Beta',
  'status.in-development': 'Under utveckling',
  'status.coming-soon': 'Kommer snart',
  'category.App': 'App',
  'category.Game': 'Spel',
  'category.Tool': 'Verktyg',
  'category.Experiment': 'Experiment',

  'card.category': 'Kategori: ',
  'card.platforms': 'Plattformar: ',
  'card.view': 'Visa produkten',
  'card.draft': 'Utkast',
  'showcase.explore': 'Utforska {name}',
  'showcase.screenshots': 'Skärmbilder',
  'showcase.glance': '{name} i korthet',
  'media.placeholder': '{name} — bild kommer senare',

  'product.status': 'Status',
  'product.platforms': 'Plattformar',
  'product.download': 'Ladda ned',
  'product.website': 'Besök webbplatsen',
  'product.seeScreenshots': 'Se skärmbilder',
  'product.source': 'Källkod på GitHub',
  'product.draftStrong': 'Förhandsvisning av utkast',
  'product.draftText':
    '— den här produktsidan är inte publicerad. Den är dold för navigering, sökmotorer och webbplatskartan tills den har godkänts.',
  'product.about': 'Om {name}',
  'product.stepsDefault': '{name} i {count} steg',
  'product.highlightsEyebrow': 'Höjdpunkter',
  'product.highlightsTitle': 'Det som gör skillnaden',
  'product.screenshotsEyebrow': 'Skärmbilder',
  'product.screenshotsTitle': 'Från den aktuella versionen',
  'product.screenshotsDefault': 'Riktiga skärmbilder av {name} som det ser ut i dag.',
  'product.screenshotsSuffix': 'Detaljer kan ändras före lansering.',
  'product.progressEyebrow': 'Framsteg',
  'product.progressTitle': 'Läget just nu',
  'product.progressIntro': 'En ärlig bild av vad som är klart, vad som pågår och vad som kommer härnäst.',
  'product.beforeRelease': 'Före en offentlig lansering',
  'product.requirementsEyebrow': 'Systemkrav',
  'product.requirementsTitle': 'Det här behöver {name}',
  'product.requirementsIntro':
    'Kontrollerat med den aktuella utvecklingsversionen. De slutliga kraven kan ändras före lansering.',
  'product.related': 'Relaterade produkter',
  'timeline.done': 'Klart',
  'timeline.in-progress': 'Pågår',
  'timeline.next': 'Härnäst',
  'timeline.planned': 'Planerat',
  'timeline.source': 'Källa: {source}.',
  'attribution.eyebrow': 'En Taren-app',
  'attribution.title': 'Skapad av Taren',
  'attribution.text':
    '{name} behåller sitt eget namn och sin egen ikon. I appens Om-ruta syns studion bakom den — den officiella Taren-symbolen, ”En Taren-app” och en länk till taren.se.',
  'attribution.more': 'Mer om studion:',

  'gallery.label': 'Skärmbilder av {name}',
  'gallery.count': '{total} skärmbilder',
  'gallery.range': '{from}–{to} av {total}',
  'gallery.single': '{from} av {total}',
  'gallery.hintTouch': 'Svep i sidled eller välj en bild för att förstora den.',
  'gallery.hintFine': 'Använd pilarna, scrolla i sidled eller välj en bild för att förstora den.',
  'gallery.prev': 'Föregående skärmbilder',
  'gallery.next': 'Nästa skärmbilder',
  'gallery.open': ' — öppna i större format',
  'gallery.viewer': 'Bildvisning: {label}',
  'gallery.close': 'Stäng bildvisningen',
  'gallery.prevShot': 'Föregående skärmbild',
  'gallery.nextShot': 'Nästa skärmbild',

  'supportCta.eyebrow': 'Frivilligt stöd',
  'supportCta.title': 'Gillar du det vi bygger?',
  'supportCta.text':
    'Tarens projekt skapas helt självständigt. Om du uppskattar arbetet kan du stödja den fortsatta utvecklingen med ett litet, frivilligt bidrag.',
  'supportCta.learnMore': 'Så fungerar stödet',

  'error.home': 'Till startsidan',
  'error.products': 'Se produkterna',
  'error.404.title': 'Sidan hittades inte',
  'error.404.heading': 'Den här sidan finns inte.',
  'error.404.message':
    'Länken kan vara felskriven, eller så har sidan flyttats. Allt Taren arbetar med hittar du via startsidan.',
  'error.404.description': 'Sidan som du letade efter finns inte på webbplatsen taren.se.',
  'error.410.title': 'Sidan har tagits bort',
  'error.410.heading': 'Den här sidan har tagits bort.',
  'error.410.message':
    'De små webbläsarspel och experiment som fanns här har tagits bort för gott när Taren blev en produktstudio. Tack för att du spelade.',
  'error.410.description': 'Den här sidan har tagits bort permanent från taren.se.',

  'textPage.updated': 'Senast uppdaterad:',

  'home.eyebrowLead': 'Oberoende ',
  'home.eyebrowRest': 'mjukvarustudio',
  'home.titleLead': 'Mjukvara byggd med',
  'home.titleAccent': 'nyfikenhet.',
  'home.lead':
    'Taren gör genomtänkta applikationer, egna spel och experiment inom kreativ teknik — utformade med omsorg och släppta när de är redo.',
  'home.explore': 'Utforska produkterna',
  'home.aboutStudio': 'Om studion',
  'home.whatEyebrow': 'Det här gör Taren',
  'home.whatTitle': 'Få saker, gjorda med omsorg.',
  'home.appsTitle': 'Applikationer',
  'home.appsText': 'Fokuserade verktyg som gör en sak bra och respekterar din tid och uppmärksamhet.',
  'home.gamesTitle': 'Egna spel',
  'home.gamesText': 'Spel byggda kring en enda tydlig idé, utforskad tills den får djup.',
  'home.expTitle': 'Experiment',
  'home.expText': 'Kreativ teknik som prövas öppet och bara behålls när den förtjänar sin plats.',
  'home.workEyebrow': 'Utvalda projekt',
  'home.workTitle': 'I studion just nu',
  'home.allProducts': 'Alla produkter',
  'home.studioEyebrow': 'Studion',
  'home.studioTitle': 'Oberoende, med avsikt.',
  'home.studioText':
    'Taren är en mjukvarustudio med en enda utvecklare, i Sverige. Den började som ett litet labb för webbläsarspel och experiment och har vuxit till ett hem för färdiga produkter med egna varumärken.',
  'home.studioCta': 'Läs om studion',
  'home.p1Title': 'Nyfikenhet först',
  'home.p1Text': 'Varje projekt börjar med en fråga som är värd att utforska, inte med en funktionslista.',
  'home.p2Title': 'Gjort med omsorg',
  'home.p2Text': 'Snabbt, tillgängligt och lugnt att använda. Inga mörka mönster, ingen manipulativ design.',
  'home.p3Title': 'Ärlig status',
  'home.p3Text': 'Produkterna märks för exakt vad de är. Inget kallas släppt förrän du faktiskt kan skaffa det.',

  'products.title': 'Produkter',
  'products.description':
    'Applikationer, spel och experiment från Taren, en oberoende mjukvarustudio i Sverige. Varje produkt har en egen sida och en ärlig status.',
  'products.eyebrow': 'Produkter',
  'products.heading': 'Utvalda projekt',
  'products.intro':
    'Varje produkt har en egen sida med en ärlig status. Släppt betyder att du kan skaffa den i dag; under utveckling betyder att den är verklig, håller på att byggas och inte är klar än.',
  'products.listLabel': 'Produktlista',
  'products.more': 'Fler produkter',
  'products.workshop':
    'Fler projekt finns i verkstaden. De dyker upp här när det finns något verkligt att visa — inte förr.',
  'products.empty': 'De första produkterna visas här när de är redo att visas.',
};

export const UI: Record<'en' | 'sv', UiDictionary> = { en, sv };
