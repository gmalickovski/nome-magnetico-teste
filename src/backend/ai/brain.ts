/**
 * Brain — orquestra todas as chamadas de IA com Loop Guard.
 * Ponto central de entrada para análises de IA.
 */

import { LoopGuard, logAIUsage } from './loop-guard';
import { callAI, streamAI, getActiveProvider } from './router';
import { SYSTEM_KABBALISTIC } from './prompts/system-kabbalistic';
import { buildAnalysisPrompt, type AnalysisPromptParams } from './prompts/analysis-prompt';
import { buildSuggestionsPrompt, type SuggestionsPromptParams } from './prompts/suggestions-prompt';
import { buildGuidePrompt, type GuidePromptParams } from './prompts/guide-prompt';
import { getModel } from './config/models';

/**
 * Gera a análise numerológica completa (sem streaming).
 */
export async function generateAnalysis(
  params: AnalysisPromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const guard = new LoopGuard();
  const task = 'analysis';
  const provider = await getActiveProvider(task);
  const model = getModel(provider, task);

  for (let attempt = 1; attempt <= 3; attempt++) {
    guard.canAttempt(attempt);

    try {
      const userPrompt = buildAnalysisPrompt(params);
      const response = await callAI(SYSTEM_KABBALISTIC, userPrompt, task, provider);

      guard.recordResponse(response.content, response.tokensInput + response.tokensOutput);

      await logAIUsage({
        userId,
        analysisId,
        provider,
        model,
        task,
        tokensInput: response.tokensInput,
        tokensOutput: response.tokensOutput,
        attemptNumber: attempt,
        similarToPrevious: false,
      });

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('Loop Guard')) throw err;

      console.warn(`[Brain] Tentativa ${attempt} falhou: ${message}`);

      if (attempt === 3) throw new Error(`Análise falhou após 3 tentativas: ${message}`);
    }
  }

  throw new Error('Brain: análise não concluída');
}

/**
 * Gera a análise com streaming (Server-Sent Events).
 */
export async function* streamAnalysis(
  params: AnalysisPromptParams,
  userId: string | null,
  analysisId: string | null
): AsyncGenerator<string, void, unknown> {
  const guard = new LoopGuard();
  const task = 'analysis';
  const provider = await getActiveProvider(task);

  guard.canAttempt(1);

  const userPrompt = buildAnalysisPrompt(params);
  let fullContent = '';

  for await (const chunk of streamAI(SYSTEM_KABBALISTIC, userPrompt, task, provider)) {
    fullContent += chunk;
    yield chunk;
  }

  guard.recordResponse(fullContent, Math.ceil(fullContent.length / 4));

  await logAIUsage({
    userId,
    analysisId,
    provider,
    model: getModel(provider, task),
    task,
    tokensInput: 0,
    tokensOutput: Math.ceil(fullContent.length / 4),
    attemptNumber: 1,
    similarToPrevious: false,
  });
}

/**
 * Gera sugestões de nomes magnéticos.
 */
export async function generateSuggestions(
  params: SuggestionsPromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const guard = new LoopGuard();
  const task = 'suggestions';
  const provider = await getActiveProvider(task);
  const model = getModel(provider, task);

  for (let attempt = 1; attempt <= 3; attempt++) {
    guard.canAttempt(attempt);

    try {
      const userPrompt = buildSuggestionsPrompt(params);
      const response = await callAI(SYSTEM_KABBALISTIC, userPrompt, task, provider);

      guard.recordResponse(response.content, response.tokensInput + response.tokensOutput);

      await logAIUsage({
        userId,
        analysisId,
        provider,
        model,
        task,
        tokensInput: response.tokensInput,
        tokensOutput: response.tokensOutput,
        attemptNumber: attempt,
        similarToPrevious: false,
      });

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Loop Guard')) throw err;
      if (attempt === 3) throw new Error(`Sugestões falharam após 3 tentativas: ${message}`);
    }
  }

  throw new Error('Brain: sugestões não concluídas');
}

/**
 * Gera o guia de implementação do nome magnético.
 */
export async function generateGuide(
  params: GuidePromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const guard = new LoopGuard();
  const task = 'guide';
  const provider = await getActiveProvider(task);
  const model = getModel(provider, task);

  for (let attempt = 1; attempt <= 3; attempt++) {
    guard.canAttempt(attempt);

    try {
      const userPrompt = buildGuidePrompt(params);
      const response = await callAI(SYSTEM_KABBALISTIC, userPrompt, task, provider);

      guard.recordResponse(response.content, response.tokensInput + response.tokensOutput);

      await logAIUsage({
        userId,
        analysisId,
        provider,
        model,
        task,
        tokensInput: response.tokensInput,
        tokensOutput: response.tokensOutput,
        attemptNumber: attempt,
        similarToPrevious: false,
      });

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Loop Guard')) throw err;
      if (attempt === 3) throw new Error(`Guia falhou após 3 tentativas: ${message}`);
    }
  }

  throw new Error('Brain: guia não concluído');
}
