import React, { useContext } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { theme } from '../../theme';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import AddEventScreen from '../screens/AddEventScreen';
import AdminScreen from '../screens/AdminScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: theme.colors.bgCard,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    primary: theme.colors.accent,
  },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: 'transparent' },
      headerTransparent: true,
      headerTintColor: theme.colors.textPrimary,
      headerBackTitleVisible: false,
    }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={({ route }) => ({ title: route.params.categoryName })} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer theme={MyTheme}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bgCard, borderBottomColor: theme.colors.border },
          headerTintColor: theme.colors.textPrimary,
          tabBarStyle: { backgroundColor: theme.colors.bgCard, borderTopColor: theme.colors.border },
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textMuted,
        }}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false, tabBarLabel: 'Events', tabBarIcon: () => <Text>🎭</Text> }} />
        <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map View', tabBarIcon: () => <Text>📍</Text> }} />
        <Tab.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event', tabBarIcon: () => <Text>➕</Text> }} />
        
        {user && (user.role === 'admin' || user.role === 'masterAdmin') && (
          <Tab.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin', tabBarIcon: () => <Text>🛡️</Text> }} />
        )}
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: () => <Text>👤</Text> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

