import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT, Item, MoodId } from './content';

// Her hâlin ayet ve hadisleri sabit (hâle özgü karışık) bir sırayla döner. Gösterilenler sıranın
// sonuna geçer; böylece bir hâlin bütün ayet ve hadisleri görülmeden aynısı tekrar gelmez.
// Kaldığın yer telefona kaydedilir (uygulamayı kapatıp açınca da devam eder).

const KEY = 'rotation:v1';
export const AYAH_PER_PAGE = 2;
export const HADITH_PER_PAGE = 1;

type Pos = { a: number; h: number };
type State = Partial<Record<MoodId, Pos>>;

let cache: State | null = null;

async function load(): Promise<State> {
  if (cache) return cache;
  try {
    cache = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');
  } catch {
    cache = {};
  }
  return cache!;
}

async function save(state: State) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

/** Hâle özgü, her açılışta aynı kalan karışık sıra (kitaptaki sırayla gelmesin diye). */
function ordered(mood: MoodId) {
  const list = [...CONTENT[mood]];
  let s = [...mood].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) % 233280;
  for (let i = list.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return { ayat: list.filter((x) => x.kind === 'ayet'), hadis: list.filter((x) => x.kind === 'hadis') };
}

function take<T>(list: T[], start: number, n: number): T[] {
  const out: T[] = [];
  for (let k = 0; k < Math.min(n, list.length); k++) out.push(list[(start + k) % list.length]);
  return out;
}

export type Page = { items: Item[]; seenAyat: number; totalAyat: number; seenHadis: number; totalHadis: number };

/** Sıradaki ayet ve hadisleri verir ve sırayı ilerletir (gösterilenler arkaya geçer). */
export async function nextPage(mood: MoodId): Promise<Page> {
  const state = await load();
  const { ayat, hadis } = ordered(mood);
  const pos = state[mood] ?? { a: 0, h: 0 };
  const a = take(ayat, pos.a, AYAH_PER_PAGE);
  const h = take(hadis, pos.h, HADITH_PER_PAGE);
  state[mood] = { a: (pos.a + a.length) % ayat.length, h: (pos.h + h.length) % hadis.length };
  await save(state);
  return {
    items: [a[0], ...h, ...a.slice(1)].filter(Boolean),
    seenAyat: Math.min(pos.a + a.length, ayat.length) || ayat.length,
    totalAyat: ayat.length,
    seenHadis: Math.min(pos.h + h.length, hadis.length) || hadis.length,
    totalHadis: hadis.length,
  };
}
