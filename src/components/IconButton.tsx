import React, { useCallback } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '../design/motion';
import { HapticFeedback } from '../utils/haptics';
import { useReducedMotion } from '../utils/useReducedMotion';

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
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    if (reducedMotion) {
      scale.value = Motion.scale.press;
      opacity.value = Motion.opacity.pressed;
      return;
    }
    scale.value = withSpring(Motion.scale.press, Motion.curve.spring);
    opacity.value = withTiming(Motion.opacity.pressed, { duration: Motion.duration.fast });
    HapticFeedback.selection();
  }, [opacity, reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    scale.value = withSpring(1, Motion.curve.spring);
    opacity.value = withTiming(1, { duration: Motion.duration.base });
  }, [opacity, reducedMotion, scale]);

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
