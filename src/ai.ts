import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodId } from './content';
import { Track } from './spotify';

// Yapay zekâ ile tahmin: şarkı adı + sanatçı + söz, Mâverâ sunucusuna (Cloudflare Worker) gönderilir;
// sunucu Gemini'ye (olmazsa Cloudflare Workers AI'ya) sorar. Sunucuya kullanıcı kimliği gönderilmez.
// Her şarkının sonucu telefonda saklanır; aynı şarkı tekrar sorulmaz.
// Günlük hak: kullanıcı başına günde DAILY_LIMIT yeni şarkı. Dolunca telefondaki yöntemle devam edilir.

export const AI_URL = process.env.EXPO_PUBLIC_AI_URL ?? '';
export const DAILY_LIMIT = 40;
const ANALYZE_TRACKS = 12; // tahmine giren en son şarkılar
const TIMEOUT_MS = 15_000;

export type AiMoods = { moods: { id: MoodId; score: number }[]; reason?: string; provider?: string };
export type AiStatus = 'ok' | 'limit' | 'off' | 'unavailable' | 'offline' | 'missing';
export type AiInfo = { status: AiStatus; used: number; limit: number; analyzedNow: number };

const K_ENABLED = 'ai:enabled';
const K_QUOTA = 'ai:quota';
const K_SONG = 'ai:song:';

export async function isAiEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(K_ENABLED)) !== '0';
  } catch {
    return true;
  }
}
export async function setAiEnabled(on: boolean) {
  try {
    await AsyncStorage.setItem(K_ENABLED, on ? '1' : '0');
  } catch {}
}

const today = () => new Date().toISOString().slice(0, 10);

export async function getQuota(): Promise<{ used: number; limit: number }> {
  try {
    const q = JSON.parse((await AsyncStorage.getItem(K_QUOTA)) ?? '{}');
    return { used: q.day === today() ? q.used ?? 0 : 0, limit: DAILY_LIMIT };
  } catch {
    return { used: 0, limit: DAILY_LIMIT };
  }
}
async function addUsage(n: number) {
  const { used } = await getQuota();
  try {
    await AsyncStorage.setItem(K_QUOTA, JSON.stringify({ day: today(), used: used + n }));
  } catch {}
}

/** Şarkının kalıcı anahtarı (aynı şarkı farklı uygulamalardan gelse de aynı olsun) */
export function songKey(t: Track) {
  const norm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return `${norm(t.name)}|${norm(t.artists[0] ?? '')}`;
}

/** Son şarkılara yapay zekâ sonucunu ekler. Hata/limit durumunda şarkılar olduğu gibi döner. */
export async function attachAi(tracks: Track[]): Promise<{ tracks: Track[]; info: AiInfo }> {
  const quota = await getQuota();
  const base: AiInfo = { status: 'ok', used: quota.used, limit: quota.limit, analyzedNow: 0 };
  if (!AI_URL) return { tracks, info: { ...base, status: 'missing' } };
  if (!(await isAiEnabled())) return { tracks, info: { ...base, status: 'off' } };

  const targets = tracks.slice(0, ANALYZE_TRACKS);
  const known: Record<string, AiMoods> = {};
  const unknown: Track[] = [];
  await Promise.all(
    targets.map(async (t) => {
      try {
        const raw = await AsyncStorage.getItem(K_SONG + songKey(t));
        if (raw) known[songKey(t)] = JSON.parse(raw);
        else unknown.push(t);
      } catch {
        unknown.push(t);
      }
    }),
  );
  // Aynı şarkı listede iki kez olabilir
  const pending = unknown.filter((t, i) => unknown.findIndex((x) => songKey(x) === songKey(t)) === i);

  let status: AiStatus = 'ok';
  let analyzedNow = 0;
  const remaining = Math.max(0, quota.limit - quota.used);
  const toSend = pending.slice(0, remaining);
  if (pending.length > remaining) status = 'limit';

  if (toSend.length) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${AI_URL}/analyze`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          songs: toSend.map((t) => ({
            key: songKey(t),
            title: t.name,
            artist: t.artists.join(', '),
            lyrics: t.lyrics?.slice(0, 1400),
          })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { results: Record<string, AiMoods | { status: string }> } = await res.json();
      for (const [key, r] of Object.entries(data.results ?? {})) {
        if ('moods' in r) {
          known[key] = r;
          analyzedNow++;
          try {
            await AsyncStorage.setItem(K_SONG + key, JSON.stringify(r));
          } catch {}
        } else if (status === 'ok') {
          status = 'unavailable';
        }
      }
      // Hakkı yalnızca gerçekten yeni incelenen şarkılar için düş
      if (analyzedNow) await addUsage(analyzedNow);
    } catch (e: any) {
      if (status === 'ok') status = e?.name === 'AbortError' || String(e?.message).includes('Network') ? 'offline' : 'unavailable';
    } finally {
      clearTimeout(timer);
    }
  }

  const q2 = await getQuota();
  const out = tracks.map((t) => {
    const r = known[songKey(t)];
    return r ? { ...t, ai: r } : t;
  });
  return { tracks: out, info: { status, used: q2.used, limit: q2.limit, analyzedNow } };
}

export async function clearAiCache() {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(K_SONG));
    await AsyncStorage.removeMany(keys);
  } catch {}
}
