# Nome Magnético — Contexto do Projeto para Agentes IA (Gemini / Antigravity)

## Identidade

**Produto:** Nome Magnético
**O que é:** SaaS de numerologia cabalística que analisa o nome de nascimento, detecta bloqueios energéticos e sugere variações do nome sem bloqueios, compatíveis com os números de Expressão e Destino do usuário.
**Stack:** Astro 5 SSR + React islands + Tailwind CSS + Supabase + Stripe
**Nota:** "Astro" é APENAS o framework técnico. Nunca aparece na interface, copy ou branding do produto.

---

## Design System

### Cores (NUNCA alterar sem aprovação)
- Background principal: `#1a1a1a` e `#111111`
- Accent/destaque: `#D4AF37` (gold)
- Texto primário: `#e5e7eb` (gray-200)
- Texto secundário: `#a0a0a0` (gray-400)
- Erro: `#FF6B6B`
- Espiritual/mistico: `#c084fc` (purple)
- Sucesso: `#10b981` (emerald)
- Borders: `rgba(212, 175, 55, 0.2)` (gold com opacidade)

### Fontes (Google Fonts)
- Headings/branding: **Cinzel** (serif), weights 400 e 700
- Body/UI: **Inter** (sans-serif), weights 300, 400, 500

### Estilo visual
- Dark theme em TODAS as páginas (produto e landing)
- Glassmorphism em cards: `background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(212,175,55,0.2)`
- Hover states: `scale(1.02)` + gold glow `shadow-yellow-500/10`
- Border radius: `rounded-2xl` (16px) para containers principais
- Transitions: `duration-300`

### Componentes base (src/frontend/components/ui/)
Sempre preferir estes antes de criar novos:
- `GlassCard` — card glassmorphism gold
- `Button` — variants: primary (gold), secondary (outline), ghost
- `Input` — estilo dark com label flutuante
- `Modal` — overlay dark com card glass
- `Badge` — pills coloridas
- `Toast` — notificações temporárias

---

## Arquitetura

### Separação Backend / Frontend
```
src/backend/   → NUNCA importado por componentes React diretamente
               → Apenas chamado via pages/api/* (endpoints Astro)
               → Contém: IA, numerologia, Supabase server-side, PDF, emails

src/frontend/  → React components (islands) + hooks + supabase-browser
               → NUNCA importa de src/backend/
               → Comunicação com backend SOMENTE via fetch para /api/*
```

### Fluxo de dados
```
React Component → fetch /api/endpoint → Astro API route → backend/service → Supabase/IA
```

### Roteamento de Auth
- `/app/*` → requer session + subscription ativa
- `/admin/*` → requer session + `role='admin'` na tabela profiles
- `/api/teste-bloqueio` → público, rate limit por IP (3/hora)
- Todo o resto → público

---

## IA — Regras de Ouro

### Provedores
- **development** (APP_ENV=development): Groq por padrão (gratuito)
- **production** (APP_ENV=production): Claude ou Gemini
- Admin pode sobrescrever via `/admin/ia` (salvo em `nome_magnetico.ai_config`)

### Arquivos de configuração de IA (SEMPRE editar aqui)
```
src/backend/ai/config/providers.ts    → qual provedor usar
src/backend/ai/config/models.ts       → qual modelo por tarefa
src/backend/ai/config/temperatures.ts → temperatura e max_tokens por tarefa
src/backend/ai/prompts/               → system prompts e user prompts
```

### Loop Guard
- OBRIGATÓRIO em toda chamada à IA
- Máx 3 tentativas por análise
- Detecta respostas similares (threshold 0.85)
- Rate limit: 50k tokens por sessão de usuário

---

## Numerologia Cabalística — Referência

### Tabela de conversão letra → número
```
A I Q J Y = 1
B K R     = 2
C G L S   = 3
D M T X   = 4
E H N     = 5
U V W Ç   = 6
O Z       = 7
F P       = 8
```

