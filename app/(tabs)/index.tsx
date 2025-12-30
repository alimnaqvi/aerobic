import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/services/storage';
import { WorkoutLog, Zone } from '@/types/workout';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [sections, setSections] = useState<{ title: Zone; data: WorkoutLog[] }[]>([]);

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

  const formatWorkoutDetails = (item: WorkoutLog) => {
    const parts = [];
    if (item.watts) parts.push(`~${item.watts}W`);
    if (item.durationMinutes) parts.push(`${item.durationMinutes} minutes`);
    if (item.distanceKm) parts.push(`${item.distanceKm} km`);
    if (item.heartRate) parts.push(`${item.heartRate} heart rate`);
    if (item.calories) parts.push(`${item.calories} calories burned`);
    if (item.tempo) parts.push(`${item.tempo} tempo`);
    if (item.speed) parts.push(`${item.speed} km/h`);
    if (item.elevation) parts.push(`${item.elevation} elevation`);
    
    let details = parts.join(', ');
    if (item.notes) {
      details += ` (Note: ${item.notes})`;
    }
    return details;
  };

  const renderItem = ({ item }: { item: WorkoutLog }) => (
    <View style={styles.itemContainer}>
      <ThemedText type="defaultSemiBold">
        {item.date}: {item.type}
      </ThemedText>
      <ThemedText style={styles.details}>
        {formatWorkoutDetails(item)}
      </ThemedText>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: Zone } }) => (
    <ThemedView style={styles.header}>
      <ThemedText type="title">{title}</ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No workouts logged yet.</ThemedText>
          </ThemedView>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 20,
  },
  header: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  itemContainer: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  details: {
    marginTop: 5,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
