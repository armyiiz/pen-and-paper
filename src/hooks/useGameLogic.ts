import { useState, useCallback, useEffect } from 'react';

export type RoomType = 'start' | 'empty' | 'battle' | 'treasure' | 'trap' | 'boss';

export type Room = {
  type: RoomType;
  visited: boolean;
  revealed: boolean;
};

export type GameStatus = 'exploration' | 'combat' | 'victory' | 'gameover';

export type Position = {
  x: number;
  y: number;
};

export type GameState = {
  hp: number;
  mp: number;
  gold: number;
  maxHp: number;
  maxMp: number;
  bossHp: number;
  maxBossHp: number;
  grid: Room[][];
  playerPosition: Position;
  gameStatus: GameStatus;
  floorLevel: number;
};

export type ChatMessage = {
  id: string;
  sender: 'GM' | 'Player' | 'System';
  text: string;
  type?: 'normal' | 'success' | 'failure' | 'info';
};

export type DiceResult = {
  value: number;
  isSuccess: boolean;
  visible: boolean;
};

const GRID_SIZE = 5;

export const useGameLogic = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [diceResult, setDiceResult] = useState<DiceResult>({
    value: 0,
    isSuccess: false,
    visible: false,
  });

  const generateDungeon = (_level: number): { grid: Room[][]; startPos: Position } => {
    // Initialize grid with empty rooms
    const newGrid: Room[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        type: 'empty',
        visited: false,
        revealed: false,
      }))
    );

    // Set Start Position (randomly or 0,0) - let's do random edge for variety or fixed 0,0
    // Requirement says: Start room is safe.
    const startX = Math.floor(Math.random() * GRID_SIZE);
    const startY = Math.floor(Math.random() * GRID_SIZE);
    newGrid[startY][startX].type = 'start';
    newGrid[startY][startX].visited = true;
    newGrid[startY][startX].revealed = true;

    // Place Boss (ensure distinct from start)
    let bossX, bossY;
    do {
      bossX = Math.floor(Math.random() * GRID_SIZE);
      bossY = Math.floor(Math.random() * GRID_SIZE);
    } while (bossX === startX && bossY === startY);
    newGrid[bossY][bossX].type = 'boss';

    // Populate other rooms
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x].type !== 'start' && newGrid[y][x].type !== 'boss') {
          const rand = Math.random();
          if (rand < 0.3) newGrid[y][x].type = 'battle';
          else if (rand < 0.5) newGrid[y][x].type = 'treasure';
          else if (rand < 0.65) newGrid[y][x].type = 'trap';
          else newGrid[y][x].type = 'empty';
        }
      }
    }

    // Reveal neighbors of start
    const directions = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    directions.forEach(({ dx, dy }) => {
        const nx = startX + dx;
        const ny = startY + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            newGrid[ny][nx].revealed = true;
        }
    });

    return { grid: newGrid, startPos: { x: startX, y: startY } };
  };

  const [gameState, setGameState] = useState<GameState>(() => {
    const { grid, startPos } = generateDungeon(1);
    return {
      hp: 100,
      mp: 50,
      gold: 0,
      maxHp: 100,
      maxMp: 50,
      bossHp: 50,
      maxBossHp: 50,
      grid,
      playerPosition: startPos,
      gameStatus: 'exploration',
      floorLevel: 1,
    };
  });

  // Initialize chat only once
  useEffect(() => {
    if (chatHistory.length === 0) {
        addMessage('GM', 'ยินดีต้อนรับสู่อาณาจักรแห่งความมืด... จงสำรวจเขาวงกตและค้นหาทางออก!', 'info');
    }
  }, []);

  const addMessage = useCallback((sender: ChatMessage['sender'], text: string, type: ChatMessage['type'] = 'normal') => {
    setChatHistory((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), sender, text, type },
    ]);
  }, []);

  const handleMove = (direction: 'N' | 'S' | 'E' | 'W') => {
    if (gameState.gameStatus !== 'exploration') return;

    const { x, y } = gameState.playerPosition;
    let newX = x;
    let newY = y;

    if (direction === 'N') newY -= 1;
    if (direction === 'S') newY += 1;
    if (direction === 'E') newX += 1;
    if (direction === 'W') newX -= 1;

    // Check Boundaries
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      addMessage('System', 'ทางตัน! ไม่สามารถเดินไปทางนั้นได้', 'normal');
      return;
    }

    // Move Player
    const newGrid = [...gameState.grid.map(row => [...row])]; // Deep copy grid
    const targetRoom = newGrid[newY][newX];

    // Update Visited & Revealed
    targetRoom.visited = true;
    targetRoom.revealed = true;

    // Reveal neighbors of new position (Fog of War)
    const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
    directions.forEach(({ dx, dy }) => {
        const nx = newX + dx;
        const ny = newY + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            newGrid[ny][nx].revealed = true;
        }
    });

    // Update State Position immediately
    setGameState(prev => ({
        ...prev,
        grid: newGrid,
        playerPosition: { x: newX, y: newY }
    }));

    addMessage('Player', `เดินไปทางทิศ ${direction === 'N' ? 'เหนือ' : direction === 'S' ? 'ใต้' : direction === 'E' ? 'ตะวันออก' : 'ตะวันตก'}...`, 'normal');

    // Handle Events
    processRoomEvent(targetRoom, newX, newY);
  };

  const processRoomEvent = (room: Room, x: number, y: number) => {
      // Use setTimeout to create a small delay for "arrival" feeling
      setTimeout(() => {
          if (room.type === 'empty' || room.type === 'start') {
              addMessage('GM', 'ห้องนี้ว่างเปล่าและเงียบสงบ...', 'normal');
          } else if (room.type === 'treasure') {
              const goldFound = Math.floor(Math.random() * 50) + 20;
              setGameState(prev => {
                  // Let's modify the room type to empty to consume the event.
                  const updatedGrid = [...prev.grid.map(row => [...row])];
                  updatedGrid[y][x].type = 'empty';
                  return {
                      ...prev,
                      gold: prev.gold + goldFound,
                      grid: updatedGrid
                  };
              });
              addMessage('GM', `คุณพบหีบสมบัติ! ได้รับ ${goldFound} Gold`, 'success');
          } else if (room.type === 'trap') {
              const dmg = 15;
              setGameState(prev => {
                  const newHp = Math.max(0, prev.hp - dmg);
                  const updatedGrid = [...prev.grid.map(row => [...row])];
                  updatedGrid[y][x].type = 'empty'; // Trap triggered
                  return {
                      ...prev,
                      hp: newHp,
                      grid: updatedGrid,
                      gameStatus: newHp === 0 ? 'gameover' : prev.gameStatus
                  };
              });
              addMessage('GM', `กับดักทำงาน! คุณโดนหนามพุ่งแทง เสีย ${dmg} HP`, 'failure');
              // Check game over is handled in the setState above via gameStatus
          } else if (room.type === 'battle') {
              setGameState(prev => ({ ...prev, gameStatus: 'combat' }));
              addMessage('GM', 'มอนสเตอร์ปรากฏตัว! เตรียมต่อสู้!', 'failure');
          } else if (room.type === 'boss') {
               setGameState(prev => ({ ...prev, gameStatus: 'combat' }));
               addMessage('GM', 'คุณเผชิญหน้ากับบอสประจำชั้น! เตรียมตัวให้ดี!', 'failure');
          }
      }, 300);
  };

  const handleChoice = (action: string) => {
    // 1. Roll Dice
    const roll = Math.floor(Math.random() * 20) + 1;
    const isSuccess = roll > 10;
    const { x, y } = gameState.playerPosition;
    const currentRoomType = gameState.grid[y][x].type;

    if (action === 'หลบหนี' && currentRoomType === 'boss') {
        addMessage('System', 'ไม่สามารถหลบหนีจากบอสได้! สู้ตายเท่านั้น!', 'failure');
        return;
    }

    setDiceResult({ value: roll, isSuccess, visible: true });

    setTimeout(() => {
      setDiceResult((prev) => ({ ...prev, visible: false }));
    }, 2000);

    addMessage('Player', `ฉันเลือก: ${action}`, 'normal');

    setTimeout(() => {
      if (isSuccess) {
        if (action === 'โจมตี') {
          // Boss Logic
          if (currentRoomType === 'boss') {
              const dmgToBoss = 10; // Fixed dmg or random? Let's say 10-15
              setGameState((prev) => {
                  const newBossHp = Math.max(0, prev.bossHp - dmgToBoss);
                  const isDead = newBossHp === 0;

                  // If dead
                  let newStatus: GameStatus = 'combat';
                  let newGrid = prev.grid;

                  if (isDead) {
                      newStatus = 'victory';
                      // Clear room
                      newGrid = [...prev.grid.map(row => [...row])];
                      newGrid[y][x].type = 'empty';
                  }

                  return {
                      ...prev,
                      bossHp: newBossHp,
                      gameStatus: newStatus,
                      grid: newGrid
                  };
              });

              addMessage('GM', `โจมตีสำเร็จ! (Roll: ${roll}) คุณสร้างความเสียหาย ${dmgToBoss} แก่บอส!`, 'success');
          } else {
             // Normal Monster (One hit kill)
             const goldGain = Math.floor(Math.random() * 20) + 10;
             setGameState((prev) => {
                  const newGrid = [...prev.grid.map(row => [...row])];
                  newGrid[y][x].type = 'empty';
                  return {
                      ...prev,
                      gold: prev.gold + goldGain,
                      grid: newGrid,
                      gameStatus: 'exploration'
                  };
              });
              addMessage('GM', `สำเร็จ! (Roll: ${roll}) คุณกำจัดมอนสเตอร์ได้! ได้รับ ${goldGain} Gold!`, 'success');
          }

        } else if (action === 'ป้องกัน') {
           const hpHeal = 5;
           setGameState((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + hpHeal) }));
           addMessage('GM', `ป้องกันสำเร็จ! (Roll: ${roll}) คุณฟื้นฟู ${hpHeal} HP และไม่ได้รับความเสียหาย`, 'success');
        } else if (action === 'หลบหนี') {
           setGameState((prev) => {
              const newGrid = [...prev.grid.map(row => [...row])];
              const { x, y } = prev.playerPosition;
              newGrid[y][x].type = 'empty'; // Monster gone
              return {
                  ...prev,
                  grid: newGrid,
                  gameStatus: 'exploration'
              };
            });
           addMessage('GM', `หนีสำเร็จ! (Roll: ${roll}) คุณรอดพ้นจากอันตราย`, 'success');
        }
      } else {
         // Failure
         const dmg = Math.floor(Math.random() * 10) + 5;

         setGameState((prev) => {
             const newHp = Math.max(0, prev.hp - dmg);
             return {
                 ...prev,
                 hp: newHp,
                 gameStatus: newHp === 0 ? 'gameover' : prev.gameStatus
             };
         });

         addMessage('GM', `ล้มเหลว! (Roll: ${roll}) คุณพลาด! ถูกศัตรูโจมตีสวนกลับ เสีย ${dmg} HP!`, 'failure');
      }
    }, 1000);
  };

  const resetGame = () => {
      const { grid, startPos } = generateDungeon(1);
      setGameState({
          hp: 100,
          mp: 50,
          gold: 0,
          maxHp: 100,
          maxMp: 50,
          bossHp: 50,
          maxBossHp: 50,
          grid,
          playerPosition: startPos,
          gameStatus: 'exploration',
          floorLevel: 1
      });
      setChatHistory([]);
      addMessage('GM', 'การผจญภัยครั้งใหม่เริ่มต้นขึ้น!', 'info');
  };

  return {
    gameState,
    chatHistory,
    diceResult,
    handleChoice,
    handleMove,
    resetGame
  };
};
