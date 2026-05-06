import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Main App Component with React Navigation
 * This replaces the custom routing system with proper React Navigation
 */
export default function AppWithNavigation() {
  return <RootNavigator />;
}
