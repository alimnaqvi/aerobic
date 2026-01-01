import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedListItem } from '@/components/ui/ThemedListItem';
import { ThemedModal } from '@/components/ui/ThemedModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CsvService } from '@/services/csv';
import { StorageService } from '@/services/storage';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SettingsScreen() {
  const [bodyWeight, setBodyWeight] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  
  const inputBg = useThemeColor({ light: '#fff', dark: '#2C2C2E' }, 'background');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const modalBg = useThemeColor({ light: '#fff', dark: '#1C1C1E' }, 'background');
  const headerBg = useThemeColor({ light: '#f8f9fa', dark: '#000000' }, 'background');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const iconColor = useThemeColor({}, 'icon');
  
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

  const openWeightModal = () => {
    setTempWeight(bodyWeight);
    setIsWeightModalVisible(true);
  };

  const handleSaveWeight = async () => {
    const weight = parseFloat(tempWeight);
    if (isNaN(weight) || weight <= 0) {
      showToast('Please enter a valid body weight.', 'error');
      return;
    }
    await StorageService.saveSettings({ bodyWeightKg: weight });
    setBodyWeight(weight.toString());
    setIsWeightModalVisible(false);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Profile</ThemedText>
          <ThemedListItem 
            title="Set Body Weight" 
            value={bodyWeight ? `${bodyWeight} kg` : 'Not set'}
            onPress={openWeightModal}
            isFirst
            isLast
          />
          <ThemedText style={styles.hint}>Used to calculate Watts/kg</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Data Management</ThemedText>
          <ThemedListItem 
            title="Export CSV" 
            onPress={handleExport} 
            isFirst
          />
          <ThemedListItem 
            title="Import CSV" 
            onPress={handleImport} 
          />
          <ThemedListItem 
            title="Clear All Data" 
            onPress={handleClearData} 
            variant="destructive" 
            showChevron={false}
            isLast
          />
        </View>
      </ScrollView>

      <ThemedModal
        visible={isWeightModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onClose={() => setIsWeightModalVisible(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: modalBg }]}>
          <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
            <ThemedText type="title">Body Weight</ThemedText>
            <TouchableOpacity onPress={() => setIsWeightModalVisible(false)} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={30} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <ThemedText style={styles.modalLabel}>Enter your body weight in kg:</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
              placeholder="70.0"
              placeholderTextColor="#999"
              autoFocus
            />
            <ThemedButton title="Save" onPress={handleSaveWeight} size="large" style={{ marginTop: 20 }} />
          </View>
        </ThemedView>
      </ThemedModal>
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
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 10,
    marginLeft: 10,
    fontSize: 14,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 10,
  },
});
