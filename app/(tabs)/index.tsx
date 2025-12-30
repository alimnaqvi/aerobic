import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StorageService } from '@/services/storage';
import { WorkoutLog, Zone } from '@/types/workout';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [sections, setSections] = useState<{ title: Zone; data: WorkoutLog[] }[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/log')} style={{ marginRight: 10 }}>
          <IconSymbol name="plus" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const workouts = await StorageService.getWorkouts();
    
    // Group by Zone
    const zone2 = workouts.filter(w => w.zone === 'Zone 2').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const zone5 = workouts.filter(w => w.zone === 'Zone 5').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const newSections = [];
    if (zone2.length > 0) newSections.push({ title: 'Zone 2' as Zone, data: zone2 });
    if (zone5.length > 0) newSections.push({ title: 'Zone 5' as Zone, data: zone5 });

    setSections(newSections);
  };

  const handleDelete = async (id: string) => {
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
    router.push({ pathname: '/edit-workout', params: { id } });
    setExpandedId(null);
  };

  const toggleMenu = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: WorkoutLog }) => (
    <View style={[styles.card, { zIndex: expandedId === item.id ? 100 : 1 }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="defaultSemiBold" style={styles.dateText}>{item.date}</ThemedText>
          <ThemedText style={styles.typeText}>{item.type}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => toggleMenu(item.id)} style={styles.menuButton}>
          <IconSymbol name="ellipsis" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {expandedId === item.id && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleEdit(item.id)}>
            <IconSymbol name="pencil" size={16} color="#0a7ea4" />
            <ThemedText style={styles.menuText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleDelete(item.id)}>
            <IconSymbol name="trash" size={16} color="#ff3b30" />
            <ThemedText style={[styles.menuText, { color: '#ff3b30' }]}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.metricsContainer}>
        {item.watts ? (
          <View style={styles.metric}>
            <IconSymbol name="bolt.fill" size={14} color="#666" />
            <ThemedText style={styles.metricText}>{item.watts}W</ThemedText>
          </View>
        ) : null}
        {item.durationMinutes ? (
          <View style={styles.metric}>
            <IconSymbol name="clock" size={14} color="#666" />
            <ThemedText style={styles.metricText}>{item.durationMinutes}m</ThemedText>
          </View>
        ) : null}
        {item.distanceKm ? (
          <View style={styles.metric}>
            <IconSymbol name="map" size={14} color="#666" />
            <ThemedText style={styles.metricText}>{item.distanceKm}km</ThemedText>
          </View>
        ) : null}
        {item.heartRate ? (
          <View style={styles.metric}>
            <IconSymbol name="heart.fill" size={14} color="#ff3b30" />
            <ThemedText style={styles.metricText}>{item.heartRate}bpm</ThemedText>
          </View>
        ) : null}
        {item.calories ? (
          <View style={styles.metric}>
            <IconSymbol name="flame.fill" size={14} color="#ff9500" />
            <ThemedText style={styles.metricText}>{item.calories}cal</ThemedText>
          </View>
        ) : null}
      </View>
      
      {item.notes && (
        <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
      )}
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: Zone } }) => (
    <ThemedView style={styles.header}>
      <ThemedText type="title" style={styles.headerText}>{title}</ThemedText>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
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
      {expandedId && (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => setExpandedId(null)} 
        />
      )}
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
    color: '#333',
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
    color: '#666',
  },
  menuButton: {
    padding: 4,
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
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
    color: '#444',
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
