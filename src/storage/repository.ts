import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingSession, AppSettings, DEFAULT_SETTINGS } from '../types';

const SESSIONS_KEY = 'parking_sessions';
const SETTINGS_KEY = 'app_settings';

export const ParkingRepository = {
  async getActiveSessions(): Promise<ParkingSession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter((s) => s.isActive);
  },

  async getAllSessions(): Promise<ParkingSession[]> {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  },

  async saveSession(session: ParkingSession): Promise<void> {
    const sessions = await this.getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  async deactivateSession(id: string): Promise<void> {
    const sessions = await this.getAllSessions();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      session.isActive = false;
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  },

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getAllSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },

  async getSettings(): Promise<AppSettings> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
