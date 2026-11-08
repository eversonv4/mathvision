/**
 * Formatos de resposta da API FastAPI (ver README.md na raiz do projeto).
 * Os nomes dos campos seguem exatamente o que `main.py` e `resolver.py` devolvem.
 */

export type TipoResolucao = 'equacao' | 'equacao_multivariada' | 'expressao';

export interface RespostaOCR {
  latex: string;
  latex_canonico: string;
  tokens_gerados: number;
  suspeita_colapso: boolean;
  tempo_ms: number;
  modelo: string;
}

export interface ResolucaoInterpretavel {
  interpretavel: true;
  entrada_sympy: string;
  sympy: string;
  sympy_formatado: string;
  tipo: TipoResolucao;
  incognitas: string[];
  /** Lista de soluções para equações de uma variável (pode ser vazia), forma simplificada para expressões, ou null para equações multivariadas. */
  solucao: string[] | string | null;
}

export interface ResolucaoNaoInterpretavel {
  interpretavel: false;
  entrada_sympy?: string;
  erro?: string;
}

export type ResultadoResolucao = ResolucaoInterpretavel | ResolucaoNaoInterpretavel;

export type RespostaResolverCompleta = {
  latex: string;
  latex_canonico: string;
} & ResultadoResolucao;

export interface RespostaOcrEResolver extends RespostaOCR {
  resolucao: ResultadoResolucao | null;
  aviso?: string;
}

export interface RespostaSaude {
  ok: boolean;
  modelo: string;
  caminho: string | null;
  dispositivo: string | null;
  dtype: string | null;
  tokens_prompt: number | null;
  max_new_tokens: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
