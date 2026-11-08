import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Tom = 'neutro' | 'sucesso' | 'aviso' | 'perigo' | 'destaque';

const TONS: Record<Tom, { bg: ThemeColor; texto: ThemeColor }> = {
  neutro: { bg: 'backgroundSelected', texto: 'textSecondary' },
  sucesso: { bg: 'successBackground', texto: 'success' },
  aviso: { bg: 'warningBackground', texto: 'warning' },
  perigo: { bg: 'dangerBackground', texto: 'danger' },
  destaque: { bg: 'backgroundSelected', texto: 'tint' },
};

export function Badge({ texto, tom = 'neutro' }: { texto: string; tom?: Tom }) {
  const theme = useTheme();
  const cores = TONS[tom];
  return (
    <ThemedText
      type="smallBold"
      themeColor={cores.texto}
      style={[styles.badge, { backgroundColor: theme[cores.bg] }]}>
      {texto}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
    fontSize: 12,
    overflow: 'hidden',
  },
});
