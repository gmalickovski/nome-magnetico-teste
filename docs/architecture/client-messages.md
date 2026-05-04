# Client messages via HQ

O HQ StudioMLK cria campanhas para clientes do SaaS selecionado e grava as
campanhas no Supabase desse produto. No momento, o consumidor implementado no
frontend e a area `/app` do Nome Magnetico.

## Fluxo

- O HQ envia `saasId` nas rotas de mensagens e cria um registro em
  `client_messages` no Supabase daquele SaaS.
- Ao enviar, o HQ resolve o publico e cria uma entrega em
  `client_message_deliveries` para cada usuario.
- Cada entrega pode guardar `rendered_title` e `rendered_body_markdown`, que
  sao o snapshot ja personalizado com variaveis como `{{nome}}`,
  `{{primeiro_nome}}` e `{{email}}`.
- A area `/app` consulta `/api/client-messages/pending`.
- Ao fechar o popup, o app chama
  `/api/client-messages/:deliveryId/dismiss` e preenche `dismissed_at`.

## Seguranca

- O browser nunca acessa a service role key.
- Os endpoints do app validam `Astro.locals.user` e atualizam apenas entregas
  do usuario autenticado.
- O Markdown do popup escapa HTML bruto e permite somente formatacao simples.

## Banco

A migration `supabase/migrations/025_client_messages.sql` cria no Supabase do
Nome Magnetico:

- `client_messages`
- `client_message_deliveries`

As policies RLS permitem acesso pela service role. O app usa endpoints
server-side para consultar e dispensar mensagens.
