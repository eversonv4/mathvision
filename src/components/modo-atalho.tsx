import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EquationPreview } from '@/components/equation-preview';
import { ErrorBanner } from '@/components/error-banner';
import { ImagePickerPanel } from '@/components/image-picker-panel';
import { LoadingBlock } from '@/components/loading-block';
import { PrimaryButton } from '@/components/primary-button';
import { ResultCard } from '@/components/result-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useApiConfig } from '@/lib/api-config';
import { reconhecerEResolver, type ImagemSelecionada } from '@/lib/api';
import type { RespostaOcrEResolver } from '@/types/api';

/** Caminho rápido: uma imagem entra, a equação reconhecida e o resultado saem juntos. */
export function ModoAtalho() {
  const { baseUrl } = useApiConfig();

  const [imagem, setImagem] = useState<ImagemSelecionada | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespostaOcrEResolver | null>(null);

  async function analisar() {
    if (!imagem) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const resposta = await reconhecerEResolver(baseUrl, imagem);
      setResultado(resposta);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido ao processar a imagem.');
    } finally {
      setCarregando(false);
    }
  }

  function trocarImagem(nova: ImagemSelecionada | null) {
    setImagem(nova);
    setResultado(null);
    setErro(null);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Reconhece e resolve em uma única chamada. Se a leitura parecer suspeita, a resolução é
        pulada automaticamente para não entregar uma resposta errada com aparência de certeza.
      </ThemedText>

      <ImagePickerPanel imagem={imagem} onChange={trocarImagem} desabilitado={carregando} />

      {imagem && !resultado && (
        <PrimaryButton texto="Reconhecer e resolver" onPress={analisar} carregando={carregando} />
      )}

      {carregando && <LoadingBlock mensagem="Lendo a imagem e resolvendo a equação…" />}
      {erro && <ErrorBanner mensagem={erro} />}

      {resultado && (
        <>
          <EquationPreview
            titulo="Equação reconhecida"
            latex={resultado.latex}
            tempoMs={resultado.tempo_ms}
            tokensGerados={resultado.tokens_gerados}
            suspeitaColapso={resultado.suspeita_colapso}
          />

          {resultado.resolucao ? (
            <ResultCard resultado={resultado.resolucao} />
          ) : (
            <ThemedView type="warningBackground" style={styles.avisoBox}>
              <ThemedText type="small" themeColor="warning">
                {resultado.aviso ??
                  'A leitura pareceu suspeita, então a resolução não foi executada. Tente novamente com a opção "Reconhecer" para revisar o LaTeX manualmente.'}
              </ThemedText>
            </ThemedView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  avisoBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
});
