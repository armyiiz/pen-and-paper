import { useState, useCallback } from 'react';

export type GameState = {
  hp: number;
  mp: number;
  gold: number;
  maxHp: number;
  maxMp: number;
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

export const useGameLogic = () => {
  const [stats, setStats] = useState<GameState>({
    hp: 100,
    mp: 50,
    gold: 0,
    maxHp: 100,
    maxMp: 50,
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'GM',
      text: 'ยินดีต้อนรับสู่อาณาจักรแห่งความมืด... คุณพบมอนสเตอร์อยู่ตรงหน้า จะทำอย่างไร?',
      type: 'info',
    },
  ]);

  const [diceResult, setDiceResult] = useState<DiceResult>({
    value: 0,
    isSuccess: false,
    visible: false,
  });

  const addMessage = useCallback((sender: ChatMessage['sender'], text: string, type: ChatMessage['type'] = 'normal') => {
    setChatHistory((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), sender, text, type },
    ]);
  }, []);

  const handleChoice = (action: string) => {
    // 1. Roll Dice
    const roll = Math.floor(Math.random() * 20) + 1;
    const isSuccess = roll > 10;

    setDiceResult({ value: roll, isSuccess, visible: true });

    // Hide dice after animation
    setTimeout(() => {
      setDiceResult((prev) => ({ ...prev, visible: false }));
    }, 2000);

    // 2. Add Player Action to Chat
    addMessage('Player', `ฉันเลือก: ${action}`, 'normal');

    // 3. Process Logic
    setTimeout(() => {
      if (isSuccess) {
        if (action === 'โจมตี') {
          const goldGain = Math.floor(Math.random() * 20) + 10;
          setStats((prev) => ({ ...prev, gold: prev.gold + goldGain }));
          addMessage('GM', `สำเร็จ! (Roll: ${roll}) คุณโจมตีมอนสเตอร์ได้รุนแรง ได้รับ ${goldGain} Gold!`, 'success');
        } else if (action === 'ป้องกัน') {
           const hpHeal = 5;
           setStats((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + hpHeal) }));
           addMessage('GM', `สำเร็จ! (Roll: ${roll}) คุณป้องกันการโจมตีได้และฟื้นฟูพลังเล็กน้อย`, 'success');
        } else if (action === 'หลบหนี') {
           addMessage('GM', `สำเร็จ! (Roll: ${roll}) คุณหลบหนีออกมาได้อย่างปลอดภัย`, 'success');
        }
      } else {
         const dmg = Math.floor(Math.random() * 10) + 5;
         setStats((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
         addMessage('GM', `ล้มเหลว! (Roll: ${roll}) คุณพลาดท่าถูกมอนสเตอร์โจมตี เสีย ${dmg} HP!`, 'failure');
      }
    }, 1000); // Small delay to sync with dice reveal
  };

  return {
    stats,
    chatHistory,
    diceResult,
    handleChoice,
  };
};
