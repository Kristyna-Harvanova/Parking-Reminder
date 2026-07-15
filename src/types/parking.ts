export interface ParkingLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ParkingSession {
  id: string;
  location: ParkingLocation;
  startTime: string;
  duration: number; // minutes
  reminderBefore: number; // minutes before expiry (default: 10)
  photo?: string; // local URI to ticket photo
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  defaultReminderBefore: number; // minutes, default: 10
  geofenceRadius: number; // meters, default: 50
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultReminderBefore: 10,
  geofenceRadius: 50,
};
