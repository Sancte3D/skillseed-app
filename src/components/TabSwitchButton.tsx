import React from 'react';
import Button from './Button';
import { useTabNavigation } from '../utils/navigation';

interface TabSwitchButtonProps {
  targetTab: 'ExploreTab' | 'DashboardTab' | 'TimerTab' | 'ProfileTab';
  targetScreen?: string;
  params?: any;
  title: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
}

export function TabSwitchButton({
  targetTab,
  targetScreen,
  params,
  title,
  variant = 'primary',
  size = 'medium',
}: TabSwitchButtonProps) {
  const { navigateToTab } = useTabNavigation();

  return (
    <Button
      title={title}
      variant={variant}
      size={size}
      onPress={() => navigateToTab(targetTab, targetScreen, params)}
    />
  );
}
