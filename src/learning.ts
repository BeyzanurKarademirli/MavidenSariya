import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodId } from './content';
import { Track } from './spotify';

// Kişisel öğrenme: kullanıcı tahmini onayladıkça (👍), reddettikçe (👎) ya da hâlini kendisi
// seçtikçe, o an dinlediği şarkılar, sanatçılar ve sözlerde bulunan kelimeler hakkında not tutulur.
// Her şey yalnızca bu telefonda (AsyncStorage) saklanır; hiçbir yere gönderilmez.

const KEY = 'learn:v1';
const MAX_SCORE = 6; // bir şarkının/sanatçının bir hâle bağlılığı en fazla bu kadar birikir
const LEARN_TRACKS = 5; // geri bildirim en yeni kaç şarkıya uygulanır

export type MoodScores = Partial<Record<MoodId, number>>;
export type Model = {
  tracks: Record<string, { name: string; moods: MoodScores }>; // Spotify şarkı kimliği → hâller
  artists: Record<string, MoodScores>; // sanatçı adı (küçük harf) → hâller
  words: Record<string, number>; // anahtar kelime → ağırlık çarpanı (varsayılan 1)
  events: number; // toplam geri bildirim sayısı
};

export const emptyModel = (): Model => ({ tracks: {}, artists: {}, words: {}, events: 0 });

let cache: Model | null = null;

export async function loadModel(): Promise<Model> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? { ...emptyModel(), ...JSON.parse(raw) } : emptyModel();
  } catch {
    cache = emptyModel();
  }
  return cache!;
}

async function save(m: Model) {
  cache = m;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(m));
  } catch {}
}

export async function resetModel(): Promise<Model> {
  const m = emptyModel();
  await save(m);
  return m;
}

export const artistKey = (name: string) => name.toLocaleLowerCase('tr-TR').trim();

function bump(scores: MoodScores, mood: MoodId, by: number) {
  scores[mood] = Math.max(0, Math.min(MAX_SCORE, (scores[mood] ?? 0) + by));
  if (!scores[mood]) delete scores[mood];
}
function tuneWord(m: Model, kw: string, by: number) {
  m.words[kw] = Math.max(0.3, Math.min(1.6, (m.words[kw] ?? 1) + by));
}

// Birden fazla hâl olabilir (karışık duygular); ağırlık hâl sayısına bölünür.
export type Feedback =
  | { kind: 'confirm'; predicted: MoodId[] } // 👍 tahmin doğru
  | { kind: 'reject'; predicted: MoodId[] } // 👎 tahmin yanlış (henüz doğrusunu seçmedi)
  | { kind: 'correct'; predicted: MoodId[]; chosen: MoodId[] }; // kullanıcı doğru hâl(ler)i seçti

/**
 * Geri bildirimi öğrenir. tracks: tahminde kullanılan şarkılar (en yeni başta);
 * trackWords: her şarkıda hangi hâle hangi anahtar kelimelerin katkı verdiği.
 */
export async function learn(
  fb: Feedback,
  tracks: Track[],
  trackWords: Record<string, Partial<Record<MoodId, string[]>>>,
): Promise<Model> {
  const m = structuredCloneSafe(await loadModel());
  tracks.slice(0, LEARN_TRACKS).forEach((t, i) => {
    const w = t.playedAt ? Math.pow(0.75, i) : 1; // şu an çalan en çok öğrenir
    const tr = (m.tracks[t.id] ??= { name: t.name, moods: {} });
    tr.name = t.name;
    const words = trackWords[t.id] ?? {};

    const reinforce = (list: MoodId[], track: number, artist: number, word: number) => {
      const k = 1 / Math.max(1, list.length);
      for (const mood of list) {
        bump(tr.moods, mood, track * w * k);
        t.artists.forEach((a) => bump((m.artists[artistKey(a)] ??= {}), mood, artist * w * k));
        (words[mood] ?? []).forEach((kw) => tuneWord(m, kw, word * w * k));
      }
    };
    if (fb.kind === 'confirm') {
      reinforce(fb.predicted, 1.0, 0.4, 0.05);
    } else {
      // reddedilen ya da düzeltilen tahmin: seçilmeyen tahmin hâllerine verilen katkı zayıflar
      const chosen = fb.kind === 'correct' ? fb.chosen : [];
      const wrong = fb.predicted.filter((x) => !chosen.includes(x));
      for (const mood of wrong) {
        bump(tr.moods, mood, -0.8 * w);
        (words[mood] ?? []).forEach((kw) => tuneWord(m, kw, -0.12 * w));
      }
      if (chosen.length) reinforce(chosen, 1.5 * Math.min(chosen.length, 2), 0.6, 0.08);
    }
    if (!Object.keys(tr.moods).length) delete m.tracks[t.id];
  });
  m.events += 1;
  await save(m);
  return m;
}

function structuredCloneSafe<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}
