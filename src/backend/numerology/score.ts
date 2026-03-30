/**
 * Score Unificado — fonte única da verdade para todos os produtos.
 *
 * Fórmula determinística:
 *   score = 100
 *     - (bloqueios                  × 15)
 *     - (debitosCarmicoVariaveis    × 12)   ← apenas débitos variáveis (nome pode eliminar)
 *     - (tendenciasOcultas          × 2)
 *     - (licoesCarmicas             × 1)
 *     - penalidade_compat            ← 0 se total/complementar | -5 se aceitável | -15 se incompatível
 *
 * Débitos FIXOS (dia de nascimento + Destino) NÃO penalizam o score porque são
 * imutáveis — nenhuma variação de nome pode eliminá-los. Eles são exibidos ao
 * usuário como informação contextual separada.
 *
 * Para nome_empresa: compatibilidadeSecundaria (destino da empresa) aplica penalidade / 2.
 */

export interface ScoreParams {
  bloqueios: number;
  licoesCarmicas: number;
  tendenciasOcultas: number;
  /** Total de débitos kármicos (para exibição). */
  debitosCarmicos: number;
  /** Débitos que vêm APENAS de dia de nascimento e/ou Destino — não penalizam o score. */
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

  const fixos = p.debitosCarmicoFixos ?? 0;
  const variaveis = Math.max(0, p.debitosCarmicos - fixos);

  score -= p.bloqueios * 15;
  score -= variaveis * 12;
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
 * Se o usuário tem 1 débito fixo → teto = 100.
 * (Débitos fixos não penalizam o score — são excluídos da fórmula.)
 */
export function calcularScoreTeto(_debitosFixos: number): number {
  // Com a nova lógica, débitos fixos não penalizam o score.
  // O teto é sempre 100 — mas chamamos esta função para comunicar ao usuário
  // quantos débitos permanentes ele carrega independente do nome.
  return 100;
}
