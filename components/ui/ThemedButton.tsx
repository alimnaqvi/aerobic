import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ThemedButtonProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');
  const secondaryColor = useThemeColor({}, 'element');
  const backgroundColor = useThemeColor({}, 'card');
  
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return '#A0A0A0'; // Maybe use a 'disabled' color from theme?
    
    switch (variant) {
      case 'primary':
        return pressed ? primaryColor : primaryColor; // Opacity handled by style usually, but here explicit.
      case 'secondary':
        return pressed ? secondaryColor : secondaryColor;
      case 'danger':
        return pressed ? dangerColor : dangerColor;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#E0E0E0';
    
    switch (variant) {
      case 'primary':
        return backgroundColor;
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return primaryColor;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? '#A0A0A0' : primaryColor;
    }
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 24 };
      default: // medium
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: (pressed || disabled) && (variant === 'outline' || variant === 'ghost') ? 0.6 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <ThemedText
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

// Helper to adjust opacity
function opacity(color: string, opacity: number) {
  // Simple hex to rgba conversion could be added here if needed
  // For now, relying on the fact that tintColor is usually a solid hex
  return color; 
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: '0.2s',
      },
    }),
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
