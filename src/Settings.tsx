import { ReactNode } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { AI_URL, AiInfo } from './ai';
import { Theme } from './theme';
import { Source } from './source';

type Props = {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  source: Source | null;
  aiEnabled: boolean;
  aiInfo: AiInfo | null;
  learnedCount: number;
  historyCount: number;
  onToggleAi: (on: boolean) => void;
  onChangeSource: () => void;
  onClearHistory: () => void;
  onResetLearning: () => void;
  onClearAiCache: () => void;
};

const SOURCE_LABEL: Record<Source, string> = {
  device: 'Telefonumda çalanlar (YouTube Music, Spotify, MP3 çalar…)',
  spotify: 'Spotify hesabı',
};

function confirm(title: string, message: string, action: string, onOk: () => void) {
  Alert.alert(title, message, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onOk },
  ]);
}

export function Settings(p: Props) {
  const t = p.theme;
  const version = Constants.expoConfig?.version ?? '';
  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <View style={[s.section, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
      <Text style={[s.sectionTitle, { color: t.accent }]}>{title.toLocaleUpperCase('tr-TR')}</Text>
      {children}
    </View>
  );
  const Row = ({ label, sub, onPress, danger, right }: { label: string; sub?: string; onPress?: () => void; danger?: boolean; right?: ReactNode }) => (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, { color: danger ? '#FF9B8A' : t.text }]}>{label}</Text>
        {sub ? <Text style={[s.rowSub, { color: t.faint }]}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <Text style={{ color: t.faint, fontSize: 18 }}>›</Text> : null)}
    </Pressable>
  );

  const ai = p.aiInfo;
  const aiSub = !AI_URL
    ? 'Bu sürümde yapay zekâ sunucusu ayarlı değil; tahmin telefondaki yöntemle yapılıyor.'
    : !p.aiEnabled
      ? 'Kapalı: tahmin yalnızca şarkı sözü kelimeleri ve senin eğitiminle yapılıyor.'
      : `Şarkı adı, sanatçı ve sözler yorumlanmak üzere sunucuya gönderilir. Bugün ${ai?.used ?? 0} / ${ai?.limit ?? 40} yeni şarkı.`;

  return (
    <Modal visible={p.visible} animationType="slide" transparent onRequestClose={p.onClose}>
      <View style={s.backdrop}>
        <View style={[s.sheet, { backgroundColor: t.base }]}>
          <View style={s.header}>
            <Text style={[s.title, { color: t.text }]}>Ayarlar</Text>
            <Pressable onPress={p.onClose} hitSlop={12}>
              <Text style={{ color: t.accent, fontSize: 16, fontWeight: '700' }}>Bitti</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Section title="Dinlemeler">
              <Row label="Kaynak" sub={p.source ? SOURCE_LABEL[p.source] : 'Bağlı değil: hâlini kendin seçiyorsun'} onPress={p.onChangeSource} />
              {p.source === 'device' && (
                <Row
                  label="Dinleme geçmişimi sil"
                  sub={`${p.historyCount} şarkı telefonda kayıtlı`}
                  danger
                  onPress={() => confirm('Dinleme geçmişini sil', 'Telefonda tutulan dinleme geçmişin silinecek.', 'Sil', p.onClearHistory)}
                />
              )}
            </Section>

            <Section title="Yapay zekâ tahmini">
              <Row
                label="Yapay zekâ ile yorumla"
                sub={aiSub}
                right={<Switch value={p.aiEnabled && !!AI_URL} disabled={!AI_URL} onValueChange={p.onToggleAi} />}
              />
              {!!AI_URL && (
                <Row
                  label="Yapay zekâ önbelleğini temizle"
                  sub="Telefonda saklanan şarkı yorumlarını siler (günlük hakkını etkilemez)."
                  onPress={() => confirm('Önbelleği temizle', 'Şarkı yorumları silinecek; gerektiğinde yeniden sorulur.', 'Temizle', p.onClearAiCache)}
                />
              )}
            </Section>

            <Section title="Kişisel öğrenme">
              <Row
                label="Öğrendiklerimi sıfırla"
                sub={p.learnedCount ? `${p.learnedCount} geri bildirimden öğrendim.` : 'Henüz geri bildirim vermedin. 👍 / 👎 ile beni eğitebilirsin.'}
                danger={!!p.learnedCount}
                onPress={p.learnedCount ? () => confirm('Öğrendiklerimi sıfırla', 'Geri bildirimlerinden öğrendiklerim silinecek.', 'Sıfırla', p.onResetLearning) : undefined}
              />
            </Section>

            <Section title="Hakkında">
              {!!AI_URL && <Row label="Gizlilik politikası" onPress={() => Linking.openURL(`${AI_URL}/privacy`)} />}
              <Row
                label="Kaynaklar"
                sub="Ayet mealleri: Diyanet İşleri Başkanlığı meali (veri: tanzil.net). Hadisler: kaynaklarıyla özet. Şarkı sözleri: LRCLIB. Yapay zekâ: Google Gemini, Cloudflare Workers AI."
              />
              <Row label="Mâverâ" sub={`mavi ışıktan sarı ışığa · Sürüm ${version} · © 2026 Beyzanur Karademirli. Tüm hakları saklıdır.`} />
            </Section>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingTop: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  title: { fontSize: 24, fontWeight: '800' },
  section: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6, marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginTop: 10, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowLabel: { fontSize: 15.5, fontWeight: '600' },
  rowSub: { fontSize: 12.5, lineHeight: 17, marginTop: 3 },
});
