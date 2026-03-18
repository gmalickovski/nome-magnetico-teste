/**
 * Triângulos Numerológicos Cabalísticos.
 *
 * São quatro triângulos, cada um revelando uma dimensão diferente da vida:
 *
 * 1. Triângulo da Vida (Básico)  — aspectos gerais da vida
 * 2. Triângulo Pessoal           — vida íntima e reações internas
 * 3. Triângulo Social            — influências externas
 * 4. Triângulo do Destino        — eventuais resultados e previsões
 *
 * Montagem de cada triângulo:
 * - Linha base: valor de cada letra somado com um modificador (varia por triângulo)
 *   e REDUZIDO a 1 dígito para entrada na estrutura.
 * - Próximas linhas: soma reduzida dos pares adjacentes até restar 1 número = Arcano Regente.
 * - Arcanos Dominantes: concatenação dos pares da linha base (ex: 3 e 5 → 35).
 * - Sequências Negativas: 3 ou mais dígitos iguais consecutivos em qualquer linha.
 */

import { calcularValor, reduzirNumero } from './core';

// ================================================================
// TIPOS
// ================================================================

export interface Triangulo {
  tipo: 'vida' | 'pessoal' | 'social' | 'destino';
  linhas: number[][];
  arcanoRegente: number | null;
  arcanosDoMinantes: number[];
  sequenciasNegativas: string[];
}

export interface TodosTriangulos {
  vida: Triangulo;
  pessoal: Triangulo;
  social: Triangulo;
  destino: Triangulo;
}

export interface Bloqueio {
  codigo: string;
  titulo: string;
  descricao: string;
  aspectoSaude: string;
  triangulos: Array<'vida' | 'pessoal' | 'social' | 'destino'>;
}

// ================================================================
// MAPA DE BLOQUEIOS (sequências negativas)
// ================================================================
export const BLOQUEIOS_MAP: Record<
  string,
  { titulo: string; descricao: string; aspectoSaude: string }
> = {
  '111': {
    titulo: 'Bloqueio de Iniciação (111)',
    descricao:
      'Limitação da força de vontade, perda de coragem e inatividade. Tendência à dependência e dificuldade em iniciar projetos e afirmar a individualidade. O antídoto é desenvolver a coragem, a autonomia e a confiança no próprio potencial de liderança.',
    aspectoSaude:
      'Tendência a distúrbios cardíacos e circulatórios. Atenção à saúde do coração.',
  },
  '222': {
    titulo: 'Bloqueio de Associação (222)',
    descricao:
      'Timidez, indecisão e tendência a ser subjugado pelos outros. Dificuldades em parcerias e relacionamentos, com perda de autoestima. O antídoto é cultivar a diplomacia, a paciência e o equilíbrio entre dar e receber.',
    aspectoSaude:
      'Propensão a doenças que gerem dependência física ou emocional. Atenção ao sistema imunológico.',
  },
  '333': {
    titulo: 'Bloqueio de Expressão (333)',
    descricao:
      'Dificuldade no diálogo e em se comunicar com clareza. Tendência a ser incompreendido e a ter dificuldades em se impor nas relações. O antídoto é focar na criatividade, na expressão autêntica e no otimismo.',
    aspectoSaude:
      'Tendência a doenças respiratórias (pulmões, brônquios) ou de articulações.',
  },
  '444': {
    titulo: 'Bloqueio de Estruturação (444)',
    descricao:
      'Dificuldade na realização profissional, tendência a ser mal remunerado e a não receber reconhecimento pelo trabalho. Pode haver rigidez ou desorganização. O antídoto é disciplina, método e persistência.',
    aspectoSaude:
      'Tendência a doenças reumáticas, arteriais ou ósseas.',
  },
  '555': {
    titulo: 'Bloqueio de Liberdade (555)',
    descricao:
      'Mudanças não desejadas na vida (casa, profissão, relações sociais), altos e baixos constantes e inconstância profissional. Tendência à libertinagem no uso da liberdade. O antídoto é equilíbrio, versatilidade com sabedoria e compromisso.',
    aspectoSaude:
      'Tendência à libertinagem com reflexos na saúde geral. Cuidado com vícios e excesses.',
  },
  '666': {
    titulo: 'Bloqueio de Harmonia (666)',
    descricao:
      'Necessidade excessiva de harmonia que leva à dificuldade com responsabilidades. Tendência a ser explorado pelos outros ou a explorar. Ciúme e possessividade. O antídoto é o amor equilibrado e as responsabilidades conscientes.',
    aspectoSaude:
      'Tendência a doenças hormonais e do sistema endócrino.',
  },
  '777': {
    titulo: 'Bloqueio de Conexão Espiritual (777)',
    descricao:
      'Tendência ao isolamento e à introspecção excessiva. Dificuldade em colocar ideias em prática e de se conectar com o mundo exterior. Ceticismo que bloqueia a intuição. O antídoto é o equilíbrio entre introspecção e ação no mundo.',
    aspectoSaude:
      'Introspecção excessiva com reflexo no sistema nervoso. Atenção à saúde mental e ao equilíbrio emocional.',
  },
  '888': {
    titulo: 'Bloqueio de Poder e Abundância (888)',
    descricao:
      'Luta constante pelos bens materiais e dificuldades financeiras recorrentes. Ambição desmedida ou, no extremo oposto, medo do sucesso material. O antídoto é justiça, equilíbrio entre material e espiritual e uso ético do poder.',
    aspectoSaude:
      'Tendência a doenças renais ou gástricas. Atenção ao sistema digestivo e urinário.',
  },
  '999': {
    titulo: 'Bloqueio de Compaixão Universal (999)',
    descricao:
      'Finalização de ciclos de forma lenta ou forçada, com dificuldades de desapego. Risco de perdas materiais ou espirituais. Tendência a guardar rancores. O antídoto é o desapego consciente, o perdão e a abertura para novos começos.',
    aspectoSaude:
      'Risco de perdas e desgaste físico durante períodos de transição. Atenção à saúde geral em fases de encerramento de ciclos.',
  },
};

