import React from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle } from 'react-native';
import { BR_PLACEHOLDER_MOBILE, extractLocalDigits, maskBrazilLocalDigits } from '../lib/phoneBr';

type Props = {
  valueLocalDigits: string;
  onChangeLocalDigits: (digits: string) => void;
  editable?: boolean;
  inputStyle?: StyleProp<TextStyle>;
};

/** Campo DDD + número (Brasil); prefixo +55 fixo. Valor controlado = só dígitos locais (até 11). */
export function BrazilPhoneField({
  valueLocalDigits,
  onChangeLocalDigits,
  editable = true,
  inputStyle,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>+55</Text>
      </View>
      <TextInput
        value={maskBrazilLocalDigits(valueLocalDigits)}
        onChangeText={(t) => onChangeLocalDigits(extractLocalDigits(t))}
        keyboardType="phone-pad"
        placeholder={BR_PLACEHOLDER_MOBILE}
        placeholderTextColor="#b0a8bc"
        style={[styles.input, inputStyle]}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(44,122,123,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(44,122,123,0.25)',
    marginRight: 10,
  },
  badgeTxt: { fontSize: 17, fontWeight: '800', color: '#2C7A7B', letterSpacing: 0.5 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(74,68,88,0.15)',
    borderRadius: 14,
    padding: 14,
    fontSize: 18,
    backgroundColor: '#faf8ff',
    color: '#4A4458',
  },
});
