import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutLog } from '../types/workout';

const STORAGE_KEY = '@aerobic_workouts';

export const StorageService = {
  async getWorkouts(): Promise<WorkoutLog[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to fetch workouts', e);
      return [];
    }
  },

  async addWorkout(workout: WorkoutLog): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = [workout, ...existingWorkouts];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
    } catch (e) {
      console.error('Failed to save workout', e);
    }
  },

  async clearWorkouts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear workouts', e);
    }
  }
};
