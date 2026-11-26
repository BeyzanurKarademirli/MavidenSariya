// Ruh Hâli yapay zekâ aracı sunucusu (Cloudflare Worker)
//
// Uygulama → bu sunucu → 1) Gemini API (ücretsiz katman) → 2) Cloudflare Workers AI (ücretsiz günlük kota)
// API anahtarı yalnızca burada (Worker secret) durur; uygulamanın içinde yoktur.
// Her şarkının sonucu KV'de saklanır: aynı şarkı (kim dinlerse dinlesin) bir kez incelenir.
// Sunucuya kullanıcıya ait hiçbir kimlik bilgisi gelmez; yalnızca şarkı adı, sanatçı ve şarkı sözü gelir.

import { GROUPS, MOODS, MoodId } from '../../src/content';

export interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODELS?: string; // virgülle ayrılmış, sırayla denenir
  WORKERS_AI_MODEL?: string;
  SONGS: KVNamespace;
  AI?: Ai;
}

type SongIn = { key: string; title: string; artist: string; lyrics?: string };
type MoodScore = { id: MoodId; score: number };
type SongOut = { moods: MoodScore[]; reason?: string; provider: string };

const MAX_SONGS = 12;
const LYRICS_CHARS = 1400;
const CACHE_TTL = 60 * 60 * 24 * 60; // 60 gün
const CACHE_VERSION = 'v1';
const MOOD_IDS = Object.keys(MOODS) as MoodId[];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

async function sha(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// ───────── İstem (prompt) ─────────
const moodGuide = GROUPS.map(
  (g) =>
    `${g.label}:\n` +
    MOOD_IDS.filter((id) => MOODS[id].group === g.id)
      .map((id) => `  - ${id}: ${MOODS[id].label} — ${MOODS[id].description}`)
      .join('\n'),
).join('\n');

const SYSTEM = `Sen şarkıların duygusal tonunu inceleyen bir yardımcısın. Bir müslüman genç, dinlediği şarkılara göre
o anki ruh hâline uygun ayet ve hadis okumak istiyor. Her şarkının ADINI, SANATÇISINI ve varsa SÖZLERİNİ oku;
şarkının dinleyene hissettirdiği baskın duyguları aşağıdaki listeden seç. Mecazı, ironiyi ve bağlamı dikkate al
(ör. neşeli ezgide hüzünlü sözler, ayrılıktan sonra gelen özlem, isyan içeren ama aslında kırgınlık anlatan sözler).

Hâl listesi (yalnızca bu kimlikleri kullan):
${moodGuide}

Kurallar:
- Her şarkı için 1–3 hâl seç; her birine 0 ile 1 arasında "score" ver (en baskın olan en yüksek).
- "reason": Türkçe, en fazla 12 kelime, şarkının neden bu hâli verdiğini anlat. Şarkı sözünden uzun alıntı yapma.
- Sözü olmayan ve adından duygu çıkmayan şarkılarda "moods" boş liste olsun.
- Yalnızca istenen JSON'u döndür.

Çıktı biçimi:
{"songs":[{"key":"<verilen key>","moods":[{"id":"huzun","score":0.8}],"reason":"..."}]}`;

function userPrompt(songs: SongIn[]) {
  return (
    'Şarkılar:\n' +
    songs
      .map(
        (s, i) =>
          `### ${i + 1}\nkey: ${s.key}\nad: ${s.title}\nsanatçı: ${s.artist}\nsözler: ${
            s.lyrics ? s.lyrics.slice(0, LYRICS_CHARS).replace(/\n{2,}/g, '\n') : '(bulunamadı)'
          }`,
      )
      .join('\n\n')
  );
}

/** Model çıktısından JSON'u güvenle ayıkla ve doğrula. */
function parseSongs(text: string, keys: string[]): Record<string, { moods: MoodScore[]; reason?: string }> {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('JSON yok');
  const data = JSON.parse(text.slice(start, end + 1));
  const out: Record<string, { moods: MoodScore[]; reason?: string }> = {};
  for (const s of Array.isArray(data?.songs) ? data.songs : []) {
    const key = String(s?.key ?? '');
    if (!keys.includes(key)) continue;
    const moods: MoodScore[] = (Array.isArray(s.moods) ? s.moods : [])
      .filter((m: any) => MOOD_IDS.includes(m?.id))
      .map((m: any) => ({ id: m.id as MoodId, score: Math.max(0, Math.min(1, Number(m.score) || 0.5)) }))
      .sort((a: MoodScore, b: MoodScore) => b.score - a.score)
      .slice(0, 3);
    const reason = typeof s.reason === 'string' ? s.reason.slice(0, 140) : undefined;
    out[key] = { moods, reason };
  }
  return out;
}

// ───────── Sağlayıcılar ─────────
async function askGemini(env: Env, songs: SongIn[]) {
  if (!env.GEMINI_API_KEY) throw new Error('Gemini anahtarı yok');
  const models = (env.GEMINI_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  let lastErr = '';
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: SYSTEM + '\n\n' + userPrompt(songs) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) {
      lastErr = `${model}: ${res.status}`;
      // 404 = model yok, 429 = kota doldu, 5xx = geçici: bir sonrakini dene
      continue;
    }
    const data: any = await res.json();
    const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p?.text ?? '').join('');
    try {
      return { results: parseSongs(text, songs.map((s) => s.key)), provider: `gemini:${model}` };
    } catch (e) {
      lastErr = `${model}: geçersiz çıktı`;
    }
  }
  throw new Error(lastErr || 'Gemini yanıt vermedi');
}

