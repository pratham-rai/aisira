import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import client from '../api/client';
import EventCard from '../components/EventCard';
import { CATEGORY_INFO } from '../utils/category-data';

export default function CategoryDetailScreen({ route, navigation }) {
  const { categoryName } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const info = CATEGORY_INFO[categoryName] || CATEGORY_INFO['Other Events'];

  useEffect(() => {
    fetchCategoryEvents();
  }, [categoryName]);

  const fetchCategoryEvents = async () => {
    try {
      const res = await client.get('/events');
      // For now, filter on client side mimicking web logic
      const filtered = res.data.filter(e => e.category === categoryName);
      setEvents(filtered);
    } catch (err) {
      console.log('Error fetching category events', err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderColor: info.color }]}>
      <Text style={styles.emoji}>{info.emoji}</Text>
      <Text style={styles.title}>{info.title}</Text>
      <Text style={styles.description}>{info.description}</Text>
      
      <View style={styles.historyBox}>
        <Text style={styles.historyTitle}>History & Significance</Text>
        <Text style={styles.historyText}>{info.history}</Text>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Events ({events.length})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={info.color || theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={events}
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
              <Text style={styles.emptyText}>No upcoming events for {categoryName}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  historyBox: {
    backgroundColor: theme.colors.bgSurface,
    padding: 20,
    borderRadius: theme.radius.lg,
    marginBottom: 24,
  },
  historyTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  historyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
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
    textAlign: 'center'
  }
});
