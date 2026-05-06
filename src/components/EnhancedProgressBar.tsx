import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, Text, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  percent: number;
  height?: number;
  /** Progress fill color (defaults to theme primary) */
  color?: string;
  showLabel?: boolean;
}

const EnhancedProgressBar = React.memo<Props>(({ percent, height = 10, color, showLabel = false }) => {
  const clamped = useMemo(() => Math.max(0, Math.min(100, Math.round(percent))), [percent]);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: clamped,
      useNativeDriver: false,
      friction: 8,
      tension: 80,
    }).start();
    
    Animated.timing(countAnim, {
      toValue: clamped,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim, countAnim]);

  const widthInterpolate = useMemo(
    () => widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
    [widthAnim]
  );
  
  const label = useMemo(
    () => countAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 100] }),
    [countAnim]
  );

  const containerStyle: ViewStyle = {
    height,
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  };

  const fillColor = color ?? colors.primary;

  const progressStyle: Animated.AnimatedProps<ViewStyle> = {
    height,
    width: widthInterpolate,
    backgroundColor: fillColor,
    borderRadius: 10,
  };

  const labelStyle: TextStyle = {
    marginTop: 6,
    fontWeight: '700',
    color: fillColor,
  };

  return (
    <View>
      <View style={containerStyle}>
        <Animated.View style={progressStyle} />
      </View>
      {showLabel && (
        <Animated.Text style={labelStyle}>
          {label as unknown as number}%
        </Animated.Text>
      )}
    </View>
  );
});

EnhancedProgressBar.displayName = 'EnhancedProgressBar';

export default EnhancedProgressBar;


