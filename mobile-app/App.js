import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import BackgroundOrbs from './src/components/BackgroundOrbs';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <BackgroundOrbs>
          <AppNavigator />
        </BackgroundOrbs>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
