import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CsvService } from '@/services/csv';
import { StorageService } from '@/services/storage';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function SettingsScreen() {
  const [bodyWeight, setBodyWeight] = useState('');
  const inputBg = useThemeColor({ light: '#fff', dark: '#2C2C2E' }, 'background');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const { showToast } = useToast();

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
      showToast('Please enter a valid body weight.', 'error');
      return;
    }
    await StorageService.saveSettings({ bodyWeightKg: weight });
    showToast('Body weight saved!', 'success');
  };

  const handleExport = async () => {
    try {
      await CsvService.exportWorkouts();
      if (Platform.OS === 'web') {
        showToast('Export started', 'info');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to export workouts.', 'error');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const count = await CsvService.importWorkouts(result.assets[0].uri);
      showToast(`Imported ${count} workouts.`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to import workouts. Please check the CSV format.', 'error');
    }
  };

  const handleClearData = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Clear All Data: Are you sure you want to delete all workouts? This cannot be undone.')) {
        await StorageService.clearWorkouts();
        showToast('Data cleared!', 'success');
      }
    } else {
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
              showToast('Data cleared!', 'success');
            }
          }
        ]
      );
    }
  };

  const content = (
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
          <ThemedButton title="Save" onPress={handleSaveWeight} size="small" />
        </View>
        <ThemedText style={styles.hint}>Used to calculate Watts/kg</ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <ThemedText type="subtitle">Data Management</ThemedText>
        <View style={styles.buttonContainer}>
          <ThemedButton title="Export CSV" onPress={handleExport} variant="secondary" />
          <ThemedButton title="Import CSV" onPress={handleImport} variant="secondary" />
        </View>
      </View>

      <View style={styles.divider} />

      <ThemedButton title="Clear All Data" onPress={handleClearData} variant="danger" />
    </ThemedView>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {content}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
