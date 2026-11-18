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
  /** Public profile used as the contact route until a dedicated contact address is approved. */
  contactUrl: 'https://github.com/Jimmy7610',
  contactLabel: 'GitHub (@Jimmy7610)',
} as const;

/** The one and only Ko-fi URL. Every support link on the site reads it from here. */
export const KOFI_URL = 'https://ko-fi.com/taren' as const;

export interface NavItem {
  label: string;
  href: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'Products', href: '/products/' },
  { label: 'Studio', href: '/studio/' },
  { label: 'Support', href: '/support/' },
];

export const LEGAL_NAV: readonly NavItem[] = [
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Terms', href: '/terms/' },
];

/** Static, indexable routes (products are added from the collection). */
export const STATIC_ROUTES = ['/', '/products/', '/studio/', '/support/', '/privacy/', '/terms/'] as const;
