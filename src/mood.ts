import { MoodId, MOODS } from './content';

const MOOD_LABELS = Object.fromEntries(Object.values(MOODS).map((m) => [m.id, m.label])) as Record<MoodId, string>;
import { Track } from './spotify';
import { artistKey, Model } from './learning';

// Spotify, yeni uygulamalar için "audio-features" (valence/energy) uç noktasını kapattığından
// ruh hali; şarkı adı, sanatçı türleri ve dinleme saatinden basit bir puanlamayla tahmin edilir.
// Tahmin her zaman kullanıcıya gösterilir ve kullanıcı düzeltebilir.

// Anahtar kelimeler kelime BAŞINDAN eşleşir ("ağla" → "ağladım", "ağlama"). Çok kısa ve
// başka kelimelerin başı olabilecek sözcüklerden kaçınılmıştır (ör. "yak" → "yakın" olmasın diye yok).
// "=kelime" ile işaretli kısa sözcükler yalnızca TAM kelime olarak eşleşir
// (ör. "=dağ" → "dağ" evet, "dağılıyorum" hayır; "=acı" → "acı" evet, "acımayacak" hayır).
const KEYWORDS: Record<MoodId, string[]> = {
  // Zor anlar
  huzun: ['ağla', 'üzgün', 'üzül', 'hıçkır', 'kahr', 'elem', 'perişan', 'sızı', 'sızla', 'yandım', 'buruk', 'soldu', 'derd', 'gözlerim doldu', 'gözyaş', 'hüzün', 'keder', 'dert', '=acı', 'acılar', '=acım', 'acısı', 'acıyor', '=yara', 'yaralı', 'yaram', 'yaralar', 'yarası', 'kırık', 'mahzun', '=gam', 'gamlı', 'sad', 'cry', 'tears', 'broken', 'hurt', 'pain', 'grief', '=blue', 'sorrow'],
  yas: ['ölüm', 'öldü', 'mezar', 'rahmetli', 'toprak', 'kaybettim', 'cenaze', 'ağıt', 'funeral', 'grave', 'rest in peace', '=rip', 'mourning', 'gone too soon', 'heaven knows'],
  ayrilik: ['ayrılık', '=ayrı', 'gidersen', 'giderken', 'gidişin', 'son kez', 'hoşça kal', 'bıraktın', 'beni bırak', 'unuttun', 'ayrıl', 'gitme', 'gittin', 'bitti', 'vazgeç', 'unut', 'eski sevgili', 'elveda', 'veda', 'breakup', 'break up', 'goodbye', 'let go', 'move on', 'heartbreak', 'it s over', 'we are never', 'without you'],
  kaygi: ['endişe', 'telaş', 'huzursuz', 'nefes alamı', 'boğuluyorum', 'sıkıştım', 'daraldım', 'bunaldım', 'kaygı', 'stres', 'panik', 'uykusuz', 'kaos', 'tedirgin', 'düşünce', 'anxiety', 'anxious', 'panic', 'pressure', 'stress', 'nervous', 'overthink', 'insomnia', 'chaos', 'help me'],
  korku: ['korku', 'kork', 'kabus', 'tehlike', 'karanlık', 'canavar', 'fear', 'scared', 'afraid', 'nightmare', 'monster', 'horror', 'ghost', 'dark', 'terror'],
  ofke: ['öfke', 'kızgın', 'sinirli', 'lanet', 'kahrol', 'defol', 'beddua', 'düşman', 'nefret', 'intikam', 'kavga', 'sinir', 'yakarım', 'yıkarım', 'hınç', 'rage', 'angry', 'hate', 'revenge', 'kill', 'burn', 'scream', '=mad', 'enemy', '=war', 'fight'],
  kirginlik: ['kırgın', 'küs', 'incit', 'vefasız', 'ihanet', 'yalan', 'kandır', 'aldat', 'nankör', 'betray', 'liar', 'lies', 'fake', 'hurt me', 'backstab', 'trust', 'used me', 'cheat'],
  kiskanclik: ['kıskan', 'haset', 'başkası', 'rakip', 'jealous', 'envy', 'envious', 'green eyed', 'someone else'],
  umutsuzluk: ['çaresiz', 'çare yok', 'mahvol', 'bitik', 'dibe', 'son nefes', 'umutsuz', 'dayanamı', 'boşver', 'çıkış yok', 'kurtar', 'batıyorum', 'hopeless', 'helpless', 'give up', 'no way out', 'drowning', 'falling apart', 'sinking', 'can t go on', 'save me'],
  yalnizlik: ['yalnız', 'tek başına', 'kimse', 'kimsesiz', 'sessiz', 'boşluk', 'ıssız', 'terk', 'gece', '=ay', 'aya', 'ayın', 'lonely', 'alone', 'nobody', 'no one', 'empty', 'solitude', 'isolation', 'by myself', 'night', 'moon'],
  yorgunluk: ['yorgun', 'usandım', 'takatim', 'dermanım', 'halim yok', 'yoruldum', 'bitkin', 'uyku', 'tüken', 'ağır', 'bıktım', 'yeter', 'dinlen', 'tired', 'exhausted', 'sleep', 'numb', 'heavy', 'drained', 'burnout', 'weary'],
  pismanlik: ['pişman', 'özür', 'affet', 'hata', 'keşke', 'günah', 'geri al', 'suç', 'vicdan', 'tövbe', 'sorry', 'regret', 'forgive', 'mistake', 'apolog', 'wish i', 'guilty', 'my fault', 'take it back'],
  isyan: ['isyan', 'başkaldır', 'kural', 'sistem', 'direniş', 'özgürlük', 'sokak', 'adalet', 'zulüm', 'rebel', 'riot', 'revolution', 'system', 'freedom', 'against', 'rules', 'outlaw', 'street', 'justice', 'resist'],
  // Gönül
  ozlem: ['özle', 'hasret', 'sıla', 'gurbet', 'uzak', 'hatıra', 'sensiz', '=dön', 'dönsen', 'dönmez', 'geri dön', 'dönüş', 'beni unutma', '=eski', 'eskiden', 'memleket', 'çocukluk', '=miss', 'missing', 'missed', 'far away', 'memories', 'remember', 'home', 'come back', 'nostalgia', 'used to', 'old days'],
  ask: ['aşk', 'aşık', 'aşığım', 'sevda', 'seviyorum', 'sevdim', 'sevdiğim', 'sevgilim', 'yâr', 'cananım', 'dilber', 'gönlüm', 'gönlümü', 'kalbimi', 'sevgi', 'güzel', 'sev', 'sevgili', 'kalbim', 'yarim', 'yare', 'canım', 'gönül', 'öpe', 'öpüş', 'öpücük', 'öptüm', 'gözlerin', 'birtanem', 'love', 'lover', 'kiss', 'darling', 'romance', 'baby', 'my heart', 'crush', 'valentine'],
  sefkat: ['şefkat', 'merhamet', 'bebek', 'ninni', 'kucak', 'yavrum', 'sarıl', 'koru', 'tender', 'hold me', 'hug', 'lullaby', 'gentle', '=care', 'caring', 'little one', 'angel', 'protect'],
  dostluk: ['dost', 'arkadaş', 'kardeş', 'birlikte', 'beraber', 'kanka', 'yoldaş', 'el ele', 'omuz', 'friend', 'together', 'brother', 'sister', 'buddy', 'homie', 'crew', 'count on me', 'stand by me'],
  aile: ['anne', 'annem', 'baba', 'babam', 'aile', 'evlat', 'kızım', 'oğlum', 'yuva', '=ev', 'evim', 'evimiz', 'evine', 'mother', 'mama', '=mom', 'mommy', 'father', '=dad', 'daddy', 'papa', 'family', 'daughter', 'home sweet'],
  // Canlılık
  nese: ['dans', 'kahkaha', 'neşeli', 'eğlence', 'bayram', 'düğün', 'halay', 'zıpla', 'oyna', 'eğlen', '=gül', 'gülüm', 'güller', 'gülüş', 'gülümse', 'güldü', 'gülmek', 'mutlu', 'neşe', 'parti', '=şen', 'şenlik', 'güneş', '=yaz', 'yazın', 'happy', '=fun', 'funny', 'smile', 'party', 'good vibes', 'joy', 'laugh', 'sunshine', 'summer', 'dance', 'groove'],
  cosku: ['enerji', 'koş', 'hız', 'hadi', 'haydi', 'ateş', 'çılgın', 'coş', 'energy', '=run', 'running', 'fast', 'jump', 'pump', 'alive', 'wild', 'turn up', 'unstoppable', 'go go', 'adrenaline'],
  guc: ['güç', 'kral', 'kraliçe', 'zafer', 'şampiyon', 'kazan', 'yenilmez', '=para', 'paralar', 'paran', 'param', 'zengin', 'power', 'king', 'queen', 'champion', 'winner', 'winning', 'victory', 'boss', 'legend', 'money', 'rich', 'hero', 'strong'],
  sukur: ['şükür', 'elhamdülillah', 'hamdolsun', 'şükürler', 'çok şükür', 'şükret', 'teşekkür', 'nimet', 'hamd', 'minnet', 'grateful', 'thankful', 'thank', 'blessed', 'gratitude', 'bless'],
  umut: ['umut', 'umud', 'ümid', 'umarım', 'inşallah', 'ümit', 'yarın', 'yeni', 'başla', 'şafak', 'ışık', 'kanat', 'uçmak', 'yüksel', 'hope', 'tomorrow', 'rise', 'new day', 'light', 'wings', 'fly', 'begin', 'dawn', 'brave', 'stronger', 'better days'],
  // Derinlik ve dinginlik
  huzur: ['huzur', 'sakin', 'deniz', 'rüzgar', 'yağmur', 'sabah', 'sükût', 'bahar', 'dingin', 'sessizce', 'calm', 'peace', 'quiet', 'ocean', 'rain', 'breathe', 'morning', 'slow', 'serene'],
  hayranlik: ['muhteşem', 'harika', 'mucize', 'gökyüzü', 'yıldız', '=dağ', 'dağlar', 'dağın', 'dağları', 'evren', 'beautiful', 'wonder', 'amazing', 'miracle', 'sky', 'stars', 'paradise', 'galaxy', 'universe', 'majestic'],
  hayal: ['hayal', 'rüya', '=düş', 'düşler', 'düşlerim', 'düşlerde', 'bulut', 'masal', 'dalgın', 'dream', 'daydream', 'fantasy', 'cloud', 'imagine', 'fairy', 'wish', 'wonderland', 'floating'],
  varolus: ['neden', 'kader', 'alın yazı', 'yazgı', 'ömür', 'ömr', 'ölümlü', 'fanidir', 'sonsuzluk', 'niçin', 'hayat', 'zaman', 'sonsuz', 'anlam', 'var ol', 'yok ol', 'kimim', 'fani', 'dünya', 'why', 'life', 'time', 'meaning', 'exist', 'who am i', 'void', 'eternal', 'mortal', 'infinity'],
  sezgi: ['hisset', 'hisler', 'sezgi', 'iç ses', 'ruh', 'kalp', 'sırr', 'sırlar', 'ilham', 'ayna', 'bilinç', 'intuition', 'soul', 'spirit', 'inner', 'vision', 'third eye', 'mirror'],
  arayis: ['arıyor', 'arayış', 'ararım', '=yol', 'yollar', 'yolun', 'yolum', 'kayboldum', 'nereye', 'yön', 'pusula', 'search', 'seeking', 'find', 'path', 'road', 'lost', 'wander', 'journey', 'where', 'direction', 'compass'],
  kararsizlik: ['kararsız', 'bilmiyorum', 'belki', 'acaba', 'ikilem', 'arada kaldım', 'seçim', 'maybe', 'perhaps', 'decide', 'choice', 'confused', 'don t know', 'torn', 'crossroads', 'should i', 'in between'],
  sevk: ['ilahi', 'ya rabbi', 'ya allah', 'mevlam', 'yaradan', 'yaratan', 'rabbena', 'ezan', 'namaz', 'tesbih', 'aşk ı ilahi', 'sübhan', 'salavat', 'resul', 'muhammed', 'nebi', 'peygamber', 'mahşer', 'subhanallah', 'allahu', 'la ilahe', 'illallah', 'zikir', 'dua', 'secde', 'allah', '=hu', 'sufi', 'semah', 'mevla', 'ya rab', 'rabbim', 'aşkın', 'hallelujah', 'praise', 'pray', 'divine', 'worship', 'holy', 'glory'],
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
  mood: MoodId; // ana hâl
  moods: MoodId[]; // ana hâl + ona yakın puan alan en fazla 2 hâl daha (karışık duygular)
  confidence: number; // 0..1 (paya, ikinciden farka ve kanıt miktarına göre)
  share: number; // 0..1: dinlediklerinin ne kadarı bu hâli işaret ediyor
  strength: 'güçlü' | 'orta' | 'zayıf';
  uncertain: boolean; // zayıfsa kullanıcıya hâlini seçmesi önerilir
  analyzed: Track[]; // tahminde kullanılan şarkılar (en yeni başta)
  trackWords: Record<string, Partial<Record<MoodId, string[]>>>; // şarkı → hâl → katkı veren anahtar kelimeler (öğrenme için)
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
const WEAK_TITLE_WEIGHT = 1; // şarkı adında geçen ama çok yaygın kelime
const NOW_PLAYING_WEIGHT = 2.4; // şu an çalan şarkı en çok etkiler (şarkı değişince tahmin de değişsin)

// Şarkı sözlerinde ÇOK sık geçen, tek başına duygu söylemeyen kelimeler: sözlerde sayılmaz,
// şarkı adında geçerse yarım ağırlık alır (ör. "yol" neredeyse her Türkçe şarkıda geçer).
const WEAK = new Set([
  '=yol', 'yollar', 'yolun', 'yolum', 'yön', 'nereye', 'where', 'find', 'road', 'lost',
  'gece', 'night', '=ay', 'aya', 'ayın', 'moon', 'sev', 'güzel', 'love', 'baby', 'kalp', 'kalbim', 'canım', 'gönül', 'my heart',
  'hayat', 'life', 'zaman', 'time', 'dünya', 'neden', 'why', 'yeni', 'ağır', 'uyku', 'sleep', 'heavy',
  '=dön', 'dönsen', 'dönmez', 'geri dön', 'dönüş', 'uzak', '=eski', 'eskiden', 'home', '=ev', 'evim', 'evimiz', 'evine',
  'yarın', 'tomorrow', 'ışık', 'light', 'ruh', 'soul', 'sessiz', 'kimse', 'nobody', 'no one', 'boşluk', 'empty',
  'hadi', 'güneş', 'sabah', 'morning', 'deniz', 'rüzgar', 'yağmur', 'rain', 'dua', 'allah', 'rabbim', 'belki', 'maybe',
  'bilmiyorum', 'don t know', 'başla', 'begin', 'uçmak', 'fly', 'rise', 'hisset', 'hisler', 'kalp', 'run', '=run', 'running',
]);
const LYRIC_WEIGHT = 0.6; // sözlerde geçen her farklı kelime (tekrarı sınırlı ek puan alır)
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

const AI_WEIGHT = 5; // yapay zekânın şarkı için verdiği hâl (puan 0–1 ile çarpılır): en güçlü ipucu
const LEARN_TRACK_WEIGHT = 1.8; // kullanıcının bir şarkı için öğrettiği hâl
const LEARN_ARTIST_WEIGHT = 0.7; // kullanıcının bir sanatçı için öğrettiği hâl

export function detectMood(allTracks: Track[], now = new Date(), model?: Model): MoodResult {
  const tracks = recentTracks(allTracks, now);
  const moods = Object.keys(KEYWORDS) as MoodId[];
  const scores = empty();
  let totalVotes = 0;
  let evidenceSum = 0; // şarkıların kanıt gücü toplamı (sıradan bağımsız)
  const evidence: string[] = [];
  const trackWords: MoodResult['trackWords'] = {};
  const wf = (kw: string) => model?.words[kw] ?? 1; // öğrenilmiş kelime çarpanı

  // Her şarkı bir "oy" verir: önce şarkının kendi içinde hangi hâli ne oranda işaret ettiği bulunur
  // (uzun sözlü şarkı tek başına baskın çıkmasın diye oranlanır), sonra yakınlığına göre ağırlıklandırılır.
  tracks.forEach((t, i) => {
    const recency = t.playedAt ? Math.pow(0.75, i) : NOW_PLAYING_WEIGHT;
    const title = normalize(t.name);
    const lyrics = t.lyrics ? normalize(t.lyrics) : '';
    const genreText = normalize(t.genres.join(' | '));
    const artist = normalize(t.artists.join(' | '));

    const raw = empty();
    const words: Partial<Record<MoodId, string[]>> = {};
    const tw: Partial<Record<MoodId, string[]>> = (trackWords[t.id] = {});
    const add = (mood: MoodId, v: number, w?: string, kw?: string) => {
      raw[mood] += v;
      if (w && !(words[mood] ??= []).includes(w)) words[mood]!.push(w);
      if (kw) (tw[mood] ??= []).push(kw);
    };

    // Yapay zekâ şarkıyı okuduysa, kelime saymanın etkisi azalır (anlamı zaten o yorumladı)
    const kwScale = t.ai?.moods?.length ? 0.3 : 1;
    for (const mood of moods) {
      const titleKw = KEYWORDS[mood].find((kw) => hit(title, kw));
      if (titleKw) add(mood, (WEAK.has(titleKw) ? WEAK_TITLE_WEIGHT : TITLE_WEIGHT) * wf(titleKw) * kwScale, label(titleKw), titleKw);
      if (lyrics) {
        let distinct = 0;
        for (const kw of KEYWORDS[mood]) {
          if (WEAK.has(kw) || distinct >= LYRIC_CAP) continue;
          const c = count(lyrics, kw);
          if (!c) continue;
          distinct++;
          // Tekrar (nakarat) önemlidir ama sınırlı: 1 kez → 0.6, 2 → 0.9, 4+ → 1.2
          add(mood, LYRIC_WEIGHT * (1 + Math.log2(Math.min(c, 4)) * 0.5) * wf(kw) * kwScale, label(kw), kw);
        }
      }
      if (GENRES[mood].some((g) => genreText.includes(normalize(g).trim()))) add(mood, 0.8);
    }
    for (const [name, mood] of ARTISTS) if (artist.includes(name)) add(mood, 1.5);

    // Yapay zekâ: şarkının anlamını okuyup verdiği hâller (mecaz, ironi, bağlam)
    for (const m of t.ai?.moods ?? []) if (MOODS[m.id]) add(m.id, AI_WEIGHT * m.score, '✨ yapay zekâ');

    // Kullanıcının öğrettikleri: bu şarkı ve sanatçıları için daha önce seçtiği/onayladığı hâller
    const learnedTrack = model?.tracks[t.id]?.moods ?? {};
    for (const [mood, v] of Object.entries(learnedTrack) as [MoodId, number][]) add(mood, LEARN_TRACK_WEIGHT * Math.min(v, 3), 'sen öğrettin');
    for (const a of t.artists) {
      const learnedArtist = model?.artists[artistKey(a)] ?? {};
      for (const [mood, v] of Object.entries(learnedArtist) as [MoodId, number][]) {
        if (v >= 0.5) add(mood, LEARN_ARTIST_WEIGHT * Math.min(v, 3), `${a} · öğrendiğim`);
      }
    }

    const songTotal = Object.values(raw).reduce((a, b) => a + b, 0);
    const ranked = moods.filter((m) => raw[m] > 0).sort((a, b) => raw[b] - raw[a]);
    evidence.push(
      `"${t.name}"${t.playedAt ? '' : ' · şimdi'} → ` +
        (ranked.length
          ? ranked.slice(0, 2).map((m) => `${MOOD_LABELS[m]}${words[m]?.length ? ` (${words[m]!.slice(0, 3).join(', ')})` : ''}`).join(' · ')
          : 'belirgin bir ipucu yok') +
        (t.ai?.reason ? ` — “${t.ai.reason}”` : ''),
    );
    if (!songTotal) return;

    // Kanıtı az olan şarkının oyu da azdır (ör. tek bir kelime)
    const strength = Math.min(1, songTotal / 4); // yalnızca ad eşleşmesi (2 puan) yarım oy sayılır
    const vote = recency * strength;
    totalVotes += vote;
    evidenceSum += strength * (t.ai?.moods?.length ? 2 : 1); // yapay zekânın okuduğu şarkı daha güçlü kanıt
    for (const m of ranked) scores[m] += (vote * raw[m]) / songTotal;
  });

  const withLyrics = tracks.filter((t) => t.lyrics).length;
  if (tracks.length) evidence.push(`Son ${tracks.length} şarkına bakıldı (en yenisi en etkili); ${withLyrics} tanesinin sözleri bulundu`);

  // Gece geç saatte dinleme: yalnızlık / özlem / varoluş yönüne hafif kaydır
  const hour = now.getHours();
  if (hour >= 0 && hour < 5 && totalVotes > 0) {
    scores.yalnizlik += 0.15 * totalVotes;
    scores.ozlem += 0.1 * totalVotes;
    scores.varolus += 0.1 * totalVotes;
    evidence.push('Gece geç saatte dinliyorsun');
  }

  const entries = (Object.entries(scores) as [MoodId, number][]).sort((x, y) => y[1] - x[1]);
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  if (!sum) {
    return { mood: 'huzur', moods: ['huzur'], confidence: 0, share: 0, strength: 'zayıf', uncertain: true, scores, analyzed: tracks, trackWords, evidence: ['Belirgin bir ipucu bulunamadı', ...evidence] };
  }
  const [topMood, topScore] = entries[0];
  const second = entries[1]?.[1] ?? 0;
  // share: dinlediklerinin ne kadarı bu hâli işaret ediyor; lead: ikinci hâlden ne kadar önde
  const share = topScore / sum;
  const lead = (topScore - second) / topScore;
  const coverage = Math.min(1, evidenceSum / 3); // ~3 şarkı dolusu kanıt varsa tam
  const confidence = Math.min(1, (0.6 * share + 0.4 * lead) * (0.4 + 0.6 * coverage) * 1.15);
  const strength: MoodResult['strength'] = confidence >= 0.68 ? 'güçlü' : confidence >= 0.38 ? 'orta' : 'zayıf';
  // Karışık duygular: ana hâlin en az %60'ı kadar puan alan ve toplamın en az %15'ini oluşturan hâller
  const mixed = [topMood, ...entries.slice(1, 3).filter(([, v]) => v >= topScore * 0.6 && v / sum >= 0.15).map(([m]) => m)];
  return { mood: topMood, moods: mixed, confidence, share, strength, uncertain: strength === 'zayıf', scores, analyzed: tracks, trackWords, evidence };
}

/** Sözlerde bir anahtar kelimenin kaç kez geçtiği */
function count(text: string, kw: string) {
  const needle = kw.startsWith('=') ? ' ' + kw.slice(1) + ' ' : ' ' + kw;
  let n = 0;
  for (let i = text.indexOf(needle); i !== -1 && n < 8; i = text.indexOf(needle, i + needle.length)) n++;
  return n;
}

// Bilinen ilahi/nasheed sanatçıları (sözleri Arapça/İngilizce olsa da manevi coşku)
const ARTISTS: [string, MoodId][] = [
  ['sami yusuf', 'sevk'], ['maher zain', 'sevk'], ['harris j', 'sevk'], ['mesut kurtis', 'sevk'],
  ['raef', 'sevk'], ['humood', 'sevk'], ['mishary', 'sevk'], ['ahmed bukhatir', 'sevk'], ['omar esa', 'sevk'],
];
