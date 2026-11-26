import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from './spotify';

// Şarkı sözleri: LRCLIB (https://lrclib.net) — ücretsiz, anahtar gerektirmeyen açık bir söz veritabanı.
// Spotify Web API şarkı sözü vermediği için sözler buradan alınır. Bulunamayan şarkılar sessizce atlanır.
const API = 'https://lrclib.net/api';
const HEADERS = { 'Lrclib-Client': 'Mavera/1.1' };
const CACHE_PREFIX = 'lyrics:'; // Spotify şarkı kimliğine göre önbellek ("" = söz bulunamadı)
const MAX_TRACKS = 12; // en son dinlenen şarkılardan kaç tanesinin sözüne bakılacağı (mood.ts ile aynı)

type LrcRecord = { trackName: string; artistName: string; duration: number; instrumental: boolean; plainLyrics: string | null };

/** 404 gibi durumlarda null döner; ağ hatası/zaman aşımında hata fırlatır (önbelleğe yazılmasın diye). */
async function fetchJson<T>(url: string): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
    if (!res.ok) return null; // 404 vb.: söz yok
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function findLyrics(t: Track): Promise<string> {
  const artist = t.artists[0] ?? '';
  const q = (o: Record<string, string | undefined>) =>
    Object.entries(o)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');

  // 1) Tam eşleşme (ad + sanatçı + albüm + süre)
  const exact = await fetchJson<LrcRecord>(
    `${API}/get?${q({
      track_name: t.name,
      artist_name: artist,
      album_name: t.album,
      duration: t.durationMs ? String(Math.round(t.durationMs / 1000)) : undefined,
    })}`,
  );
  if (exact?.plainLyrics) return exact.plainLyrics;

  // 2) Arama: süresi en yakın, sözü olan sonucu seç
  const list = await fetchJson<LrcRecord[]>(`${API}/search?${q({ track_name: t.name, artist_name: artist })}`);
  const withLyrics = (list ?? []).filter((r) => r.plainLyrics && !r.instrumental);
  if (!withLyrics.length) return '';
  const target = (t.durationMs ?? 0) / 1000;
  withLyrics.sort((a, b) => Math.abs(a.duration - target) - Math.abs(b.duration - target));
  const best = withLyrics[0];
  if (target && Math.abs(best.duration - target) > 15) return ''; // başka bir şarkı olabilir
  return best.plainLyrics ?? '';
}

/** Son dinlenen şarkılara sözlerini ekler (önbellekli). Hata olursa şarkılar sözsüz döner. */
export async function attachLyrics(tracks: Track[]): Promise<Track[]> {
  const targets = tracks.slice(0, MAX_TRACKS);
  const lyrics = await Promise.all(
    targets.map(async (t) => {
      const key = CACHE_PREFIX + t.id;
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached !== null) return cached;
      } catch {}
      let text: string;
      try {
        text = await findLyrics(t);
      } catch {
        return ''; // internet yok / zaman aşımı: önbelleğe yazma, sonra tekrar denenir
      }
      try {
        await AsyncStorage.setItem(key, text);
      } catch {}
      return text;
    }),
  );
  return tracks.map((t, i) => (i < targets.length && lyrics[i] ? { ...t, lyrics: lyrics[i] } : t));
}
