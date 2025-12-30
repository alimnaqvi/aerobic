import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkoutLog, WorkoutType, Zone } from '@/types/workout';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface WorkoutFormProps {
  initialValues?: WorkoutLog;
  onSubmit: (workout: WorkoutLog) => void;
  submitLabel: string;
  title?: string;
}

export interface WorkoutFormRef {
  submit: () => void;
}

export const WorkoutForm = forwardRef<WorkoutFormRef, WorkoutFormProps>(({ initialValues, onSubmit, submitLabel, title }, ref) => {
  const [type, setType] = useState<WorkoutType>(initialValues?.type || 'Running');
  const [zone, setZone] = useState<Zone>(initialValues?.zone || 'Zone 2');
  const [duration, setDuration] = useState(initialValues?.durationMinutes?.toString() || '');
  const [watts, setWatts] = useState(initialValues?.watts?.toString() || '');
  const [distance, setDistance] = useState(initialValues?.distanceKm?.toString() || '');
  const [heartRate, setHeartRate] = useState(initialValues?.heartRate?.toString() || '');
  const [calories, setCalories] = useState(initialValues?.calories?.toString() || '');
  const [elevation, setElevation] = useState(initialValues?.elevation?.toString() || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [date, setDate] = useState(initialValues?.date ? new Date(initialValues.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    const workout: WorkoutLog = {
      id: initialValues?.id || Date.now().toString(),
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
    onSubmit(workout);
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

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
          {title && <ThemedText type="title" style={styles.header}>{title}</ThemedText>}
          
          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Date</ThemedText>
            <View style={styles.inputContainer}>
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
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Type</ThemedText>
            <View style={styles.segmentedControl}>
              {(['Running', 'Cycling', 'Other'] as WorkoutType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.segmentButton, type === t && styles.segmentButtonActive]}
                  onPress={() => setType(t)}
                >
                  <ThemedText style={[styles.segmentText, type === t && styles.segmentTextActive]}>{t}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Zone</ThemedText>
            <View style={styles.segmentedControl}>
              {(['Zone 2', 'Zone 5'] as Zone[]).map((z) => (

                <TouchableOpacity
                  key={z}
                  style={[styles.segmentButton, zone === z && styles.segmentButtonActive]}
                  onPress={() => setZone(z)}
                >
                  <ThemedText style={[styles.segmentText, zone === z && styles.segmentTextActive]}>{z}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Duration (min)</ThemedText>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="40"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Watts (avg)</ThemedText>
            <TextInput
              style={styles.input}
              value={watts}
              onChangeText={setWatts}
              keyboardType="numeric"
              placeholder="130"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Distance (km)</ThemedText>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder="5.0"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Heart Rate</ThemedText>
            <TextInput
              style={styles.input}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              placeholder="145"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Calories</ThemedText>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="400"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Elevation (m)</ThemedText>
            <TextInput
              style={styles.input}
              value={elevation}
              onChangeText={setElevation}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <ThemedText type="subtitle" style={styles.notesLabel}>Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Level 10 on gym machine..."
          />

          <Button title={submitLabel} onPress={handleSubmit} />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

WorkoutForm.displayName = 'WorkoutForm';

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  label: {
    width: 120,
    fontSize: 16,
  },
  inputContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    textAlign: 'right',
    maxWidth: 150,
  },
  notesLabel: {
    marginTop: 10,
    marginBottom: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    textAlign: 'left',
    maxWidth: '100%',
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  datePicker: {
    alignSelf: 'flex-end',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 2,
    marginLeft: 10,
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    color: '#666',
  },
  segmentTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});
