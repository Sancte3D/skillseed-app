import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { ProfileStackParamList } from './types';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * Profile Stack Navigator
 * Apple-grade transitions
 */
export function ProfileStack() {
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