async function askWorkersAI(env: Env, songs: SongIn[]) {
  if (!env.AI) throw new Error('Workers AI bağlı değil');
  const model = env.WORKERS_AI_MODEL || '@cf/google/gemma-3-12b-it';
  const out: any = await env.AI.run(model as any, {
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userPrompt(songs) },
    ],
    max_tokens: 2048,
    temperature: 0.3,
  } as any);
  const text = typeof out?.response === 'string' ? out.response : JSON.stringify(out?.response ?? '');
  return { results: parseSongs(text, songs.map((s) => s.key)), provider: `workers-ai:${model}` };
}

// ───────── Uç noktalar ─────────
async function analyze(req: Request, env: Env) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }
  const songs: SongIn[] = (Array.isArray(body?.songs) ? body.songs : [])
    .slice(0, MAX_SONGS)
    .filter((s: any) => typeof s?.key === 'string' && typeof s?.title === 'string')
    .map((s: any) => ({
      key: s.key.slice(0, 200),
      title: s.title.slice(0, 200),
      artist: String(s.artist ?? '').slice(0, 200),
      lyrics: typeof s.lyrics === 'string' ? s.lyrics.slice(0, LYRICS_CHARS) : undefined,
    }));
  if (!songs.length) return json({ results: {} });

  const results: Record<string, SongOut | { status: 'unavailable' }> = {};
  const misses: SongIn[] = [];
  // 1) Daha önce incelenmiş şarkılar (herkes için ortak önbellek)
  await Promise.all(
    songs.map(async (s) => {
      const hit = await env.SONGS.get<SongOut>(`${CACHE_VERSION}:${await sha(s.key)}`, 'json');
      if (hit) results[s.key] = hit;
      else misses.push(s);
    }),
  );

  // 2) Yeniler: önce Gemini, olmazsa Workers AI
  let provider = 'cache';
  if (misses.length) {
    let answer: { results: Record<string, { moods: MoodScore[]; reason?: string }>; provider: string } | null = null;
    const errors: string[] = [];
    for (const ask of [askGemini, askWorkersAI]) {
      try {
        answer = await ask(env, misses);
        break;
      } catch (e: any) {
        errors.push(String(e?.message ?? e));
      }
    }
    if (answer) {
      provider = answer.provider;
      await Promise.all(
        misses.map(async (s) => {
          const r = answer!.results[s.key];
          if (!r) return (results[s.key] = { status: 'unavailable' });
          const out: SongOut = { moods: r.moods, reason: r.reason, provider: answer!.provider };
          results[s.key] = out;
          await env.SONGS.put(`${CACHE_VERSION}:${await sha(s.key)}`, JSON.stringify(out), { expirationTtl: CACHE_TTL });
        }),
      );
    } else {
      provider = 'none';
      misses.forEach((s) => (results[s.key] = { status: 'unavailable' }));
      console.log('Tüm sağlayıcılar başarısız:', errors.join(' | '));
    }
  }
  return json({ results, provider });
}