// ================================================================
// MONTAGEM DOS TRIÂNGULOS
// ================================================================

/**
 * Constrói um triângulo a partir de uma linha base já calculada.
 */
function construirTriangulo(
  tipo: Triangulo['tipo'],
  linhaBase: number[]
): Triangulo {
  const linhas: number[][] = [linhaBase];

  // Arcanos dominantes: concatenação dos pares da linha base
  const arcanosDoMinantes: number[] = [];
  for (let k = 0; k < linhaBase.length - 1; k++) {
    arcanosDoMinantes.push(parseInt(`${linhaBase[k]}${linhaBase[k + 1]}`));
  }

  // Construir triângulo reduzindo pares
  let linhaAtual = linhaBase;
  while (linhaAtual.length > 1) {
    const proxima: number[] = [];
    for (let j = 0; j < linhaAtual.length - 1; j++) {
      proxima.push(reduzirNumero(linhaAtual[j]! + linhaAtual[j + 1]!, false));
    }
    linhas.push(proxima);
    linhaAtual = proxima;
  }

  // Detectar sequências negativas em todas as linhas
  const sequenciasSet = new Set<string>();
  for (const linha of linhas) {
    const s = linha.join('');
    const matches = s.match(/(\d)\1{2,}/g) ?? [];
    matches.forEach(m => sequenciasSet.add(m));
  }

  return {
    tipo,
    linhas,
    arcanoRegente: linhaAtual[0] ?? null,
    arcanosDoMinantes: [...new Set(arcanosDoMinantes)],
    sequenciasNegativas: Array.from(sequenciasSet),
  };
}

// ----------------------------------------------------------------
// 1. Triângulo da Vida (Básico) — só o valor de cada letra (sem pré-redução)
// ----------------------------------------------------------------
export function calcularTrianguloVida(nome: string): Triangulo {
  const nomeLimpo = nome.replace(/\s+/g, '').toUpperCase();
  if (!nomeLimpo) return construirTriangulo('vida', []);

  // Usa calcularValor direto (sem reduzir), igual ao formula.js e n8n
  // Filtra letras sem valor (espaços remanescentes, pontuação)
  const linhaBase = nomeLimpo
    .split('')
    .map(l => calcularValor(l))
    .filter(v => v > 0);
  return construirTriangulo('vida', linhaBase);
}

// ----------------------------------------------------------------
// 2. Triângulo Pessoal — letra + dia de nascimento (reduzido)
// ----------------------------------------------------------------
export function calcularTrianguloPessoal(nome: string, dataNascimento: string): Triangulo {
  const nomeLimpo = nome.replace(/\s+/g, '').toUpperCase();
  if (!nomeLimpo) return construirTriangulo('pessoal', []);

  // Extrair dia da data DD/MM/AAAA
  const partes = dataNascimento.replace(/\D/g, '');
  const dia = parseInt(partes.slice(0, 2));
  const diaReduzido = reduzirNumero(dia, false);

  const linhaBase = nomeLimpo
    .split('')
    .map(l => calcularValor(l))
    .filter(v => v > 0)
    .map(v => reduzirNumero(v + diaReduzido, false));

  return construirTriangulo('pessoal', linhaBase);
}

