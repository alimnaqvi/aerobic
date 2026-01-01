import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedModal } from '@/components/ui/ThemedModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WorkoutLog, Zone } from '@/types/workout';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface PersonalRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  workouts: WorkoutLog[];
}

type PRRecord = { value: number; date: string };

interface PRStats {
  maxWatts?: PRRecord;
  maxWattsPerKg?: PRRecord;
  maxDistance?: PRRecord;
  maxDuration?: PRRecord;
  maxSpeed?: PRRecord;
}

export function PersonalRecordsModal({ visible, onClose, workouts }: PersonalRecordsModalProps) {
  const [selectedZone, setSelectedZone] = useState<Zone>('Zone 2');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1C1C1E' }, 'background');
  const headerBg = useThemeColor({ light: '#f8f9fa', dark: '#000000' }, 'background');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const iconColor = useThemeColor({}, 'icon');
  const activeTabBg = useThemeColor({ light: '#e0e0e0', dark: '#3a3a3c' }, 'background');

  const prs = useMemo(() => {
    const stats: Record<string, Record<string, PRStats>> = {};

    workouts.forEach(workout => {
      const { type, zone, date, watts, distanceKm, durationMinutes, bodyWeightKg } = workout;

      if (!stats[type]) stats[type] = {};
      if (!stats[type][zone]) stats[type][zone] = {};

      const currentStats = stats[type][zone];

      // Max Watts
      if (watts && (!currentStats.maxWatts || watts > currentStats.maxWatts.value)) {
        currentStats.maxWatts = { value: watts, date };
      }

      // Max Watts/kg
      if (watts && bodyWeightKg) {
        const wkg = watts / bodyWeightKg;
        if (!currentStats.maxWattsPerKg || wkg > currentStats.maxWattsPerKg.value) {
          currentStats.maxWattsPerKg = { value: wkg, date };
        }
      }

      // Max Distance
      if (distanceKm && (!currentStats.maxDistance || distanceKm > currentStats.maxDistance.value)) {
        currentStats.maxDistance = { value: distanceKm, date };
      }

      // Max Duration
      if (durationMinutes && (!currentStats.maxDuration || durationMinutes > currentStats.maxDuration.value)) {
        currentStats.maxDuration = { value: durationMinutes, date };
      }

      // Max Speed
      if (distanceKm && durationMinutes) {
        const speed = distanceKm / (durationMinutes / 60);
        if (!currentStats.maxSpeed || speed > currentStats.maxSpeed.value) {
          currentStats.maxSpeed = { value: speed, date };
        }
      }
    });

    return stats;
  }, [workouts]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const renderPRItem = (label: string, record?: PRRecord, unit: string = '', isDecimal: boolean = false) => {
    if (!record) return null;
    return (
      <View style={[styles.prItem, { borderColor }]}>
        <ThemedText style={styles.prLabel}>{label}</ThemedText>
        <View style={styles.prValueContainer}>
          <ThemedText type="defaultSemiBold" style={styles.prValue}>
            {isDecimal ? record.value.toFixed(2) : record.value}
            <ThemedText style={styles.prUnit}>{unit}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.prDate}>{formatDate(record.date)}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onClose={onClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <ThemedText type="title">Personal Records</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={30} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.filterContainer, { borderBottomColor: borderColor }]}>
          {(['Zone 2', 'Zone 5'] as Zone[]).map((zone) => (
            <TouchableOpacity
              key={zone}
              style={[
                styles.filterButton,
                selectedZone === zone && { backgroundColor: activeTabBg, borderColor: borderColor }
              ]}
              onPress={() => setSelectedZone(zone)}
            >
              <ThemedText style={[
                styles.filterText,
                selectedZone === zone && { fontWeight: '600' }
              ]}>{zone}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {Object.entries(prs).map(([type, zones]) => {
            const stats = zones[selectedZone];
            if (!stats) return null;

            return (
              <View key={type} style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>{type}</ThemedText>
                
                <View style={styles.zoneContainer}>
                  <View style={styles.grid}>
                    {renderPRItem('Best Power', stats.maxWatts, 'W')}
                    {renderPRItem('Best W/kg', stats.maxWattsPerKg, 'W/kg', true)}
                    {renderPRItem('Best Speed', stats.maxSpeed, 'km/h', true)}
                    {renderPRItem('Longest Dist', stats.maxDistance, 'km', true)}
                    {renderPRItem('Longest Time', stats.maxDuration, 'min')}
                  </View>
                </View>
              </View>
            );
          })}
          
          {Object.keys(prs).length === 0 && (
            <View style={styles.emptyState}>
              <ThemedText>No records found yet.</ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </ThemedModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 12,
    color: '#0a7ea4',
  },
  zoneContainer: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  zoneTitle: {
    fontSize: 18,
    marginBottom: 8,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  prLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  prValueContainer: {
    gap: 2,
  },
  prValue: {
    fontSize: 18,
  },
  prUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 2,
  },
  prDate: {
    fontSize: 11,
    opacity: 0.5,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
  },
});
