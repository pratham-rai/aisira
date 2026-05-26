import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import GlassCard from './GlassCard';

export default function EventCard({ event, onPress }) {
  const imageUrl = event.posterUrls && event.posterUrls.length > 0 ? event.posterUrls[0] : null;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.card}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🎭</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{event.category || 'Yakshagana'}</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>{event.prasanga}</Text>
          {event.troupe && <Text style={styles.metaText}>🎪 {event.troupe}</Text>}
          <Text style={styles.metaText}>📅 {new Date(event.date).toLocaleDateString()} · {event.time}</Text>
          <Text style={styles.metaText} numberOfLines={1}>📍 {event.location}</Text>
          <View style={styles.footer}>
            <Text style={styles.viewsText}>👁️ {event.views || 0} views</Text>
            {event.distance !== undefined && event.distance !== Infinity && (
              <Text style={styles.distanceText}>📍 {event.distance.toFixed(1)} km away</Text>
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 0,
  },
  image: {
    width: '100%',
    height: 180,
  },
  placeholder: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  body: {
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  viewsText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  distanceText: {
    color: theme.colors.accentLight,
    fontSize: 12,
    fontWeight: '600',
  }
});
