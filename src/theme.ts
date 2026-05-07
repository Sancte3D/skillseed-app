/**
 * SkillSeed "Pistachio Dream" — single token source.
 * Always use resolveAppTheme(isDark) in screens; avoid ad-hoc greys unrelated to these tokens.
 */

import type { ColorValue } from 'react-native';

const categoryKeys = {
  Coding: '#42D674',
  'CAD/3D': '#BADBA2',
  'AI/Data': '#80EF80',
  Design: '#E3F0A3',
  Language: '#BADBA2',
  Automation: '#80EF80',
  Communication: '#42D674',
  Creative: '#E3F0A3',
  Data: '#80EF80',
  '3D': '#BADBA2',
} as const satisfies Record<string, string>;

/** Light baseline (explicit values for readability and docs). */
export const colors = {
  background: '#F7F8F1',
  card: '#FFFFFF',
  surfaceSoft: '#F2F5E8',
  text: '#101713',
  muted: 'rgba(16, 23, 19, 0.58)',
  textSoft: 'rgba(16, 23, 19, 0.38)',
  border: 'rgba(16, 23, 19, 0.10)',
  borderStrong: 'rgba(16, 23, 19, 0.18)',
  primary: '#42D674',
  primarySoft: '#80EF80',
  highlight: '#E3F0A3',
  seedMuted: '#BADBA2',
  accent: '#42D674',
  success: '#80EF80',
  link: '#101713',
  lightGray: '#F2F5E8',
  categories: categoryKeys as unknown as Record<string, string>,
} as const;

const darkPalette = {
  background: '#0E120F',
  card: '#151B16',
  surfaceSoft: '#1D251E',
  text: '#F4F7EF',
  muted: 'rgba(244, 247, 239, 0.60)',
  textSoft: 'rgba(244, 247, 239, 0.45)',
  border: 'rgba(244, 247, 239, 0.10)',
  borderStrong: 'rgba(244, 247, 239, 0.18)',
  primary: '#42D674',
  primarySoft: '#80EF80',
  highlight: '#2D3A22',
  seedMuted: '#344A35',
  accent: '#42D674',
  success: '#80EF80',
  link: '#BADBA2',
  lightGray: '#1D251E',
  categories: colors.categories,
} as const;

const LIGHT_BG = '247,248,241';
const DARK_BG = '14,18,15';

export type GradientStops = readonly [ColorValue, ColorValue, ...ColorValue[]];

function gradientStops(colors: string[]): GradientStops {
  return colors as unknown as GradientStops;
}

export type AppThemePalette = {
  background: string;
  card: string;
  surfaceSoft: string;
  text: string;
  muted: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  primary: string;
  primarySoft: string;
  highlight: string;
  seedMuted: string;
  accent: string;
  success: string;
  link: string;
  lightGray: string;
  categories: Record<string, string>;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  headerBackLink: string;
  cardBorder: string;
  semantic: {
    historic: { bg: string; text: string };
    warning: { bg: string; border: string; text: string; textMuted?: string };
    achievementDone: string;
  };
  overlays: {
    modalScrim: string;
    tabBarChrome: string;
  };
  gradients: {
    edgeHFadeLeft: GradientStops;
    edgeHFadeRight: GradientStops;
    bottomSoft: GradientStops;
    dashBottom: GradientStops;
    exploreBottomFade: GradientStops;
  };
  switchIosTrack: string;
  feedbackPoor: string;
  feedbackMid: string;
  feedbackGood: string;
  /** Label on filled primary — always dark text. */
  onPrimary: string;
  inkOnPastel: string;
  mutedOnPastel: string;
  linkInteractive: string;
  destructive: string;
};

function fadeStops(rgb: string) {
  const a = (o: number) => `rgba(${rgb},${o})`;
  return {
    edgeHFadeLeft: gradientStops([a(1), a(0.95), a(0.72), a(0.38), 'transparent']),
    edgeHFadeRight: gradientStops(['transparent', a(0.38), a(0.72), a(0.95), a(1)]),
    bottomSoft: gradientStops(['transparent', a(0.4), a(0.82), a(1)]),
    dashBottom: gradientStops(['transparent', a(0.3), a(0.62), a(0.85), a(1)]),
    exploreBottomFade: gradientStops(['transparent', a(0.35), a(0.72), a(1)]),
  };
}

