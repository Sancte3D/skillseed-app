import React, { useCallback } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Motion, Colors, Spacing } from '../design/motion';
import { HapticFeedback } from '../utils/haptics';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function IconButton({
  onPress,
  children,
  disabled = false,
  size = 'medium',
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(Motion.scale.press, Motion.curve.spring);
    opacity.value = withTiming(0.7, { duration: Motion.duration.instant });
    HapticFeedback.selection();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, Motion.curve.spring);
    opacity.value = withTiming(1, { duration: Motion.duration.fast });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled) {
      HapticFeedback.light();
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <Animated.View style={[styles[size], animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        hitSlop={12}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    width: 32,
    height: 32,
    borderRadius: Motion.radius.small,
  },
  medium: {
    width: Motion.hitTarget.minimum,
    height: Motion.hitTarget.minimum,
    borderRadius: Motion.radius.base,
  },
  large: {
    width: 52,
    height: 52,
    borderRadius: Motion.radius.large,
  },
});
