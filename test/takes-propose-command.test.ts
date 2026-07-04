import { describe, test, expect } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  acceptTakeProposal,
  listTakeProposals,
  rejectTakeProposal,
} from '../src/commands/takes.ts';
import type { BrainEngine } from '../src/core/engine.ts';

interface CapturedSql {
  sql: string;
  params: unknown[];
}

const pendingProposal = {
  id: 42,
  source_id: 'sidecar-source',
  page_slug: 'people/alice',
  proposed_at: '2026-07-03T00:00:00.000Z',
  proposal_run_id: 'propose-test-run',
  status: 'pending' as const,
  claim_text: 'Alice will ship the consumer this week',
  kind: 'bet',
  holder: 'brain',
  weight: 0.7,
  domain: 'delivery',
  model_id: 'claude-sonnet-4-6',
  acted_at: null,
  acted_by: null,
  promoted_row_num: null,
  predicted_brier: null,
  predicted_brier_bucket_n: null,
};

function buildEngine(): { engine: BrainEngine; captured: CapturedSql[]; addedRows: unknown[] } {
  const captured: CapturedSql[] = [];
  const addedRows: unknown[] = [];
  const engine = {
    kind: 'postgres',
    async executeRaw<T>(sql: string, params?: unknown[]): Promise<T[]> {
      captured.push({ sql, params: params ?? [] });
      if (sql.includes('FROM take_proposals') && sql.includes('WHERE id = $1')) {
        return [pendingProposal as unknown as T];
      }
      if (sql.includes('FROM take_proposals') && sql.includes('WHERE status = $1')) {
        return [pendingProposal as unknown as T];
      }
      if (sql.includes('SELECT id FROM pages')) {
        return [{ id: 7 } as unknown as T];
      }
      if (sql.includes("SET status = 'accepted'")) {
        return [{ id: 42 } as unknown as T];
      }
      if (sql.includes("SET status = 'rejected'")) {
        return [{ ...pendingProposal, status: 'rejected', acted_by: params?.[1] } as unknown as T];
      }
      return [];
    },
    async addTakesBatch(rows: unknown[]) {
      addedRows.push(...rows);
      return rows.length;
    },
  } as unknown as BrainEngine;
  return { engine, captured, addedRows };
}

describe('takes propose consumer helpers', () => {
  test('listTakeProposals filters by status and source without mutating proposals', async () => {
    const { engine, captured } = buildEngine();

    const rows = await listTakeProposals(engine, { status: 'pending', sourceId: 'sidecar-source', limit: 25 });

    expect(rows).toHaveLength(1);
    expect(captured[0]!.sql).toContain('WHERE status = $1 AND source_id = $2');
    expect(captured[0]!.sql).not.toContain('UPDATE');
    expect(captured[0]!.params).toEqual(['pending', 'sidecar-source', 25]);
  });

  test('acceptTakeProposal appends to the page fence, mirrors to takes, and marks accepted', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'gbrain-takes-propose-'));
    try {
      mkdirSync(join(tmp, 'people'), { recursive: true });
      const pagePath = join(tmp, 'people/alice.md');
      const { engine, captured, addedRows } = buildEngine();

      const result = await acceptTakeProposal(engine, 42, { brainDir: tmp, actor: 'tester' });

      expect(result.rowNum).toBe(1);
      const body = readFileSync(pagePath, 'utf8');
      expect(body).toContain('<!--- gbrain:takes:begin -->');
      expect(body).toContain('Alice will ship the consumer this week');
      expect(body).toContain('take_proposal:42 domain:delivery run:propose-test-run');
      expect(addedRows).toHaveLength(1);
      expect(addedRows[0]).toMatchObject({
        page_id: 7,
        row_num: 1,
        claim: pendingProposal.claim_text,
        kind: pendingProposal.kind,
        holder: pendingProposal.holder,
        weight: pendingProposal.weight,
        active: true,
        superseded_by: null,
      });
      const acceptUpdate = captured.find(c => c.sql.includes("SET status = 'accepted'"));
      expect(acceptUpdate?.params).toEqual([42, 'tester', 1]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('rejectTakeProposal marks rejected and never deletes audit history', async () => {
    const { engine, captured } = buildEngine();

    const row = await rejectTakeProposal(engine, 42, { actor: 'tester', reason: 'duplicate' });

    expect(row.status).toBe('rejected');
    const rejectUpdate = captured.find(c => c.sql.includes("SET status = 'rejected'"));
    expect(rejectUpdate?.sql).toContain('UPDATE take_proposals');
    expect(rejectUpdate?.sql).not.toContain('DELETE');
    expect(rejectUpdate?.params).toEqual([42, 'tester reason:duplicate']);
  });
});
