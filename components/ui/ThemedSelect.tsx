import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';
import { ThemedButton } from './ThemedButton';
import { ThemedModal } from './ThemedModal';

interface ThemedSelectProps {
  label?: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  onAddOption?: (option: string) => void;
  placeholder?: string;
}

export function ThemedSelect({ 
  label, 
  value, 
  options, 
  onValueChange, 
  onAddOption,
  placeholder = 'Select an option'
}: ThemedSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');

  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const iconColor = useThemeColor({}, 'icon');

  const handleSelect = (option: string) => {
    onValueChange(option);
    setModalVisible(false);
  };

  const handleAdd = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      onValueChange(newOption.trim());
      setNewOption('');
      setIsAdding(false);
      setModalVisible(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setIsAdding(false);
  };

  return (
    <View>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity 
        style={[styles.selector, { backgroundColor, borderColor }]} 
        onPress={() => setModalVisible(true)}
      >
        <ThemedText style={{ color: value ? textColor : placeholderColor }}>
          {value || placeholder}
        </ThemedText>
        <IconSymbol name="chevron.down" size={20} color={textColor} />
      </TouchableOpacity>

      <ThemedModal
        visible={modalVisible}
        onClose={handleClose}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <ThemedText type="subtitle">{isAdding ? "Add New Option" : (label || "Select Option")}</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {!isAdding ? (
              <>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.option, { borderBottomColor: borderColor }, item === value && styles.selectedOption]} 
                      onPress={() => handleSelect(item)}
                    >
                      <ThemedText style={{ fontWeight: item === value ? 'bold' : 'normal' }}>
                        {item}
                      </ThemedText>
                      {item === value && <IconSymbol name="checkmark" size={20} color={textColor} />}
                    </TouchableOpacity>
                  )}
                  style={styles.list}
                />
                {onAddOption && (
                  <ThemedButton 
                    title="Add New..." 
                    onPress={() => setIsAdding(true)} 
                    variant="ghost"
                    style={styles.addButton}
                  />
                )}
              </>
            ) : (
              <View style={styles.addContainer}>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                  value={newOption}
                  onChangeText={setNewOption}
                  placeholder="Enter new option name"
                  placeholderTextColor={placeholderColor}
                  autoFocus
                />
                <View style={styles.addActions}>
                  <ThemedButton 
                    title="Cancel" 
                    onPress={() => setIsAdding(false)} 
                    variant="ghost" 
                    style={{ flex: 1 }}
                  />
                  <ThemedButton 
                    title="Add" 
                    onPress={handleAdd} 
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </ThemedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
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
    flex: 1,
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedOption: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addButton: {
    marginTop: 16,
  },
  addContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  addActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
