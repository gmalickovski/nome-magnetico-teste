# Plano de Revisão — Nome Magnético
## Incorporar Numerologia Cabalística Completa

---

## Contexto

O scaffold inicial implementou apenas o **Triângulo da Vida** e os **5 números básicos**.
O curso de numerologia cabalística define uma estrutura muito mais rica que precisa ser incorporada.

---

## REVISÃO 1 — Numerologia Core (backend)

### 1.1 `src/backend/numerology/arcanos.ts` ← NOVO
- Mapa de significados dos **99 arcanos** (1–99) usados nos triângulos
- Regras especiais:
  - Arcano 0 → vale **22** na numerologia (O Louco)
  - Arcano 9 → O Eremita (fim de ciclo, recomeço)
- Cada arcano com: número, nome, palavra-chave, descrição positiva, desafio

### 1.2 `src/backend/numerology/triangle.ts` ← REFATORAR
Atualmente só tem o Triângulo da Vida. Adicionar os outros 3:

**4 Triângulos:**
| Triângulo | Base de cálculo | O que revela |
|-----------|-----------------|--------------|
| Vida (Básico) | valor de cada letra | Aspectos gerais da vida |
| Pessoal | letra + dia de nascimento (reduzido) | Vida íntima, reações internas |
| Social | letra + mês de nascimento (reduzido) | Influências externas |
| Destino | letra + (dia + mês reduzidos) | Resultados e previsões |

**Regra de montagem (igual para todos):**
1. Linha base: valor de cada letra (com modificador de acento → reduzir a 1 dígito na linha base do triângulo)
2. Próximas linhas: soma reduzida dos pares adjacentes
3. Vértice = Arcano Regente (tom geral do triângulo)

**Elementos a extrair de cada triângulo:**
- `linhas[][]` — todas as linhas
- `arcanoRegente` — vértice final
- `arcanosDoMinantes[]` — arcanos da linha base (concatenação de pares)
- `sequenciasNegativas[]` — 3+ dígitos iguais em qualquer linha

### 1.3 `src/backend/numerology/karmic.ts` ← NOVO
**Lições Cármicas** (números ausentes no nome):
- Identifica quais números de 1 a 8 **não aparecem** em nenhuma letra do nome completo
- Cada ausência = uma lição cármica específica a ser aprendida nesta vida
- Retorna: `{ numero, titulo, descricao }`

**Tendências Ocultas** (número que se repete 4+ vezes):
- Conta frequência de cada número no nome
- Número que aparece ≥4 vezes = tendência oculta (exagero da qualidade)
- Retorna: `{ numero, frequencia, titulo, descricao }`

### 1.4 `src/backend/numerology/triangle.ts` — atualizar bloqueios
Adicionar **aspectos de saúde** a cada sequência negativa:

| Seq | Dificuldade | Saúde |
|-----|-------------|-------|
| 111 | Limitação, perda de coragem, inatividade | Tendência a distúrbios cardíacos |
| 222 | Timidez, indecisão, ser subjugado | Doenças que provoquem dependência |
| 333 | Dificuldade no diálogo, ser incompreendido | Doenças respiratórias ou de articulações |
| 444 | Dificuldade profissional, mal remunerado | Doenças reumáticas ou arteriais |
| 555 | Mudanças não desejadas, inconstância | Tendência à libertinagem |
| 666 | Necessidade excessiva de harmonia, ser explorado | Doenças hormonais |
| 777 | Isolamento, ideias não colocadas em prática | Introspecção excessiva |
| 888 | Luta por bens materiais, dificuldades financeiras | Doenças renais ou no estômago |
| 999 | Finalização de ciclo lenta/forçada, desapego | Risco de perda material ou espiritual |

### 1.5 `src/backend/numerology/harmonization.ts` ← NOVO
Procedimento de harmonização do nome/assinatura:
1. **Detectar** sequências negativas em todos os 4 triângulos
2. **Calcular** número de Expressão compatível com o número de Destino
3. **Sugerir** variações que:
   - Eliminem todas as sequências negativas
   - Tenham Expressão compatível com Destino
   - Sejam fonética e visualmente próximas ao nome original
