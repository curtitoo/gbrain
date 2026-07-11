/**
 * curtis-v2 collision matrix (A2, STRATEGY-SPEC amendments 2026-07-11).
 *
 * Type assignment is first-DECLARED-wins over unanchored segment matching, so
 * pack declaration ORDER is load-bearing. This test:
 *   1. asserts curated expectations (top-level lanes, nested-collision
 *      resolutions, wiki-yard exploit, note drawers, segment-boundary traps),
 *   2. regenerates the full prefix×prefix matrix and diffs it against the
 *      committed skills/gbrain-curtis-v2.collision-matrix.md — reordering the
 *      pack without regenerating the matrix fails here.
 *
 * Regenerate: REGEN_MATRIX=1 bun test test/curtis-v2-collision-matrix.test.ts
 */
import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { inferTypeFromPack, inferTypeAndSubtypeFromPack } from '../src/core/markdown';
import { loadPackFromFile } from '../src/core/schema-pack/loader';

const PACK_PATH = join(import.meta.dir, '..', 'skills', 'gbrain-curtis-v2.pack.yaml');
const MATRIX_PATH = join(import.meta.dir, '..', 'skills', 'gbrain-curtis-v2.collision-matrix.md');
const pack = loadPackFromFile(PACK_PATH);

const t = (path: string) => inferTypeFromPack(path, pack);
const ts = (path: string) => {
  const r = inferTypeAndSubtypeFromPack(path, pack);
  return `${r.type}${r.subtype ? ':' + r.subtype : ''}`;
};

describe('pack shape', () => {
  test('declares exactly 26 types', () => {
    expect(pack.page_types.length).toBe(26);
  });
  test('no wiki/ prefix anywhere in the pack', () => {
    for (const pt of pack.page_types) {
      for (const p of pt.path_prefixes) expect(p.startsWith('wiki/')).toBe(false);
    }
  });
  test('exactly 3 frontmatter-only types (code, image, synthesis)', () => {
    const bare = pack.page_types.filter((p) => p.path_prefixes.length === 0).map((p) => p.name).sort();
    expect(bare).toEqual(['code', 'image', 'synthesis']);
  });
  test('ordering hard constraint: writing before idea (wiki/originals/ideas/*)', () => {
    const names = pack.page_types.map((p) => p.name);
    expect(names.indexOf('writing')).toBeLessThan(names.indexOf('idea'));
  });
  test('note is the LAST path-mapped type', () => {
    const mapped = pack.page_types.filter((p) => p.path_prefixes.length > 0).map((p) => p.name);
    expect(mapped[mapped.length - 1]).toBe('note');
  });
});

describe('top-level lanes type to themselves', () => {
  const lanes: Array<[string, string]> = [
    ['dream-cycle-summaries/2026-07-11', 'dream-summary'],
    ['projects/hermes-config', 'project'],
    ['concepts/compounding', 'concept'],
    ['personal/health-log', 'personal'],
    ['tech/aleph', 'tech'],
    ['writing/essay-draft', 'writing'],
    ['originals/enhanced-games-thesis', 'writing'],
    ['people/garry-tan', 'person'],
    ['companies/anthropic', 'company'],
    ['products/claude-code', 'company'],
    ['orgs/yc', 'company'],
    ['meetings/2026-07-11-pitch', 'meeting'],
    ['calendar/2026-07-11', 'calendar-event'],
    ['deals/seed-x', 'deal'],
    ['emails/thread-abc', 'email'],
    ['slack/ch-general', 'slack'],
    ['tweets/naval-123', 'tweet'],
    ['twitter/naval-123', 'tweet'],
    ['digests/social/2026-07-11', 'social-digest'],
    ['media/some-doc', 'media'],
    ['videos/talk', 'media'],
    ['articles/piece', 'media'],
    ['essays/pg-essay', 'media'],
    ['books/high-growth', 'media'],
    ['podcasts/ep-1', 'media'],
    ['blog/post-1', 'media'],
    ['posts/post-2', 'media'],
    ['sources/guest-export', 'source'],
    ['conversations/chatgpt/thread', 'source'],
    ['voice-notes/2026-07-11-idea', 'source'],
    ['analysis/market-map', 'analysis'],
    ['theses/ai-agents', 'thesis'],
    ['ideas/micro-pe', 'idea'],
    ['decisions/gbrain-decision-home', 'decision'],
    ['atoms/some-atom', 'atom'],
    ['notes/random', 'note'],
    ['inbox/triage-me', 'note'],
    ['archive/old-thing', 'note'],
    ['prompts/system-x', 'note'],
    ['programs/fitness', 'note'],
    ['org/structure', 'note'],
    ['hiring/pipeline', 'note'],
    ['household/maintenance', 'note'],
    ['finance/budget', 'note'],
  ];
  for (const [path, expected] of lanes) {
    test(`${path} → ${expected}`, () => expect(t(path)).toBe(expected));
  }
});

