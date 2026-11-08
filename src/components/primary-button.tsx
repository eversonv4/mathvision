import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps {
  texto: string;
  onPress: () => void;
  desabilitado?: boolean;
  carregando?: boolean;
  variante?: 'preenchido' | 'contorno';
}

export function PrimaryButton({
  texto,
  onPress,
  desabilitado,
  carregando,
  variante = 'preenchido',
}: PrimaryButtonProps) {
  const theme = useTheme();
  const inativo = desabilitado || carregando;
  const preenchido = variante === 'preenchido';

  return (
    <Pressable
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        preenchido
          ? { backgroundColor: theme.tint }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.tint },
        inativo && styles.desabilitado,
        pressed && !inativo && styles.pressionado,
      ]}>
      {carregando && <ActivityIndicator color={preenchido ? theme.tintText : theme.tint} size="small" />}
      <ThemedText type="smallBold" themeColor={preenchido ? 'tintText' : 'tint'}>
        {texto}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.5,
  },
});
