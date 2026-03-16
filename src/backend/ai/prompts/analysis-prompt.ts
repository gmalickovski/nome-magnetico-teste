import type { CincoNumeros } from '../../numerology/numbers';
import type { Bloqueio } from '../../numerology/triangle';

export interface AnalysisPromptParams {
  nomeCompleto: string;
  dataNascimento: string;
  cincoNumeros: CincoNumeros;
  arcanoRegente: number | null;
  bloqueios: Bloqueio[];
}

export function buildAnalysisPrompt(params: AnalysisPromptParams): string {
  const { nomeCompleto, dataNascimento, cincoNumeros, arcanoRegente, bloqueios } = params;

  const bloqueiosTexto =
    bloqueios.length > 0
      ? bloqueios.map(b => `- ${b.titulo}: ${b.descricao}`).join('\n')
      : 'Nenhum bloqueio detectado no Triângulo da Vida.';

  return `## Dados para análise

**Nome completo:** ${nomeCompleto}
**Data de nascimento:** ${dataNascimento}

## Números calculados

| Número | Valor |
|--------|-------|
| Expressão | ${cincoNumeros.expressao} |
| Destino | ${cincoNumeros.destino} |
| Motivação/Alma | ${cincoNumeros.motivacao} |
| Missão/Impressão | ${cincoNumeros.missao} |
| Personalidade | ${cincoNumeros.personalidade} |
| Arcano Regente | ${arcanoRegente ?? 'Não calculado'} |

## Bloqueios detectados no Triângulo da Vida

${bloqueiosTexto}

---

## Sua tarefa

Elabore uma análise numerológica cabalística completa e personalizada para **${nomeCompleto.split(' ')[0]}**, seguindo esta estrutura:

### 1. Perfil Energético Geral (2-3 parágrafos)
Uma visão geral da energia do nome completo e como ela se manifesta na vida desta pessoa.

### 2. Os 5 Números — Sua Identidade Numerológica
Para cada número, explique:
- O que significa no contexto desta pessoa especificamente
- Como ele se manifesta nas áreas de vida (relacionamentos, carreira, espiritualidade)
- O potencial a ser desenvolvido

### 3. Análise dos Bloqueios Energéticos
${bloqueios.length > 0
  ? 'Para cada bloqueio detectado, explique profundamente o impacto na vida desta pessoa e o caminho de transformação.'
  : 'Celebre a ausência de bloqueios e explique o que isso significa para o fluxo energético desta pessoa.'}

### 4. O Arcano Regente
Explique como o arcano ${arcanoRegente} influencia o caminho de vida e destino desta pessoa.

### 5. Síntese e Direcionamento
Uma síntese inspiradora que conecta todos os números e aponta um caminho de crescimento e realização.

Seja específico ao nome ${nomeCompleto.split(' ')[0]} — use o nome ao longo da análise para personalizá-la.`;
}