/** Full-screen onboarding / splash: deep neutral forest — not UI primary saturation. */
export const immersiveBrandGradients = {
  base: ['#1A2620', '#243D32', '#2F5946'] as const,
  veil: ['rgba(26, 38, 32, 0.88)', 'rgba(36, 61, 50, 0.55)', 'rgba(42, 90, 72, 0.35)'] as const,
  gloss: ['transparent', 'rgba(244, 247, 239, 0.08)', 'rgba(244, 247, 239, 0.16)'] as const,
};

export function resolveAppTheme(isDarkMode: boolean): AppThemePalette {
  if (isDarkMode) {
    const g = fadeStops(DARK_BG);
    return {
      ...darkPalette,
      headerBg: darkPalette.card,
      headerText: darkPalette.text,
      headerBorder: darkPalette.borderStrong,
      headerBackLink: darkPalette.primarySoft,
      cardBorder: darkPalette.borderStrong,
      semantic: {
        historic: { bg: '#2F3B30', text: '#F1F6EC' },
        warning: {
          bg: darkPalette.surfaceSoft,
          border: '#C9A227',
          text: '#F4EDB8',
          textMuted: darkPalette.muted,
        },
        achievementDone: darkPalette.text,
      },
      overlays: {
        modalScrim: 'rgba(0,0,0,0.58)',
        tabBarChrome: 'rgba(21,27,22,0.92)',
      },
      gradients: {
        edgeHFadeLeft: g.edgeHFadeLeft,
        edgeHFadeRight: g.edgeHFadeRight,
        bottomSoft: g.bottomSoft,
        dashBottom: g.dashBottom,
        exploreBottomFade: g.exploreBottomFade,
      },
      switchIosTrack: 'rgba(244,247,239,0.22)',
      feedbackPoor: '#FF9500',
      feedbackMid: darkPalette.primarySoft,
      feedbackGood: darkPalette.primary,
      onPrimary: '#101713',
      inkOnPastel: '#101713',
      mutedOnPastel: 'rgba(16, 23, 19, 0.62)',
      linkInteractive: darkPalette.primarySoft,
      destructive: '#FF8A93',
    };
  }

  const g = fadeStops(LIGHT_BG);
  return {
    ...colors,
    headerBg: colors.card,
    headerText: colors.text,
    headerBorder: colors.border,
    headerBackLink: colors.primary,
    cardBorder: colors.border,
    semantic: {
      historic: { bg: '#EDE8CF', text: '#4D4200' },
      warning: {
        bg: colors.surfaceSoft,
        border: '#D4940A',
        text: '#5C4810',
        textMuted: colors.muted,
      },
      achievementDone: colors.text,
    },
    overlays: {
      modalScrim: 'rgba(16,23,19,0.45)',
      tabBarChrome: 'rgba(255,255,255,0.82)',
    },
    gradients: {
      edgeHFadeLeft: g.edgeHFadeLeft,
      edgeHFadeRight: g.edgeHFadeRight,
      bottomSoft: g.bottomSoft,
      dashBottom: g.dashBottom,
      exploreBottomFade: gradientStops(['transparent', 'rgba(247,248,241,0.35)', 'rgba(247,248,241,0.78)', 'rgba(247,248,241,1)']),
    },
    switchIosTrack: 'rgba(16,23,19,0.08)',
    feedbackPoor: '#E65100',
    feedbackMid: colors.primarySoft,
    feedbackGood: colors.primary,
    onPrimary: '#101713',
    inkOnPastel: '#101713',
    mutedOnPastel: 'rgba(16, 23, 19, 0.62)',
    linkInteractive: colors.primary,
    destructive: '#B91C1C',
  };
}

export const spacing = { s: 8, m: 16, l: 24 };
