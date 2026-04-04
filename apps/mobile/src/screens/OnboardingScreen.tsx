import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as storage from '../lib/storage';
import type { AppStackParamList } from '../navigation/types';
import { colors, gradients } from '../theme';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<AppStackParamList>;

const STEPS = [
  {
    key: 'checkin',
    icon: 'hand-left-outline' as const,
    title: 'O que é o check-in?',
    body:
      'De tempo em tempo o app pede que confirme que está bem — um toque na tela basta. ' +
      'Isso reinicia o prazo que você escolheu. Se o prazo passar sem confirmação, ' +
      'podemos avisar as pessoas de confiança que você cadastrar.',
  },
  {
    key: 'contacts',
    icon: 'people-outline' as const,
    title: 'Contatos de confiança',
    body:
      'Escolha até duas pessoas que devem ser avisadas se algo correr mal. ' +
      'Os números ficam só no seu aparelho e no servidor para enviar a mensagem de emergência quando for preciso. ' +
      'Pode adicioná-los na tela Contatos quando quiser.',
  },
  {
    key: 'whatsapp',
    icon: 'logo-whatsapp' as const,
    title: 'WhatsApp ligado',
    body:
      'Para enviar alertas automáticos, uma conta WhatsApp precisa ficar pareada com o Estou Vivo no servidor. ' +
      'É rápido: abra a secção WhatsApp para alertas e siga o código ou o QR. ' +
      'Sem isso, o check-in continua a funcionar, mas os avisos por WhatsApp não saem.',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const finish = useCallback(async () => {
    await storage.saveOnboardingCompleted();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  }, [navigation]);

  const openWhatsApp = useCallback(() => {
    navigation.navigate('WhatsApp');
  }, [navigation]);

  return (
    <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.brand}>Estou Vivo</Text>
        <Text style={styles.stepCount}>
          Passo {index + 1} de {STEPS.length}
        </Text>
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={step.icon} size={44} color={colors.darkTeal} />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
        </View>

        {isLast ? (
          <Pressable
            style={styles.secondaryBtn}
            onPress={openWhatsApp}
            accessibilityRole="button"
            accessibilityLabel="Abrir configuração do WhatsApp para alertas"
          >
            <Ionicons name="logo-whatsapp" size={22} color={colors.darkTeal} />
            <Text style={styles.secondaryTxt}>Abrir WhatsApp para alertas</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.darkTeal} />
          </Pressable>
        ) : null}

        <View style={styles.row}>
          {index > 0 ? (
            <Pressable
              style={styles.ghost}
              onPress={() => setIndex((i) => i - 1)}
              accessibilityRole="button"
              accessibilityLabel="Passo anterior"
            >
              <Text style={styles.ghostTxt}>Anterior</Text>
            </Pressable>
          ) : (
            <View style={styles.ghost} />
          )}
          {isLast ? (
            <Pressable style={styles.primaryWrap} onPress={() => void finish()} accessibilityLabel="Concluir introdução">
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                <Text style={styles.primaryTxt}>Começar a usar</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={styles.primaryWrap}
              onPress={() => setIndex((i) => i + 1)}
              accessibilityLabel="Próximo passo"
            >
              <LinearGradient colors={[...gradients.safe]} style={styles.primaryGrad}>
                <Text style={styles.primaryTxt}>Seguinte</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {!isLast ? (
          <Pressable
            onPress={() => void finish()}
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel="Saltar introdução"
          >
            <Text style={styles.skipTxt}>Saltar introdução</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: 24, marginBottom: 8 },
  brand: { fontSize: 22, fontWeight: '800', color: colors.fabulousDeep, letterSpacing: -0.3 },
  stepCount: { fontSize: 14, color: colors.warmGray, marginTop: 6 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(44,122,123,0.2)' },
  dotOn: { backgroundColor: colors.darkTeal, width: 22 },
  scroll: { paddingHorizontal: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.fabulousDeep,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: { fontSize: 16, lineHeight: 25, color: colors.warmGray, textAlign: 'center' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(44, 122, 123, 0.25)',
    marginBottom: 20,
  },
  secondaryTxt: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.darkTeal },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  ghost: { minWidth: 88, paddingVertical: 12 },
  ghostTxt: { fontSize: 16, fontWeight: '600', color: colors.darkTeal },
  primaryWrap: { flex: 1, maxWidth: width - 48 - 88, borderRadius: 14, overflow: 'hidden' },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  skip: { alignSelf: 'center', marginTop: 18, paddingVertical: 10 },
  skipTxt: { fontSize: 15, color: '#8a8298', fontWeight: '600' },
});
