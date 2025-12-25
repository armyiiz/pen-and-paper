import React from 'react';

const HeaderImage: React.FC = () => {
  return (
    <div className="w-full h-64 relative overflow-hidden rounded-b-3xl shadow-2xl shadow-magical-purple-900/50">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
      <img
        src="https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop"
        alt="Fantasy Landscape"
        className="w-full h-full object-cover object-center transform scale-105"
      />
      <div className="absolute bottom-4 left-4 z-20">
        <h2 className="text-2xl font-bold text-white text-shadow-glow">ป่าทมิฬ</h2>
        <p className="text-magical-purple-200 text-sm">เลเวล 1 • เผชิญหน้า</p>
      </div>
    </div>
  );
};

export default HeaderImage;
