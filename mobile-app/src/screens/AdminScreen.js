import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { AuthContext } from '../context/AuthContext';

export default function AdminScreen() {
  const { user } = useContext(AuthContext);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const res = await client.get('/events/all?status=pending');
      setPendingEvents(res.data);
    } catch (err) {
      console.log('Error fetching pending events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await client.post(`/events/${id}/approve`);
      Alert.alert('Success', 'Event approved.');
      fetchPendingEvents();
    } catch (err) {
      Alert.alert('Error', 'Could not approve event.');
    }
  };

  const handleReject = async (id) => {
    try {
      await client.post(`/events/${id}/reject`, { reason: 'Rejected by admin via Mobile App' });
      Alert.alert('Success', 'Event rejected.');
      fetchPendingEvents();
    } catch (err) {
      Alert.alert('Error', 'Could not reject event.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'masterAdmin')) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>You do not have permission to view this page.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Admin Dashboard</Text>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={pendingEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{item.prasanga}</Text>
              <Text style={styles.meta}>📍 {item.location}</Text>
              <Text style={styles.meta}>📅 {new Date(item.date).toLocaleDateString()} {item.time}</Text>
              <Text style={styles.meta}>Added by: {item.submittedBy?.email || 'Unknown'}</Text>
              
              <View style={styles.actionRow}>
                <Button 
                  title="Approve" 
                  onPress={() => handleApprove(item.id)} 
                  style={styles.actionBtn}
                />
                <Button 
                  title="Reject" 
                  variant="secondary" 
                  onPress={() => handleReject(item.id)} 
                  style={styles.actionBtn}
                />
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No pending events.</Text>
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
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.redLight,
    fontSize: 16,
    textAlign: 'center',
  }
});
