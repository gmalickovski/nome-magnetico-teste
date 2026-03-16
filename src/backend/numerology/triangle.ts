/**
 * Triângulo da Vida — cálculo e detecção de bloqueios.
 * Portado do index.html original.
 */

import { calcularValor, reduzirNumero } from './core';

export interface TrianguloDaVida {
  linhasTriangulo: number[][];
  arcanos: number[];
  arcanoRegente: number | null;
  sequencias: string[];
}

export interface Bloqueio {
  codigo: string; // ex: '111'
  titulo: string;
  descricao: string;
}

// Mapa de bloqueios por sequência
export const BLOQUEIOS_MAP: Record<string, { titulo: string; descricao: string }> = {
  '111': {
    titulo: 'Bloqueio de Iniciação (111)',
    descricao:
      'Indica dificuldade em iniciar projetos e afirmar sua individualidade. Pode haver uma tendência à dependência ou à falta de confiança. O antídoto é desenvolver a coragem, a autonomia e acreditar no seu potencial de liderança.',
  },
  '222': {
    titulo: 'Bloqueio de Associação (222)',
    descricao:
      'Reflete desafios em parcerias e relacionamentos. Pode haver sensibilidade excessiva, timidez ou dificuldade em cooperar. O antídoto é cultivar a diplomacia, a paciência e buscar o equilíbrio entre dar e receber.',
  },
  '333': {
    titulo: 'Bloqueio de Expressão (333)',
    descricao:
      'Aponta para uma dificuldade em comunicar seus sentimentos e ideias. Pode levar à superficialidade ou à dispersão de energia. O antídoto é focar na sua criatividade, expressar-se com autenticidade e otimismo.',
  },
  '444': {
    titulo: 'Bloqueio de Estruturação (444)',
    descricao:
      'Indica dificuldades no trabalho e na disciplina, com consequências na vida material. Pode haver rigidez ou desorganização. O antídoto é desenvolver métodos, ter foco, disciplina e ser persistente em seus objetivos.',
  },
  '555': {
    titulo: 'Bloqueio de Liberdade (555)',
    descricao:
      'Sinaliza um uso inadequado da liberdade, podendo levar à impulsividade, irresponsabilidade ou excessos. O antídoto é buscar o equilíbrio, usar sua versatilidade com sabedoria e canalizar sua energia para mudanças construtivas.',
  },
  '666': {
    titulo: 'Bloqueio de Harmonia (666)',
    descricao:
      'Mostra desafios nos âmbitos familiar e social. Pode haver uma tendência a ser controlador, ciumento ou a se anular pelos outros. O antídoto é praticar o amor com equilíbrio, assumir responsabilidades sem sacrifício excessivo e buscar a harmonia interna.',
  },
  '777': {
    titulo: 'Bloqueio de Conexão Espiritual (777)',
    descricao:
      'Indica uma tendência ao isolamento, ao ceticismo excessivo ou à dificuldade em confiar na sua intuição e fé. O antídoto é buscar o autoconhecimento, meditar e equilibrar a razão com a espiritualidade.',
  },
  '888': {
    titulo: 'Bloqueio de Poder e Abundância (888)',
    descricao:
      'Reflete dificuldades em lidar com dinheiro, poder e autoridade. Pode levar à ganância ou, no extremo oposto, ao medo do sucesso material. O antídoto é buscar a justiça, o equilíbrio entre o material e o espiritual e usar seu poder para o bem comum.',
  },
  '999': {
    titulo: 'Bloqueio de Compaixão Universal (999)',
    descricao:
      'Aponta para dificuldades em praticar o desapego, o perdão e a compaixão. Pode haver uma tendência ao egoísmo ou a guardar ressentimentos. O antídoto é desenvolver a generosidade, a empatia e compreender que o fim de um ciclo é o começo de outro.',
  },
};

/**
 * Calcula o Triângulo da Vida a partir do nome completo.
 */
export function calcularTrianguloDaVida(nome: string): TrianguloDaVida {
  const nomeLimpo = nome.replace(/\s+/g, '').toUpperCase();

  if (!nomeLimpo) {
    return { linhasTriangulo: [], arcanos: [], arcanoRegente: null, sequencias: [] };
  }

  // Linha base: valor de cada letra
  let linhaAtual = nomeLimpo.split('').map(l => calcularValor(l));

  // Arcanos: concatenação dos pares da linha base
  const arcanos: number[] = [];
  for (let k = 0; k < linhaAtual.length - 1; k++) {
    arcanos.push(parseInt(`${linhaAtual[k]}${linhaAtual[k + 1]}`));
  }

  // Construir triângulo reduzindo pares
  const linhasTriangulo: number[][] = [linhaAtual];

  while (linhaAtual.length > 1) {
    const proximaLinha: number[] = [];
    for (let j = 0; j < linhaAtual.length - 1; j++) {
      proximaLinha.push(reduzirNumero(linhaAtual[j] + linhaAtual[j + 1]));
    }
    linhasTriangulo.push(proximaLinha);
    linhaAtual = proximaLinha;
  }

  // Detectar sequências de bloqueio (3+ dígitos iguais consecutivos)
  const sequenciasSet = new Set<string>();
  linhasTriangulo.forEach(linha => {
    const linhaStr = linha.join('');
    const matches = linhaStr.match(/(\d)\1{2,}/g) ?? [];
    matches.forEach(m => sequenciasSet.add(m));
  });

  return {
    linhasTriangulo,
    arcanos: [...new Set(arcanos)],
    arcanoRegente: linhaAtual[0] ?? null,
    sequencias: Array.from(sequenciasSet),
  };
}

/**
 * Detecta e retorna os bloqueios encontrados com título e descrição.
 */
export function detectarBloqueios(sequencias: string[]): Bloqueio[] {
  return sequencias
    .filter(seq => seq in BLOQUEIOS_MAP)
    .map(seq => ({
      codigo: seq,
      titulo: BLOQUEIOS_MAP[seq]!.titulo,
      descricao: BLOQUEIOS_MAP[seq]!.descricao,
    }));
}
