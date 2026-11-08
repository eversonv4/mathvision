/**
 * Converte a saída textual do SymPy (`str(obj)`, como "5/2", "sqrt(2)" ou
 * "Eq(x, 3)") para LaTeX, para que o resultado final possa ser renderizado
 * com a mesma qualidade visual da equação reconhecida por OCR.
 *
 * É necessário porque a API devolve o resultado em texto puro do Python/SymPy,
 * não em LaTeX — só `sympy_formatado` (pretty-print unicode) chega bonito, e
 * esse formata a expressão de entrada, não a solução final.
 *
 * A gramática do `str()` do SymPy é essencialmente Python válido (operadores
 * + - * / **, parênteses, chamadas de função, vírgulas), então isto é um
 * parser de descida recursiva simples seguido de um emissor de LaTeX.
 */

type Token =
  | { tipo: 'num'; valor: string }
  | { tipo: 'id'; valor: string }
  | { tipo: 'op'; valor: string }
  | { tipo: 'fim'; valor: '' };

const GREGAS: Record<string, string> = {
  alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta',
  epsilon: '\\epsilon', zeta: '\\zeta', eta: '\\eta', theta: '\\theta',
  iota: '\\iota', kappa: '\\kappa', lambda: '\\lambda', mu: '\\mu',
  nu: '\\nu', xi: '\\xi', pi: '\\pi', rho: '\\rho', sigma: '\\sigma',
  tau: '\\tau', upsilon: '\\upsilon', phi: '\\phi', chi: '\\chi',
  psi: '\\psi', omega: '\\omega',
};

const FUNCOES_SIMPLES: Record<string, string> = {
  sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot', sec: '\\sec', csc: '\\csc',
  sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', coth: '\\coth',
  asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan',
  asinh: '\\operatorname{arcsinh}', acosh: '\\operatorname{arccosh}', atanh: '\\operatorname{arctanh}',
  arg: '\\arg', gcd: '\\gcd',
};

const CONSTANTES: Record<string, string> = {
  pi: '\\pi', E: 'e', I: 'i', oo: '\\infty', zoo: '\\infty',
  nan: '\\text{indefinido}', True: '\\text{verdadeiro}', False: '\\text{falso}',
};

function tokenizar(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i + 1;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ tipo: 'num', valor: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      tokens.push({ tipo: 'id', valor: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '*' && src[i + 1] === '*') {
      tokens.push({ tipo: 'op', valor: '**' });
      i += 2;
      continue;
    }
    if ('+-*/(),[]'.includes(c)) {
      tokens.push({ tipo: 'op', valor: c });
      i++;
      continue;
    }
    // Caractere desconhecido: ignora para não travar o parse inteiro.
    i++;
  }
  tokens.push({ tipo: 'fim', valor: '' });
  return tokens;
}

// --- AST -------------------------------------------------------------

