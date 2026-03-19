/**
 * Sistema de notificações via n8n + Resend.
 * NUNCA enviar email diretamente — sempre via este módulo.
 *
 * Roteamento:
 *   eventos support.* → N8N_WEBHOOK_SUPORTE
 *   todos os outros   → N8N_WEBHOOK_TRANSACIONAL
 */

type NotificationEvent =
  | 'user.welcome'
  | 'user.password_reset'
  | 'user.analysis_complete'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'subscription.expiring_soon'
  | 'subscription.expired'
  | 'support.ticket_created'
  | 'support.ticket_reply'
  | 'admin.new_user'
  | 'admin.new_payment';

interface NotificationPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  accessUrl?: string;
  resetUrl?: string;
  analysisId?: string;
  analysisUrl?: string;
  amount?: number;
  productName?: string;
  ticketId?: string;
  ticketSubject?: string;
  daysLeft?: number;
  renewUrl?: string;
  userId?: string;
  productType?: string;
  nome?: string;
  assunto?: string;
  mensagem?: string;
  tipo_dispositivo?: string;
  versao_app?: string;
  user_id?: string;
  [key: string]: unknown;
}

async function sendToWebhook(url: string, event: NotificationEvent, payload: NotificationPayload): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error(`[notify] Falha ao enviar evento ${event}: ${response.status}`);
    }
  } catch (err) {
    console.error(`[notify] Erro ao enviar evento ${event}:`, err);
  }
}

/**
 * Envia um evento de notificação para o n8n.
 * O n8n processa e aciona o Resend para envio do email.
 */
export async function notify(
  event: NotificationEvent,
  payload: NotificationPayload
): Promise<void> {
  const isSupport = event.startsWith('support.');
  const webhookUrl = isSupport
    ? process.env.N8N_WEBHOOK_SUPORTE
    : process.env.N8N_WEBHOOK_TRANSACIONAL;

  if (!webhookUrl) {
    const varName = isSupport ? 'N8N_WEBHOOK_SUPORTE' : 'N8N_WEBHOOK_TRANSACIONAL';
    console.warn(`[notify] ${varName} não configurado — notificação ignorada`);
    return;
  }

  await sendToWebhook(webhookUrl, event, payload);
}
