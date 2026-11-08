import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mathvision.api-base-url';

/**
 * Sem valor salvo ainda, sugerimos localhost: funciona no emulador Android
 * (via 10.0.2.2, ajustado abaixo) e no modo web. Num celular físico isso
 * precisa ser trocado pelo IP da máquina que roda a API na mesma rede.
 */
// const SUGESTAO_PADRAO = 'http://127.0.0.1:8000';
const SUGESTAO_PADRAO = 'http://192.168.0.101:8000';

interface ApiConfigState {
  baseUrl: string;
  rascunho: string;
  pronto: boolean;
  alterarRascunho: (valor: string) => void;
  salvar: () => Promise<void>;
  temAlteracoesPendentes: boolean;
}

const ApiConfigContext = createContext<ApiConfigState | null>(null);

export function ApiConfigProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrl] = useState(SUGESTAO_PADRAO);
  const [rascunho, setRascunho] = useState(SUGESTAO_PADRAO);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((salvo) => {
      if (salvo) {
        setBaseUrl(salvo);
        setRascunho(salvo);
      }
      setPronto(true);
    });
  }, []);

  const salvar = useCallback(async () => {
    const limpo = rascunho.trim().replace(/\/+$/, '');
    if (!limpo) return;
    await AsyncStorage.setItem(STORAGE_KEY, limpo);
    setBaseUrl(limpo);
    setRascunho(limpo);
  }, [rascunho]);

  const value = useMemo<ApiConfigState>(
    () => ({
      baseUrl,
      rascunho,
      pronto,
      alterarRascunho: setRascunho,
      salvar,
      temAlteracoesPendentes: rascunho.trim().replace(/\/+$/, '') !== baseUrl,
    }),
    [baseUrl, rascunho, pronto, salvar],
  );

  return <ApiConfigContext.Provider value={value}>{children}</ApiConfigContext.Provider>;
}

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig precisa estar dentro de ApiConfigProvider');
  return ctx;
}
