import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef, useState } from 'react';
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';
import { ThemedButton } from './ThemedButton';

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
  const [visible, setVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const windowWidth = Dimensions.get('window').width;
      const dropdownWidth = Math.max(width, 200);
      let left = x;
      
      // If dropdown goes off-screen to the right, align it to the right edge of the screen with some padding
      if (x + dropdownWidth > windowWidth - 16) {
        left = Math.max(16, windowWidth - dropdownWidth - 16);
      }

      setDropdownLayout({
        top: y + height + 4,
        left: left,
        width: width,
      });
      setVisible(true);
    });
  };

  const handleSelect = (option: string) => {
    onValueChange(option);
    setVisible(false);
  };

  const handleAdd = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      onValueChange(newOption.trim());
      setNewOption('');
      setIsAdding(false);
      setVisible(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setIsAdding(false);
  };

  return (
    <View>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity 
        ref={triggerRef}
        style={[styles.selector, { backgroundColor, borderColor }]} 
        onPress={openDropdown}
      >
        <ThemedText style={{ color: value ? textColor : placeholderColor, flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </ThemedText>
        <IconSymbol name="chevron.down" size={20} color={textColor} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <View 
              style={[
                styles.dropdown, 
                { 
                  top: dropdownLayout.top, 
                  left: dropdownLayout.left, 
                  width: Math.max(dropdownLayout.width, 200),
                  backgroundColor, 
                  borderColor,
                }
              ]}
              onStartShouldSetResponder={() => true}
            >
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
                        {item === value && <IconSymbol name="checkmark" size={16} color={textColor} />}
                      </TouchableOpacity>
                    )}
                    style={styles.list}
                    nestedScrollEnabled={true}
                  />
                  {onAddOption && (
                    <TouchableOpacity 
                      style={[styles.addButton, { borderTopColor: borderColor }]}
                      onPress={() => setIsAdding(true)}
                    >
                      <IconSymbol name="plus.circle.fill" size={20} color={textColor} />
                      <ThemedText>Add New...</ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.addContainer}>
                  <ThemedText type="subtitle" style={{marginBottom: 8}}>Add New Option</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                    value={newOption}
                    onChangeText={setNewOption}
                    placeholder="Enter name"
                    placeholderTextColor={placeholderColor}
                    autoFocus
                  />
                  <View style={styles.addActions}>
                    <ThemedButton 
                      title="Cancel" 
                      onPress={() => setIsAdding(false)} 
                      variant="ghost" 
                      size="small"
                      style={{ flex: 1 }}
                    />
                    <ThemedButton 
                      title="Add" 
                      onPress={handleAdd} 
                      size="small"
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dropdown: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 250,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedOption: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  addContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 12,
  },
  addActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
