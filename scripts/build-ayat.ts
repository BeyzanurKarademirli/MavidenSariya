/// <reference types="node" />
// Kullanım: npm run ayat
// src/content.ts içindeki ayet referanslarını okur, Diyanet İşleri mealini ve Arapça metni
// quran-json paketinden (kaynak: tanzil.net, tr.diyanet) alıp src/data/ayat.json dosyasına yazar.
// Kesitler (excerpt) mealde birebir geçmiyorsa hata verir.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { CONTENT } from '../src/content';
import { SURAH_NAMES } from '../src/surahs';

type Verse = { id: number; text: string; translation: string };
type Chapter = { id: number; verses: Verse[] };

const require = createRequire(import.meta.url);
const quran: Chapter[] = JSON.parse(readFileSync(require.resolve('quran-json/dist/quran_tr.json'), 'utf8'));

export type AyahPart = { verses: number[]; text: string };
export type AyahData = { surah: string; ar: { n: number; text: string }[]; tr: AyahPart[] };

const out: Record<string, AyahData> = {};
const errors: string[] = [];
const warnings: string[] = [];
let refCount = 0;

for (const [mood, items] of Object.entries(CONTENT)) {
  for (const it of items) {
    if (it.kind !== 'ayet') continue;
    refCount++;
    const key = `${it.surahNo}:${it.ayah}`;
    const [from, to = from] = it.ayah.split('-').map(Number);
    const ch = quran[it.surahNo - 1];
    const verses = ch?.verses.filter((v) => v.id >= from && v.id <= to) ?? [];
    if (verses.length !== to - from + 1) {
      errors.push(`${mood}: ${key} bulunamadı`);
      continue;
    }
    if (!out[key]) {
      // Diyanet mealinde birden çok ayete yayılan cümle her ayette tekrar eder: aynı metinleri birleştir
      const tr: AyahPart[] = [];
      for (const v of verses) {
        const t = v.translation.trim();
        const last = tr[tr.length - 1];
        if (last && last.text === t) last.verses.push(v.id);
        else tr.push({ verses: [v.id], text: t });
      }
      out[key] = { surah: SURAH_NAMES[it.surahNo - 1], ar: verses.map((v) => ({ n: v.id, text: v.text })), tr };
    }
    const parts = out[key].tr;
    if (it.excerpt) {
      if (!parts.some((p) => p.text.includes(it.excerpt!))) errors.push(`${mood}: ${key} kesiti mealde birebir yok → "${it.excerpt}"`);
    } else {
      const len = parts.reduce((s, p) => s + p.text.length, 0);
      if (len > 320) warnings.push(`${mood}: ${key} uzun (${len} karakter), kesit eklemeyi düşünün`);
    }
  }
}

warnings.forEach((w) => console.warn('UYARI', w));
if (errors.length) {
  errors.forEach((e) => console.error('HATA', e));
  process.exit(1);
}
writeFileSync(new URL('../src/data/ayat.json', import.meta.url), JSON.stringify(out));
console.log(`${refCount} ayet referansı, ${Object.keys(out).length} farklı ayet/ayet grubu → src/data/ayat.json`);
