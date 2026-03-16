/**
 * Loop Guard — proteção contra loops infinitos de IA.
 * Máx 3 tentativas por análise.
 * Detecta respostas similares (threshold 0.85).
 * Rate limit: 50k tokens por sessão de usuário.
 */

import { supabase } from '../db/supabase';

const MAX_ATTEMPTS = 3;
const SIMILARITY_THRESHOLD = 0.85;
const MAX_TOKENS_PER_SESSION = 50_000;

export interface UsageRecord {
  userId: string | null;
  analysisId: string | null;
  provider: string;
  model: string;
  task: string;
  tokensInput: number;
  tokensOutput: number;
  attemptNumber: number;
  similarToPrevious: boolean;
}

/**
 * Calcula similaridade entre duas strings (algoritmo simples de bigrams).
 */
function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const getBigrams = (str: string): Set<string> => {
    const bigrams = new Set<string>();
    const s = str.toLowerCase().replace(/\s+/g, ' ');
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  };

  const aGrams = getBigrams(a);
  const bGrams = getBigrams(b);

  const intersection = new Set([...aGrams].filter(g => bGrams.has(g)));
  return (2 * intersection.size) / (aGrams.size + bGrams.size);
}

export class LoopGuard {
  private responses: string[] = [];
  private totalTokens = 0;

  /**
   * Verifica se pode fazer mais uma tentativa.
   */
  canAttempt(attemptNumber: number): boolean {
    if (attemptNumber > MAX_ATTEMPTS) {
      throw new Error(`Loop Guard: máximo de ${MAX_ATTEMPTS} tentativas atingido`);
    }
    if (this.totalTokens >= MAX_TOKENS_PER_SESSION) {
      throw new Error(`Loop Guard: limite de ${MAX_TOKENS_PER_SESSION} tokens por sessão atingido`);
    }
    return true;
  }

  /**
   * Registra uma resposta e verifica similaridade com anteriores.
   */
  recordResponse(response: string, tokens: number): boolean {
    this.totalTokens += tokens;

    const isSimilar = this.responses.some(
      prev => calculateSimilarity(prev, response) >= SIMILARITY_THRESHOLD
    );

    this.responses.push(response);

    if (isSimilar) {
      throw new Error('Loop Guard: resposta muito similar à anterior detectada');
    }

    return true;
  }

  get attemptCount(): number {
    return this.responses.length;
  }
}

/**
 * Registra o uso de IA no banco de dados.
 */
export async function logAIUsage(record: UsageRecord): Promise<void> {
  try {
    await supabase
      .schema('nome_magnetico')
      .from('ai_usage')
      .insert({
        user_id: record.userId,
        analysis_id: record.analysisId,
        provider: record.provider,
        model: record.model,
        task: record.task,
        tokens_input: record.tokensInput,
        tokens_output: record.tokensOutput,
        tokens_total: record.tokensInput + record.tokensOutput,
        attempt_number: record.attemptNumber,
        similar_to_previous: record.similarToPrevious,
      });
  } catch (err) {
    console.error('[LoopGuard] Erro ao registrar uso de IA:', err);
  }
}

/**
 * Verifica o total de tokens usados por um usuário na sessão atual (últimas 24h).
 */
export async function getUserTokensToday(userId: string): Promise<number> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('ai_usage')
    .select('tokens_total')
    .eq('user_id', userId)
    .gte('created_at', yesterday);

  if (error) return 0;
  return (data ?? []).reduce((acc: number, row: { tokens_total: number }) => acc + row.tokens_total, 0);
}
