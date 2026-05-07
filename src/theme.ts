// SkillSeed "Pistachio Dream" theme tokens (light first).
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
  // Category colors stay in the same palette family to avoid a full redesign.
  categories: {
    'Coding': '#42D674',
    'CAD/3D': '#BADBA2',
    'AI/Data': '#80EF80',
    'Design': '#E3F0A3',
    'Language': '#BADBA2',
    'Automation': '#80EF80',
    'Communication': '#42D674',
    'Creative': '#E3F0A3',
    'Data': '#80EF80',
    '3D': '#BADBA2',
  } as Record<string,string>,
} as const;
// Usage:
// - Use colors.background for major backgrounds
// - Use colors.card for card/section surfaces
// - Use colors.primary for buttons, links, CTAs
// - Use colors.accent for historic badges, warning, markers
// - Use colors.error for alerts
// - Use colors.text and colors.badgeText for readable text
// - Use colors.border for subtle lines/outlines

export const spacing = { s: 8, m: 16, l: 24 };
