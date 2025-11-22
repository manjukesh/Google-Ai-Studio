import React, { useRef, useState } from 'react';

interface OrbitRenderProps {
  angle: number;
  onAngleChange?: (newAngle: number) => void;
}

const OrbitRender: React.FC<OrbitRenderProps> = ({ angle, onAngleChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cx = 150;
  const cy = 150;
  const orbitRadius = 90;
  const sunOrbitRadius = 120; // Distance of Sun for visual scaling (not to scale)
  
  // Convert elongation angle to spatial position
  // Elongation 0 = New Moon = Between Sun and Earth.
  // Sun is at Left (x=30). Earth is Center (x=150).
  // So 0 deg means Moon is at Left of Earth (x=60).
  // 180 deg means Moon is at Right of Earth (x=240).
  // Formula: x = cx - R * cos(angle), y = cy + R * sin(angle)
  const rad = (angle * Math.PI) / 180;
  const moonX = cx - orbitRadius * Math.cos(rad);
  const moonY = cy + orbitRadius * Math.sin(rad);

  // Interaction Logic
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
    
    // Calculate angle from center (Earth) to pointer
    // Math.atan2(dy, dx) returns radians from -PI to +PI relative to positive X axis (Right).
    // 0 rad = Right, PI rad = Left.
    const dx = x - cx;
    const dy = y - cy;
    const pointerRad = Math.atan2(dy, dx);
    
    // Convert standard polar angle to our "Elongation" angle.
    // In our system:
    // New Moon (0 deg Elongation) is at Left. (Standard Polar PI)
    // Full Moon (180 deg Elongation) is at Right. (Standard Polar 0)
    // Elongation = 180 - StandardDegrees
    
    let pointerDeg = (pointerRad * 180) / Math.PI;
    // pointerDeg is -180 to 180.
    // if pointerDeg is 180 (Left), Elongation should be 0.
    // if pointerDeg is 0 (Right), Elongation should be 180.
    // if pointerDeg is -90 (Top), Elongation should be 270.
    
    let newElongation = 180 - pointerDeg;
    
    // Normalize to 0-360
    newElongation = (newElongation + 360) % 360;
    
    onAngleChange && onAngleChange(newElongation);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
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

        {/* --- SUN ORBIT PATH --- */}
        <circle 
            cx={cx} cy={cy} r={sunOrbitRadius} 
            fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" 
        />

        {/* --- SUN --- */}
        {/* Positioned at Left (cx - sunOrbitRadius) to simulate Sun's position relative to fixed Earth-Sun line in synodic view */}
        <g transform={`translate(${cx - sunOrbitRadius}, ${cy})`}>
            {/* Rays */}
            <g stroke="#fbbf24" strokeWidth="2" opacity="0.6">
               {[...Array(12)].map((_, i) => (
                   <line key={i} x1="0" y1="0" x2="25" y2="0" transform={`rotate(${i * 30}) translate(15,0)`} />
               ))}
            </g>
            {/* Sun Body */}
            <circle r="18" fill="url(#sunBody)" filter="url(#sunGlowFilter)" />
        </g>

        {/* Orbit Path (Moon) */}
        <circle cx={cx} cy={cy} r={orbitRadius} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

        {/* --- EARTH --- */}
        <g transform={`translate(${cx}, ${cy})`}>
             {/* Earth Shadow (Right side, away from Sun) */}
             <path d="M 0 -20 A 20 20 0 0 1 0 20 Z" fill="#0f172a" />
             {/* Earth Lit (Left side, facing Sun) */}
             <path d="M 0 -20 A 20 20 0 0 0 0 20 Z" fill="#3b82f6" />
             {/* Atmosphere glow */}
             <circle r="20" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.5" />
             <text x="0" y="35" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500" className="pointer-events-none select-none">Earth</text>
        </g>

        {/* --- MOON --- */}
        <g transform={`translate(${moonX}, ${moonY})`} className="transition-transform duration-75">
             {/* Moon Shadow (Right) */}
             <path d="M 0 -10 A 10 10 0 0 1 0 10 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.5" />
             {/* Moon Lit (Left) */}
             <path d="M 0 -10 A 10 10 0 0 0 0 10 Z" fill="#f1f5f9" />
             
             {/* Hover/Active Ring */}
             <circle r="18" fill="transparent" stroke={isDragging ? "#818cf8" : "transparent"} strokeWidth="2" strokeDasharray="2 2" className="hover:stroke-indigo-500/50 transition-colors" />
        </g>

        {/* Connection Line (Visual Aid) */}
        <line x1={cx} y1={cy} x2={moonX} y2={moonY} stroke="#64748b" strokeWidth="1" opacity="0.15" pointerEvents="none" />
        
        {/* Interaction Hint (Only if not dragging) */}
        {!isDragging && (
            <circle cx={moonX} cy={moonY} r="30" fill="transparent" cursor="pointer" />
        )}

      </svg>
    </div>
  );
};

export default OrbitRender;