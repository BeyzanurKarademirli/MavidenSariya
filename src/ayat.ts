import data from './data/ayat.json';
import { Ayah } from './content';

type AyahPart = { verses: number[]; text: string };
type AyahData = { surah: string; ar: { n: number; text: string }[]; tr: AyahPart[]; before?: AyahPart; after?: AyahPart };

const AYAT = data as Record<string, AyahData>;

export type ResolvedAyah = {
  title: string; // "Bakara Suresi, 286. ayet"
  arabic?: string; // kesit gösterilirken Arapça metnin tamamı gösterilmez (eşleşmesin diye)
  arabicFull: string;
  meal: string; // Diyanet İşleri meali (birebir; kesitse başında/sonunda …)
  isExcerpt: boolean;
  full: string; // ayet(ler)in tam meali
  before?: { n: string; text: string }; // bağlam: önceki ayet
  after?: { n: string; text: string }; // bağlam: sonraki ayet
  link: string;
};

// Bu uzunluktan kısa ayetler kesilmeden, tamamıyla gösterilir (bağlam kopmasın)
const FULL_UNDER = 260;

const toArabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

export function resolveAyah(item: Ayah): ResolvedAyah {
  const d = AYAT[`${item.surahNo}:${item.ayah}`];
  const title = `${d.surah} Suresi, ${item.ayah}. ayet`;
  const first = item.ayah.split('-')[0];
  const link = `https://acikkuran.com/${item.surahNo}/${first}`;
  const arabicFull = d.ar.map((v) => `${v.text} ﴿${toArabicDigits(v.n)}﴾`).join(' ');
  const full = d.tr.length === 1 ? d.tr[0].text : d.tr.map((p) => `(${p.verses.join('-')}) ${p.text}`).join('\n');

  const part = item.excerpt ? d.tr.find((p) => p.text.includes(item.excerpt!))?.text : undefined;
  const isExcerpt = !!(item.excerpt && part && part.length > FULL_UNDER);
  let meal = full;
  if (isExcerpt) {
    const ex = item.excerpt!;
    const start = part!.indexOf(ex);
    meal = (start > 0 ? '… ' : '') + ex + (start + ex.length < part!.length ? ' …' : '');
  } else if (part) {
    meal = part; // kesit vardı ama ayet kısa: o kısmın tamamını göster
  }
  const ctx = (p?: AyahPart) => (p ? { n: p.verses.join('-'), text: p.text } : undefined);
  return {
    title,
    arabic: isExcerpt ? undefined : arabicFull,
    arabicFull,
    meal,
    isExcerpt,
    full,
    before: ctx(d.before),
    after: ctx(d.after),
    link,
  };
}
