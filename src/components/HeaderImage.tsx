import React from 'react';
import type { RoomType } from '../hooks/useGameLogic';

interface HeaderImageProps {
  currentRoomType: RoomType;
}

const HeaderImage: React.FC<HeaderImageProps> = ({ currentRoomType }) => {
  let imageUrl = '';
  let title = '';
  let subtitle = '';

  switch (currentRoomType) {
    case 'start':
    case 'empty':
      imageUrl = 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop';
      title = 'ทางเดินมืดมิด';
      subtitle = 'ความเงียบสงบที่น่าหวาดระแวง';
      break;
    case 'battle':
      imageUrl = 'https://images.unsplash.com/photo-1637823547289-53b478204642?q=80&w=2600&auto=format&fit=crop'; // Dark Dungeon Corridor/Monster vibe
      title = 'การเผชิญหน้า';
      subtitle = 'มอนสเตอร์ปรากฏตัว!';
      break;
    case 'treasure':
      imageUrl = 'https://images.unsplash.com/photo-1621360841013-c768371e93cf?q=80&w=2500&auto=format&fit=crop'; // Treasure Chest / Gold vibe
      title = 'ห้องสมบัติ';
      subtitle = 'ประกายทองคำวับวาว';
      break;
    case 'trap':
      imageUrl = 'https://images.unsplash.com/photo-1622360731002-39327ee4e510?q=80&w=2574&auto=format&fit=crop'; // Spikes / Danger
      title = 'กับดักอันตราย';
      subtitle = 'ระวังตัวด้วย!';
      break;
    case 'boss':
      imageUrl = 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop'; // Reusing landscape or find a Boss one. Let's use a darker one.
      // Actually let's use a specific boss-like image.
      imageUrl = 'https://images.unsplash.com/photo-1533052478330-9a37c046e72c?q=80&w=2670&auto=format&fit=crop'; // Dark cave/monster
      title = 'ห้องบอส';
      subtitle = 'ศัตรูที่แข็งแกร่งที่สุดในชั้นนี้';
      break;
    default:
      imageUrl = 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop';
      title = 'ป่าทมิฬ';
      subtitle = 'เลเวล 1 • เผชิญหน้า';
  }

  return (
    <div className="w-full h-64 relative overflow-hidden rounded-b-3xl shadow-2xl shadow-magical-purple-900/50">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-in-out"
        key={currentRoomType} // Force re-render/animation on change
      />
      <div className="absolute bottom-4 left-4 z-20">
        <h2 className="text-2xl font-bold text-white text-shadow-glow">{title}</h2>
        <p className="text-magical-purple-200 text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

export default HeaderImage;
