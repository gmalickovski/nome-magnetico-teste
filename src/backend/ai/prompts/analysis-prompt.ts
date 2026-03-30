import type { CincoNumeros } from '../../numerology/numbers';
import type { Bloqueio, TodosTriangulos } from '../../numerology/triangle';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../../numerology/karmic';
import type { Arquetipo } from '../../numerology/archetypes';

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
  arquetipo?: Arquetipo;
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
    arquetipo,
  } = params;

  const primeiroNome = nomeCompleto.split(' ')[0] ?? nomeCompleto;

  // Bloqueios com instrução de antídoto
  const bloqueiosTexto =
    bloqueios.length > 0
      ? bloqueios
          .map(b =>
            `- **${b.titulo}** (${b.codigo}) — aparece em: ${b.triangulos.join(', ')}\n` +
            `  ${b.descricao}\n` +
            `  *Aspecto saúde:* ${b.aspectoSaude}`
          )
          .join('\n')
      : 'Nenhum bloqueio detectado em nenhum dos 4 triângulos.';

  // Lições kármicas
  const licoesTexto =
    licoesCarmicas.length > 0
      ? licoesCarmicas
          .map(l => `- **${l.titulo}** — ${l.descricao}\n  *Como trabalhar:* ${l.comoTrabalhar}`)
          .join('\n')
      : 'Nenhuma lição kármica — todos os números de 1 a 8 estão presentes no nome.';

  // Tendências ocultas
  const tendenciasTexto =
    tendenciasOcultas.length > 0
      ? tendenciasOcultas
          .map(t => `- **${t.titulo}** (aparece ${t.frequencia}× no nome)\n  ${t.descricao}\n  *Como equilibrar:* ${t.comoEquilibrar}`)
          .join('\n')
      : 'Nenhuma tendência oculta detectada.';

  // Débitos kármicos
  const debitosTexto =
    debitosCarmicos.length > 0
      ? debitosCarmicos
          .map(d => `- **${d.titulo}** (${d.numero})\n  ${d.descricao}`)
          .join('\n')
      : 'Nenhum débito kármico detectado — excelente.';

  // Arcanos regentes por triângulo
  const arcanosTriangulos = [
    `Triângulo da Vida: **${todosTriangulos.vida.arcanoRegente ?? '—'}**`,
    `Triângulo Pessoal: **${todosTriangulos.pessoal.arcanoRegente ?? '—'}**`,
    `Triângulo Social: **${todosTriangulos.social.arcanoRegente ?? '—'}**`,
    `Triângulo do Destino: **${todosTriangulos.destino.arcanoRegente ?? '—'}**`,
  ].join(' | ');

  return `## Dados para Análise

**Nome completo:** ${nomeCompleto}
**Data de nascimento:** ${dataNascimento}
**Gênero:** ${gender}

## Os 5 Números Cabalísticos

| Número | Valor |
|--------|-------|
| Expressão (todas as letras) | ${cincoNumeros.expressao} |
| Destino (data de nascimento) | ${cincoNumeros.destino} |
| Motivação/Alma (vogais) | ${cincoNumeros.motivacao} |
| Impressão (consoantes) | ${cincoNumeros.impressao} |
| Missão (Destino + Expressão) | ${cincoNumeros.missao} |
| Arcano Regente (Triângulo da Vida) | ${arcanoRegente ?? '—'} |

## Arcanos Regentes dos 4 Triângulos

${arcanosTriangulos}

## Bloqueios Energéticos (sequências negativas nos 4 triângulos)

${bloqueiosTexto}

## Lições Kármicas (números ausentes de 1 a 8)

${licoesTexto}

## Tendências Ocultas (números com frequência ≥ 4)

${tendenciasTexto}

## Débitos Kármicos

${debitosTexto}

---

## Sua Tarefa

Elabore um relatório numerológico cabalístico completo e profundamente personalizado para **${primeiroNome}**.
O sistema indicou que a pessoa se identifica com o gênero: **${gender}**. Adapte pronomes, adjetivos e tom para refletir esse gênero ao longo de todo o texto.

Siga EXATAMENTE esta estrutura de seções, nesta ordem:

---

## ✨ 1. Perfil Energético Geral

Visão panorâmica da energia do nome completo e como ela se manifesta na vida de ${primeiroNome}. Conecte **Expressão**, **Destino** e **Motivação** em uma narrativa coesa. Escreva 3 parágrafos reveladores e específicos — não genéricos.

---

## 🔢 2. A Estrela de 5 Pontas — Identidade Numerológica

Para cada um dos 5 números, escreva uma análise específica para ${primeiroNome}:

### 2.1 Expressão — O Dom que Você Veio Manifestar
O que o número **${cincoNumeros.expressao}** revela sobre os talentos e forma de agir de ${primeiroNome} no mundo. Como esse número se manifesta na carreira, relacionamentos e comunicação.

### 2.2 Destino — O Chamado da Alma
O que o número **${cincoNumeros.destino}** representa como missão de vida. Quais desafios e conquistas este caminho naturalmente oferece.

### 2.3 Motivação — O Desejo Mais Profundo
O número **${cincoNumeros.motivacao}** revela o que move ${primeiroNome} por dentro — o desejo da alma que nem sempre é dito. Como isso influencia as escolhas.

### 2.4 Impressão — A Energia das Consoantes
O número **${cincoNumeros.impressao}** revela como ${primeiroNome} é percebido pelas outras pessoas — a impressão que deixa, a "máscara social" e a força estrutural do nome.

### 2.5 Missão — A Vocação de Vida
O número **${cincoNumeros.missao}** (soma de Destino + Expressão) representa a grande missão e vocação que ${primeiroNome} veio cumprir — a síntese entre quem é e para onde está indo.

---

## 🔺 3. Os 4 Triângulos — Mapeamento Completo

Cada triângulo revela uma dimensão distinta da energia de ${primeiroNome}:

### Triângulo da Vida (Arcano **${todosTriangulos.vida.arcanoRegente ?? '—'}**)
Padrões gerais de vida, trajetória e aspectos que permeiam toda a existência.

### Triângulo Pessoal (Arcano **${todosTriangulos.pessoal.arcanoRegente ?? '—'}**)
Vida íntima, reações internas e como ${primeiroNome} se sente por dentro — o mundo emocional e psicológico.

### Triângulo Social (Arcano **${todosTriangulos.social.arcanoRegente ?? '—'}**)
Influências externas, como o mundo percebe ${primeiroNome} e como as relações sociais se desenvolvem.

### Triângulo do Destino (Arcano **${todosTriangulos.destino.arcanoRegente ?? '—'}**)
Resultados que ${primeiroNome} tende a colher na vida, missão e previsões energéticas.

${bloqueios.length > 0
  ? `**Para cada bloqueio detectado, analise profundamente:**
