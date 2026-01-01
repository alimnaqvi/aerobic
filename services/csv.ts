import { WorkoutLog, WorkoutType, Zone } from '@/types/workout';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import { Platform } from 'react-native';
import { StorageService } from './storage';

const CSV_HEADER = [
  'id',
  'date',
  'type',
  'zone',
  'duration_min',
  'watts_avg',
  'distance_km',
  'heart_rate',
  'calories',
  'incline_percent',
  'body_weight_kg',
  'notes'
];

export const CsvService = {
  async exportWorkouts(): Promise<void> {
    try {
      const workouts = await StorageService.getWorkouts();
      
      const data = workouts.map(w => ({
        id: w.id,
        date: w.date,
        type: w.type,
        zone: w.zone,
        duration_min: w.durationMinutes,
        watts_avg: w.watts || '',
        distance_km: w.distanceKm || '',
        heart_rate: w.heartRate || '',
        calories: w.calories || '',
        incline_percent: w.incline || '',
        body_weight_kg: w.bodyWeightKg || '',
        notes: w.notes || ''
      }));

      const csv = Papa.unparse({
        fields: CSV_HEADER,
        data: data
      });

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `aerobic_workouts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const fileName = `aerobic_workouts_${new Date().toISOString().split('T')[0]}.csv`;
      const file = new File(Paths.cache, fileName);
      
      file.create();
      file.write(csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  async importWorkouts(fileUri: string): Promise<number> {
    try {
      let fileContent: string;

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        fileContent = await response.text();
      } else {
        const file = new File(fileUri);
        fileContent = await file.text();
      }
      
      return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const importedWorkouts: WorkoutLog[] = [];
              
              for (const row of results.data as any[]) {
                // Basic validation
                if (!row.date || !row.type) {
                  continue;
                }

                const workout: WorkoutLog = {
                  id: row.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  date: row.date,
                  type: row.type as WorkoutType,
                  zone: row.zone as Zone,
                  durationMinutes: parseFloat(row.duration_min),
                  watts: row.watts_avg && row.watts_avg !== '-' ? parseFloat(row.watts_avg) : undefined,
                  distanceKm: row.distance_km && row.distance_km !== '-' ? parseFloat(row.distance_km) : undefined,
                  heartRate: row.heart_rate && row.heart_rate !== '-' ? parseFloat(row.heart_rate) : undefined,
                  calories: row.calories && row.calories !== '-' ? parseFloat(row.calories) : undefined,
                  incline: row.incline_percent && row.incline_percent !== '-' ? parseFloat(row.incline_percent) : undefined,
                  bodyWeightKg: row.body_weight_kg && row.body_weight_kg !== '-' ? parseFloat(row.body_weight_kg) : undefined,
                  notes: row.notes || undefined
                };

                importedWorkouts.push(workout);
              }

              if (importedWorkouts.length > 0) {
                await StorageService.importWorkouts(importedWorkouts);
              }
              
              resolve(importedWorkouts.length);
            } catch (err) {
              reject(err);
            }
          },
          error: (error: Error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }
};
