import { Paksha } from './types';

// Average synodic month in days
export const SYNODIC_MONTH_DAYS = 29.53059;
export const DEGREES_PER_DAY = 360 / SYNODIC_MONTH_DAYS; // approx 12.19 degrees
export const DEGREES_PER_TITHI = 12;

// Reference New Moon (Amavasya) for calculation anchoring
// Example: Jan 11, 2024 was a New Moon
export const REFERENCE_NEW_MOON = new Date('2024-01-11T11:57:00Z');

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

export const TITHI_MEANINGS: Record<string, string> = {
  "Pratipada": "The first step. Good for planning.",
  "Dwitiya": "The second. Growth and perception.",
  "Tritiya": "The third. Power and drive.",
  "Chaturthi": "The fourth. Obstacles and overcoming.",
  "Panchami": "The fifth. Healing and auspiciousness.",
  "Shashthi": "The sixth. Victory and fame.",
  "Saptami": "The seventh. Health and friendship.",
  "Ashtami": "The eighth. Conflict and defense.",
  "Navami": "The ninth. Aggressive energies.",
  "Dashami": "The tenth. Virtue and conduct.",
  "Ekadashi": "The eleventh. Fasting and devotion.",
  "Dwadashi": "The twelfth. Renunciation and charity.",
  "Trayodashi": "The thirteenth. Pradosham, dissolving karma.",
  "Chaturdashi": "The fourteenth. Intense energy.",
  "Purnima": "Full Moon. Completeness, high energy.",
  "Amavasya": "New Moon. Ancestors, rest, new beginnings."
};
