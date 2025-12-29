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
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  isDarkMode,
  isCoinPulsing,
  onOpenInventory,
  onOpenAIChat,
  onOpenFormelsammlung,
  onOpenCalculator,
}) => {
  return (
    <header className={`sticky top-0 z-[100] backdrop-blur-xl border-b px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
      <div onClick={onOpenInventory} className="flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer group hover:opacity-80 transition-opacity touch-manipulation">
        <div className="text-2xl sm:text-3xl bg-slate-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110">{user.avatar}</div>
        <div>
          <span className="font-black italic uppercase block leading-none">{user.username}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Level {Number.isFinite(user.xp) ? Math.floor(user.xp / 100) + 1 : 1}</span>
        </div>
      </div>
      <div className="flex gap-2 sm:gap-3 items-center">
        <button onClick={onOpenAIChat} className="p-2.5 sm:p-3 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" title="KI-Hilfe">🤖</button>
        <button onClick={onOpenFormelsammlung} className="p-2.5 sm:p-3 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation" title="Formelsammlung">📚</button>
        <button onClick={onOpenCalculator} className="p-2.5 sm:p-3 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">🧮</button>
        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] sm:text-xs transition-all shadow-lg min-h-[44px] flex items-center ${isCoinPulsing ? 'scale-110 bg-amber-500' : ''}`}>🪙 {Number.isFinite(user.coins) ? user.coins : 0}</div>
      </div>
    </header>
  );
};

