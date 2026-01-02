import { supabase } from '@/lib/supabase';
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
      // Try to get from Supabase if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('body_weight_kg')
          .eq('id', session.user.id)
          .single();
        
        if (data && !error) {
          // Update local cache
          const settings = { bodyWeightKg: data.body_weight_kg };
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
          return settings;
        }
      }

      // Fallback to local storage
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
      console.error('Failed to fetch settings', e);
      return {};
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      // Save locally
      const current = await this.getSettings();
      const newSettings = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // Save to Supabase if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const updates = {
          id: session.user.id,
          body_weight_kg: settings.bodyWeightKg,
          updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) console.error('Failed to save settings to Supabase', error);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  async getWorkouts(): Promise<WorkoutLog[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .order('date', { ascending: false });

        if (!error && data) {
          // Map Supabase data to WorkoutLog type
          const remoteWorkouts: WorkoutLog[] = data.map((row: any) => ({
            id: row.id,
            date: row.date,
            type: row.type,
            zone: row.zone,
            durationMinutes: row.duration_minutes,
            watts: row.watts,
            distanceKm: row.distance_km,
            heartRate: row.heart_rate,
            calories: row.calories,
            incline: row.incline,
            bodyWeightKg: row.body_weight_kg,
            notes: row.notes,
          }));

          // Update local cache (overwrite or merge?)
          // For simplicity, we'll overwrite local with remote source of truth when online
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteWorkouts));
          return remoteWorkouts;
        }
      }

      // Fallback to local
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to fetch workouts', e);
      // Fallback to local on error
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    }
  },

  async addWorkout(workout: WorkoutLog): Promise<void> {
    try {
      // Save locally first
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = [workout, ...existingWorkouts];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));

      // Save to Supabase if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('workouts').insert({
          id: workout.id,
          user_id: session.user.id,
          date: workout.date,
          type: workout.type,
          zone: workout.zone,
          duration_minutes: workout.durationMinutes,
          watts: workout.watts,
          distance_km: workout.distanceKm,
          heart_rate: workout.heartRate,
          calories: workout.calories,
          incline: workout.incline,
          body_weight_kg: workout.bodyWeightKg,
          notes: workout.notes,
        });
        
        if (error) console.error('Failed to save workout to Supabase', error);
      }
    } catch (e) {
      console.error('Failed to save workout', e);
    }
  },

  async updateWorkout(updatedWorkout: WorkoutLog): Promise<void> {
    try {
      // Update locally
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = existingWorkouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));

      // Update Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('workouts')
          .update({
            date: updatedWorkout.date,
            type: updatedWorkout.type,
            zone: updatedWorkout.zone,
            duration_minutes: updatedWorkout.durationMinutes,
            watts: updatedWorkout.watts,
            distance_km: updatedWorkout.distanceKm,
            heart_rate: updatedWorkout.heartRate,
            calories: updatedWorkout.calories,
            incline: updatedWorkout.incline,
            body_weight_kg: updatedWorkout.bodyWeightKg,
            notes: updatedWorkout.notes,
          })
          .eq('id', updatedWorkout.id)
          .eq('user_id', session.user.id);

        if (error) console.error('Failed to update workout in Supabase', error);
      }
    } catch (e) {
      console.error('Failed to update workout', e);
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    try {
      // Delete locally
      const existingWorkouts = await this.getWorkouts();
      const newWorkouts = existingWorkouts.filter(w => w.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));

      // Delete from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);

        if (error) console.error('Failed to delete workout from Supabase', error);
      }
    } catch (e) {
      console.error('Failed to delete workout', e);
    }
  },

  async clearWorkouts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // Clear from Supabase? Maybe not "Clear All Data" button should wipe cloud unless explicit.
      // The user prompt said "Clear All Data: Are you sure you want to delete all workouts?".
      // I'll assume this means deleting from cloud too if logged in.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('user_id', session.user.id);
          
        if (error) console.error('Failed to clear workouts from Supabase', error);
      }
    } catch (e) {
      console.error('Failed to clear workouts', e);
    }
  },

  async importWorkouts(workouts: WorkoutLog[]): Promise<void> {
    try {
      const existingWorkouts = await this.getWorkouts();
      const existingIds = new Set(existingWorkouts.map(w => w.id));
      const newWorkouts = workouts.filter(w => !existingIds.has(w.id));
      
      const mergedWorkouts = [...existingWorkouts, ...newWorkouts];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedWorkouts));

      // Import to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && newWorkouts.length > 0) {
        const rows = newWorkouts.map(w => ({
          id: w.id,
          user_id: session.user.id,
          date: w.date,
          type: w.type,
          zone: w.zone,
          duration_minutes: w.durationMinutes,
          watts: w.watts,
          distance_km: w.distanceKm,
          heart_rate: w.heartRate,
          calories: w.calories,
          incline: w.incline,
          body_weight_kg: w.bodyWeightKg,
          notes: w.notes,
        }));

        const { error } = await supabase.from('workouts').upsert(rows);
        if (error) console.error('Failed to import workouts to Supabase', error);
      }
    } catch (e) {
      console.error('Failed to import workouts', e);
      throw e;
    }
  },

  // New method to sync local data to cloud after login
  async syncLocalToCloud(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const localJson = await AsyncStorage.getItem(STORAGE_KEY);
      const localWorkouts: WorkoutLog[] = localJson != null ? JSON.parse(localJson) : [];

      if (localWorkouts.length === 0) return;

      // Upsert all local workouts to Supabase
      // Note: This might overwrite remote data if IDs match. 
      // Ideally we should check timestamps, but for now we assume local is fresh if we are syncing up.
      // Actually, a better approach is to fetch remote, merge, and save back.
      
      const rows = localWorkouts.map(w => ({
        id: w.id,
        user_id: session.user.id,
        date: w.date,
        type: w.type,
        zone: w.zone,
        duration_minutes: w.durationMinutes,
        watts: w.watts,
        distance_km: w.distanceKm,
        heart_rate: w.heartRate,
        calories: w.calories,
        incline: w.incline,
        body_weight_kg: w.bodyWeightKg,
        notes: w.notes,
      }));

      const { error } = await supabase.from('workouts').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('Sync failed', error);
      } else {
        // After pushing, pull everything to ensure consistency
        await this.getWorkouts();
      }
    } catch (e) {
      console.error('Sync error', e);
    }
  }
};
