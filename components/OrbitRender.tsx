import React, { useRef, useState } from 'react';

interface OrbitRenderProps {
  angle: number;
  onAngleChange?: (newAngle: number) => void;
  level: 'basic' | 'advanced';
}

const OrbitRender: React.FC<OrbitRenderProps> = ({ angle, onAngleChange, level }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // For Level 2: Node Offset allows user to align/misalign eclipses
  const [nodeOffset, setNodeOffset] = useState(90); // Start misaligned

  const cx = 150;
  const cy = 150;
  const orbitRadius = 90;
  const sunOrbitRadius = 120; 
  const angleArcRadius = 40;
  
  // --- MATHS ---
  const rad = (angle * Math.PI) / 180;
  
  // 1. Top View Position (X, Y)
  const moonX = cx - orbitRadius * Math.cos(rad);
  const moonY = cy + orbitRadius * Math.sin(rad);

  // 2. Side View Calculation (Vertical Tilt / Latitude)
  // Max inclination of moon is ~5.14 degrees.
  // We simulate this with a sine wave based on the node offset.
  // Latitude = MaxTilt * sin(Angle - NodeAngle)
  const maxTilt = 25; // Visual scale pixels, not degrees
  const nodeRad = (nodeOffset * Math.PI) / 180;
  // Using sine gives us a wave: 0 at Node, Max at 90 deg from Node.
  const verticalOffset = maxTilt * Math.sin(rad - nodeRad);

  // --- ECLIPSE DETECTION ---
  // Solar Eclipse: Angle ~ 0 (New Moon) AND VerticalOffset ~ 0
  // Lunar Eclipse: Angle ~ 180 (Full Moon) AND VerticalOffset ~ 0
  const isNewMoon = angle > 350 || angle < 10;
  const isFullMoon = angle > 170 && angle < 190;
  const isAligned = Math.abs(verticalOffset) < 5; // Within visual threshold

  let eclipseState = '';
  if (isNewMoon && isAligned) eclipseState = 'SOLAR ECLIPSE';
  if (isFullMoon && isAligned) eclipseState = 'LUNAR ECLIPSE';

  // --- INTERACTION ---
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onAngleChange) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateAngleFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !onAngleChange) return;
    updateAngleFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const updateAngleFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - cx;
    const dy = y - cy;
    const pointerRad = Math.atan2(dy, dx);
    
    let pointerDeg = (pointerRad * 180) / Math.PI;
    let newElongation = 180 - pointerDeg;
    newElongation = (newElongation + 360) % 360;
    
    onAngleChange && onAngleChange(newElongation);
  };

  // Angle Arc helpers
  const arcStartX = cx - angleArcRadius; 
  const arcStartY = cy;
  const arcEndX = cx - angleArcRadius * Math.cos(rad);
  const arcEndY = cy + angleArcRadius * Math.sin(rad);
  const largeArcFlag = angle > 180 ? 1 : 0;
  const halfRad = (angle / 2) * Math.PI / 180;
  const textRadius = angleArcRadius + 20;
  const textX = cx - textRadius * Math.cos(halfRad);
  const textY = cy + textRadius * Math.sin(halfRad);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      
      {/* --- VIEW 1: TOP DOWN (ORBIT) --- */}
      <svg 
        ref={svgRef}
        width="300" 
        height="300" 
        viewBox="0 0 300 300" 
        className={`rounded-full border border-slate-700/50 shadow-2xl backdrop-blur-sm touch-none cursor-crosshair ${isDragging ? 'cursor-grabbing' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
           <radialGradient id="sunBody" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
           </radialGradient>
           <filter id="sunGlowFilter">
             <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
             <feMerge>
               <feMergeNode in="coloredBlur"/>
               <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
        </defs>

        {/* Sun Orbit */}
        <circle cx={cx} cy={cy} r={sunOrbitRadius} fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />

        {/* Angle Arc */}
        {angle > 0 && (
          <>
            <path 
              d={`M ${arcStartX} ${arcStartY} A ${angleArcRadius} ${angleArcRadius} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`}
              fill="rgba(251, 191, 36, 0.1)"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle" fill="#fbbf24" fontSize="11" fontWeight="bold" className="pointer-events-none select-none drop-shadow-md">
              {angle.toFixed(1)}°
            </text>
          </>
        )}

        {/* SUN */}
        <g transform={`translate(${cx - sunOrbitRadius}, ${cy})`}>
            <g stroke="#fbbf24" strokeWidth="2" opacity="0.6">
               {[...Array(12)].map((_, i) => (
                   <line key={i} x1="0" y1="0" x2="25" y2="0" transform={`rotate(${i * 30}) translate(15,0)`} />
               ))}
            </g>
            <circle r="18" fill="url(#sunBody)" filter="url(#sunGlowFilter)" />
        </g>

        {/* Moon Orbit Path */}
        <circle cx={cx} cy={cy} r={orbitRadius} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

        {/* Level 2: Show Nodes on Orbit Path */}
        {level === 'advanced' && (
           <g transform={`translate(${cx},${cy}) rotate(${nodeOffset})`}>
              <line x1={-orbitRadius - 10} y1="0" x2={orbitRadius + 10} y2="0" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
              <text x={orbitRadius + 15} y="4" fontSize="10" fill="#ef4444" className="select-none">Rahu</text>
              <text x={-orbitRadius - 35} y="4" fontSize="10" fill="#ef4444" className="select-none">Ketu</text>
           </g>
        )}

        {/* EARTH */}
        <g transform={`translate(${cx}, ${cy})`}>
             <path d="M 0 -20 A 20 20 0 0 1 0 20 Z" fill="#0f172a" />
             <path d="M 0 -20 A 20 20 0 0 0 0 20 Z" fill="#3b82f6" />
             <circle r="20" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.5" />
             <text x="0" y="35" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500" className="pointer-events-none select-none">Earth</text>
        </g>

        {/* MOON */}
        <g transform={`translate(${moonX}, ${moonY})`} className="transition-transform duration-75">
             <path d="M 0 -10 A 10 10 0 0 1 0 10 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.5" />
             <path d="M 0 -10 A 10 10 0 0 0 0 10 Z" fill="#f1f5f9" />
             <circle r="18" fill="transparent" stroke={isDragging ? "#818cf8" : "transparent"} strokeWidth="2" strokeDasharray="2 2" />
        </g>

        {/* Level 2: Warning if Eclipse */}
        {level === 'advanced' && eclipseState && (
           <text x="150" y="150" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold" className="animate-pulse drop-shadow-lg bg-black/50">
              {eclipseState}
           </text>
        )}
      </svg>

      {/* --- VIEW 2: SIDE VIEW (LEVEL 2 ONLY) --- */}
      {level === 'advanced' && (
        <div className="w-full max-w-[300px] bg-slate-900/50 rounded-xl border border-slate-700 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase">Ecliptic Plane (Side View)</h3>
             {eclipseState && <span className="text-xs font-bold text-red-400 animate-pulse">{eclipseState}</span>}
          </div>

          <svg width="100%" height="100" viewBox="0 0 300 100" className="overflow-visible">
             
             {/* The Ecliptic Line (Earth-Sun Plane) */}
             <line x1="0" y1="50" x2="300" y2="50" stroke="#475569" strokeWidth="1" />
             
             {/* Shadow Zones */}
             {/* Earth Shadow (Right) */}
             <path d="M 150 50 L 300 30 L 300 70 Z" fill="#000" opacity="0.3" />
             
             {/* Sun (Far Left, offscreen mostly, represented by rays) */}
             <defs>
               <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                 <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
               </linearGradient>
             </defs>
             <rect x="0" y="40" width="140" height="20" fill="url(#sunRay)" />

             {/* Earth (Center) */}
             <circle cx="150" cy="50" r="12" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" />

             {/* Moon (Bobbing up and down) */}
             {/* X position determines if it's between Sun/Earth or Behind Earth */}
             {/* In Top View: cos(rad) determines X. -1 is Right (Full), 1 is Left (New) relative to center.
                 Wait, our setup: Sun is LEFT (x < 150). 
                 TopView: MoonX = cx - R*cos. 
                 If Angle=0 (New), cos=1, MoonX = 150 - 90 = 60 (Left/Sun side).
                 If Angle=180 (Full), cos=-1, MoonX = 150 + 90 = 240 (Right/Shadow side).
             */}
             <g transform={`translate(${moonX}, ${50 - verticalOffset})`}>
                <line x1="0" y1="0" x2={150 - moonX} y2={verticalOffset} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <circle r="8" fill="#f1f5f9" stroke="#0f172a" strokeWidth="1" />
             </g>

             {/* Text Labels */}
             <text x="20" y="90" fontSize="10" fill="#fbbf24">Sun Direction</text>
             <text x="250" y="90" fontSize="10" fill="#94a3b8">Earth Shadow</text>
          </svg>

          {/* Node Control Slider */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-1">
               <span>Align Nodes</span>
               <span>{isAligned ? 'ALIGNED' : 'MISALIGNED'}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="180" 
              value={nodeOffset} 
              onChange={(e) => setNodeOffset(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
              Adjust orbital tilt alignment. Eclipses only occur when Moon is aligned (crossing the line) during Full or New phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrbitRender;