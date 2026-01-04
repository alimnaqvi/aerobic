import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WorkoutLog } from '@/types/workout';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

interface WorkoutCalendarProps {
  visible: boolean;
  onClose: () => void;
  workouts: WorkoutLog[];
}

export function WorkoutCalendar({ visible, onClose, workouts }: WorkoutCalendarProps) {
  const calendarBg = useThemeColor({ light: '#ffffff', dark: '#1C1C1E' }, 'background');
  const calendarText = useThemeColor({}, 'text');
  const overlayColor = useThemeColor({ light: 'rgba(0,0,0,0.5)', dark: 'rgba(0,0,0,0.7)' }, 'background');

  const [calendarWidth, setCalendarWidth] = useState<number | undefined>(undefined);

  const markedDates = useMemo(() => {
    const marks: any = {};

    workouts.forEach(workout => {
      const date = workout.date;
      
      // Determine color based on Zone
      // Zone 2 = Blue-ish, Zone 5 = Red/Orange
      let color = '#0a7ea4'; // Default/Zone 2
      if (workout.zone === 'Zone 5') {
        color = '#ff3b30';
      }

      // If multiple workouts, prioritize Zone 5 color
      if (marks[date]) {
        if (workout.zone === 'Zone 5') {
          marks[date] = {
            customStyles: {
              container: {
                backgroundColor: color,
                borderRadius: 8,
              },
              text: {
                color: 'white',
                fontWeight: 'bold',
              }
            }
          };
        }
      } else {
        marks[date] = {
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 8,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            }
          }
        };
      }
    });

    return marks;
  }, [workouts]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={[styles.overlay, { backgroundColor: overlayColor }]} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: calendarBg }]} onPress={(e) => e.stopPropagation()}>
          <ThemedText type="title" style={styles.title}>Workout Calendar</ThemedText>

          <View
            style={styles.calendarContainer}
            onLayout={(e) => {
              const nextWidth = Math.floor(e.nativeEvent.layout.width);
              if (!nextWidth) return;
              setCalendarWidth((prev) => (prev === nextWidth ? prev : nextWidth));
            }}
          >
            <CalendarList
              calendarWidth={calendarWidth}
              style={styles.calendar}
              markingType={'custom'}
              markedDates={markedDates}
              theme={{
                calendarBackground: calendarBg,
                textSectionTitleColor: calendarText,
                dayTextColor: calendarText,
                todayTextColor: '#0a7ea4',
                selectedDayTextColor: '#ffffff',
                monthTextColor: calendarText,
                indicatorColor: calendarText,
                arrowColor: '#0a7ea4',
              }}
            />
          </View>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#0a7ea4' }]} />
              <ThemedText>Zone 2</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#ff3b30' }]} />
              <ThemedText>Zone 5</ThemedText>
            </View>
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  calendarContainer: {
    width: '100%',
  },
  calendar: {
    height: 350,
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});
