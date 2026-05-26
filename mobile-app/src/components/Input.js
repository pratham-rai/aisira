import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  inputError: {
    borderColor: theme.colors.redLight,
  },
  errorText: {
    color: theme.colors.redLight,
    fontSize: 12,
    marginTop: 4,
  },
});
