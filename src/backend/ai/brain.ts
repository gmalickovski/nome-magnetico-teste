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
import { buildBabyAnalysisPrompt, type BabyPromptParams } from './prompts/baby-prompt';
import { buildCompanyAnalysisPrompt, type CompanyPromptParams } from './prompts/company-prompt';
import { getModel } from './config/models';
import { getArquetipo } from '../numerology/archetypes';

// ================================================================
// HELPER INTERNO
// ================================================================

async function runWithGuard(
  buildPrompt: () => string,
  task: 'analysis' | 'suggestions' | 'guide',
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const guard = new LoopGuard();
  const provider = await getActiveProvider(task);
  const model = getModel(provider, task);

  for (let attempt = 1; attempt <= 3; attempt++) {
    guard.canAttempt(attempt);

    try {
      const userPrompt = buildPrompt();
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

      // Groq atingiu limite diário → fallback automático para OpenAI
      if (message === 'GROQ_RATE_LIMITED' && provider === 'groq') {
        console.warn('[Brain] Groq rate limited — fallback automático para OpenAI');
        try {
          const userPrompt = buildPrompt();
          const fallback = await callAI(SYSTEM_KABBALISTIC, userPrompt, task, 'openai');
          guard.recordResponse(fallback.content, fallback.tokensInput + fallback.tokensOutput);
          await logAIUsage({
            userId,
            analysisId,
            provider: 'openai',
            model: getModel('openai', task),
            task,
            tokensInput: fallback.tokensInput,
            tokensOutput: fallback.tokensOutput,
            attemptNumber: attempt,
            similarToPrevious: false,
          });
          return fallback.content;
        } catch {
          throw new Error('QUOTA_EXCEEDED');
        }
      }

      if (message.includes('Loop Guard')) throw err;
      console.warn(`[Brain] Tentativa ${attempt} falhou: ${message}`);
      if (attempt === 3) throw new Error(`${task} falhou após 3 tentativas: ${message}`);
    }
  }

  throw new Error(`Brain: ${task} não concluído`);
}

// ================================================================
// NOME MAGNÉTICO PESSOAL
// ================================================================

/**
 * Gera a análise numerológica completa (sem streaming).
 */
export async function generateAnalysis(
  params: AnalysisPromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const paramsWithArquetipo = {
    ...params,
    arquetipo: getArquetipo(params.cincoNumeros.expressao),
  };
  return runWithGuard(() => buildAnalysisPrompt(paramsWithArquetipo), 'analysis', userId, analysisId);
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
  return runWithGuard(() => buildSuggestionsPrompt(params), 'suggestions', userId, analysisId);
}

/**
 * Gera o guia de implementação do nome magnético.
 */
export async function generateGuide(
  params: GuidePromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  return runWithGuard(() => buildGuidePrompt(params), 'guide', userId, analysisId);
}

// ================================================================
// NOME DO BEBÊ
// ================================================================

/**
 * Gera análise IA para seleção de nome de bebê.
 */
export async function generateBabyAnalysis(
  params: BabyPromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const expressaoBebe = params.resultado.melhorNome?.expressao ?? params.resultado.destino;
  const paramsWithArquetipo = {
    ...params,
    arquetipo: getArquetipo(expressaoBebe),
  };
  return runWithGuard(() => buildBabyAnalysisPrompt(paramsWithArquetipo), 'analysis', userId, analysisId);
}

// ================================================================
// NOME DE EMPRESA
// ================================================================

/**
 * Gera análise IA para seleção de nome empresarial.
 */
export async function generateCompanyAnalysis(
  params: CompanyPromptParams,
  userId: string | null,
  analysisId: string | null
): Promise<string> {
  const expressaoEmpresa = params.resultado.melhorNome?.expressao;
  const paramsWithArquetipo = expressaoEmpresa
    ? { ...params, arquetipo: getArquetipo(expressaoEmpresa) }
    : params;
  return runWithGuard(() => buildCompanyAnalysisPrompt(paramsWithArquetipo), 'analysis', userId, analysisId);
}
