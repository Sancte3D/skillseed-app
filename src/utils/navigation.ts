/**
 * Navigation Helper für Cross-Stack Navigation
 */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootTabParamList } from '../navigation/types';
import { HapticFeedback } from './haptics';

export type TabNavigationProp = NavigationProp<RootTabParamList>;

export function useTabNavigation() {
  const navigation = useNavigation<TabNavigationProp>();

  const navigateToTab = (
    tabName: 'ExploreTab' | 'DashboardTab' | 'TimerTab' | 'ProfileTab',
    screenName?: string,
    params?: any
  ) => {
    console.log(`🚀 Tab Navigation: ${tabName}${screenName ? ` → ${screenName}` : ''}`);
    
    HapticFeedback.light();
    
    const parentNav = navigation.getParent();
    if (parentNav) {
      if (screenName) {
        parentNav.navigate(tabName, {
          screen: screenName,
          params,
        });
      } else {
        parentNav.navigate(tabName);
      }
    } else {
      // Fallback: direct navigation
      if (screenName) {
        navigation.navigate(tabName as any, {
          screen: screenName,
          params,
        });
      } else {
        navigation.navigate(tabName as any);
      }
    }
  };

  return { navigateToTab };
}
