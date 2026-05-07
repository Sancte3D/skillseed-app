import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Motion, Colors, Typography, Spacing } from '../design/motion';
import { HapticFeedback } from '../utils/haptics';
import { useReducedMotion } from '../utils/useReducedMotion';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
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
    HapticFeedback.light();
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
    if (!disabled && !loading) {
      HapticFeedback.medium();
      onPress();
    }
  }, [disabled, loading, onPress]);

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`${variant}Label`],
    styles[`${size}Label`],
    disabled && styles.disabledLabel,
    textStyle,
  ];

  return (
    <Animated.View style={[animatedStyle, buttonStyles]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.pressable, fullWidth && { width: '100%' }]}
        hitSlop={8}
      >
        {leftIcon && <>{leftIcon}</>}
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? Colors.label.primary : Colors.primary}
            style={styles.loader}
          />
        ) : (
          <Text style={labelStyles}>{title}</Text>
        )}
        {rightIcon && <>{rightIcon}</>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Motion.radius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.fill.secondary,
    borderWidth: 1,
    borderColor: Colors.separator.nonOpaque,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: Motion.hitTarget.minimum,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: Motion.hitTarget.comfortable,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  
  // States
  disabled: {
    opacity: Motion.opacity.disabled,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Labels
  label: {
    ...Typography.headline,
    textAlign: 'center',
  },
  primaryLabel: {
    color: Colors.label.primary,
  },
  secondaryLabel: {
    color: Colors.primary,
  },
  tertiaryLabel: {
    color: Colors.primary,
  },
  dangerLabel: {
    color: '#FFFFFF',
  },
  smallLabel: {
    ...Typography.callout,
  },
  mediumLabel: {
    ...Typography.headline,
  },
  largeLabel: {
    ...Typography.title3,
  },
  disabledLabel: {
    opacity: 1,
  },
  
  loader: {
    marginHorizontal: Spacing.sm,
  },
});
