import {
  ApiError,
  RespostaOCR,
  RespostaOcrEResolver,
  RespostaResolverCompleta,
  RespostaSaude,
} from '@/types/api';

export interface ImagemSelecionada {
  uri: string;
  nome?: string | null;
  tipoMime?: string | null;
}

function inferirTipoMime(uri: string, tipoMime?: string | null) {
  if (tipoMime) return tipoMime;
  const extensao = uri.split('.').pop()?.toLowerCase();
  if (extensao === 'png') return 'image/png';
  if (extensao === 'webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * No Expo SDK 58 o `fetch` global nativo (expo/fetch) lê arquivos locais
 * (`file://`) como Blob vazio/corrompido — o upload "funciona" mas o
 * servidor recebe bytes inválidos. `XMLHttpRequest` ainda lê esses URIs
 * corretamente, então usamos ele só para transformar a uri em Blob antes de
 * montar o FormData que vai no `fetch` de envio.
 */
function uriParaBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Não foi possível ler o arquivo da imagem.'));
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

async function montarFormDataDaImagem(imagem: ImagemSelecionada): Promise<FormData> {
  const tipoMime = inferirTipoMime(imagem.uri, imagem.tipoMime);
  const nome = imagem.nome ?? `equacao.${tipoMime === 'image/png' ? 'png' : 'jpg'}`;

  const blob = await uriParaBlob(imagem.uri);
  const formData = new FormData();
  formData.append('imagem', blob, nome);
  return formData;
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    let detalhe = '';
    try {
      const corpo = await resposta.json();
      detalhe = corpo?.detail ?? JSON.stringify(corpo);
    } catch {
      detalhe = await resposta.text().catch(() => '');
    }
    throw new ApiError(detalhe || `Erro HTTP ${resposta.status}`, resposta.status);
  }
  return resposta.json() as Promise<T>;
}

async function requisitar<T>(url: string, init: RequestInit): Promise<T> {
  try {
    const resposta = await fetch(url, init);
    return await tratarResposta<T>(resposta);
  } catch (erro) {
    if (erro instanceof ApiError) throw erro;
    if (erro instanceof Error && erro.name === 'AbortError') throw erro;
    throw new ApiError(
      'Não foi possível conectar à API. Confira o endereço em Configurações e se o servidor está rodando.',
    );
  }
}

export function consultarSaude(baseUrl: string, signal?: AbortSignal): Promise<RespostaSaude> {
  return requisitar<RespostaSaude>(`${baseUrl}/saude`, { method: 'GET', signal });
}

export async function reconhecerImagem(
  baseUrl: string,
  imagem: ImagemSelecionada,
): Promise<RespostaOCR> {
  return requisitar<RespostaOCR>(`${baseUrl}/ocr`, {
    method: 'POST',
    body: await montarFormDataDaImagem(imagem),
    headers: { Accept: 'application/json' },
  });
}

export function resolverLatex(baseUrl: string, latex: string): Promise<RespostaResolverCompleta> {
  return requisitar<RespostaResolverCompleta>(`${baseUrl}/resolver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ latex }),
  });
}

export async function reconhecerEResolver(
  baseUrl: string,
  imagem: ImagemSelecionada,
): Promise<RespostaOcrEResolver> {
  return requisitar<RespostaOcrEResolver>(`${baseUrl}/ocr-e-resolver`, {
    method: 'POST',
    body: await montarFormDataDaImagem(imagem),
    headers: { Accept: 'application/json' },
  });
}
