import React from 'react';
import { Play, Pause, ChevronRight, ChevronLeft } from 'lucide-react';

interface ControlPanelProps {
  angle: number;
  setAngle: (a: number) => void;
  onAutoPlay: () => void;
  isPlaying: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  angle, setAngle, onAutoPlay, isPlaying 
}) => {
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAngle(parseFloat(e.target.value));
  };

  const stepAngle = (amount: number) => {
    setAngle(angle + amount);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      
      {/* Controls */}
      <div className="flex items-center gap-2">
         <button 
           onClick={() => stepAngle(-12)} 
           className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition-colors"
           title="Previous Tithi (-12°)"
         >
            <ChevronLeft className="w-4 h-4" />
         </button>

         <button 
           onClick={onAutoPlay} 
           className={`w-24 ${isPlaying ? 'bg-red-500/80 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-full py-1.5 px-4 flex items-center justify-center transition-all font-semibold text-sm shadow-lg`}
         >
            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Stop' : 'Play'}
         </button>

         <button 
           onClick={() => stepAngle(12)} 
           className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition-colors"
           title="Next Tithi (+12°)"
         >
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>

      {/* Slider */}
      <div className="flex-1 w-full px-2 relative group">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest absolute -top-4 w-full px-1">
            <span>Amavasya</span>
            <span className="hidden sm:inline">Purnima</span>
            <span>Amavasya</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="360" 
          step="0.1" 
          value={angle} 
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-400 hover:accent-indigo-300 transition-all"
        />
      </div>

    </div>
  );
};

export default ControlPanel;