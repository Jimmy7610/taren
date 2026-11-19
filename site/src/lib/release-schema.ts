import { z } from 'astro/zod';

/**
 * Release manifests: one JSON file per downloadable product in src/content/releases/<product-slug>.json.
 * The manifest is the single source of truth for everything the download section shows (version, date, files,
 * sizes, checksums). Workflow and rules: docs/WINDOWS_DOWNLOADS.md.
 *
 * States
 * - `preparing` : a beta is being built and tested. The page says so honestly; no file, size, checksum or link.
 * - `published` : owner-approved and live on downloads.taren.se. Only this state renders download buttons.
 * - `withdrawn` : was published, then pulled (broken or compromised). No buttons; an explanation instead.
 */

export const RELEASE_STATES = ['preparing', 'published', 'withdrawn'] as const;
export type ReleaseState = (typeof RELEASE_STATES)[number];

/** The only host public files may come from (Cloudflare R2 public bucket behind a custom domain). */
export const DOWNLOAD_ORIGIN = 'https://downloads.taren.se';

/** Products that can have Windows downloads: site slug → folder on the download host and file-name prefix. */
export const RELEASE_PRODUCTS = {
  'lumen-capture': { path: 'lumen-capture', filePrefix: 'LumenCapture-' },
  pdfstudio: { path: 'pdf-studio', filePrefix: 'PDFStudio-' },
} as const;
export type ReleaseProduct = keyof typeof RELEASE_PRODUCTS;

/** MAJOR.MINOR.PATCH with an optional -alpha.N / -beta.N / -rc.N (the apps' own version strings). */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/;
export const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const localizedList = z.object({
  en: z.array(z.string().min(1).max(240)).max(12),
  sv: z.array(z.string().min(1).max(240)).max(12),
});

const download = z.object({
  type: z.enum(['installer', 'portable']),
  fileName: z.string().regex(/^[A-Za-z0-9._-]+\.(exe|zip)$/, 'fileName: letters, digits, . _ - and .exe or .zip'),
  url: z.url(),
  sizeBytes: z.number().int().positive(),
  sha256: z.string().regex(SHA256_PATTERN, 'sha256 must be 64 lower-case hex digits'),
});
export type ReleaseDownload = z.infer<typeof download>;

export const releaseSchema = z
  .object({
    product: z.enum(Object.keys(RELEASE_PRODUCTS) as [ReleaseProduct, ...ReleaseProduct[]]),
    channel: z.enum(['beta']),
    state: z.enum(RELEASE_STATES),
    version: z.string().regex(VERSION_PATTERN, 'version must look like 1.2.3 or 1.2.3-beta.4'),
    platform: z.literal('windows'),
    architecture: z.literal('x64'),
    /** Lowest Windows version the installer accepts, as verified from the build (both languages). */
    minimumOs: z.object({ en: z.string().min(1).max(120), sv: z.string().min(1).max(120) }),
    /** Authenticode. `true` only with a verified signature — see docs/WINDOWS_DOWNLOADS.md. Never assumed. */
    signed: z.boolean(),
    signatureVerifiedOn: z.string().regex(DATE_PATTERN).optional(),
    /** Date the files went live on downloads.taren.se (YYYY-MM-DD). Required once published. */
    releaseDate: z.string().regex(DATE_PATTERN).optional(),
    /** The owner's explicit approval of exactly this version. Required once published. */
    approval: z.object({ approvedBy: z.string().min(1).max(80), approvedOn: z.string().regex(DATE_PATTERN) }).optional(),
    downloads: z.array(download).max(4).default([]),
    notes: localizedList,
    knownIssues: localizedList,
    /** Shown instead of downloads when state is `withdrawn` (both languages). */
    withdrawnReason: z.object({ en: z.string().min(1).max(240), sv: z.string().min(1).max(240) }).optional(),
  })
  .superRefine((r, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    const { path, filePrefix } = RELEASE_PRODUCTS[r.product];
    const folder = `${DOWNLOAD_ORIGIN}/${path}/${r.channel}/${r.version}/`;

    if (r.signed && !r.signatureVerifiedOn) issue('signatureVerifiedOn', 'signed: true needs the date the signature was verified');

    if (r.state === 'preparing') {
      // Nothing that looks like a real file may appear before approval: candidate builds are rebuilt by the
      // release pipeline, so their sizes and checksums would be wrong anyway.
      if (r.downloads.length > 0) issue('downloads', 'a release in preparation cannot list downloads');
      if (r.releaseDate) issue('releaseDate', 'a release in preparation has no release date');
      if (r.approval) issue('approval', 'approval belongs to a published release');
    }
    if (r.state === 'published') {
      if (!r.approval) issue('approval', 'a published release needs the owner approval {approvedBy, approvedOn}');
      if (!r.releaseDate) issue('releaseDate', 'a published release needs its release date');
      if (!r.downloads.some((d) => d.type === 'installer')) issue('downloads', 'a published release needs an installer');
      if (r.approval && r.releaseDate && r.approval.approvedOn > r.releaseDate)
        issue('approval', 'approval must be on or before the release date');
    }
    if (r.state === 'withdrawn' && !r.withdrawnReason) issue('withdrawnReason', 'a withdrawn release needs a reason');
    if (r.state !== 'withdrawn' && r.withdrawnReason) issue('withdrawnReason', 'only withdrawn releases have a reason');

    const names = new Set<string>();
    r.downloads.forEach((d, i) => {
      if (d.url !== folder + d.fileName) issue('downloads', `downloads[${i}].url must be ${folder}${d.fileName}`);
      if (!d.fileName.startsWith(filePrefix) || !d.fileName.includes(r.version))
        issue('downloads', `downloads[${i}].fileName must start with ${filePrefix} and contain ${r.version}`);
      if (names.has(d.fileName)) issue('downloads', `downloads[${i}] duplicates ${d.fileName}`);
      names.add(d.fileName);
    });
    if (r.downloads.filter((d) => d.type === 'installer').length > 1) issue('downloads', 'only one installer per release');
  });

export type Release = z.infer<typeof releaseSchema>;

/** Download buttons render only for an owner-approved, published release of a public product page. */
export function hasActiveDownloads(r: Pick<Release, 'state' | 'downloads' | 'approval'>, productPublished: boolean): boolean {
  return productPublished && r.state === 'published' && Boolean(r.approval) && r.downloads.length > 0;
}

/** "133.5 MB" / "133,5 MB" — decimal megabytes, the unit Windows Explorer and browsers show for downloads. */
export function formatSize(bytes: number, locale: 'en' | 'sv'): string {
  const mb = bytes / 1_000_000;
  const text = new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(mb);
  return `${text} MB`;
}

/** "19 November 2026" / "19 november 2026". */
export function formatReleaseDate(date: string, locale: 'en' | 'sv'): string {
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
