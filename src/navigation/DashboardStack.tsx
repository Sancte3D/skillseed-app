import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { DashboardStackParamList } from './types';
import { GlobalDashboardScreen } from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

/**
 * Dashboard Stack Navigator
 * Handles: GlobalDashboard, SkillDashboard
 * Apple-grade transitions
 */
export function DashboardStack() {
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
      <Stack.Screen name="GlobalDashboard" component={GlobalDashboardScreen} />
      <Stack.Screen name="SkillDashboard" component={SkillDashboardScreen} />
    </Stack.Navigator>
  );
}

// Placeholder component
function SkillDashboardScreen() {
  return null;
}
