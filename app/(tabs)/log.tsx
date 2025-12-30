import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkoutForm } from '@/components/workouts/WorkoutForm';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';

export default function LogScreen() {
  const router = useRouter();

  const handleSave = async (workout: WorkoutLog) => {
    await StorageService.addWorkout(workout);
    Alert.alert('Success', 'Workout saved!');
    router.push('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Log Workout</ThemedText>
      <WorkoutForm onSubmit={handleSave} submitLabel="Save Workout" />
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
