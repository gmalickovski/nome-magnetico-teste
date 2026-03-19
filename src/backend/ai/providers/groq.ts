import Groq from 'groq-sdk';
import type { AITask } from '../config/models';
import { getModel } from '../config/models';
import { getTaskConfig } from '../config/temperatures';

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

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: false,
  });

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

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
