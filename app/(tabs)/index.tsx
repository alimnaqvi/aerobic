import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PersonalRecordsModal } from '@/components/workouts/PersonalRecordsModal';
import { WorkoutCalendar } from '@/components/workouts/WorkoutCalendar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StorageService } from '@/services/storage';
import { WorkoutLog, Zone } from '@/types/workout';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, GestureResponderEvent, Modal, Pressable, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [sections, setSections] = useState<{ title: Zone; data: WorkoutLog[] }[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutLog[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [prVisible, setPrVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const containerBg = useThemeColor({ light: '#f8f9fa', dark: '#000000' }, 'background');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1C1C1E' }, 'background');
  const menuBg = useThemeColor({ light: '#fff', dark: '#2C2C2E' }, 'background');
  const metricBg = useThemeColor({ light: '#f5f5f5', dark: '#2C2C2E' }, 'background');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const iconColor = useThemeColor({}, 'icon');

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setPrVisible(true)} style={{ marginLeft: 15, padding: 4 }}>
          <IconSymbol name="trophy.fill" size={24} color="#ff9500" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => setCalendarVisible(true)} style={{ marginRight: 15, padding: 4 }}>
          <IconSymbol name="calendar" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const workouts = await StorageService.getWorkouts();
    setAllWorkouts(workouts);
    
    // Group by Zone
    const zone2 = workouts.filter(w => w.zone === 'Zone 2').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const zone5 = workouts.filter(w => w.zone === 'Zone 5').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const newSections = [];
    if (zone2.length > 0) newSections.push({ title: 'Zone 2' as Zone, data: zone2 });
    if (zone5.length > 0) newSections.push({ title: 'Zone 5' as Zone, data: zone5 });

    setSections(newSections);
  };

  const handleDelete = async (id: string) => {
    closeMenu();
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await StorageService.deleteWorkout(id);
            loadWorkouts();
          }
        }
      ]
    );
  };

  const handleEdit = (id: string) => {
    closeMenu();
    router.push({ pathname: '/edit-workout', params: { id } });
  };

  const openMenu = (event: GestureResponderEvent, id: string) => {
    const { pageY } = event.nativeEvent;
    setMenuPosition({ top: pageY + 10, right: 16 });
    setActiveWorkoutId(id);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setActiveWorkoutId(null);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: WorkoutLog }) => (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="defaultSemiBold" style={styles.dateText}>{formatDate(item.date)}</ThemedText>
          <ThemedText style={styles.typeText}>{item.type}</ThemedText>
        </View>
        <TouchableOpacity onPress={(e) => openMenu(e, item.id)} style={styles.menuButton}>
          <IconSymbol name="ellipsis" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsContainer}>
        {item.watts ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="bolt.fill" size={14} color={iconColor} />
            <ThemedText style={styles.metricText}>{item.watts}W</ThemedText>
          </View>
        ) : null}
        {item.watts && item.bodyWeightKg ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="scalemass.fill" size={14} color={iconColor} />
            <ThemedText style={styles.metricText}>{(item.watts / item.bodyWeightKg).toFixed(2)}W/kg</ThemedText>
          </View>
        ) : null}
        {item.durationMinutes ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="clock" size={14} color={iconColor} />
            <ThemedText style={styles.metricText}>{item.durationMinutes}m</ThemedText>
          </View>
        ) : null}
        {item.distanceKm ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="map" size={14} color={iconColor} />
            <ThemedText style={styles.metricText}>{item.distanceKm}km</ThemedText>
          </View>
        ) : null}
        {item.heartRate ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="heart.fill" size={14} color="#ff3b30" />
            <ThemedText style={styles.metricText}>{item.heartRate}bpm</ThemedText>
          </View>
        ) : null}
        {item.calories ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="flame.fill" size={14} color="#ff9500" />
            <ThemedText style={styles.metricText}>{item.calories}cal</ThemedText>
          </View>
        ) : null}
        {item.incline ? (
          <View style={[styles.metric, { backgroundColor: metricBg }]}>
            <IconSymbol name="arrow.up.right" size={14} color={iconColor} />
            <ThemedText style={styles.metricText}>{item.incline}% ({(Math.atan(item.incline / 100) * (180 / Math.PI)).toFixed(1)}°)</ThemedText>
          </View>
        ) : null}
        {item.distanceKm && item.durationMinutes ? (
          <>
            <View style={[styles.metric, { backgroundColor: metricBg }]}>
              <IconSymbol name="speedometer" size={14} color={iconColor} />
              <ThemedText style={styles.metricText}>{(item.distanceKm / (item.durationMinutes / 60)).toFixed(1)}km/h</ThemedText>
            </View>
            <View style={[styles.metric, { backgroundColor: metricBg }]}>
              <IconSymbol name="stopwatch" size={14} color={iconColor} />
              <ThemedText style={styles.metricText}>
                {(() => {
                  const pace = item.durationMinutes / item.distanceKm;
                  const m = Math.floor(pace);
                  const s = Math.round((pace - m) * 60);
                  return `${m}'${s.toString().padStart(2, '0')}"/km`;
                })()}
              </ThemedText>
            </View>
          </>
        ) : null}
      </View>
      
      {item.notes && (
        <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
      )}
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: Zone } }) => (
    <ThemedView style={[styles.header, { backgroundColor: containerBg }]}>
      <ThemedText type="title" style={styles.headerText}>{title}</ThemedText>
    </ThemedView>
  );

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No workouts logged yet.</ThemedText>
          </ThemedView>
        }
      />
      
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
        animationType="none"
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <View style={[styles.menuDropdown, { top: menuPosition.top, right: menuPosition.right, backgroundColor: menuBg, borderColor }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => activeWorkoutId && handleEdit(activeWorkoutId)}>
              <IconSymbol name="pencil" size={16} color="#0a7ea4" />
              <ThemedText style={styles.menuText}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => activeWorkoutId && handleDelete(activeWorkoutId)}>
              <IconSymbol name="trash" size={16} color="#ff3b30" />
              <ThemedText style={[styles.menuText, { color: '#ff3b30' }]}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <WorkoutCalendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        workouts={allWorkouts}
      />

      <PersonalRecordsModal
        visible={prVisible}
        onClose={() => setPrVisible(false)}
        workouts={allWorkouts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    marginBottom: 5,
  },
  headerText: {
    fontSize: 20,
    // color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 2,
  },
  typeText: {
    fontSize: 14,
    // color: '#666',
  },
  menuButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuDropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  menuText: {
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricText: {
    fontSize: 12,
    // color: '#444',
  },
  notesText: {
    fontSize: 13,
    // color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
