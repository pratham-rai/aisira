import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { theme } from '../../theme';

export default function BackgroundOrbs({ children }) {
  // Simple floating animations for the background orbs
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const drift3 = useSharedValue(0);

  useEffect(() => {
    drift1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift1.value * 50 },
      { translateY: drift1.value * -50 }
    ]
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift2.value * -40 },
      { translateY: drift2.value * 60 }
    ]
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift3.value * 60 },
      { translateY: drift3.value * 30 }
    ]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />
      {/* Grid overlay could go here using an image or SVG, but keeping it clean for performance */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDeep,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 400,
    height: 400,
    backgroundColor: theme.colors.accent,
    top: -100,
    right: -100,
    // Note: React Native View doesn't support massive blur naturally without Expo Image/BlurView,
    // so we rely on low opacity and soft colors to mimic it on generic backgrounds.
  },
  orb2: {
    width: 300,
    height: 300,
    backgroundColor: theme.colors.red,
    bottom: -50,
    left: -50,
  },
  orb3: {
    width: 250,
    height: 250,
    backgroundColor: theme.colors.blue,
    top: '40%',
    left: '20%',
  }
});
