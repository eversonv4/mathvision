import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingBlock({ mensagem }: { mensagem: string }) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(150)}>
      <ThemedView type="backgroundElement" style={styles.container}>
        <ActivityIndicator color={theme.tint} />
        <ThemedText type="small" themeColor="textSecondary">
          {mensagem}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
