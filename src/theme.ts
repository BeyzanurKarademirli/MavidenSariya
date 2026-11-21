import { MoodId, MOODS } from './content';

// Her ruh hâlinin kendi rengi (content.ts) koyu bir temaya dönüştürülür.
// Arka plan: hâl renginin koyulaştırılmış hâlinden gece mavisi-siyaha geçen bir degrade.

const BASE = '#0D1117';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function rgbToHex([r, g, b]: number[]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
/** a ile b arasında t oranında karışım (0 = a, 1 = b) */
export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
}
export function alpha(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export type Theme = {
  base: string;
  gradient: [string, string, string];
  accent: string; // açık vurgu rengi (başlıklar, etiketler)
  accentSolid: string; // düğmeler
  card: string;
  cardBorder: string;
  text: string;
  sub: string;
  faint: string;
};

export function themeFor(mood: MoodId): Theme {
  const c = MOODS[mood].color;
  return {
    base: BASE,
    gradient: [mix(c, '#000000', 0.25), mix(c, BASE, 0.7), BASE],
    accent: mix(c, '#FFFFFF', 0.5),
    accentSolid: mix(c, '#FFFFFF', 0.08),
    card: 'rgba(255,255,255,0.065)',
    cardBorder: alpha(mix(c, '#FFFFFF', 0.4), 0.22),
    text: '#F3F1EC',
    sub: 'rgba(243,241,236,0.68)',
    faint: 'rgba(243,241,236,0.42)',
  };
}

/** Birden fazla hâl: degrade ilk hâlin renginden ikincisine, oradan gece mavisine geçer. */
export function themeForMany(moods: MoodId[]): Theme {
  const t = themeFor(moods[0]);
  const c2 = MOODS[moods[1]].color;
  return { ...t, gradient: [t.gradient[0], mix(c2, BASE, 0.55), BASE] };
}

// Giriş ekranı: uygulama simgesindeki gibi maviden sarıya şafak
export const DAWN: [string, string, string, string] = ['#0E1F4D', '#2B57A6', '#8E6FB3', '#F0A548'];

// Arka planda süzülen küçük parçacıklar: her hâlin kendi işareti ve hareketi
export type ParticleStyle = { glyph: string; motion: 'up' | 'down' | 'twinkle'; speed: number; count: number };

const P = (glyph: string, motion: ParticleStyle['motion'], speed = 1, count = 12): ParticleStyle => ({ glyph, motion, speed, count });

export const PARTICLES: Record<MoodId, ParticleStyle> = {
  huzun: P('╷', 'down', 1.4, 16), // yağmur
  yas: P('·', 'down', 0.6),
  ayrilik: P('♡', 'down', 0.7, 9),
  kaygi: P('∿', 'up', 0.9),
  korku: P('·', 'twinkle', 1.3),
  ofke: P('✦', 'up', 1.6, 14), // kıvılcım
  kirginlik: P('·', 'down', 0.7),
  kiskanclik: P('·', 'up', 0.8),
  umutsuzluk: P('·', 'down', 0.5),
  yalnizlik: P('✧', 'twinkle', 0.6, 7),
  yorgunluk: P('·', 'down', 0.45),
  pismanlik: P('❀', 'down', 0.6, 9), // dökülen yapraklar
  isyan: P('✦', 'up', 1.4),
  ozlem: P('✧', 'twinkle', 0.7, 10),
  ask: P('♥', 'up', 0.8, 10),
  sefkat: P('♡', 'up', 0.6, 10),
  dostluk: P('✿', 'up', 0.7, 10),
  aile: P('✿', 'up', 0.6, 9),
  nese: P('✺', 'up', 1.1, 12),
  cosku: P('✦', 'up', 1.8, 16),
  guc: P('✦', 'up', 1.2),
  sukur: P('✿', 'up', 0.7),
  umut: P('✧', 'up', 0.8),
  huzur: P('❋', 'up', 0.45, 9),
  hayranlik: P('✦', 'twinkle', 0.8, 16),
  hayal: P('○', 'up', 0.6, 10), // baloncuk
  varolus: P('✦', 'twinkle', 0.6, 18), // yıldızlar
  sezgi: P('✧', 'twinkle', 0.7),
  arayis: P('·', 'up', 0.6),
  kararsizlik: P('·', 'twinkle', 0.9),
  sevk: P('✧', 'up', 0.7, 14),
};
