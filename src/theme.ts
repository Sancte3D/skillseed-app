// SkillSeed App Color Theme (based on 60-30-10 and accessibility best practices)
export const colors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  muted: '#666666',
  border: '#E5E5E5',
  primary: '#1400F5',
  accent: '#BF211E',
  success: '#12F885',
  link: '#1400F5',
  lightGray: '#EEE5E9',
  // Category colors
  categories: {
    'Coding': '#1400F5',
    'CAD/3D': '#BF211E',
    'AI/Data': '#7C3AED',
    'Design': '#12F885',
    'Language': '#FF6B35',
    'Automation': '#00B8D4',
    'Communication': '#FF1744',
    'Creative': '#00E676',
    'Data': '#536DFE',
    '3D': '#D32F2F',
  } as Record<string,string>,
};
// Usage:
// - Use colors.background for major backgrounds
// - Use colors.card for card/section surfaces
// - Use colors.primary for buttons, links, CTAs
// - Use colors.accent for historic badges, warning, markers
// - Use colors.error for alerts
// - Use colors.text and colors.badgeText for readable text
// - Use colors.border for subtle lines/outlines

export const spacing = { s: 8, m: 16, l: 24 };
