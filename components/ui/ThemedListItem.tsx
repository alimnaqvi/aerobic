import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface ThemedListItemProps {
  title: string;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  showChevron?: boolean;
  variant?: 'default' | 'destructive';
  style?: ViewStyle;
  isLast?: boolean;
  isFirst?: boolean;
}

export function ThemedListItem({
  title,
  value,
  onPress,
  icon,
  showChevron = true,
  variant = 'default',
  style,
  isLast = false,
  isFirst = false,
}: ThemedListItemProps) {
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1C1C1E' }, 'background');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const destructiveColor = '#ff3b30';
  const chevronColor = useThemeColor({ light: '#C7C7CC', dark: '#545458' }, 'icon');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor },
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <ThemedText 
          style={[
            styles.title, 
            variant === 'destructive' && { color: destructiveColor }
          ]}
        >
          {title}
        </ThemedText>
        
        <View style={styles.rightContent}>
          {value && <ThemedText style={styles.value}>{value}</ThemedText>}
          {showChevron && (
            <IconSymbol 
              name="chevron.right" 
              size={20} 
              color={chevronColor} 
            />
          )}
        </View>
      </View>
      {!isLast && <View style={[styles.separator, { backgroundColor: borderColor }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  title: {
    fontSize: 16,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
    color: '#8E8E93',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
});
