import { requireOptionalNativeModule } from 'expo';

/** Android yerel modülü. iPhone'da, web önizlemesinde ve Expo Go'da yoktur (null). */
export type NowPlayingNative = {
  /** "Bildirim erişimi" izni verilmiş mi? */
  isPermissionGranted(): boolean;
  /** Android'in bildirim erişimi ayar ekranını açar. */
  openPermissionSettings(): void;
  /** Uygulamanın ayar (uygulama bilgisi) ekranını açar ("kısıtlanmış ayarlara izin ver" için). */
  openAppSettings(): void;
  /** Kaydedilmiş dinleme geçmişi (JSON dizi, en eski başta). Çağrılınca şu an çalan da kaydedilir. */
  getHistory(): string;
  clearHistory(): void;
};

export default requireOptionalNativeModule<NowPlayingNative>('NowPlaying');
