import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/services/storage';
import { WorkoutLog, WorkoutType, Zone } from '@/types/workout';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function LogScreen() {
  const router = useRouter();
  const [type, setType] = useState<WorkoutType>('Running');
  const [zone, setZone] = useState<Zone>('Zone 2');
  const [duration, setDuration] = useState('');
  const [watts, setWatts] = useState('');
  const [distance, setDistance] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [calories, setCalories] = useState('');
  const [elevation, setElevation] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const newWorkout: WorkoutLog = {
      id: Date.now().toString(),
      date: date.toISOString().split('T')[0],
      type,
      zone,
      durationMinutes: parseInt(duration) || 0,
      watts: watts ? parseInt(watts) : undefined,
      distanceKm: distance ? parseFloat(distance) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      calories: calories ? parseInt(calories) : undefined,
      elevation: elevation ? parseInt(elevation) : undefined,
      notes: notes || undefined,
    };

    await StorageService.addWorkout(newWorkout);
    Alert.alert('Success', 'Workout saved!');
    
    // Reset form
    setDuration('');
    setWatts('');
    setDistance('');
    setHeartRate('');
    setCalories('');
    setElevation('');
    setNotes('');
    
    // Navigate to history
    router.push('/');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.header}>Log Workout</ThemedText>

          <ThemedText type="subtitle">Date</ThemedText>
          {Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <ThemedText>{date.toISOString().split('T')[0]}</ThemedText>
            </TouchableOpacity>
          )}
          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              style={styles.datePicker}
            />
          )}

          <ThemedText type="subtitle">Type</ThemedText>
        <ThemedView style={styles.row}>
          {(['Running', 'Cycling', 'Other'] as WorkoutType[]).map((t) => (
            <Button
              key={t}
              title={t}
              onPress={() => setType(t)}
              color={type === t ? '#0a7ea4' : '#ccc'}
            />
          ))}
        </ThemedView>

        <ThemedText type="subtitle">Zone</ThemedText>
        <ThemedView style={styles.row}>
          {(['Zone 2', 'Zone 5'] as Zone[]).map((z) => (
            <Button
              key={z}
              title={z}
              onPress={() => setZone(z)}
              color={zone === z ? '#0a7ea4' : '#ccc'}
            />
          ))}
        </ThemedView>

        <ThemedText type="subtitle">Duration (min)</ThemedText>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="40"
        />

        <ThemedText type="subtitle">Watts (avg)</ThemedText>
        <TextInput
          style={styles.input}
          value={watts}
          onChangeText={setWatts}
          keyboardType="numeric"
          placeholder="130"
        />

        <ThemedText type="subtitle">Distance (km)</ThemedText>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
          placeholder="5.0"
        />

        <ThemedText type="subtitle">Heart Rate (avg)</ThemedText>
        <TextInput
          style={styles.input}
          value={heartRate}
          onChangeText={setHeartRate}
          keyboardType="numeric"
          placeholder="145"
        />

        <ThemedText type="subtitle">Calories</ThemedText>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="400"
        />

        <ThemedText type="subtitle">Elevation (m)</ThemedText>
        <TextInput
          style={styles.input}
          value={elevation}
          onChangeText={setElevation}
          keyboardType="numeric"
          placeholder="0"
        />

        <ThemedText type="subtitle">Notes</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Level 10 on gym machine..."
        />

        <Button title="Save Workout" onPress={handleSave} />
      </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  datePicker: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
});
