import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SERVER_URL } from '../../config';
import type { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type R = RouteProp<AuthStackParamList, 'Legal'>;

const titles = { privacy: 'Privacidade', terms: 'Termos' } as const;

export default function LegalWebScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { doc } = useRoute<R>().params;
  const uri = `${SERVER_URL}/legal/${doc === 'privacy' ? 'privacy' : 'terms'}`;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.darkTeal} />
          <Text style={styles.backTxt}>Voltar</Text>
        </Pressable>
        <Text style={styles.title}>{titles[doc]}</Text>
      </View>
      <WebView
        source={{ uri }}
        style={styles.web}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.darkTeal} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTxt: { fontSize: 16, color: colors.darkTeal, fontWeight: '600' },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '800',
    color: colors.fabulousDeep,
  },
  web: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
