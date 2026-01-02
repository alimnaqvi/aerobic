/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f8f9fa', // iOS Grouped Background style
    card: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e5e5ea', // iOS Separator
    modalOverlay: 'rgba(0,0,0,0.5)',
    headerBackground: '#f8f9fa',
    danger: '#ff3b30',
    success: '#34c759',
    warning: '#ffcc00',
    info: '#0a7ea4',
    element: '#f2f2f7',
    placeholder: '#C7C7CC',
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000', // True black
    card: '#1C1C1E', // iOS Dark Mode Secondary System Background
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#38383A', // iOS Dark Mode Separator
    modalOverlay: 'rgba(0,0,0,0.7)',
    headerBackground: '#000000',
    danger: '#ff453a',
    success: '#32d74b',
    warning: '#ffd60a',
    info: '#64d2ff',
    element: '#2c2c2e',
    placeholder: '#545458',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
