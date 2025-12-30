import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkoutForm } from '@/components/workouts/WorkoutForm';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    if (typeof id !== 'string') return;
    const workouts = await StorageService.getWorkouts();
    const found = workouts.find(w => w.id === id);
    if (found) {
      setWorkout(found);
    } else {
      Alert.alert('Error', 'Workout not found');
      router.back();
    }
  };

  const handleSave = async (updatedWorkout: WorkoutLog) => {
    const workouts = await StorageService.getWorkouts();
    const updatedWorkouts = workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
    
    // We need to update the storage service to support updating a single workout or overwriting the list
    // For now, we'll just overwrite the whole list using a new method we'll add to StorageService, 
    // or we can just use the existing addWorkout logic if we modify it, but let's just overwrite manually here for now
    // Actually, let's add an updateWorkout method to StorageService.
    
    await StorageService.updateWorkout(updatedWorkout);
    Alert.alert('Success', 'Workout updated!');
    router.back();
  };

  if (!workout) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Edit Workout</ThemedText>
      <WorkoutForm initialValues={workout} onSubmit={handleSave} submitLabel="Update Workout" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    marginVertical: 20,
  },
});
