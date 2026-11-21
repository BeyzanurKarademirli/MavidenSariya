import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Image, LayoutAnimation, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AmiriQuran_400Regular, useFonts } from '@expo-google-fonts/amiri-quran';
import * as WebBrowser from 'expo-web-browser';
import { exchangeCodeAsync, makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';

import { GROUPS, Item, MoodId, MOODS } from './src/content';
import { attachLyrics } from './src/lyrics';
import { nextPage, Page } from './src/rotation';
import { resolveAyah } from './src/ayat';
import { alpha, DAWN, PARTICLES, Theme, themeFor } from './src/theme';
import { FadeIn, Float, Glow, MoodBackground, Particles, PressableScale } from './src/ui';
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
  const [page, setPage] = useState<Page | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [loadingText, setLoadingText] = useState('Dinlediklerine bakıyorum…');
  const [demo, setDemo] = useState(false);
  const [chipsExpanded, setChipsExpanded] = useState(false);
  // Kur'an yazımındaki özel işaretleri (Osmanlı/Uthmani hattı) doğru göstermek için gömülü yazı tipi
  useFonts({ AmiriQuran_400Regular });

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

  // silent: ekranı "yükleniyor"a çevirmeden arka planda yenile
  const load = useCallback(async (silent = false) => {
    if (!silent) setPhase('loading');
    try {
      const token = await loadAccessToken();
      if (!token) return setPhase('login');
      setLoadingText('Dinlediklerine bakıyorum…');
      const list = await fetchListening(token);
      setLoadingText('Şarkı sözlerini okuyorum…');
      const withLyrics = await attachLyrics(list);
      setTracks(withLyrics);
      setResult(detectMood(withLyrics));
      if (!silent) setOverride(null);
      setPhase('ready');
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') {
        await clearToken();
        return setPhase('login');
      }
      if (silent) return; // arka plan yenilemesi başarısızsa mevcut ekran kalsın
      setError(String(e?.message ?? e));
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Uygulamaya geri dönünce ve açıkken her 2 dakikada bir dinlediklerini sessizce yenile
  useEffect(() => {
    if (phase !== 'ready' || demo) return;
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') load(true);
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') load(true);
    }, 120_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [phase, demo, load]);

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
  const showContent = (phase === 'ready' && !demo) || (demo && !!override);

  // Hâl değişince ya da uygulama açılınca sıradaki ayet/hadisleri getir (gösterilenler arkaya geçer)
  const showNext = useCallback(() => {
    nextPage(mood).then((p) => {
      setPage(p);
      setPageNo((n) => n + 1);
    });
  }, [mood]);
  useEffect(() => {
    if (showContent) showNext();
  }, [showContent, showNext]);

  const m = MOODS[mood];
  const theme = themeFor(mood);

  // ───────── Yükleniyor ─────────
  if (phase === 'checking' || phase === 'loading') {
    return (
      <View style={[styles.fill, styles.center]}>
        <StatusBar style="light" />
        <MoodBackground colors={DAWN} />
        <Particles p={{ glyph: '✦', motion: 'twinkle', speed: 0.8, count: 16 }} color="#FFF6E0" />
        <Glow color="#F0A548" size={170} />
        <Float distance={8}>
          <Image source={require('./assets/icon.png')} style={styles.loadingIcon} />
        </Float>
        <FadeIn delay={200}>
          <Text style={styles.loadingText}>{loadingText}</Text>
        </FadeIn>
      </View>
    );
  }

  // ───────── Giriş ─────────
  if ((phase === 'login' || phase === 'error') && !demo) {
    return (
      <View style={[styles.fill, styles.center, { padding: 28 }]}>
        <StatusBar style="light" />
        <MoodBackground colors={DAWN} />
        <Particles p={{ glyph: '✦', motion: 'twinkle', speed: 0.7, count: 18 }} color="#FFF6E0" />
        <FadeIn style={{ alignItems: 'center' }}>
          <View style={styles.center}>
            <Glow color="#F9D976" size={190} />
            <Float distance={6}>
              <Image source={require('./assets/icon.png')} style={styles.loginIcon} />
            </Float>
          </View>
          <Text style={styles.loginTitle}>Ruh Hâli</Text>
          <Text style={styles.loginSub}>
            Dinlediğin şarkılardan o anki hâlini sezer,{'\n'}kalbine iyi gelecek bir ayet ve hadis getirir.
          </Text>
        </FadeIn>
        <FadeIn delay={250} style={{ alignItems: 'center', width: '100%' }}>
          {phase === 'error' && <Text style={styles.error}>Bir sorun oldu: {error}</Text>}
          {!SPOTIFY_CLIENT_ID && <Text style={styles.error}>EXPO_PUBLIC_SPOTIFY_CLIENT_ID tanımlı değil (README'ye bakın).</Text>}
          <PressableScale
            style={[styles.btn, { backgroundColor: '#1DB954' }]}
            disabled={!request || !SPOTIFY_CLIENT_ID}
            onPress={() => promptAsync()}
          >
            <Text style={styles.btnText}>Spotify ile bağlan</Text>
          </PressableScale>
          <Pressable style={styles.linkBtn} onPress={() => setDemo(true)}>
            <Text style={[styles.link, { color: '#FFF6E0' }]}>Spotify olmadan dene, hâlimi kendim seçeyim</Text>
          </Pressable>
        </FadeIn>
      </View>
    );
  }

  // ───────── Ana ekran ─────────
  const chipsOpen = (demo && !override) || chipsExpanded;
  const toggleChips = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setChipsExpanded((x) => !x);
  };

  const chips = (
    <View style={{ marginTop: 22 }}>
      <Pressable onPress={toggleChips} disabled={demo && !override} style={styles.sectionRow}>
        <Text style={[styles.section, { color: theme.text }]}>
          {demo && !override ? 'Bugün hangi hâldesin?' : demo ? 'Başka bir hâl seç' : 'Tahminim yanlış mı? Hâlini seç'}
        </Text>
        {!(demo && !override) && <Text style={[styles.chevron, { color: theme.accent }]}>{chipsOpen ? '▴' : '▾'}</Text>}
      </Pressable>
      {chipsOpen &&
        GROUPS.map((g) => (
          <View key={g.id}>
            <Text style={[styles.groupLabel, { color: theme.faint }]}>{g.label.toLocaleUpperCase('tr-TR')}</Text>
            <View style={styles.chips}>
              {(Object.keys(MOODS) as MoodId[])
                .filter((id) => MOODS[id].group === g.id)
                .map((id) => {
                  const active = mood === id && (!demo || !!override);
                  const c = themeFor(id);
                  return (
                    <PressableScale
                      key={id}
                      onPress={() => {
                        setOverride(id);
                        if (!demo) {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setChipsExpanded(false);
                        }
                      }}
                      style={[
                        styles.chip,
                        { borderColor: active ? c.accent : 'rgba(255,255,255,0.14)', backgroundColor: active ? alpha(MOODS[id].color, 0.55) : 'rgba(255,255,255,0.05)' },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? '#fff' : theme.sub }]}>
                        {MOODS[id].emoji} {MOODS[id].label}
                      </Text>
                    </PressableScale>
                  );
                })}
            </View>
          </View>
        ))}
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.base }]}>
      <StatusBar style="light" />
      <MoodBackground colors={theme.gradient} />
      <Particles key={mood} p={PARTICLES[mood]} color={theme.accent} />
      <ScrollView contentContainerStyle={{ paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        {/* Hâl başlığı */}
        <View style={styles.hero}>
          <View style={[styles.center, { height: 130 }]}>
            <Glow color={theme.accent} size={140} />
            <Float>
              <Text style={styles.heroEmoji}>{demo && !override ? '🌙' : m.emoji}</Text>
            </Float>
          </View>
          <FadeIn key={`label-${mood}-${!!override}`}>
            <Text style={[styles.heroLabel, { color: theme.text }]}>{demo && !override ? 'Bugün nasılsın?' : m.label}</Text>
            {!demo && result && (
              <Text style={[styles.heroSub, { color: theme.sub }]}>
                {override ? 'Kendi seçtiğin hâl' : m.description}
              </Text>
            )}
            {!demo && result && !override && (
              <View style={[styles.confBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.confFill, { width: `${Math.max(8, Math.round(result.confidence * 100))}%`, backgroundColor: theme.accent }]} />
              </View>
            )}
            {!demo && result && !override && (
              <Text style={[styles.confText, { color: theme.faint }]}>tahmin güveni %{Math.round(result.confidence * 100)}</Text>
            )}
          </FadeIn>
        </View>

        {demo && !override && chips}

        {/* Ayet ve hadis kartları: her sayfada sırayla belirir */}
        {showContent &&
          page?.items.map((it, i) => (
            <FadeIn key={`${mood}-${pageNo}-${i}`} delay={120 + i * 140}>
              <ItemCard item={it} theme={theme} />
            </FadeIn>
          ))}

        {showContent && (
          <FadeIn key={`btn-${mood}-${pageNo}`} delay={500} style={{ alignItems: 'center' }}>
            <PressableScale style={[styles.btn, { backgroundColor: theme.accentSolid }]} onPress={showNext}>
              <Text style={styles.btnText}>Sıradaki ayet ve hadis  ›</Text>
            </PressableScale>
            {page && (
              <Text style={[styles.progress, { color: theme.faint }]}>
                {page.totalAyat} ayetin {page.seenAyat}.'sindesin · {page.totalHadis} hadisin {page.seenHadis}.'sindesin · hepsi bitince baştan başlar
              </Text>
            )}
          </FadeIn>
        )}

        {(!demo || override) && chips}

        {!demo && (
          <>
            {result && result.evidence.length > 0 && (
              <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.panelTitle, { color: theme.accent }]}>NEDEN BÖYLE DÜŞÜNDÜM?</Text>
                {result.evidence.map((e, i) => (
                  <Text key={i} style={[styles.evidence, { color: theme.sub }]}>• {e}</Text>
                ))}
              </View>
            )}

            <Text style={[styles.section, { color: theme.text, marginTop: 26 }]}>Son dinlediklerin</Text>
            {tracks.length === 0 && <Text style={[styles.evidence, { color: theme.sub, marginHorizontal: 20 }]}>Henüz dinleme geçmişi bulunamadı.</Text>}
            {tracks.slice(0, 8).map((t, i) => (
              <FadeIn key={t.id + (t.playedAt ?? 'now')} delay={i * 60}>
                <View style={styles.track}>
                  {t.image ? <Image source={{ uri: t.image }} style={styles.cover} /> : <View style={styles.cover} />}
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.trackName, { color: theme.text }]}>{t.name}</Text>
                    <Text numberOfLines={1} style={[styles.trackArtist, { color: theme.faint }]}>{t.artists.join(', ')}</Text>
                  </View>
                  {!t.playedAt && <NowPlaying color="#1DB954" />}
                </View>
              </FadeIn>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
              <Pressable style={styles.linkBtn} onPress={() => load()}>
                <Text style={[styles.link, { color: theme.accent }]}>↻ Yenile</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtn}
                onPress={async () => {
                  await clearToken();
                  setPhase('login');
                }}
              >
                <Text style={[styles.link, { color: theme.faint }]}>Çıkış yap</Text>
              </Pressable>
            </View>
          </>
        )}
        {demo && (
          <Pressable style={styles.linkBtn} onPress={() => { setDemo(false); setOverride(null); load(); }}>
            <Text style={[styles.link, { textAlign: 'center', color: theme.accent }]}>Spotify ile bağlan</Text>
          </Pressable>
        )}

        <Text style={[styles.disclaimer, { color: theme.faint }]}>
          Ayet mealleri Diyanet İşleri Başkanlığı mealinden birebir alınmıştır (kaynak: tanzil.net). Uzun ayetlerde ilgili kısım
          gösterilir (…); tamamı ve farklı mealler için kartın altındaki bağlantıya dokunabilirsin. Hadisler kaynağıyla birlikte
          özet olarak verilmiştir. Şarkı sözleri LRCLIB'den alınır. Bu uygulama bir tahmin yapar; gerçek hâlini en iyi sen bilirsin.
        </Text>
      </ScrollView>
    </View>
  );
}

