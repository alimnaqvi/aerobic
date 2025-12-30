import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WorkoutForm, WorkoutFormRef } from '@/components/workouts/WorkoutForm';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function LogScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const formRef = useRef<WorkoutFormRef>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => formRef.current?.submit()} style={{ marginRight: 10 }}>
          <IconSymbol name="checkmark" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSave = async (workout: WorkoutLog) => {
    await StorageService.addWorkout(workout);
    Alert.alert('Success', 'Workout saved!');
    router.push('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Log Workout</ThemedText>
      <WorkoutForm ref={formRef} onSubmit={handleSave} submitLabel="Save Workout" />
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
