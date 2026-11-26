import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DAWN } from './theme';
import { FadeIn, Float, Glow, MoodBackground, Particles, PressableScale } from './ui';

// İlk açılışta gösterilen kısa tanıtım (3 sayfa)
const PAGES = [
  {
    emoji: null,
    title: 'Ruh Hâli’ne hoş geldin',
    text: 'Dinlediğin şarkılardan o anki hâlini sezer, kalbine iyi gelecek bir ayet ve hadis getirir.',
  },
  {
    emoji: '🎧  ›  🌧️  ›  📖',
    title: 'Nasıl çalışır?',
    text:
      'Hangi uygulamadan dinlersen dinle çalan şarkıya bakarım; şarkı sözlerini ve istersen yapay zekâyı kullanarak hâlini tahmin ederim. ' +
      'Yanılırsam düzeltirsin, ben de seni tanıdıkça daha iyi tahmin ederim.',
  },
  {
    emoji: '🔒',
    title: 'Gizliliğin önemli',
    text:
      'Dinleme geçmişin ve öğrendiklerim yalnızca telefonunda kalır. Mesajlarını ve diğer bildirimlerini okumam. ' +
      'Ayet mealleri Diyanet İşleri Başkanlığı mealinden birebir alınır.',
  },
];

export function Welcome({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const p = PAGES[i];
  const last = i === PAGES.length - 1;
  return (
    <View style={[s.fill, s.center, { padding: 28 }]}>
      <StatusBar style="light" />
      <MoodBackground colors={DAWN} />
      <Particles p={{ glyph: '✦', motion: 'twinkle', speed: 0.7, count: 18 }} color="#FFF6E0" />
      <FadeIn key={i} style={{ alignItems: 'center' }}>
        {p.emoji ? (
          <Text style={s.emoji}>{p.emoji}</Text>
        ) : (
          <View style={s.center}>
            <Glow color="#F9D976" size={190} />
            <Float distance={6}>
              <Image source={require('../assets/icon.png')} style={s.icon} />
            </Float>
          </View>
        )}
        <Text style={s.title}>{p.title}</Text>
        <Text style={s.text}>{p.text}</Text>
      </FadeIn>
      <View style={s.dots}>
        {PAGES.map((_, k) => (
          <View key={k} style={[s.dot, k === i && s.dotOn]} />
        ))}
      </View>
      <PressableScale style={s.btn} onPress={() => (last ? onDone() : setI(i + 1))}>
        <Text style={s.btnText}>{last ? 'Başlayalım' : 'İleri'}</Text>
      </PressableScale>
      {!last && (
        <Text style={s.skip} onPress={onDone}>
          Geç
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  icon: { width: 120, height: 120, borderRadius: 32 },
  emoji: { fontSize: 34, marginBottom: 6, textAlign: 'center' },
  title: { color: '#FFF6E0', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 26 },
  text: { color: 'rgba(255,246,224,0.86)', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 34 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,246,224,0.35)' },
  dotOn: { width: 22, backgroundColor: '#FFF6E0' },
  btn: { marginTop: 26, backgroundColor: '#F0A548', paddingVertical: 15, paddingHorizontal: 28, borderRadius: 30, minWidth: 220, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skip: { color: 'rgba(255,246,224,0.7)', marginTop: 16, fontSize: 14, padding: 6 },
});
