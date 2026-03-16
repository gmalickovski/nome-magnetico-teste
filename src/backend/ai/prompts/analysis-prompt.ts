import type { CincoNumeros } from '../../numerology/numbers';
import type { Bloqueio, TodosTriangulos } from '../../numerology/triangle';
import type { LicaoCarmica, TendenciaOculta } from '../../numerology/karmic';

export interface AnalysisPromptParams {
  nomeCompleto: string;
  dataNascimento: string;
  cincoNumeros: CincoNumeros;
  arcanoRegente: number | null;
  todosTriangulos: TodosTriangulos;
  bloqueios: Bloqueio[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
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
  } = params;

  const primeiroNome = nomeCompleto.split(' ')[0] ?? nomeCompleto;

  // Bloqueios
  const bloqueiosTexto =
    bloqueios.length > 0
      ? bloqueios
          .map(b => `- **${b.titulo}** (aparece em: ${b.triangulos.join(', ')})\n  ${b.descricao}\n  *Aspecto saúde:* ${b.aspectoSaude}`)
          .join('\n')
      : 'Nenhum bloqueio detectado em nenhum dos 4 triângulos.';

  // Lições cármicas
  const licoesTexto =
    licoesCarmicas.length > 0
      ? licoesCarmicas
          .map(l => `- **${l.titulo}**\n  ${l.descricao}`)
          .join('\n')
      : 'Nenhuma lição cármica — todos os números de 1 a 8 estão presentes no nome.';

  // Tendências ocultas
  const tendenciasTexto =
    tendenciasOcultas.length > 0
      ? tendenciasOcultas
          .map(t => `- **${t.titulo}** (aparece ${t.frequencia}× no nome)\n  ${t.descricao}`)
          .join('\n')
      : 'Nenhuma tendência oculta detectada.';

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

## Os 5 Números Cabalísticos

| Número | Valor |
|--------|-------|
| Expressão (todas as letras) | ${cincoNumeros.expressao} |
| Destino (data de nascimento) | ${cincoNumeros.destino} |
| Motivação / Alma (vogais) | ${cincoNumeros.motivacao} |
| Missão / Impressão (consoantes) | ${cincoNumeros.missao} |
| Personalidade (primeiro nome) | ${cincoNumeros.personalidade} |
| Arcano Regente (Triângulo da Vida) | ${arcanoRegente ?? '—'} |

## Arcanos Regentes dos 4 Triângulos

${arcanosTriangulos}

## Bloqueios Energéticos (sequências negativas nos 4 triângulos)

${bloqueiosTexto}

## Lições Cármicas (números ausentes de 1 a 8)

${licoesTexto}

## Tendências Ocultas (números com frequência ≥ 4)

${tendenciasTexto}

---

## Sua tarefa

Elabore uma análise numerológica cabalística completa e profundamente personalizada para **${primeiroNome}**, seguindo esta estrutura:

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

### 4. Lições Cármicas e Tendências Ocultas
${licoesCarmicas.length > 0 ? `${primeiroNome} traz ${licoesCarmicas.length} lição(ões) cármica(s) nesta encarnação. Explique como trabalhar cada uma de forma prática.` : `${primeiroNome} não possui lições cármicas — celebre esta inteireza energética.`}
${tendenciasOcultas.length > 0 ? `Há tendências ocultas que precisam de equilíbrio consciente. Explique como ${primeiroNome} pode canalizar esses excessos positivamente.` : ''}

### 5. Síntese e Direcionamento
Uma síntese inspiradora conectando todos os elementos e apontando um caminho de crescimento e realização específico para ${primeiroNome}.

Use o nome **${primeiroNome}** ao longo de toda a análise para personalizá-la. Seja profundo, específico e inspirador.`;
}
