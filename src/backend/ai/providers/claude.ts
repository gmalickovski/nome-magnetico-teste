import Anthropic from '@anthropic-ai/sdk';
import type { AITask } from '../config/models';
import { getModel } from '../config/models';
import { getTaskConfig } from '../config/temperatures';
import type { AIResponse } from './groq';

let claudeClient: Anthropic | null = null;

function getClaudeClient(): Anthropic {
  if (!claudeClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurado');
    claudeClient = new Anthropic({ apiKey });
  }
  return claudeClient;
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  task: AITask
): Promise<AIResponse> {
  const client = getClaudeClient();
  const model = getModel('claude', task);
  const config = getTaskConfig(task);

  const message = await client.messages.create({
    model,
    max_tokens: config.maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: config.temperature,
  });

  const textBlock = message.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude retornou resposta vazia');
  }

  return {
    content: textBlock.text,
    tokensInput: message.usage.input_tokens,
    tokensOutput: message.usage.output_tokens,
  };
}

export async function* streamClaude(
  systemPrompt: string,
  userPrompt: string,
  task: AITask
): AsyncGenerator<string, void, unknown> {
  const client = getClaudeClient();
  const model = getModel('claude', task);
  const config = getTaskConfig(task);

  const stream = client.messages.stream({
    model,
    max_tokens: config.maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: config.temperature,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
