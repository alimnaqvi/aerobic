// import { ThemedText } from '@/components/themed-text';
import { WorkoutForm, WorkoutFormRef } from '@/components/workouts/WorkoutForm';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Button, Platform } from 'react-native';

export default function LogScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const formRef = useRef<WorkoutFormRef>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Save" onPress={() => formRef.current?.submit()} />
      ),
    });
  }, [navigation]);

  const handleSave = async (workout: WorkoutLog) => {
    await StorageService.addWorkout(workout);
    if (Platform.OS === 'web') {
      window.alert('Success: Workout saved!');
    } else {
      Alert.alert('Success', 'Workout saved!');
    }
    router.push('/');
  };

  return (
    <WorkoutForm ref={formRef} onSubmit={handleSave} submitLabel="Save Workout" />
  );
}

