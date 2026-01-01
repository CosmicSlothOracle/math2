import React from 'react';
import { User } from '../types';

interface HeaderBarProps {
  user: User;
  isDarkMode: boolean;
  isCoinPulsing: boolean;
  onOpenInventory: () => void;
  onOpenAIChat: () => void;
  onOpenFormelsammlung: () => void;
  onOpenCalculator: () => void;
  onOpenFormelRechner?: () => void;
  onOpenSchrittLoeser?: () => void;
  onOpenSpickerTrainer?: () => void;
  onOpenScheitelCoach?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  isDarkMode,
  isCoinPulsing,
  onOpenInventory,
  onOpenAIChat,
  onOpenFormelsammlung,
  onOpenCalculator,
  onOpenFormelRechner,
  onOpenSchrittLoeser,
  onOpenSpickerTrainer,
  onOpenScheitelCoach,
}) => {
  const hasTools = user.unlockedTools && user.unlockedTools.length > 0;
  const hasFormelRechner = user.unlockedTools?.includes('formel_rechner');
  const hasSchrittLoeser = user.unlockedTools?.includes('schritt_loeser');
  const hasSpickerTrainer = user.unlockedTools?.includes('spicker_trainer');
  const hasScheitelCoach = user.unlockedTools?.includes('scheitel_coach');

  return (
    <header className={`sticky top-0 z-[100] backdrop-blur-xl border-b px-4 sm:px-8 py-3 transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
      <div className="flex items-center justify-between gap-2">
        <div onClick={onOpenInventory} className="flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer group hover:opacity-80 transition-opacity touch-manipulation">
          <div className="text-2xl sm:text-3xl bg-slate-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110">{user.avatar}</div>
          <div>
            <span className="font-black italic uppercase block leading-none">{user.username}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Level {Number.isFinite(user.xp) ? Math.floor(user.xp / 100) + 1 : 1}</span>
          </div>
        </div>

        {/* Tools Section */}
        {hasTools && (
          <div className="flex gap-1.5 sm:gap-2 items-center overflow-x-auto scrollbar-hide max-w-[50%] sm:max-w-none">
            {hasFormelRechner && onOpenFormelRechner && (
              <button
                onClick={onOpenFormelRechner}
                className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation shrink-0"
                title="Formel-Rechner"
              >
                🧮
              </button>
            )}
            {hasSchrittLoeser && onOpenSchrittLoeser && (
              <button
                onClick={onOpenSchrittLoeser}
                className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation shrink-0"
                title="Schritt-für-Schritt-Loeser"
              >
                📝
              </button>
            )}
            {hasSpickerTrainer && onOpenSpickerTrainer && (
              <button
                onClick={onOpenSpickerTrainer}
                className="p-2 sm:p-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation shrink-0"
                title="Spicker-Coach"
              >
                🧠
              </button>
            )}
            {hasScheitelCoach && onOpenScheitelCoach && (
              <button
                onClick={onOpenScheitelCoach}
                className="p-2 sm:p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation shrink-0"
                title="Scheitel-Coach"
              >
                📈
              </button>
            )}
          </div>
        )}

        {/* Standard Tools */}
        <div className="flex gap-2 sm:gap-3 items-center shrink-0">
          <button onClick={onOpenAIChat} className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" title="KI-Hilfe">🤖</button>
          <button onClick={onOpenFormelsammlung} className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" title="Formelsammlung">📚</button>
          <button onClick={onOpenCalculator} className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" title="Taschenrechner">🧮</button>
          <div className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black text-[10px] sm:text-xs transition-all shadow-lg min-h-[44px] flex items-center ${isCoinPulsing ? 'scale-110 bg-amber-500' : ''}`}>🪙 {Number.isFinite(user.coins) ? user.coins : 0}</div>
        </div>
      </div>
    </header>
  );
};

