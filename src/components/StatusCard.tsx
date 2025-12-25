import React from 'react';
import { Heart, Zap, Coins } from 'lucide-react';
import type { GameState } from '../hooks/useGameLogic';

interface StatusCardProps {
  stats: GameState;
}

const StatusCard: React.FC<StatusCardProps> = ({ stats }) => {
  return (
    <div className="glass-panel mx-4 -mt-8 relative z-20 rounded-xl p-4 flex justify-around items-center">
      {/* HP */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-2 rounded-full bg-red-500/20 text-red-400">
          <Heart size={20} fill="currentColor" />
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-white">{stats.hp}</span>
          <span className="text-xs text-slate-400 block">/{stats.maxHp} HP</span>
        </div>
      </div>

      {/* MP */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
          <Zap size={20} fill="currentColor" />
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-white">{stats.mp}</span>
          <span className="text-xs text-slate-400 block">/{stats.maxMp} MP</span>
        </div>
      </div>

      {/* Gold */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
          <Coins size={20} fill="currentColor" />
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-amber-200">{stats.gold}</span>
          <span className="text-xs text-slate-400 block">Gold</span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
