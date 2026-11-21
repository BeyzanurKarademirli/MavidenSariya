import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { exchangeCodeAsync, makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';

import { ayahLink, Item, MoodId, MOODS, pickItems } from './src/content';
import { detectMood, MoodResult } from './src/mood';
import {
  clearToken,
  discovery,
  fetchListening,
  loadAccessToken,
  saveToken,
  SCOPES,
  SPOTIFY_CLIENT_ID,
  Track,
} from './src/spotify';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: 'ruhhali', path: 'callback' });

type Phase = 'checking' | 'login' | 'loading' | 'ready' | 'error';

export default function App() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [result, setResult] = useState<MoodResult | null>(null);
  const [override, setOverride] = useState<MoodId | null>(null);
  const [seed, setSeed] = useState(() => new Date().getDate() + new Date().getMonth() * 31);
  const [demo, setDemo] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery,
  );

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const token = await loadAccessToken();
      if (!token) return setPhase('login');
      const list = await fetchListening(token);
      setTracks(list);
      setResult(detectMood(list));
      setOverride(null);
      setPhase('ready');
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') {
        await clearToken();
        return setPhase('login');
      }
      setError(String(e?.message ?? e));
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Spotify'dan dönen yetki kodunu token'a çevir (PKCE, istemci sırrı gerekmez)
  useEffect(() => {
    if (response?.type !== 'success' || !request?.codeVerifier) return;
    (async () => {
      try {
        setPhase('loading');
        const token = await exchangeCodeAsync(
          {
            clientId: SPOTIFY_CLIENT_ID,
            code: response.params.code,
            redirectUri,
            extraParams: { code_verifier: request.codeVerifier! },
          },
          discovery,
        );
        await saveToken(token);
        await load();
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setPhase('error');
      }
    })();
  }, [response, request, load]);

  const mood: MoodId = override ?? result?.mood ?? 'huzur';
  const items = useMemo(() => pickItems(mood, seed), [mood, seed]);

  if (phase === 'checking' || phase === 'loading') {
    return (
      <Center>
        <ActivityIndicator size="large" color="#2F5D50" />
        <Text style={styles.muted}>Dinlediklerine bakıyorum…</Text>
      </Center>
    );
  }

  if ((phase === 'login' || phase === 'error') && !demo) {
    return (
      <Center>
        <Text style={styles.logo}>🌙</Text>
        <Text style={styles.title}>Ruh Hâli</Text>
        <Text style={[styles.muted, { textAlign: 'center', marginBottom: 24 }]}>
          Spotify'da dinlediklerinden o anki hâlini tahmin eder, sana uygun bir ayet ve hadis gösterir.
        </Text>
        {phase === 'error' && <Text style={styles.error}>Bir sorun oldu: {error}</Text>}
        {!SPOTIFY_CLIENT_ID && (
          <Text style={styles.error}>EXPO_PUBLIC_SPOTIFY_CLIENT_ID tanımlı değil (README'ye bakın).</Text>
        )}
        <Pressable
          style={[styles.btn, { backgroundColor: '#1DB954' }]}
          disabled={!request || !SPOTIFY_CLIENT_ID}
          onPress={() => promptAsync()}
        >
          <Text style={styles.btnText}>Spotify ile bağlan</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => setDemo(true)}>
          <Text style={styles.link}>Spotify olmadan dene (hâlimi kendim seçeyim)</Text>
        </Pressable>
      </Center>
    );
  }

  const m = MOODS[mood];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F4EE' }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={[styles.hero, { backgroundColor: m.color }]}>
          <Text style={styles.heroEmoji}>{m.emoji}</Text>
          <Text style={styles.heroLabel}>{demo && !override ? 'Bugün nasılsın?' : m.label}</Text>
          {!demo && result && (
            <Text style={styles.heroSub}>
              {override ? 'Kendi seçtiğin hâl' : `${m.description} (tahmin güveni %${Math.round(result.confidence * 100)})`}
            </Text>
          )}
        </View>

        <Text style={styles.section}>{demo ? 'Hâlini seç' : 'Doğru tahmin etmedim mi? Düzelt:'}</Text>
        <View style={styles.chips}>
          {(Object.keys(MOODS) as MoodId[]).map((id) => (
            <Pressable
              key={id}
              onPress={() => setOverride(id)}
              style={[styles.chip, mood === id && { backgroundColor: MOODS[id].color, borderColor: MOODS[id].color }]}
            >
              <Text style={[styles.chipText, mood === id && { color: '#fff' }]}>
                {MOODS[id].emoji} {MOODS[id].label}
              </Text>
            </Pressable>
          ))}
        </View>

        {(!demo || override) &&
          items.map((it, i) => <ItemCard key={`${mood}-${seed}-${i}`} item={it} accent={m.color} />)}

        {(!demo || override) && (
          <Pressable style={[styles.btn, { backgroundColor: m.color, alignSelf: 'center' }]} onPress={() => setSeed((s) => s + 7)}>
            <Text style={styles.btnText}>Başka ayet ve hadis göster</Text>
          </Pressable>
        )}

        {!demo && (
          <>
            {result && result.evidence.length > 0 && (
              <>
                <Text style={styles.section}>Neden böyle düşündüm?</Text>
                {result.evidence.map((e, i) => (
                  <Text key={i} style={styles.evidence}>• {e}</Text>
                ))}
              </>
            )}
            <Text style={styles.section}>Son dinlediklerin</Text>
            {tracks.length === 0 && <Text style={styles.evidence}>Henüz dinleme geçmişi bulunamadı.</Text>}
            {tracks.slice(0, 8).map((t) => (
              <View key={t.id + (t.playedAt ?? 'now')} style={styles.track}>
                {t.image ? <Image source={{ uri: t.image }} style={styles.cover} /> : <View style={styles.cover} />}
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.trackName}>{t.name}</Text>
                  <Text numberOfLines={1} style={styles.muted}>{t.artists.join(', ')}</Text>
                </View>
                {!t.playedAt && <Text style={styles.nowPlaying}>Şimdi</Text>}
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              <Pressable style={styles.linkBtn} onPress={load}>
                <Text style={styles.link}>Yenile</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtn}
                onPress={async () => {
                  await clearToken();
                  setPhase('login');
                }}
              >
                <Text style={styles.link}>Çıkış yap</Text>
              </Pressable>
            </View>
          </>
        )}
        {demo && (
          <Pressable style={styles.linkBtn} onPress={() => { setDemo(false); setOverride(null); load(); }}>
            <Text style={[styles.link, { textAlign: 'center' }]}>Spotify ile bağlan</Text>
          </Pressable>
        )}

        <Text style={styles.disclaimer}>
          Mealler özet niteliğindedir. Ayetin tam metni ve farklı mealler için kartın altındaki bağlantıyı kullanabilirsin.
          Bu uygulama bir tahmin yapar; gerçek hâlini en iyi sen bilirsin.
        </Text>
      </ScrollView>
    </View>
  );
}

