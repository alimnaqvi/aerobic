import { WorkoutForm, WorkoutFormRef } from '@/components/workouts/WorkoutForm';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button } from 'react-native';

export default function EditWorkoutScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const formRef = useRef<WorkoutFormRef>(null);

  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Workout',
      headerBackTitle: 'History',
      headerRight: () => (
        <Button title="Save" onPress={() => formRef.current?.submit()} />
        // <TouchableOpacity onPress={() => formRef.current?.submit()} style={{ marginRight: 10 }}>
        //   <IconSymbol name="checkmark" size={24} color="#0a7ea4" />
        // </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
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
    loadWorkout();
  }, [id, router]);

  const handleSave = async (updatedWorkout: WorkoutLog) => {
    await StorageService.updateWorkout(updatedWorkout);
    Alert.alert('Success', 'Workout updated!');
    router.back();
  };

  if (!workout) return null;

  return (
    <WorkoutForm ref={formRef} initialValues={workout} onSubmit={handleSave} submitLabel="Update Workout" />
  );
}

