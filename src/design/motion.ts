/**
 * Motion Design System - Apple Design Award-Level
 * Design Tokens für Animationen, Timing, Spacing, Typography
 */

// Durations (iOS-Standard)
export const Motion = {
  duration: {
    instant: 80,
    fast: 140,
    base: 240,
    slow: 380,
    deliberate: 450,
  },

  // Curves (Apple System)
  curve: {
    // Für Entrances (sanft reinkommend)
    enter: {
      easing: 'cubic-bezier(0.12, 0.95, 0.35, 1)' as const,
      damping: 14,
      stiffness: 220,
      mass: 1,
    },
    // Für Exits (schnell raus)
    exit: {
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
      damping: 18,
      stiffness: 280,
      mass: 0.8,
    },
    // Standard für Interaktionen
    spring: {
      damping: 15,
      stiffness: 200,
      mass: 1,
      overshootClamping: false,
    },
    smooth: [0.2, 0.8, 0.2, 1] as const,
    soft: [0.16, 1, 0.3, 1] as const,
    press: [0.2, 0, 0, 1] as const,
  },

  // Scale Values
  scale: {
    press: 0.985,
    hover: 1.02,
    emphasis: 1.04,
  },

  // Opacity Values
  opacity: {
    disabled: 0.4,
    dimmed: 0.6,
    pressed: 0.85,
    full: 1,
  },

  // Radii (iOS-Standard)
  radius: {
    small: 10,
    base: 12,
    large: 16,
    xlarge: 20,
  },

  // Hit Targets (Apple HIG)
  hitTarget: {
    minimum: 44,
    comfortable: 48,
  },
} as const;

// Spacing System (8pt Grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

// Typography (SF Pro-inspired)
export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400' as const, lineHeight: 13 },
} as const;

// Colors (iOS System)
export const Colors = {
  primary: '#42D674',
  secondary: '#80EF80',
  success: '#80EF80',
  warning: '#FF9500',
  danger: '#FF3B30',
  
  label: {
    primary: '#101713',
    secondary: 'rgba(16, 23, 19, 0.70)',
    tertiary: 'rgba(16, 23, 19, 0.58)',
    quaternary: 'rgba(16, 23, 19, 0.38)',
  },
  
  fill: {
    primary: '#BADBA2',
    secondary: '#E3F0A3',
    tertiary: '#F2F5E8',
    quaternary: '#F7F8F1',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F8F1',
    tertiary: '#FFFFFF',
  },
  
  separator: {
    opaque: 'rgba(16, 23, 19, 0.18)',
    nonOpaque: 'rgba(16, 23, 19, 0.10)',
  },
} as const;
