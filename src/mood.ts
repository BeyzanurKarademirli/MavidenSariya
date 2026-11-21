import { MoodId } from './content';
import { Track } from './spotify';

// Spotify, yeni uygulamalar için "audio-features" (valence/energy) uç noktasını kapattığından
// ruh hali; şarkı adı, sanatçı türleri ve dinleme saatinden basit bir puanlamayla tahmin edilir.
// Tahmin her zaman kullanıcıya gösterilir ve kullanıcı düzeltebilir.

const KEYWORDS: Record<MoodId, string[]> = {
  huzun: [
    'ağla', 'gözyaşı', 'hüzün', 'keder', 'dert', 'acı', 'yara', 'kırık', 'ölüm', 'veda', 'gitti', 'elveda', 'yalnız bırak',
    'sad', 'cry', 'tears', 'broken', 'hurt', 'pain', 'goodbye', 'lost', 'alone', 'sorry', 'grief', 'blue', 'die',
  ],
  kaygi: [
    'korku', 'kork', 'endişe', 'kaygı', 'karanlık', 'kaos', 'nefes', 'uykusuz', 'deli', 'kaybol', 'sis',
    'anxiety', 'anxious', 'fear', 'scared', 'panic', 'pressure', 'stress', 'nervous', 'insomnia', 'dark', 'chaos', 'help',
  ],
  ofke: [
    'öfke', 'nefret', 'savaş', 'intikam', 'yak', 'kavga', 'isyan', 'sinir', 'yıkıl', 'bitir',
    'rage', 'angry', 'hate', 'fight', 'war', 'kill', 'revenge', 'fire', 'burn', 'mad', 'scream', 'riot', 'enemy',
  ],
  ozlem: [
    'özle', 'hasret', 'sıla', 'gurbet', 'uzak', 'hatıra', 'anı', 'yalnız', 'gece', 'ay ', 'sensiz', 'dön', 'beni unutma',
    'miss', 'missing', 'lonely', 'far away', 'memories', 'remember', 'home', 'without you', 'come back', 'night', 'moon',
  ],
  nese: [
    'dans', 'oyna', 'eğlen', 'gül', 'mutlu', 'neşe', 'parti', 'yaz', 'güneş', 'aşk', 'sevgilim', 'hadi',
    'happy', 'dance', 'party', 'sunshine', 'summer', 'love', 'fun', 'smile', 'good', 'celebrate', 'baby', 'shine',
  ],
  huzur: [
    'huzur', 'sakin', 'deniz', 'rüzgar', 'yağmur', 'dua', 'ilahi', 'sabah', 'nefes al', 'sükût', 'ney',
    'calm', 'peace', 'quiet', 'ocean', 'rain', 'breathe', 'morning', 'slow', 'gentle', 'serene', 'lullaby', 'dream',
  ],
};

const GENRES: Record<MoodId, string[]> = {
  huzun: ['sad', 'arabesk', 'emo', 'slowcore', 'turkish folk', 'türkü', 'fado', 'blues'],
  kaygi: ['dark', 'trip hop', 'industrial', 'drill', 'phonk', 'shoegaze'],
  ofke: ['metal', 'hardcore', 'punk', 'rage', 'grunge', 'trap', 'turkish hip hop', 'rap'],
  ozlem: ['indie', 'singer-songwriter', 'özgün', 'turkish singer-songwriter', 'acoustic', 'bedroom pop', 'dream pop'],
  nese: ['dance', 'pop', 'edm', 'house', 'disco', 'reggaeton', 'funk', 'turkish pop', 'afrobeat', 'k-pop'],
  huzur: ['ambient', 'classical', 'lo-fi', 'lofi', 'jazz', 'new age', 'sufi', 'ilahi', 'nasheed', 'meditation', 'piano', 'tasavvuf'],
};

export type MoodResult = {
  mood: MoodId;
  confidence: number; // 0..1
  scores: Record<MoodId, number>;
  evidence: string[]; // kullanıcıya gösterilecek ipuçları
};

const empty = (): Record<MoodId, number> => ({ huzun: 0, kaygi: 0, ofke: 0, ozlem: 0, nese: 0, huzur: 0 });

function normalize(s: string) {
  // Noktalama işaretlerini boşluğa çevir; anahtar kelimeler kelime başından eşleşir
  // (Türkçe ekleri yakalamak için: "ağla" → "ağlama", "ağladım").
  return ' ' + s.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]+/gu, ' ') + ' ';
}

export function detectMood(tracks: Track[], now = new Date()): MoodResult {
  const scores = empty();
  const evidence: string[] = [];

  tracks.forEach((t, i) => {
    // Son dinlenen şarkılar daha ağır basar
    const w = 1 / (1 + i * 0.15);
    const title = normalize(t.name);
    for (const mood of Object.keys(KEYWORDS) as MoodId[]) {
      for (const kw of KEYWORDS[mood]) {
        if (title.includes(' ' + kw)) {
          scores[mood] += 2 * w;
          if (evidence.length < 6) evidence.push(`"${t.name}" → ${kw.trim()}`);
          break;
        }
      }
      const genreText = normalize(t.genres.join(' | '));
      if (GENRES[mood].some((g) => genreText.includes(normalize(g).trim()))) scores[mood] += 1 * w;
    }
  });

  // Gece geç saatte dinleme: özlem / hüzün yönüne hafif kaydır
  const hour = now.getHours();
  if (hour >= 0 && hour < 5) {
    scores.ozlem += 1;
    scores.huzun += 0.5;
    evidence.push('Gece geç saatte dinliyorsun');
  }

  const entries = Object.entries(scores) as [MoodId, number][];
  entries.sort((x, y) => y[1] - x[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const [topMood, topScore] = entries[0];

  if (total === 0) {
    return { mood: 'huzur', confidence: 0, scores, evidence: ['Belirgin bir ipucu bulunamadı'] };
  }
  return { mood: topMood, confidence: Math.min(1, topScore / total), scores, evidence };
}
