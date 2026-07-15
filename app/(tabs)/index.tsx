import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ParkingSession } from '@/src/types';
import { ParkingService } from '@/src/services';
import { TimePicker } from '@/src/components';

export default function MapScreen() {
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [pickerHours, setPickerHours] = useState(1);
  const [pickerMinutes, setPickerMinutes] = useState(0);
  const [pickerDays, setPickerDays] = useState(0);
  const [useDays, setUseDays] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadActiveSession();
    }, [])
  );

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const remaining = ParkingService.getTimeRemaining(activeSession);
      if (remaining <= 0) {
        setTimeRemaining('EXPIRED');
      } else {
        const days = Math.floor(remaining / 86400000);
        const hrs = Math.floor((remaining % 86400000) / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        if (days > 0) {
          setTimeRemaining(`${days}d ${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        } else if (hrs > 0) {
          setTimeRemaining(`${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  async function loadActiveSession() {
    const session = await ParkingService.getActiveSession();
    setActiveSession(session);
  }

  function handleParkHere() {
    setPickerHours(1);
    setPickerMinutes(0);
    setPickerDays(0);
    setUseDays(false);
    setShowDurationModal(true);
  }

  async function handleStartParking() {
    const totalMinutes = useDays
      ? pickerDays * 24 * 60
      : pickerHours * 60 + pickerMinutes;
    if (totalMinutes <= 0) {
      Alert.alert('Invalid', 'Please set a parking duration.');
      return;
    }
    setShowDurationModal(false);
    const session = await ParkingService.startSession(totalMinutes);
    if (session) {
      setActiveSession(session);
    } else {
      Alert.alert('Error', 'Could not get your location. Please enable location services.');
    }
  }

  async function handleEndSession() {
    if (!activeSession) return;
    Alert.alert('End Parking', 'Clear this parking session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          await ParkingService.endSession(activeSession.id);
          setActiveSession(null);
        },
      },
    ]);
  }

  function handleNavigate() {
    if (!activeSession) return;
    ParkingService.navigateToCar(activeSession);
  }

  return (
    <View style={styles.container}>
      {activeSession ? (
        <View style={styles.activeContainer}>
          <View style={styles.locationCard}>
            <Text style={styles.carIcon}>🚗</Text>
            <Text style={styles.addressText}>
              {activeSession.location.address || 'Parked location'}
            </Text>
            <Text style={styles.coordsText}>
              {activeSession.location.latitude.toFixed(5)}, {activeSession.location.longitude.toFixed(5)}
            </Text>
          </View>

          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={[styles.timerText, timeRemaining === 'EXPIRED' && styles.expiredText]}>
              {timeRemaining}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
              <Text style={styles.buttonText}>Navigate to Car</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
              <Text style={styles.buttonText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>No Active Parking</Text>
          <Text style={styles.emptySubtitle}>Tap the button below when you park</Text>
          <TouchableOpacity style={styles.parkButton} onPress={handleParkHere}>
            <Text style={styles.parkButtonText}>I Parked Here</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showDurationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parking Duration</Text>
            <Text style={styles.modalSubtitle}>How long are you parking?</Text>

            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, !useDays && styles.modeButtonActive]}
                onPress={() => setUseDays(false)}
              >
                <Text style={[styles.modeButtonText, !useDays && styles.modeButtonTextActive]}>
                  Hours / Min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, useDays && styles.modeButtonActive]}
                onPress={() => setUseDays(true)}
              >
                <Text style={[styles.modeButtonText, useDays && styles.modeButtonTextActive]}>
                  Days
                </Text>
              </TouchableOpacity>
            </View>

            {useDays ? (
              <View style={styles.daysContainer}>
                <TextInput
                  style={styles.daysInput}
                  value={pickerDays > 0 ? pickerDays.toString() : ''}
                  onChangeText={(text) => setPickerDays(parseInt(text, 10) || 0)}
                  keyboardType="number-pad"
                  placeholder="1"
                />
                <Text style={styles.daysLabel}>day{pickerDays !== 1 ? 's' : ''}</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <TimePicker
                  hours={pickerHours}
                  minutes={pickerMinutes}
                  onTimeChange={(h, m) => {
                    setPickerHours(h);
                    setPickerMinutes(m);
                  }}
                  maxHours={12}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDurationModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalStartButton} onPress={handleStartParking}>
                <Text style={styles.modalStartText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  activeContainer: { flex: 1, padding: 16, paddingTop: 20 },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carIcon: { fontSize: 48, marginBottom: 12 },
  addressText: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#333' },
  coordsText: { fontSize: 13, color: '#999', marginTop: 4 },
  timerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timerLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    fontVariant: ['tabular-nums'],
  },
  expiredText: { color: '#FF3B30' },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 15, color: '#999', marginTop: 8, marginBottom: 32 },
  parkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  parkButtonText: { color: 'white', fontWeight: '700', fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 3,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: { fontSize: 14, color: '#999', fontWeight: '500' },
  modeButtonTextActive: { color: '#333', fontWeight: '600' },
  pickerContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  daysInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 24,
    textAlign: 'center',
    width: 80,
    fontWeight: '600',
  },
  daysLabel: {
    fontSize: 18,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  modalStartButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  modalStartText: { fontSize: 16, color: 'white', fontWeight: '600' },
});
