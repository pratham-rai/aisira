import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  style, 
  textStyle,
  disabled 
}) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.base, getContainerStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.colors.accent} />
      ) : (
        <Text style={[styles.textBase, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: theme.colors.accent,
    ...theme.shadows.sm,
  },
  secondary: {
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderHover,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: theme.colors.textPrimary,
  },
  textGhost: {
    color: theme.colors.accentLight,
  },
});
