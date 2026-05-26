import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { theme } from '../../theme';
import client from '../api/client';

export default function MapScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await client.get('/events');
        // Only keep events that have valid latitude and longitude
        const mappableEvents = res.data.filter(e => e.latitude && e.longitude);
        setEvents(mappableEvents);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 12.9141, // Defaulting to Mangalore region
          longitude: 74.8560,
          latitudeDelta: 1.0,
          longitudeDelta: 1.0,
        }}
        userInterfaceStyle="dark" // Enables dark mode map if supported by platform
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            pinColor={theme.colors.accent}
          >
            <Callout onPress={() => navigation.navigate('EventDetail', { id: event.id })}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{event.prasanga}</Text>
                <Text style={styles.calloutText}>{new Date(event.date).toLocaleDateString()}</Text>
                <Text style={styles.calloutLink}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgDeep,
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutText: {
    color: '#666',
    marginBottom: 4,
  },
  calloutLink: {
    color: theme.colors.accent,
    fontWeight: '600',
  }
});