function ItemCard({ item, accent }: { item: Item; accent: string }) {
  const isAyah = item.kind === 'ayet';
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <Text style={[styles.cardKind, { color: accent }]}>{isAyah ? 'AYET' : 'HADİS'}</Text>
      <Text style={styles.cardText}>{isAyah ? `“${item.text}”` : `“${item.text}”`}</Text>
      {isAyah ? (
        <Pressable onPress={() => Linking.openURL(ayahLink(item))}>
          <Text style={styles.source}>
            {item.surah} Suresi, {item.ayah}. ayet  ↗
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.source}>{item.source}</Text>
      )}
    </View>
  );
}

function Center({ children }: { children: ReactNode }) {
  return (
    <View style={styles.center}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F7F4EE' },
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '700', color: '#1F2D2A', marginVertical: 8 },
  muted: { color: '#6B6B6B', fontSize: 14 },
  error: { color: '#B5483B', marginBottom: 12, textAlign: 'center' },
  btn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 28, marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { padding: 12 },
  link: { color: '#2F5D50', fontWeight: '600' },
  hero: { paddingTop: 72, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroEmoji: { fontSize: 56 },
  heroLabel: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 8 },
  heroSub: { color: '#ffffffd9', marginTop: 6, textAlign: 'center' },
  section: { fontSize: 15, fontWeight: '700', color: '#1F2D2A', marginTop: 24, marginBottom: 10, marginHorizontal: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  chip: { borderWidth: 1, borderColor: '#D5CFC4', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  chipText: { color: '#1F2D2A', fontSize: 13 },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, padding: 18, borderRadius: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardKind: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  cardText: { fontSize: 17, lineHeight: 26, color: '#1F2D2A' },
  source: { marginTop: 12, color: '#6B6B6B', fontSize: 13, fontStyle: 'italic' },
  evidence: { marginHorizontal: 20, color: '#4A4A4A', marginBottom: 4 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 10 },
  cover: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#E5E0D6' },
  trackName: { fontWeight: '600', color: '#1F2D2A' },
  nowPlaying: { color: '#1DB954', fontWeight: '700', fontSize: 12 },
  disclaimer: { marginHorizontal: 20, marginTop: 28, color: '#8A8A8A', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
