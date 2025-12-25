import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../hooks/useGameLogic';
import clsx from 'clsx';
import { Sword, Shield, Footprints, Dices } from 'lucide-react';

interface GameInterfaceProps {
  chatHistory: ChatMessage[];
  onChoice: (action: string) => void;
  diceResult: { value: number; isSuccess: boolean; visible: boolean };
}

const GameInterface: React.FC<GameInterfaceProps> = ({ chatHistory, onChoice, diceResult }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 px-4 pt-6 pb-4 gap-4">
      {/* Chat Area */}
      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col relative">
         {/* Dice Overlay */}
        {diceResult.visible && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={clsx(
              "transform transition-all scale-150 p-8 rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2",
              diceResult.isSuccess
                ? "bg-green-500/20 border-green-500 text-green-400"
                : "bg-red-500/20 border-red-500 text-red-400"
            )}>
              <Dices size={48} className="animate-bounce" />
              <span className="text-4xl font-black">{diceResult.value}</span>
              <span className="text-xs uppercase tracking-widest font-bold">
                {diceResult.isSuccess ? 'SUCCESS' : 'FAILURE'}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={clsx(
              "flex flex-col max-w-[85%] animate-in slide-in-from-bottom-2 duration-300",
              msg.sender === 'Player' ? "self-end items-end" : "self-start items-start"
            )}>
              <span className="text-xs text-magical-purple-300 mb-1 px-1">
                {msg.sender === 'GM' ? 'Game Master' : 'You'}
              </span>
              <div className={clsx(
                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'Player'
                  ? "bg-magical-purple-600 text-white rounded-tr-none"
                  : "bg-slate-800/80 text-slate-100 rounded-tl-none border border-slate-700",
                msg.type === 'success' && "border-l-4 border-l-green-500",
                msg.type === 'failure' && "border-l-4 border-l-red-500"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 h-20 shrink-0">
        <button
          onClick={() => onChoice('โจมตี')}
          disabled={diceResult.visible}
          className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group"
        >
          <Sword size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">โจมตี</span>
        </button>

        <button
          onClick={() => onChoice('ป้องกัน')}
          disabled={diceResult.visible}
          className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-indigo-600/80 hover:bg-indigo-500/90 border-indigo-400/50"
        >
          <Shield size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">ป้องกัน</span>
        </button>

        <button
          onClick={() => onChoice('หลบหนี')}
          disabled={diceResult.visible}
          className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-slate-600/80 hover:bg-slate-500/90 border-slate-400/50"
        >
          <Footprints size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">หลบหนี</span>
        </button>
      </div>
    </div>
  );
};

export default GameInterface;
