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
  isCurrentNameAnalysis?: boolean;
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
    isCurrentNameAnalysis,
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

Escreva cada seção com pelo menos 3 parágrafos densos e específicos. Evite generalidades — cada afirmação deve estar ancorada nos números concretos desta pessoa. Este relatório vale R$150+ e deve justificar esse valor com revelações que a pessoa nunca ouviu sobre si mesma.

Siga EXATAMENTE esta estrutura de seções, nesta ordem:

---

## ✨ 1. Perfil Energético — Quem Você É em Essência

Escreva uma visão panorâmica e reveladora da energia do nome completo de ${primeiroNome}. Conecte **Expressão ${cincoNumeros.expressao}**, **Destino ${cincoNumeros.destino}** e **Motivação ${cincoNumeros.motivacao}** em uma narrativa coesa de identidade:
- O que a combinação única desses três números revela sobre a trajetória desta alma
- Como esses números criam uma tensão criativa ou harmonia natural entre o que ${primeiroNome} é, o que deseja e para onde vai
- Qual o "tema central" desta encarnação — a grande lição-dom que este conjunto numerológico carrega
- Como esse perfil se manifesta em escolhas de carreira, relacionamentos e modo de estar no mundo

---

## 🔢 2. A Estrela de 5 Pontas — Anatomia do Nome

Para cada um dos 5 números, escreva uma análise aprofundada e específica para ${primeiroNome}. Use pelo menos 2 parágrafos por número:

### 2.1 Expressão ${cincoNumeros.expressao} — O Dom que Veio Manifestar
Talentos naturais, forma de agir e comunicar, o que este número revela sobre como ${primeiroNome} cria impacto no mundo. Explore tanto a polaridade positiva (o dom em pleno florescimento) quanto o padrão de sombra (como esse dom pode virar excesso ou se bloquear). Como este número se manifesta especificamente na carreira e criatividade.

### 2.2 Destino ${cincoNumeros.destino} — O Chamado da Alma
O que este número representa como missão de vida. Quais desafios e conquistas este caminho naturalmente oferece. Explique como o Destino funciona como uma "bússola interna" — as situações de vida que esta pessoa inevitavelmente atrairá para crescer. Exemplos de como esse Destino se ativa em crises e grandes decisões.

### 2.3 Motivação ${cincoNumeros.motivacao} — O Desejo Mais Profundo
O que move ${primeiroNome} por dentro — o desejo da alma que nem sempre é consciente. Como essa motivação secreta influencia escolhas de parceiros, projetos e estilo de vida. O que acontece quando esse desejo é reprimido vs quando é honrado plenamente.

### 2.4 Impressão ${cincoNumeros.impressao} — Como o Mundo Lhe Vê
Como ${primeiroNome} é percebido pelas outras pessoas antes mesmo de abrir a boca. A "máscara social" que este número cria — sua utilidade e seus limites. A diferença entre quem ${primeiroNome} é por dentro (Motivação) e como aparece por fora (Impressão) — e o que essa diferença gera na vida.

### 2.5 Missão ${cincoNumeros.missao} — A Síntese da Jornada
O que a soma de Destino + Expressão revela como vocação máxima. Este número representa onde ${primeiroNome} deixará seu legado maior. Como se manifesta quando esta pessoa está vivendo sua missão plena vs quando está desviada dela.

---

## 🔺 3. Os 4 Triângulos — Geometria da Alma

Cada triângulo revela uma dimensão distinta da energia de ${primeiroNome}. Para cada um, escreva 2 parágrafos reveladores:

### Triângulo da Vida (Arcano **${todosTriangulos.vida.arcanoRegente ?? '—'}**)
A vibração base que permeia toda a trajetória de vida. Padrões que se repetem em diferentes fases e contextos. O que o Arcano **${todosTriangulos.vida.arcanoRegente ?? '—'}** revela como tema arquetípico dominante desta encarnação.

### Triângulo Pessoal (Arcano **${todosTriangulos.pessoal.arcanoRegente ?? '—'}**)
Como ${primeiroNome} se sente por dentro — o mundo emocional, as reações íntimas, o que nunca mostra. Como o Arcano **${todosTriangulos.pessoal.arcanoRegente ?? '—'}** molda a vida afetiva, o autocuidado e a relação com a vulnerabilidade.

### Triângulo Social (Arcano **${todosTriangulos.social.arcanoRegente ?? '—'}**)
Como o mundo percebe e responde a ${primeiroNome}. Que tipo de relações, oportunidades e desafios este triângulo atrai. O que o Arcano **${todosTriangulos.social.arcanoRegente ?? '—'}** diz sobre o papel social que esta pessoa tende a ocupar.

