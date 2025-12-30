import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/services/storage';
import { Button, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const handleClearData = async () => {
    await StorageService.clearWorkouts();
    alert('Data cleared!');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <Button title="Clear All Data" onPress={handleClearData} color="red" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
});
