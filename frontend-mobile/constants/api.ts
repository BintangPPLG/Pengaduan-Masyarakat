import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Backend sama dengan frontend-web (default port 3000).
 * - Emulator Android: 10.0.2.2
 * - Expo Go di HP: biasanya hostUri = IP PC; jika gagal, ganti manual ke IP LAN mesin Anda.
 */
function devApiHost(): string {
  const uri = Constants.expoConfig?.hostUri;
  if (uri) {
    const host = uri.split(':')[0];
    if (host && host !== '127.0.0.1') return host;
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_BASE_URL = `http://${devApiHost()}:3000`;