type No =
  | { tipo: 'num'; valor: string }
  | { tipo: 'simbolo'; nome: string }
  | { tipo: 'bin'; op: '+' | '-' | '*' | '/'; esq: No; dir: No }
  | { tipo: 'potencia'; base: No; exp: No }
  | { tipo: 'neg'; valor: No }
  | { tipo: 'chamada'; nome: string; args: No[] }
  | { tipo: 'lista'; itens: No[] };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private atual(): Token {
    return this.tokens[this.pos];
  }

  private consumirOp(valor: string): boolean {
    const t = this.atual();
    if (t.tipo === 'op' && t.valor === valor) {
      this.pos++;
      return true;
    }
    return false;
  }

  parse(): No {
    const no = this.expr();
    return no;
  }

  // expr := termo (('+'|'-') termo)*
  private expr(): No {
    let no = this.termo();
    for (;;) {
      if (this.consumirOp('+')) {
        no = { tipo: 'bin', op: '+', esq: no, dir: this.termo() };
      } else if (this.consumirOp('-')) {
        no = { tipo: 'bin', op: '-', esq: no, dir: this.termo() };
      } else break;
    }
    return no;
  }

  // termo := fator (('*'|'/') fator)*
  private termo(): No {
    let no = this.fator();
    for (;;) {
      if (this.consumirOp('*')) {
        no = { tipo: 'bin', op: '*', esq: no, dir: this.fator() };
      } else if (this.consumirOp('/')) {
        no = { tipo: 'bin', op: '/', esq: no, dir: this.fator() };
      } else break;
    }
    return no;
  }

  // fator := unario ('**' fator)?   (potência associa à direita)
  private fator(): No {
    const base = this.unario();
    if (this.consumirOp('**')) {
      const exp = this.fator();
      return { tipo: 'potencia', base, exp };
    }
    return base;
  }

  private unario(): No {
    if (this.consumirOp('-')) {
      return { tipo: 'neg', valor: this.unario() };
    }
    if (this.consumirOp('+')) {
      return this.unario();
    }
    return this.atomo();
  }

  private atomo(): No {
    const t = this.atual();

    if (t.tipo === 'num') {
      this.pos++;
      return { tipo: 'num', valor: t.valor };
    }

    if (t.tipo === 'op' && t.valor === '(') {
      this.pos++;
      const no = this.expr();
      this.consumirOp(')');
      return no;
    }

    if (t.tipo === 'op' && t.valor === '[') {
      this.pos++;
      const itens: No[] = [];
      if (!(this.atual().tipo === 'op' && this.atual().valor === ']')) {
        itens.push(this.expr());
        while (this.consumirOp(',')) itens.push(this.expr());
      }
      this.consumirOp(']');
      return { tipo: 'lista', itens };
    }

    if (t.tipo === 'id') {
      this.pos++;
      const nome = t.valor;
      if (this.atual().tipo === 'op' && this.atual().valor === '(') {
        this.pos++;
        const args: No[] = [];
        if (!(this.atual().tipo === 'op' && this.atual().valor === ')')) {
          args.push(this.expr());
          while (this.consumirOp(',')) args.push(this.expr());
        }
        this.consumirOp(')');
        return { tipo: 'chamada', nome, args };
      }
      return { tipo: 'simbolo', nome };
    }

    // Token inesperado (fim prematuro, etc.): devolve um placeholder vazio.
    return { tipo: 'simbolo', nome: '' };
  }
}

// --- Emissor de LaTeX --------------------------------------------------

function nomeSimboloParaLatex(nome: string): string {
  if (nome in CONSTANTES) return CONSTANTES[nome];

  // Subscrito: "x_1" ou "x1" (letra seguida de dígitos) -> x_{1}
  const comUnderscore = nome.match(/^([a-zA-Z]+)_(.+)$/);
  if (comUnderscore) {
    return `${nomeSimboloParaLatex(comUnderscore[1])}_{${comUnderscore[2]}}`;
  }
  const comSufixoNumerico = nome.match(/^([a-zA-Z]+)([0-9]+)$/);
  if (comSufixoNumerico && !(comSufixoNumerico[1] in GREGAS)) {
    return `${comSufixoNumerico[1]}_{${comSufixoNumerico[2]}}`;
  }

  if (nome.toLowerCase() in GREGAS && nome === nome.toLowerCase()) {
    return GREGAS[nome.toLowerCase()];
  }
  if (nome === 'Lambda') return '\\Lambda';

  return nome;
}

/** Potência/produto de fatores "pequenos" não precisam de parênteses extra. */
function precisaParenteses(no: No): boolean {
  return no.tipo === 'bin' || no.tipo === 'neg';
}

