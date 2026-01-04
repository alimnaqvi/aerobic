export type WorkoutType = string;
export const DEFAULT_WORKOUT_TYPES = ['Cycling', 'Treadmill'];

export type Zone = 'Zone 2' | 'Zone 5';

export interface WorkoutLog {
  id: string;
  date: string; // ISO string
  type: WorkoutType;
  zone: Zone;
  durationMinutes: number;
  watts?: number;
  distanceKm?: number;
  heartRate?: number;
  calories?: number;
  incline?: number;
  notes?: string;
  tempo?: string; // e.g., "7'35""
  speed?: number; // km/h
  bodyWeightKg?: number;
}
