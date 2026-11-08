import { sympyParaLatex } from '@/lib/sympy-to-latex';
import { ResolucaoInterpretavel, ResultadoResolucao } from '@/types/api';

export interface RotuloResultado {
  titulo: string;
  descricao: string;
  /** false quando não há nada de fato a exibir como "resultado" (ex.: multivariada sem solução numérica) */
  temValor: boolean;
}

/**
 * O SymPy não "resolve" expressões soltas (sem `=`), só simplifica. Por isso
 * uma fração como \\frac{5}{2} volta como "5/2": não é um erro, é a própria
 * resposta. Rotulamos de forma diferente de uma equação resolvida para que
 * o usuário entenda o que está vendo.
 */
export function rotularResultado(r: ResolucaoInterpretavel): RotuloResultado {
  if (r.tipo === 'expressao') {
    return {
      titulo: 'Forma simplificada',
      descricao:
        'Há expressões que não possuem uma solução numérica inteira, então sua resolução será simplificada. Quando o resultado não é um número redondo, a fração ou a raiz aparece na forma mais simples possível. Isto já é o resultado final.',
      temValor: true,
    };
  }
  if (r.tipo === 'equacao') {
    if (!Array.isArray(r.solucao) || r.solucao.length === 0) {
      return {
        titulo: 'Sem solução encontrada',
        descricao: 'O SymPy não encontrou nenhum valor que satisfaça esta equação.',
        temValor: false,
      };
    }
    return {
      titulo: r.solucao.length > 1 ? 'Soluções' : 'Solução',
      descricao: `Valor${r.solucao.length > 1 ? 'es' : ''} de ${r.incognitas.join(', ')} que satisfaz${r.solucao.length > 1 ? 'em' : ''} a equação.`,
      temValor: true,
    };
  }
  // equacao_multivariada
  return {
    titulo: 'Múltiplas incógnitas',
    descricao: `Esta equação tem mais de uma incógnita (${r.incognitas.join(', ')}), então não há um único valor a resolver automaticamente. Veja a forma interpretada acima.`,
    temValor: false,
  };
}

/** Itens prontos para renderizar em LaTeX: um por elemento de `solucao`. */
export function obterLatexDasSolucoes(r: ResolucaoInterpretavel): string[] {
  if (r.tipo === 'expressao' && typeof r.solucao === 'string') {
    return [sympyParaLatex(r.solucao)];
  }
  if (r.tipo === 'equacao' && Array.isArray(r.solucao)) {
    return r.solucao.map(sympyParaLatex);
  }
  return [];
}

export function latexDaEntradaInterpretada(r: ResolucaoInterpretavel): string {
  return sympyParaLatex(r.sympy);
}

export function resultadoFoiInterpretado(r: ResultadoResolucao): r is ResolucaoInterpretavel {
  return r.interpretavel === true;
}
