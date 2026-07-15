import { ParkingSession, AppSettings } from '../types';
import { ParkingRepository } from '../storage/repository';
import { LocationService } from './location';
import { NotificationService } from './notifications';

const GEOFENCE_TASK = 'PARKING_GEOFENCE_TASK';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const ParkingService = {
  async startSession(
    duration: number,
    photoUri?: string
  ): Promise<ParkingSession | null> {
    const location = await LocationService.getCurrentLocation();
    if (!location) return null;

    const settings = await ParkingRepository.getSettings();

    const session: ParkingSession = {
      id: generateId(),
      location,
      startTime: new Date().toISOString(),
      duration,
      reminderBefore: settings.defaultReminderBefore,
      photo: photoUri,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await ParkingRepository.saveSession(session);

    try {
      await NotificationService.scheduleExpiryReminder(session);
    } catch {
      // Notifications may not be available — session still works
    }

    await LocationService.startGeofencing(
      location.latitude,
      location.longitude,
      settings.geofenceRadius,
      GEOFENCE_TASK
    );

    return session;
  },

  async endSession(id: string): Promise<void> {
    await ParkingRepository.deactivateSession(id);
    await LocationService.stopGeofencing(GEOFENCE_TASK);
    await NotificationService.cancelAll();
  },

  async getActiveSession(): Promise<ParkingSession | null> {
    const sessions = await ParkingRepository.getActiveSessions();
    return sessions.length > 0 ? sessions[0] : null;
  },

  async navigateToCar(session: ParkingSession): Promise<void> {
    LocationService.openInMaps(session.location.latitude, session.location.longitude);
  },

  getTimeRemaining(session: ParkingSession): number {
    const expiryTime = new Date(session.startTime).getTime() + session.duration * 60 * 1000;
    return Math.max(0, expiryTime - Date.now());
  },

  isExpired(session: ParkingSession): boolean {
    return this.getTimeRemaining(session) === 0;
  },
};
