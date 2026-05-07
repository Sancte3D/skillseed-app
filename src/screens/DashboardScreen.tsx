import React, { useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TextStyle,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Motion, Typography, Spacing } from '../design/motion';
import type { AppThemePalette } from '../theme';
import { resolveAppTheme } from '../theme';

type DashboardTextStyles = {
  title: TextStyle;
  subtitle: TextStyle;
  sectionTitle: TextStyle;
  statValue: TextStyle;
  statTitle: TextStyle;
  statSubtitle: TextStyle;
  activityTitle: TextStyle;
  activityTime: TextStyle;
};

function useDashboardThemed(): { t: AppThemePalette; text: DashboardTextStyles } {
  const isDark = useColorScheme() === 'dark';
  return useMemo(() => {
    const t = resolveAppTheme(isDark);
    const text: DashboardTextStyles = {
      title: { ...Typography.largeTitle, color: t.text, marginBottom: Spacing.xs },
      subtitle: { ...Typography.callout, color: t.muted },
      sectionTitle: { ...Typography.title2, color: t.text, marginBottom: Spacing.base },
      statValue: { ...Typography.title1, color: t.text, marginBottom: Spacing.xs },
      statTitle: { ...Typography.callout, color: t.muted, marginBottom: Spacing.xs },
      statSubtitle: { ...Typography.footnote, color: t.textSoft },
      activityTitle: { ...Typography.headline, color: t.text, marginBottom: Spacing.xs },
      activityTime: { ...Typography.footnote, color: t.muted },
    };
    return { t, text };
  }, [isDark]);
}

/** Layout-only styles; foreground/background colors come from the active theme palette. */
const layout = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 120,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: Motion.radius.large,
    padding: Spacing.base,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  carouselContainer: {
    position: 'relative',
  },
  carousel: {
    paddingRight: Spacing.base,
    gap: Spacing.base,
  },
  activityCard: {
    borderRadius: Motion.radius.large,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  activityIconText: {
    fontSize: 28,
  },
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

/**
 * Global Dashboard Screen (React Navigation path)
 */
export function GlobalDashboardScreen() {
  const { width } = useWindowDimensions();
  const { t, text: textStyles } = useDashboardThemed();
  const cardWidth = width * 0.7;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={[stylesRoot.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={layout.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.primary}
            colors={[t.primary]}
          />
        }
      >
        <Animated.View entering={FadeIn.duration(Motion.duration.base)} style={layout.header}>
          <Text style={textStyles.title}>Dashboard</Text>
          <Text style={textStyles.subtitle}>Deine Übersicht</Text>
        </Animated.View>

        <View style={layout.statsGrid}>
          <StatCard
            title="Skills"
            value="24"
            subtitle="In Progress"
            stripe={t.primary}
            delay={100}
            t={t}
            textStyles={textStyles}
          />
          <StatCard
            title="Time"
            value="148h"
            subtitle="This Month"
            stripe={t.primarySoft}
            delay={150}
            t={t}
            textStyles={textStyles}
          />
          <StatCard
            title="Streak"
            value="12"
            subtitle="Days"
            stripe={t.success}
            delay={200}
            t={t}
            textStyles={textStyles}
          />
          <StatCard
            title="XP"
            value="2.4k"
            subtitle="Total"
            stripe={t.feedbackPoor}
            delay={250}
            t={t}
            textStyles={textStyles}
          />
        </View>

        <View style={layout.section}>
          <Text style={textStyles.sectionTitle}>Recent Activity</Text>
          <View style={layout.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={layout.carousel}
              decelerationRate="fast"
              snapToInterval={cardWidth + Spacing.base}
            >
              {[1, 2, 3, 4].map((item, index) => (
                <ActivityCard
                  key={item}
                  index={index}
                  delay={300 + index * 50}
                  cardWidth={cardWidth}
                  t={t}
                  textStyles={textStyles}
                />
              ))}
            </ScrollView>

            <LinearGradient
              colors={[...t.gradients.edgeHFadeLeft]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={layout.fadeLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[...t.gradients.edgeHFadeRight]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={layout.fadeRight}
              pointerEvents="none"
            />
          </View>
        </View>

        <View style={layout.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesRoot = StyleSheet.create({
  fill: { flex: 1 },
});

function StatCard({
  title,
  value,
  subtitle,
  stripe,
  delay,
  t,
  textStyles,
}: {
  title: string;
  value: string;
  subtitle: string;
  stripe: string;
  delay: number;
  t: AppThemePalette;
  textStyles: DashboardTextStyles;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(Motion.duration.base)}
      style={[
        layout.statCard,
        {
          backgroundColor: t.card,
          borderLeftColor: stripe,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          shadowColor: '#000',
        },
      ]}
    >
      <Text style={textStyles.statValue}>{value}</Text>
      <Text style={textStyles.statTitle}>{title}</Text>
      <Text style={textStyles.statSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

function ActivityCard({
  index,
  delay,
  cardWidth,
  t,
  textStyles,
}: {
  index: number;
  delay: number;
  cardWidth: number;
  t: AppThemePalette;
  textStyles: DashboardTextStyles;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(Motion.duration.base)}
      style={[
        layout.activityCard,
        {
          width: cardWidth,
          backgroundColor: t.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          shadowColor: '#000',
        },
      ]}
    >
      <View style={[layout.activityIcon, { backgroundColor: t.seedMuted }]}>
        <Text style={layout.activityIconText}>🎯</Text>
      </View>
      <Text style={textStyles.activityTitle}>Skill Training #{index + 1}</Text>
      <Text style={textStyles.activityTime}>2 hours ago</Text>
    </Animated.View>
  );
}
