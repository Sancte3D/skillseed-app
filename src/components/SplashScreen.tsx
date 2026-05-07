import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { immersiveBrandGradients } from '../theme';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { height } = useWindowDimensions();
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const gradientOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(60);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    // Step 1: SkillSeed Logo fade in + scale up
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    
    logoScale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });

    // Gradient fade in (with delay)
    timeouts.push(setTimeout(() => {
      gradientOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
    }, 300));

    // Step 2: Text animation starts AFTER logo fade in is complete (at 800ms)
    // Logo fade in duration is 800ms, so text starts exactly when logo is done
    timeouts.push(setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
      textTranslateY.value = withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      });
    }, 800)); // Start when logo fade in completes

    // Step 3: Both fade out simultaneously after text has been visible
    // Text appears at 800ms, fade in takes 800ms (complete at 1600ms)
    // Keep both visible until 2800ms, then fade out together with identical animation
    timeouts.push(setTimeout(() => {
      // Logo: same fade out animation as text
      logoOpacity.value = withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      });
      logoTranslateY.value = withTiming(-40, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      });
      // Text: same fade out animation as logo
      textOpacity.value = withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      });
      textTranslateY.value = withTiming(-40, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      });
    }, 2800)); // Fade out both together with identical movement

    // Complete after fade out completes (2800ms + 600ms = 3400ms, add buffer)
    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 3600);
    timeouts.push(timer);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [gradientOpacity, logoOpacity, logoScale, logoTranslateY, onComplete, textOpacity, textTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
    opacity: logoOpacity.value,
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: textOpacity.value,
  }));

  const dynamicTextContainer = {
    bottom: height * 0.25,
  } as const;

  return (
    <View style={styles.container}>
      {/* Softer gradient background */}
      <LinearGradient
        colors={[...immersiveBrandGradients.base]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Additional soft overlay */}
        <LinearGradient
          colors={[...immersiveBrandGradients.veil]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logoText}>SkillSeed</Text>
        </Animated.View>
        <Animated.View style={[styles.textContainer, dynamicTextContainer, textAnimatedStyle]}>
          <Text style={styles.animatedText}>Track Your Learning Journey</Text>
        </Animated.View>
        <Animated.View style={[styles.gradientOverlay, gradientAnimatedStyle]}>
          <LinearGradient
            colors={[...immersiveBrandGradients.gloss]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F4F7EF',
    letterSpacing: -1,
  },
  textContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F4F7EF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
