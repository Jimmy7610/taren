import { describe, expect, it } from 'vitest';
import { DRAFTS_BRANCH, draftsEnabled, isVisible } from '@/lib/drafts';

describe('draft preview mode', () => {
  it('is off by default and for the production and 2.x preview branches', () => {
    expect(draftsEnabled({})).toBe(false);
    for (const b of ['main', 'feature/taren-2.0', 'preview/drafts-x', 'Preview/Drafts']) expect(draftsEnabled({ CF_PAGES_BRANCH: b }), b).toBe(false);
    expect(draftsEnabled({ TAREN_SHOW_DRAFTS: 'true' })).toBe(false);
  });
  it('turns on only with TAREN_SHOW_DRAFTS=1 or the dedicated branch', () => {
    expect(draftsEnabled({ TAREN_SHOW_DRAFTS: '1' })).toBe(true);
    expect(draftsEnabled({ CF_PAGES_BRANCH: DRAFTS_BRANCH })).toBe(true);
  });
  it('shows unpublished products only in draft mode', () => {
    expect(isVisible({ published: false }, false)).toBe(false);
    expect(isVisible({ published: false }, true)).toBe(true);
    expect(isVisible({ published: true }, false)).toBe(true);
  });
});
