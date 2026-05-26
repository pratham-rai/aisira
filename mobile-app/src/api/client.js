import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In production, this would be the Render URL
// For testing on a physical device over Wi-Fi, we must use the computer's local IP Address
const API_BASE_URL = 'http://192.168.29.177:5000/api'; 

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the auth token to every request
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('yn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