// ----------------------------------------------------------------
// 3. Triângulo Social — letra + mês de nascimento (reduzido)
// ----------------------------------------------------------------
export function calcularTrianguloSocial(nome: string, dataNascimento: string): Triangulo {
  const nomeLimpo = nome.replace(/\s+/g, '').toUpperCase();
  if (!nomeLimpo) return construirTriangulo('social', []);

  const partes = dataNascimento.replace(/\D/g, '');
  const mes = parseInt(partes.slice(2, 4));
  const mesReduzido = reduzirNumero(mes, false);

  const linhaBase = nomeLimpo
    .split('')
    .map(l => calcularValor(l))
    .filter(v => v > 0)
    .map(v => reduzirNumero(v + mesReduzido, false));

  return construirTriangulo('social', linhaBase);
}

// ----------------------------------------------------------------
// 4. Triângulo do Destino — letra + (dia + mês reduzidos)
// ----------------------------------------------------------------
export function calcularTrianguloDestino(nome: string, dataNascimento: string): Triangulo {
  const nomeLimpo = nome.replace(/\s+/g, '').toUpperCase();
  if (!nomeLimpo) return construirTriangulo('destino', []);

  const partes = dataNascimento.replace(/\D/g, '');
  const dia = parseInt(partes.slice(0, 2));
  const mes = parseInt(partes.slice(2, 4));
  const modificador = reduzirNumero(
    reduzirNumero(dia, false) + reduzirNumero(mes, false),
    false
  );

  const linhaBase = nomeLimpo
    .split('')
    .map(l => calcularValor(l))
    .filter(v => v > 0)
    .map(v => reduzirNumero(v + modificador, false));

  return construirTriangulo('destino', linhaBase);
}

// ----------------------------------------------------------------
// Calcular todos os 4 triângulos de uma vez
// ----------------------------------------------------------------
export function calcularTodosTriangulos(
  nome: string,
  dataNascimento: string
): TodosTriangulos {
  return {
    vida: calcularTrianguloVida(nome),
    pessoal: calcularTrianguloPessoal(nome, dataNascimento),
    social: calcularTrianguloSocial(nome, dataNascimento),
    destino: calcularTrianguloDestino(nome, dataNascimento),
  };
}

// ================================================================
// DETECÇÃO DE BLOQUEIOS
// ================================================================

/**
 * Detecta todos os bloqueios presentes em um ou mais triângulos.
 * Consolida bloqueios duplicados informando em quais triângulos aparecem.
 */
export function detectarBloqueios(
  triangulos: Partial<TodosTriangulos>
): Bloqueio[] {
  // Mapear codigo → { bloqueio, triangulos[] }
  const mapa = new Map<string, Bloqueio>();

  for (const [tipoKey, triangulo] of Object.entries(triangulos)) {
    const tipo = tipoKey as Triangulo['tipo'];
    if (!triangulo) continue;

    for (const seq of triangulo.sequenciasNegativas) {
      // Normalizar para 3 dígitos (111, 222, etc.) — pegar os primeiros 3 dígitos repetidos
      const codigo = seq.charAt(0).repeat(3);
      const dados = BLOQUEIOS_MAP[codigo];
      if (!dados) continue;

      if (mapa.has(codigo)) {
        mapa.get(codigo)!.triangulos.push(tipo);
      } else {
        mapa.set(codigo, {
          codigo,
          titulo: dados.titulo,
          descricao: dados.descricao,
          aspectoSaude: dados.aspectoSaude,
          triangulos: [tipo],
        });
      }
    }
  }

  return Array.from(mapa.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
}

/**
 * Retorna as sequências negativas de todos os triângulos consolidadas.
 */
export function todasSequenciasNegativas(todos: TodosTriangulos): string[] {
  const set = new Set<string>();
  for (const t of Object.values(todos)) {
    for (const s of t.sequenciasNegativas) {
      set.add(s.charAt(0).repeat(3));
    }
  }
  return Array.from(set).sort();
}

// Re-export legacy para compatibilidade com código existente
export { calcularTrianguloVida as calcularTrianguloDaVida };
