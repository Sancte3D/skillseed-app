import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from '../components/Button';
import { TabSwitchButton } from '../components/TabSwitchButton';
import { Motion, Colors, Typography, Spacing } from '../design/motion';

/**
 * Explore Screen - Main entry point for browsing skills
 * Apple Design Award-Level: Smooth animations, Cross-Navigation, Haptics
 */
export function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View 
        entering={FadeIn.duration(Motion.duration.base)}
        style={styles.content}
      >
        <Text style={styles.title}>SkillSeed</Text>
        <Text style={styles.subtitle}>Navigation ist aktiv! 🎉</Text>
        <Text style={styles.info}>
          Tab Navigation funktioniert. Die Screens werden jetzt nach und nach migriert.
        </Text>

        <View style={styles.buttonGroup}>
          <TabSwitchButton
            targetTab="DashboardTab"
            targetScreen="GlobalDashboard"
            title="Go to Dashboard"
            variant="primary"
            size="large"
          />
          
          <TabSwitchButton
            targetTab="TimerTab"
            title="Open Timer"
            variant="secondary"
          />
          
          <TabSwitchButton
            targetTab="ProfileTab"
            title="View Profile"
            variant="tertiary"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.label.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.title2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  info: {
    ...Typography.body,
    color: Colors.label.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.base,
    marginTop: Spacing.xl,
  },
});
