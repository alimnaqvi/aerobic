import { ThemedButton } from '@/components/ui/ThemedButton';
import { WorkoutForm, WorkoutFormRef } from '@/components/workouts/WorkoutForm';
import { useToast } from '@/context/ToastContext';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

export default function EditWorkoutScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const formRef = useRef<WorkoutFormRef>(null);
  const { showToast } = useToast();

  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Workout',
      headerBackTitle: 'History',
      headerRight: () => (
        <ThemedButton 
          title="Save" 
          onPress={() => formRef.current?.submit()} 
          variant="ghost"
          style={{ marginRight: -8 }}
        />
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
        showToast('Workout not found', 'error');
        router.back();
      }
    };
    loadWorkout();
  }, [id, router]);

  const handleSave = async (updatedWorkout: WorkoutLog) => {
    await StorageService.updateWorkout(updatedWorkout);
    showToast('Workout updated!', 'success');
    router.back();
  };

  if (!workout) return null;

  return (
    <WorkoutForm ref={formRef} initialValues={workout} onSubmit={handleSave} submitLabel="Update Workout" />
  );
}

