import { Client } from '@notionhq/client';

let _client: Client | null = null;

/**
 * Singleton do Notion Client — server-side only.
 * NUNCA usar em componentes React ou browser.
 */
export function getNotionClient(): Client {
  if (_client) return _client;

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error('NOTION_TOKEN não configurado');
  }

  _client = new Client({ auth: token });
  return _client;
}
