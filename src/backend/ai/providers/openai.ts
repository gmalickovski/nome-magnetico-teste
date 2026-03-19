import OpenAI from 'openai';
import type { AITask } from '../config/models';
import { getModel } from '../config/models';
import { getTaskConfig } from '../config/temperatures';
import type { AIResponse } from './groq';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY não configurado');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  task: AITask
): Promise<AIResponse> {
  const client = getOpenAIClient();
  const model = getModel('openai', task);
  const config = getTaskConfig(task);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  });

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error('OpenAI retornou resposta vazia');
  }

  return {
    content: choice.message.content,
    tokensInput: completion.usage?.prompt_tokens ?? 0,
    tokensOutput: completion.usage?.completion_tokens ?? 0,
  };
}

export async function* streamOpenAI(
  systemPrompt: string,
  userPrompt: string,
  task: AITask
): AsyncGenerator<string, void, unknown> {
  const client = getOpenAIClient();
  const model = getModel('openai', task);
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
