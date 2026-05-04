# Email Templates — Nome Magnético

Templates HTML para emails transacionais. O envio atual deve usar Amazon SES.

## Arquitetura

```
Código (notify.ts) → n8n webhook → n8n workflow → Amazon SES → usuário
```

- **Webhook transacional**: `N8N_WEBHOOK_TRANSACIONAL` — todos os eventos exceto `support.*`
- **Webhook suporte**: `N8N_WEBHOOK_SUPORTE` — apenas eventos `support.*`

## Payload recebido pelo n8n

```json
{
  "event": "nome.do.evento",
  "payload": { "...campos específicos..." },
  "timestamp": "2026-03-18T09:00:00.000Z"
}
```

## Templates e eventos

| Arquivo | Evento | Placeholders |
|---------|--------|-------------|
| `welcome.html` | `user.welcome` | `{{firstName}}` |
| `password-reset.html` | `user.password_reset` | `{{resetUrl}}` |
| `payment-confirmed.html` | `payment.confirmed` | `{{firstName}}`, `{{productName}}`, `{{accessUrl}}` |
| `payment-failed.html` | `payment.failed` | `{{firstName}}` |
| `subscription-expiring.html` | `subscription.expiring_soon` | `{{firstName}}`, `{{daysLeft}}`, `{{renewUrl}}` |
| `subscription-expired.html` | `subscription.expired` | `{{firstName}}`, `{{renewUrl}}` |
| `analysis-complete.html` | `user.analysis_complete` | `{{firstName}}`, `{{analysisUrl}}` |
| `support-confirmation.html` | `support.ticket_created` | `{{nome}}`, `{{assunto}}` |

## Como usar no n8n

### Workflow transacional (events-nm)

1. **Webhook Trigger** — recebe POST com `event` e `payload`
2. **Switch node** — roteia por `{{ $json.event }}`
3. Para cada rota: **Set node** para extrair campos do `payload`, depois **Send Email node** (Resend) com o HTML do template

### Substituição de variáveis no node de email

No campo "Email Body (HTML)", cole o conteúdo do template e use expressões n8n:

```
{{ $('Set').item.json.firstName }}
```

Substitua cada `{{placeholder}}` pela expressão correspondente.

### Configurar assunto por evento

| Evento | Sugestão de assunto |
|--------|-------------------|
| `user.welcome` | Bem-vindo ao Nome Magnético ✨ |
| `user.password_reset` | Redefinição de senha |
| `payment.confirmed` | Pagamento confirmado — acesso liberado ✅ |
| `payment.failed` | Problema no seu pagamento ⚠️ |
| `subscription.expiring_soon` (7d) | Seu acesso expira em 7 dias |
| `subscription.expiring_soon` (1d) | Último dia — renove seu acesso hoje! |
| `subscription.expired` | Seu acesso expirou — renove agora |
| `user.analysis_complete` | Sua análise numerológica está pronta 🌟 |
| `support.ticket_created` | Recebemos sua mensagem 📬 |

### Diferenciação 7d vs 1d em subscription.expiring_soon

Use um **IF node** após o Switch para verificar `{{ $json.payload.daysLeft }}`:
- `daysLeft == 7` → assunto informativo, banner gold
- `daysLeft == 1` → assunto urgente, banner vermelho (ajuste a cor no template)

## Endpoint de expiração (automação diária)

Configurar no n8n:
1. **Schedule Trigger** — todo dia às 09:00
2. **HTTP Request** — `POST https://seusite.com.br/api/internal/notify-expiring`
   - Header: `X-Internal-Secret: <valor de INTERNAL_API_SECRET>`
3. Retorna: `{ sent: N, groups: { expiring7d: N, expiring1d: N, expired: N } }`

## Variáveis de ambiente necessárias

```bash
N8N_WEBHOOK_TRANSACIONAL=https://n8n.seudominio.com.br/events-nm
N8N_WEBHOOK_SUPORTE=https://n8n.seudominio.com.br/suport-nm
INTERNAL_API_SECRET=<uuid-aleatorio>
```
