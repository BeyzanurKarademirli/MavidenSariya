import { MoodId, MOODS } from './content';

const MOOD_LABELS = Object.fromEntries(Object.values(MOODS).map((m) => [m.id, m.label])) as Record<MoodId, string>;
import { Track } from './spotify';

// Spotify, yeni uygulamalar için "audio-features" (valence/energy) uç noktasını kapattığından
// ruh hali; şarkı adı, sanatçı türleri ve dinleme saatinden basit bir puanlamayla tahmin edilir.
// Tahmin her zaman kullanıcıya gösterilir ve kullanıcı düzeltebilir.

// Anahtar kelimeler kelime BAŞINDAN eşleşir ("ağla" → "ağladım", "ağlama"). Çok kısa ve
// başka kelimelerin başı olabilecek sözcüklerden kaçınılmıştır (ör. "yak" → "yakın" olmasın diye yok).
// "=kelime" ile işaretli kısa sözcükler yalnızca TAM kelime olarak eşleşir
// (ör. "=dağ" → "dağ" evet, "dağılıyorum" hayır; "=acı" → "acı" evet, "acımayacak" hayır).
const KEYWORDS: Record<MoodId, string[]> = {
  // Zor anlar
  huzun: ['ağla', 'gözyaş', 'hüzün', 'keder', 'dert', '=acı', 'acılar', '=acım', 'acısı', 'acıyor', '=yara', 'yaralı', 'yaram', 'yaralar', 'yarası', 'kırık', 'mahzun', '=gam', 'gamlı', 'sad', 'cry', 'tears', 'broken', 'hurt', 'pain', 'grief', '=blue', 'sorrow'],
  yas: ['ölüm', 'öldü', 'mezar', 'rahmetli', 'toprak', 'kaybettim', 'cenaze', 'ağıt', 'funeral', 'grave', 'rest in peace', '=rip', 'mourning', 'gone too soon', 'heaven knows'],
  ayrilik: ['ayrılık', 'ayrıl', 'gitme', 'gittin', 'bitti', 'vazgeç', 'unut', 'eski sevgili', 'elveda', 'veda', 'breakup', 'break up', 'goodbye', 'let go', 'move on', 'heartbreak', 'it s over', 'we are never', 'without you'],
  kaygi: ['endişe', 'kaygı', 'stres', 'panik', 'uykusuz', 'kaos', 'tedirgin', 'düşünce', 'anxiety', 'anxious', 'panic', 'pressure', 'stress', 'nervous', 'overthink', 'insomnia', 'chaos', 'help me'],
  korku: ['korku', 'kork', 'kabus', 'tehlike', 'karanlık', 'canavar', 'fear', 'scared', 'afraid', 'nightmare', 'monster', 'horror', 'ghost', 'dark', 'terror'],
  ofke: ['öfke', 'nefret', 'intikam', 'kavga', 'sinir', 'yakarım', 'yıkarım', 'hınç', 'rage', 'angry', 'hate', 'revenge', 'kill', 'burn', 'scream', '=mad', 'enemy', '=war', 'fight'],
  kirginlik: ['kırgın', 'küs', 'incit', 'vefasız', 'ihanet', 'yalan', 'kandır', 'aldat', 'nankör', 'betray', 'liar', 'lies', 'fake', 'hurt me', 'backstab', 'trust', 'used me', 'cheat'],
  kiskanclik: ['kıskan', 'haset', 'başkası', 'rakip', 'jealous', 'envy', 'envious', 'green eyed', 'someone else'],
  umutsuzluk: ['çaresiz', 'umutsuz', 'dayanamı', 'boşver', 'çıkış yok', 'kurtar', 'batıyorum', 'hopeless', 'helpless', 'give up', 'no way out', 'drowning', 'falling apart', 'sinking', 'can t go on', 'save me'],
  yalnizlik: ['yalnız', 'tek başına', 'kimse', 'kimsesiz', 'sessiz', 'boşluk', 'ıssız', 'terk', 'gece', '=ay', 'aya', 'ayın', 'lonely', 'alone', 'nobody', 'no one', 'empty', 'solitude', 'isolation', 'by myself', 'night', 'moon'],
  yorgunluk: ['yorgun', 'yoruldum', 'bitkin', 'uyku', 'tüken', 'ağır', 'bıktım', 'yeter', 'dinlen', 'tired', 'exhausted', 'sleep', 'numb', 'heavy', 'drained', 'burnout', 'weary'],
  pismanlik: ['pişman', 'özür', 'affet', 'hata', 'keşke', 'günah', 'geri al', 'suç', 'vicdan', 'tövbe', 'sorry', 'regret', 'forgive', 'mistake', 'apolog', 'wish i', 'guilty', 'my fault', 'take it back'],
  isyan: ['isyan', 'başkaldır', 'kural', 'sistem', 'direniş', 'özgürlük', 'sokak', 'adalet', 'zulüm', 'rebel', 'riot', 'revolution', 'system', 'freedom', 'against', 'rules', 'outlaw', 'street', 'justice', 'resist'],
  // Gönül
  ozlem: ['özle', 'hasret', 'sıla', 'gurbet', 'uzak', 'hatıra', 'sensiz', '=dön', 'dönsen', 'dönmez', 'geri dön', 'dönüş', 'beni unutma', '=eski', 'eskiden', 'memleket', 'çocukluk', '=miss', 'missing', 'missed', 'far away', 'memories', 'remember', 'home', 'come back', 'nostalgia', 'used to', 'old days'],
  ask: ['aşk', 'güzel', 'sev', 'sevgili', 'kalbim', 'yarim', 'yare', 'canım', 'gönül', 'öpe', 'öpüş', 'öpücük', 'öptüm', 'gözlerin', 'birtanem', 'love', 'lover', 'kiss', 'darling', 'romance', 'baby', 'my heart', 'crush', 'valentine'],
  sefkat: ['şefkat', 'merhamet', 'bebek', 'ninni', 'kucak', 'yavrum', 'sarıl', 'koru', 'tender', 'hold me', 'hug', 'lullaby', 'gentle', '=care', 'caring', 'little one', 'angel', 'protect'],
  dostluk: ['dost', 'arkadaş', 'kardeş', 'birlikte', 'beraber', 'kanka', 'yoldaş', 'el ele', 'omuz', 'friend', 'together', 'brother', 'sister', 'buddy', 'homie', 'crew', 'count on me', 'stand by me'],
  aile: ['anne', 'annem', 'baba', 'babam', 'aile', 'evlat', 'kızım', 'oğlum', 'yuva', '=ev', 'evim', 'evimiz', 'evine', 'mother', 'mama', '=mom', 'mommy', 'father', '=dad', 'daddy', 'papa', 'family', 'daughter', 'home sweet'],
  // Canlılık
  nese: ['dans', 'oyna', 'eğlen', '=gül', 'gülüm', 'güller', 'gülüş', 'gülümse', 'güldü', 'gülmek', 'mutlu', 'neşe', 'parti', '=şen', 'şenlik', 'güneş', '=yaz', 'yazın', 'happy', '=fun', 'funny', 'smile', 'party', 'good vibes', 'joy', 'laugh', 'sunshine', 'summer', 'dance', 'groove'],
  cosku: ['enerji', 'koş', 'hız', 'hadi', 'haydi', 'ateş', 'çılgın', 'coş', 'energy', '=run', 'running', 'fast', 'jump', 'pump', 'alive', 'wild', 'turn up', 'unstoppable', 'go go', 'adrenaline'],
  guc: ['güç', 'kral', 'kraliçe', 'zafer', 'şampiyon', 'kazan', 'yenilmez', '=para', 'paralar', 'paran', 'param', 'zengin', 'power', 'king', 'queen', 'champion', 'winner', 'winning', 'victory', 'boss', 'legend', 'money', 'rich', 'hero', 'strong'],
  sukur: ['şükür', 'şükret', 'teşekkür', 'nimet', 'hamd', 'minnet', 'grateful', 'thankful', 'thank', 'blessed', 'gratitude', 'bless'],
  umut: ['umut', 'ümit', 'yarın', 'yeni', 'başla', 'şafak', 'ışık', 'kanat', 'uçmak', 'yüksel', 'hope', 'tomorrow', 'rise', 'new day', 'light', 'wings', 'fly', 'begin', 'dawn', 'brave', 'stronger', 'better days'],
  // Derinlik ve dinginlik
  huzur: ['huzur', 'sakin', 'deniz', 'rüzgar', 'yağmur', 'sabah', 'sükût', 'bahar', 'dingin', 'sessizce', 'calm', 'peace', 'quiet', 'ocean', 'rain', 'breathe', 'morning', 'slow', 'serene'],
  hayranlik: ['muhteşem', 'harika', 'mucize', 'gökyüzü', 'yıldız', '=dağ', 'dağlar', 'dağın', 'dağları', 'evren', 'beautiful', 'wonder', 'amazing', 'miracle', 'sky', 'stars', 'paradise', 'galaxy', 'universe', 'majestic'],
  hayal: ['hayal', 'rüya', '=düş', 'düşler', 'düşlerim', 'düşlerde', 'bulut', 'masal', 'dalgın', 'dream', 'daydream', 'fantasy', 'cloud', 'imagine', 'fairy', 'wish', 'wonderland', 'floating'],
  varolus: ['neden', 'niçin', 'hayat', 'zaman', 'sonsuz', 'anlam', 'var ol', 'yok ol', 'kimim', 'fani', 'dünya', 'why', 'life', 'time', 'meaning', 'exist', 'who am i', 'void', 'eternal', 'mortal', 'infinity'],
  sezgi: ['hisset', 'hisler', 'sezgi', 'iç ses', 'ruh', 'kalp', 'sırr', 'sırlar', 'ilham', 'ayna', 'bilinç', 'intuition', 'soul', 'spirit', 'inner', 'vision', 'third eye', 'mirror'],
  arayis: ['arıyor', 'arayış', 'ararım', '=yol', 'yollar', 'yolun', 'yolum', 'kayboldum', 'nereye', 'yön', 'pusula', 'search', 'seeking', 'find', 'path', 'road', 'lost', 'wander', 'journey', 'where', 'direction', 'compass'],
  kararsizlik: ['kararsız', 'bilmiyorum', 'belki', 'acaba', 'ikilem', 'arada kaldım', 'seçim', 'maybe', 'perhaps', 'decide', 'choice', 'confused', 'don t know', 'torn', 'crossroads', 'should i', 'in between'],
  sevk: ['ilahi', 'zikir', 'dua', 'secde', 'allah', '=hu', 'sufi', 'semah', 'mevla', 'ya rab', 'rabbim', 'aşkın', 'hallelujah', 'praise', 'pray', 'divine', 'worship', 'holy', 'glory'],
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

/** "=kelime" yalnızca tam kelimeyle, diğerleri kelime başından eşleşir ("ağla" → "ağladım"). */
function hit(text: string, kw: string) {
  return kw.startsWith('=') ? text.includes(' ' + kw.slice(1) + ' ') : text.includes(' ' + kw);
}
const label = (kw: string) => kw.replace(/^=/, '').trim();

const TITLE_WEIGHT = 2; // şarkı adında geçen kelime
const LYRIC_WEIGHT = 0.6; // sözlerde geçen her FARKLI kelime (nakarat tekrarı bir kez sayılır)
const LYRIC_CAP = 5; // bir şarkının sözleri bir hâle en fazla bu kadar farklı kelimeyle katkı verir

const RECENT_HOURS = 3; // yalnızca son 3 saatte dinlenenler (en az MIN_TRACKS, en çok MAX_TRACKS şarkı)
const MIN_TRACKS = 5;
const MAX_TRACKS = 12;

/** Şu an çalan + yakın zamanda dinlenen şarkıları seçer; eski dinlemeler tahmini etkilemesin. */
export function recentTracks(all: Track[], now = new Date()): Track[] {
  const limit = now.getTime() - RECENT_HOURS * 3600_000;
  const recent = all.filter((t, i) => !t.playedAt || new Date(t.playedAt).getTime() >= limit || i < MIN_TRACKS);
  return recent.slice(0, MAX_TRACKS);
}

export function detectMood(allTracks: Track[], now = new Date()): MoodResult {
  const tracks = recentTracks(allTracks, now);
  const scores = empty();
  const clues: { weight: number; text: string }[] = [];
  const moods = Object.keys(KEYWORDS) as MoodId[];

  tracks.forEach((t, i) => {
    // Son dinlenen şarkılar daha ağır basar
    const w = Math.pow(0.82, i); // en yeni şarkı 1, 5. şarkı ~0.45, 10. şarkı ~0.17
    const title = normalize(t.name);
    const lyrics = t.lyrics ? normalize(t.lyrics) : '';
    const genreText = normalize(t.genres.join(' | '));

    for (const mood of moods) {
      const titleKw = KEYWORDS[mood].find((kw) => hit(title, kw));
      if (titleKw) {
        scores[mood] += TITLE_WEIGHT * w;
        clues.push({ weight: TITLE_WEIGHT * w, text: `"${t.name}" adı → ${label(titleKw)}` });
      }
      if (lyrics) {
        const found = KEYWORDS[mood].filter((kw) => hit(lyrics, kw)).slice(0, LYRIC_CAP);
        if (found.length) {
          const add = found.length * LYRIC_WEIGHT * w;
          scores[mood] += add;
          if (found.length >= 2) {
            clues.push({ weight: add, text: `"${t.name}" sözleri → ${MOOD_LABELS[mood]}: ${found.map(label).join(', ')}` });
          }
        }
      }
      if (GENRES[mood].some((g) => genreText.includes(normalize(g).trim()))) scores[mood] += 1 * w;
    }
  });

  const evidence = clues.sort((x, y) => y.weight - x.weight).slice(0, 6).map((c) => c.text);
  const withLyrics = tracks.filter((t) => t.lyrics).length;
  if (tracks.length) evidence.push(`Son ${tracks.length} şarkına bakıldı (en yenisi en etkili); ${withLyrics} tanesinin sözleri bulundu`);

  // Gece geç saatte dinleme: yalnızlık / özlem / varoluş yönüne hafif kaydır
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
    return { mood: 'huzur', confidence: 0, scores, evidence: ['Belirgin bir ipucu bulunamadı', ...evidence] };
  }
  return { mood: topMood, confidence: Math.min(1, topScore / total), scores, evidence };
}
