import { useMemo, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import WebView from 'react-native-webview';

import { montarHtmlKatex } from '@/lib/katex-html';
import { useTheme } from '@/hooks/use-theme';

export interface MathViewProps {
  latex: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

/** Renderiza LaTeX como matemática tipografada de verdade (via KaTeX numa WebView). */
export function MathView({ latex, fontSize = 20, style }: MathViewProps) {
  const theme = useTheme();
  const [altura, setAltura] = useState(Math.round(fontSize * 2.2));

  const html = useMemo(
    () => montarHtmlKatex(latex, { corTexto: theme.text, tamanhoFonte: fontSize }),
    [latex, theme.text, fontSize],
  );

  return (
    <View style={[styles.container, { height: altura }, style]}>
      <WebView
        source={{ html }}
        onMessage={(evento) => {
          const novaAltura = Number(evento.nativeEvent.data);
          if (!Number.isNaN(novaAltura) && novaAltura > 0) setAltura(novaAltura);
        }}
        style={styles.webview}
        containerStyle={styles.webview}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});