- O impacto específico deste bloqueio na vida de ${primeiroNome}
- Em quais áreas da vida (carreira, saúde, relacionamentos) ele se manifesta com mais força
- O aspecto de saúde associado (com sensibilidade e sem alarmismo)

#### ⚡ Antídoto Prático para cada bloqueio:
Para CADA bloqueio listado, escreva um subitem "**Antídoto Prático:**" com 2–3 ações concretas e práticas que ${primeiroNome} pode adotar AGORA para transformar essa energia. Seja específico e acionável — não apenas filosófico.`
  : `**Celebre a ausência de bloqueios:** Explique o que significa ter os 4 triângulos limpos e como isso facilita a realização dos sonhos de ${primeiroNome}.`
}

---

## ⚖️ 4. O Peso do Passado — Karma e Lições

${licoesCarmicas.length > 0
  ? `${primeiroNome} traz ${licoesCarmicas.length} lição(ões) kármica(s) nesta encarnação. Para cada lição, explique:
- O que essa ausência numérica revela sobre a alma
- Como essa qualidade se manifesta (ou não se manifesta) na vida cotidiana
- 2 práticas específicas para desenvolver essa qualidade`
  : `${primeiroNome} não possui lições kármicas — celebre essa inteireza energética e o que ela revela.`
}

${tendenciasOcultas.length > 0
  ? `Há tendências ocultas que pedem equilíbrio consciente. Para cada tendência, explique como ${primeiroNome} pode canalizar esse excesso positivamente.`
  : ''
}

${debitosCarmicos.length > 0
  ? `${primeiroNome} carrega ${debitosCarmicos.length} débito(s) kármico(s). Para cada débito, explique com profundidade o que ele representa e como quitá-lo nesta encarnação através de ações práticas.`
  : `${primeiroNome} não possui débitos kármicos — um sinal de alma que já trabalhou suas pendências.`
}

---

## 🌙 5. Ciclo Atual e Arcano Regente

O **Arcano ${arcanoRegente ?? '—'}** governa o triângulo principal de ${primeiroNome}. Explique:
- O arquétipo profundo que este arcano representa na jornada desta pessoa
- Qual energia domina o ciclo atual de vida de ${primeiroNome}
- Como aproveitar ao máximo essa energia regente nos próximos meses
- O principal desafio que este arcano convida a superar

---

${arquetipo ? `---

