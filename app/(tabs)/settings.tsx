import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedListItem } from '@/components/ui/ThemedListItem';
import { ThemedModal } from '@/components/ui/ThemedModal';
import { Toast } from '@/components/ui/Toast';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CsvService } from '@/services/csv';
import { StorageService } from '@/services/storage';
import { DEFAULT_WORKOUT_TYPES } from '@/types/workout';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Keyboard, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SettingsScreen() {
  const [bodyWeight, setBodyWeight] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  
  const [isExercisesModalVisible, setIsExercisesModalVisible] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState('');
  
  // Auth State
  const { user, signInWithOtp, verifyOtp, signOut, deleteAccount } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] = useState(false);

  const inputBg = useThemeColor({}, 'card');
  const inputBorder = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const modalBg = useThemeColor({}, 'card');
  const headerBg = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const dangerColor = useThemeColor({}, 'danger');
  
  const { showToast, hideToast, visible: toastVisible, message: toastMessage, type: toastType } = useToast();

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    if (settings.bodyWeightKg) {
      setBodyWeight(settings.bodyWeightKg.toString());
    } else {
      setBodyWeight('');
    }
    setCustomTypes(settings.workoutTypes || []);
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

  const handleAddType = async () => {
    if (!newType.trim()) return;
    await StorageService.addWorkoutType(newType.trim());
    setCustomTypes(prev => [...prev, newType.trim()]);
    setNewType('');
    showToast('Exercise added!', 'success');
  };

  const handleDeleteType = async (type: string) => {
    await StorageService.deleteWorkoutType(type);
    setCustomTypes(prev => prev.filter(t => t !== type));
    showToast('Exercise removed!', 'success');
  };

  const handleSignIn = async () => {
    if (!email) {
      showToast('Please enter your email.', 'error', { hideInRoot: true });
      return;
    }
    setIsAuthLoading(true);
    try {
      const { error } = await signInWithOtp(email);
      if (error) {
        showToast(error.message, 'error', { hideInRoot: true });
      } else {
        showToast('Check your email for the login code!', 'success', { hideInRoot: true });
        setShowOtpInput(true);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit code.', 'error', { hideInRoot: true });
      return;
    }
    setIsAuthLoading(true);
    try {
      const { error } = await verifyOtp(email, otp);
      if (error) {
        showToast(error.message, 'error', { hideInRoot: true });
      } else {
        showToast('Signed in successfully!', 'success', { hideInRoot: true });
        setIsLoginModalVisible(false);
        setShowOtpInput(false);
        setOtp('');
        
        // Auto-sync after login
        handleSync();
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await signOut();
      showToast('Signed out successfully.', 'success');
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete Account: Are you sure? This will permanently delete all your data from the cloud.')) {
        setIsDeleteAccountLoading(true);
        try {
          const { error } = await deleteAccount();
          if (error) {
            showToast('Failed to delete account: ' + error.message, 'error');
          } else {
            showToast('Account deleted.', 'success');
          }
        } finally {
          setIsDeleteAccountLoading(false);
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
              setIsDeleteAccountLoading(true);
              try {
                const { error } = await deleteAccount();
                if (error) {
                  showToast('Failed to delete account: ' + error.message, 'error');
                } else {
                  showToast('Account deleted.', 'success');
                }
              } finally {
                setIsDeleteAccountLoading(false);
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
    const { pushed, total } = await StorageService.syncLocalToCloud();
    setIsSyncing(false);
    showToast(`Sync complete! Pushed ${pushed} local workouts. Total: ${total}.`, 'success');
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
                isLoading={isSyncing}
              />
              <ThemedListItem 
                title="Sign Out" 
                onPress={handleSignOut} 
                variant="destructive"
                showChevron={false}
                isLast
                isLoading={isSignOutLoading}
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
          />
          <ThemedListItem 
            title="Manage Exercises" 
            value={`${customTypes.length} custom`}
            onPress={() => setIsExercisesModalVisible(true)}
            isLast
          />
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
              isLoading={isDeleteAccountLoading}
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
              onChangeText={(text) => setTempWeight(text.replace(',', '.'))}
              keyboardType="decimal-pad"
              placeholder="70.0"
              placeholderTextColor="#999"
              autoFocus
            />
            <ThemedText style={styles.hint}>Used to calculate Watts/kg</ThemedText>
            <ThemedButton title="Save" onPress={handleSaveWeight} size="large" style={{ marginTop: 20 }} />
            <ThemedButton title="Clear" onPress={handleClearWeight} variant="ghost" style={{ marginTop: 10 }} />
          </View>
          <Toast 
            message={toastMessage} 
            type={toastType} 
            visible={toastVisible} 
            onDismiss={hideToast} 
          />
        </ThemedView>
      </ThemedModal>

      <ThemedModal
        visible={isExercisesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onClose={() => setIsExercisesModalVisible(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: modalBg }]}>
          <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
            <ThemedText type="title">Manage Exercises</ThemedText>
            <TouchableOpacity onPress={() => setIsExercisesModalVisible(false)} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={30} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                value={newType}
                onChangeText={setNewType}
                placeholder="New Exercise Name"
                placeholderTextColor="#999"
              />
              <ThemedButton title="Add" onPress={handleAddType} />
            </View>
            
            <ScrollView>
              {DEFAULT_WORKOUT_TYPES.map(type => (
                <View key={type} style={[styles.exerciseItem, { borderBottomColor: borderColor }]}>
                  <ThemedText>{type} (Default)</ThemedText>
                </View>
              ))}
              {customTypes.map(type => (
                <View key={type} style={[styles.exerciseItem, { borderBottomColor: borderColor }]}>
                  <ThemedText>{type}</ThemedText>
                  <TouchableOpacity onPress={() => handleDeleteType(type)}>
                    <IconSymbol name="trash" size={20} color={dangerColor} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <Toast 
            message={toastMessage} 
            type={toastType} 
            visible={toastVisible} 
            onDismiss={hideToast} 
          />
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
                <ThemedText style={styles.modalLabel}>Enter your email to receive a login code:</ThemedText>
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
                <ThemedButton 
                  title="Send Login Code" 
                  onPress={handleSignIn} 
                  size="large" 
                  style={{ marginTop: 20 }} 
                  isLoading={isAuthLoading}
                />
                <ThemedText style={[styles.hint, { marginTop: 20, textAlign: 'center' }]}>
                  We&apos;ll send you an email with the code.
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.modalLabel}>Enter the 6-digit code from your email:</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor, textAlign: 'center', letterSpacing: 8, fontSize: 24 }]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="12345678"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <ThemedButton 
                  title="Verify Code" 
                  onPress={handleVerifyOtp} 
                  size="large" 
                  style={{ marginTop: 20 }} 
                  isLoading={isAuthLoading}
                />
                <ThemedButton title="Back" onPress={() => setShowOtpInput(false)} variant="ghost" style={{ marginTop: 10 }} />
              </>
            )}
          </View>
          <Toast 
            message={toastMessage} 
            type={toastType} 
            visible={toastVisible} 
            onDismiss={hideToast} 
          />
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
    // marginTop: 8,
    // marginLeft: 16,
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
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
