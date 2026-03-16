/**
 * Lógica específica do produto Nome do Bebê.
 *
 * Fluxo:
 * 1. Calcular número de Destino do bebê pela data de nascimento (real ou prevista).
 * 2. Para cada nome candidato + sobrenome da família:
 *    - Calcular os 4 triângulos
 *    - Verificar sequências negativas
 *    - Calcular compatibilidade Expressão × Destino
 *    - Verificar lições cármicas
 * 3. Rankear por score total.
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import type { LicaoCarmica, TendenciaOculta } from '../karmic';
import type { Bloqueio } from '../triangle';

export interface AnaliseNomeBebe {
  nomeCompleto: string;    // ex: "Sofia Alves"
  primeiroNome: string;
  expressao: number;
  motivacao: number;
  missao: number;
  destino: number;
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  compatibilidade: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  score: number;
  justificativa: string[];
}

export interface ResultadoNomeBebe {
  sobrenomeFamilia: string;
  dataNascimento: string;
  destino: number;
  nomesCandidatos: AnaliseNomeBebe[];
  melhorNome: AnaliseNomeBebe | null;
}

/**
 * Analisa um nome candidato para bebê.
 */
export function analisarNomeBebe(
  primeiroNome: string,
  sobrenomeFamilia: string,
  dataNascimento: string
): AnaliseNomeBebe {
  const nomeCompleto = `${primeiroNome} ${sobrenomeFamilia}`.trim();
  const todos = calcularTodosTriangulos(nomeCompleto, dataNascimento);
  const bloqueios = detectarBloqueios(todos);
  const sequencias = todasSequenciasNegativas(todos);
  const expressao = calcularExpressao(nomeCompleto);
  const motivacao = calcularMotivacao(nomeCompleto);
  const missao = calcularMissao(nomeCompleto);
  const destino = calcularDestino(dataNascimento);
  const licoes = detectarLicoesCarmicas(nomeCompleto);
  const tendencias = detectarTendenciasOcultas(nomeCompleto);
  const compatibilidade = avaliarCompatibilidade(expressao, destino);

  let score = 100;
  const justificativa: string[] = [];

  // Penalidade por bloqueios
  if (bloqueios.length === 0) {
    score += 15;
    justificativa.push('✓ Sem bloqueios em nenhum dos 4 triângulos');
  } else {
    score -= bloqueios.length * 20;
    justificativa.push(`✗ ${bloqueios.length} bloqueio(s): ${bloqueios.map(b => b.codigo).join(', ')}`);
  }

  // Bônus por compatibilidade Expressão × Destino
  switch (compatibilidade) {
    case 'total':
      score += 20;
      justificativa.push(`✓ Expressão (${expressao}) totalmente harmônica com Destino (${destino})`);
      break;
    case 'complementar':
      score += 12;
      justificativa.push(`✓ Expressão (${expressao}) complementar ao Destino (${destino})`);
      break;
    case 'aceitavel':
      score += 5;
      justificativa.push(`~ Expressão (${expressao}) aceitável para o Destino (${destino})`);
      break;
    case 'incompativel':
      score -= 10;
      justificativa.push(`✗ Expressão (${expressao}) pouco compatível com Destino (${destino})`);
      break;
  }

  // Penalidade por lições cármicas em excesso
  if (licoes.length > 3) {
    score -= (licoes.length - 3) * 5;
    justificativa.push(`~ ${licoes.length} lições cármicas — muitos aprendizados simultâneos`);
  } else if (licoes.length === 0) {
    score += 5;
    justificativa.push('✓ Sem lições cármicas — energia completa neste nome');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    nomeCompleto,
    primeiroNome,
    expressao,
    motivacao,
    missao,
    destino,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    licoesCarmicas: licoes,
    tendenciasOcultas: tendencias,
    compatibilidade,
    score,
    justificativa,
  };
}

/**
 * Analisa múltiplos nomes candidatos e retorna ranqueados.
 */
export function analisarNomesBebe(
  nomesCandidatos: string[],
  sobrenomeFamilia: string,
  dataNascimento: string
): ResultadoNomeBebe {
  const destino = calcularDestino(dataNascimento);

  const analises = nomesCandidatos
    .filter(n => n.trim().length >= 2)
    .map(n => analisarNomeBebe(n.trim(), sobrenomeFamilia, dataNascimento))
    .sort((a, b) => b.score - a.score);

  return {
    sobrenomeFamilia,
    dataNascimento,
    destino,
    nomesCandidatos: analises,
    melhorNome: analises[0] ?? null,
  };
}