4. **Avaliar** critérios da assinatura: legibilidade, inclinação ascendente, sem traços cortando letras

### 1.6 `src/backend/numerology/numbers.ts` — verificar e completar
- Validar se o Arcano Regente do Triângulo da Vida é realmente tratado como "2º número de Expressão"
- Adicionar cálculo do **Número de Expressão do Nome Social** (para o produto nome_magnetico)

---

## REVISÃO 2 — Banco de Dados

### 2.1 `supabase/migrations/002_expand_analyses.sql` ← NOVO
Adicionar colunas à tabela `analyses`:
```sql
-- Novos campos
triangulo_pessoal   JSONB,
triangulo_social    JSONB,
triangulo_destino   JSONB,
licoes_carmicas     JSONB DEFAULT '[]',
tendencias_ocultas  JSONB DEFAULT '[]',
arcanos_dominantes  JSONB DEFAULT '[]',
-- Para nome social/bebe/empresa
nome_social_sugerido TEXT,
numero_expressao_social INTEGER
```

---

## REVISÃO 3 — Produtos (lógica específica)

### 3.1 Produto: `nome_magnetico` (Nome Social)
**Fluxo:**
1. Calcular os 4 triângulos do nome completo de nascimento
2. Detectar sequências negativas em todos os triângulos
3. Calcular lições cármicas e tendências ocultas
4. Sugerir variações do nome social que:
   - Eliminam sequências negativas (especialmente no Triângulo da Vida)
   - Têm Expressão compatível com Destino
5. Para cada nome sugerido: mostrar os 4 triângulos e confirmar ausência de bloqueios

### 3.2 Produto: `nome_bebe` ← IMPLEMENTAR LÓGICA
**Entradas:**
- Nome completo dos pais (para compatibilidade com sobrenome)
- Data prevista/real de nascimento
- Preferências de gênero e estilo

**Fluxo:**
1. Calcular número de Destino do bebê pela data de nascimento
2. Para cada nome candidato fornecido (ou gerado):
   - Calcular os 4 triângulos com o sobrenome da família
   - Verificar sequências negativas
   - Calcular compatibilidade Expressão × Destino
   - Verificar lições cármicas
3. Rankear por score e apresentar os melhores

### 3.3 Produto: `nome_empresa` ← IMPLEMENTAR LÓGICA
**Entradas:**
- Nome completo do sócio principal (para número de Destino)
- Data de fundação (ou data desejada)
- Ramo de atividade

**Fluxo:**
1. Calcular número de Destino pela data de fundação
2. Para cada nome candidato:
   - Calcular Triângulo da Vida
   - Verificar sequências negativas
   - Calcular Expressão e verificar compatibilidade com Destino do sócio
   - Verificar se o nome projeta a energia desejada para o ramo
3. Rankear e apresentar com justificativa

---

## REVISÃO 4 — AI Prompts

### 4.1 `src/backend/ai/prompts/analysis-prompt.ts` ← ATUALIZAR
Incluir no prompt:
- Dados dos **4 triângulos** (não só o da Vida)
- **Lições cármicas** detectadas
- **Tendências ocultas** detectadas
- Arcano Regente de cada triângulo

### 4.2 `src/backend/ai/prompts/suggestions-prompt.ts` ← ATUALIZAR
- Mencionar que a harmonização usa os 4 triângulos
- Incluir critérios de assinatura (legibilidade, inclinação)

### 4.3 `src/backend/ai/prompts/baby-prompt.ts` ← NOVO
Prompt específico para análise de nome de bebê:
- Contexto dos pais
- Energia desejada para a criança
- Compatibilidade com o destino da data de nascimento

### 4.4 `src/backend/ai/prompts/company-prompt.ts` ← NOVO
Prompt específico para nome empresarial:
- Ramo de atividade
- Energia desejada para o negócio
- Compatibilidade com o fundador

---

## REVISÃO 5 — Frontend

### 5.1 `src/frontend/components/app/TriangleVisualization.tsx` ← REFATORAR
Mostrar os **4 triângulos** em tabs:
- Tab: Vida | Pessoal | Social | Destino
- Cada triângulo com: linhas numeradas, arcanos dominantes, arcano regente, sequências em vermelho

