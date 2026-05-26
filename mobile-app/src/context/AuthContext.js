import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
// Push notifications require a custom dev build in SDK 53+. Disabled for Expo Go.
// import * as Notifications from 'expo-notifications';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    loadUser();
    /*
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
    */
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('yn_token');
      if (token) {
        const response = await client.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Failed to load user', error);
      await AsyncStorage.removeItem('yn_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await AsyncStorage.setItem('yn_token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      if (errorMsg.includes('verify your email')) {
        return { success: false, error: errorMsg, needsVerification: true };
      }
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const response = await client.post('/auth/register', { email, password, displayName });
      // If server sends token directly
      if (response.data.token) {
        await AsyncStorage.setItem('yn_token', response.data.token);
        setUser(response.data.user);
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await client.post('/auth/verify', { email, code });
      const { token, user } = response.data;
      await AsyncStorage.setItem('yn_token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await client.post('/auth/resend-verification', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to resend code' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await client.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to send code' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await client.post('/auth/reset-password', { email, code, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to reset password' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('yn_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      verifyEmail, 
      resendVerification, 
      forgotPassword, 
      resetPassword, 
      logout, 
      expoPushToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Push notifications helper (Disabled for Expo Go MVP)
/*
async function registerForPushNotificationsAsync() {
  let token;
  // Implementation hidden for Expo Go compatibility...
  return token;
}
*/