function emitir(no: No): string {
  switch (no.tipo) {
    case 'num':
      return no.valor;

    case 'simbolo':
      return nomeSimboloParaLatex(no.nome);

    case 'neg':
      return `-${envolverSeNecessario(no.valor)}`;

    case 'bin': {
      if (no.op === '/') {
        return `\\frac{${emitir(no.esq)}}{${emitir(no.dir)}}`;
      }
      if (no.op === '+') {
        return `${emitir(no.esq)} + ${emitir(no.dir)}`;
      }
      if (no.op === '-') {
        return `${emitir(no.esq)} - ${envolverSeNecessario(no.dir)}`;
      }
      // multiplicação
      const esq = emitir(no.esq);
      const dir = envolverSeNecessario(no.dir);
      const esqNumerica = no.esq.tipo === 'num';
      const dirComecaComLetra = /^[a-zA-Z\\]/.test(dir);
      if (esqNumerica && dirComecaComLetra) {
        return `${esq}${dir}`;
      }
      return `${esq} \\cdot ${dir}`;
    }

    case 'potencia': {
      const base = envolverSeNecessario(no.base, true);
      return `${base}^{${emitir(no.exp)}}`;
    }

    case 'lista':
      return `\\left[${no.itens.map(emitir).join(',\\ ')}\\right]`;

    case 'chamada':
      return emitirChamada(no);
  }
}

function envolverSeNecessario(no: No, ehBaseDePotencia = false): string {
  const texto = emitir(no);
  if (precisaParenteses(no) || (ehBaseDePotencia && no.tipo === 'chamada' && no.nome === 'sqrt')) {
    return `\\left(${texto}\\right)`;
  }
  return texto;
}

function emitirChamada(no: Extract<No, { tipo: 'chamada' }>): string {
  const { nome, args } = no;

  if (nome === 'sqrt' && args.length === 1) {
    return `\\sqrt{${emitir(args[0])}}`;
  }
  if (nome === 'root' && args.length === 2) {
    return `\\sqrt[${emitir(args[1])}]{${emitir(args[0])}}`;
  }
  if (nome === 'Abs' && args.length === 1) {
    return `\\left|${emitir(args[0])}\\right|`;
  }
  if (nome === 'exp' && args.length === 1) {
    return `e^{${emitir(args[0])}}`;
  }
  if (nome === 'log' && args.length === 1) {
    return `\\ln\\left(${emitir(args[0])}\\right)`;
  }
  if (nome === 'log' && args.length === 2) {
    return `\\log_{${emitir(args[1])}}\\left(${emitir(args[0])}\\right)`;
  }
  if (nome === 'factorial' && args.length === 1) {
    return `${envolverSeNecessario(args[0])}!`;
  }
  if (nome === 'Eq' && args.length === 2) {
    return `${emitir(args[0])} = ${emitir(args[1])}`;
  }
  if (nome === 'Ne' && args.length === 2) {
    return `${emitir(args[0])} \\neq ${emitir(args[1])}`;
  }
  if (nome === 'Rational' && args.length === 2) {
    return `\\frac{${emitir(args[0])}}{${emitir(args[1])}}`;
  }
  if ((nome === 'Min' || nome === 'Max') && args.length >= 1) {
    return `\\${nome.toLowerCase()}\\left(${args.map(emitir).join(',\\ ')}\\right)`;
  }
  if (nome in FUNCOES_SIMPLES) {
    return `${FUNCOES_SIMPLES[nome]}\\left(${args.map(emitir).join(',\\ ')}\\right)`;
  }

  // Função genérica/desconhecida (ex.: função definida pelo usuário): mantém o nome.
  const nomeFormatado = nomeSimboloParaLatex(nome);
  return `\\operatorname{${nomeFormatado}}\\left(${args.map(emitir).join(',\\ ')}\\right)`;
}

function escaparTexto(s: string): string {
  return s.replace(/\\/g, '\\textbackslash{}').replace(/[{}]/g, '\\$&').replace(/_/g, '\\_');
}

/**
 * Converte uma string de saída do SymPy (`str(obj)`) para LaTeX.
 * Nunca lança: em caso de entrada que o parser não reconheça, devolve a
 * string original dentro de `\text{...}` para que ainda apareça algo legível.
 */
export function sympyParaLatex(entrada: string): string {
  const texto = (entrada ?? '').trim();
  if (!texto) return '';
  try {
    const tokens = tokenizar(texto);
    const ast = new Parser(tokens).parse();
    const latex = emitir(ast);
    return latex.trim() ? latex : `\\text{${escaparTexto(texto)}}`;
  } catch {
    return `\\text{${escaparTexto(texto)}}`;
  }
}
