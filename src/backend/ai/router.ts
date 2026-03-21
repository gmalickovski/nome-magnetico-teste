/**
 * Router de IA — direciona para o provedor correto baseado na config.
 * Suporta override via ai_config do banco.
 */

import { getDefaultProvider, type AIProvider } from './config/providers';
import type { AITask } from './config/models';
import { callGroq, streamGroq } from './providers/groq';
import { callClaude, streamClaude } from './providers/claude';
import { callOpenAI, streamOpenAI } from './providers/openai';
import { supabase } from '../db/supabase';
import type { AIResponse } from './providers/groq';

/**
 * Busca a configuração de provedor do banco (admin pode sobrescrever).
 */
async function getProviderFromDB(task: AITask): Promise<AIProvider | null> {
  try {
    const { data } = await supabase
      
      .from('ai_config')
      .select('provider')
      .eq('task', task)
      .eq('is_active', true)
      .single();

    return (data?.provider as AIProvider) ?? null;
  } catch {
    return null;
  }
}

/**
 * Retorna o provedor ativo para a tarefa.
 * Prioridade: banco de dados > variável de ambiente > padrão por APP_ENV.
 */
export async function getActiveProvider(task: AITask): Promise<AIProvider> {
  const dbProvider = await getProviderFromDB(task);
  if (dbProvider) return dbProvider;
  return getDefaultProvider();
}

/**
 * Chama a IA com o provedor correto (sem streaming).
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  task: AITask,
  providerOverride?: AIProvider
): Promise<AIResponse> {
  const provider = providerOverride ?? (await getActiveProvider(task));

  switch (provider) {
    case 'groq':
      return callGroq(systemPrompt, userPrompt, task);
    case 'claude':
      return callClaude(systemPrompt, userPrompt, task);
    case 'openai':
      return callOpenAI(systemPrompt, userPrompt, task);
    default:
      throw new Error(`Provedor de IA desconhecido: ${provider}`);
  }
}

/**
 * Chama a IA com streaming.
 */
export async function* streamAI(
  systemPrompt: string,
  userPrompt: string,
  task: AITask,
  providerOverride?: AIProvider
): AsyncGenerator<string, void, unknown> {
  const provider = providerOverride ?? (await getActiveProvider(task));

  switch (provider) {
    case 'groq':
      yield* streamGroq(systemPrompt, userPrompt, task);
      break;
    case 'claude':
      yield* streamClaude(systemPrompt, userPrompt, task);
      break;
    case 'openai':
      yield* streamOpenAI(systemPrompt, userPrompt, task);
      break;
    default:
      throw new Error(`Provedor de IA desconhecido: ${provider}`);
  }
}
