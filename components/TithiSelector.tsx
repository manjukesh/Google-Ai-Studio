import React from 'react';
import { TITHI_NAMES, DEGREES_PER_TITHI } from '../constants';

interface TithiSelectorProps {
  currentAngle: number;
  onSelect: (angle: number) => void;
}

const TithiSelector: React.FC<TithiSelectorProps> = ({ currentAngle, onSelect }) => {
  
  // Helper to generate Tithi objects
  const generateTithis = (isWaxing: boolean) => {
    const list = [];
    for (let i = 1; i <= 15; i++) {
      // Name Logic
      let name = TITHI_NAMES[i - 1] || `Tithi ${i}`;
      if (i === 15) {
        name = isWaxing ? 'Purnima' : 'Amavasya';
      }

      // Angle Logic
      // Shukla (Waxing): 0-180. Tithi 1 is 0-12. Midpoint is 6.
      // Krishna (Waning): 180-360. Tithi 1 is 180-192. Midpoint is 186.
      const baseAngle = isWaxing ? 0 : 180;
      const start = baseAngle + (i - 1) * DEGREES_PER_TITHI;
      
      // Special case for Amavasya (360 -> 0)
      let targetAngle = start + (DEGREES_PER_TITHI / 2);
      if (!isWaxing && i === 15) targetAngle = 0; 

      list.push({ i, name, targetAngle });
    }
    return list;
  };

  const shuklaTithis = generateTithis(true);
  const krishnaTithis = generateTithis(false);

  // Helper to check if active
  const isActive = (target: number) => {
     const normalizedCurrent = (currentAngle % 360 + 360) % 360;
     // Simple proximity check (within 6 degrees)
     const diff = Math.abs(normalizedCurrent - target);
     return diff < 6 || Math.abs(diff - 360) < 6;
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-3xl p-6 shadow-2xl">
      
      {/* Shukla Paksha Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
          <h3 className="text-lg font-bold text-indigo-200 uppercase tracking-wider">Shukla Paksha</h3>
          <span className="text-xs text-slate-500 font-mono">(Waxing Phase)</span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {shuklaTithis.map((t) => (
            <button
              key={`shukla-${t.i}`}
              onClick={() => onSelect(t.targetAngle)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                isActive(t.targetAngle)
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-indigo-200 hover:border-indigo-500/50'
              }`}
            >
              <span className="block text-[10px] opacity-50 mb-0.5">{t.i}</span>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Krishna Paksha Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400"></div>
          <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Krishna Paksha</h3>
          <span className="text-xs text-slate-500 font-mono">(Waning Phase)</span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {krishnaTithis.map((t) => (
            <button
              key={`krishna-${t.i}`}
              onClick={() => onSelect(t.targetAngle)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                isActive(t.targetAngle)
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg scale-105'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-purple-200 hover:border-purple-500/50'
              }`}
            >
              <span className="block text-[10px] opacity-50 mb-0.5">{t.i}</span>
              {t.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TithiSelector;
