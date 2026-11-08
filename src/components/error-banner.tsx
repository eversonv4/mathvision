import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ErrorBanner({ mensagem }: { mensagem: string }) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(150)}>
      <ThemedView style={[styles.container, { backgroundColor: theme.dangerBackground }]}>
        <SymbolView
          name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
          tintColor={theme.danger}
          size={16}
        />
        <ThemedText type="small" themeColor="danger" style={styles.texto}>
          {mensagem}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'flex-start',
  },
  texto: {
    flex: 1,
  },
});
