import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ParkingSession } from '@/src/types';
import { ParkingRepository } from '@/src/storage';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  async function loadSessions() {
    const all = await ParkingRepository.getAllSessions();
    setSessions(all.filter((s) => !s.isActive).reverse());
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete', 'Remove this parking record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ParkingRepository.deleteSession(id);
          await loadSessions();
        },
      },
    ]);
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(minutes: number): string {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      const remainingHrs = Math.floor((minutes % 1440) / 60);
      if (remainingHrs > 0) return `${days}d ${remainingHrs}h`;
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins > 0) return `${hrs}h ${mins}min`;
      return `${hrs}h`;
    }
    return `${minutes} min`;
  }

  function renderItem({ item }: { item: ParkingSession }) {
    return (
      <TouchableOpacity
        style={styles.item}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemAddress}>
            {item.location.address || 'Unknown location'}
          </Text>
          <Text style={styles.itemDate}>{formatDate(item.startTime)}</Text>
          <Text style={styles.itemDuration}>{formatDuration(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No parking history yet</Text>
          <Text style={styles.emptySubtext}>
            Your past parking sessions will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  item: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {},
  itemAddress: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemDate: { fontSize: 14, color: '#666' },
  itemDuration: { fontSize: 13, color: '#999', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
});
