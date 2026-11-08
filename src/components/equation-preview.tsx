import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge } from '@/components/badge';
import { MathView } from '@/components/math-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

interface EquationPreviewProps {
  titulo: string;
  latex: string;
  tempoMs?: number;
  tokensGerados?: number;
  suspeitaColapso?: boolean;
}

export function EquationPreview({
  titulo,
  latex,
  tempoMs,
  tokensGerados,
  suspeitaColapso,
}: EquationPreviewProps) {
  const [mostrarCodigo, setMostrarCodigo] = useState(false);

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {titulo}
          </ThemedText>
          <View style={styles.metaRow}>
            {suspeitaColapso && <Badge texto="Leitura suspeita" tom="aviso" />}
            {typeof tempoMs === 'number' && <Badge texto={`${Math.round(tempoMs)} ms`} />}
            {typeof tokensGerados === 'number' && <Badge texto={`${tokensGerados} tokens`} />}
          </View>
        </View>

        <ThemedView type="background" style={styles.mathBox}>
          <MathView latex={latex} fontSize={22} />
        </ThemedView>

        <Pressable onPress={() => setMostrarCodigo((v) => !v)} style={styles.toggle}>
          <ThemedText type="small" themeColor="tint">
            {mostrarCodigo ? 'Ocultar código LaTeX' : 'Ver código LaTeX'}
          </ThemedText>
        </Pressable>

        {mostrarCodigo && (
          <ThemedView type="backgroundSelected" style={styles.codeBox}>
            <ThemedText type="code" selectable>
              {latex}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  mathBox: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  toggle: {
    alignSelf: 'flex-start',
  },
  codeBox: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
});
