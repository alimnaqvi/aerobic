import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StorageService } from '@/services/storage';
import { useEffect, useState } from 'react';
import { Alert, Button, Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function SettingsScreen() {
  const [bodyWeight, setBodyWeight] = useState('');
  const inputBg = useThemeColor({ light: '#fff', dark: '#2C2C2E' }, 'background');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    if (settings.bodyWeightKg) {
      setBodyWeight(settings.bodyWeightKg.toString());
    }
  };

  const handleSaveWeight = async () => {
    const weight = parseFloat(bodyWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid body weight.');
      return;
    }
    await StorageService.saveSettings({ bodyWeightKg: weight });
    Alert.alert('Success', 'Body weight saved!');
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all workouts? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await StorageService.clearWorkouts();
            Alert.alert('Data cleared!');
          }
        }
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>
        
        <View style={styles.section}>
          <ThemedText type="subtitle">Body Weight (kg)</ThemedText>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
              value={bodyWeight}
              onChangeText={setBodyWeight}
              keyboardType="numeric"
              placeholder="70.0"
              placeholderTextColor="#999"
            />
            <Button title="Save" onPress={handleSaveWeight} />
          </View>
          <ThemedText style={styles.hint}>Used to calculate Watts/kg</ThemedText>
        </View>

        <View style={styles.divider} />

        <Button title="Clear All Data" onPress={handleClearData} color="red" />
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    gap: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
});
