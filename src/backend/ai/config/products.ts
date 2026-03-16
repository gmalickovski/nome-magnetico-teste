import type { ProductType } from '../../payments/stripe';
import type { AITask } from './models';

export interface ProductAIConfig {
  tasks: AITask[];
  systemPromptKey: string;
}

export const PRODUCT_AI_CONFIG: Record<ProductType, ProductAIConfig> = {
  nome_magnetico: {
    tasks: ['analysis', 'suggestions', 'guide'],
    systemPromptKey: 'kabbalistic',
  },
  nome_bebe: {
    tasks: ['analysis', 'suggestions'],
    systemPromptKey: 'kabbalistic',
  },
  nome_empresa: {
    tasks: ['analysis', 'suggestions'],
    systemPromptKey: 'kabbalistic',
  },
};
