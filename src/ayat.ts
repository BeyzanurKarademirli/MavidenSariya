import data from './data/ayat.json';
import { Ayah } from './content';

type AyahPart = { verses: number[]; text: string };
type AyahData = { surah: string; ar: { n: number; text: string }[]; tr: AyahPart[] };

const AYAT = data as Record<string, AyahData>;

export type ResolvedAyah = {
  title: string; // "Bakara Suresi, 286. ayet"
  arabic?: string; // kesit gösterilirken Arapça metnin tamamı gösterilmez (eşleşmesin diye)
  meal: string; // Diyanet İşleri meali (birebir; kesitse başında/sonunda …)
  link: string;
};

const toArabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

export function resolveAyah(item: Ayah): ResolvedAyah {
  const d = AYAT[`${item.surahNo}:${item.ayah}`];
  const title = `${d.surah} Suresi, ${item.ayah}. ayet`;
  const first = item.ayah.split('-')[0];
  const link = `https://acikkuran.com/${item.surahNo}/${first}`;
  const arabic = item.excerpt ? undefined : d.ar.map((v) => `${v.text} ﴿${toArabicDigits(v.n)}﴾`).join(' ');

  let meal: string;
  if (item.excerpt) {
    const part = d.tr.find((p) => p.text.includes(item.excerpt!))!.text;
    const ex = item.excerpt;
    const start = part.indexOf(ex);
    meal = (start > 0 ? '… ' : '') + ex + (start + ex.length < part.length ? ' …' : '');
  } else if (d.tr.length === 1) {
    meal = d.tr[0].text;
  } else {
    meal = d.tr.map((p) => `(${p.verses.join('-')}) ${p.text}`).join('\n');
  }
  return { title, arabic, meal, link };
}
