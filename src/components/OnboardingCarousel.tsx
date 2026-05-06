import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Typography } from '../design/motion';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  body: string;
  hero?: React.ReactNode;
}

interface OnboardingCarouselProps {
  slides: OnboardingSlide[];
  onComplete: (username?: string) => void;
  initialUsername?: string;
}

export default function OnboardingCarousel({
  slides,
  onComplete,
  initialUsername = '',
}: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [username, setUsername] = useState(initialUsername);
  const [hasConfirmedName, setHasConfirmedName] = useState(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0); // Start invisible for smooth fade in
  const slidesCount = slides.length;
  const startX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const usernameInputRef = useRef<TextInput>(null);

  // Smooth fade in when component mounts (after splash screen)
  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  // Apple-standard easing curve: cubic-bezier(0.25, 0.1, 0.25, 1)
  const appleEasing = Easing.bezier(0.25, 0.1, 0.25, 1);
  // Alternative: smooth overshoot cubic-bezier(0.33, 1, 0.68, 1)
  const smoothOvershoot = Easing.bezier(0.33, 1, 0.68, 1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate on horizontal movement
    .failOffsetY([-10, 10]) // Fail if vertical movement is detected first
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Clamp translation to prevent overscroll
      const minX = -(slidesCount - 1) * SCREEN_WIDTH;
      const maxX = 0;
      const newX = startX.value + event.translationX;
      translateX.value = Math.max(minX, Math.min(maxX, newX));
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.25;
      const velocity = event.velocityX;
      const currentOffset = -currentIndex * SCREEN_WIDTH;

      if (event.translationX < -threshold || velocity < -800) {
        // Swipe left - next slide
        const nextIndex = currentIndex + 1;
        if (nextIndex < slidesCount) {
          runOnJS(Haptics.selectionAsync)();
          runOnJS(setCurrentIndex)(nextIndex);
          // Apple-standard smooth timing: 350ms with cubic-bezier easing
          translateX.value = withTiming(-SCREEN_WIDTH * nextIndex, {
            duration: 350,
            easing: appleEasing,
          });
        } else {
          // Bounce back smoothly with slight overshoot
          translateX.value = withTiming(currentOffset, {
            duration: 300,
            easing: smoothOvershoot,
          });
        }
      } else if (event.translationX > threshold || velocity > 800) {
        // Swipe right - previous slide
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          runOnJS(Haptics.selectionAsync)();
          runOnJS(setCurrentIndex)(prevIndex);
          // Apple-standard smooth timing: 350ms with cubic-bezier easing
          translateX.value = withTiming(-SCREEN_WIDTH * prevIndex, {
            duration: 350,
            easing: appleEasing,
          });
        } else {
          // Bounce back smoothly
          translateX.value = withTiming(0, {
            duration: 300,
            easing: smoothOvershoot,
          });
        }
      } else {
        // Snap back to current slide smoothly with deceleration
        translateX.value = withTiming(currentOffset, {
          duration: 280,
          easing: Easing.out(Easing.ease),
        });
      }
    });

  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: translateX.value }],
      width: SCREEN_WIDTH * slidesCount,
    };
  }, [slidesCount]);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onComplete)(username.trim() || undefined);
    });
  };

  // Handle keyboard showing/hiding - scroll to input field when keyboard appears
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Only scroll if we're on the last slide
        if (currentIndex === slides.length - 1 && scrollViewRef.current) {
          // Scroll to show input, but keep icon visible by using contentInset
          // The contentInset already provides space at the top
        }
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Scroll back to top when keyboard hides to show full icon
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ 
            y: 0, 
            animated: true 
          });
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [currentIndex, slides.length]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Background Gradient - identical to SplashScreen, extends beyond SafeArea */}
        <View style={styles.backgroundContainer} pointerEvents="none">
          <LinearGradient
            colors={['#1a00cc', '#3A00FF', '#5C00FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(26, 0, 204, 0.3)', 'rgba(58, 0, 255, 0.5)', 'rgba(92, 0, 255, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <Animated.View style={[{ flex: 1 }, { opacity }]}>
          {/* Carousel Container */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.carouselContainer, containerStyle]}>
              {slides.map((slide, index) => {
                const isLastSlide = index === slides.length - 1;
                const SlideContent = (
                  <>
                    {/* Hero Visual Area - consistent height */}
                    <View style={styles.heroArea}>
                      {slide.hero || (
                        <View style={styles.glassIconContainer}>
                          <BlurView
                            intensity={80}
                            tint="light"
                            style={StyleSheet.absoluteFill}
                          />
                          {/* Subtle gradient overlay for depth */}
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                          />
                          <MaterialIcons name="trending-up" size={64} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    {/* Text Content - flexible height, no clipping */}
                    <View style={styles.textArea}>
                      <Text style={styles.title}>
                        {slide.title}
                      </Text>
                      {/* Body text area - flexible height */}
                      <View style={styles.bodyContainer}>
                        <Text style={styles.body}>
                          {slide.body}
                        </Text>
                      </View>
                    </View>
                    {/* Username Input on last slide */}
                    {isLastSlide && (
                      <View style={styles.usernameContainer}>
                        <Pressable style={styles.glassInputContainer}>
                          <BlurView
                            intensity={80}
                            tint="light"
                            style={StyleSheet.absoluteFill}
                          />
                          {/* Subtle gradient overlay for depth */}
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                          />
                          <TextInput
                            ref={usernameInputRef}
                            value={username}
                            onChangeText={(text) => {
                              setUsername(text);
                              setHasConfirmedName(false); // Reset when typing
                            }}
                            placeholder="Dein Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            style={styles.usernameInput}
                            autoFocus={false}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                              Keyboard.dismiss();
                              if (username.trim().length > 0) {
                                setHasConfirmedName(true);
                              }
                            }}
                          />
                        </Pressable>
                      </View>
                    )}
                  </>
                );

                return (
                  <View key={index} style={styles.slide}>
                    {isLastSlide ? (
                      <ScrollView
                        ref={scrollViewRef}
                        style={styles.slideContent}
                        contentContainerStyle={styles.slideContentContainer}
                        contentInsetAdjustmentBehavior="automatic"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        bounces={true}
                        decelerationRate="normal"
                        scrollEnabled={true}
                        overScrollMode="auto"
                        // Allow horizontal swipe gestures to pass through
                        directionalLockEnabled={true}
                        nestedScrollEnabled={false}
                      >
                        {SlideContent}
                      </ScrollView>
                    ) : (
                      <View style={styles.slideContent}>
                        {SlideContent}
                      </View>
                    )}
                  </View>
                );
              })}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
        </KeyboardAvoidingView>

          {/* Page Indicators - show all slides - Fixed outside KeyboardAvoidingView */}
          <View style={styles.indicatorsContainer}>
            {slides.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      transform: [{ scale: isActive ? 1.2 : 1 }],
                      opacity: isActive ? 1 : 0.6,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* CTA Button - Glass UI Design - only show when name is confirmed via keyboard - Fixed outside KeyboardAvoidingView */}
          {currentIndex === slides.length - 1 && hasConfirmedName && username.trim().length > 0 && (
            <View style={styles.ctaContainer}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleGetStarted();
                }}
                style={styles.glassButton}
              >
                <BlurView
                  intensity={80}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
                {/* Subtle gradient overlay for depth - aligned with Apple Liquid Glass */}
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View style={styles.glassButtonContent}>
                  <Text style={styles.glassButtonText}>Weiter</Text>
                </View>
              </Pressable>
            </View>
          )}
      </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a00cc', // Match gradient start color
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Ensure background stays behind
  },
  carouselContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden', // Keep hidden for horizontal scrolling only
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    paddingBottom: 0,
    paddingHorizontal: Spacing.xl,
    // Optical center: slightly above mathematical center for better visual balance
    paddingTop: SCREEN_HEIGHT * 0.15, // Move content down by ~150pt
    // Use flex column for layout
    flexDirection: 'column',
  },
  slideContent: {
    flex: 1,
    width: '100%',
    // Use flex column for layout
    flexDirection: 'column',
  },
  slideContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 0,
    paddingBottom: 40, // Reduced padding - just enough for keyboard clearance
    width: '100%',
    // Use flex column for layout
    flexDirection: 'column',
    // Top inset prevents icon clipping when scrolling; second paddingTop was a duplicate key
    paddingTop: 20,
  },
  heroArea: {
    flex: 0,
    height: 140, // Consistent height across all slides
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48, // Icon to Headline: 40-48pt spacing
  },
  glassIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  textArea: {
    flex: 0,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
    // Flexible height - no fixed height to allow natural text flow
    flexDirection: 'column',
  },
  title: {
    ...Typography.title1,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    // Flexible height - no minHeight constraint
    lineHeight: Typography.title1.fontSize ? Typography.title1.fontSize * 1.3 : 36,
    marginBottom: 20, // Headline to Body: 16-24pt spacing (using 20pt)
    paddingHorizontal: Spacing.base, // Add padding to prevent edge cutoff
  },
  bodyContainer: {
    width: '100%',
    // Flexible height - no fixed height
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  body: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.85,
    lineHeight: 24,
  },
  usernameContainer: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    marginTop: 24, // Consistent spacing after body text (Body to Input: 24pt)
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl, // Match textArea padding
  },
  glassInputContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  usernameInput: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    textAlign: 'center',
    minHeight: 56,
    zIndex: 1,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 0 : Spacing.base,
  },
  glassButton: {
    borderRadius: 30,
    overflow: 'hidden',
    width: 200,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  glassButtonContent: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    zIndex: 1,
  },
  glassButtonText: {
    ...Typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
