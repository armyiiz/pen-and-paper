import React, { useRef, useEffect } from 'react';
import type { ChatMessage, GameState } from '../hooks/useGameLogic';
import clsx from 'clsx';
import { Sword, Shield, Footprints, Dices, RefreshCw, Skull, Compass, Coins } from 'lucide-react';

interface GameInterfaceProps {
  chatHistory: ChatMessage[];
  onChoice: (action: string) => void;
  diceResult: { value: number; isSuccess: boolean; visible: boolean };
  gameState: GameState;
  onMove: (direction: 'N' | 'S' | 'E' | 'W') => void;
  onReset: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
    chatHistory,
    onChoice,
    diceResult,
    gameState,
    onMove,
    onReset
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const isExploration = gameState.gameStatus === 'exploration';
  const isCombat = gameState.gameStatus === 'combat';
  const isGameOver = gameState.gameStatus === 'gameover';
  const isVictory = gameState.gameStatus === 'victory';

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

        {/* Game Over / Victory Overlay */}
        {(isGameOver || isVictory) && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
                 <div className="flex flex-col items-center gap-4 text-center p-6">
                     {isVictory ? (
                         <>
                             <div className="text-yellow-400 animate-bounce"><Coins size={64} /></div>
                             <h2 className="text-4xl font-bold text-white text-shadow-glow">Victory!</h2>
                             <p className="text-magical-purple-200">คุณพิชิตชั้นนี้ได้สำเร็จ!</p>
                         </>
                     ) : (
                         <>
                             <div className="text-red-500 animate-pulse"><Skull size={64} /></div>
                             <h2 className="text-4xl font-bold text-white text-shadow-glow">Game Over</h2>
                             <p className="text-slate-400">การเดินทางของคุณสิ้นสุดลงที่นี่...</p>
                         </>
                     )}
                     <button
                        onClick={onReset}
                        className="mt-4 px-6 py-2 bg-magical-purple-600 hover:bg-magical-purple-500 text-white rounded-full font-bold shadow-lg shadow-magical-purple-900/50 transition-all hover:scale-105 flex items-center gap-2"
                     >
                         <RefreshCw size={18} />
                         เล่นอีกครั้ง
                     </button>
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
        {!diceResult.visible && !isGameOver && !isVictory && (
            <>
                {isCombat ? (
                    <>
                        <button
                        onClick={() => onChoice('โจมตี')}
                        className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group"
                        >
                        <Sword size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">โจมตี</span>
                        </button>

                        <button
                        onClick={() => onChoice('ป้องกัน')}
                        className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-indigo-600/80 hover:bg-indigo-500/90 border-indigo-400/50"
                        >
                        <Shield size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">ป้องกัน</span>
                        </button>

                        <button
                        onClick={() => onChoice('หลบหนี')}
                        className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-slate-600/80 hover:bg-slate-500/90 border-slate-400/50"
                        >
                        <Footprints size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">หลบหนี</span>
                        </button>
                    </>
                ) : isExploration ? (
                    <>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => onMove('W')}
                            className="glass-button rounded-xl w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                        >
                            <Compass size={20} className="-rotate-90" />
                            <span className="text-[10px] font-bold">West</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => onMove('N')}
                            className="glass-button rounded-xl flex-1 flex flex-col items-center justify-center hover:bg-slate-700/50"
                        >
                            <Compass size={20} />
                            <span className="text-[10px] font-bold">North</span>
                        </button>
                        <button
                            onClick={() => onMove('S')}
                            className="glass-button rounded-xl flex-1 flex flex-col items-center justify-center hover:bg-slate-700/50"
                        >
                            <Compass size={20} className="rotate-180" />
                            <span className="text-[10px] font-bold">South</span>
                        </button>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => onMove('E')}
                            className="glass-button rounded-xl w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                        >
                            <Compass size={20} className="rotate-90" />
                            <span className="text-[10px] font-bold">East</span>
                        </button>
                    </div>
                    </>
                ) : null}
            </>
        )}
      </div>
    </div>
  );
};

export default GameInterface;
