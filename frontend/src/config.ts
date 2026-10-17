import { Platform } from 'react-native';

const getHost = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }
  // Expo mobil testleri için aktif yerel ağ IP'si
  return '192.168.1.142';
};

export const API_HOST = getHost();
export const API_PORT = 8000;
export const API_BASE = `http://${API_HOST}:${API_PORT}`;
