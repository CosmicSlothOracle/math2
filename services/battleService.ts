import { BattleRecord, BattleSummaryPayload } from '../types';
import { apiGet, apiPost } from '../src/lib/api';

export interface BattleCreatePayload {
  scenarioId: string;
  unitId: string;
  unitTitle: string;
  stake: number;
  rounds: number;
  taskIds: string[];
  taskBundle: any;
  metadata?: Record<string, any>;
  opponentId?: string | null;
}

function mapBattle(row: any): BattleRecord {
  if (!row) {
    throw new Error('BATTLE_ROW_MISSING');
  }
  return {
    id: row.id,
    scenarioId: row.scenario_id ?? null,
    challengerId: row.challenger_id,
    opponentId: row.opponent_id ?? null,
    unitId: row.unit_id,
    unitTitle: row.unit_title ?? null,
    stake: Number(row.stake ?? 0),
    roundCount: Number(row.round_count ?? 0),
    taskIds: Array.isArray(row.task_ids) ? row.task_ids : [],
    taskBundle: row.task_bundle || undefined,
    status: (row.status as BattleRecord['status']) ?? 'pending',
    metadata: row.metadata ?? null,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    finishedAt: row.finished_at,
    winnerId: row.winner_id ?? null,
    resultReason: row.result_reason ?? null,
    challengerScore: Number(row.challenger_score ?? 0),
    opponentScore: Number(row.opponent_score ?? 0),
    challengerTimeMs: Number(row.challenger_time_ms ?? 0),
    opponentTimeMs: Number(row.opponent_time_ms ?? 0),
    challengerSummary: row.challenger_summary ?? null,
    opponentSummary: row.opponent_summary ?? null,
  };
}

export const BattleService = {
  async list(view: 'mine' | 'open' = 'mine'): Promise<BattleRecord[]> {
    const data = await apiGet(`/.netlify/functions/battleList?view=${view}`);
    const rows = Array.isArray(data?.battles) ? data.battles : [];
    return rows.map(mapBattle);
  },

  async create(payload: BattleCreatePayload): Promise<{ battle: BattleRecord; coins?: number }> {
    const body = {
      scenarioId: payload.scenarioId,
      unitId: payload.unitId,
      unitTitle: payload.unitTitle,
      stake: payload.stake,
      roundCount: payload.rounds,
      taskIds: payload.taskIds,
      taskBundle: payload.taskBundle,
      metadata: payload.metadata,
      opponentId: payload.opponentId,
    };
    const data = await apiPost('/.netlify/functions/battleCreate', body);
    return {
      battle: mapBattle(data.battle),
      coins: data.coins,
    };
  },

  async accept(battleId: string): Promise<{ battle: BattleRecord; coins?: number }> {
    const data = await apiPost('/.netlify/functions/battleAccept', { battleId });
    return {
      battle: mapBattle(data.battle),
      coins: data.coins,
    };
  },

  async submit(battleId: string, submission: BattleSummaryPayload): Promise<any> {
    const data = await apiPost('/.netlify/functions/battleSubmit', { battleId, submission });
    return data;
  },
};


