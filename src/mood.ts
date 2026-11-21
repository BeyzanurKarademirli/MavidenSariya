import { MoodId } from './content';
import { Track } from './spotify';

// Spotify, yeni uygulamalar için "audio-features" (valence/energy) uç noktasını kapattığından
// ruh hali; şarkı adı, sanatçı türleri ve dinleme saatinden basit bir puanlamayla tahmin edilir.
// Tahmin her zaman kullanıcıya gösterilir ve kullanıcı düzeltebilir.

const KEYWORDS: Record<MoodId, string[]> = {
  huzun: [
    'ağla', 'gözyaşı', 'hüzün', 'keder', 'dert', 'acı', 'yara', 'kırık', 'veda', 'gitti', 'elveda', 'mahzun',
    'sad', 'cry', 'tears', 'broken', 'hurt', 'pain', 'goodbye', 'lost', 'grief', 'blue', 'die', 'funeral',
  ],
  kaygi: [
    'korku', 'kork', 'endişe', 'kaygı', 'karanlık', 'kaos', 'uykusuz', 'deli', 'kaybol', 'sis', 'tedirgin',
    'anxiety', 'anxious', 'fear', 'scared', 'panic', 'pressure', 'stress', 'nervous', 'insomnia', 'dark', 'chaos', 'help',
  ],
  ofke: [
    'öfke', 'nefret', 'savaş', 'intikam', 'yak', 'kavga', 'isyan', 'sinir', 'yıkıl', 'bitir',
    'rage', 'angry', 'hate', 'fight', 'war', 'kill', 'revenge', 'fire', 'burn', 'mad', 'scream', 'riot', 'enemy',
  ],
  ozlem: [
    'özle', 'hasret', 'sıla', 'gurbet', 'uzak', 'hatıra', 'sensiz', 'dön', 'beni unutma', 'eski', 'memleket', 'çocukluk',
    'miss', 'far away', 'memories', 'remember', 'home', 'without you', 'come back', 'nostalgia', 'used to', 'old days',
  ],
  yalnizlik: [
    'yalnız', 'tek başına', 'kimse', 'kimsesiz', 'sessiz', 'boşluk', 'issız', 'terk', 'gece', 'ay ',
    'lonely', 'alone', 'nobody', 'no one', 'empty', 'solitude', 'isolation', 'by myself', 'night', 'moon',
  ],
  ask: [
    'aşk', 'sev', 'sevgili', 'kalbim', 'yarim', 'yare', 'canım', 'gönül', 'öp', 'gözlerin', 'birtanem', 'meftun',
    'love', 'lover', 'kiss', 'darling', 'romance', 'baby', 'my heart', 'crush', 'valentine', 'forever yours',
  ],
  dostluk: [
    'dost', 'arkadaş', 'kardeş', 'birlikte', 'beraber', 'kanka', 'yoldaş', 'el ele', 'omuz',
    'friend', 'together', 'brother', 'sister', 'buddy', 'homie', 'crew', 'we are', 'count on me', 'stand by me',
  ],
  nese: [
    'dans', 'oyna', 'eğlen', 'gül', 'mutlu', 'neşe', 'parti', 'yaz', 'güneş', 'hadi', 'şen',
    'happy', 'dance', 'party', 'sunshine', 'summer', 'fun', 'smile', 'good', 'celebrate', 'shine', 'groove',
  ],
  huzur: [
    'huzur', 'sakin', 'deniz', 'rüzgar', 'yağmur', 'dua', 'ilahi', 'sabah', 'nefes', 'sükût', 'ney', 'bahar',
    'calm', 'peace', 'quiet', 'ocean', 'rain', 'breathe', 'morning', 'slow', 'gentle', 'serene', 'lullaby',
  ],
  varolus: [
    'neden', 'niçin', 'hayat', 'zaman', 'sonsuz', 'evren', 'ölüm', 'kimim', 'anlam', 'var ol', 'yok ol', 'dünya', 'fani', 'yıldız',
    'why', 'life', 'time', 'universe', 'infinity', 'meaning', 'exist', 'who am i', 'void', 'space', 'eternal', 'mortal', 'stars',
  ],
  sezgi: [
    'hisset', 'hisler', 'sezgi', 'rüya', 'iç ses', 'ruh', 'sırr', 'sırlar', 'gizem', 'bilinç', 'kalp', 'gönül gözü', 'ilham', 'ayna',
    'intuition', 'soul', 'spirit', 'feel', 'mystery', 'secret', 'vision', 'inner', 'dream', 'third eye', 'awake', 'mirror',
  ],
  umut: [
    'umut', 'ümit', 'yarın', 'yeni', 'başla', 'şafak', 'ışık', 'kanat', 'uçmak', 'uçalım', 'yüksel', 'güçlü',
    'hope', 'tomorrow', 'rise', 'new day', 'light', 'wings', 'fly', 'begin', 'dawn', 'brave', 'stronger', 'better days',
  ],
  pismanlik: [
    'pişman', 'özür', 'affet', 'hata', 'keşke', 'günah', 'geri al', 'suç', 'vicdan', 'tövbe',
    'sorry', 'regret', 'forgive', 'mistake', 'apolog', 'wish i', 'guilty', 'my fault', 'take it back',
  ],
  yorgunluk: [
    'yorgun', 'yoruldum', 'bitkin', 'uyku', 'tüken', 'ağır', 'bıktım', 'yeter', 'dinlen',
    'tired', 'exhausted', 'sleep', 'numb', 'heavy', 'drained', 'burnout', 'weary', 'give up',
  ],
};

