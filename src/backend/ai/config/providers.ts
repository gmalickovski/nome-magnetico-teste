/**
 * Configuração de provedores de IA.
 * Padrão: Groq (gratuito e rápido).
 * Override via variável AI_DEFAULT_PROVIDER ou via painel /admin/ia (tabela ai_config).
 */

export type AIProvider = 'groq' | 'claude' | 'openai';

export function getDefaultProvider(): AIProvider {
  const override = process.env.AI_DEFAULT_PROVIDER as AIProvider | undefined;
  if (override && ['groq', 'claude', 'openai'].includes(override)) return override;
  return 'groq';
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  groq: 'Groq (Llama)',
  claude: 'Claude (Anthropic)',
  openai: 'OpenAI (GPT)',
};