describe('nested collisions resolve to the OUTER container lane', () => {
  // The three verified-bad paths from the A2 audit, now fixed by order:
  test('projects/analysis/x → project (was analysis under base-v2)', () =>
    expect(t('projects/analysis/x')).toBe('project'));
  test('concepts/people/x → concept (was person under base-v2)', () =>
    expect(t('concepts/people/x')).toBe('concept'));
  test('projects/videos/x → project (was media under base-v2)', () =>
    expect(t('projects/videos/x')).toBe('project'));
  // Drawer words nested under real lanes never demote to note:
  test('projects/archive/x → project', () => expect(t('projects/archive/x')).toBe('project'));
  test('emails/inbox/x → email', () => expect(t('emails/inbox/x')).toBe('email'));
  test('people/org/x → person', () => expect(t('people/org/x')).toBe('person'));
  test('companies/hiring/x → company', () => expect(t('companies/hiring/x')).toBe('company'));
});

describe('wiki/ machine yard types via unanchored matching (no wiki/ in pack)', () => {
  test('wiki/people/garry-tan → person', () => expect(t('wiki/people/garry-tan')).toBe('person'));
  test('wiki/personal/reflections/2026-07-11-x → personal', () =>
    expect(t('wiki/personal/reflections/2026-07-11-x')).toBe('personal'));
  test('wiki/personal/patterns/theme → personal', () =>
    expect(t('wiki/personal/patterns/theme')).toBe('personal'));
  test('wiki/originals/frame-x → writing', () => expect(t('wiki/originals/frame-x')).toBe('writing'));
  test('wiki/originals/ideas/2026-07-11-y → writing (writing-before-idea constraint)', () =>
    expect(t('wiki/originals/ideas/2026-07-11-y')).toBe('writing'));
  test('wiki/concepts/glossary → concept', () => expect(t('wiki/concepts/glossary')).toBe('concept'));
});

describe('segment-boundary safety (leading-slash needle)', () => {
  test('somedir/gbrain-analysis/x → concept (no /analysis/ segment)', () =>
    expect(t('somedir/gbrain-analysis/x')).toBe('concept'));
  test('voice-notes/x → source, NOT note (/notes/ not a substring match)', () =>
    expect(t('voice-notes/x')).toBe('source'));
  test('org/x → note but orgs/x → company (distinct segments)', () => {
    expect(t('org/x')).toBe('note');
    expect(t('orgs/x')).toBe('company');
  });
});

describe('defaults and unreachable lanes', () => {
  test('undeclared path → concept (engine default)', () =>
    expect(t('random-dir/whatever')).toBe('concept'));
  test('scratch/ is fenced out (undeclared → concept)', () =>
    expect(t('scratch/e2e-marker')).toBe('concept'));
  test('retired prefixes fall to concept: research/, agent/, correspondence/, cal/, daily/, ops/, civic/, guides/', () => {
    for (const p of ['research/x', 'agent/x', 'correspondence/x', 'cal/x', 'daily/x', 'ops/x', 'civic/x', 'guides/x']) {
      expect(t(p)).toBe('concept');
    }
  });
  test('code/image/synthesis unreachable by path (frontmatter-only)', () => {
    expect(t('code/foo')).toBe('concept');
  });
});

describe('subtype stamps', () => {
  test('orgs/yc → company:org', () => expect(ts('orgs/yc')).toBe('company:org'));
  test('conversations/claude/x → source:conversation', () =>
    expect(ts('conversations/claude/x')).toBe('source:conversation'));
  test('voice-notes/x → source:voice-note', () => expect(ts('voice-notes/x')).toBe('source:voice-note'));
  test('originals/x → writing:original', () => expect(ts('originals/x')).toBe('writing:original'));
  test('inbox/x → note:inbox', () => expect(ts('inbox/x')).toBe('note:inbox'));
  test('videos/talk → media:video', () => expect(ts('videos/talk')).toBe('media:video'));
});

describe('committed collision matrix is current', () => {
  test('skills/gbrain-curtis-v2.collision-matrix.md matches regenerated matrix', async () => {
    const generated = generateMatrix();
    if (process.env.REGEN_MATRIX === '1') await Bun.write(MATRIX_PATH, generated);
    const committed = await Bun.file(MATRIX_PATH).text();
    expect(committed.trim()).toBe(generated.trim());
  });
});

export function generateMatrix(): string {
  const prefixes: Array<{ prefix: string; type: string }> = [];
  for (const pt of pack.page_types) {
    for (const p of pt.path_prefixes) prefixes.push({ prefix: p, type: pt.name });
  }
  const lines: string[] = [];
  lines.push('# gbrain-curtis-v2 collision matrix (GENERATED — do not hand-edit)');
  lines.push('');
  lines.push('Regenerated by test/curtis-v2-collision-matrix.test.ts. Cell = type assigned to');
  lines.push('the path `<row-prefix><col-prefix>x` (row prefix outer, column prefix nested).');
  lines.push('First-DECLARED type wins; `·` marks cells where the OUTER (row) lane wins —');
  lines.push('deviations are the collisions to know about.');
  lines.push('');
  lines.push('| outer \\ nested | ' + prefixes.map((p) => p.prefix).join(' | ') + ' |');
  lines.push('|---' + '|---'.repeat(prefixes.length) + '|');
  for (const row of prefixes) {
    const cells = prefixes.map((col) => {
      if (col.prefix === row.prefix) return '—';
      const winner = inferTypeFromPack(row.prefix + col.prefix + 'x', pack);
      return winner === row.type ? '·' : `**${winner}**`;
    });
    lines.push(`| ${row.prefix} (${row.type}) | ` + cells.join(' | ') + ' |');
  }
  lines.push('');
  return lines.join('\n');
}
