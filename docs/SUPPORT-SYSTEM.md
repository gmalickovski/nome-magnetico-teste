# Sistema de Suporte Profissional — Guia de Arquitetura

> Documento de referência para replicar este sistema em outros SaaS do portfólio.
> Criado para: Nome Magnético | Plataforma: Chatwoot + Supabase + Claude AI

---

## Visão Geral

Sistema de suporte multi-canal centralizado no **Chatwoot** como master de conversas,
com **Supabase** como banco de dados da aplicação e **Claude AI** integrado ao painel admin.

### Princípios

- **Chatwoot = master das conversas** — agentes trabalham EXCLUSIVAMENTE no Chatwoot
- **Supabase = banco da aplicação** — lógica de negócio, referências, contexto do cliente
- **Event-driven sync** — webhooks bidirecionais, sem replicação PostgreSQL direta
- **Graceful degradation** — se Chatwoot cair, tickets continuam no Supabase

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHATWOOT (Docker/VPS)                               │
│   ┌──────────────────────┐           ┌──────────────────────────────────┐   │
│   │  Conversas (suporte) │           │  Help Center (artigos FAQ)       │   │
│   └──────────┬───────────┘           └────────────────┬─────────────────┘   │
│              │ webhooks outbound                       │ webhooks outbound   │
└──────────────┼─────────────────────────────────────────┼────────────────────┘
               │                                         │
               ▼                                         │ (artigos criados pelo N8N)
┌──────────────────────────────────┐                     │
│  NOSSA APLICAÇÃO (Astro/Node)    │                     │
│                                  │         ┌───────────▼──────────────────┐
│  /api/support/chatwoot-webhook   │         │         N8N (VPS)            │
│   ├─ message_created             │         │  workflow: sync-faq          │
│   │   → update Supabase + email  │         │  /webhook/sync-faq           │
│   ├─ conversation_resolved       │         │   ├─ INSERT → criar artigo   │
│   │   → update Supabase + email  │         │   │   + salvar article_id    │
│   ├─ article_published           │         │   ├─ UPDATE → editar artigo  │
│   └─ article_updated/archived    │         │   └─ DELETE → arquivar       │
│      → sync faq_items            │         └──────────────┬───────────────┘
└──────────────────┬───────────────┘                        │ Supabase DB Webhook
                   │                                        │
                   └──────────────────┬─────────────────────┘
                                      │
                   ┌──────────────────▼──────────────────────┐
                   │            SUPABASE CLOUD                │
                   │  support_tickets + support_messages      │
                   │  faq_items + faq_categories              │
                   │    ↑ master de FAQs — toda edição        │
                   │      começa aqui                         │
                   │  profiles + subscriptions + analyses     │
                   └─────────────────────────────────────────┘
```

---

## Fluxos Completos

### 1. Usuário abre um ticket (formulário)

```
Usuário preenche formulário
  ↓
POST /api/support/ticket
  ├─ Supabase: INSERT support_tickets (status: open)
  ├─ Supabase: INSERT support_messages (mensagem inicial)
  ├─ Chatwoot API:
  │    ├─ findOrCreateContact (por email)
  │    ├─ createConversation (inbox: geral ou clientes VIP)
  │    ├─ postMessage (mensagem incoming)
  │    ├─ applyLabels ([assunto-slug, nm-produto, nm-vip?])
  │    └─ UPDATE support_tickets SET chatwoot_conversation_id
  ├─ N8N notify('support.ticket_created') → email confirmação para usuário
  └─ Async: POST /api/support/claude-triage
               ├─ Claude/Groq analisa ticket
               ├─ Supabase: INSERT support_messages (nota triagem)
               └─ Chatwoot: postMessage (nota PRIVADA — só agentes veem)
```

### 2. Agente responde no Chatwoot

```
Agente digita resposta no Chatwoot → clica Enviar
  ↓
Chatwoot dispara webhook: event=message_created, message_type=outgoing
  ↓
