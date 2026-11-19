import type { UiKey } from '@/i18n/ui';

/**
 * Central site configuration. Change values here, not in components.
 */
export const SITE = {
  name: 'Taren',
  origin: 'https://taren.se',
  tagline: 'Software built with curiosity.',
  description:
    'Taren is an independent software studio in Sweden making thoughtful applications, original games and experiments in creative technology.',
  locale: 'en',
  ogLocale: 'en_GB',
  /** Default social sharing image, served from /public. 1200×630. */
  defaultOgImage: '/og/taren.png',
  defaultOgImageAlt: 'TAREN — Software built with curiosity.',
  /** The person behind the studio, as stated in the project README. Owner review: see docs/RELEASE_CHECKLIST.md. */
  founder: 'Jimmy Eliasson',
  country: 'Sweden',
  /**
   * Owner-approved contact address (2026-11-18) for general, support and privacy enquiries.
   * Rendered only through <ContactEmail /> as a plain mailto link.
   */
  contactEmail: 'Jbl_76@hotmail.com',
  /** Public code profile. Not a contact route. */
  githubUrl: 'https://github.com/Jimmy7610',
  githubLabel: 'GitHub (@Jimmy7610)',
  /**
   * Owner-approved copyright line: the rights holder is the person; "Taren" is the name the work is published under
   * (not a registered company). Fixed year as approved.
   */
  copyright: '© 2026 Jimmy Eliasson · Taren',
} as const;

/** The one and only Ko-fi URL. Every support link on the site reads it from here. */
export const KOFI_URL = 'https://ko-fi.com/taren' as const;

export interface NavItem {
  /** UI dictionary key of the label (src/i18n/ui.ts). */
  key: UiKey;
  /** Locale-neutral path; render with `localizePath(href, locale)`. */
  href: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { key: 'nav.products', href: '/products/' },
  { key: 'nav.studio', href: '/studio/' },
  { key: 'nav.support', href: '/support/' },
];

export const LEGAL_NAV: readonly NavItem[] = [
  { key: 'nav.privacy', href: '/privacy/' },
  { key: 'nav.terms', href: '/terms/' },
];

/** Static, indexable routes, locale-neutral (each exists in every locale; products are added from the collection). */
export const STATIC_ROUTES = ['/', '/products/', '/studio/', '/support/', '/privacy/', '/terms/'] as const;