### Tratamento de acentos
- Agudo (´): +2 ao valor base
- Til (~): +3 ao valor base
- Grave (`): ×3 do valor base

### Números preservados (masters)
- 11 e 22 NÃO são reduzidos (em contextos que usam masters)

### 5 números principais
1. **Expressão**: todas as letras do nome completo
2. **Destino**: soma dígitos da data de nascimento
3. **Motivação/Alma**: apenas vogais
4. **Missão/Impressão**: apenas consoantes
5. **Personalidade**: primeiro nome apenas

### Os 4 Triângulos Numerológicos
Cada análise calcula TODOS os 4 triângulos (não apenas o Triângulo da Vida):

| Triângulo | Modificador da linha base | Dimensão revelada |
|-----------|--------------------------|-------------------|
| **Vida** (básico) | valor da letra apenas | Aspectos gerais |
| **Pessoal** | letra + dia de nascimento (reduzido) | Vida íntima, reações internas |
| **Social** | letra + mês de nascimento (reduzido) | Influências externas, percepção do mundo |
| **Destino** | letra + (dia+mês reduzidos) | Resultados, missão, previsões |

Bloqueios são detectados em **todos os 4 triângulos** e consolidados. Cada bloqueio inclui `aspectoSaude`.

### Bloqueios (sequências repetidas ≥3 em qualquer triângulo)
111=Iniciação, 222=Associação, 333=Expressão, 444=Estruturação,
555=Liberdade, 666=Harmonia, 777=Conexão Espiritual,
888=Poder e Abundância, 999=Compaixão Universal

Cada bloqueio tem: `codigo`, `titulo`, `descricao`, `aspectoSaude`, `triangulos[]`

### Lições Kármics e Tendências Ocultas
- **Lições Kármics**: números 1–8 **ausentes** no nome → qualidades a desenvolver nesta encarnação
- **Tendências Ocultas**: número que aparece **≥4 vezes** no nome → excesso daquela qualidade
- Funções: `detectarLicoesCarmicas(nome)`, `detectarTendenciasOcultas(nome)`, `mapearFrequencias(nome)`
- Módulo: `src/backend/numerology/karmic.ts`

### Harmonização de Nomes
Compatibilidade Expressão × Destino:
- `total`: mesma vibração após redução
- `complementar`: somam 9, 11 ou 22
- `aceitavel`: diferença de 1
- `incompativel`: demais casos
- Critérios da assinatura: legibilidade, inclinação levemente ascendente, sem traços cortantes, estética equilibrada
- **SEM radiestesia/pêndulo** — apenas critérios objetivos formais
- Módulo: `src/backend/numerology/harmonization.ts`

---

## Produtos

```typescript
type ProductType = 'nome_magnetico' | 'nome_bebe' | 'nome_empresa'
```

### `nome_magnetico` — Análise Pessoal (produto principal)
- Analisa nome de nascimento + data de nascimento
- Calcula 5 números + 4 triângulos + bloqueios + lições kármics + tendências ocultas
- Sugere variações do nome sem bloqueios e compatíveis com Expressão × Destino
- Gera guia de implementação da nova assinatura
- Módulo: `src/backend/ai/brain.ts` (funções: `generateAnalysis`, `generateSuggestions`, `generateGuide`)

### `nome_bebe` — Nome para Bebê
- Input: sobrenome da família + data de nascimento do bebê + lista de nomes candidatos
- Para cada candidato: calcula 4 triângulos + detecta bloqueios + verifica compatibilidade Expressão × Destino do bebê + lições kármics
- Rankeia por score 0–100 e aponta o melhor nome
- Módulo: `src/backend/numerology/products/nome-bebe.ts`
- Prompt IA: `src/backend/ai/prompts/baby-prompt.ts`
- Brain: `generateBabyAnalysis(params, userId, analysisId)`

### `nome_empresa` — Nome Empresarial
- Input: nome do sócio principal + data de nascimento do sócio + data de fundação (opcional) + nomes candidatos
- Analisa compatibilidade com Destino do sócio E Destino da empresa (data de fundação)
- Penalidade extra por tendência oculta do 8 (excesso de materialismo)
- Módulo: `src/backend/numerology/products/nome-empresa.ts`
- Prompt IA: `src/backend/ai/prompts/company-prompt.ts`
- Brain: `generateCompanyAnalysis(params, userId, analysisId)`

### Modelo de negócio
Pagamento único por ciclo de 30 dias (não recorrente)

---

## Banco de Dados

- Schema dedicado: `nome_magnetico`
- Auth: `auth.users` do Supabase (nativo)
- RLS ativo em todas as tabelas
- Admin: `nome_magnetico.profiles.role = 'admin'`

### Tabelas principais
- `profiles` — perfis (role, nome, email)
- `subscriptions` — acesso (stripe_session_id, starts_at, ends_at, is_active computed); campo `metadata JSONB` para produtos específicos
- `analyses` — análises completas (status: pending/processing/complete/error); campos expandidos: `triangulo_vida`, `triangulo_pessoal`, `triangulo_social`, `triangulo_destino`, `licoes_carmicas`, `tendencias_ocultas`, `frequencias_numeros`, `nome_harmonizado`, `expressao_harmonizada`
- `magnetic_names` — nomes sugeridos com scores
- `baby_name_inputs` — dados específicos do produto nome_bebe (sobrenome_familia, data_nascimento_bebe, nomes_candidatos[])
- `company_name_inputs` — dados específicos do produto nome_empresa (nome_socio_principal, data_fundacao, nomes_candidatos[])
- `ai_config` — configuração de IA editável em runtime
- `ai_usage` — log de uso (loop guard)
- `support_tickets` + `support_messages` — suporte
- `faq_categories` + `faq_items` — FAQ editável

### Migrations aplicadas
- `001_nome_magnetico.sql` — schema base completo
- `002_expand_analyses.sql` — expansão para 4 triângulos, lições kármics, tendências ocultas, produtos nome_bebe e nome_empresa
- `003_add_birth_data_to_profiles.sql` — dados de nascimento no perfil
- `004_create_magnetic_names.sql` — estrutura para sugestões
- `005_add_gender_to_profiles_fix.sql` - Correção do campo gender
- `006_add_gender_to_profiles.sql` — campo gender no perfil
- `007_create_settings_table.sql` - Tabela de configurações
- `008_add_score_to_analyses.sql` - Adiciona campo score

---

## Emails (n8n + Resend)

NUNCA enviar email diretamente do código. Sempre usar:
```typescript
import { notify } from '@/backend/notifications/notify'
await notify('user.welcome', { email, firstName, accessUrl })
```

O n8n recebe o evento e o Resend envia o email. Templates ficam no n8n.

---

## Workflows Disponíveis (Antigravity Skills)

Estes workflows estão armazenados em `.agents/workflows/` e podem ser usados como referência guiada:

- `criar-projeto` — ordem de criação dos arquivos do zero
- `criar-pagina` — criar nova página seguindo design system
- `criar-componente` — criar novo componente React seguindo padrões
- `criar-api` — criar novo endpoint Astro API
- `configurar-stripe` — passos para configuração do Stripe
- `revisar-plano` — workflow para verificar progresso do `PLANO-REVISAO.md`
- `formatar-texto` — documentação dos padrões de formatação
- `salvar-doc` — documenta feature ou correção no Changelog Técnico do Notion

---

## Componentes App Disponíveis (src/frontend/components/app/)

- `TriangleVisualization` — visualiza os 4 triângulos com abas e bloqueios expandíveis
- `KarmicLessons` — exibe lições kármics com cards expansíveis por número
- `HiddenTendencies` — exibe tendências ocultas + barra de frequências 1–8
- `SignatureEvaluation` — critérios objetivos da assinatura (sem radiestesia)
- `BabyNameForm` — formulário completo para produto nome_bebe
- `CompanyNameForm` — formulário completo para produto nome_empresa

---

## Regras Gerais para Agentes (Claude e Gemini)

1. **NUNCA** nomear arquivos ou variáveis com "astro" (é o framework, não o produto)
2. **SEMPRE** usar Tailwind CSS — sem CSS custom a não ser para glassmorphism
3. **SEMPRE** TypeScript — sem JS
4. **NUNCA** importar backend em componentes React
5. **SEMPRE** validar inputs com Zod nos endpoints API
6. **NUNCA** expor service key do Supabase no cliente
7. **SEMPRE** checar subscription ativa antes de processar análise
8. **NUNCA** chamar IA sem passar pelo LoopGuard
9. Ao criar página nova → consultar Paper MCP para layout antes de codar
10. Ao criar componente novo → verificar se existe em `src/frontend/components/ui/` ou `src/frontend/components/app/`
11. **NUNCA** mencionar radiestesia, pêndulo ou técnicas radiestésicas — o projeto usa APENAS critérios formais objetivos
12. Análise SEMPRE usa os 4 triângulos (não só o Triângulo da Vida) — importar `calcularTodosTriangulos` de `triangle.ts`
13. Para implementar qualquer funcionalidade referente ao projeto, SEMPRE validar os requisitos com o documento `PLANO-REVISAO.md`.
