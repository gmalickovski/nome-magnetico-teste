/**
 * Sistema de notificações via n8n.
 * NUNCA enviar email diretamente — sempre via este módulo.
 *
 * Roteamento:
 *   todos os eventos → N8N_WEBHOOK_TRANSACIONAL
 */

type NotificationEvent =
  | 'user.welcome'
  | 'user.password_reset'
  | 'user.analysis_complete'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'subscription.expiring_soon'
  | 'subscription.expired'
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
  daysLeft?: number;
  renewUrl?: string;
  userId?: string;
  productType?: string;
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
  const webhookUrl = process.env.N8N_WEBHOOK_TRANSACIONAL;

  if (!webhookUrl) {
    console.warn('[notify] N8N_WEBHOOK_TRANSACIONAL não configurado — notificação ignorada');
    return;
  }

  await sendToWebhook(webhookUrl, event, payload);
}
