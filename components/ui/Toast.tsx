import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, type, visible, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#333';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark.circle.fill';
      case 'error': return 'exclamationmark.circle.fill';
      case 'info': return 'info.circle.fill';
      default: return 'info.circle.fill';
    }
  };

  return (
    <Animated.View 
      entering={SlideInUp} 
      exiting={SlideOutUp}
      style={[
        styles.container, 
        { 
          backgroundColor: getBackgroundColor(),
          top: insets.top + 10, // Position below status bar
        }
      ]}
    >
      <View style={styles.content}>
        <IconSymbol name={getIcon()} size={24} color="#fff" />
        <ThemedText style={styles.text}>{message}</ThemedText>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <IconSymbol name="xmark" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    ...Platform.select({
      web: {
        maxWidth: 600,
        left: '50%',
        transform: [{ translateX: '-50%' }] as any,
      }
    })
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
