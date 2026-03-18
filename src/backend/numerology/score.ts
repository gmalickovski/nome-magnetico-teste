/**
 * Score Unificado — fonte única da verdade para todos os produtos.
 *
 * Fórmula determinística:
 *   score = 100
 *     - (bloqueios         × 15)
 *     - (debitosCarmicos   × 12)
 *     - (tendenciasOcultas × 2)
 *     - (licoesCarmicas    × 1)
 *     - penalidade_compat   ← 0 se total/complementar | -5 se aceitável | -15 se incompatível
 *
 * Para nome_empresa: compatibilidadeSecundaria (destino da empresa) aplica penalidade / 2.
 *
 * Score 100 SOMENTE se: zero bloqueios + zero débitos + zero tendências + zero lições + compat. total/complementar.
 */

export interface ScoreParams {
  bloqueios: number;
  licoesCarmicas: number;
  tendenciasOcultas: number;
  debitosCarmicos: number;
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
  score -= p.debitosCarmicos * 12;
  score -= p.tendenciasOcultas * 2;
  score -= p.licoesCarmicas * 1;
  score += COMPAT_PENALTY[p.compatibilidade] ?? -15;

  if (p.compatibilidadeSecundaria !== undefined) {
    score += Math.round((COMPAT_PENALTY[p.compatibilidadeSecundaria] ?? -15) / 2);
  }

  return Math.max(0, Math.min(100, score));
}