const GENRES: Record<MoodId, string[]> = {
  huzun: ['sad', 'arabesk', 'emo', 'turkish folk', 'türkü', 'fado', 'blues'],
  kaygi: ['dark', 'trip hop', 'industrial', 'drill', 'phonk', 'shoegaze'],
  ofke: ['metal', 'hardcore', 'punk', 'rage', 'grunge', 'trap', 'turkish hip hop', 'rap'],
  ozlem: ['özgün', 'turkish singer-songwriter', 'nostalgia', 'oldies', 'turkish classical', 'türk sanat', 'anadolu'],
  yalnizlik: ['bedroom pop', 'sad lo-fi', 'slowcore', 'sadcore'],
  ask: ['r&b', 'soul', 'romantic', 'bolero', 'love song', 'latin pop'],
  dostluk: ['anadolu rock', 'country', 'folk rock', 'reggae'],
  nese: ['dance', 'pop', 'edm', 'house', 'disco', 'reggaeton', 'funk', 'turkish pop', 'afrobeat', 'k-pop'],
  huzur: ['ambient', 'classical', 'lo-fi', 'lofi', 'jazz', 'sufi', 'ilahi', 'nasheed', 'meditation', 'piano', 'tasavvuf'],
  varolus: ['post-rock', 'progressive', 'art rock', 'experimental', 'neoclassical', 'cinematic'],
  sezgi: ['psychedelic', 'dream pop', 'ethereal', 'new age', 'mantra'],
  umut: ['gospel', 'inspirational', 'anthem', 'worship', 'motivational'],
  pismanlik: ['singer-songwriter', 'acoustic', 'ballad'],
  yorgunluk: ['downtempo', 'sleep', 'chillout', 'chill'],
};

export type MoodResult = {
  mood: MoodId;
  confidence: number; // 0..1
  scores: Record<MoodId, number>;
  evidence: string[]; // kullanıcıya gösterilecek ipuçları
};

const empty = () => Object.fromEntries(Object.keys(KEYWORDS).map((k) => [k, 0])) as Record<MoodId, number>;

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
    scores.yalnizlik += 0.7;
    scores.ozlem += 0.7;
    scores.varolus += 0.5;
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
