import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedListItem } from '@/components/ui/ThemedListItem';
import { ThemedModal } from '@/components/ui/ThemedModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
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
  
  // Auth State
  const { user, signInWithOtp, verifyOtp, signOut, deleteAccount } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const inputBg = useThemeColor({}, 'card');
  const inputBorder = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const modalBg = useThemeColor({}, 'card');
  const headerBg = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const dangerColor = useThemeColor({}, 'danger');
  
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [user]); // Reload settings when user changes (login/logout)

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    if (settings.bodyWeightKg) {
      setBodyWeight(settings.bodyWeightKg.toString());
    } else {
      setBodyWeight('');
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

  const handleClearWeight = async () => {
    await StorageService.clearBodyWeight();
    setBodyWeight('');
    setTempWeight('');
    setIsWeightModalVisible(false);
    showToast('Body weight cleared!', 'success');
  };

  const handleSignIn = async () => {
    if (!email) {
      showToast('Please enter your email.', 'error');
      return;
    }
    const { error } = await signInWithOtp(email);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Check your email for the login link or code!', 'success');
      setShowOtpInput(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit code.', 'error');
      return;
    }
    const { error } = await verifyOtp(email, otp);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Signed in successfully!', 'success');
      setIsLoginModalVisible(false);
      setShowOtpInput(false);
      setOtp('');
      
      // Auto-sync after login
      handleSync();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully.', 'success');
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete Account: Are you sure? This will permanently delete all your data from the cloud.')) {
        const { error } = await deleteAccount();
        if (error) {
          showToast('Failed to delete account: ' + error.message, 'error');
        } else {
          showToast('Account deleted.', 'success');
        }
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure? This will permanently delete all your data from the cloud.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: async () => {
              const { error } = await deleteAccount();
              if (error) {
                showToast('Failed to delete account: ' + error.message, 'error');
              } else {
                showToast('Account deleted.', 'success');
              }
            }
          }
        ]
      );
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    await StorageService.syncLocalToCloud();
    setIsSyncing(false);
    showToast('Sync complete!', 'success');
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
        setBodyWeight('');
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
              setBodyWeight('');
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
          <ThemedText type="subtitle" style={styles.sectionHeader}>Account</ThemedText>
          {user ? (
            <>
              <ThemedListItem 
                title="Email" 
                value={user.email} 
                showChevron={false}
                isFirst
              />
              <ThemedListItem 
                title="Sync Now" 
                onPress={handleSync} 
                icon={isSyncing ? <IconSymbol name="arrow.triangle.2.circlepath" size={20} color={iconColor} /> : undefined}
              />
              <ThemedListItem 
                title="Sign Out" 
                onPress={handleSignOut} 
                variant="destructive"
                showChevron={false}
                isLast
              />
            </>
          ) : (
            <ThemedListItem 
              title="Sign In / Sign Up" 
              onPress={() => setIsLoginModalVisible(true)} 
              isFirst
              isLast
            />
          )}
          <ThemedText style={styles.hint}>
            {user ? 'Your workouts are synced to the cloud.' : 'Sign in to sync your workouts across devices.'}
          </ThemedText>
        </View>

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
            isLast
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionHeader, { color: dangerColor }]}>Danger Zone</ThemedText>
          <ThemedListItem 
            title="Clear All Data" 
            onPress={handleClearData} 
            variant="destructive" 
            showChevron={false}
            isFirst
            isLast={!user}
          />
          {user && (
            <ThemedListItem 
              title="Delete Your Account" 
              onPress={handleDeleteAccount} 
              variant="destructive" 
              showChevron={false}
              isLast
            />
          )}
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
            <ThemedButton title="Clear" onPress={handleClearWeight} variant="ghost" style={{ marginTop: 10 }} />
          </View>
        </ThemedView>
      </ThemedModal>

      <ThemedModal
        visible={isLoginModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onClose={() => setIsLoginModalVisible(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: modalBg }]}>
          <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
            <ThemedText type="title">Sign In</ThemedText>
            <TouchableOpacity onPress={() => setIsLoginModalVisible(false)} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={30} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {!showOtpInput ? (
              <>
                <ThemedText style={styles.modalLabel}>Enter your email to receive a magic link or code:</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="hello@example.com"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <ThemedButton title="Send Login Link/Code" onPress={handleSignIn} size="large" style={{ marginTop: 20 }} />
                <ThemedText style={[styles.hint, { marginTop: 20, textAlign: 'center' }]}>
                  We&apos;ll send you an email. You can click the link or enter the code manually.
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.modalLabel}>Enter the 8-digit code from your email:</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor, textAlign: 'center', letterSpacing: 8, fontSize: 24 }]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={8}
                  placeholder="12345678"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <ThemedButton title="Verify Code" onPress={handleVerifyOtp} size="large" style={{ marginTop: 20 }} />
                <ThemedButton title="Back" onPress={() => setShowOtpInput(false)} variant="ghost" style={{ marginTop: 10 }} />
              </>
            )}
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
