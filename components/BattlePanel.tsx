import React from 'react';
import { BattleRecord, BattleScenario, User } from '../types';
import { GlassCard, CardTitle, Button, Badge } from '../ui-components';

type Props = {
  user: User;
  scenarios: BattleScenario[];
  openBattles: BattleRecord[];
  myBattles: BattleRecord[];
  isLoading: boolean;
  onCreateBattle: (scenario: BattleScenario) => Promise<void> | void;
  onAcceptBattle: (battle: BattleRecord) => Promise<void> | void;
  onLaunchBattle: (battle: BattleRecord) => void;
  onRefresh: () => void;
};

const statusBadge = (battle: BattleRecord) => {
  switch (battle.status) {
    case 'pending':
      return <Badge color="amber">Wartet</Badge>;
    case 'running':
      return <Badge color="indigo">Aktiv</Badge>;
    case 'finished':
      return <Badge color="emerald">Fertig</Badge>;
    default:
      return null;
  }
};

const BattlePanel: React.FC<Props> = ({
  user,
  scenarios,
  openBattles,
  myBattles,
  isLoading,
  onCreateBattle,
  onAcceptBattle,
  onLaunchBattle,
  onRefresh,
}) => {
  const hasSubmitted = (battle: BattleRecord) => {
    if (user.id === battle.challengerId) {
      return Boolean(battle.challengerSummary);
    }
    if (user.id === battle.opponentId) {
      return Boolean(battle.opponentSummary);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
          ⚔️ Math Battles
          <span className="text-xs font-black text-slate-400 uppercase">Beta</span>
        </h3>
        <Button size="sm" variant="secondary" onClick={onRefresh} isLoading={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenarios.map(scenario => (
          <GlassCard key={scenario.id} className="!p-6 flex flex-col justify-between bg-white/80 border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{scenario.icon}</span>
              <Badge color="indigo">{scenario.difficulty}</Badge>
            </div>
            <CardTitle className="mb-1">{scenario.title}</CardTitle>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{scenario.tagline}</p>
            <p className="text-sm text-slate-500 mb-4">{scenario.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {scenario.modifiers.map(mod => (
                <span key={mod} className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                  {mod}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 mb-4">
              <span>Stake: {scenario.stake} 💰</span>
              <span>Runden: {scenario.rounds}</span>
            </div>
            <Button onClick={() => onCreateBattle(scenario)} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'Battle hosten'}
            </Button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="!p-6 bg-white/90 border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="!text-base">Offene Battles</CardTitle>
            <Badge color="slate">{openBattles.length}</Badge>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {openBattles.length === 0 && (
              <p className="text-xs font-black uppercase text-slate-300 text-center py-6">Keine offenen Battles – hoste eins!</p>
            )}
            {openBattles.map(battle => (
              <div key={battle.id} className="border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 bg-white">
                <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
                  <span>{battle.unitTitle || battle.unitId}</span>
                  {statusBadge(battle)}
                </div>
                <div className="text-sm font-black text-slate-700">
                  {battle.metadata?.challengerName || `User ${battle.challengerId.slice(0, 5)}`} sucht Gegner
                </div>
                <div className="text-[11px] uppercase text-slate-400 font-black">
                  Einsatz: {battle.stake} Coins · {battle.roundCount} Runden
                </div>
                <Button
                  size="sm"
                  onClick={() => onAcceptBattle(battle)}
                  disabled={isLoading || battle.challengerId === user.id}
                >
                  Annehmen
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="!p-6 bg-white/90 border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="!text-base">Deine Battles</CardTitle>
            <Badge color="slate">{myBattles.length}</Badge>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {myBattles.length === 0 && (
              <p className="text-xs font-black uppercase text-slate-300 text-center py-6">Noch keine Battles – starte eins!</p>
            )}
            {myBattles.map(battle => {
              const canPlay = battle.status !== 'finished' && battle.opponentId && !hasSubmitted(battle);
              const youWon = battle.winnerId && battle.winnerId === user.id;
              const tie = battle.status === 'finished' && !battle.winnerId;
              return (
                <div key={battle.id} className="border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 bg-white">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
                    <span>{battle.unitTitle || battle.unitId}</span>
                    {statusBadge(battle)}
                  </div>
                  <div className="text-sm font-black text-slate-700">
                    VS {battle.opponentId === user.id ? battle.challengerId.slice(0, 5) : (battle.metadata?.opponentName || battle.opponentId?.slice(0, 5) || '??')}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase text-slate-400">
                    <span>Stake: {battle.stake}</span>
                    <span>Runden: {battle.roundCount}</span>
                  </div>
                  {battle.status === 'finished' && (
                    <div className={`text-xs font-black uppercase ${youWon ? 'text-emerald-500' : tie ? 'text-slate-500' : 'text-rose-500'}`}>
                      {tie ? 'Unentschieden' : youWon ? 'Gewonnen' : 'Verloren'} · {battle.challengerScore ?? 0}:{battle.opponentScore ?? 0}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      onClick={() => onLaunchBattle(battle)}
                      disabled={!canPlay || isLoading}
                    >
                      {canPlay ? 'Jetzt spielen' : hasSubmitted(battle) ? 'Bereits gespielt' : battle.status === 'finished' ? 'Abgeschlossen' : 'Warten...'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default BattlePanel;


