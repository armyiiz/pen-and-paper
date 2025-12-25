import HeaderImage from './components/HeaderImage';
import StatusCard from './components/StatusCard';
import GameInterface from './components/GameInterface';
import MiniMap from './components/MiniMap';
import { useGameLogic } from './hooks/useGameLogic';

function App() {
  const { gameState, chatHistory, diceResult, handleChoice, handleMove, resetGame } = useGameLogic();

  // Calculate current room type for HeaderImage
  const { x, y } = gameState.playerPosition;
  // Ensure we don't crash on initial render or boundaries if logic fails (though logic is safe)
  const currentRoom = gameState.grid[y] && gameState.grid[y][x];
  const currentRoomType = currentRoom ? currentRoom.type : 'empty';

  return (
    <div className="w-full h-screen bg-slate-950 flex justify-center overflow-hidden relative">
       {/* Floating MiniMap */}
      <MiniMap gameState={gameState} />

      <div className="w-full max-w-md h-full bg-slate-900 shadow-2xl relative flex flex-col">
        {/* Background Ambient Effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-magical-purple-700/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-700/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <HeaderImage
             currentRoomType={currentRoomType}
             bossHp={gameState.bossHp}
             maxBossHp={gameState.maxBossHp}
             gameStatus={gameState.gameStatus}
          />
          <StatusCard stats={gameState} />
          <GameInterface
            chatHistory={chatHistory}
            onChoice={handleChoice}
            diceResult={diceResult}
            gameState={gameState}
            onMove={handleMove}
            onReset={resetGame}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
