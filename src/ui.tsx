import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, PressableProps, StyleProp, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ParticleStyle } from './theme';

/** Aşağıdan yukarı hafifçe kayarak beliren kutu. delay ile sıralı (kademeli) gösterilir. */
export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 520, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

/** Basınca hafifçe küçülen düğme. */
export function PressableScale({ children, style, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable {...rest} onPressIn={() => to(0.95)} onPressOut={() => to(1)}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Yukarı-aşağı yavaşça süzülen içerik (ör. hâl emojisi). */
export function Float({ children, distance = 6, duration = 2600 }: { children: ReactNode; distance?: number; duration?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return (
    <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-distance, distance] }) }] }}>
      {children}
    </Animated.View>
  );
}

/** Nefes alır gibi büyüyüp küçülen yumuşak ışık halkası. */
export function Glow({ color, size = 150 }: { color: string; size?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) }],
      }}
    />
  );
}

/** Hâl değişince eski degradeden yenisine yumuşak geçiş yapan tam ekran arka plan. */
export function MoodBackground({ colors }: { colors: readonly [string, string, ...string[]] }) {
  const [layers, setLayers] = useState({ prev: colors, cur: colors });
  const fade = useRef(new Animated.Value(1)).current;
  const key = colors.join();
  useEffect(() => {
    setLayers((l) => (l.cur.join() === key ? l : { prev: l.cur, cur: colors }));
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <>
      <LinearGradient colors={layers.prev} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient colors={layers.cur} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </>
  );
}

/** Tek bir parçacık: rastgele konumda, döngüyle yukarı/aşağı süzülür ya da yerinde parıldar. */
function Particle({ p, w, h, seed, color }: { p: ParticleStyle; w: number; h: number; seed: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  const r = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  const x = r(1) * w;
  const y = r(2) * h;
  const size = 10 + r(3) * 12;
  const dur = (6000 + r(4) * 6000) / p.speed;
  const delay = r(5) * dur;
  useEffect(() => {
    const anim = Animated.loop(
      p.motion === 'twinkle'
        ? Animated.sequence([
            Animated.timing(v, { toValue: 1, duration: dur / 3, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(v, { toValue: 0, duration: dur / 3, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        : Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }),
    );
    const t = setTimeout(() => anim.start(), delay);
    return () => {
      clearTimeout(t);
      anim.stop();
    };
  }, [v, dur, delay, p.motion]);

  const style =
    p.motion === 'twinkle'
      ? { left: x, top: y, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.55] }) }
      : {
          left: x,
          top: p.motion === 'up' ? h : -30,
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 0.45, 0.45, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: p.motion === 'up' ? [0, -h - 40] : [0, h + 40] }) },
            { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, (r(6) - 0.5) * 40, 0] }) },
          ],
        };
  return <Animated.Text style={[{ position: 'absolute', fontSize: size, color }, style]}>{p.glyph}</Animated.Text>;
}

/** Ruh hâline özgü hafif parçacık efekti (dokunmayı engellemez). */
export function Particles({ p, color, height }: { p: ParticleStyle; color: string; height?: number }) {
  const { width, height: winH } = useWindowDimensions();
  const h = height ?? winH;
  const seeds = useMemo(() => Array.from({ length: p.count }, (_, i) => i + 1), [p.count]);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {seeds.map((s) => (
        <Particle key={`${p.glyph}-${p.motion}-${s}`} p={p} w={width} h={h} seed={s + p.glyph.charCodeAt(0)} color={color} />
      ))}
    </Animated.View>
  );
}
