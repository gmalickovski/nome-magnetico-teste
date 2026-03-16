/**
 * Sistema de notificações via n8n + Resend.
 * NUNCA enviar email diretamente — sempre via este módulo.
 */

type NotificationEvent =
  | 'user.welcome'
  | 'user.password_reset'
  | 'user.analysis_complete'
  | 'payment.confirmed'
  | 'payment.failed'
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
  [key: string]: unknown;
}

/**
 * Envia um evento de notificação para o n8n.
 * O n8n processa e aciona o Resend para envio do email.
 */
export async function notify(
  event: NotificationEvent,
  payload: NotificationPayload
): Promise<void> {
  const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
  const webhookSecret = import.meta.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.warn('[notify] N8N_WEBHOOK_URL não configurado — notificação ignorada');
    return;
  }

  try {
    const response = await fetch(`${webhookUrl}/nome-magnetico-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { 'X-Webhook-Secret': webhookSecret } : {}),
      },
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
    // Não bloquear o fluxo principal por falha de notificação
    console.error(`[notify] Erro ao enviar evento ${event}:`, err);
  }
}
