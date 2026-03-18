/**
 * Harmonização Numerológica de Nome / Assinatura.
 *
 * Procedimento formal baseado no curso de numerologia cabalística:
 * 1. Detectar sequências negativas em todos os 4 triângulos.
 * 2. Definir um número de Expressão compatível com o número de Destino.
 * 3. Gerar variações do nome que eliminem os bloqueios E tenham
 *    Expressão compatível com o Destino.
 * 4. Avaliar critérios objetivos da assinatura.
 *
 * Compatibilidade Expressão × Destino:
 * - Harmonia total: mesma vibração após redução
 * - Harmonia complementar: números que se somam formando o Destino
 * - Aceitável: diferença de 1 na vibração final
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from './triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao } from './numbers';
import { reduzirNumero, calcularValor, extrairLetras } from './core';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from './karmic';
import { calcularScore } from './score';
import type { Bloqueio } from './triangle';

export interface AvaliacaoNome {
  nome: string;
  expressao: number;
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  compatibilidadeDestino: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  score: number; // 0–100
  justificativa: string[];
}

export interface ResultadoHarmonizacao {
  nomeOriginal: string;
  expressaoOriginal: number;
  destino: number;
  bloqueiosOriginais: Bloqueio[];
  sequenciasOriginais: string[];
  sugestoes: AvaliacaoNome[];
  criteriosAssinatura: CriteriosAssinatura;
}

export interface CriteriosAssinatura {
  deveSerLegivel: string;
  inclinacao: string;
  semTracosNegativos: string;
  esteticaGeral: string;
}

// Critérios objetivos da assinatura (método não-radiestésico)
export const CRITERIOS_ASSINATURA: CriteriosAssinatura = {
  deveSerLegivel:
    'A assinatura deve ser totalmente legível, permitindo identificar claramente o nome. Assinaturas ilegíveis criam uma "máscara" energética que dificulta a manifestação da identidade.',
  inclinacao:
    'A inclinação ideal é levemente ascendente (da esquerda para a direita), simbolizando progresso e evolução. Inclinações descendentes indicam tendência à resignação.',
  semTracosNegativos:
    'Evitar traços que cortam as letras (especialmente o "t" cruzado de forma agressiva), pontos excessivos e sublinhos que criam barreiras energéticas no nome.',
  esteticaGeral:
    'A assinatura deve ser esteticamente equilibrada, sem excessos de ornamentos ou compressão das letras. O espaçamento entre as letras reflete a abertura para as oportunidades.',
};

// ================================================================
// AVALIAÇÃO DE COMPATIBILIDADE
// ================================================================

/**
 * Avalia a compatibilidade entre o número de Expressão e o de Destino.
 */
export function avaliarCompatibilidade(
  expressao: number,
  destino: number
): 'total' | 'complementar' | 'aceitavel' | 'incompativel' {
  const expR = reduzirNumero(expressao, false);
  const destR = reduzirNumero(destino, false);

  if (expR === destR) return 'total';

  // Complementares: somam 9 ou formam 11/22
  const soma = expR + destR;
  if (soma === 9 || soma === 11 || soma === 22) return 'complementar';

  // Aceitável: diferença de 1
  if (Math.abs(expR - destR) === 1) return 'aceitavel';

  return 'incompativel';
}

// ================================================================
// SCORE DE UM NOME
// ================================================================

/**
 * Calcula o score de uma variação de nome (0–100).
 */
export function avaliarNome(
  nomeCompleto: string,
  dataNascimento: string
): AvaliacaoNome {
  const todos = calcularTodosTriangulos(nomeCompleto, dataNascimento);
  const bloqueios = detectarBloqueios(todos);
  const sequencias = todasSequenciasNegativas(todos);
  const expressao = calcularExpressao(nomeCompleto);
  const destino = calcularDestino(dataNascimento);
  const compatibilidade = avaliarCompatibilidade(expressao, destino);

  const motivacao = calcularMotivacao(nomeCompleto);
  const licoesCarmicas = detectarLicoesCarmicas(nomeCompleto);
  const tendenciasOcultas = detectarTendenciasOcultas(nomeCompleto);
  const debitosCarmicos = calcularDebitosCarmicos(dataNascimento, destino, motivacao, expressao);

  const score = calcularScore({
    bloqueios: bloqueios.length,
    licoesCarmicas: licoesCarmicas.length,
    tendenciasOcultas: tendenciasOcultas.length,
    debitosCarmicos: debitosCarmicos.length,
    compatibilidade,
  });

  const justificativa: string[] = [];

  if (bloqueios.length === 0) {
    justificativa.push('✓ Sem sequências negativas em nenhum triângulo');
  } else {
    justificativa.push(
      `✗ ${bloqueios.length} bloqueio(s) detectado(s): ${bloqueios.map(b => b.codigo).join(', ')}`
    );
    for (const b of bloqueios) {
      justificativa.push(`  • ${b.titulo} → aparece em: ${b.triangulos.join(', ')}`);
    }
  }

  switch (compatibilidade) {
    case 'total':
      justificativa.push(`✓ Expressão (${expressao}) totalmente compatível com Destino (${destino})`);
      break;
    case 'complementar':
      justificativa.push(`✓ Expressão (${expressao}) complementar ao Destino (${destino})`);
      break;
    case 'aceitavel':
      justificativa.push(`~ Expressão (${expressao}) aceitável em relação ao Destino (${destino})`);
      break;
    case 'incompativel':
      justificativa.push(`✗ Expressão (${expressao}) pouco compatível com Destino (${destino})`);
      break;
  }

  return {
    nome: nomeCompleto,
    expressao,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    compatibilidadeDestino: compatibilidade,
    score,
    justificativa,
  };
}

