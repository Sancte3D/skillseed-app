import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '../theme';

interface Props {
  category: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Map categories to MaterialIcons (can be replaced with SVG later)
const categoryIconMap: Record<string, string> = {
  'coding': 'code',
  'programming': 'code',
  'software': 'code',
  'ai/data': 'psychology',
  'ai': 'psychology',
  'data': 'bar-chart',
  'language': 'translate',
  'communication': 'forum',
  'design': 'palette',
  'cad/3d': 'category',
  'cad': 'category',
  '3d': 'category',
  'marketing': 'campaign',
  'security': 'security',
  'creative': 'palette',
  'automation': 'settings',
};

const CategoryIcon = React.memo<Props>(({ category, size = 24, color = colors.text, style }) => {
  const c = (category || '').toLowerCase();
  const iconName = categoryIconMap[c] || 'folder';
  return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
});

CategoryIcon.displayName = 'CategoryIcon';

export default CategoryIcon;

