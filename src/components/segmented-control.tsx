import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface OpcaoSegmentada<T extends string> {
  valor: T;
  rotulo: string;
}

interface SegmentedControlProps<T extends string> {
  opcoes: OpcaoSegmentada<T>[];
  valor: T;
  onChange: (valor: T) => void;
}

export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {opcoes.map((opcao) => {
        const selecionado = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => onChange(opcao.valor)}
            style={({ pressed }) => [
              styles.segmento,
              selecionado && { backgroundColor: theme.background },
              pressed && !selecionado && styles.pressionado,
            ]}>
            <ThemedText
              type="smallBold"
              themeColor={selecionado ? 'text' : 'textSecondary'}
              style={styles.rotulo}
              numberOfLines={1}>
              {opcao.rotulo}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segmento: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  pressionado: {
    opacity: 0.6,
  },
  rotulo: {
    textAlign: 'center',
  },
});
