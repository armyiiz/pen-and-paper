import React from 'react';
import type { GameState } from '../hooks/useGameLogic';
import clsx from 'clsx';
import { Map as MapIcon } from 'lucide-react';

const MiniMap: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    return (
        <div className="absolute top-4 right-4 z-50 bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border border-slate-700 w-32 shadow-xl">
            <div className="flex items-center justify-between mb-1">
                 <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapIcon size={12} />
                    <span>Floor {gameState.floorLevel}</span>
                 </div>
                 <div className="text-xs text-magical-purple-300">
                     Pos: {gameState.playerPosition.x}, {gameState.playerPosition.y}
                 </div>
            </div>
            <div className="grid grid-cols-5 gap-1 aspect-square w-full mx-auto">
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
                                 if (room.type === 'boss') bgClass = 'bg-red-900/50';
                             } else {
                                 // Revealed but not visited
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

export default MiniMap;
