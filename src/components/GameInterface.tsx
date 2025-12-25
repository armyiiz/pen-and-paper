import React, { useRef, useEffect } from 'react';
import type { ChatMessage, GameState } from '../hooks/useGameLogic';
import clsx from 'clsx';
import { Sword, Shield, Footprints, Dices, RefreshCw, Skull, Map as MapIcon, Compass, Coins } from 'lucide-react';

interface GameInterfaceProps {
  chatHistory: ChatMessage[];
  onChoice: (action: string) => void;
  diceResult: { value: number; isSuccess: boolean; visible: boolean };
  gameState: GameState;
  onMove: (direction: 'N' | 'S' | 'E' | 'W') => void;
  onReset: () => void;
}

const MiniMap: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    return (
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-700/50 w-full mb-2 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-1 text-[10px]">
                 <div className="text-slate-400 flex items-center gap-1">
                    <MapIcon size={10} />
                    <span>F-{gameState.floorLevel}</span>
                 </div>
                 <div className="text-magical-purple-300 font-mono">
                     {gameState.playerPosition.x},{gameState.playerPosition.y}
                 </div>
            </div>
            <div className="grid grid-cols-5 gap-0.5 aspect-square w-full mx-auto">
                {gameState.grid.map((row, y) => (
                    row.map((room, x) => {
                        const isPlayer = gameState.playerPosition.x === x && gameState.playerPosition.y === y;
                        let bgClass = 'bg-slate-800/50'; // Unknown/Fog

                        if (room.revealed) {
                             if (room.visited) {
                                 // Visited rooms
                                 bgClass = 'bg-slate-700';
                                 if (room.type === 'start') bgClass = 'bg-green-900/60';
                                 if (room.type === 'boss') bgClass = 'bg-red-900/60';
                             } else {
                                 // Revealed but not visited
                                 bgClass = 'bg-slate-800/80';
                             }
                        } else {
                             // Hidden completely
                             bgClass = 'bg-slate-950/30';
                        }

                        // Override for current player position
                        if (isPlayer) {
                             bgClass = 'bg-magical-purple-500 animate-pulse ring-1 ring-magical-purple-300';
                        }

                        return (
                            <div key={`${x}-${y}`} className={clsx(
                                "w-full h-full rounded-[1px] flex items-center justify-center text-[6px]",
                                bgClass
                            )}>
                                {!isPlayer && room.visited && room.type === 'boss' && <span className="text-red-400 font-bold">B</span>}
                                {!isPlayer && room.visited && room.type === 'start' && <span className="text-green-400 font-bold">S</span>}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
};

const BossHpBar: React.FC<{ currentHp: number, maxHp: number }> = ({ currentHp, maxHp }) => {
    const percent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    return (
        <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-600 overflow-hidden relative shadow-lg mb-2">
            <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white text-shadow-sm">
                BOSS HP: {currentHp}/{maxHp}
            </div>
        </div>
    );
};

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

  // Check if current room is Boss to show HP bar
  const { x, y } = gameState.playerPosition;
  const currentRoom = gameState.grid[y][x];
  const isBossCombat = isCombat && currentRoom.type === 'boss';

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 px-4 pt-4 pb-4 gap-3">
      {/* Top Right Mini Map - Absolute Positioned */}
      <div className="absolute top-4 right-4 z-30 w-20">
         <MiniMap gameState={gameState} />
      </div>

      {/* Chat Area */}
      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col relative bg-slate-900/40 backdrop-blur-sm border-slate-700/30">
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

        {/* Boss HP Bar Overlay */}
        {isBossCombat && currentRoom.enemyHp !== undefined && (
            <div className="absolute top-0 left-0 right-0 p-2 z-20 bg-gradient-to-b from-slate-900/90 to-transparent">
                <BossHpBar currentHp={currentRoom.enemyHp} maxHp={currentRoom.maxEnemyHp || 50} />
            </div>
        )}

        {/* Messages */}
        <div className={clsx("flex-1 overflow-y-auto p-4 space-y-3", isBossCombat ? "pt-12" : "pt-4")}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={clsx(
              "flex flex-col max-w-[85%] animate-in slide-in-from-bottom-2 duration-300",
              msg.sender === 'Player' ? "self-end items-end" : "self-start items-start"
            )}>
              <span className="text-[10px] text-magical-purple-300 mb-0.5 px-1 opacity-80">
                {msg.sender === 'GM' ? 'Game Master' : 'You'}
              </span>
              <div className={clsx(
                "p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                msg.sender === 'Player'
                  ? "bg-magical-purple-600 text-white rounded-tr-none"
                  : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/50",
                msg.type === 'success' && "border-l-2 border-l-green-500",
                msg.type === 'failure' && "border-l-2 border-l-red-500"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 h-16 shrink-0">
        {isCombat ? (
            <>
                <button
                onClick={() => onChoice('โจมตี')}
                disabled={diceResult.visible}
                className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group"
                >
                <Sword size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">โจมตี</span>
                </button>

                <button
                onClick={() => onChoice('ป้องกัน')}
                disabled={diceResult.visible}
                className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-indigo-600/80 hover:bg-indigo-500/90 border-indigo-400/50"
                >
                <Shield size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">ป้องกัน</span>
                </button>

                <button
                onClick={() => onChoice('หลบหนี')}
                disabled={diceResult.visible}
                className="glass-button rounded-xl flex flex-col items-center justify-center gap-1 group bg-slate-600/80 hover:bg-slate-500/90 border-slate-400/50"
                >
                <Footprints size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">หลบหนี</span>
                </button>
            </>
        ) : isExploration ? (
            <>
               <div className="flex items-center justify-center">
                   <button
                       onClick={() => onMove('W')}
                       className="glass-button rounded-xl w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                   >
                       <Compass size={18} className="-rotate-90" />
                       <span className="text-[10px] font-bold">West</span>
                   </button>
               </div>
               <div className="flex flex-col gap-2">
                   <button
                       onClick={() => onMove('N')}
                       className="glass-button rounded-xl flex-1 w-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                   >
                       <Compass size={16} />
                       <span className="text-[10px] font-bold">North</span>
                   </button>
                   <button
                       onClick={() => onMove('S')}
                       className="glass-button rounded-xl flex-1 w-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                   >
                       <Compass size={16} className="rotate-180" />
                       <span className="text-[10px] font-bold">South</span>
                   </button>
               </div>
               <div className="flex items-center justify-center">
                   <button
                       onClick={() => onMove('E')}
                       className="glass-button rounded-xl w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/50"
                   >
                       <Compass size={18} className="rotate-90" />
                       <span className="text-[10px] font-bold">East</span>
                   </button>
               </div>
            </>
        ) : (
             <div className="col-span-3 flex items-center justify-center text-slate-500 text-sm">
                 {isVictory ? "ภารกิจเสร็จสิ้น" : "จบเกม"}
             </div>
        )}
      </div>
    </div>
  );
};

export default GameInterface;