POST /api/support/chatwoot-webhook
  ├─ Ignorar se private=true (notas internas)
  ├─ Ignorar se sender.type=agent_bot (anti-loop)
  ├─ Supabase: UPDATE support_tickets SET status=in_progress
  ├─ Supabase: INSERT support_messages (espelho da resposta)
  └─ N8N notify('support.ticket_reply') → email para o usuário
```

### 3. Admin responde pelo painel da aplicação

```
Admin abre /admin/suporte/[id]
  ├─ Usa assistente Claude (SupportAiPanel) para obter sugestão
  ├─ Clica "Usar esta resposta" → textarea preenchido
  └─ Clica "Enviar resposta"
       ↓
       POST /api/support/reply
         ├─ Supabase: INSERT support_messages (is_admin=true)
         ├─ Supabase: UPDATE support_tickets SET status=in_progress
         └─ Chatwoot API: postMessage (outgoing, public=true)
              ↓ (Chatwoot dispara webhook de volta)
              POST /api/support/chatwoot-webhook
                └─ Detecta que ticket já é in_progress → sem N8N duplicado
```

### 4. Ticket resolvido

```
Agente clica "Resolver" no Chatwoot
  ↓
Chatwoot: event=conversation_resolved
  ↓
POST /api/support/chatwoot-webhook
  ├─ Supabase: UPDATE support_tickets SET status=resolved, resolved_at=NOW()
  └─ N8N notify('support.ticket_resolved') → email de resolução para o usuário

OU: Admin clica "Resolver ticket" no painel
  ↓
POST /api/support/reply { resolve: true }
  ├─ Supabase: UPDATE support_tickets SET status=resolved
  └─ Chatwoot API: toggleConversationStatus('resolved')
```

### 5. FAQ — Supabase → Chatwoot Help Center (fluxo principal)

```
Admin cria/edita/deleta faq_item no Supabase (painel admin ou diretamente)
  ↓
Supabase Database Webhook dispara automaticamente
  ↓ POST https://n8n.studiomlk.com.br/webhook/sync-faq
  ↓
N8N workflow "Nome Magnético - Sync FAQs Supabase -> Chatwoot"
  ├─ INSERT → POST Chatwoot /portals/nome-magnetico/articles
  │            → N8N salva chatwoot_article_id de volta no Supabase
  ├─ UPDATE → PUT Chatwoot /portals/nome-magnetico/articles/{id}
  └─ DELETE → PUT Chatwoot /portals/nome-magnetico/articles/{id} { status: archived }
```

> **Supabase é o master de FAQs.** Toda criação/edição acontece no Supabase.
> O N8N propaga as mudanças automaticamente para o Chatwoot Help Center.

### 6. FAQ — Chatwoot Help Center → Supabase (reverso / leitura)

```
Admin edita artigo diretamente no Chatwoot Help Center
  ↓
Chatwoot: event=article_published | article_updated | article_archived
  ↓
POST /api/support/chatwoot-webhook
  └─ Supabase: UPSERT faq_items (match por chatwoot_article_id)
```

> **Atenção:** este sentido existe como fallback. O fluxo preferido é sempre editar
> no Supabase e deixar o N8N propagar para o Chatwoot.

### 7. Assistente Claude no painel admin

```
Admin abre ticket → SupportAiPanel carrega (client:load)
  ↓
Admin clica "Sugerir resposta" ou digita pergunta
  ↓
POST /api/support/ai-assistant { ticket_id, message, history }
  ├─ Carrega: ticket + últimas 10 mensagens + perfil + subscriptions + análises
  ├─ Carrega: FAQs relevantes (contexto adicional)
  └─ Claude Haiku responde com análise e/ou resposta sugerida
       ↓
       Se resposta sugerida → botão "Usar esta resposta"
         ↓ CustomEvent('fill-reply')
         ↓ Preenche textarea → admin revisa → envia
```

---

## Banco de Dados (Supabase)

### Tabelas de suporte

```sql
-- Tickets de suporte
support_tickets (
  id UUID PK,
  user_id UUID NULL,              -- FK auth.users (nullable = anônimo)
  contact_email TEXT,
  contact_name TEXT,
  subject TEXT,
  status TEXT,                    -- open | in_progress | resolved | closed
  priority TEXT,                  -- low | normal | urgent
  chatwoot_conversation_id TEXT,  -- FK para conversa no Chatwoot
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ NULL
)