### Triângulo do Destino (Arcano **${todosTriangulos.destino.arcanoRegente ?? '—'}**)
Os resultados que ${primeiroNome} tende a colher — o que a energia deste triângulo produz como frutos ao longo da vida. O Arcano **${todosTriangulos.destino.arcanoRegente ?? '—'}** como revelador da missão e dos ciclos de amadurecimento.

${bloqueios.length > 0
  ? `**Para cada bloqueio detectado, escreva uma análise aprofundada de 2-3 parágrafos:**
- O impacto específico e concreto deste bloqueio na vida de ${primeiroNome} (em que situações ele aparece, como sabota)
- Em quais áreas da vida (carreira, saúde, relacionamentos, finanças) ele se manifesta com mais força
- O aspecto de saúde associado: a tensão emocional-somática que este padrão pode gerar no corpo (com sensibilidade)

#### ⚡ Antídoto Prático para cada bloqueio:
Para CADA bloqueio, escreva um subitem "**Antídoto Prático:**" com 3 ações concretas e específicas que ${primeiroNome} pode adotar nos próximos 30 dias. Seja cirúrgico e acionável.`
  : `**Celebre a ausência de bloqueios:** Escreva 2 parágrafos sobre o que significa ter os 4 triângulos limpos. Que tipo de fluidez, resiliência e facilidade isso cria na vida de ${primeiroNome}.`
}

---

## ⚖️ 4. O Peso do Passado — Karma, Lições e Tendências

${debitosCarmicos.length > 0
  ? `${primeiroNome} carrega ${debitosCarmicos.length} débito(s) kármico(s) nesta encarnação. Para cada débito, escreva uma análise profunda e compassiva:
- O contexto espiritual-histórico deste débito: que padrão de encarnações passadas ele representa
- Como ele se manifesta especificamente em relacionamentos, finanças, carreira ou saúde nesta vida
- A "lei de compensação" que este número exige: o que precisa ser reintegrado conscientemente
- 2–3 práticas concretas e transformadoras para quitar este débito nesta encarnação`
  : `${primeiroNome} não possui débitos kármicos — escreva 1 parágrafo celebrando essa raridade e o que ela revela sobre a maturidade desta alma.`
}

${licoesCarmicas.length > 0
  ? `${primeiroNome} traz ${licoesCarmicas.length} lição(ões) kármica(s). Para cada lição, escreva com profundidade:
- O "talento escondido" por trás desta ausência numérica — o que esta alma ainda não dominou, mas veio aprender
- Como esta lacuna se manifesta concretamente no dia a dia (situações em que ${primeiroNome} se sente inapto ou evita)
- O "caminho de ativação": 2–3 práticas específicas (atividades, hábitos, comportamentos) para desenvolver esta qualidade`
  : `Ausência de lições kármicas — ${primeiroNome} traz todos os números de 1 a 8 representados. Escreva 1 parágrafo sobre o que essa completude vibracional proporciona.`
}

${tendenciasOcultas.length > 0
  ? `Tendências ocultas presentes — números com repetição excessiva que criam intensidade vibracional. Para cada tendência, explique:
- O "superpoder mal direcionado": que dom extraordinário essa repetição confere, e como ele pode se tornar excesso
- Situações concretas em que esse excesso se manifesta como armadilha, obsessão ou ponto cego
- A "arte do equilíbrio": como ${primeiroNome} pode usar essa força de forma estratégica e sustentável`
  : ''
}

---

## 🌙 5. O Arcano Regente — O Mestre Deste Ciclo

O **Arcano ${arcanoRegente ?? '—'}** governa o triângulo central de ${primeiroNome}. Escreva 3 parágrafos reveladores:
- O arquétipo profundo que este arcano representa: sua mitologia, sua lição universal e como ela ecoa nesta vida específica
- Qual energia este arcano traz como presente e qual desafio ele convida a superar
- Como a presença deste arcano regente se manifestou como padrão nas principais fases da vida de ${primeiroNome}
- O convite concreto deste arcano: o que precisa ser honrado, desenvolvido ou liberado neste ciclo atual

---

