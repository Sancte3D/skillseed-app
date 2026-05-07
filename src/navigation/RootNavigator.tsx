import React from 'react';
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
import { colors } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Root Navigation Container with Tab Navigator
 * This is the main navigation structure - only ONE NavigationContainer!
 * Apple Design Award-Level: Haptics, smooth transitions, proper safe areas
 */
export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootTabParamList>();

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
                backgroundColor: 'rgba(255,255,255,0.82)',
                borderTopWidth: 0.5,
                borderTopColor: colors.border,
                height: 88,
                paddingBottom: 8,
                paddingTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              tabBarActiveTintColor: colors.text,
              tabBarInactiveTintColor: colors.muted,
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
