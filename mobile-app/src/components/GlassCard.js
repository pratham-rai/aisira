import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';

export default function GlassCard({ children, style, intensity = 20, ...props }) {
  return (
    <View style={[styles.container, style]} {...props}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20, 25, 40, 0.45)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
  }
});
