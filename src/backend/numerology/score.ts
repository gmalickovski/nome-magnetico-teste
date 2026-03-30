/**
 * Score Unificado — fonte única da verdade para todos os produtos.
 *
 * Fórmula determinística:
 *   score = 100
 *     - (bloqueios            × 15)
 *     - (debitosCarmicos      × 12)   ← TODOS os débitos penalizam (fixos + variáveis)
 *     - (tendenciasOcultas    × 2)
 *     - (licoesCarmicas       × 1)
 *     - penalidade_compat      ← 0 se total/complementar | -5 se aceitável | -15 se incompatível
 *
 * Débitos FIXOS (dia de nascimento + Destino) também penalizam o score, pois
 * refletem a realidade kármica permanente da pessoa. O score máximo atingível
 * por qualquer nome = calcularScoreTeto(debitosFixos).
 * `debitosCarmicoFixos` em ScoreParams é mantido para que a UI possa mostrar o teto.
 *
 * Para nome_empresa: compatibilidadeSecundaria (destino da empresa) aplica penalidade / 2.
 */

export interface ScoreParams {
  bloqueios: number;
  licoesCarmicas: number;
  tendenciasOcultas: number;
  /** Total de débitos kármicos (para exibição). */
  debitosCarmicos: number;
  /** Débitos que vêm APENAS de dia de nascimento e/ou Destino (imutáveis). Usado para calcular o scoreTeto. */
  debitosCarmicoFixos?: number;
  compatibilidade: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  /** Usado apenas no produto nome_empresa (destino da empresa). */
  compatibilidadeSecundaria?: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
}

const COMPAT_PENALTY: Record<string, number> = {
  total: 0,
  complementar: 0,
  aceitavel: -5,
  incompativel: -15,
};

export function calcularScore(p: ScoreParams): number {
  let score = 100;

  score -= p.bloqueios * 15;
  score -= p.debitosCarmicos * 12; // todos os débitos penalizam (fixos + variáveis)
  score -= p.tendenciasOcultas * 2;
  score -= p.licoesCarmicas * 1;
  score += COMPAT_PENALTY[p.compatibilidade] ?? -15;

  if (p.compatibilidadeSecundaria !== undefined) {
    score += Math.round((COMPAT_PENALTY[p.compatibilidadeSecundaria] ?? -15) / 2);
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Retorna o score máximo possível para uma pessoa, considerando seus
 * débitos kármicos fixos (imutáveis pela data de nascimento).
 *
 * O teto representa o melhor score que qualquer nome pode atingir para esta
 * pessoa — mesmo com o nome perfeito (sem bloqueios, sem débitos variáveis,
 * compatibilidade total), os débitos fixos já estão "embutidos" no teto.
 *
 * Exemplos:
 *   0 débitos fixos → teto = 100
 *   1 débito fixo   → teto = 88
 *   2 débitos fixos → teto = 76
 */
export function calcularScoreTeto(debitosFixos: number): number {
  return Math.max(0, 100 - debitosFixos * 12);
}
