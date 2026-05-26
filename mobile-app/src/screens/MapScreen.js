import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

// Inline date utility helpers to match website logic
function isUpcoming(dateStr, timeStr = '00:00') {
  const d = new Date(`${dateStr}T${timeStr}:00+05:30`);
  const now = new Date();
  const cutoffTime = new Date(d.getTime() + 6 * 60 * 60 * 1000);
  return now < cutoffTime;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  return d >= today && d <= weekEnd;
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && d >= today;
}

export default function MapScreen({ navigation }) {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await client.get('/events');
      setAllEvents(res.data);
    } catch (err) {
      console.log('Error fetching events for map:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    // Filter by having valid coordinates and being upcoming
    let events = allEvents.filter(e => e.latitude && e.longitude && isUpcoming(e.endDate || e.date, e.time));

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e =>
        e.prasanga.toLowerCase().includes(q) ||
        (e.troupe && e.troupe.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory) {
      events = events.filter(e => e.category === filterCategory);
    }

    // Date filter
    if (filterDate === 'today') {
      events = events.filter(e => isToday(e.date));
    } else if (filterDate === 'week') {
      events = events.filter(e => isThisWeek(e.date));
    } else if (filterDate === 'month') {
      events = events.filter(e => isThisMonth(e.date));
    }

    return events;
  };

  const filteredEvents = getFilteredEvents();

  // Group events by coordinates key
  const groups = {};
  filteredEvents.forEach(event => {
    const key = `${parseFloat(event.latitude).toFixed(6)},${parseFloat(event.longitude).toFixed(6)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const handleMarkerPress = (group) => {
    setSelectedGroup(group);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 13.2000, // Matching standard web coordinates
          longitude: 74.9000,
          latitudeDelta: 1.0,
          longitudeDelta: 1.0,
        }}
        userInterfaceStyle="dark"
        onPress={() => setSelectedGroup(null)} // Click map to dismiss bottom details card
      >
        {Object.keys(groups).map(key => {
          const groupEvents = groups[key];
          const firstEvent = groupEvents[0];
          const lat = parseFloat(firstEvent.latitude);
          const lng = parseFloat(firstEvent.longitude);

          return (
            <Marker
              key={key}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkerPress(groupEvents);
              }}
            >
              <View style={styles.markerPinContainer}>
                <LinearGradient
                  colors={['#E8751A', '#F4A623']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.markerPin}
                >
                  <Image 
                    source={require('../../assets/images/icon.png')} 
                    style={styles.markerLogo} 
                  />
                  {groupEvents.length > 1 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{groupEvents.length}</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Header Overlay Search and Filters */}
      <View style={styles.overlayHeader}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search event, troupe, or location..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <TouchableOpacity 
            style={[styles.chip, !filterDate && styles.chipActive]} 
            onPress={() => setFilterDate('')}
          >
            <Text style={[styles.chipText, !filterDate && styles.chipTextActive]}>All Dates</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, filterDate === 'today' && styles.chipActive]} 
            onPress={() => setFilterDate('today')}
          >
            <Text style={[styles.chipText, filterDate === 'today' && styles.chipTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, filterDate === 'week' && styles.chipActive]} 
            onPress={() => setFilterDate('week')}
          >
            <Text style={[styles.chipText, filterDate === 'week' && styles.chipTextActive]}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, filterDate === 'month' && styles.chipActive]} 
            onPress={() => setFilterDate('month')}
          >
            <Text style={[styles.chipText, filterDate === 'month' && styles.chipTextActive]}>This Month</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={{paddingRight: 16}}>
          <TouchableOpacity 
            style={[styles.chip, !filterCategory && styles.chipActive]} 
            onPress={() => setFilterCategory('')}
          >
            <Text style={[styles.chipText, !filterCategory && styles.chipTextActive]}>All Categories</Text>
          </TouchableOpacity>
          {['Yakshagana', 'Nema/Kola', 'Kambala', 'Nataka', 'Dance', 'Temple Annual Fair', 'Other Events'].map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[styles.chip, filterCategory === cat && styles.chipActive]} 
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.chipText, filterCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.statusSubtitle}>{filteredEvents.length} upcoming events match your filters</Text>
      </View>

      {/* Floating Bottom Details Card / Sheet */}
      {selectedGroup && (
        <GlassCard style={styles.bottomCard} intensity={25}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {selectedGroup.length === 1 ? '📍 Event Details' : `📍 ${selectedGroup.length} Events here`}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedGroup(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedGroup.length === 1 ? (
            // Single event display
            <View>
              <Text style={styles.eventPrasanga}>{selectedGroup[0].prasanga}</Text>
              {selectedGroup[0].troupe ? <Text style={styles.eventTroupe}>🎪 {selectedGroup[0].troupe}</Text> : null}
              <Text style={styles.eventMeta}>📅 {new Date(selectedGroup[0].date).toLocaleDateString()} · {selectedGroup[0].time}</Text>
              <Text style={styles.eventMeta}>📍 {selectedGroup[0].location}</Text>
              <Text style={styles.eventMeta}>👁️ {selectedGroup[0].views || 0} views</Text>
              
              <Button 
                title="View Details →" 
                onPress={() => {
                  const id = selectedGroup[0].id;
                  setSelectedGroup(null);
                  navigation.navigate('EventDetail', { id });
                }} 
                style={{marginTop: 16}}
              />
            </View>
          ) : (
            // Multiple events scroll list
            <ScrollView style={styles.eventsScroll} maxVerticalHeight={200} contentContainerStyle={{paddingBottom: 10}}>
              {selectedGroup.map((item, idx) => (
                <View key={item.id} style={[styles.eventRow, idx < selectedGroup.length - 1 && styles.borderBottom]}>
                  <Text style={styles.rowTitle}>{item.prasanga}</Text>
                  {item.troupe ? <Text style={styles.rowTroupe}>🎪 {item.troupe}</Text> : null}
                  <Text style={styles.rowMeta}>{new Date(item.date).toLocaleDateString()} · {item.time}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      const id = item.id;
                      setSelectedGroup(null);
                      navigation.navigate('EventDetail', { id });
                    }}
                    style={styles.rowBtn}
                  >
                    <Text style={styles.rowBtnText}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </GlassCard>
      )}
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
  // Custom Saffron Pin styling 100% matching website Leaflet custom Icon
  markerPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8751A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  markerLogo: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    transform: [{ rotate: '45deg' }],
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  // Floating top headers
  overlayHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(13, 5, 5, 0.85)',
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    padding: 10,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  chipsScroll: {
    marginVertical: 4,
  },
  chip: {
    backgroundColor: theme.colors.bgSurface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.accentSubtle,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.accentLight,
  },
  statusSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Bottom Card styling
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    maxHeight: '45%',
    ...theme.shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitle: {
    color: theme.colors.accentLight,
    fontWeight: '800',
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventPrasanga: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  eventTroupe: {
    color: theme.colors.accentLight,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  eventMeta: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  eventsScroll: {
    maxHeight: 220,
  },
  eventRow: {
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowTroupe: {
    color: theme.colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowMeta: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  rowBtn: {
    alignSelf: 'flex-start',
  },
  rowBtnText: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 13,
  }
});
