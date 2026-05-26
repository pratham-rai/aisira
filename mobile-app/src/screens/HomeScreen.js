import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import client from '../api/client';
import EventCard from '../components/EventCard';
import { calculateDistance, getCurrentLocation } from '../utils/geo';
import GlassCard from '../components/GlassCard';
import { CATEGORY_INFO } from '../utils/category-data';

export default function HomeScreen({ navigation }) {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('earliest');
  const [nearbyRadius, setNearbyRadius] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await client.get('/events');
      setAllEvents(res.data);
    } catch (error) {
      console.log('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    if (newSort === 'nearby' && !userLocation) {
      setLoadingLocation(true);
      setLocationError('');
      try {
        const loc = await getCurrentLocation();
        setUserLocation(loc);
      } catch (err) {
        setLocationError(err.message);
        setSortBy('earliest');
      }
      setLoadingLocation(false);
    } else if (newSort !== 'nearby') {
      setLocationError('');
    }
  };

  const getFilteredEvents = () => {
    let events = [...allEvents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e =>
        e.prasanga.toLowerCase().includes(q) ||
        (e.troupe && e.troupe.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'latest') {
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'earliest') {
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'nearby' && userLocation) {
      events = events.map(e => {
        const dist = (e.latitude && e.longitude) 
          ? calculateDistance(userLocation.lat, userLocation.lng, e.latitude, e.longitude)
          : Infinity;
        return { ...e, distance: dist };
      });
      events = events.filter(e => e.distance <= nearbyRadius);
      events.sort((a, b) => a.distance - b.distance);
    }

    return events;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Aisira</Text>
      <Text style={styles.headerSubtitle}>Discover cultural performances of Tulunadu near you</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search event, troupe, or location..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['earliest', 'latest', 'nearby'].map((sortType) => (
            <TouchableOpacity 
              key={sortType} 
              style={[styles.filterChip, sortBy === sortType && styles.filterChipActive]}
              onPress={() => handleSortChange(sortType)}
            >
              <Text style={[styles.filterChipText, sortBy === sortType && styles.filterChipTextActive]}>
                {sortType === 'nearby' ? '📍 Nearby' : sortType === 'earliest' ? 'Earliest First' : 'Latest First'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loadingLocation && (
        <ActivityIndicator color={theme.colors.accent} style={{ marginVertical: 10 }} />
      )}

      {locationError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      ) : null}

      {sortBy === 'nearby' && userLocation && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderText}>Search Radius: <Text style={{color: theme.colors.accent}}>{nearbyRadius} km</Text></Text>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 10}}>
             {[10, 30, 50, 100].map(r => (
               <TouchableOpacity key={r} onPress={() => setNearbyRadius(r)} style={[styles.radiusBtn, nearbyRadius===r && styles.radiusBtnActive]}>
                 <Text style={styles.radiusBtnText}>{r}km</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>
      )}

      {/* Category Explorer */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <TouchableOpacity 
              key={key} 
              style={[styles.categoryBox, { borderTopColor: info.color }]}
              onPress={() => navigation.navigate('CategoryDetail', { categoryName: key })}
            >
              <Text style={styles.categoryEmoji}>{info.emoji}</Text>
              <Text style={styles.categoryName} numberOfLines={2}>{info.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Events ({getFilteredEvents().length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={getFilteredEvents()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => navigation.navigate('EventDetail', { id: item.id })}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{fontSize: 48, marginBottom: 16}}>🎪</Text>
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    padding: 14,
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
  },
  filterBar: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: theme.colors.bgSurface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.full,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accentSubtle,
    borderColor: theme.colors.accent,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.accentLight,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.redLight,
    padding: 12,
    marginBottom: 16,
    borderRadius: theme.radius.sm,
  },
  errorText: {
    color: theme.colors.redLight,
  },
  sliderContainer: {
    backgroundColor: 'rgba(232, 117, 26, 0.05)',
    padding: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    marginBottom: 16,
  },
  sliderText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  radiusBtn: {
    padding: 8,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.sm,
  },
  radiusBtnActive: {
    backgroundColor: theme.colors.accent,
  },
  radiusBtnText: {
    color: theme.colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoryScroll: {
    paddingRight: 16,
  },
  categoryBox: {
    backgroundColor: theme.colors.bgSurface,
    width: 140,
    height: 120,
    marginRight: 12,
    borderRadius: theme.radius.md,
    borderTopWidth: 4,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  }
});
