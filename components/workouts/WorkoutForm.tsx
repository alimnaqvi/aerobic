import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StorageService } from '@/services/storage';
import { WorkoutLog, WorkoutType, Zone } from '@/types/workout';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [type, setType] = useState<WorkoutType>(initialValues?.type || 'Cycling');
  const [zone, setZone] = useState<Zone>(initialValues?.zone || 'Zone 2');
  const [duration, setDuration] = useState(initialValues?.durationMinutes?.toString() || '');
  const [watts, setWatts] = useState(initialValues?.watts?.toString() || '');
  const [distance, setDistance] = useState(initialValues?.distanceKm?.toString() || '');
  const [heartRate, setHeartRate] = useState(initialValues?.heartRate?.toString() || '');
  const [calories, setCalories] = useState(initialValues?.calories?.toString() || '');
  const [incline, setIncline] = useState(initialValues?.incline?.toString() || '');
  const [bodyWeight, setBodyWeight] = useState(initialValues?.bodyWeightKg?.toString() || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [date, setDate] = useState(initialValues?.date ? new Date(initialValues.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const inputBg = useThemeColor({ light: '#fff', dark: '#2C2C2E' }, 'background');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#888' }, 'icon');
  const segmentBg = useThemeColor({ light: '#eee', dark: '#333' }, 'background');
  const segmentActiveBg = useThemeColor({ light: '#fff', dark: '#666' }, 'background');
  const segmentTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const segmentTextActiveColor = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  // Load default body weight from settings if not editing
  useEffect(() => {
    if (!initialValues) {
      const loadSettings = async () => {
        const settings = await StorageService.getSettings();
        if (settings.bodyWeightKg) {
          setBodyWeight(settings.bodyWeightKg.toString());
        }
      };
      loadSettings();
    }
  }, [initialValues]);

  // Dynamic defaults based on last workout of same Type & Zone
  useEffect(() => {
    if (!initialValues) {
      const loadLastWorkout = async () => {
        const workouts = await StorageService.getWorkouts();
        // Find last workout with same Type and Zone
        const lastWorkout = workouts.find(w => w.type === type && w.zone === zone);
        
        if (lastWorkout) {
          setDuration(lastWorkout.durationMinutes?.toString() || '');
          setWatts(lastWorkout.watts?.toString() || '');
          setDistance(lastWorkout.distanceKm?.toString() || '');
          setHeartRate(lastWorkout.heartRate?.toString() || '');
          setCalories(lastWorkout.calories?.toString() || '');
          setIncline(lastWorkout.incline?.toString() || '');
          // Note: We don't overwrite bodyWeight here, as it should come from settings or be current
        } else {
          // Reset if no previous workout found (optional, but cleaner)
          setDuration('');
          setWatts('');
          setDistance('');
          setHeartRate('');
          setCalories('');
          setIncline('');
        }
      };
      loadLastWorkout();
    }
  }, [type, zone, initialValues]);

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
      incline: incline ? parseInt(incline) : undefined,
      bodyWeightKg: bodyWeight ? parseFloat(bodyWeight) : undefined,
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

  const inputStyle = [
    styles.input, 
    { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }
  ];

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
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)} 
                  style={[styles.dateButton, { backgroundColor: inputBg, borderColor: inputBorder }]}
                >
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
                  themeVariant={inputBg === '#fff' ? 'light' : 'dark'}
                />
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Type</ThemedText>
            <View style={[styles.segmentedControl, { backgroundColor: segmentBg }]}>
              {(['Cycling', 'Treadmill', 'Other'] as WorkoutType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.segmentButton, type === t && { backgroundColor: segmentActiveBg }]}
                  onPress={() => setType(t)}
                >
                  <ThemedText style={[
                    styles.segmentText, 
                    { color: segmentTextColor },
                    type === t && { color: segmentTextActiveColor, fontWeight: '600' }
                  ]}>{t}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Zone</ThemedText>
            <View style={[styles.segmentedControl, { backgroundColor: segmentBg }]}>
              {(['Zone 2', 'Zone 5'] as Zone[]).map((z) => (
                <TouchableOpacity
                  key={z}
                  style={[styles.segmentButton, zone === z && { backgroundColor: segmentActiveBg }]}
                  onPress={() => setZone(z)}
                >
                  <ThemedText style={[
                    styles.segmentText, 
                    { color: segmentTextColor },
                    zone === z && { color: segmentTextActiveColor, fontWeight: '600' }
                  ]}>{z}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Duration (min)</ThemedText>
            <TextInput
              style={inputStyle}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="40"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Watts (avg)</ThemedText>
            <TextInput
              style={inputStyle}
              value={watts}
              onChangeText={setWatts}
              keyboardType="numeric"
              placeholder="130"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Distance (km)</ThemedText>
            <TextInput
              style={inputStyle}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder="5.0"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Heart Rate</ThemedText>
            <TextInput
              style={inputStyle}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              placeholder="145"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Calories</ThemedText>
            <TextInput
              style={inputStyle}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="400"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Incline (%)</ThemedText>
            <TextInput
              style={inputStyle}
              value={incline}
              onChangeText={setIncline}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="subtitle" style={styles.label}>Body Weight (kg)</ThemedText>
            <TextInput
              style={inputStyle}
              value={bodyWeight}
              onChangeText={setBodyWeight}
              keyboardType="numeric"
              placeholder="70.0"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <ThemedText type="subtitle" style={styles.notesLabel}>Notes</ThemedText>
          <TextInput
            style={[inputStyle, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Level 10 on gym machine..."
            placeholderTextColor={placeholderColor}
          />

          <ThemedButton title={submitLabel} onPress={handleSubmit} size="large" style={{ marginTop: 20 }} />
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
    maxWidth: 80,
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
