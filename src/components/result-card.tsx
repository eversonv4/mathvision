import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge, type Tom } from '@/components/badge';
import { MathView } from '@/components/math-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  latexDaEntradaInterpretada,
  obterLatexDasSolucoes,
  rotularResultado,
} from '@/lib/resultado-helpers';
import type { TipoResolucao, ResultadoResolucao } from '@/types/api';

const ROTULO_TIPO: Record<TipoResolucao, string> = {
  equacao: 'Equação',
  equacao_multivariada: 'Equação com várias incógnitas',
  expressao: 'Expressão',
};

const TOM_TIPO: Record<TipoResolucao, Tom> = {
  equacao: 'destaque',
  equacao_multivariada: 'aviso',
  expressao: 'neutro',
};

export function ResultCard({ resultado }: { resultado: ResultadoResolucao }) {
  if (!resultado.interpretavel) {
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.header}>
            <Badge texto="Não interpretável" tom="perigo" />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {resultado.erro ?? 'O SymPy não conseguiu interpretar esta expressão como matemática válida.'}
          </ThemedText>
          {resultado.entrada_sympy ? (
            <ThemedView type="backgroundSelected" style={styles.codeBox}>
              <ThemedText type="code" selectable>
                {resultado.entrada_sympy}
              </ThemedText>
            </ThemedView>
          ) : null}
        </ThemedView>
      </Animated.View>
    );
  }

  const rotulo = rotularResultado(resultado);
  const solucoes = obterLatexDasSolucoes(resultado);
  const incognita = resultado.incognitas[0];

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <Badge texto={ROTULO_TIPO[resultado.tipo]} tom={TOM_TIPO[resultado.tipo]} />
        </View>

        <View style={styles.secao}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Interpretado pelo solver
          </ThemedText>
          <ThemedView type="background" style={styles.mathBox}>
            <MathView latex={latexDaEntradaInterpretada(resultado)} fontSize={20} />
          </ThemedView>
        </View>

        <View style={styles.secao}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {rotulo.titulo}
          </ThemedText>

          {rotulo.temValor ? (
            <View style={styles.solucoesContainer}>
              {solucoes.map((latex, i) => (
                <ThemedView key={i} type="background" style={styles.mathBox}>
                  <MathView
                    latex={
                      resultado.tipo === 'equacao' && incognita
                        ? `${incognita} = ${latex}`
                        : latex
                    }
                    fontSize={22}
                  />
                </ThemedView>
              ))}
            </View>
          ) : (
            <ThemedView type="warningBackground" style={styles.avisoBox}>
              <ThemedText type="small" themeColor="warning">
                {rotulo.descricao}
              </ThemedText>
            </ThemedView>
          )}

          {rotulo.temValor && (
            <ThemedText type="small" themeColor="textSecondary">
              {rotulo.descricao}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secao: {
    gap: Spacing.two,
  },
  mathBox: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  solucoesContainer: {
    gap: Spacing.two,
  },
  avisoBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  codeBox: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
});
