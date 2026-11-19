import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import {
  DOWNLOAD_ORIGIN,
  formatReleaseDate,
  formatSize,
  hasActiveDownloads,
  RELEASE_PRODUCTS,
  releaseSchema,
} from '@/lib/release-schema';

const dir = resolve(__dirname, '../../src/content/releases');
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
const read = (f: string) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, unknown>;
const productFrontmatter = (slug: string) => {
  const src = readFileSync(resolve(__dirname, '../../src/content/products', `${slug}.md`), 'utf8');
  return parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(src)?.[1] ?? '') as Record<string, unknown>;
};
const issues = (data: unknown) => {
  const r = releaseSchema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

const sha = 'a'.repeat(64);
const list = { en: ['Note'], sv: ['Notering'] };
const base = {
  product: 'pdfstudio',
  channel: 'beta',
  state: 'preparing',
  version: '0.9.0-beta.1',
  platform: 'windows',
  architecture: 'x64',
  minimumOs: { en: 'Windows 10 2004+', sv: 'Windows 10 2004+' },
  signed: false,
  downloads: [],
  notes: list,
  knownIssues: list,
};
const folder = `${DOWNLOAD_ORIGIN}/pdf-studio/beta/0.9.0-beta.1/`;
const installer = {
  type: 'installer',
  fileName: 'PDFStudio-Setup-0.9.0-beta.1-x64.exe',
  url: `${folder}PDFStudio-Setup-0.9.0-beta.1-x64.exe`,
  sizeBytes: 140021101,
  sha256: sha,
};
const published = {
  ...base,
  state: 'published',
  releaseDate: '2026-12-01',
  approval: { approvedBy: 'Jimmy Eliasson', approvedOn: '2026-12-01' },
  downloads: [installer],
};

describe('release manifest schema', () => {
  it('accepts an honest release in preparation and an owner-approved published release', () => {
    expect(issues(base)).toEqual([]);
    expect(issues(published)).toEqual([]);
  });

  it('a release in preparation cannot carry files, dates or approval (no fictional data before release)', () => {
    expect(issues({ ...base, downloads: [installer] }).join()).toMatch(/cannot list downloads/);
    expect(issues({ ...base, releaseDate: '2026-12-01' }).join()).toMatch(/no release date/);
    expect(issues({ ...base, approval: published.approval }).join()).toMatch(/approval/);
  });

  it('a published release needs approval, a release date and an installer', () => {
    expect(issues({ ...published, approval: undefined }).join()).toMatch(/owner approval/);
    expect(issues({ ...published, releaseDate: undefined }).join()).toMatch(/release date/);
    expect(issues({ ...published, downloads: [] }).join()).toMatch(/needs an installer/);
    expect(issues({ ...published, approval: { approvedBy: 'Jimmy Eliasson', approvedOn: '2026-12-02' } }).join()).toMatch(/on or before/);
  });

  it('rejects missing or malformed download data', () => {
    expect(issues({ ...published, downloads: [{ ...installer, sha256: undefined }] })).not.toEqual([]);
    expect(issues({ ...published, downloads: [{ ...installer, sha256: 'A'.repeat(64) }] }).join()).toMatch(/sha256/);
    expect(issues({ ...published, downloads: [{ ...installer, sha256: 'abc' }] }).join()).toMatch(/sha256/);
    expect(issues({ ...published, downloads: [{ ...installer, url: undefined }] })).not.toEqual([]);
    expect(issues({ ...published, downloads: [{ ...installer, sizeBytes: 0 }] })).not.toEqual([]);
    expect(issues({ ...published, downloads: [{ ...installer, fileName: 'setup.msi' }] })).not.toEqual([]);
  });

  it('only accepts files on downloads.taren.se in the product, channel and version folder', () => {
    const at = (url: string) => issues({ ...published, downloads: [{ ...installer, url }] }).join();
    expect(at(`https://github.com/Jimmy7610/PDFStudio/releases/download/v0.9.0/${installer.fileName}`)).toMatch(/url must be/);
    expect(at(`http://downloads.taren.se/pdf-studio/beta/0.9.0-beta.1/${installer.fileName}`)).toMatch(/url must be/);
    expect(at(`${DOWNLOAD_ORIGIN}/lumen-capture/beta/0.9.0-beta.1/${installer.fileName}`)).toMatch(/url must be/);
    expect(at(`${DOWNLOAD_ORIGIN}/pdf-studio/beta/0.8.0/${installer.fileName}`)).toMatch(/url must be/);
    expect(at(`${folder}PDFStudio-Setup-0.9.0-beta.2-x64.exe`)).toMatch(/url must be/);
  });

  it('file names must belong to the product and the version', () => {
    const wrong = { ...installer, fileName: 'LumenCapture-0.9.0-beta.1-Setup.exe', url: `${folder}LumenCapture-0.9.0-beta.1-Setup.exe` };
    expect(issues({ ...published, downloads: [wrong] }).join()).toMatch(/must start with PDFStudio-/);
    const old = { ...installer, fileName: 'PDFStudio-Setup-0.8.0-x64.exe', url: `${folder}PDFStudio-Setup-0.8.0-x64.exe` };
    expect(issues({ ...published, downloads: [old] }).join()).toMatch(/contain 0.9.0-beta.1/);
  });

  it('rejects duplicate files and a second installer', () => {
    expect(issues({ ...published, downloads: [installer, installer] }).join()).toMatch(/duplicates|only one installer/);
  });

  it('never assumes code signing', () => {
    expect(issues({ ...base, signed: true }).join()).toMatch(/signatureVerifiedOn/);
    expect(issues({ ...base, signed: true, signatureVerifiedOn: '2026-12-01' })).toEqual([]);
  });

  it('validates versions and needs both languages', () => {
    for (const v of ['0.9', 'v0.9.0', '0.9.0-preview', '0.9.0-beta']) expect(issues({ ...base, version: v }).join(), v).toMatch(/version/);
    expect(issues({ ...base, notes: { en: ['x'] } })).not.toEqual([]);
    expect(issues({ ...base, minimumOs: { en: 'Windows 11' } })).not.toEqual([]);
  });

  it('a withdrawn release explains why; others cannot carry a reason', () => {
    const reason = { en: 'Broken installer', sv: 'Trasigt installationsprogram' };
    expect(issues({ ...published, state: 'withdrawn' }).join()).toMatch(/needs a reason/);
    expect(issues({ ...published, state: 'withdrawn', withdrawnReason: reason })).toEqual([]);
    expect(issues({ ...base, withdrawnReason: reason }).join()).toMatch(/only withdrawn/);
  });
});

describe('download buttons (hasActiveDownloads)', () => {
  const parsed = releaseSchema.parse(published);
  it('are active only for a published, approved release on a public product page', () => {
    expect(hasActiveDownloads(parsed, true)).toBe(true);
    expect(hasActiveDownloads(parsed, false)).toBe(false);
    expect(hasActiveDownloads({ ...parsed, state: 'preparing' }, true)).toBe(false);
    expect(hasActiveDownloads({ ...parsed, state: 'withdrawn' }, true)).toBe(false);
    expect(hasActiveDownloads({ ...parsed, approval: undefined }, true)).toBe(false);
  });
});

describe('release manifests in src/content/releases', () => {
  it('exist for both Windows apps and nothing else', () => {
    expect(files.sort()).toEqual(Object.keys(RELEASE_PRODUCTS).map((p) => `${p}.json`).sort());
  });

  for (const file of files) {
    const data = read(file);
    const slug = file.replace(/\.json$/, '');
    describe(file, () => {
      it('passes the schema and names its own product', () => {
        expect(issues(data)).toEqual([]);
        expect(data.product).toBe(slug);
      });
      it('matches its product page (no separate downloadUrl; published only with a beta/released public page)', () => {
        const p = productFrontmatter(slug);
        expect(p.downloadUrl).toBeUndefined();
        if (data.state === 'published') {
          expect(p.published).toBe(true);
          expect(['beta', 'released']).toContain(p.status);
        }
      });
    });
  }

  it('no download is live until the owner approves the first public beta (approval gate)', () => {
    // Remove this test in the same change that publishes the first beta (docs/WINDOWS_DOWNLOADS.md, step 6).
    for (const file of files) {
      const data = read(file);
      expect(data.state, file).toBe('preparing');
      expect(data.downloads, file).toEqual([]);
    }
  });
});

describe('formatting', () => {
  it('shows sizes in decimal megabytes in both languages', () => {
    expect(formatSize(140021101, 'en')).toBe('140.0 MB');
    expect(formatSize(102384145, 'sv')).toBe('102,4 MB');
  });
  it('formats release dates without time-zone drift', () => {
    expect(formatReleaseDate('2026-12-01', 'en')).toBe('1 December 2026');
    expect(formatReleaseDate('2026-12-01', 'sv')).toBe('1 december 2026');
  });
});

describe('scripts/import-release.mjs (published feed → manifest)', async () => {
  const { manifestFromFeed } = await import('../../scripts/import-release.mjs');
  const lumen = read('lumen-capture.json');
  const pdf = read('pdfstudio.json');
  const v = '2.9.0-beta.2';
  const lumenBase = `${DOWNLOAD_ORIGIN}/lumen-capture/beta/${v}`;
  // Shape written by lumen-capture/.github/workflows/release.yml (also read by the in-app updater).
  const lumenFeed = {
    tag_name: `v${v}`,
    channel: 'beta',
    published_at: '2026-12-01T10:00:00Z',
    assets: [
      { name: `LumenCapture-${v}-Setup.exe`, browser_download_url: `${lumenBase}/LumenCapture-${v}-Setup.exe`, sha256: sha, size: 5_000_000 },
      { name: `LumenCapture-${v}-portable.zip`, browser_download_url: `${lumenBase}/LumenCapture-${v}-portable.zip`, sha256: 'b'.repeat(64), size: 6_000_000 },
    ],
  };
  const opts = { approvedOn: '2026-12-01' };

  it('builds a valid published manifest from the Lumen updater feed and keeps the notes', () => {
    const m = manifestFromFeed(`${lumenBase}/feed.json`, lumenFeed, lumen, opts);
    expect(issues(m)).toEqual([]);
    expect(m.state).toBe('published');
    expect(m.releaseDate).toBe('2026-12-01');
    expect(m.downloads.map((d: { type: string }) => d.type)).toEqual(['installer', 'portable']);
    expect(m.notes).toEqual(lumen.notes);
  });

  it('builds a valid published manifest from the PDF Studio feed', () => {
    const base = `${DOWNLOAD_ORIGIN}/pdf-studio/beta/0.9.0-beta.1`;
    const feed = { product: 'pdf-studio', version: '0.9.0-beta.1', releaseDate: '2026-12-01', downloads: [{ ...installer, url: `${base}/${installer.fileName}` }] };
    const m = manifestFromFeed(`${base}/feed.json`, feed, pdf, opts);
    expect(issues(m)).toEqual([]);
  });

  it('refuses feeds from other hosts, mismatched versions, other products and missing approval', () => {
    expect(() => manifestFromFeed(`https://example.com/lumen-capture/beta/${v}/feed.json`, lumenFeed, lumen, opts)).toThrow(/feed URL/);
    expect(() => manifestFromFeed(`${DOWNLOAD_ORIGIN}/lumen-capture/beta/2.9.0-beta.2/feed.json`, lumenFeed, lumen, opts)).toThrow(/does not match/);
    expect(() => manifestFromFeed(`${lumenBase}/feed.json`, lumenFeed, pdf, opts)).toThrow(/not "lumen-capture"/);
    expect(() => manifestFromFeed(`${lumenBase}/feed.json`, lumenFeed, lumen, {})).toThrow(/approved-on/);
  });
});
