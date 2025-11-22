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
  const sunOrbitRadius = 120; // Distance of Sun for visual scaling
  const angleArcRadius = 40;  // Radius for the angle visualization wedge
  
  // Convert elongation angle to spatial position
  // Elongation 0 = New Moon = Between Sun and Earth.
  // Sun is at Left (x < 150). Earth is Center (x=150).
  // Formula: x = cx - R * cos(angle), y = cy + R * sin(angle)
  const rad = (angle * Math.PI) / 180;
  const moonX = cx - orbitRadius * Math.cos(rad);
  const moonY = cy + orbitRadius * Math.sin(rad);

  // Angle Arc Calculation
  // We draw an arc from the Sun vector (Left) to the Moon vector.
  // Start point (Sun side): on the left of Earth
  const arcStartX = cx - angleArcRadius; 
  const arcStartY = cy;
  
  // End point (Moon side):
  const arcEndX = cx - angleArcRadius * Math.cos(rad);
  const arcEndY = cy + angleArcRadius * Math.sin(rad);

  // Large Arc Flag: 1 if angle > 180, else 0
  const largeArcFlag = angle > 180 ? 1 : 0;

  // Text Position (Midpoint of the arc)
  // Half angle
  const halfRad = (angle / 2) * Math.PI / 180;
  const textRadius = angleArcRadius + 20;
  const textX = cx - textRadius * Math.cos(halfRad);
  const textY = cy + textRadius * Math.sin(halfRad);

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
    
    const dx = x - cx;
    const dy = y - cy;
    const pointerRad = Math.atan2(dy, dx);
    
    let pointerDeg = (pointerRad * 180) / Math.PI;
    let newElongation = 180 - pointerDeg;
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
           <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
             <path d="M 0 0 L 6 3 L 0 6 Z" fill="#64748b" />
           </marker>
        </defs>

        {/* --- SUN ORBIT PATH --- */}
        <circle 
            cx={cx} cy={cy} r={sunOrbitRadius} 
            fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" 
        />

        {/* --- ANGLE VISUALIZATION (The Wedge) --- */}
        {angle > 0 && (
          <>
            {/* The Arc Path: Start Left, Sweep Counter-Clockwise (0 flag in SVG for negative dir, but logic maps correct here) */}
            <path 
              d={`M ${arcStartX} ${arcStartY} A ${angleArcRadius} ${angleArcRadius} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`}
              fill="rgba(251, 191, 36, 0.1)"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Angle Text */}
            <text 
              x={textX} 
              y={textY} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#fbbf24" 
              fontSize="11" 
              fontWeight="bold"
              className="pointer-events-none select-none drop-shadow-md"
            >
              {angle.toFixed(1)}°
            </text>
          </>
        )}

        {/* --- SUN --- */}
        <g transform={`translate(${cx - sunOrbitRadius}, ${cy})`}>
            <g stroke="#fbbf24" strokeWidth="2" opacity="0.6">
               {[...Array(12)].map((_, i) => (
                   <line key={i} x1="0" y1="0" x2="25" y2="0" transform={`rotate(${i * 30}) translate(15,0)`} />
               ))}
            </g>
            <circle r="18" fill="url(#sunBody)" filter="url(#sunGlowFilter)" />
        </g>

        {/* Orbit Path (Moon) */}
        <circle cx={cx} cy={cy} r={orbitRadius} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

        {/* --- EARTH --- */}
        <g transform={`translate(${cx}, ${cy})`}>
             <path d="M 0 -20 A 20 20 0 0 1 0 20 Z" fill="#0f172a" />
             <path d="M 0 -20 A 20 20 0 0 0 0 20 Z" fill="#3b82f6" />
             <circle r="20" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.5" />
             <text x="0" y="35" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500" className="pointer-events-none select-none">Earth</text>
        </g>

        {/* --- MOON --- */}
        <g transform={`translate(${moonX}, ${moonY})`} className="transition-transform duration-75">
             {/* Moon Shadow (Right) */}
             <path d="M 0 -10 A 10 10 0 0 1 0 10 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.5" />
             {/* Moon Lit (Left) */}
             <path d="M 0 -10 A 10 10 0 0 0 0 10 Z" fill="#f1f5f9" />
             
             <circle r="18" fill="transparent" stroke={isDragging ? "#818cf8" : "transparent"} strokeWidth="2" strokeDasharray="2 2" className="hover:stroke-indigo-500/50 transition-colors" />
        </g>

        {/* Lines to Center (Visual Aid for Angle) */}
        <line x1={cx} y1={cy} x2={cx - sunOrbitRadius + 20} y2={cy} stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
        <line x1={cx} y1={cy} x2={moonX} y2={moonY} stroke="#64748b" strokeWidth="1" opacity="0.2" pointerEvents="none" />
        
        {!isDragging && (
            <circle cx={moonX} cy={moonY} r="30" fill="transparent" cursor="pointer" />
        )}

      </svg>
    </div>
  );
};

export default OrbitRender;