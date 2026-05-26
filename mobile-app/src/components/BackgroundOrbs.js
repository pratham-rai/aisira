import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
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
        withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 20000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 24000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 24000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 28000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 28000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift1.value * 60 },
      { translateY: drift1.value * -60 }
    ]
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift2.value * -50 },
      { translateY: drift2.value * 70 }
    ]
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift3.value * 70 },
      { translateY: drift3.value * 40 }
    ]
  }));

  return (
    <View style={styles.container}>
      {/* Drifting Radial Glowing Orbs */}
      <Animated.Image 
        source={require('../../assets/images/blurred-orb.png')} 
        style={[styles.orb, styles.orb1, orb1Style]} 
      />
      <Animated.Image 
        source={require('../../assets/images/blurred-orb.png')} 
        style={[styles.orb, styles.orb2, orb2Style]} 
      />
      <Animated.Image 
        source={require('../../assets/images/blurred-orb.png')} 
        style={[styles.orb, styles.orb3, orb3Style]} 
      />
      
      {/* High-Fidelity Grid Mesh Overlay */}
      <Image 
        source={require('../../assets/images/grid-tile.png')} 
        style={styles.gridOverlay} 
        resizeMode="repeat"
      />

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
    opacity: 0.12, // soft blended opacity matching web exactly
  },
  orb1: {
    width: 500,
    height: 500,
    tintColor: theme.colors.accent,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 400,
    height: 400,
    tintColor: theme.colors.red,
    bottom: -100,
    left: -100,
  },
  orb3: {
    width: 300,
    height: 300,
    tintColor: theme.colors.blue,
    top: '40%',
    left: '30%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  }
});
