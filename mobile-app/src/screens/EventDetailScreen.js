import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { theme } from '../../theme';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

        {event.googleMapsLink && (
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
    backgroundColor: theme.colors.bgDeep,
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
