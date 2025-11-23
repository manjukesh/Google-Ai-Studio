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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-xl p-6 shadow-lg">
      
      {/* Shukla Paksha Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-slate-600/50 pb-3">
          <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
          <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Shukla Paksha</h3>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {shuklaTithis.map((t) => (
            <button
              key={`shukla-${t.i}`}
              onClick={() => onSelect(t.targetAngle)}
              className={`px-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all border truncate ${
                isActive(t.targetAngle)
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105 ring-1 ring-indigo-300'
                  : 'bg-slate-800/80 border-slate-600 text-slate-50 hover:bg-slate-700 hover:text-white hover:border-indigo-400'
              }`}
              title={t.name}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Krishna Paksha Column */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-slate-600/50 pb-3">
          <div className="w-3 h-3 rounded-full bg-slate-400 border border-slate-200"></div>
          <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">Krishna Paksha</h3>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {krishnaTithis.map((t) => (
            <button
              key={`krishna-${t.i}`}
              onClick={() => onSelect(t.targetAngle)}
              className={`px-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all border truncate ${
                isActive(t.targetAngle)
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg scale-105 ring-1 ring-purple-300'
                  : 'bg-slate-800/80 border-slate-600 text-slate-50 hover:bg-slate-700 hover:text-white hover:border-purple-400'
              }`}
              title={t.name}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TithiSelector;