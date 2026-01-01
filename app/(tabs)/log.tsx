// import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { WorkoutForm, WorkoutFormRef } from '@/components/workouts/WorkoutForm';
import { useToast } from '@/context/ToastContext';
import { StorageService } from '@/services/storage';
import { WorkoutLog } from '@/types/workout';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';

export default function LogScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const formRef = useRef<WorkoutFormRef>(null);
  const { showToast } = useToast();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ThemedButton 
          title="Save" 
          onPress={() => formRef.current?.submit()} 
          variant="ghost"
          // style={{ marginRight: -8 }}
        />
      ),
    });
  }, [navigation]);

  const handleSave = async (workout: WorkoutLog) => {
    await StorageService.addWorkout(workout);
    showToast('Workout saved!', 'success');
    router.push('/');
  };

  return (
    <WorkoutForm ref={formRef} onSubmit={handleSave} submitLabel="Save Workout" />
  );
}

