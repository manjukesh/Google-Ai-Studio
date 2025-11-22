import React, { useState, useEffect, useRef } from 'react';
import MoonRender from './components/MoonRender';
import OrbitRender from './components/OrbitRender';
import ControlPanel from './components/ControlPanel';
import { getTithiFromAngle, getDateFromAngle, getAngleFromDate } from './utils/moonMath';
import { TithiInfo, Paksha } from './types';
import { TITHI_MEANINGS } from './constants';
import { Calendar, RotateCcw, Layers, Zap } from 'lucide-react';

const App: React.FC = () => {
  // Master state is the Angle (Elongation).
  // 0 = Amavasya, 180 = Purnima, 360 = Amavasya
  const [angle, setAngle] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [complexityLevel, setComplexityLevel] = useState<'basic' | 'advanced'>('basic');
  
  // Derived state
  const [tithi, setTithi] = useState<TithiInfo | null>(null);
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const requestRef = useRef<number>(0);

  // Initialize: Sync Angle with "Now" on mount
  useEffect(() => {
    const now = new Date();
    setDate(now);
    const initialAngle = getAngleFromDate(now);
    setAngle(initialAngle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Logic: When Angle Changes -> Update Date & Tithi
  useEffect(() => {
    setTithi(getTithiFromAngle(angle));
  }, [angle]);

  // Handler: When Slider/Buttons change Angle
  const handleAngleChange = (newAngle: number) => {
    // Normalize
    const normalized = (newAngle % 360 + 360) % 360;
    setAngle(normalized);
    
    // Update Date based on this new theoretical angle relative to reference
    const newDate = getDateFromAngle(normalized);
    setDate(newDate);
  };

  // Handler: When Date Picker changes Date
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    // Calculate angle from this specific date
    const newAngle = getAngleFromDate(newDate);
    setAngle(newAngle);
  };

  // Animation Loop
  const animate = () => {
    setAngle(prevAngle => {
      const nextAngle = (prevAngle + 0.5) % 360; // Speed of animation
      setDate(getDateFromAngle(nextAngle));
      return nextAngle;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleReset = () => {
    const now = new Date();
    handleDateChange(now);
    setIsPlaying(false);
  };

  // Helper to format date for input (YYYY-MM-DD) using local time
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Background gradient based on Paksha (Subtle)
  const bgGradient = tithi?.paksha === Paksha.Shukla 
    ? 'from-slate-900 via-indigo-950 to-slate-900' 
    : 'from-slate-950 via-purple-950 to-black';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} text-white transition-colors duration-1000 flex flex-col items-center py-6 px-4 relative overflow-hidden`}>
      
      {/* Header */}
      <header className="text-center mb-4 z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-400 font-serif">
          Moon Phase Simulator
        </h1>
      </header>

      {/* Unified Control Bar (Top) */}
      <div className="w-full max-w-5xl z-20 mb-8 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Date & Reset */}
        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 w-full lg:w-auto justify-center">
            <div className="flex items-center gap-2 text-indigo-300 border-r border-slate-600 pr-3">
                <Calendar className="w-4 h-4" />
            </div>
            <input 
                type="date" 
                value={formatDateForInput(date)}
                onChange={(e) => e.target.value && handleDateChange(new Date(e.target.value))}
                className="bg-transparent text-white text-sm font-mono focus:outline-none w-28 sm:w-auto"
            />
            <button 
                onClick={handleReset}
                className="ml-2 p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset to Today"
            >
                <RotateCcw className="w-3.5 h-3.5" />
            </button>
        </div>

        {/* Center: Playback & Slider */}
        <div className="flex-1 w-full lg:w-auto">
             <ControlPanel 
              angle={angle}
              setAngle={handleAngleChange}
              onAutoPlay={togglePlay}
              isPlaying={isPlaying}
            />
        </div>

        {/* Right: Level Toggle */}
        <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-full lg:w-auto justify-center">
          <button
            onClick={() => setComplexityLevel('basic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${complexityLevel === 'basic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-300'}`}
          >
            <Layers className="w-3 h-3" /> Level 1
          </button>
          <button
            onClick={() => setComplexityLevel('advanced')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${complexityLevel === 'advanced' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-purple-300'}`}
          >
            <Zap className="w-3 h-3" /> Level 2
          </button>
        </div>
      </div>

      {/* Main Visual Grid: Parallel Views */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 mb-10">
        
        {/* Earth View Card */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
            <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-slate-200">Earth Perspective</h2>
            </div>

            <div className="relative group w-full flex justify-center items-center py-4">
                <div className="absolute bg-indigo-500/10 rounded-full w-64 h-64 blur-3xl"></div>
                <MoonRender angle={angle} />
            </div>

            <div className="text-center mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Angle between Sun & Moon</p>
                <p className="text-xl font-mono text-indigo-300">{angle.toFixed(1)}°</p>
            </div>

            <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-indigo-300">{tithi?.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${tithi?.paksha === Paksha.Shukla ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'}`}>
                     {tithi?.paksha} Paksha
                   </span>
                </div>
                <p className="text-slate-400 text-sm italic border-t border-slate-700/50 pt-2">
                  {TITHI_MEANINGS[tithi?.name || ""]}
                </p>
            </div>
        </div>

        {/* Space View Card */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
             <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-slate-200">Space Perspective</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {complexityLevel === 'basic' ? 'Drag Moon to Change Phase' : 'Drag Moon | Align Nodes for Eclipse'}
                </p>
            </div>

            <div className="relative w-full flex justify-center items-center py-4">
               <OrbitRender 
                  angle={angle} 
                  onAngleChange={handleAngleChange} 
                  level={complexityLevel}
               />
            </div>

            {/* Stats Grid */}
            <div className="mt-4 w-full grid grid-cols-2 gap-3">
               <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Elongation</span>
                  <span className="text-lg font-mono text-indigo-400">{angle.toFixed(1)}°</span>
               </div>
               <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Illumination</span>
                  <span className="text-lg font-mono text-purple-400">
                    {((1 - Math.cos(angle * Math.PI / 180)) / 2 * 100).toFixed(0)}%
                  </span>
               </div>
               <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Tithi Number</span>
                  <span className="text-sm text-slate-300">
                     {tithi?.index} of 30 <span className="text-slate-500 mx-1">|</span> {tithi?.index <= 15 ? tithi?.index : tithi?.index - 15} of Paksha
                  </span>
               </div>
            </div>
        </div>

      </main>

      <div className="mt-auto text-slate-600 text-xs pb-4">
         © {new Date().getFullYear()} Chandra Krama.
      </div>
    </div>
  );
};

export default App;