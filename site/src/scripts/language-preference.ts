/**
 * Remembers the visitor's language choice — privacy-first: one localStorage key, no cookie, nothing sent anywhere.
 *
 * - Choosing EN/SV in the switcher stores that choice ("taren-lang").
 * - On later visits, a page in the other language is replaced (location.replace, so Back is not trapped) with the
 *   same page in the chosen language.
 * - First visit without a choice: if the browser's preferred language is Swedish, the Swedish twin is shown. Nothing
 *   is stored by this; the first explicit click wins from then on.
 * - Without JavaScript nothing happens: every page is a normal, complete page and the switcher is a plain link.
 * - Error pages (data-lang-redirect="off") never redirect.
 * Crawlers fetch each URL as-is (no stored choice, and hreflang tells them about the twins), so this is SEO-safe.
 */
const KEY = 'taren-lang';
const SUPPORTED = ['en', 'sv'];

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // storage disabled: behave like a first visit
  }
}
function write(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage disabled: the switch still works as a link */
  }
}

for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]')) {
  link.addEventListener('click', () => write(link.dataset.langSwitch ?? ''));
}

const page = document.documentElement.lang;
const allowed = document.documentElement.dataset.langRedirect !== 'off';
const stored = read();
const browserSv = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase().startsWith('sv');
const wanted = stored && SUPPORTED.includes(stored) ? stored : browserSv ? 'sv' : null;

if (allowed && wanted && wanted !== page) {
  const twin = document.querySelector<HTMLAnchorElement>(`[data-lang-switch="${wanted}"]`);
  if (twin && twin.href !== location.href) location.replace(twin.href + location.hash);
}
