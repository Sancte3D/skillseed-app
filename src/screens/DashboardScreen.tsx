import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DashboardStackParamList } from '../navigation/types';
import { RootTabParamList } from '../navigation/types';
import { Motion, Colors, Typography, Spacing } from '../design/motion';

const { width } = Dimensions.get('window');

/**
 * Global Dashboard Screen
 * Shows overview of all skills and progress
 * Apple Design Award-Level: Pull-to-Refresh, Edge-Fade, Smooth Animations
 */
export function GlobalDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeIn.duration(Motion.duration.base)}
          style={styles.header}
        >
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Deine Übersicht</Text>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Skills"
            value="24"
            subtitle="In Progress"
            color={Colors.primary}
            delay={100}
          />
          <StatCard
            title="Time"
            value="148h"
            subtitle="This Month"
            color={Colors.secondary}
            delay={150}
          />
          <StatCard
            title="Streak"
            value="12"
            subtitle="Days"
            color={Colors.success}
            delay={200}
          />
          <StatCard
            title="XP"
            value="2.4k"
            subtitle="Total"
            color={Colors.warning}
            delay={250}
          />
        </View>

        {/* Horizontal Scroll Section mit Edge Fade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              decelerationRate="fast"
              snapToInterval={width * 0.7 + Spacing.base}
            >
              {[1, 2, 3, 4].map((item, index) => (
                <ActivityCard key={item} index={index} delay={300 + index * 50} />
              ))}
            </ScrollView>
            
            {/* Edge Fade Gradients - perfectly matched to background color #F5F5F5 */}
            <LinearGradient
              colors={['rgba(245,245,245,1)', 'rgba(245,245,245,0.95)', 'rgba(245,245,245,0.7)', 'rgba(245,245,245,0.3)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.fadeLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['transparent', 'rgba(245,245,245,0.3)', 'rgba(245,245,245,0.7)', 'rgba(245,245,245,0.95)', 'rgba(245,245,245,1)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.fadeRight}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* Bottom Padding für Tab Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, color, delay }: any) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(Motion.duration.base)}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

// Activity Card Component
function ActivityCard({ index, delay }: any) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(Motion.duration.base)}
      style={styles.activityCard}
    >
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>🎯</Text>
      </View>
      <Text style={styles.activityTitle}>Skill Training #{index + 1}</Text>
      <Text style={styles.activityTime}>2 hours ago</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 120, // Platz für Tab Bar + Extra
  },
  
  // Header
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.label.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.callout,
    color: Colors.label.secondary,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.background.secondary,
    borderRadius: Motion.radius.large,
    padding: Spacing.base,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    ...Typography.title1,
    color: Colors.label.primary,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    ...Typography.callout,
    color: Colors.label.secondary,
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    ...Typography.footnote,
    color: Colors.label.tertiary,
  },
  
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title2,
    color: Colors.label.primary,
    marginBottom: Spacing.base,
  },
  
  // Carousel
  carouselContainer: {
    position: 'relative',
  },
  carousel: {
    paddingRight: Spacing.base,
    gap: Spacing.base,
  },
  activityCard: {
    width: width * 0.7,
    backgroundColor: Colors.background.secondary,
    borderRadius: Motion.radius.large,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.fill.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  activityIconText: {
    fontSize: 28,
  },
  activityTitle: {
    ...Typography.headline,
    color: Colors.label.primary,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    ...Typography.footnote,
    color: Colors.label.tertiary,
  },
  
  // Edge Fade
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 32,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 32,
  },
  
  bottomSpacer: {
    height: 40,
  },
});
