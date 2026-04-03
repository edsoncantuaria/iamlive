import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAlive, useAliveStatus } from '../context/AliveContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, gradients } from '../theme';
import type { AliveStatus } from '../lib/appState';
import { progressPercent, timeRemaining } from '../lib/appState';
import { randomCheckInGradient } from '../lib/checkInPalette';
import { randomMotivationalQuote, type MotivationalQuote } from '../data/motivationalQuotes';
import { AmbientBackground } from '../components/home/AmbientBackground';
import { AnimatedProgressTrack } from '../components/home/AnimatedProgressTrack';
import { AnimatedStatusLabel } from '../components/home/AnimatedStatusLabel';
import { CheckInFillOverlay } from '../components/home/CheckInFillOverlay';
import { HeroCheckInButton } from '../components/home/HeroCheckInButton';
import { EstouVivoLogo } from '../components/brand/EstouVivoLogo';

const { width } = Dimensions.get('window');
const BTN = width * 0.52;

type Nav = NativeStackNavigationProp<RootStackParamList>;

function statusLabel(s: AliveStatus): { text: string; color: string } {
  switch (s) {
    case 'neverChecked':
      return { text: 'Quando estiver bem, confirme aqui', color: colors.warmGray };
    case 'safe':
      return { text: 'Tudo tranquilo por enquanto', color: colors.safeGreen };
    case 'warning':
      return { text: 'Que tal um oi para si mesmo?', color: colors.warningAmber };
    case 'critical':
      return { text: 'Falta pouco para o aviso', color: colors.dangerRed };
    case 'expired':
      return { text: 'Confirme que está aí', color: colors.dangerRed };
  }
}

function btnGradient(s: AliveStatus): readonly [string, string] {
  switch (s) {
    case 'neverChecked':
    case 'safe':
      return gradients.safe;
    case 'warning':
      return gradients.warning;
    case 'critical':
      return gradients.critical;
    case 'expired':
      return gradients.expired;
  }
}

function progressFill(p: number): string {
  if (p < 0.6) return colors.safeGreen;
  if (p < 0.85) return colors.warningAmber;
  return colors.dangerRed;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { ready, config, contacts, checkIn } = useAlive();
  const st = useAliveStatus();
  const [tick, setTick] = useState(0);
  const [fillTick, setFillTick] = useState(0);
  const [overlayFillColors, setOverlayFillColors] = useState<readonly [string, string]>(() =>
    randomCheckInGradient(),
  );
  const [overlayQuote, setOverlayQuote] = useState<MotivationalQuote | null>(null);
  /** Evita novo check-in enquanto o overlay (animação + frase) está aberto. */
  const [overlayBusy, setOverlayBusy] = useState(false);

  const onFillComplete = useCallback(async () => {
    try {
      await checkIn();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setOverlayBusy(false);
    }
  }, [checkIn]);

  const handleHeroPress = useCallback(async () => {
    if (st === 'safe' || overlayBusy) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOverlayBusy(true);
    setOverlayQuote(randomMotivationalQuote());
    setOverlayFillColors(randomCheckInGradient());
    setFillTick((n) => n + 1);
  }, [st, overlayBusy]);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = useMemo(() => {
    const tr = timeRemaining(config);
    if (!tr) return null;
    const ms = tr.ms;
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }, [config, tick]);

  const label = statusLabel(st);
  const g = btnGradient(st);
  const prog = progressPercent(config);

  const isValidated = st === 'safe';
  const heroTitle = isValidated
    ? 'Check-in feito'
    : st === 'expired'
      ? 'Estou aqui'
      : 'Estou vivo';
  const heroSub = isValidated
    ? 'Tire um tempo para você: autocuidado e amor também contam.'
    : st === 'expired'
      ? 'Confirme para pausar o alerta'
      : 'Um toque, um respiro';

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: gradients.screenDawn[0] }]}>
        <EstouVivoLogo size="lg" />
        <ActivityIndicator color={colors.primaryGreen} size="large" style={styles.loadingSpinner} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
      <CheckInFillOverlay
        trigger={fillTick}
        colors={overlayFillColors}
        quote={overlayQuote}
        onFilled={onFillComplete}
      />
      <AmbientBackground status={st} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <EstouVivoLogo size="sm" />
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => navigation.navigate('Contacts')}
            style={styles.iconBtn}
            accessibilityLabel="Contatos de confiança"
          >
            <Ionicons name="people-outline" size={22} color={colors.warmGray} />
            <Text style={styles.badge}>{contacts.length}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconBtn}
            accessibilityLabel="Configurações"
          >
            <Ionicons name="settings-outline" size={22} color={colors.warmGray} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('WhatsApp')}
            style={styles.iconBtn}
            accessibilityLabel="WhatsApp para alertas"
          >
            <Ionicons name="chatbubbles-outline" size={22} color={colors.warmGray} />
          </Pressable>
        </View>
      </View>

      <View style={styles.centerCol}>
        <AnimatedStatusLabel text={label.text} color={label.color} statusKey={st} />

        <HeroCheckInButton
          size={BTN}
          gradient={g}
          centerVariant={0}
          title={heroTitle}
          subtitle={heroSub}
          paperActive
          mode={isValidated ? 'validated' : 'action'}
          onPress={handleHeroPress}
        />

        {config.lastCheckIn && remaining && (
          <View style={styles.countBlock}>
            <Text style={styles.countLabel}>Próximo limite</Text>
            <Text style={styles.countTxt}>
              {String(remaining.days).padStart(2, '0')}d {String(remaining.hours).padStart(2, '0')}h{' '}
              {String(remaining.minutes).padStart(2, '0')}m {String(remaining.seconds).padStart(2, '0')}s
            </Text>
            <View style={styles.progressWrap}>
              <AnimatedProgressTrack progress={prog} fillColor={progressFill(prog)} />
            </View>
          </View>
        )}
      </View>

      {contacts.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintTxt}>
            Cadastre contatos de confiança e mantenha o WhatsApp para alertas conectado para o aviso
            automático.
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingSpinner: { marginTop: 24 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  headerRight: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  iconBtn: {
    padding: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkTeal,
    minWidth: 16,
    textAlign: 'center',
  },
  centerCol: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, zIndex: 2 },
  countBlock: { marginTop: 28, width: '100%', maxWidth: 320, alignItems: 'center' },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8298',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  countTxt: { fontSize: 17, color: colors.fabulousDeep, fontVariant: ['tabular-nums'], fontWeight: '600' },
  progressWrap: { marginTop: 16, width: '100%' },
  hint: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 162, 97, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 162, 97, 0.35)',
    zIndex: 2,
  },
  hintTxt: { color: colors.warningAmber, fontSize: 14, lineHeight: 20 },
});
