import * as Location from 'expo-location';
import { Platform, Linking } from 'react-native';
import { ParkingLocation } from '../types';

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation(): Promise<ParkingLocation | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const address = await this.reverseGeocode(
      location.coords.latitude,
      location.coords.longitude
    );

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address,
    };
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.street, r.city, r.postalCode].filter(Boolean);
        return parts.join(', ') || undefined;
      }
    } catch {
      // Geocoding can fail silently — address is optional
    }
    return undefined;
  },

  async startGeofencing(
    latitude: number,
    longitude: number,
    radius: number,
    taskName: string
  ): Promise<void> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.startGeofencingAsync(taskName, [
        { latitude, longitude, radius },
      ]);
    } catch {
      // Geofencing not available in Expo Go — requires dev build
    }
  },

  async stopGeofencing(taskName: string): Promise<void> {
    try {
      const isRegistered = await Location.hasStartedGeofencingAsync(taskName);
      if (isRegistered) {
        await Location.stopGeofencingAsync(taskName);
      }
    } catch {
      // Geofencing not available in Expo Go
    }
  },

  openInMaps(latitude: number, longitude: number): void {
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=w`,
      android: `google.navigation:q=${latitude},${longitude}&mode=w`,
    });
    if (url) Linking.openURL(url);
  },
};
