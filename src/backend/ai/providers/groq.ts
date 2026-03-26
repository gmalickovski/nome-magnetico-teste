import Groq from 'groq-sdk';
import type { AITask } from '../config/models';
import { getModel } from '../config/models';
import { getTaskConfig } from '../config/temperatures';

function isRateLimit(err: unknown): boolean {
  if (err instanceof Groq.APIError && err.status === 429) return true;
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  return msg.includes('rate_limit') || msg.includes('rate limit') || msg.includes('quota');
}

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY não configurado');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export interface AIResponse {
  content: string;
  tokensInput: number;
  tokensOutput: number;
}

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  task: AITask,
  stream = false
): Promise<AIResponse> {
  const client = getGroqClient();
  const model = getModel('groq', task);
  const config = getTaskConfig(task);

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    });
  } catch (err) {
    if (isRateLimit(err)) throw new Error('GROQ_RATE_LIMITED');
    throw err;
  }

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error('Groq retornou resposta vazia');
  }

  return {
    content: choice.message.content,
    tokensInput: completion.usage?.prompt_tokens ?? 0,
    tokensOutput: completion.usage?.completion_tokens ?? 0,
  };
}

export async function* streamGroq(
  systemPrompt: string,
  userPrompt: string,
  task: AITask
): AsyncGenerator<string, void, unknown> {
  const client = getGroqClient();
  const model = getModel('groq', task);
  const config = getTaskConfig(task);

  let stream;
  try {
    stream = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    });
  } catch (err) {
    if (isRateLimit(err)) throw new Error('GROQ_RATE_LIMITED');
    throw err;
  }

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
