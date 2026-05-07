import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, useColorScheme } from 'react-native';
import { TimerStackParamList } from './types';
import { TimerScreen } from '../screens/TimerScreen';
import { resolveAppTheme } from '../theme';

const Stack = createNativeStackNavigator<TimerStackParamList>();

/**
 * Timer Stack Navigator
 * Apple-grade transitions
 */
export function TimerStack() {
  const isDark = useColorScheme() === 'dark';
  const t = resolveAppTheme(isDark);
  const screenOptions = {
    headerShown: false,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animation: 'default' as const,
    animationDuration: 220,
    contentStyle: {
      backgroundColor: t.background,
    },
    ...(Platform.OS === 'ios' && {
      headerBackTitleVisible: false,
      headerTintColor: t.primary,
    }),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Timer" component={TimerScreen} />
    </Stack.Navigator>
  );
}
