/**
 * UI/Design Debug Monitoring System
 * Detects random UI changes and design inconsistencies
 * 
 * Usage:
 * - Automatically monitors component renders in development
 * - Use uiDebug.monitorColor() to track color changes
 * - Use uiDebug.monitorLayout() to track layout changes
 * - Use uiDebug.monitorState() to track state changes
 * - Check console for warnings about suspicious patterns
 */

// @ts-ignore - React will be available at runtime
import React from 'react';

type UIChange = {
  timestamp: number;
  type: 'color' | 'layout' | 'component' | 'state' | 'theme';
  component?: string;
  property?: string;
  oldValue?: any;
  newValue?: any;
  stack?: string;
};

class UIDebugMonitor {
  private changes: UIChange[] = [];
  private colorSnapshots: Map<string, string> = new Map();
  private layoutSnapshots: Map<string, any> = new Map();
  private isEnabled: boolean = __DEV__;

  logChange(change: Omit<UIChange, 'timestamp'>) {
    if (!this.isEnabled) return;

    const fullChange: UIChange = {
      ...change,
      timestamp: Date.now(),
      stack: new Error().stack?.split('\n').slice(2, 6).join('\n'),
    };

    this.changes.push(fullChange);
    
    // Warn if suspicious pattern detected
    if (this.detectSuspiciousPattern(fullChange)) {
      console.warn('🚨 [UI Debug] Suspicious UI change detected:', fullChange);
    } else {
      console.log('🔍 [UI Debug] UI change:', fullChange);
    }

    // Keep only last 100 changes
    if (this.changes.length > 100) {
      this.changes.shift();
    }
  }

  private detectSuspiciousPattern(change: UIChange): boolean {
    // Detect rapid changes to same property
    const recentSameType = this.changes
      .slice(-10)
      .filter(c => 
        c.type === change.type && 
        c.component === change.component &&
        c.property === change.property &&
        (change.timestamp - c.timestamp) < 1000
      );

    if (recentSameType.length > 3) {
      console.error('⚠️ [UI Debug] Rapid changes detected - possible render loop!', {
        count: recentSameType.length,
        property: change.property,
      });
      return true;
    }

    // Detect unexpected color changes
    if (change.type === 'color' && change.property) {
      const prevColor = this.colorSnapshots.get(change.property);
      if (prevColor && prevColor !== change.newValue && !change.oldValue) {
        console.warn('⚠️ [UI Debug] Unexpected color change without oldValue:', {
          property: change.property,
          newValue: change.newValue,
        });
        return true;
      }
      this.colorSnapshots.set(change.property, change.newValue);
    }

    // Detect layout jumps
    if (change.type === 'layout') {
      const prevLayout = this.layoutSnapshots.get(change.component || 'unknown');
      if (prevLayout && change.newValue) {
        const diff = Math.abs((prevLayout.height || 0) - (change.newValue.height || 0));
        if (diff > 100 && diff < 1000) {
          console.warn('⚠️ [UI Debug] Significant layout jump detected:', {
            component: change.component,
            heightDiff: diff,
          });
          return true;
        }
      }
      if (change.component) {
        this.layoutSnapshots.set(change.component, change.newValue);
      }
    }

    return false;
  }

  // Monitor theme colors
  monitorColor(component: string, property: string, value: any) {
    this.logChange({
      type: 'color',
      component,
      property,
      newValue: value,
    });
  }

  // Monitor layout changes
  monitorLayout(component: string, layout: any) {
    const prev = this.layoutSnapshots.get(component);
    if (JSON.stringify(prev) !== JSON.stringify(layout)) {
      this.logChange({
        type: 'layout',
        component,
        oldValue: prev,
        newValue: layout,
      });
    }
  }

  // Monitor component renders
  monitorRender(component: string, props?: any) {
    if (__DEV__) {
      console.log('🔄 [UI Debug] Component rendered:', component, props ? Object.keys(props) : '');
    }
  }

  // Monitor state changes that affect UI
  monitorState(component: string, stateKey: string, oldValue: any, newValue: any) {
    if (oldValue !== newValue) {
      this.logChange({
        type: 'state',
        component,
        property: stateKey,
        oldValue,
        newValue,
      });
    }
  }

  // Get recent changes
  getRecentChanges(limit: number = 20): UIChange[] {
    return this.changes.slice(-limit);
  }

  // Clear history
  clear() {
    this.changes = [];
    this.colorSnapshots.clear();
    this.layoutSnapshots.clear();
  }

  // Enable/disable
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // Generate report
  generateReport(): string {
    const grouped = this.changes.reduce((acc, change) => {
      const key = `${change.type}-${change.component || 'unknown'}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(change);
      return acc;
    }, {} as Record<string, UIChange[]>);

    return JSON.stringify({
      totalChanges: this.changes.length,
      byType: grouped,
      recentChanges: this.getRecentChanges(10),
    }, null, 2);
  }
}

export const uiDebug = new UIDebugMonitor();

// React Hook for monitoring component renders
export function useUIDebug(componentName: string) {
  React.useEffect(() => {
    if (!__DEV__) return;
    uiDebug.monitorRender(componentName);
  }, [componentName]);
}

// Helper to monitor color values
export function monitorColorValue(component: string, property: string, value: string) {
  if (__DEV__) {
    uiDebug.monitorColor(component, property, value);
  }
}

// Helper to detect unexpected re-renders
export function useRenderCounter(componentName: string) {
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  React.useEffect(() => {
    if (renderCount.current > 10) {
      console.warn(`⚠️ [UI Debug] ${componentName} rendered ${renderCount.current} times - possible issue!`);
    }
  });

  return renderCount.current;
}

