import { Platform } from 'react-native';
import NowPlaying from '../modules/now-playing';
import { Track } from './spotify';

// Telefonda çalan şarkılar: Android'in medya oturumlarından (YouTube Music, Spotify, MP3 çalarlar...)
// okunur. Geçmiş, uygulama kapalıyken de yerel servis tarafından telefonda tutulur.

export const deviceSupported = Platform.OS === 'android' && !!NowPlaying;

export function hasDevicePermission(): boolean {
  try {
    return !!NowPlaying?.isPermissionGranted();
  } catch {
    return false;
  }
}
export const openDevicePermission = () => NowPlaying?.openPermissionSettings();
export const openAppSettings = () => NowPlaying?.openAppSettings();
export const clearDeviceHistory = () => NowPlaying?.clearHistory();

const APP_NAMES: Record<string, string> = {
  'com.spotify.music': 'Spotify',
  'com.spotify.lite': 'Spotify Lite',
  'com.google.android.apps.youtube.music': 'YouTube Music',
  'com.google.android.youtube': 'YouTube',
  'app.revanced.android.youtube': 'YouTube',
  'com.apple.android.music': 'Apple Music',
  'deezer.android.app': 'Deezer',
  'com.soundcloud.android': 'SoundCloud',
  'com.aspiro.tidal': 'TIDAL',
  'com.amazon.mp3': 'Amazon Music',
  'com.turkcell.gncplay': 'fizy',
  'com.sec.android.app.music': 'Samsung Müzik',
  'com.miui.player': 'Mi Müzik',
  'com.maxmpz.audioplayer': 'Poweramp',
  'in.krosbits.musicolet': 'Musicolet',
  'com.google.android.music': 'Google Play Müzik',
  'com.shazam.android': 'Shazam',
};

export function appName(pkg?: string): string {
  if (!pkg) return '';
  return APP_NAMES[pkg] ?? pkg.split('.').filter((p) => !['com', 'android', 'app', 'apps'].includes(p)).slice(-1)[0] ?? pkg;
}

type Raw = { title: string; artist: string; album?: string; duration?: number; package?: string; playing?: boolean; startedAt: number; lastSeen: number };

/** YouTube gibi kaynaklarda başlık "Sanatçı - Şarkı (Official Video)" şeklinde gelebilir: temizle. */
export function cleanTitle(title: string, artist: string): { name: string; artists: string[] } {
  let name = title
    .replace(/\s*[([](official|resmi|lyric|lyrics|audio|video|klip|music video|hd|4k|canlı|live)[^)\]]*[)\]]/gi, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();
  let who = artist.replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  const dash = name.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (dash && (!who || dash[1].toLocaleLowerCase('tr-TR').includes(who.toLocaleLowerCase('tr-TR').split(' ')[0]) || who.toLowerCase().includes('official'))) {
    who = dash[1].trim();
    name = dash[2].trim();
  }
  const artists = who
    .split(/\s*(?:,|&| feat\.? | ft\.? | x | ve )\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { name: name || title, artists: artists.length ? artists : [who || 'Bilinmeyen sanatçı'] };
}

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Telefonda kaydedilen dinleme geçmişi (en yeni başta). Şu an çalan şarkının playedAt değeri boştur. */
export function readDeviceHistory(now = Date.now()): Track[] {
  if (!NowPlaying) return [];
  let raw: Raw[] = [];
  try {
    raw = JSON.parse(NowPlaying.getHistory() || '[]');
  } catch {
    raw = [];
  }
  const list = raw.slice().reverse();
  return list.map((r, i) => {
    const { name, artists } = cleanTitle(r.title, r.artist ?? '');
    // En son kayıt, son 3 dakika içinde hâlâ çalıyorduysa "şimdi çalıyor" sayılır
    const nowPlaying = i === 0 && !!r.playing && now - r.lastSeen < 3 * 60_000;
    return {
      id: 'dev:' + hash(`${name.toLocaleLowerCase('tr-TR')}|${artists.join(',').toLocaleLowerCase('tr-TR')}`),
      name,
      artists,
      album: r.album || undefined,
      durationMs: r.duration && r.duration > 0 ? r.duration : undefined,
      genres: [],
      playedAt: nowPlaying ? undefined : new Date(r.startedAt).toISOString(),
      source: appName(r.package),
    };
  });
}
