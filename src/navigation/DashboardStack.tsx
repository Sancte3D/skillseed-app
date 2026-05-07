import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardStackParamList } from './types';
import { GlobalDashboardScreen } from '../screens/DashboardScreen';
import { resolveAppTheme } from '../theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

/**
 * Dashboard Stack Navigator
 * Handles: GlobalDashboard, SkillDashboard
 * Apple-grade transitions
 */
export function DashboardStack() {
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
      <Stack.Screen name="GlobalDashboard" component={GlobalDashboardScreen} />
      <Stack.Screen name="SkillDashboard" component={SkillDashboardScreen} />
    </Stack.Navigator>
  );
}

// Placeholder until the skill-scoped dashboard is implemented
function SkillDashboardScreen() {
  const isDark = useColorScheme() === 'dark';
  const t = resolveAppTheme(isDark);
  return (
    <SafeAreaView style={[stylesSkill.fill, { backgroundColor: t.background }]} edges={['top']}>
      <Text style={[TypographyCompat.title, { color: t.text }]}>Skill Dashboard</Text>
      <Text style={[TypographyCompat.sub, { color: t.muted }]}>Coming soon</Text>
    </SafeAreaView>
  );
}

const stylesSkill = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
});

const TypographyCompat = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700' },
  sub: { fontSize: 16, marginTop: 8 },
});
