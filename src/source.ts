import AsyncStorage from '@react-native-async-storage/async-storage';

// Dinlemelerin nereden okunacağı: 'device' = telefonda çalan (her müzik uygulaması), 'spotify' = Spotify hesabı
export type Source = 'device' | 'spotify';
const KEY = 'listening-source';

export async function getSource(): Promise<Source | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === 'device' || v === 'spotify' ? v : null;
  } catch {
    return null;
  }
}
export async function setSource(s: Source | null) {
  try {
    if (s) await AsyncStorage.setItem(KEY, s);
    else await AsyncStorage.removeItem(KEY);
  } catch {}
}
