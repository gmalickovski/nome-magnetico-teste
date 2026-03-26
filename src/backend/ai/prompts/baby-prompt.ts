import type { AnaliseNomeBebe, ResultadoNomeBebe } from '../../numerology/products/nome-bebe';
import type { Arquetipo } from '../../numerology/archetypes';

export interface BabyPromptParams {
  resultado: ResultadoNomeBebe;
  nomePai?: string;
  nomeMae?: string;
  generoPreferido?: string;
  estiloPreferido?: string;
  caracteristicasDesejadas?: string;
  arquetipo?: Arquetipo;
}

export function buildBabyAnalysisPrompt(params: BabyPromptParams): string {
  const { resultado, nomePai, nomeMae, generoPreferido, estiloPreferido, caracteristicasDesejadas, arquetipo } = params;
  const { sobrenomesDisponiveis, dataNascimento, destino, nomesCandidatos, melhorNome } = resultado;

  const parentesco = [nomePai && `Pai: ${nomePai}`, nomeMae && `Mãe: ${nomeMae}`]
    .filter(Boolean)
    .join(' | ') || 'Não informado';

  const isSurpresa = generoPreferido?.toLowerCase() === 'surpresa';

  const candidatosTexto = nomesCandidatos
    .slice(0, 10)
    .map((a, i) => {
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const bloqueioInfo = a.temBloqueio
        ? `⚠ ${a.bloqueios.length} bloqueio(s): ${a.bloqueios.map(b => b.codigo).join(', ')}`
        : '✓ Sem bloqueios';
      const debitoInfo = a.debitosCarmicos.length === 0
        ? '✓ Sem débitos kármicos'
        : `⚠ Débitos: ${a.debitosCarmicos.map(d => d.numero).join(', ')}`;
      return `${rank} **${a.nomeCompleto}** | Expressão: ${a.expressao} | Motivação: ${a.motivacao} | Missão: ${a.missao} | Impressão: ${a.impressao} | Compatibilidade: ${a.compatibilidade} | Score: ${a.score}/100
   ${bloqueioInfo} | ${debitoInfo}
   Lições kármicas: ${a.licoesCarmicas.length} | ${a.justificativa.slice(0, 2).join(' | ')}`;
    })
    .join('\n\n');

  const melhorTexto = isSurpresa
    ? `*(O usuário marcou "Surpresa" — identifique o melhor nome masculino E o melhor nome feminino)*`
    : (melhorNome
      ? `**${melhorNome.nomeCompleto}** | Score: ${melhorNome.score}/100 | Expressão: ${melhorNome.expressao} | Motivação: ${melhorNome.motivacao} | Missão: ${melhorNome.missao} | Impressão: ${melhorNome.impressao} | Compatibilidade: ${melhorNome.compatibilidade}`
      : 'Nenhum candidato fornecido');

  const temPais = !!(nomePai || nomeMae);

  return `## Contexto da Família

${parentesco}
**Sobrenome(s) da família disponíveis:** ${sobrenomesDisponiveis.join(', ')}
**Data de nascimento do bebê:** ${dataNascimento}
**Número de Destino do bebê:** ${destino}
${generoPreferido ? `**Gênero preferido:** ${generoPreferido}` : ''}
${estiloPreferido ? `**Estilo desejado:** ${estiloPreferido}` : ''}
${caracteristicasDesejadas ? `**Características desejadas pelos pais:** ${caracteristicasDesejadas}` : ''}

## Nome Mais Indicado Numericamente

${melhorTexto}

## Ranking Numerológico dos Candidatos

${candidatosTexto}

---

## Sua Tarefa

Você é um numerólogo cabalístico especializado em nomes para bebês. Com base nos dados acima, elabore um relatório completo, caloroso e profundo para os pais. Este relatório vale R$ 100+ e deve justificar esse valor com análises específicas, reveladoras e práticas.

Siga EXATAMENTE esta estrutura:

---

## 🌟 1. O Destino que o Céu Escolheu

Explique o que significa o Número de **Destino ${destino}** para a trajetória de vida deste bebê.
- Que qualidades inatas este número traz como dom natural
- Que desafios e aprendizados este caminho naturalmente apresenta
- Como os pais podem apoiar o bebê a viver plenamente este destino
- O arquétipo de vida que este número representa (2–3 parágrafos revelatórios)

---

## 🏆 2. A Escolha do Nome de Ouro

${isSurpresa
  ? `Como a opção "Surpresa" foi marcada: identifique o **MELHOR NOME MASCULINO** e o **MELHOR NOME FEMININO** dentre os candidatos. Para cada um, escreva de forma inspiradora e técnica por que foram os escolhidos.`
  : `Explique de forma inspiradora e técnica por que **${melhorNome?.primeiroNome ?? 'o nome recomendado'}** (na composição ${melhorNome?.nomeCompleto ?? ''}) foi escolhido como o mais harmonioso.`
}

Ao explicar a escolha, conecte obrigatoriamente:
- A ausência (ou mínimo) de bloqueios e o impacto prático disso na vida da criança
- A compatibilidade entre **Expressão** e **Destino** — o que essa harmonia (ou tensão) significa
- As lições kármicas presentes e o que revelam sobre o caminho de desenvolvimento desta alma
- Os débitos kármicos presentes (ou a bela ausência deles) e o que significam para esta encarnação

---

## 💫 3. Análise dos Melhores Candidatos

Para cada um dos 3 melhores nomes do ranking, forneça:
- A "energia" que este nome projeta ao mundo e como será percebido socialmente
- O principal ponto positivo numerológico
- Se houver bloqueios ou débitos, como eles podem se manifestar e o que os pais podem fazer

${isSurpresa
  ? `\n### 4. Variações e Nomes Próximos\nSe os scores dos candidatos estiverem abaixo de 75 ou com bloqueios relevantes, sugira 3–5 novas combinações para ambos os sexos, mantendo os sobrenomes da família, com análise numerológica de cada sugestão.`
  : `\n### 4. Variações e Nomes Próximos\nSe o nome mais indicado tiver score abaixo de 75 ou algum ponto de atenção, sugira 3–5 variações de nomes no mesmo estilo, combinadas com os sobrenomes da família, e analise numerologicamente cada sugestão.`
}

