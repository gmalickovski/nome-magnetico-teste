// Chatwoot API client — módulo compartilhado para todo o sistema de suporte.
// NOTA: Nginx remove headers com underscore por padrão; token sempre vai como query param.

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const LABEL_MAP: Record<string, string> = {
  'Bug': 'nm-bug',
  'Sugestão': 'nm-sugestao',
  'Primeiros Passos': 'nm-primeiros-passos',
  'Assinatura e Planos': 'nm-assinaturas-e-planos',
  'Conta e Segurança': 'nm-conta-e-seguranca',
  'Solução de Problemas': 'nm-solucao-de-problemas',
  'Dúvida sobre os planos': 'nm-duvida-sobre-planos',
  'Como funciona a numerologia': 'nm-como-funciona',
  'Informações gerais': 'nm-informacoes-gerais',
  'Parceria ou imprensa': 'nm-parceria',
  'Outros': 'nm-outros',
};

export interface ChatwootConfig {
  token: string;
  accountId: string;
  inboxIdGeral: string;
  inboxIdClientes: string | undefined;
  baseApi: string; // ex: https://suporte.studiomlk.com.br/api/v1
  baseUrl: string; // ex: https://suporte.studiomlk.com.br
}

/** Lê vars de ambiente e retorna config, ou null se faltar algo essencial. */
export function getChatwootConfig(): ChatwootConfig | null {
  const token     = (process.env.CHATWOOT_API_TOKEN ?? '').trim();
  const accountId = (process.env.CHATWOOT_ACCOUNT_ID ?? '').trim();
  const inboxId   = (process.env.CHATWOOT_INBOX_ID ?? '').trim();
  const baseUrl   = (process.env.CHATWOOT_BASE_URL ?? '').trim().replace(/\/$/, '');

  if (!token || !accountId || !inboxId || !baseUrl) {
    console.warn('[chatwoot] Config incompleta — CHATWOOT_API_TOKEN / ACCOUNT_ID / INBOX_ID / BASE_URL');
    return null;
  }

  return {
    token,
    accountId,
    inboxIdGeral:    inboxId,
    inboxIdClientes: (process.env.CHATWOOT_INBOX_ID_CLIENTES ?? '').trim() || undefined,
    baseApi: `${baseUrl}/api/v1`,
    baseUrl,
  };
}

/** Monta URL completa com token como query param (bypass Nginx underscore strip). */
export function cwUrl(cfg: ChatwootConfig, path: string, extra = ''): string {
  return `${cfg.baseApi}${path}?api_access_token=${encodeURIComponent(cfg.token)}${extra}`;
}

/** Busca contato por email ou cria novo. Retorna o contact_id numérico. */
export async function findOrCreateContact(
  cfg: ChatwootConfig,
  email: string,
  name: string,
): Promise<number> {
  // 1. Buscar contato existente
  const searchRes = await fetch(
    cwUrl(cfg, `/accounts/${cfg.accountId}/contacts/search`, `&q=${encodeURIComponent(email)}&include_contacts=true`),
    { headers: JSON_HEADERS },
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    const found = (data?.payload ?? []).find((c: { email: string; id: number }) => c.email === email);
    if (found?.id) return found.id as number;
  }

  // 2. Criar novo contato
  const createRes = await fetch(
    cwUrl(cfg, `/accounts/${cfg.accountId}/contacts`),
    {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, name }),
    },
  );
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`[chatwoot] Criar contato falhou ${createRes.status}: ${JSON.stringify(createData)}`);
  }
  const contactId = createData?.id ?? createData?.payload?.contact?.id;
  if (!contactId) throw new Error('[chatwoot] contact_id ausente no payload de criação');
  return contactId as number;
}

/** Cria conversa e retorna o conversation_id numérico. */
export async function createConversation(
  cfg: ChatwootConfig,
  contactId: number,
  inboxId: string | number,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  additionalAttributes?: Record<string, unknown>,
): Promise<number> {
  const res = await fetch(
    cwUrl(cfg, `/accounts/${cfg.accountId}/conversations`),
    {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        inbox_id: Number(inboxId),
        contact_id: contactId,
        priority,
        ...(additionalAttributes ? { additional_attributes: additionalAttributes } : {}),
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[chatwoot] Criar conversa falhou ${res.status}: ${JSON.stringify(data)}`);
  }
  const convId = data?.id;
  if (!convId) throw new Error('[chatwoot] conversation_id ausente no payload');
  return convId as number;
}

/** Posta mensagem na conversa. Fire-and-forget — erros são apenas logados. */
export async function postMessage(
  cfg: ChatwootConfig,
  conversationId: number,
  content: string,
  messageType: 'incoming' | 'outgoing',
  isPrivate: boolean,
): Promise<void> {
  try {
    const res = await fetch(
      cwUrl(cfg, `/accounts/${cfg.accountId}/conversations/${conversationId}/messages`),
      {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ content, message_type: messageType, private: isPrivate }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`[chatwoot] postMessage falhou ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('[chatwoot] postMessage erro:', err);
  }
}

/** Aplica labels à conversa. Fire-and-forget. */
export function applyLabels(
  cfg: ChatwootConfig,
  conversationId: number,
  labels: string[],
): void {
  if (!labels.length) return;
  fetch(
    cwUrl(cfg, `/accounts/${cfg.accountId}/conversations/${conversationId}/labels`),
    {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ labels }),
    },
  ).catch((err) => console.error('[chatwoot] applyLabels erro:', err));
}

/** Altera status da conversa (open | resolved | pending). Fire-and-forget. */
export function toggleConversationStatus(
  cfg: ChatwootConfig,
  conversationId: number,
  status: 'open' | 'resolved' | 'pending',
): void {
  fetch(
    cwUrl(cfg, `/accounts/${cfg.accountId}/conversations/${conversationId}/toggle_status`),
    {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status }),
    },
  ).catch((err) => console.error('[chatwoot] toggleStatus erro:', err));
}
