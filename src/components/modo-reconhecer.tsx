import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EquationPreview } from '@/components/equation-preview';
import { ErrorBanner } from '@/components/error-banner';
import { ImagePickerPanel } from '@/components/image-picker-panel';
import { LatexInput } from '@/components/latex-input';
import { LoadingBlock } from '@/components/loading-block';
import { PrimaryButton } from '@/components/primary-button';
import { ResultCard } from '@/components/result-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApiConfig } from '@/lib/api-config';
import { reconhecerImagem, resolverLatex, type ImagemSelecionada } from '@/lib/api';
import type { RespostaOCR, RespostaResolverCompleta } from '@/types/api';

/**
 * Fluxo em dois passos que corresponde exatamente ao que o README explica na
 * seção "Por que dois endpoints separados": o /ocr devolve o LaTeX lido, o
 * usuário pode revisar e corrigir, e só então o /resolver é chamado.
 */
export function ModoReconhecer() {
  const { baseUrl } = useApiConfig();

  const [imagem, setImagem] = useState<ImagemSelecionada | null>(null);
  const [carregandoOcr, setCarregandoOcr] = useState(false);
  const [erroOcr, setErroOcr] = useState<string | null>(null);
  const [resultadoOcr, setResultadoOcr] = useState<RespostaOCR | null>(null);

  const [latex, setLatex] = useState('');
  const [carregandoResolver, setCarregandoResolver] = useState(false);
  const [erroResolver, setErroResolver] = useState<string | null>(null);
  const [resultadoResolver, setResultadoResolver] = useState<RespostaResolverCompleta | null>(null);

  async function reconhecer() {
    if (!imagem) return;
    setCarregandoOcr(true);
    setErroOcr(null);
    setResultadoOcr(null);
    setResultadoResolver(null);
    setErroResolver(null);

    try {
      const resposta = await reconhecerImagem(baseUrl, imagem);
      setResultadoOcr(resposta);
      setLatex(resposta.latex);
    } catch (erro) {
      console.log(erro)
      setErroOcr(erro instanceof Error ? erro.message : 'Erro desconhecido ao reconhecer a imagem.');
    } finally {
      setCarregandoOcr(false);
    }
  }

  async function resolver() {
    if (!latex.trim()) return;
    setCarregandoResolver(true);
    setErroResolver(null);
    setResultadoResolver(null);
    try {
      const resposta = await resolverLatex(baseUrl, latex);
      setResultadoResolver(resposta);
    } catch (erro) {
      setErroResolver(erro instanceof Error ? erro.message : 'Erro desconhecido ao resolver a equação.');
    } finally {
      setCarregandoResolver(false);
    }
  }

  function trocarImagem(nova: ImagemSelecionada | null) {
    setImagem(nova);
    setResultadoOcr(null);
    setErroOcr(null);
    setResultadoResolver(null);
    setErroResolver(null);
    setLatex('');
  }

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Fotografe ou escolha uma imagem com a equação. Depois de reconhecida, você pode revisar o
        LaTeX antes de enviá-lo para o resolvedor.
      </ThemedText>

      <ImagePickerPanel imagem={imagem} onChange={trocarImagem} desabilitado={carregandoOcr} />

      {imagem && !resultadoOcr && (
        <PrimaryButton texto="Reconhecer equação" onPress={reconhecer} carregando={carregandoOcr} />
      )}

      {carregandoOcr && <LoadingBlock mensagem="Lendo a imagem com o modelo de OCR…" />}
      {erroOcr && <ErrorBanner mensagem={erroOcr} />}

      {resultadoOcr && (
        <>
          <EquationPreview
            titulo="Equação reconhecida"
            latex={resultadoOcr.latex}
            tempoMs={resultadoOcr.tempo_ms}
            tokensGerados={resultadoOcr.tokens_gerados}
            suspeitaColapso={resultadoOcr.suspeita_colapso}
          />

          <View style={styles.secao}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Revise antes de resolver
            </ThemedText>
            <LatexInput value={latex} onChangeText={setLatex} editable={!carregandoResolver} />
          </View>

          <PrimaryButton
            texto="Resolver equação"
            onPress={resolver}
            desabilitado={!latex.trim()}
            carregando={carregandoResolver}
          />
        </>
      )}

      {carregandoResolver && <LoadingBlock mensagem="Resolvendo com o SymPy…" />}
      {erroResolver && <ErrorBanner mensagem={erroResolver} />}
      {resultadoResolver && <ResultCard resultado={resultadoResolver} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  secao: {
    gap: Spacing.two,
  },
});
