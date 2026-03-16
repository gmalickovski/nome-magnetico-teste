import type { VariacaoNome } from '../../numerology/suggestions';
import type { CincoNumeros } from '../../numerology/numbers';

export interface SuggestionsPromptParams {
  nomeCompleto: string;
  cincoNumeros: CincoNumeros;
  variacoesCandidatas: VariacaoNome[];
}

export function buildSuggestionsPrompt(params: SuggestionsPromptParams): string {
  const { nomeCompleto, cincoNumeros, variacoesCandidatas } = params;

  const candidatasTexto = variacoesCandidatas
    .slice(0, 8)
    .map(
      v =>
        `- **${v.nome}** | Expressão: ${v.numerosExpressao} | Motivação: ${v.motivacao} | Missão: ${v.missao} | Score: ${v.score}/100 | ${v.justificativa}`
    )
    .join('\n');

  return `## Contexto

**Nome original:** ${nomeCompleto}
**Expressão original:** ${cincoNumeros.expressao}
**Destino:** ${cincoNumeros.destino}

## Candidatas a Nomes Magnéticos (sem bloqueios)

${candidatasTexto}

---

## Sua tarefa

Das candidatas acima, selecione e apresente as **3 melhores variações** como Nomes Magnéticos para ${nomeCompleto.split(' ')[0]}.

Para cada nome selecionado, forneça:

### Nome: [nome completo]
**Por que este nome é magnético:**
Explique em 2-3 frases por que esta variação remove os bloqueios e potencializa a energia desta pessoa.

**Harmonia numérica:**
Como os números deste nome se relacionam com o Destino (${cincoNumeros.destino}) e os demais números da pessoa.

**Como usar:**
Orientação prática — em quais contextos usar este nome para maximizar sua vibração (profissional, espiritual, social).

**Energia predominante:**
A qualidade energética principal que este nome projeta ao mundo.

Seja entusiasta e inspirador — estes são nomes que podem transformar a vida da pessoa!`;
}