---

## 🎭 5. O Temperamento da Criança

Com base nos números de **Motivação (${melhorNome?.motivacao ?? destino})** e **Impressão (${melhorNome?.missao ?? '—'})** do nome escolhido, descreva como esta criança naturalmente será:

- **Mundo Emocional:** Como ela processa emoções, lida com frustrações e demonstra afeto
- **Aprendizado e Estudos:** Qual estilo de aprendizagem favorece este temperamento, como ela absorve conhecimento
- **Autoridade e Limites:** Como reage a regras, limites e figuras de autoridade
- **Social e Brincadeiras:** Como se relaciona com outras crianças e adultos

---

## 👨‍👩‍👧 6. Guia para os Pais

${caracteristicasDesejadas ? `Os pais desejam que seu filho seja: **${caracteristicasDesejadas}**. Analise se os números do nome escolhido naturalmente favorecem essas características, e oriente como cultivá-las.\n\n` : ''}Com base na vibração numerológica do nome escolhido, oriente os pais sobre como criar e educar esta criança em harmonia com sua natureza:
- 3–4 princípios de criação que respeitam a energia numérica desta criança
- Exemplos práticos: "Uma criança com **Expressão ${melhorNome?.expressao ?? '—'}** precisa de..."
- O que ESTIMULAR para que ela desenvolva seus maiores potenciais
- O que EVITAR para não criar bloqueios emocionais ou comportamentais
- Como lidar com os desafios específicos que os números indicam

---

${temPais ? `## 🔮 7. Proteção e Harmonia Familiar

Com base nos nomes dos pais (${parentesco}) e no nome do bebê, analise:
- Como a vibração do nome do bebê complementa ou desafia os pais
- Qual pai/mãe terá maior ressonância natural com esta criança e o que isso significa
- Práticas familiares que fortalecem a harmonia energética desta família
- Uma mensagem de bênção sobre o presente que este bebê traz para a família

---

## 🌸 8. Bênção Numerológica

` : `## 🌸 7. Bênção Numerológica

`}Escreva uma mensagem final calorosa e profunda (2–3 parágrafos) para os pais:
- O presente que eles estão dando ao filho ao escolher um nome numerologicamente limpo
- A responsabilidade sagrada de nomear uma alma
- Uma bênção final para a jornada desta família

---

${arquetipo ? `---

## 🦸 Arquétipo da Criança

Com o nome **${melhorNome?.nomeCompleto ?? 'o nome escolhido'}**, esta criança carrega o arquétipo do(a) **${arquetipo.nome}**.

Essência do arquétipo: *"${arquetipo.essencia}"*
Manifestações positivas: ${arquetipo.expressaoPositiva.join(' | ')}
Sombra que os pais devem conhecer: ${arquetipo.expressaoSombra.join(' | ')}
Personagens e figuras que representam esse arquétipo: ${arquetipo.figurasMiticas.join(', ')}

Escreva uma seção chamada "🦸 O Arquétipo da Criança — Quem Essa Alma Veio Ser" que:
- Apresente o arquétipo do(a) **${arquetipo.nome}** de forma calorosa e acessível aos pais
- Explique em linguagem simples o que esse arquétipo significa para a trajetória da criança
- Oriente os pais sobre como NUTRIR as manifestações positivas desse arquétipo na criação
- Alerte gentilmente sobre como EVITAR reforçar a sombra (${arquetipo.sombra}) nos primeiros anos
- Sugira 2–3 histórias, livros infantis, filmes ou personagens culturais que representam esse arquétipo e podem ser usados na educação da criança
- Use tom afetuoso e esperançoso — os pais estão descobrindo a identidade mítica de seu filho

` : ''}---

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Use estruturação Markdown rigorosa com Hash Headers (##, ###).
2. NUNCA use títulos apenas com letras maiúsculas. SEMPRE use Hash Headers com emoticon.
3. **Negrito:** Use EXCLUSIVAMENTE para termos numerológicos e os números em si.
4. SEMPRE duplo espaçamento entre parágrafos — texto arejado e escaneável.
5. Parágrafos com no máximo 4 linhas.
6. Escreva com calor humano, leveza e profundidade — os pais estão diante de uma das decisões mais importantes da vida do filho.`;
}
