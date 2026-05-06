import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { TimerStackParamList } from './types';
import { TimerScreen } from '../screens/TimerScreen';

const Stack = createNativeStackNavigator<TimerStackParamList>();

/**
 * Timer Stack Navigator
 * Apple-grade transitions
 */
export function TimerStack() {
  const screenOptions = {
    headerShown: false,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animation: 'default' as const,
    animationDuration: 220,
    contentStyle: {
      backgroundColor: '#FFFFFF',
    },
    ...(Platform.OS === 'ios' && {
      headerBackTitleVisible: false,
      headerTintColor: '#007AFF',
    }),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Timer" component={TimerScreen} />
    </Stack.Navigator>
  );
}
