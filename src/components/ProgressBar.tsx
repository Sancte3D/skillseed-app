import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  percent: number;
  height?: number;
}

const ProgressBar = React.memo<Props>(({ percent, height = 8 }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  
  const containerStyle: ViewStyle = {
    height,
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  };
  
  const progressStyle: ViewStyle = {
    width: `${clamped}%`,
    backgroundColor: colors.primary,
    height,
    borderRadius: 10,
  };
  
  return (
    <View style={containerStyle}>
      <View style={progressStyle} />
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;


