/**
 * Sistema de notificações via n8n.
 * NUNCA enviar email diretamente — sempre via este módulo.
 *
 * Roteamento:
 *   marketing.* → N8N_WEBHOOK_MARKETING
 *   demais eventos → N8N_WEBHOOK_TRANSACIONAL
 */

type NotificationEvent =
  | 'user.welcome'
  | 'user.password_reset'
  | 'user.analysis_complete'
  | 'marketing.free_analysis_completed'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'subscription.expiring_soon'
  | 'subscription.expired'
  | 'admin.new_user'
  | 'admin.new_payment'
  | 'payment.refunded';

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
  const isMarketing = event.startsWith('marketing.');
  const webhookUrl = isMarketing
    ? process.env.N8N_WEBHOOK_MARKETING
    : process.env.N8N_WEBHOOK_TRANSACIONAL;

  if (!webhookUrl) {
    const envName = isMarketing ? 'N8N_WEBHOOK_MARKETING' : 'N8N_WEBHOOK_TRANSACIONAL';
    console.warn(`[notify] ${envName} não configurado — notificação ignorada`);
    return;
  }

  await sendToWebhook(webhookUrl, event, payload);
}
