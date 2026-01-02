import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Modal, ModalProps, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface ThemedModalProps extends ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ThemedModal({ visible, onClose, children, ...props }: ThemedModalProps) {
  const overlayColor = useThemeColor({}, 'modalOverlay');
  const backgroundColor = useThemeColor({}, 'card');

  if (Platform.OS === 'web') {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
        {...props}
      >
        <View style={[styles.webOverlay, { backgroundColor: overlayColor }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.webContent, { backgroundColor }]}>
            {children}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      {...props}
    >
      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webContent: {
    width: '100%',
    maxWidth: 600,
    height: '80%', // Or 'auto' with maxHeight
    maxHeight: 800,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
