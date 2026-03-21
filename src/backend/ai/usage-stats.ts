/**
 * Helpers para calcular estatísticas de uso e custo da IA a partir da tabela ai_usage.
 */

import { supabase } from '../db/supabase';

// Tabela de preços por modelo (USD por 1M tokens)
const PRICE_TABLE: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant':    { input: 0.05, output: 0.08 },
  'mixtral-8x7b-32768':      { input: 0.24, output: 0.24 },
  'gpt-4o':                  { input: 2.50, output: 10.00 },
  'gpt-4o-mini':             { input: 0.15, output: 0.60 },
  'gpt-4-turbo':             { input: 10.00, output: 30.00 },
  'claude-sonnet-4-6':       { input: 3.00, output: 15.00 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
  'claude-opus-4-6':         { input: 15.00, output: 75.00 },
};

function estimateCost(model: string, tokensInput: number, tokensOutput: number): number {
  const prices = PRICE_TABLE[model];
  if (!prices) return 0;
  return (tokensInput / 1_000_000) * prices.input + (tokensOutput / 1_000_000) * prices.output;
}

export interface MonthlyUsageStats {
  totalRequests: number;
  totalTokens: number;
  estimatedCostUsd: number;
  avgCostPerRequest: number;
  byProvider: Array<{
    provider: string;
    requests: number;
    tokensInput: number;
    tokensOutput: number;
    estimatedCostUsd: number;
  }>;
}

export async function getMonthlyUsageStats(): Promise<MonthlyUsageStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: rows, error } = await supabase
    
    .from('ai_usage')
    .select('provider, model, tokens_input, tokens_output, tokens_total')
    .gte('created_at', startOfMonth);

  if (error || !rows) {
    return { totalRequests: 0, totalTokens: 0, estimatedCostUsd: 0, avgCostPerRequest: 0, byProvider: [] };
  }

  let totalRequests = rows.length;
  let totalTokens = 0;
  let totalCost = 0;

  const providerMap = new Map<string, { requests: number; tokensInput: number; tokensOutput: number; cost: number }>();

  for (const row of rows) {
    const input = row.tokens_input ?? 0;
    const output = row.tokens_output ?? 0;
    const total = row.tokens_total ?? (input + output);
    const cost = estimateCost(row.model ?? '', input, output);

    totalTokens += total;
    totalCost += cost;

    const key = row.provider ?? 'unknown';
    const existing = providerMap.get(key) ?? { requests: 0, tokensInput: 0, tokensOutput: 0, cost: 0 };
    providerMap.set(key, {
      requests: existing.requests + 1,
      tokensInput: existing.tokensInput + input,
      tokensOutput: existing.tokensOutput + output,
      cost: existing.cost + cost,
    });
  }

  const byProvider = Array.from(providerMap.entries()).map(([provider, stats]) => ({
    provider,
    requests: stats.requests,
    tokensInput: stats.tokensInput,
    tokensOutput: stats.tokensOutput,
    estimatedCostUsd: stats.cost,
  }));

  return {
    totalRequests,
    totalTokens,
    estimatedCostUsd: totalCost,
    avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
    byProvider,
  };
}
