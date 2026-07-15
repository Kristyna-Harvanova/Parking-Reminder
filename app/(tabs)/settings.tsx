import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppSettings, DEFAULT_SETTINGS } from '@/src/types';
import { ParkingRepository } from '@/src/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [reminderText, setReminderText] = useState('');
  const [radiusText, setRadiusText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  async function loadSettings() {
    const s = await ParkingRepository.getSettings();
    setSettings(s);
    setReminderText(s.defaultReminderBefore.toString());
    setRadiusText(s.geofenceRadius.toString());
  }

  async function handleSave() {
    const reminder = parseInt(reminderText, 10);
    const radius = parseInt(radiusText, 10);

    if (isNaN(reminder) || reminder < 1 || reminder > 60) {
      Alert.alert('Invalid', 'Reminder must be between 1 and 60 minutes.');
      return;
    }
    if (isNaN(radius) || radius < 20 || radius > 500) {
      Alert.alert('Invalid', 'Geofence radius must be between 20 and 500 meters.');
      return;
    }

    const updated: AppSettings = {
      defaultReminderBefore: reminder,
      geofenceRadius: radius,
    };
    await ParkingRepository.saveSettings(updated);
    setSettings(updated);
    Keyboard.dismiss();
    Alert.alert('Saved', 'Settings updated.');
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Reminder before expiry (minutes)</Text>
        <TextInput
          style={styles.input}
          value={reminderText}
          onChangeText={setReminderText}
          keyboardType="number-pad"
          placeholder="10"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Arrival geofence radius (meters)</Text>
        <TextInput
          style={styles.input}
          value={radiusText}
          onChangeText={setRadiusText}
          keyboardType="number-pad"
          placeholder="50"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  section: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