const PRIVACY_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ruh Hâli · Gizlilik Politikası</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:24px 16px;line-height:1.6;color:#1f2937;background:#fff}
h1{font-size:1.6rem}h2{font-size:1.15rem;margin-top:1.6em}@media (prefers-color-scheme:dark){body{background:#0d1117;color:#e5e7eb}}</style></head><body>
<h1>Ruh Hâli · Gizlilik Politikası</h1>
<p>Son güncelleme: 26 Kasım 2026</p>
<p>Ruh Hâli, dinlediğin şarkılardan o anki ruh hâlini tahmin edip sana uygun ayet ve hadis gösteren bir uygulamadır. Gizliliğine önem veririz; bu sayfa hangi bilgilerin nasıl kullanıldığını açıklar.</p>
<h2>Telefonda kalan bilgiler</h2>
<ul>
<li><b>Dinleme geçmişi:</b> “Telefonumda çalanlar” seçildiğinde, Android'in <i>bildirim erişimi</i> izniyle yalnızca müzik uygulamalarının çalan şarkı bilgisi (şarkı adı, sanatçı, albüm, süre, çalan uygulama) okunur ve son 60 şarkı yalnızca telefonunda saklanır. Mesajların ve diğer bildirimlerin içeriği okunmaz, saklanmaz.</li>
<li><b>Kişisel öğrenme:</b> Tahminleri onaylaman ya da düzeltmen yalnızca telefonunda saklanır.</li>
<li><b>Ayet/hadis sırası ve ayarlar:</b> Yalnızca telefonunda saklanır.</li>
</ul>
<h2>Telefondan çıkan bilgiler</h2>
<ul>
<li><b>Şarkı sözü servisi (LRCLIB, lrclib.net):</b> Şarkı sözlerini bulmak için şarkı adı, sanatçı, albüm ve süre gönderilir.</li>
<li><b>Yapay zekâ tahmini (isteğe bağlı, ayarlardan kapatılabilir):</b> Şarkı adı, sanatçı ve şarkı sözü Ruh Hâli sunucusuna (Cloudflare) gönderilir; sunucu bunları ruh hâli tahmini için Google Gemini API'ye ya da Cloudflare Workers AI'ya iletir. Google'ın ücretsiz katmanında gönderilen içerik Google tarafından ürünlerini geliştirmek için kullanılabilir. Bu isteklerde senin adın, hesabın, cihaz kimliğin ya da dinleme geçmişinin tamamı gönderilmez. Şarkı başına üretilen tahmin, aynı şarkı tekrar sorulduğunda kullanılmak üzere sunucuda en fazla 60 gün saklanır.</li>
<li><b>Spotify (isteğe bağlı):</b> Spotify hesabıyla bağlanırsan, son dinlediğin ve şu an çalan şarkılar Spotify'dan okunur. Spotify giriş anahtarı yalnızca telefonunda saklanır.</li>
</ul>
<h2>Satış ve reklam</h2>
<p>Bilgilerin satılmaz, reklam amacıyla kullanılmaz, üçüncü kişilerle paylaşılmaz (yukarıda sayılan hizmet sağlayıcıları dışında).</p>
<h2>Silme</h2>
<p>Uygulamadaki Ayarlar bölümünden dinleme geçmişini ve öğrendiklerini silebilirsin; uygulamayı kaldırmak telefondaki tüm verileri siler. İzinleri Android Ayarlar'ından istediğin zaman geri alabilirsin.</p>
<h2>Kaynaklar</h2>
<p>Ayet mealleri Diyanet İşleri Başkanlığı mealindendir (veri kaynağı: tanzil.net). Şarkı sözleri LRCLIB'den alınır ve uygulamada gösterilmez, yalnızca tahmin için kullanılır.</p>
<h2>İletişim</h2>
<p>Sorularını uygulamanın Google Play sayfasındaki geliştirici e-posta adresine iletebilirsin.</p>
</body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'POST' && url.pathname === '/analyze') return analyze(req, env);
    if (url.pathname === '/privacy') return new Response(PRIVACY_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, gemini: !!env.GEMINI_API_KEY, workersAI: !!env.AI });
    }
    return json({ error: 'Bulunamadı' }, 404);
  },
} satisfies ExportedHandler<Env>;