-- Mensagens do ticket
support_messages (
  id UUID PK,
  ticket_id UUID FK support_tickets,
  author_id UUID NULL,            -- NULL = sistema/IA
  is_admin BOOLEAN,
  content TEXT,
  created_at TIMESTAMPTZ
)
```

### Tabelas de FAQ

```sql
faq_categories (
  id UUID PK,
  title TEXT,
  slug TEXT UNIQUE,
  order_index INTEGER,
  is_active BOOLEAN
)

faq_items (
  id UUID PK,
  category_id UUID FK faq_categories,
  question TEXT,
  answer TEXT,                    -- plain text
  answer_html TEXT,               -- HTML rico (do Chatwoot)
  chatwoot_article_id TEXT UNIQUE, -- ID do artigo no Chatwoot Help Center
  chatwoot_category_id TEXT,
  slug TEXT,
  order_index INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## Variáveis de Ambiente

```bash
# Chatwoot
CHATWOOT_BASE_URL=https://suporte.seudominio.com.br
CHATWOOT_WEBSITE_TOKEN=token_do_widget_live_chat
CHATWOOT_API_TOKEN=token_da_api_do_agente
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1                    # Inbox geral
CHATWOOT_INBOX_ID_CLIENTES=2           # Inbox VIP (opcional)
CHATWOOT_PORTAL_SLUG=meu-produto       # Slug do Help Center
CHATWOOT_WEBHOOK_SECRET=string_aleatoria  # HMAC para verificar webhooks

# N8N (notificações por email + FAQ sync)
N8N_WEBHOOK_SUPORTE=https://n8n.seudominio.com.br/webhook/suporte
N8N_WEBHOOK_TRANSACIONAL=https://n8n.seudominio.com.br/webhook/transacional
N8N_WEBHOOK_FAQ_SYNC=https://n8n.seudominio.com.br/webhook/sync-faq  # Supabase DB Webhook → N8N → Chatwoot Help Center

# Internos
INTERNAL_API_SECRET=string_aleatoria   # Para chamar /api/support/claude-triage
PRODUCT_SLUG=nm-nome-magnetico         # Label identificador do produto no Chatwoot

# IA
ANTHROPIC_API_KEY=sk-ant-...           # Para Claude no triage + assistente admin
GROQ_API_KEY=gsk_...                   # Fallback em development

# App
APP_ENV=production                     # production | development
APP_URL=https://seudominio.com.br
```

---

## Configuração do Chatwoot (passo a passo)

### 1. Labels (Settings → Labels)

Criar todas as labels antes de receber tickets:

```
nm-bug                    # Bugs técnicos
nm-sugestao               # Sugestões de melhoria
nm-primeiros-passos       # Onboarding
nm-assinaturas-e-planos   # Financeiro/planos
nm-conta-e-seguranca      # Conta do usuário
nm-solucao-de-problemas   # Suporte técnico geral
nm-duvida-sobre-planos    # Perguntas sobre preços
nm-como-funciona          # Educacional/produto
nm-informacoes-gerais     # Geral
nm-parceria               # B2B / imprensa
nm-outros                 # Demais
nm-vip                    # Clientes com plano ativo
nm-nome-magnetico         # Identificador do produto (multi-SaaS)
```

### 2. Inboxes (Settings → Inboxes)

**Inbox Geral (formulário + live chat):**
- Type: API
- Name: Nome Magnético — Geral
- Salvar o `inbox_id` em `CHATWOOT_INBOX_ID`

**Inbox Clientes VIP (opcional):**
- Type: API
- Name: Nome Magnético — Clientes
- Salvar em `CHATWOOT_INBOX_ID_CLIENTES`

**Inbox Email:**
- Type: Email
- Name: Nome Magnético — Email
- Email address: suporte@nomemagnetico.com.br
- SMTP: Amazon SES (já configurado no Chatwoot)
  - Host: email-smtp.us-east-1.amazonaws.com
  - Port: 587
  - Username/Password: credenciais SES
- Incoming: configurar forwarding de suporte@seudominio.com.br para o handler do Chatwoot

### 3. Webhook de saída (Settings → Integrations → Webhooks)

```
URL: https://seudominio.com.br/api/support/chatwoot-webhook
Subscribed Events:
  ✅ message_created
  ✅ conversation_resolved
  ✅ conversation_status_changed
  ✅ article_published       (para FAQ sync)
  ✅ article_updated
  ✅ article_archived
```

> Após criar, copiar o webhook secret e salvar em `CHATWOOT_WEBHOOK_SECRET`

### 4. Help Center (Settings → Help Center)

```
Name: Centro de Ajuda Nome Magnético
Slug: nome-magnetico          → salvar em CHATWOOT_PORTAL_SLUG
Color: #D4AF37 (gold)
Homepage: ativar
```

Criar categorias correspondendo às `faq_categories` do Supabase.

---

## Configuração do Supabase

### Database Webhooks (Settings → Database → Webhooks)

Para sincronizar edições feitas no Supabase → Chatwoot Help Center:

```
Name: faq-items-to-n8n
Table: faq_items
Events: INSERT, UPDATE, DELETE
URL: https://n8n.seudominio.com.br/webhook/sync-faq
HTTP Method: POST
(sem headers adicionais — o N8N webhook é público)
```

O N8N recebe o payload `{ type, table, schema, record, old_record }` e propaga para o Chatwoot Help Center API automaticamente conforme o workflow `n8n_workflows/workflow-sync-help-center-chatwoot`.

### RLS (já configurado nas migrations)

- `support_tickets`: usuários veem apenas os próprios | admins veem tudo
- `support_messages`: idem
- `faq_items`: leitura pública para `is_active=true` | escrita apenas admin
- `faq_categories`: idem

---

## Migração Inicial de FAQ

Se há FAQ no Notion ou hardcoded, migrar para Chatwoot:

```bash
# 1. Garantir que faq_items do Supabase estão populados

# 2. Migrar Supabase → Chatwoot Help Center
curl -X POST https://seudominio.com.br/api/admin/faq-sync \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate-to-chatwoot"}'

# 3. Verificar no Chatwoot Help Center se os artigos apareceram

# 4. Sincronizar de volta (opcional — garante chatwoot_article_id nos registros)
curl "https://seudominio.com.br/api/admin/faq-sync?source=chatwoot" \
  -H "Cookie: session=..."
```

---

## Como Replicar em Outro SaaS

### Checklist de implementação

**Backend (copiar e adaptar):**

- [ ] `src/backend/support/chatwootClient.ts` — copiar integralmente
  - Atualizar `LABEL_MAP` com labels do novo produto
- [ ] `src/pages/api/support/ticket.ts` — copiar, ajustar `PRODUCT_SLUG`
- [ ] `src/pages/api/support/chatwoot-webhook.ts` — copiar integralmente
- [ ] `src/pages/api/support/claude-triage.ts` — copiar, ajustar system prompt
- [ ] `src/pages/api/support/reply.ts` — copiar integralmente
- [ ] `src/pages/api/support/ai-assistant.ts` — copiar, ajustar system prompt e campos do cliente
- [ ] `src/pages/api/support/chatwoot-webhook.ts` — copiar integralmente
- [ ] `src/pages/api/faq.ts` — copiar integralmente
- [ ] `src/pages/api/admin/faq-sync.ts` — copiar integralmente
- [ ] `n8n_workflows/workflow-sync-help-center-chatwoot` — importar no N8N e configurar credenciais (Chatwoot API token + Supabase)
- [ ] `src/backend/notifications/notify.ts` — garantir eventos `support.*`

**Frontend:**

- [ ] `src/frontend/components/admin/SupportAiPanel.tsx` — copiar, ajustar QUICK_ACTIONS
- [ ] `src/frontend/components/landing/FAQSection.tsx` — copiar integralmente
- [ ] Painel admin `[id].astro` — copiar layout duas colunas

**Banco de dados:**

- [ ] Aplicar migrations: `001_nome_magnetico.sql` (tabelas base) + `013_faq_chatwoot.sql`
- [ ] Configurar RLS policies
- [ ] Configurar Supabase Database Webhook para `faq_items`

**Variáveis de ambiente:**

- [ ] Todas as variáveis `CHATWOOT_*` com valores do novo produto/inbox
- [ ] `PRODUCT_SLUG=meu-novo-produto`
- [ ] `CHATWOOT_PORTAL_SLUG=meu-novo-produto`
- [ ] `INTERNAL_API_SECRET` (pode ser o mesmo da plataforma)
- [ ] `ANTHROPIC_API_KEY` (pode compartilhar entre SaaS)

**Configuração Chatwoot:**

- [ ] Criar labels com prefixo do produto (`meu-produto-bug`, etc.)
- [ ] Criar inbox(es) para o produto
- [ ] Configurar webhook de saída
- [ ] Criar portal Help Center com slug correto

**Configuração N8N:**

- [ ] Criar workflow para `support.ticket_created` → email confirmação
- [ ] Criar workflow para `support.ticket_reply` → email notificação
- [ ] Criar workflow para `support.ticket_resolved` → email resolução

---

## Arquivos do Sistema (referência rápida)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/backend/support/chatwootClient.ts` | Funções HTTP do Chatwoot (módulo compartilhado) |
| `src/pages/api/support/ticket.ts` | Criar ticket (Supabase + Chatwoot) |
| `src/pages/api/support/chatwoot-webhook.ts` | Receber eventos do Chatwoot |
| `src/pages/api/support/claude-triage.ts` | Triagem automática por IA |
| `src/pages/api/support/reply.ts` | Admin responde (Supabase + Chatwoot) |
| `src/pages/api/support/ai-assistant.ts` | Claude como assistente do admin |
| `src/pages/api/faq.ts` | Endpoint público de FAQ |
| `src/pages/api/admin/faq-sync.ts` | Sync manual Chatwoot ↔ Supabase |
| `src/pages/api/admin/chatwoot-article-sync.ts` | Supabase DB Webhook → Chatwoot |
| `src/frontend/components/admin/SupportAiPanel.tsx` | Chat IA no painel admin |
| `src/frontend/components/landing/FAQSection.tsx` | Seção FAQ pública |
| `src/pages/admin/suporte/[id].astro` | Painel admin: ticket + IA |
| `src/layouts/BaseLayout.astro` | Widget live chat Chatwoot |

---

## Pontos de Atenção

### Segurança

- `CHATWOOT_API_TOKEN`: nunca expor no frontend. Usado apenas server-side.
- `CHATWOOT_WEBHOOK_SECRET`: verificar assinatura HMAC em todos os webhooks recebidos.
- `INTERNAL_API_SECRET`: para comunicação interna entre rotas da aplicação.
- Supabase RLS: sempre validar permissões no banco, não só na API.

### Nginx / Proxy

Nginx remove headers HTTP com underscore por padrão. O Chatwoot API token vai **sempre como query param**:
```
?api_access_token=TOKEN
```
Isso é tratado automaticamente em `cwUrl()` no `chatwootClient.ts`.

### Anti-loop (webhooks)

Quando o admin responde pelo painel → `reply.ts` → Chatwoot API → Chatwoot dispara webhook de volta.
O webhook handler detecta que o ticket já está `in_progress` e não dispara N8N novamente.
Para mensagens de agentes bot, verificar `message.sender.type === 'agent_bot'` e ignorar.

### Chatwoot Downtime

O `ticket.ts` tem graceful degradation: se o Chatwoot estiver offline, o ticket é salvo no Supabase
normalmente. O `chatwoot_conversation_id` ficará vazio, mas o ticket existe e pode ser respondido
pelo painel admin. A conversa no Chatwoot pode ser criada manualmente depois.
