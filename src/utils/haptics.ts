/**
 * Haptic Feedback Utility
 * Wrapper für expo-haptics mit Platform-spezifischen Optimierungen
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const HapticFeedback = {
  light: () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  selection: () => {
    Haptics.selectionAsync();
  },

  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