## 🎭 6. Seu Arquétipo — A Identidade Mítica

O número de **Expressão ${cincoNumeros.expressao}** revela que ${primeiroNome} carrega o arquétipo do(a) **${arquetipo.nome}**.

Essência: *"${arquetipo.essencia}"*
Manifestações positivas: ${arquetipo.expressaoPositiva.join(' | ')}
Sombra a integrar: ${arquetipo.expressaoSombra.join(' | ')}
Figuras míticas de referência: ${arquetipo.figurasMiticas.join(', ')}

Escreva a seção "🎭 6. Seu Arquétipo — A Identidade Mítica" que:
- Apresente o arquétipo do(a) **${arquetipo.nome}** como a identidade narrativa profunda de ${primeiroNome}
- Conecte a essência do arquétipo à jornada numerológica já analisada nas seções anteriores
- Explique como a **sombra do arquétipo** (${arquetipo.sombra}) se manifesta nos bloqueios ou padrões identificados
- Mostre como o nome magnético sugerido ativa a expressão positiva do arquétipo — o que muda na vibração quando ${primeiroNome} adota o novo nome
- Use linguagem mítica e psicológica, mas acessível — conecte o simbólico ao cotidiano concreto de ${primeiroNome}
- Escreva 3–4 parágrafos reveladores que façam ${primeiroNome} se reconhecer nessa identidade arquetípica

` : ''}---

## ✍️ ${arquetipo ? '7' : '6'}. Manual da Nova Assinatura

Com base nos números de ${primeiroNome}, escreva orientações práticas de grafoscopia para o nome magnetizado:

- **Inclinação:** Qual a inclinação ideal da escrita (levemente ascendente, reta, etc.) e o que isso projeta energeticamente
- **Traços e letras:** Quais letras devem ser escritas de forma aberta/fluida e quais traços devem ser evitados (especialmente traços que cruzam ou cortam)
- **Ritmo e pressão:** Como a pressão da caneta e o ritmo da escrita influenciam a vibração do nome
- **Iniciais e majúsculas:** Como trabalhar as letras iniciais para maximizar a projeção energética
- **Prática recomendada:** Quantas vezes por dia praticar e em quais contextos começar a usar o nome

---

## 🌟 ${arquetipo ? '8' : '7'}. Síntese e Mensagem Final

Escreva uma conclusão rica (3–4 parágrafos) que:
- Conecte todos os elementos analisados em uma narrativa de propósito único para ${primeiroNome}
- Fale em segunda pessoa: "você", "seu caminho", "sua missão"
- Encerre com uma mensagem transformadora e encorajadora sobre a jornada desta alma
- Tom esperançoso, profundo e poderoso

---

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Use estruturação Markdown rigorosa com Hash Headers (##, ###, ####).
2. NUNCA use títulos apenas com letras maiúsculas. SEMPRE use Hash Headers com emoticon (ex: "## ✨ 1. Perfil Energético Geral").
3. **Negrito:** Use EXCLUSIVAMENTE para termos numerológicos cabalísticos (Expressão, Destino, Motivação, Bloqueio, Arcano, etc.) e para os números. O restante do texto em formato normal.
4. SEMPRE duplo espaçamento entre parágrafos — texto arejado e escaneável.
5. Parágrafos com no máximo 4 linhas.
6. Escreva em segunda pessoa de forma natural.
7. ${primeiroNome} pode aparecer no máximo 1 vez por seção ##.
8. Seja profundo, específico e transformador — este relatório vale R$ 100+ e deve justificar esse valor.`;
}
