# Sistema de Score e Compatibilidade Vibracional

> **Documento de referência** para integrantes da equipe técnica.  
> Esta lógica é usada pelos 3 produtos: **Nome Social**, **Nome Bebê** e **Nome Empresa**.

---

## Visão Geral

Cada nome candidato (seja sugerido pelo usuário, gerado pela IA ou derivado do nome original) é avaliado por dois critérios combinados:

1. **Score numérico 0–100** — mede a qualidade vibratória global do nome
2. **Tipo de Compatibilidade** — classifica a relação entre o número de Expressão do nome e o número de Destino da pessoa

Ambos são calculados em `src/backend/numerology/harmonization.ts`.

---

## Score 0–100

O score reflete a combinação de:
- Ausência de bloqueios energéticos (sequências repetidas nos 4 triângulos)
- Tipo de compatibilidade com o Destino
- Penalidades (ex.: tendência oculta do 8 no produto Empresa)
- Nível de descaracterização em relação ao nome original (para sugestões)

### Faixas de Score

| Faixa | Classificação | Cor no UI |
|-------|--------------|-----------|
| 90–100 | ⭐ Excelente | Verde (`emerald-500`) |
| 70–89 | ✅ Bom | Verde (`emerald-500`) |
| 40–69 | 〜 Aceitável | Âmbar (`amber-500`) |
| 20–39 | ⚠ Não Recomendado | Vermelho claro (`red-400`) |
| 0–19 | 🔴 Crítico | Vermelho forte (`red-600`) |

> **Regra do "Nome de Ouro":** O nome recomendado ao cliente é o que possui score ≥ 80 E menor descaracterização do nome original. Quando o cliente não sugere candidatos próprios, o sistema usa exclusivamente os nomes gerados pela IA, e o Nome de Ouro é o de maior score.

---

## 4 Tipos de Compatibilidade Expressão × Destino

A **Expressão** é calculada a partir de todas as letras do nome candidato.  
O **Destino** é fixo — calculado a partir da data de nascimento da pessoa (ou data de fundação, no produto Empresa).

### Tabela de Tipos

| Código interno | Label exibido ao usuário | Cor | Critério matemático |
|----------------|--------------------------|-----|---------------------|
| `total` | ✦ Ressonância Total | 🟢 Verde (`sky-400`) | Expressão reduzida = Destino. Vibrações idênticas — alinhamento perfeito |
| `complementar` | ◈ Vibração Complementar | 🔵 Azul (`sky-400`) | Expressão + Destino = 9, 11 ou 22 (números de maestria). Nome e missão se amplificam |
| `aceitavel` | ◎ Vibração Neutra | 🟡 Âmbar (`amber-400`) | |Expressão − Destino| = 1. Convivência sem tensão, sem sinergia especial |
| `incompativel` | ⚠ Tensão Vibracional | 🔴 Vermelho (`red-400`) | Demais casos — frequências díspares. Penalidade aplicada ao score |

> ⚠️ **Copy importante:** NUNCA usar a palavra "incompatível" na interface voltada ao cliente. Sempre usar **"Tensão Vibracional"**.

### Como a compatibilidade afeta o score

- `total` → bônus máximo no score
- `complementar` → bônus intermediário (é positivo — números de maestria)
- `aceitavel` → sem bônus nem penalidade relevante
- `incompativel` → penalidade no score (já refletida no valor exibido)

---

## Componente UI: `CompatibilityBadge`

Localização: `src/frontend/components/app/CompatibilityBadge.tsx`

```tsx
import CompatibilityBadge from '@/frontend/components/app/CompatibilityBadge';

// Badge simples (sem tooltip)
<CompatibilityBadge compatibilidade="total" />

// Badge com tooltip e legenda completa (CSS-only, sem <button> aninhado)
<CompatibilityBadge compatibilidade="complementar" showTooltip size="sm" />
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `compatibilidade` | `'total' \| 'complementar' \| 'aceitavel' \| 'incompativel'` | obrigatório | Tipo de compatibilidade |
| `size` | `'sm' \| 'md'` | `'md'` | Tamanho do badge |
| `showTooltip` | `boolean` | `false` | Exibe tooltip com legenda completa ao hover |

---

## Aplicação por Produto

### Nome Social (`nome_social`)
- Compara Expressão do nome candidato × Destino do cliente
- Candidatos: sugestões do usuário + sugestões da IA (mínimo 3 variações)
- Ordenação: score DESC, nivel de descaracterização ASC

### Nome Bebê (`nome_bebe`)
- Compara Expressão de cada nome candidato × Destino calculado da data de nascimento do bebê
- Candidatos: lista fornecida pelos pais
- Considera também lições kármicas do bebê na análise

### Nome Empresa (`nome_empresa`)
- Compara Expressão do nome da empresa × Destino do sócio principal
- Se data de fundação fornecida: também compara com Destino da empresa
- Penalidade extra se tendência oculta do 8 (excesso de materialismo) for detectada

---

## Módulos de referência

| Propósito | Arquivo |
|-----------|---------|
| Cálculo de score e compatibilidade | `src/backend/numerology/harmonization.ts` |
| Produto Nome Social | `src/backend/numerology/products/nome-social.ts` |
| Produto Nome Bebê | `src/backend/numerology/products/nome-bebe.ts` |
| Produto Nome Empresa | `src/backend/numerology/products/nome-empresa.ts` |
| Componente badge UI | `src/frontend/components/app/CompatibilityBadge.tsx` |
| PDF Nome Social | `src/frontend/components/pdf/NomeSocialPDF.tsx` |
| PDF Análise Gratuita | `src/frontend/components/pdf/NomeAtualPDF.tsx` |
