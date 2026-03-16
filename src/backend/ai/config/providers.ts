/**
 * Configuração de provedores de IA.
 * development → Groq (gratuito)
 * production  → Claude (Anthropic)
 */

export type AIProvider = 'groq' | 'claude' | 'openai';

export function getDefaultProvider(): AIProvider {
  const env = import.meta.env.APP_ENV ?? 'development';
  return env === 'production' ? 'claude' : 'groq';
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  groq: 'Groq (Llama)',
  claude: 'Claude (Anthropic)',
  openai: 'OpenAI (GPT)',
};
