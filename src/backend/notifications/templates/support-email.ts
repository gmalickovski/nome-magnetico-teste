/**
 * Templates de e-mail de suporte — estilo limpo/natural (fundo branco, assinatura estilizada).
 * Usados como referência para os Code nodes do workflow N8N.
 */

export interface SupportEmailData {
  nome: string;
  assunto: string;
  corpo?: string;
}

/** Assinatura padrão em HTML — usada em todos os emails de suporte */
export function buildSignatureHtml(): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e8e8e8;padding-top:20px;">
      <tr>
        <td>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:#b8942a;letter-spacing:2px;">NOME MAGNÉTICO</div>
          <div style="font-family:Arial,sans-serif;font-size:10px;color:#aaa;letter-spacing:2px;margin-top:2px;text-transform:uppercase;">Numerologia Cabalística</div>
          <div style="margin-top:8px;font-family:Arial,sans-serif;font-size:12px;color:#888;">
            <a href="https://nomemagnetico.com.br" style="color:#b8942a;text-decoration:none;">nomemagnetico.com.br</a>
            &nbsp;·&nbsp;
            <a href="mailto:suporte@studiomlk.com.br" style="color:#888;text-decoration:none;">suporte@studiomlk.com.br</a>
          </div>
        </td>
      </tr>
    </table>
  `.trim();
}

/** Email wrapper — fundo branco, max-width 560px */
function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr><td style="padding:32px 36px;">
          ${content}
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#bbb;font-family:Arial,sans-serif;">© 2026 Nome Magnético · Studio MLK</p>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Confirmação de recebimento do ticket */
export function buildTicketCreatedEmail({ nome, assunto }: SupportEmailData): string {
  const content = `
    <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.6;">Olá, <strong>${nome}</strong>!</p>
    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">Recebemos sua mensagem e nossa equipe irá respondê-la em breve.</p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:6px;margin-bottom:20px;">
      <tr>
        <td style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Assunto</td>
      </tr>
      <tr>
        <td style="font-size:14px;font-weight:600;color:#333;">${assunto}</td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.7;">Você receberá uma resposta neste e-mail em até <strong style="color:#555;">24 horas úteis</strong>.</p>
    ${buildSignatureHtml()}
  `;
  return wrapEmail(content);
}

/** Resposta do agente (texto já polido pela IA) */
export function buildTicketReplyEmail({ nome, assunto, corpo = '' }: SupportEmailData): string {
  const textoHtml = corpo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const content = `
    <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.7;">${textoHtml}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#aaa;">Em caso de dúvidas, <a href="https://nomemagnetico.com.br/app/suporte" style="color:#b8942a;text-decoration:none;">abra um novo ticket</a>.</p>
    ${buildSignatureHtml()}
  `;
  return wrapEmail(content);
}

/** Notificação de ticket resolvido */
export function buildTicketResolvedEmail({ nome, assunto }: SupportEmailData): string {
  const content = `
    <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.6;">Olá, <strong>${nome}</strong>!</p>
    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">Seu ticket de suporte foi marcado como resolvido.</p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:6px;margin-bottom:20px;">
      <tr>
        <td style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Assunto</td>
      </tr>
      <tr>
        <td style="font-size:14px;font-weight:600;color:#333;">${assunto}</td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.7;">Se o problema persistir ou tiver novas dúvidas, <a href="https://nomemagnetico.com.br/app/suporte" style="color:#b8942a;text-decoration:none;">abra um novo ticket</a>. Ficamos felizes em ajudar.</p>
    ${buildSignatureHtml()}
  `;
  return wrapEmail(content);
}
