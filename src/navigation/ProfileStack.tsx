import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, useColorScheme } from 'react-native';
import { ProfileStackParamList } from './types';
import { ProfileScreen } from '../screens/ProfileScreen';
import { resolveAppTheme } from '../theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * Profile Stack Navigator
 * Apple-grade transitions
 */
export function ProfileStack() {
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
