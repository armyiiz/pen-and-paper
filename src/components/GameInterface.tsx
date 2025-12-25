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
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700 w-full mb-2">
            <div className="flex items-center justify-between mb-1">
                 <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapIcon size={12} />
                    <span>Floor {gameState.floorLevel}</span>
                 </div>
                 <div className="text-xs text-magical-purple-300">
                     Pos: {gameState.playerPosition.x}, {gameState.playerPosition.y}
                 </div>
            </div>
            <div className="grid grid-cols-5 gap-1 aspect-square w-full max-w-[120px] mx-auto">
                {gameState.grid.map((row, y) => (
                    row.map((room, x) => {
                        const isPlayer = gameState.playerPosition.x === x && gameState.playerPosition.y === y;
                        let bgClass = 'bg-slate-800'; // Unknown/Fog
                        let borderClass = 'border-slate-800';

                        if (room.revealed) {
                             if (room.visited) {
                                 // Visited rooms
                                 bgClass = 'bg-slate-700/50';
                                 if (room.type === 'start') bgClass = 'bg-green-900/50';
                                 if (room.type === 'boss') bgClass = 'bg-red-900/50'; // Only if known? visited implies known
                             } else {
                                 // Revealed but not visited (neighbors) - Keep dark but maybe slight hint?
                                 // Fog of war usually hides content.
                                 // Requirement: "Fog of War should hide the contents of the rooms (show as unknown blocks). Visited rooms should remain fully visible."
                                 // Revealed means "seen" but maybe not "entered"?
                                 // In my logic: neighbors are 'revealed' but not 'visited'.
                                 // If I haven't visited, I shouldn't know type, except maybe walls? Here it's grid.
                                 // So revealed neighbors are just "visible blocks" but maybe '?' content.
                                 bgClass = 'bg-slate-800/80 border-slate-700';
                             }
                        } else {
                             // Hidden completely
                             bgClass = 'bg-slate-950 opacity-50';
                             borderClass = 'border-transparent';
                        }

                        // Override for current player position
                        if (isPlayer) {
                             bgClass = 'bg-magical-purple-500 animate-pulse';
                             borderClass = 'border-magical-purple-300';
                        }

                        return (
                            <div key={`${x}-${y}`} className={clsx(
                                "w-full h-full rounded-sm border flex items-center justify-center text-[8px]",
                                bgClass,
                                borderClass
                            )}>
                                {isPlayer && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                {!isPlayer && room.visited && room.type === 'boss' && <div className="text-red-500">B</div>}
                                {!isPlayer && room.visited && room.type === 'start' && <div className="text-green-500">S</div>}
                            </div>
                        );
                    })
                ))}
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

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 px-4 pt-6 pb-4 gap-4">
      {/* Top Bar with Map (Visible only in exploration/combat?) Let's show always for context */}
      <div className="absolute top-2 right-4 z-30 w-32">
         {/* Mini Map Overlay - actually placing it inside normal flow might be better for mobile layout */}
      </div>

      {/* Chat Area */}
      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col relative">
         {/* Mini Map inside Chat Header area for visibility */}
         <div className="absolute top-2 right-2 z-10 w-28 opacity-90 hover:opacity-100 transition-opacity">
            <MiniMap gameState={gameState} />
         </div>

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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-14"> {/* Added pt-14 for map space */}
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
        {isCombat ? (
            <>
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
            </>
        ) : isExploration ? (
            // Exploration Controls (D-Pad style or Grid style)
            // 3 cols: [Empty] [North] [Empty]
            //         [West]  [Down?] [East]
            //         [Empty] [South] [Empty]
            // But we have 3 slots in the grid container defined in CSS.
            // Let's change the container style dynamically or use a different layout.
            // The parent has "grid-cols-3".
            // We can span cols.
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
        ) : (
            // Game Over / Victory State - Buttons disabled or Hidden
             <div className="col-span-3 flex items-center justify-center text-slate-500 text-sm">
                 {isVictory ? "ภารกิจเสร็จสิ้น" : "จบเกม"}
             </div>
        )}
      </div>
    </div>
  );
};

export default GameInterface;