${arquetipo ? `## 🎭 6. O Arquétipo — A Identidade Mítica

O número de **Expressão ${cincoNumeros.expressao}** revela que ${primeiroNome} carrega o arquétipo do(a) **${arquetipo.nome}**.

Essência: *"${arquetipo.essencia}"*
Manifestações positivas: ${arquetipo.expressaoPositiva.join(' | ')}
Sombra a integrar: ${arquetipo.expressaoSombra.join(' | ')}
Figuras míticas de referência: ${arquetipo.figurasMiticas.join(', ')}

Escreva 4 parágrafos que:
- Apresentem o arquétipo do(a) **${arquetipo.nome}** como a identidade narrativa profunda de ${primeiroNome}
- Conectem a essência do arquétipo à jornada numerológica analisada — como os bloqueios, lições e destino tecem a história deste arquétipo
- Mostrem como a **sombra** (${arquetipo.sombra}) se manifesta nos padrões identificados e o que integrá-la muda
- Usem linguagem mítica E cotidiana — o simbólico ancorado em situações concretas do dia a dia

---

` : ''}## 🔮 ${arquetipo ? '7' : '6'}. O Nome como Ferramenta de Poder Energético

${isCurrentNameAnalysis 
  ? `A vibração que o seu nome de batismo produz não é apenas simbólica — ela organiza padrões concretos de atração e resposta do ambiente. Escreva 3 parágrafos sobre:
- O que essa vibração-base cria naturalmente quando ${primeiroNome} passa a usá-la com intenção consciente
- Quais padrões de relacionamento, oportunidade ou autossabotagem tendem a ressoar com essa frequência de nascença
- Como assumir plenamente o próprio nome atual pode transmutar as dificuldades reveladas e iniciar um novo ciclo de magnetismo pessoal`
  : `A mudança vibracional que o nome magnetizado produz não é apenas simbólica — ela reorganiza padrões concretos de atração e resposta do ambiente. Escreva 3 parágrafos sobre:
- O que muda na vibração-base quando ${primeiroNome} começa a usar o novo nome conscientemente
- Quais padrões de relacionamento, oportunidade ou autossabotagem tendem a se reorganizar com a mudança de frequência
- O período de adaptação vibracional: como funcionam os primeiros 90 dias de uso consciente do nome magnetizado, e o que observar como sinal de integração`
}

---

## ✍️ ${arquetipo ? '8' : '7'}. Manual de Assinatura Fluída

Com base nos números de ${primeiroNome}, escreva orientações práticas de grafoscopia para a assinatura de seu nome:

- **Inclinação:** A inclinação ideal da escrita e o que ela projeta energeticamente para este perfil
- **Traços e Letras:** Quais letras devem ser escritas de forma aberta/fluida — e especificamente quais traços devem ser evitados (traços que cruzam, cortam ou fecham o movimento)
- **Ritmo e Pressão:** Como a pressão da caneta e o ritmo da escrita influenciam a vibração — leve vs marcado para este número
- **Iniciais e Maiúsculas:** Como trabalhar as letras iniciais para maximizar a projeção energética deste perfil
${isCurrentNameAnalysis ? '- **Prática Diária:** Como escrever o próprio nome pode se tornar um ritual de presença e ancoramento' : '- **Prática Recomendada:** Um protocolo de ativação — quantas vezes por dia, em quais contextos, e como criar o hábito de usar o nome'}

---

## 🌟 ${arquetipo ? '9' : '8'}. Síntese e Mensagem Final

Escreva uma conclusão profunda e poderosa (4 parágrafos) que:
- Conecte todos os elementos — números, bloqueios, karma, arcano e arquétipo — em uma narrativa de propósito único para ${primeiroNome}
- Fale em segunda pessoa direta: "você", "sua jornada", "sua missão"
- Nomeie o presente que este trabalho numerológico representa e o que se abre com a nova vibração
- Encerre com uma mensagem transformadora, esperançosa e de alta frequência sobre o que está por vir

---

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Use estruturação Markdown rigorosa com Hash Headers (##, ###, ####).
2. NUNCA use títulos apenas com letras maiúsculas. SEMPRE use Hash Headers com emoticon.
3. **Negrito:** Utilize negrito (**) de forma natural e estratégica para destacar ideias principais, palavras-chave e pontos de atenção importantes no texto. Evite colocar trechos inteiros ou frases longas em negrito.
4. SEMPRE duplo espaçamento entre parágrafos — texto arejado e escaneável.
5. Parágrafos com no máximo 4 linhas.
6. Escreva em segunda pessoa de forma natural e direta.
7. ${primeiroNome} pode aparecer no máximo 1 vez por seção ##.
8. Escreva com profundidade real, especificidade e poder transformador — cada parágrafo deve revelar algo que esta pessoa nunca viu assim sobre si mesma.`;
}
