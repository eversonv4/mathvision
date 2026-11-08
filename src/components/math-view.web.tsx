import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface MathViewProps {
  latex: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

/** Renderiza LaTeX como matemática tipografada de verdade (via KaTeX, diretamente no DOM). */
export function MathView({ latex, fontSize = 20, style }: MathViewProps) {
  const theme = useTheme();

  const html = useMemo(() => {
    try {
      return katex.renderToString(latex ?? '', { throwOnError: false, displayMode: true });
    } catch {
      return latex ?? '';
    }
  }, [latex]);

  const flatStyle = StyleSheet.flatten(style) as Record<string, unknown> | undefined;

  return (
    <div
      style={{
        color: theme.text,
        fontSize,
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto',
        width: '100%',
        ...flatStyle,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