/** "Şimdi çalıyor" göstergesi: zıplayan üç küçük çubuk. */
function NowPlaying({ color }: { color: string }) {
  const bars = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 380 + i * 90, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0, duration: 380 + i * 90, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 16, gap: 3 }}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: color, transform: [{ scaleY: b.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }] }}
        />
      ))}
    </View>
  );
}

function ItemCard({ item, theme }: { item: Item; theme: Theme }) {
  const box = [styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }];
  if (item.kind === 'ayet') {
    const r = resolveAyah(item);
    return (
      <View style={box}>
        <Text style={[styles.cardKind, { color: theme.accent }]}>✦ AYET</Text>
        {r.arabic && <Text style={[styles.arabic, { color: '#FFF6E0' }]}>{r.arabic}</Text>}
        <Text style={[styles.cardText, { color: theme.text }]}>{r.meal}</Text>
        <Pressable onPress={() => Linking.openURL(r.link)}>
          <Text style={[styles.source, { color: theme.faint }]}>{r.title} · Diyanet İşleri meali  ↗</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={box}>
      <Text style={[styles.cardKind, { color: theme.accent }]}>❖ HADİS</Text>
      <Text style={[styles.cardText, { color: theme.text }]}>“{item.text}”</Text>
      <Text style={[styles.source, { color: theme.faint }]}>{item.source}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingIcon: { width: 96, height: 96, borderRadius: 26 },
  loadingText: { color: '#FFF6E0', marginTop: 28, fontSize: 15, letterSpacing: 0.3 },
  loginIcon: { width: 120, height: 120, borderRadius: 32 },
  loginTitle: { fontSize: 38, fontWeight: '800', color: '#FFF6E0', marginTop: 28, letterSpacing: 0.5 },
  loginSub: { color: 'rgba(255,246,224,0.82)', textAlign: 'center', marginTop: 10, marginBottom: 30, fontSize: 15, lineHeight: 22 },
  error: { color: '#FFB4A8', marginBottom: 12, textAlign: 'center' },
  btn: { paddingVertical: 15, paddingHorizontal: 28, borderRadius: 30, marginTop: 14, minWidth: 240, alignItems: 'center', elevation: 3 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { padding: 12 },
  link: { fontWeight: '600', fontSize: 14 },
  hero: { paddingTop: 64, paddingBottom: 10, paddingHorizontal: 24, alignItems: 'center' },
  heroEmoji: { fontSize: 64 },
  heroLabel: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
  heroSub: { marginTop: 6, textAlign: 'center', fontSize: 15, lineHeight: 21 },
  confBar: { height: 4, borderRadius: 2, marginTop: 14, width: 160, alignSelf: 'center', overflow: 'hidden' },
  confFill: { height: 4, borderRadius: 2 },
  confText: { textAlign: 'center', fontSize: 11, marginTop: 5, letterSpacing: 0.5 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 6, marginHorizontal: 20 },
  chevron: { fontSize: 18, fontWeight: '700' },
  groupLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginHorizontal: 20, marginTop: 14, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  chip: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 13 },
  chipText: { fontSize: 13 },
  card: { marginHorizontal: 18, marginTop: 16, padding: 20, borderRadius: 22, borderWidth: 1 },
  cardKind: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  arabic: { fontFamily: 'AmiriQuran_400Regular', fontSize: 24, lineHeight: 50, textAlign: 'right', writingDirection: 'rtl', marginBottom: 14 },
  cardText: { fontSize: 17, lineHeight: 27 },
  source: { marginTop: 14, fontSize: 12.5, fontStyle: 'italic' },
  progress: { textAlign: 'center', fontSize: 11.5, marginTop: 10, marginHorizontal: 32, lineHeight: 17 },
  panel: { marginHorizontal: 18, marginTop: 26, padding: 18, borderRadius: 20, borderWidth: 1 },
  panelTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  evidence: { marginBottom: 5, fontSize: 13.5, lineHeight: 19 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 12 },
  cover: { width: 46, height: 46, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  trackName: { fontWeight: '600', fontSize: 15 },
  trackArtist: { fontSize: 13, marginTop: 2 },
  disclaimer: { marginHorizontal: 24, marginTop: 30, fontSize: 11.5, lineHeight: 17, textAlign: 'center' },
});
