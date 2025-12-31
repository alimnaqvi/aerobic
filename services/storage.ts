import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutLog } from '../types/workout';

const STORAGE_KEY = '@aerobic_workouts';
const SETTINGS_KEY = '@aerobic_settings';

export interface UserSettings {
  bodyWeightKg?: number;
}

export const StorageService = {
  async getSettings(): Promise<UserSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
      console.error('Failed to fetch settings', e);
      return {};
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      const current = await this.getSettings();
      const newSettings = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

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

  async updateWorkout(updatedWorkout: WorkoutLog): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = existingWorkouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
    } catch (e) {
      console.error('Failed to update workout', e);
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = existingWorkouts.filter(w => w.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
    } catch (e) {
      console.error('Failed to delete workout', e);
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
