import React from 'react';

interface MoonRenderProps {
  angle: number; // 0 to 360
}

const MoonRender: React.FC<MoonRenderProps> = ({ angle }) => {
  const normalizedAngle = (angle % 360 + 360) % 360;
  
  // Radius of moon
  const r = 100;
  const cx = 150;
  const cy = 150;
  
  const isWaxing = normalizedAngle <= 180;
  const radians = (normalizedAngle * Math.PI) / 180;
  
  // Calculate terminator X for phase geometry
  // terminatorX goes from -100 to 100 based on phase
  // But we need to construct the path for the LIT part.
  const sweep = isWaxing ? 1 : 0; 
  
  // Path for the lit section
  // 1. Outer Arc: The rim of the moon (always a semicircle on the lit side)
  const outerArc = `M 150,50 A 100,100 0 0,${sweep} 150,250`;
  
  // 2. Inner Terminator: Elliptical arc
  const rx = Math.abs(r * Math.cos(radians));
  let termSweep = 0;
  if (isWaxing) {
      termSweep = normalizedAngle < 90 ? 0 : 1; 
  } else {
      termSweep = normalizedAngle < 270 ? 0 : 1;
  }
  
  const d = `${outerArc} A ${rx},100 0 0,${termSweep} 150,50 Z`;

  // New Moon specific logic to ensure complete darkness at 0/360
  const isNewMoon = normalizedAngle < 1 || normalizedAngle > 359;
  const isFullMoon = Math.abs(normalizedAngle - 180) < 1;

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
      <defs>
        {/* 1. Texture Filter: Creates rocky noise */}
        <filter id="moonTexture">
           <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
           <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="2">
             <feDistantLight azimuth="45" elevation="60" />
           </feDiffuseLighting>
           <feComposite operator="in" in2="SourceGraphic"/>
        </filter>

        {/* 2. Glow Filter */}
        <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
        </filter>

        {/* 3. The "Real" Moon Surface Pattern */}
        <pattern id="moonSurfacePattern" x="0" y="0" width="1" height="1" viewBox="0 0 300 300">
            {/* Base Gray */}
            <rect width="300" height="300" fill="#d1d5db" />
            
            {/* Apply Noise Texture */}
            <rect width="300" height="300" filter="url(#moonTexture)" opacity="0.5"/>

            {/* Craters / Maria (The "Man in the Moon" approximate shapes) */}
            {/* Mare Imbrium */}
            <circle cx="110" cy="100" r="25" fill="#9ca3af" opacity="0.6" filter="blur(2px)" />
            {/* Mare Serenitatis */}
            <ellipse cx="170" cy="100" rx="22" ry="20" fill="#9ca3af" opacity="0.6" filter="blur(2px)" />
            {/* Mare Tranquillitatis */}
            <ellipse cx="200" cy="130" rx="25" ry="22" fill="#94a3b8" opacity="0.7" filter="blur(2px)" />
            {/* Oceanus Procellarum */}
            <ellipse cx="80" cy="150" rx="35" ry="50" fill="#9ca3af" opacity="0.5" filter="blur(3px)" />
            {/* Mare Crisium */}
            <circle cx="235" cy="115" r="12" fill="#64748b" opacity="0.6" filter="blur(1px)" />
            {/* Tycho Crater (Bright spot with rays) */}
            <circle cx="140" cy="230" r="6" fill="#f3f4f6" opacity="0.8" />
        </pattern>
        
        {/* 4. Clip Path for the Phase */}
        <clipPath id="phaseClip">
           <path d={d} />
        </clipPath>
      </defs>
      
      {/* Background: Earthshine (Dark side of moon) */}
      {/* Slightly visible texture for realism, very dark */}
      <circle cx="150" cy="150" r="100" fill="#1e293b" />
      <circle cx="150" cy="150" r="100" fill="url(#moonSurfacePattern)" opacity="0.1" />
      <circle cx="150" cy="150" r="100" fill="black" opacity="0.7" /> {/* Shadow overlay */}
      
      {/* Foreground: The Lit Part */}
      {!isNewMoon && (
        <g clipPath="url(#phaseClip)">
           {/* The Moon Texture */}
           <circle cx="150" cy="150" r="100" fill="url(#moonSurfacePattern)" />
           
           {/* Slight inner shadow to soften terminator edge */}
           <circle cx="150" cy="150" r="100" fill="transparent" stroke="black" strokeWidth="2" opacity="0.2"/>
        </g>
      )}

      {/* Full Moon Glow Overlay (only near 100%) */}
      {isFullMoon && (
          <circle cx="150" cy="150" r="100" fill="white" opacity="0.1" filter="blur(10px)" />
      )}

      {/* Decor Ring */}
      <circle cx="150" cy="150" r="102" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
      
      {/* Text Label */}
      <text x="150" y="285" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold" className="select-none font-mono">
        {normalizedAngle.toFixed(1)}°
      </text>
    </svg>
  );
};

export default MoonRender;