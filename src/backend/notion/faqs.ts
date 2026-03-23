import type {
  BlockObjectResponse,
  RichTextItemResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { getNotionClient } from './client';
import { cacheGet, cacheSet } from './cache';

export interface FaqItem {
  id: string;
  pergunta: string;
  categoria: string;
  ordem: number;
  answerHtml: string;
}

const CACHE_KEY = 'faqs';

// -------------------------------------------------------
// Rich text → HTML
// -------------------------------------------------------
function richTextToHtml(richText: RichTextItemResponse[]): string {
  return richText
    .map(rt => {
      let text = rt.plain_text;
      // Escape HTML entities
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (rt.annotations.code) text = `<code>${text}</code>`;
      if (rt.annotations.bold) text = `<strong>${text}</strong>`;
      if (rt.annotations.italic) text = `<em>${text}</em>`;
      if (rt.type === 'text' && rt.text.link?.url) {
        text = `<a href="${rt.text.link.url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    })
    .join('');
}

// -------------------------------------------------------
// Blocks → HTML (state machine for lists)
// -------------------------------------------------------
export function blocksToHtml(blocks: BlockObjectResponse[]): string {
  const parts: string[] = [];
  let listBuffer: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listBuffer.length === 0) return;
    const tag = currentListType === 'ol' ? 'ol' : 'ul';
    parts.push(`<${tag}>${listBuffer.join('')}</${tag}>`);
    listBuffer = [];
    currentListType = null;
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'bulleted_list_item': {
        if (currentListType !== 'ul') {
          flushList();
          currentListType = 'ul';
        }
        listBuffer.push(`<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`);
        break;
      }
      case 'numbered_list_item': {
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        listBuffer.push(`<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`);
        break;
      }
      default: {
        flushList();
        switch (block.type) {
          case 'paragraph': {
            const html = richTextToHtml(block.paragraph.rich_text);
            if (html) parts.push(`<p>${html}</p>`);
            break;
          }
          case 'heading_2': {
            parts.push(`<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`);
            break;
          }
          case 'heading_3': {
            parts.push(`<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`);
            break;
          }
        }
      }
    }
  }
  flushList();
  return parts.join('\n');
}

// -------------------------------------------------------
// Fetch from Notion (v5: dataSources.query)
// -------------------------------------------------------
async function fetchFaqsFromNotion(): Promise<FaqItem[]> {
  const notion = getNotionClient();
  const dbId = process.env.NOTION_FAQ_DB_ID;

  if (!dbId) throw new Error('NOTION_FAQ_DB_ID não configurado');

  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: 'Publicado',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Ordem', direction: 'ascending' }],
  });

  const items: FaqItem[] = [];

  for (const page of response.results) {
    if (page.object !== 'page') continue;
    const props = (page as PageObjectResponse).properties;

    const pergunta: string =
      (props.Pergunta as any)?.title?.[0]?.plain_text ?? '';
    const categoria: string =
      (props.Categoria as any)?.select?.name ?? '';
    const ordem: number =
      (props.Ordem as any)?.number ?? 0;

    // Busca os blocks da página para a resposta
    const blocksResponse = await notion.blocks.children.list({
      block_id: page.id,
    });

    const answerHtml = blocksToHtml(
      blocksResponse.results.filter(
        (b): b is BlockObjectResponse => b.object === 'block' && 'type' in b
      )
    );

    items.push({ id: page.id, pergunta, categoria, ordem, answerHtml });
  }

  return items;
}

// -------------------------------------------------------
// Pública: usa cache
// -------------------------------------------------------
export async function getFaqs(): Promise<FaqItem[]> {
  const cached = cacheGet<FaqItem[]>(CACHE_KEY);
  if (cached) return cached;

  const items = await fetchFaqsFromNotion();
  cacheSet(CACHE_KEY, items);
  return items;
}
