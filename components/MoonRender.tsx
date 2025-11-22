import React from 'react';

interface MoonRenderProps {
  angle: number; // 0 to 360
}

const MoonRender: React.FC<MoonRenderProps> = ({ angle }) => {
  // Normalize angle
  const normalizedAngle = (angle % 360 + 360) % 360;
  
  // Determine phase properties
  // 0 = New, 180 = Full, 360 = New
  // We need to draw the illuminated part.
  
  // Radius of moon
  const r = 100;
  const cx = 150;
  const cy = 150;
  
  // Calculate phase factor for the terminator curve
  // We project the terminator onto the 2D disk.
  // The terminator is an ellipse. 
  // x-radius of the terminator ellipse varies from -r to r.
  // cos(angle) goes from 1 (New) to -1 (Full) to 1 (New) -- wait, standard astro angle:
  // 0 deg = New Moon (Sun and Moon conjunct).
  // 180 deg = Full Moon (Opposition).
  
  // Let's use standard phase angle logic:
  // Phase 'p' from 0 (New) to 0.5 (Full) to 1 (New)
  // Actually, let's just stick to the geometry.
  // When angle < 180 (Waxing): Left side is dark, Right side fills up.
  // When angle > 180 (Waning): Right side goes dark, Left side remains lit (eventually shrinking).
  
  // Correction: 
  // Waxing (0-180): Light grows from Right to Left (Northern Hemisphere view roughly).
  // Actually, in Shukla paksha, the moon appears in the west after sunset, illuminated on the West side (towards Sun).
  // Visual conventions usually show Waxing Crescent on the Right.
  
  const isWaxing = normalizedAngle <= 180;
  
  // Calculate the width of the lit/unlit ellipse
  // Math.cos(radians) gives 1 at 0deg, -1 at 180deg.
  const radians = (normalizedAngle * Math.PI) / 180;
  
  // The "bulge" of the terminator. 
  // At 0 deg, bulge is -r (fully dark). 
  // At 90 deg, bulge is 0 (half).
  // At 180 deg, bulge is r (full).
  const terminatorX = -Math.cos(radians) * r; 
  
  // Constructing the SVG Path
  // Outer circle is always M cx,cy-r A r,r 0 1,1 cx,cy+r ...
  
  // We will draw the LIGHT part.
  // Start Top (cx, cy-r)
  // If Waxing (0-180):
  //   Outer arc is the RIGHT side (Always lit by definition of growing form? No, at 0 it's empty).
  //   Wait, simpler model:
  //   Base: Black Circle.
  //   Overlay: White Shape.
  
  // Path for Waxing (0 -> 180):
  //   Right semicircle is outer rim. 
  //   Terminator moves from Right to Left.
  //   Actually, strictly speaking:
  //   0-90:  Lit part is a crescent on the Right. Terminator is concave.
  //   90-180: Lit part is Gibbous on the Right. Terminator is convex.
  
  let d = "";
  
  // ViewBox 0 0 300 300
  // Top: 150, 50
  // Bottom: 150, 250
  
  if (normalizedAngle === 0 || normalizedAngle === 360) {
     // New Moon - All Dark
     return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-2xl">
            <circle cx="150" cy="150" r="100" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
            <text x="150" y="280" textAnchor="middle" fill="#64748b" fontSize="12">Amavasya (0°)</text>
        </svg>
     );
  }
  
  if (Math.abs(normalizedAngle - 180) < 1) {
      // Full Moon
      return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-[0_0_35px_rgba(255,255,255,0.6)]">
             <circle cx="150" cy="150" r="100" fill="#f8fafc" />
             <text x="150" y="280" textAnchor="middle" fill="#94a3b8" fontSize="12">Purnima (180°)</text>
        </svg>
      );
  }
  
  // Direction logic for Northern Hemisphere
  // Waxing: Lit on Right. Waning: Lit on Left.
  
  const sweep = isWaxing ? 1 : 0; // 1 for Right arc, 0 for Left arc
  
  // The outer rim of the lit part
  // M 150,50 A 100,100 0 0,sweep 150,250
  const outerArc = `M 150,50 A 100,100 0 0,${sweep} 150,250`;
  
  // The inner terminator
  // An elliptical arc from Bottom (150,250) back to Top (150,50)
  // The X-radius depends on the angle.
  // At 90 deg, X-radius is 0 (straight line).
  // At 45 deg, X-radius is roughly 0.707*r (concave).
  // At 135 deg, X-radius is roughly 0.707*r (convex).
  
  // We can use the 'terminatorX' calculated earlier as the radius control point?
  // SVG Arc command doesn't easily do semi-ellipses with calculated centers.
  // Better to use Cubic Bezier or Q for the terminator?
  // Or A rx,ry ...
  
  // Let's use Elliptical Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  // rx = absolute value of terminator width.
  // ry = 100.
  
  const rx = Math.abs(r * Math.cos(radians));
  
  // Sweep flag for terminator:
  // If Waxing (0-180):
  //   0-90: Concave (Lit is crescent). Terminator curves same direction as outer rim? No, opposite.
  //   90-180: Convex (Lit is gibbous). Terminator curves away.
  
  let termSweep = 0;
  if (isWaxing) {
      termSweep = normalizedAngle < 90 ? 0 : 1; 
  } else {
      // Waning
      // 180-270: Gibbous (Lit Left). Convex. 
      // 270-360: Crescent (Lit Left). Concave.
      termSweep = normalizedAngle < 270 ? 0 : 1;
  }
  
  d = `${outerArc} A ${rx},100 0 0,${termSweep} 150,50 Z`;

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="transition-all duration-300 ease-linear">
      <defs>
        <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="90%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
        <filter id="glow">
             <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
        </filter>
      </defs>
      
      {/* Background shadow circle */}
      <circle cx="150" cy="150" r="100" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      
      {/* Lit part */}
      <path d={d} fill="url(#moonGradient)" filter="url(#glow)" />
      
      {/* Visual Debug / Decor */}
      <circle cx="150" cy="150" r="102" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>

      <text x="150" y="280" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">
        {normalizedAngle.toFixed(1)}°
      </text>
    </svg>
  );
};

export default MoonRender;
