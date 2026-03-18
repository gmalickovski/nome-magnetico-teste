import type { CincoNumeros } from '../../numerology/numbers';
import type { Bloqueio, TodosTriangulos } from '../../numerology/triangle';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../../numerology/karmic';

export interface AnalysisPromptParams {
  nomeCompleto: string;
  dataNascimento: string;
  cincoNumeros: CincoNumeros;
  arcanoRegente: number | null;
  todosTriangulos: TodosTriangulos;
  bloqueios: Bloqueio[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  debitosCarmicos: DebitoCarmicoInfo[];
  gender: string;
}

export function buildAnalysisPrompt(params: AnalysisPromptParams): string {
  const {
    nomeCompleto,
    dataNascimento,
    cincoNumeros,
    arcanoRegente,
    todosTriangulos,
    bloqueios,
    licoesCarmicas,
    tendenciasOcultas,
    debitosCarmicos,
    gender,
  } = params;

  const primeiroNome = nomeCompleto.split(' ')[0] ?? nomeCompleto;

  // Bloqueios
  const bloqueiosTexto =
    bloqueios.length > 0
      ? bloqueios
          .map(b => `- **${b.titulo}** (aparece em: ${b.triangulos.join(', ')})\n  ${b.descricao}\n  *Aspecto saúde:* ${b.aspectoSaude}`)
          .join('\n')
      : 'Nenhum bloqueio detectado em nenhum dos 4 triângulos.';

  // Lições kármics
  const licoesTexto =
    licoesCarmicas.length > 0
      ? licoesCarmicas
          .map(l => `- **${l.titulo}**\n  ${l.descricao}`)
          .join('\n')
      : 'Nenhuma lição kármic — todos os números de 1 a 8 estão presentes no nome.';

  // Tendências ocultas
  const tendenciasTexto =
    tendenciasOcultas.length > 0
      ? tendenciasOcultas
          .map(t => `- **${t.titulo}** (aparece ${t.frequencia}× no nome)\n  ${t.descricao}`)
          .join('\n')
      : 'Nenhuma tendência oculta detectada.';

  // Débitos kármicos
  const debitosTexto =
    debitosCarmicos.length > 0
      ? debitosCarmicos
          .map(d => `- **${d.titulo}**\n  ${d.descricao}`)
          .join('\n')
      : 'Nenhum débito kármico detectado — excelente.';

  // Arcanos regentes por triângulo
  const arcanosTriangulos = [
    `Triângulo da Vida: ${todosTriangulos.vida.arcanoRegente ?? '—'}`,
    `Triângulo Pessoal: ${todosTriangulos.pessoal.arcanoRegente ?? '—'}`,
    `Triângulo Social: ${todosTriangulos.social.arcanoRegente ?? '—'}`,
    `Triângulo do Destino: ${todosTriangulos.destino.arcanoRegente ?? '—'}`,
  ].join(' | ');

  return `## Dados para análise

**Nome completo:** ${nomeCompleto}
**Data de nascimento:** ${dataNascimento}
**Gênero Identificado:** ${gender}

## Os 5 Números Cabalísticos

| Número | Valor |
|--------|-------|
| Expressão (todas as letras) | ${cincoNumeros.expressao} |
| Destino (data de nascimento) | ${cincoNumeros.destino} |
| Motivação (vogais) | ${cincoNumeros.motivacao} |
| Missão (consoantes) | ${cincoNumeros.missao} |
| Impressão (primeiro nome) | ${cincoNumeros.personalidade} |
| Arcano Regente (Triângulo da Vida) | ${arcanoRegente ?? '—'} |

## Arcanos Regentes dos 4 Triângulos

${arcanosTriangulos}

## Bloqueios Energéticos (sequências negativas nos 4 triângulos)

${bloqueiosTexto}

## Lições Kármicas (números ausentes de 1 a 8)

${licoesTexto}

## Tendências Ocultas (números com frequência ≥ 4)

${tendenciasTexto}

## Débitos Kármicos (pendências de encarnações passadas)

${debitosTexto}

---

## Sua tarefa

Elabore uma análise numerológica cabalística completa e profundamente personalizada para **${primeiroNome}**. 
O sistema indicou que a pessoa se identifica com o gênero: **${gender}**. Adapte os pronomes, os adjetivos e o tom da leitura para refletir adequadamente e com sensibilidade esse gênero ao longo de todo o texto.

Siga esta estrutura:

### 1. Perfil Energético Geral (2-3 parágrafos)
Uma visão geral da energia do nome completo e como ela se manifesta na vida desta pessoa. Conecte Expressão, Destino e Motivação.

### 2. Os 5 Números — Identidade Numerológica
Para cada número, explique especificamente para ${primeiroNome}:
- O que significa no contexto desta pessoa
- Como ele se manifesta nas principais áreas da vida (relacionamentos, carreira, espiritualidade)
- O potencial a ser desenvolvido

### 3. Análise dos 4 Triângulos
Cada triângulo revela uma dimensão distinta:
- **Triângulo da Vida** — aspectos gerais e padrões de vida
- **Triângulo Pessoal** — vida íntima, reações internas, como a pessoa se sente por dentro
- **Triângulo Social** — influências externas, como o mundo percebe ${primeiroNome}
- **Triângulo do Destino** — resultados esperados, missão de vida e previsões
${bloqueios.length > 0 ? 'Para cada bloqueio detectado, explique profundamente o impacto e o caminho de transformação. Mencione o aspecto de saúde com sensibilidade.' : 'Celebre a ausência de bloqueios e explique o que isso significa para o fluxo energético.'}

### 4. Lições Kármicas, Tendências Ocultas e Débitos Kármicos
${licoesCarmicas.length > 0 ? `${primeiroNome} traz ${licoesCarmicas.length} lição(ões) kármic(s) nesta encarnação. Explique como trabalhar cada uma de forma prática.` : `${primeiroNome} não possui lições kármics — celebre esta inteireza energética.`}
${tendenciasOcultas.length > 0 ? `Há tendências ocultas que precisam de equilíbrio consciente. Explique como ${primeiroNome} pode canalizar esses excessos positivamente.` : ''}
${debitosCarmicos.length > 0 ? `${primeiroNome} carrega ${debitosCarmicos.length} débito(s) kármico(s). Explique com profundidade o significado de cada um e como essa pessoa pode quitá-los conscientemente nesta encarnação.` : `${primeiroNome} não possui débitos kármicos — um sinal de alma que já trabalhou suas pendências. Celebre essa leveza.`}

### ⚡ 5. Síntese e Direcionamento
Uma síntese inspiradora conectando todos os elementos e apontando um caminho de crescimento e realização específico para ${primeiroNome}.

## 🌟 6. Conclusão — A Jornada de ${primeiroNome}
Escreva uma conclusão rica (3–4 parágrafos) que:
- Faça um apanhado geral de todos os elementos analisados (números, triângulos, bloqueios, lições, destino)
- Encerre com uma mensagem final sobre a jornada desta pessoa
- Fale em segunda pessoa: "você", "seu caminho", "sua missão"
- Tom esperançoso, transformador e encorajador
- Encerre com uma mensagem final poderosa sobre a jornada desta pessoa

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Você DEVE usar estruturação Markdown rigorosa com Hash Headers.
2. NUNCA use títulos apenas com letras maiúsculas. Use SEMPRE Hash Headers com emoticon (ex: "## ✨ 1. Perfil Energético Geral").
3. Cada seção principal começa com "## [emoticon] [número]. [Título]" — use emoticons diferentes em cada seção.
4. Use negrito (**) em termos de numerologia e onde ajudar o leitor a entender melhor o texto.
5. SEMPRE duplo espaçamento entre parágrafos — o texto deve ser arejado e escaneável.
6. Parágrafos com no máximo 4 linhas — quebre parágrafos longos em dois.
7. Escreva em segunda pessoa de forma natural — como um mentor falando. Não repita pronomes possessivos desnecessariamente.

${primeiroNome} pode aparecer esporadicamente, no máximo 1 vez por seção ##. Seja profundo, específico e transformador.`;
}
