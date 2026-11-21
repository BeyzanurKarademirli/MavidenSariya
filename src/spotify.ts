import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAsync, TokenResponse } from 'expo-auth-session';

// https://developer.spotify.com/dashboard adresinden aldığınız Client ID
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

export const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const SCOPES = ['user-read-recently-played', 'user-read-currently-playing'];

export type Track = {
  id: string;
  name: string;
  artists: string[];
  genres: string[];
  image?: string;
  playedAt?: string;
};

const TOKEN_KEY = 'spotify_token';

export async function saveToken(t: TokenResponse) {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t.getRequestConfig()));
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/** Kayıtlı token'ı yükler; süresi dolduysa yeniler. */
export async function loadAccessToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  let token = new TokenResponse(JSON.parse(raw));
  if (token.shouldRefresh()) {
    if (!token.refreshToken) return null;
    try {
      token = await refreshAsync({ clientId: SPOTIFY_CLIENT_ID, refreshToken: token.refreshToken }, discovery);
      // Spotify yeni refresh token döndürmeyebilir; eskisini koru
      if (!token.refreshToken) token.refreshToken = JSON.parse(raw).refreshToken;
      await saveToken(token);
    } catch {
      await clearToken();
      return null;
    }
  }
  return token.accessToken;
}

async function api<T>(token: string, path: string): Promise<T | null> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Spotify ${res.status}`);
  return res.json();
}

type SpotifyTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album?: { images?: { url: string }[] };
};

/** Sanatçı türlerini getirir. Spotify bu alanı bazı uygulamalarda kısıtlayabilir; hata olursa boş döner. */
async function fetchGenres(token: string, artistIds: string[]): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  const unique = [...new Set(artistIds)].slice(0, 15);
  await Promise.all(
    unique.map(async (id) => {
      try {
        const a = await api<{ genres?: string[] }>(token, `/artists/${id}`);
        out[id] = a?.genres ?? [];
      } catch {
        out[id] = [];
      }
    }),
  );
  return out;
}

/** Şu an çalan + son dinlenen şarkılar (en yenisi başta). */
export async function fetchListening(token: string): Promise<Track[]> {
  const [current, recent] = await Promise.all([
    api<{ item: SpotifyTrack | null }>(token, '/me/player/currently-playing').catch((e) => {
      if (e.message === 'UNAUTHORIZED') throw e;
      return null;
    }),
    api<{ items: { track: SpotifyTrack; played_at: string }[] }>(token, '/me/player/recently-played?limit=30'),
  ]);

  const raw: { t: SpotifyTrack; playedAt?: string }[] = [];
  if (current?.item?.id) raw.push({ t: current.item });
  for (const it of recent?.items ?? []) {
    if (it.track?.id && it.track.id !== current?.item?.id) raw.push({ t: it.track, playedAt: it.played_at });
  }

  const genreMap = await fetchGenres(token, raw.map((r) => r.t.artists[0]?.id).filter(Boolean));

  return raw.map(({ t, playedAt }) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name),
    genres: t.artists.flatMap((a) => genreMap[a.id] ?? []),
    image: t.album?.images?.[t.album.images.length - 1]?.url,
    playedAt,
  }));
}
