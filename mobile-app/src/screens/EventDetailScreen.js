import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../../theme';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

// Helper to generate the exact Leaflet HTML for a single location map matching the website custom pin
function getDetailMapHTML(event) {
  const lat = parseFloat(event.latitude);
  const lng = parseFloat(event.longitude);
  const title = event.prasanga || '';
  const loc = event.location || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #0D0505;
    }
    .leaflet-control-attribution {
      display: none !important;
    }
    .custom-pin {
      background: linear-gradient(135deg, #E8751A, #F4A623);
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(232, 117, 26, 0.4);
    }
    .custom-pin img {
      width: 16px;
      height: 16px;
      transform: rotate(45deg);
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map);

    var customIcon = L.divIcon({
      html: '<div class="custom-pin"><img src="https://raw.githubusercontent.com/pratham-rai/aisira/main/public/logo.png" /></div>',
      iconSize: [32, 32], iconAnchor: [16, 32], className: ''
    });

    var marker = L.marker([${lat}, ${lng}], { icon: customIcon }).addTo(map);
    marker.bindPopup("<div style='font-family:sans-serif;color:#333;font-size:12px;'><strong>" + ${JSON.stringify(title)} + "</strong><br/>" + ${JSON.stringify(loc)} + "</div>").openPopup();
  </script>
</body>
</html>
  `;
}

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await client.get(`/events/${id}`);
      setEvent(res.data);
      // Increment views in background
      client.post(`/events/${id}/view`).catch(console.log);
    } catch (err) {
      console.log('Error fetching event details', err);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (event.googleMapsLink) {
      Linking.openURL(event.googleMapsLink);
    } else if (event.latitude && event.longitude) {
      Linking.openURL(`https://www.google.com/maps?q=${event.latitude},${event.longitude}`);
    }
  };

  const callOrganizer = () => {
    if (event.organizerPhone) Linking.openURL(`tel:${event.organizerPhone}`);
  };

  const emailOrganizer = () => {
    if (event.organizerEmail) Linking.openURL(`mailto:${event.organizerEmail}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{fontSize: 48}}>🎭</Text>
        <Text style={styles.title}>Event Not Found</Text>
      </View>
    );
  }

  const imageUrl = event.posterUrls && event.posterUrls.length > 0 ? event.posterUrls[0] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{fontSize: 64}}>🎭</Text>
        </View>
      )}

      <GlassCard style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event.category || 'Yakshagana'}</Text>
        </View>
        <Text style={styles.title}>{event.prasanga}</Text>
        {event.troupe && <Text style={styles.troupe}>🎪 {event.troupe}</Text>}
        
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{new Date(event.date).toLocaleDateString()} at {event.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{event.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>👁️</Text>
          <Text style={styles.metaText}>{event.views || 0} views</Text>
        </View>

        {(event.googleMapsLink || (event.latitude && event.longitude)) && (
          <Button 
            title="Open in Maps" 
            variant="secondary" 
            onPress={openMap} 
            style={{marginTop: 16}}
          />
        )}
      </GlassCard>

      {event.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      )}

      {/* Leaflet Map Section - exact website single marker parity */}
      {event.latitude && event.longitude && (
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>🗺️ Location Map</Text>
          <View style={styles.mapFrame}>
            <WebView
              originWhitelist={['*']}
              source={{ html: getDetailMapHTML(event) }}
              style={styles.webViewMap}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={false}
            />
          </View>
        </View>
      )}

      {(event.organizerPhone || event.organizerEmail) && (
        <GlassCard style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Organizer Contact</Text>
          {event.organizerPhone && (
            <TouchableOpacity style={styles.contactBtn} onPress={callOrganizer}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{event.organizerPhone}</Text>
            </TouchableOpacity>
          )}
          {event.organizerEmail && (
            <TouchableOpacity style={styles.contactBtn} onPress={emailOrganizer}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>{event.organizerEmail}</Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholder: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginTop: -40, // overlap image
  },
  badge: {
    backgroundColor: theme.colors.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  troupe: {
    color: theme.colors.accentLight,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  mapSection: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 8,
  },
  mapFrame: {
    height: 220,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  webViewMap: {
    flex: 1,
    backgroundColor: '#0D0505',
  },
  contactCard: {
    margin: 16,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgPrimary,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderHover,
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  }
});
