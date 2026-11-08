import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModoAtalho } from '@/components/modo-atalho';
import { ModoDigitar } from '@/components/modo-digitar';
import { ModoReconhecer } from '@/components/modo-reconhecer';
import { SegmentedControl, type OpcaoSegmentada } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Modo = 'reconhecer' | 'digitar' | 'atalho';

const OPCOES: OpcaoSegmentada<Modo>[] = [
  { valor: 'atalho', rotulo: 'Foto → resultado' },
  { valor: 'reconhecer', rotulo: 'Revisar antes' },
  { valor: 'digitar', rotulo: 'Digitar LaTeX' },
];

export default function ResolverScreen() {
  const [modo, setModo] = useState<Modo>('atalho');
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={{ top: insets.top }}
      contentContainerStyle={[
        styles.contentContainer,
        Platform.select({
          android: { paddingTop: insets.top, paddingBottom: insets.bottom },
          web: { paddingTop: Spacing.six },
        }),
      ]}
      keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleBlock}>
          <ThemedText type="subtitle">MathVision</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Fotografe uma equação manuscrita e deixe o SymPy resolver.
          </ThemedText>
        </ThemedView>

        <SegmentedControl opcoes={OPCOES} valor={modo} onChange={setModo} />

        <ThemedView style={[styles.modoContainer, { paddingBottom: BottomTabInset + Spacing.four }]}>
          {modo === 'atalho' && <ModoAtalho />}
          {modo === 'reconhecer' && <ModoReconhecer />}
          {modo === 'digitar' && <ModoDigitar />}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  titleBlock: {
    gap: Spacing.one,
    paddingTop: Spacing.four,
  },
  modoContainer: {
    gap: Spacing.four,
  },
});
