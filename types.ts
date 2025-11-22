export enum Paksha {
  Shukla = 'Shukla', // Waxing
  Krishna = 'Krishna', // Waning
}

export interface TithiInfo {
  index: number;
  name: string;
  paksha: Paksha;
  startDegree: number;
  endDegree: number;
  description: string;
}

export interface MoonState {
  elongation: number; // 0 to 360 degrees
  date: Date;
}
