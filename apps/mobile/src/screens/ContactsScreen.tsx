import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrazilPhoneField } from '../components/BrazilPhoneField';
import { useAlive } from '../context/AliveContext';
import { formatBrazilDisplay, normalizeToBrazilE164 } from '../lib/phoneBr';
import type { AppStackParamList } from '../navigation/types';
import { colors, gradients } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { contacts, addContact, removeContact } = useAlive();
  const [name, setName] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');

  const confirmRemove = (index: number, displayName: string) => {
    Alert.alert(
      'Remover contato?',
      `${displayName} deixa de receber avisos automáticos deste app. Você pode adicionar de novo quando quiser.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => void removeContact(index),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[...gradients.screenDawn]} style={styles.flex}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={14} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Voltar</Text>
          </Pressable>
          <Text style={styles.topTitle}>Contatos de confiança</Text>
          <View style={{ width: 72 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="heart-circle" size={40} color={colors.darkTeal} />
            </View>
            <Text style={styles.heroTitle}>Quem pode te acompanhar</Text>
            <Text style={styles.heroBody}>
              Escolha até duas pessoas de confiança. Ao cadastrar, enviamos um aviso por WhatsApp para
              ela saber que você a incluiu e entender o que acontece se o prazo do seu check-in passar
              sem confirmação.
            </Text>
          </View>

          <View style={styles.noticeCard}>
            <Ionicons name="logo-whatsapp" size={22} color={colors.darkTeal} style={styles.noticeIcon} />
            <Text style={styles.noticeTitle}>Como funciona</Text>
            <Text style={styles.noticeBody}>
              O texto enviado nesse primeiro contato é só para informar que a pessoa foi escolhida. Se
              o prazo expirar e você não confirmar que está bem, o app envia a{' '}
              <Text style={styles.noticeBold}>mensagem de emergência</Text> (editável em Configurações)
              para os números cadastrados.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={styles.linkRow}
              accessibilityLabel="Abrir configurações para editar a mensagem de emergência"
            >
              <Text style={styles.linkTxt}>Editar mensagem de emergência</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.darkTeal} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Seus contatos</Text>
          {contacts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTxt}>
                Ninguém cadastrado ainda. Adicione alguém em quem você confia — leva poucos segundos.
              </Text>
            </View>
          ) : (
            contacts.map((c, i) => (
              <View key={`${c.phone}-${i}`} style={styles.personCard}>
                <View style={styles.personMain}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>{c.name.trim().charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.personText}>
                    <Text style={styles.personName}>{c.name}</Text>
                    <Text style={styles.personPhone}>{formatBrazilDisplay(c.phone)}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => confirmRemove(i, c.name)}
                  style={styles.removeBtn}
                  accessibilityLabel={`Remover ${c.name}`}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.dangerRed} />
                  <Text style={styles.removeTxt}>Remover</Text>
                </Pressable>
              </View>
            ))
          )}

          {contacts.length < 2 ? (
            <View style={styles.formBlock}>
              <Text style={styles.sectionLabel}>Adicionar</Text>
              <View style={styles.formCard}>
                <Text style={styles.fieldLabel}>Nome</Text>
                <TextInput
                  placeholder="Como chama essa pessoa"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
                <Text style={styles.fieldLabel}>WhatsApp (Brasil)</Text>
                <BrazilPhoneField valueLocalDigits={phoneLocal} onChangeLocalDigits={setPhoneLocal} />
                <Text style={styles.helper}>O +55 é aplicado automaticamente.</Text>
                <Pressable
                  style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                  onPress={async () => {
                    if (!name.trim()) {
                      Alert.alert('Nome', 'Informe o nome do contato.');
                      return;
                    }
                    const e164 = normalizeToBrazilE164(phoneLocal);
                    if (!e164) {
                      Alert.alert(
                        'Número inválido',
                        'Digite DDD + celular com 10 ou 11 dígitos. Ex.: (11) 98765-4321.',
                      );
                      return;
                    }
                    const dup = contacts.some((x) => x.phone === e164);
                    if (dup) {
                      Alert.alert('Já cadastrado', 'Esse número já está na lista.');
                      return;
                    }
                    await addContact({ name: name.trim(), phone: e164 });
                    setName('');
                    setPhoneLocal('');
                  }}
                >
                  <LinearGradient
                    colors={[...gradients.safe]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addGrad}
                  >
                    <Text style={styles.addBtnTxt}>Adicionar contato</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.limitHint}>
              <Ionicons name="information-circle-outline" size={20} color={colors.warmGray} />
              <Text style={styles.limitHintTxt}>Limite de 2 contatos. Remova alguém para trocar.</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backTxt: { fontSize: 16, color: colors.darkTeal, fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '700', color: colors.fabulousDeep },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fabulousDeep,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 15,
    color: colors.warmGray,
    lineHeight: 23,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 122, 123, 0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  noticeIcon: { marginBottom: 8 },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkTeal,
    marginBottom: 8,
  },
  noticeBody: {
    fontSize: 14,
    color: colors.warmGray,
    lineHeight: 21,
  },
  noticeBold: { fontWeight: '700', color: colors.fabulousDeep },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  linkTxt: { fontSize: 15, fontWeight: '600', color: colors.darkTeal },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8a8298',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 169, 217, 0.35)',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  emptyTxt: { fontSize: 14, color: colors.warmGray, lineHeight: 21, textAlign: 'center' },
  personCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  personMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(78, 205, 196, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTxt: { fontSize: 18, fontWeight: '700', color: colors.darkTeal },
  personText: { flex: 1, minWidth: 0 },
  personName: { fontSize: 17, fontWeight: '700', color: colors.fabulousDeep },
  personPhone: { fontSize: 15, color: colors.warmGray, marginTop: 2 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  removeTxt: { fontSize: 15, fontWeight: '600', color: colors.dangerRed },
  formBlock: { marginTop: 4 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: colors.fabulousDeep,
  },
  helper: { fontSize: 12, color: '#9ca3af', marginTop: 4, marginBottom: 16 },
  addBtn: { borderRadius: 14, overflow: 'hidden' },
  addBtnPressed: { opacity: 0.92 },
  addGrad: { paddingVertical: 15, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  limitHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(85, 98, 112, 0.08)',
    borderRadius: 12,
  },
  limitHintTxt: { flex: 1, fontSize: 13, color: colors.warmGray, lineHeight: 18 },
});
