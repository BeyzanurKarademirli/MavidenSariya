import { MoodId } from './content';
import { Track } from './spotify';

// Spotify, yeni uygulamalar için "audio-features" (valence/energy) uç noktasını kapattığından
// ruh hali; şarkı adı, sanatçı türleri ve dinleme saatinden basit bir puanlamayla tahmin edilir.
// Tahmin her zaman kullanıcıya gösterilir ve kullanıcı düzeltebilir.

// Anahtar kelimeler kelime BAŞINDAN eşleşir ("ağla" → "ağladım", "ağlama"). Çok kısa ve
// başka kelimelerin başı olabilecek sözcüklerden kaçınılmıştır (ör. "yak" → "yakın" olmasın diye yok).
const KEYWORDS: Record<MoodId, string[]> = {
  // Zor anlar
  huzun: ['ağla', 'gözyaşı', 'hüzün', 'keder', 'dert', 'acı', 'yara', 'kırık', 'mahzun', 'gam', 'sad', 'cry', 'tears', 'broken', 'hurt', 'pain', 'grief', 'blue', 'sorrow'],
  yas: ['ölüm', 'öldü', 'mezar', 'rahmetli', 'toprak', 'kaybettim', 'cenaze', 'ağıt', 'funeral', 'grave', 'rest in peace', 'rip', 'mourning', 'gone too soon', 'heaven knows'],
  ayrilik: ['ayrılık', 'ayrıl', 'gitme', 'gittin', 'bitti', 'vazgeç', 'unut', 'eski sevgili', 'elveda', 'veda', 'breakup', 'break up', 'goodbye', 'let go', 'move on', 'heartbreak', 'it s over', 'we are never', 'without you'],
  kaygi: ['endişe', 'kaygı', 'stres', 'panik', 'uykusuz', 'kaos', 'tedirgin', 'düşünce', 'anxiety', 'anxious', 'panic', 'pressure', 'stress', 'nervous', 'overthink', 'insomnia', 'chaos', 'help me'],
  korku: ['korku', 'kork', 'kabus', 'tehlike', 'karanlık', 'canavar', 'fear', 'scared', 'afraid', 'nightmare', 'monster', 'horror', 'ghost', 'dark', 'terror'],
  ofke: ['öfke', 'nefret', 'intikam', 'kavga', 'sinir', 'yakarım', 'yıkarım', 'hınç', 'rage', 'angry', 'hate', 'revenge', 'kill', 'burn', 'scream', 'mad', 'enemy', 'war', 'fight'],
  kirginlik: ['kırgın', 'küs', 'incit', 'vefasız', 'ihanet', 'yalan', 'kandır', 'aldat', 'nankör', 'betray', 'liar', 'lies', 'fake', 'hurt me', 'backstab', 'trust', 'used me', 'cheat'],
  kiskanclik: ['kıskan', 'haset', 'başkası', 'rakip', 'jealous', 'envy', 'envious', 'green eyed', 'someone else'],
  umutsuzluk: ['çaresiz', 'umutsuz', 'dayanamı', 'boşver', 'çıkış yok', 'kurtar', 'batıyorum', 'hopeless', 'helpless', 'give up', 'no way out', 'drowning', 'falling apart', 'sinking', 'can t go on', 'save me'],
  yalnizlik: ['yalnız', 'tek başına', 'kimse', 'kimsesiz', 'sessiz', 'boşluk', 'ıssız', 'terk', 'gece', 'ay ', 'lonely', 'alone', 'nobody', 'no one', 'empty', 'solitude', 'isolation', 'by myself', 'night', 'moon'],
  yorgunluk: ['yorgun', 'yoruldum', 'bitkin', 'uyku', 'tüken', 'ağır', 'bıktım', 'yeter', 'dinlen', 'tired', 'exhausted', 'sleep', 'numb', 'heavy', 'drained', 'burnout', 'weary'],
  pismanlik: ['pişman', 'özür', 'affet', 'hata', 'keşke', 'günah', 'geri al', 'suç', 'vicdan', 'tövbe', 'sorry', 'regret', 'forgive', 'mistake', 'apolog', 'wish i', 'guilty', 'my fault', 'take it back'],
  isyan: ['isyan', 'başkaldır', 'kural', 'sistem', 'direniş', 'özgürlük', 'sokak', 'adalet', 'zulüm', 'rebel', 'riot', 'revolution', 'system', 'freedom', 'against', 'rules', 'outlaw', 'street', 'justice', 'resist'],
  // Gönül
  ozlem: ['özle', 'hasret', 'sıla', 'gurbet', 'uzak', 'hatıra', 'sensiz', 'dön', 'beni unutma', 'eski', 'memleket', 'çocukluk', 'miss', 'far away', 'memories', 'remember', 'home', 'come back', 'nostalgia', 'used to', 'old days'],
  ask: ['aşk', 'sev', 'sevgili', 'kalbim', 'yarim', 'yare', 'canım', 'gönül', 'öp', 'gözlerin', 'birtanem', 'love', 'lover', 'kiss', 'darling', 'romance', 'baby', 'my heart', 'crush', 'valentine'],
  sefkat: ['şefkat', 'merhamet', 'bebek', 'ninni', 'kucak', 'yavrum', 'sarıl', 'koru', 'tender', 'hold me', 'hug', 'lullaby', 'gentle', 'care', 'little one', 'angel', 'protect'],
  dostluk: ['dost', 'arkadaş', 'kardeş', 'birlikte', 'beraber', 'kanka', 'yoldaş', 'el ele', 'omuz', 'friend', 'together', 'brother', 'sister', 'buddy', 'homie', 'crew', 'count on me', 'stand by me'],
  aile: ['anne', 'annem', 'baba', 'babam', 'aile', 'evlat', 'kızım', 'oğlum', 'yuva', 'ev ', 'mother', 'mama', 'mom', 'father', 'dad', 'papa', 'family', 'daughter', 'home sweet'],
  // Canlılık
  nese: ['dans', 'oyna', 'eğlen', 'gül', 'mutlu', 'neşe', 'parti', 'şen', 'güneş', 'yaz', 'happy', 'fun', 'smile', 'party', 'good vibes', 'joy', 'laugh', 'sunshine', 'summer', 'dance', 'groove'],
  cosku: ['enerji', 'koş', 'hız', 'hadi', 'haydi', 'ateş', 'çılgın', 'coş', 'energy', 'run', 'fast', 'jump', 'pump', 'alive', 'wild', 'turn up', 'unstoppable', 'go go', 'adrenaline'],
  guc: ['güç', 'kral', 'kraliçe', 'zafer', 'şampiyon', 'kazan', 'yenilmez', 'para', 'zengin', 'power', 'king', 'queen', 'champion', 'winner', 'winning', 'victory', 'boss', 'legend', 'money', 'rich', 'hero', 'strong'],
  sukur: ['şükür', 'şükret', 'teşekkür', 'nimet', 'hamd', 'minnet', 'grateful', 'thankful', 'thank', 'blessed', 'gratitude', 'bless'],
  umut: ['umut', 'ümit', 'yarın', 'yeni', 'başla', 'şafak', 'ışık', 'kanat', 'uçmak', 'yüksel', 'hope', 'tomorrow', 'rise', 'new day', 'light', 'wings', 'fly', 'begin', 'dawn', 'brave', 'stronger', 'better days'],
  // Derinlik ve dinginlik
  huzur: ['huzur', 'sakin', 'deniz', 'rüzgar', 'yağmur', 'sabah', 'sükût', 'bahar', 'dingin', 'sessizce', 'calm', 'peace', 'quiet', 'ocean', 'rain', 'breathe', 'morning', 'slow', 'serene', 'still'],
  hayranlik: ['güzel', 'muhteşem', 'harika', 'mucize', 'gökyüzü', 'yıldız', 'dağ', 'evren', 'beautiful', 'wonder', 'amazing', 'miracle', 'sky', 'stars', 'paradise', 'galaxy', 'universe', 'majestic'],
  hayal: ['hayal', 'rüya', 'düş', 'bulut', 'masal', 'dalgın', 'dream', 'daydream', 'fantasy', 'cloud', 'imagine', 'fairy', 'wish', 'wonderland', 'floating'],
  varolus: ['neden', 'niçin', 'hayat', 'zaman', 'sonsuz', 'anlam', 'var ol', 'yok ol', 'kimim', 'fani', 'dünya', 'why', 'life', 'time', 'meaning', 'exist', 'who am i', 'void', 'eternal', 'mortal', 'infinity'],
  sezgi: ['hisset', 'hisler', 'sezgi', 'iç ses', 'ruh', 'kalp', 'sırr', 'sırlar', 'ilham', 'ayna', 'bilinç', 'intuition', 'soul', 'spirit', 'inner', 'vision', 'third eye', 'mirror'],
  arayis: ['arıyor', 'arayış', 'ararım', 'yol', 'kayboldum', 'nereye', 'yön', 'pusula', 'search', 'seeking', 'find', 'path', 'road', 'lost', 'wander', 'journey', 'where', 'direction', 'compass'],
  kararsizlik: ['kararsız', 'bilmiyorum', 'belki', 'acaba', 'ikilem', 'arada kaldım', 'seçim', 'maybe', 'perhaps', 'decide', 'choice', 'confused', 'don t know', 'torn', 'crossroads', 'should i', 'in between'],
  sevk: ['ilahi', 'zikir', 'dua', 'secde', 'allah', 'hu ', 'sufi', 'semah', 'mevla', 'ya rab', 'rabbim', 'aşkın', 'hallelujah', 'praise', 'pray', 'divine', 'worship', 'holy', 'glory'],
};