### 5.2 `src/frontend/components/app/KarmicLessons.tsx` ← NOVO
Card para lições cármicas:
- Lista os números ausentes com título e descrição

### 5.3 `src/frontend/components/app/HiddenTendencies.tsx` ← NOVO
Card para tendências ocultas:
- Número, frequência, título e descrição

### 5.4 `src/frontend/components/app/SignatureEvaluation.tsx` ← NOVO
Componente para avaliação da assinatura:
- Critérios objetivos (checklist visual): legibilidade, inclinação ascendente, sem traços cortando letras

### 5.5 Questionários específicos por produto
- `src/frontend/components/app/BabyNameForm.tsx` ← NOVO
- `src/frontend/components/app/CompanyNameForm.tsx` ← NOVO

---

## REVISÃO 6 — Skills CLAUDE.md

Atualizar os skills customizados para refletir:
- `/criar-projeto` → mencionar os 4 triângulos, 3 produtos com lógicas distintas
- `/criar-componente` → adicionar exemplos de TriangleVisualization, KarmicLessons
- `/criar-api` → mencionar endpoints por produto
- `/criar-pagina` → mencionar páginas específicas por produto

---

## Ordem de Execução

```
1. arcanos.ts          (independente)
2. karmic.ts           (depende de core.ts)
3. triangle.ts         (refatorar — adicionar 3 triângulos + saúde nos bloqueios)
4. harmonization.ts    (depende de triangle.ts + numbers.ts)
5. migration 002       (independente)
6. analysis-prompt.ts  (depende dos novos dados)
7. baby-prompt.ts      (novo)
8. company-prompt.ts   (novo)
9. brain.ts            (atualizar para passar dados dos 4 triângulos)
10. analyze API        (atualizar para calcular os 4 triângulos)
11. TriangleVisualization (frontend)
12. KarmicLessons + HiddenTendencies (frontend)
13. BabyNameForm + CompanyNameForm (frontend)
14. CLAUDE.md skills   (atualizar)
```

---

## Impacto nos arquivos existentes

| Arquivo | Tipo de mudança |
|---------|-----------------|
| `src/backend/numerology/triangle.ts` | Refatorar — 4 triângulos + saúde |
| `src/backend/numerology/numbers.ts` | Ajuste — Arcano Regente como 2º Expressão |
| `src/backend/numerology/suggestions.ts` | Ajuste — usar harmonization.ts |
| `src/backend/ai/brain.ts` | Atualizar — passar dados completos |
| `src/backend/ai/prompts/analysis-prompt.ts` | Atualizar — 4 triângulos + kármica |
| `src/pages/api/analyze.ts` | Atualizar — calcular todos os triângulos |
| `src/pages/app/resultado/[id].astro` | Atualizar — mostrar novos dados |
| `supabase/migrations/` | Adicionar migration 002 |
| `CLAUDE.md` | Atualizar skills e conceitos |

---

## Arquivos novos

| Arquivo | Fase |
|---------|------|
| `src/backend/numerology/arcanos.ts` | Rev. 1 |
| `src/backend/numerology/karmic.ts` | Rev. 1 |
| `src/backend/numerology/harmonization.ts` | Rev. 1 |
| `src/backend/ai/prompts/baby-prompt.ts` | Rev. 4 |
| `src/backend/ai/prompts/company-prompt.ts` | Rev. 4 |
| `src/frontend/components/app/TriangleVisualization.tsx` | Rev. 5 |
| `src/frontend/components/app/KarmicLessons.tsx` | Rev. 5 |
| `src/frontend/components/app/HiddenTendencies.tsx` | Rev. 5 |
| `src/frontend/components/app/SignatureEvaluation.tsx` | Rev. 5 |
| `src/frontend/components/app/BabyNameForm.tsx` | Rev. 5 |
| `src/frontend/components/app/CompanyNameForm.tsx` | Rev. 5 |
| `supabase/migrations/002_expand_analyses.sql` | Rev. 2 |
