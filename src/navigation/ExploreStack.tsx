import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { ExploreStackParamList } from './types';
import { ExploreScreen } from '../screens/ExploreScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

/**
 * Explore Stack Navigator
 * Handles: Explore, Search, SkillDetail, Assessment, Result, Quiz, etc.
 * Apple-grade transitions: iOS horizontal push, smooth animations
 */
export function ExploreStack() {
  const screenOptions = {
    headerShown: false,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animation: 'default' as const, // iOS: slide from right
    animationDuration: 220,
    contentStyle: {
      backgroundColor: '#FFFFFF',
    },
    // iOS-spezifische Optionen
    ...(Platform.OS === 'ios' && {
      headerBackTitleVisible: false,
      headerTintColor: '#007AFF',
    }),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Explore" component={ExploreScreen} />
      {/* TODO: Migrate remaining screens from App.tsx */}
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

// Placeholder for screens that need to be migrated
function PlaceholderScreen() {
  return null;
}