// ================================================================
// GERAÇÃO DE VARIAÇÕES
// ================================================================

/**
 * Gera variações do nome usando técnicas de harmonização cabalística:
 * - Adição/remoção de letras
 * - Substituição de acentos (modifica o valor numérico)
 * - Variações do primeiro nome mantendo os sobrenomes
 * - Abreviações e hipocorísticos
 */
function gerarCandidatos(nomeCompleto: string): string[] {
  const partes = nomeCompleto.trim().split(/\s+/);
  const primeiroNome = partes[0]!;
  const sobrenomes = partes.slice(1).join(' ');
  const candidatos = new Set<string>();

  // 1. Variações por acento (modifica valor)
  const varAcento: [RegExp, string][] = [
    [/a/gi, 'á'], [/a/gi, 'â'], [/a/gi, 'ã'],
    [/e/gi, 'é'], [/e/gi, 'ê'],
    [/i/gi, 'í'],
    [/o/gi, 'ó'], [/o/gi, 'ô'], [/o/gi, 'õ'],
    [/u/gi, 'ú'],
    [/c/gi, 'ç'],
  ];

  for (const [pat, rep] of varAcento) {
    const novo = primeiroNome.replace(pat, rep);
    if (novo !== primeiroNome) {
      candidatos.add([novo, sobrenomes].filter(Boolean).join(' '));
    }
  }

  // 2. Adição de letra no final
  const finais = ['a', 'e', 'i', 'o', 'u', 'na', 'ia', 'ela', 'ara', 'ão'];
  for (const f of finais) {
    const base = primeiroNome.replace(/[aeiou]$/i, '');
    if (base.length >= 2) {
      const novo = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + f;
      candidatos.add([novo, sobrenomes].filter(Boolean).join(' '));
    }
  }

  // 3. Usar nome do meio como primeiro
  if (partes.length >= 3) {
    const nomeMeio = partes[1]!;
    const resto = partes.slice(2).join(' ');
    candidatos.add([nomeMeio, resto].filter(Boolean).join(' '));
    // Nome do meio + primeiro nome
    candidatos.add([nomeMeio, primeiroNome, resto].filter(Boolean).join(' '));
  }

  // 4. Adicionar "Maria" ou "Ana" ou "João" como complemento
  const prefixosFemininos = ['Maria', 'Ana', 'Luíza', 'Clara'];
  const prefixosMasculinos = ['João', 'José', 'Carlos', 'Pedro'];
  [...prefixosFemininos, ...prefixosMasculinos].forEach(p => {
    candidatos.add([p, nomeCompleto].filter(Boolean).join(' '));
    candidatos.add([primeiroNome, p, sobrenomes].filter(Boolean).join(' '));
  });

  // 5. Remoção de letra duplicada / simplificação
  const simplificado = primeiroNome
    .replace(/(.)\1+/g, '$1') // remove letras duplicadas consecutivas
    .replace(/ph/gi, 'f')
    .replace(/th/gi, 't')
    .replace(/ck/gi, 'c');
  if (simplificado !== primeiroNome) {
    const capitalizado = simplificado.charAt(0).toUpperCase() + simplificado.slice(1).toLowerCase();
    candidatos.add([capitalizado, sobrenomes].filter(Boolean).join(' '));
  }

  // Remover o nome original da lista
  candidatos.delete(nomeCompleto);

  return Array.from(candidatos).filter(c => c.trim().length >= 3);
}

// ================================================================
// HARMONIZAÇÃO COMPLETA
// ================================================================

/**
 * Executa o procedimento completo de harmonização do nome.
 * Retorna a análise do nome original + sugestões harmonizadas, ranqueadas.
 */
export function harmonizarNome(
  nomeCompleto: string,
  dataNascimento: string,
  quantidadeSugestoes = 5
): ResultadoHarmonizacao {
  const todos = calcularTodosTriangulos(nomeCompleto, dataNascimento);
  const bloqueiosOriginais = detectarBloqueios(todos);
  const sequenciasOriginais = todasSequenciasNegativas(todos);
  const expressaoOriginal = calcularExpressao(nomeCompleto);
  const destino = calcularDestino(dataNascimento);

  const candidatos = gerarCandidatos(nomeCompleto);

  const sugestoes = candidatos
    .map(c => avaliarNome(c, dataNascimento))
    .filter(a => !a.temBloqueio) // priorizar sem bloqueios
    .sort((a, b) => b.score - a.score)
    .slice(0, quantidadeSugestoes);

  // Se não houver sugestões sem bloqueio, incluir as melhores com menos bloqueios
  if (sugestoes.length < quantidadeSugestoes) {
    const comBloqueio = candidatos
      .map(c => avaliarNome(c, dataNascimento))
      .filter(a => a.temBloqueio)
      .sort((a, b) => b.score - a.score)
      .slice(0, quantidadeSugestoes - sugestoes.length);
    sugestoes.push(...comBloqueio);
  }

  return {
    nomeOriginal: nomeCompleto,
    expressaoOriginal,
    destino,
    bloqueiosOriginais,
    sequenciasOriginais,
    sugestoes,
    criteriosAssinatura: CRITERIOS_ASSINATURA,
  };
}
