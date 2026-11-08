import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorBanner } from '@/components/error-banner';
import { LatexInput } from '@/components/latex-input';
import { LoadingBlock } from '@/components/loading-block';
import { PrimaryButton } from '@/components/primary-button';
import { ResultCard } from '@/components/result-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApiConfig } from '@/lib/api-config';
import { resolverLatex } from '@/lib/api';
import type { RespostaResolverCompleta } from '@/types/api';

/** Expõe o endpoint /resolver isoladamente, para quem já tem o LaTeX em mãos. */
export function ModoDigitar() {
  const { baseUrl } = useApiConfig();

  const [latex, setLatex] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespostaResolverCompleta | null>(null);

  async function resolver() {
    if (!latex.trim()) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const resposta = await resolverLatex(baseUrl, latex);
      setResultado(resposta);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido ao resolver a equação.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Digite ou cole uma expressão em LaTeX diretamente, sem passar por uma imagem.
      </ThemedText>

      <LatexInput
        value={latex}
        onChangeText={setLatex}
        placeholder={'2 \\log(n) = \\log(n)^2'}
        editable={!carregando}
      />

      <PrimaryButton
        texto="Resolver"
        onPress={resolver}
        desabilitado={!latex.trim()}
        carregando={carregando}
      />

      {carregando && <LoadingBlock mensagem="Resolvendo com o SymPy…" />}
      {erro && <ErrorBanner mensagem={erro} />}
      {resultado && <ResultCard resultado={resultado} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
});
