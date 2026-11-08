import { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { ErrorBanner } from '@/components/error-banner';
import { LoadingBlock } from '@/components/loading-block';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApiConfig } from '@/lib/api-config';
import { consultarSaude } from '@/lib/api';
import type { RespostaSaude } from '@/types/api';

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { baseUrl, rascunho, alterarRascunho, salvar, temAlteracoesPendentes } = useApiConfig();

  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [saude, setSaude] = useState<RespostaSaude | null>(null);
  const controladorRef = useRef<AbortController | null>(null);

  async function salvarEtestar() {
    await salvar();
    await testarConexao();
  }

  async function testarConexao() {
    const controlador = new AbortController();
    controladorRef.current = controlador;
    setTestando(true);
    setErro(null);
    setSaude(null);
    try {
      const resposta = await consultarSaude(
        rascunho.trim().replace(/\/+$/, '') || baseUrl,
        controlador.signal,
      );
      setSaude(resposta);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setErro('Requisição cancelada.');
      } else {
        setErro(e instanceof Error ? e.message : 'Não foi possível conectar.');
      }
    } finally {
      setTestando(false);
      controladorRef.current = null;
    }
  }

  function cancelarTeste() {
    controladorRef.current?.abort();
  }

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
          <ThemedText type="subtitle">Configurações</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Endereço do servidor da API (FastAPI) que faz o OCR e a resolução.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            URL base da API
          </ThemedText>
          <TextInput
            value={rascunho}
            onChangeText={alterarRascunho}
            placeholder="http://10.0.2.2:8000"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border },
            ]}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Num celular físico, use o IP da máquina que roda{' '}
            <ThemedText type="code">uvicorn main:app</ThemedText> na rede local — não funciona
            apontar para <ThemedText type="code">127.0.0.1</ThemedText>, que no celular significa
            o próprio celular. No emulador Android, o IP do computador costuma ser{' '}
            <ThemedText type="code">10.0.2.2</ThemedText>.
          </ThemedText>

          <View style={styles.botoesRow}>
            <PrimaryButton
              texto={temAlteracoesPendentes ? 'Salvar e testar' : 'Testar conexão'}
              onPress={temAlteracoesPendentes ? salvarEtestar : testarConexao}
              carregando={testando}
              desabilitado={testando}
            />
            {testando && (
              <PrimaryButton texto="Cancelar" onPress={cancelarTeste} variante="contorno" />
            )}
          </View>
        </ThemedView>

        {testando && <LoadingBlock mensagem="Consultando /saude…" />}
        {erro && <ErrorBanner mensagem={erro} />}

        {saude && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.statusHeader}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Status do servidor
              </ThemedText>
              <Badge texto={saude.ok ? 'Modelo carregado' : 'Modelo indisponível'} tom={saude.ok ? 'sucesso' : 'perigo'} />
            </View>
            <InfoLinha rotulo="Modelo" valor={saude.modelo} />
            <InfoLinha rotulo="Dispositivo" valor={saude.dispositivo ?? '—'} />
            <InfoLinha rotulo="Precisão (dtype)" valor={saude.dtype ?? '—'} />
            <InfoLinha rotulo="Tokens de prompt" valor={saude.tokens_prompt?.toString() ?? '—'} />
            <InfoLinha rotulo="Máx. tokens gerados" valor={saude.max_new_tokens.toString()} />
          </ThemedView>
        )}

        <ThemedView
          type="backgroundElement"
          style={[styles.card, { paddingBottom: BottomTabInset + Spacing.four }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Sobre os modos
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            <ThemedText type="smallBold" themeColor="textSecondary">
              Foto → resultado{' '}
            </ThemedText>
            usa <ThemedText type="code">/ocr-e-resolver</ThemedText>.{'\n'}
            <ThemedText type="smallBold" themeColor="textSecondary">
              Revisar antes{' '}
            </ThemedText>
            usa <ThemedText type="code">/ocr</ThemedText> e depois{' '}
            <ThemedText type="code">/resolver</ThemedText>, para corrigir a transcrição antes de
            resolver.{'\n'}
            <ThemedText type="smallBold" themeColor="textSecondary">
              Digitar LaTeX{' '}
            </ThemedText>
            usa só <ThemedText type="code">/resolver</ThemedText>.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

function InfoLinha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.infoLinha}>
      <ThemedText type="small" themeColor="textSecondary">
        {rotulo}
      </ThemedText>
      <ThemedText type="small" style={{ fontFamily: Fonts.mono }}>
        {valor}
      </ThemedText>
    </View>
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
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    fontSize: 15,
  },
  botoesRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
