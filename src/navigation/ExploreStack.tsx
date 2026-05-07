import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, useColorScheme } from 'react-native';
import { ExploreStackParamList } from './types';
import { ExploreScreen } from '../screens/ExploreScreen';
import { resolveAppTheme } from '../theme';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

/**
 * Explore Stack Navigator
 * Handles: Explore, Search, SkillDetail, Assessment, Result, Quiz, etc.
 */
export function ExploreStack() {
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
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Search" component={PlaceholderScreen} />
      <Stack.Screen name="SkillDetail" component={PlaceholderScreen} />
      <Stack.Screen name="Assessment" component={PlaceholderScreen} />
      <Stack.Screen name="Result" component={PlaceholderScreen} />
      <Stack.Screen name="Quiz" component={PlaceholderScreen} />
      <Stack.Screen name="GlobalAssessment" component={PlaceholderScreen} />
      <Stack.Screen name="Onboarding" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

function PlaceholderScreen() {
  return null;
}
