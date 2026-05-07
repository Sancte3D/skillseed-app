import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { RootTabParamList } from './types';
import { ExploreStack } from './ExploreStack';
import { DashboardStack } from './DashboardStack';
import { TimerStack } from './TimerStack';
import { ProfileStack } from './ProfileStack';
import { resolveAppTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Root Navigation Container with Tab Navigator
 * This is the main navigation structure - only ONE NavigationContainer!
 * Apple Design Award-Level: Haptics, smooth transitions, proper safe areas
 */
export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootTabParamList>();
  const isDark = useColorScheme() === 'dark';
  const t = resolveAppTheme(isDark);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                elevation: 0,
                backgroundColor: t.overlays.tabBarChrome,
                borderTopWidth: 0.5,
                borderTopColor: t.border,
                height: 88,
                paddingBottom: 8,
                paddingTop: 8,
                shadowColor: isDark ? '#000' : 'rgba(16,23,19,0.12)',
                shadowOffset: { width: 0, height: -1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
              },
              tabBarActiveTintColor: t.text,
              tabBarInactiveTintColor: t.muted,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500',
                marginTop: 4,
              },
              tabBarIconStyle: {
                marginTop: 4,
              },
            }}
            screenListeners={{
              tabPress: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              },
            }}
          >
        <Tab.Screen
          name="ExploreTab"
          component={ExploreStack}
          options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="explore" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStack}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="TimerTab"
          component={TimerStack}
          options={{
            tabBarLabel: 'Timer',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="timer" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStack}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
          </Tab.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