const GENRES: Record<MoodId, string[]> = {
  huzun: ['sad', 'arabesk', 'emo', 'turkish folk', 'türkü', 'fado', 'blues'],
  yas: ['requiem', 'elegy'],
  ayrilik: ['breakup', 'torch song'],
  kaygi: ['trip hop', 'industrial', 'drill', 'shoegaze'],
  korku: ['dark ambient', 'horrorcore', 'witch house', 'darkwave'],
  ofke: ['metal', 'hardcore', 'punk', 'rage', 'grunge', 'trap', 'turkish hip hop', 'rap'],
  kirginlik: ['sad rap', 'emo rap'],
  kiskanclik: [],
  umutsuzluk: ['doom', 'depressive', 'sadcore'],
  yalnizlik: ['bedroom pop', 'sad lo-fi', 'slowcore'],
  yorgunluk: ['downtempo', 'sleep', 'chillout', 'chill'],
  pismanlik: ['singer-songwriter', 'acoustic', 'ballad'],
  isyan: ['punk', 'protest', 'anadolu rock', 'political hip hop', 'conscious hip hop'],
  ozlem: ['özgün', 'nostalgia', 'oldies', 'turkish classical', 'türk sanat', 'anadolu'],
  ask: ['r&b', 'soul', 'romantic', 'bolero', 'love song', 'latin pop'],
  sefkat: ['lullaby', 'children'],
  dostluk: ['country', 'folk rock', 'reggae'],
  aile: [],
  nese: ['dance', 'pop', 'disco', 'reggaeton', 'funk', 'turkish pop', 'afrobeat', 'k-pop'],
  cosku: ['edm', 'house', 'techno', 'drum and bass', 'workout', 'hardstyle', 'phonk'],
  guc: ['epic', 'trailer', 'hip hop', 'stadium'],
  sukur: ['gospel'],
  umut: ['inspirational', 'anthem', 'motivational'],
  huzur: ['ambient', 'classical', 'lo-fi', 'lofi', 'jazz', 'meditation', 'piano'],
  hayranlik: ['cinematic', 'soundtrack', 'orchestral', 'neoclassical'],
  hayal: ['dream pop', 'chillwave', 'vaporwave', 'ethereal'],
  varolus: ['post-rock', 'progressive', 'art rock', 'experimental'],
  sezgi: ['psychedelic', 'new age', 'mantra'],
  arayis: ['indie', 'indie folk', 'alternative'],
  kararsizlik: [],
  sevk: ['sufi', 'ilahi', 'nasheed', 'tasavvuf', 'qawwali', 'worship', 'spiritual'],
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
    scores.ozlem += 0.5;
    scores.varolus += 0.5;
    scores.sevk += 0.3;
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
