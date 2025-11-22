import { DEGREES_PER_TITHI, TITHI_NAMES, SYNODIC_MONTH_DAYS, REFERENCE_NEW_MOON } from '../constants';
import { Paksha, TithiInfo } from '../types';

/**
 * Calculates the Tithi information based on the elongation angle (0-360).
 */
export const getTithiFromAngle = (angle: number): TithiInfo => {
  // Normalize angle 0-360
  const normalizedAngle = (angle % 360 + 360) % 360;
  
  // Tithi calculation (1-30)
  // 0-12 is Tithi 1, 12-24 is Tithi 2, etc.
  const tithiNumber = Math.floor(normalizedAngle / DEGREES_PER_TITHI) + 1;
  
  let paksha: Paksha;
  let nameIndex: number;
  let name: string;

  if (normalizedAngle < 180) {
    paksha = Paksha.Shukla;
    nameIndex = tithiNumber - 1; // 0 to 14
    if (nameIndex === 14) name = "Purnima"; // Special case for 15th Shukla
    else name = TITHI_NAMES[nameIndex];
  } else {
    paksha = Paksha.Krishna;
    nameIndex = tithiNumber - 16; // 0 to 14
    if (nameIndex === 14) name = "Amavasya"; // Special case for 30th Tithi (15th Krishna)
    else name = TITHI_NAMES[nameIndex];
  }

  // Handle edge cases for Purnima/Amavasya in array mapping
  if (normalizedAngle >= 168 && normalizedAngle < 180) name = "Purnima";
  if (normalizedAngle >= 348 || normalizedAngle < 0) name = "Amavasya";

  return {
    index: tithiNumber,
    name,
    paksha,
    startDegree: (tithiNumber - 1) * DEGREES_PER_TITHI,
    endDegree: tithiNumber * DEGREES_PER_TITHI,
    description: `The ${name} of ${paksha} Paksha`
  };
};

/**
 * Calculates the target date based on the current angle relative to a reference New Moon.
 * This is a simplified "Mean Synodic" calculation for simulation purposes.
 */
export const getDateFromAngle = (angle: number): Date => {
    // Current time diff from reference
    // We want the 'current' date to reflect the angle within the CURRENT cycle relative to today, 
    // or just project a theoretical date from the Reference epoch.
    
    // For a simulator, it's better to act as an infinite scroll. 
    // Let's assume the user is manipulating a date roughly around "Now" or just mapping pure math.
    
    // Strategy: Find the cycle count from reference to now to keep date realistic
    const now = new Date();
    const diffTime = now.getTime() - REFERENCE_NEW_MOON.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const cycles = Math.floor(diffDays / SYNODIC_MONTH_DAYS);
    
    // Start of the current cycle
    const currentCycleStartDays = cycles * SYNODIC_MONTH_DAYS;
    
    // Days added by angle
    const daysInCycle = (angle / 360) * SYNODIC_MONTH_DAYS;
    
    const targetDaysFromRef = currentCycleStartDays + daysInCycle;
    
    const targetDate = new Date(REFERENCE_NEW_MOON.getTime() + targetDaysFromRef * 24 * 60 * 60 * 1000);
    return targetDate;
};

/**
 * Calculates the moon's elongation angle (0-360) for a specific date.
 */
export const getAngleFromDate = (date: Date): number => {
  const diffTime = date.getTime() - REFERENCE_NEW_MOON.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Modulo of the synodic month
  const daysIntoCycle = diffDays % SYNODIC_MONTH_DAYS;
  const positiveDays = (daysIntoCycle + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS; // Handle negative dates
  
  const angle = (positiveDays / SYNODIC_MONTH_DAYS) * 360;
  return angle;
};
