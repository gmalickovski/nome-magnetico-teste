import type { AnaliseNomeBebe, ResultadoNomeBebe } from '../../numerology/products/nome-bebe';

export interface BabyPromptParams {
  resultado: ResultadoNomeBebe;
  nomePai?: string;
  nomeMae?: string;
  generoPreferido?: string;
  estiloPreferido?: string;
}

export function buildBabyAnalysisPrompt(params: BabyPromptParams): string {
  const { resultado, nomePai, nomeMae, generoPreferido, estiloPreferido } = params;
  const { sobrenomesDisponiveis, dataNascimento, destino, nomesCandidatos, melhorNome } = resultado;

  const parentesco = [nomePai && `Pai: ${nomePai}`, nomeMae && `Mãe: ${nomeMae}`]
    .filter(Boolean)
    .join(' | ') || 'Não informado';

  const isSurpresa = generoPreferido?.toLowerCase() === 'surpresa';

  const candidatosTexto = nomesCandidatos
    .slice(0, 10) // Mandando até 10 para ele ter margem de escolha no caso de surpresa
    .map((a, i) => {
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const bloqueioInfo = a.temBloqueio
        ? `⚠ ${a.bloqueios.length} bloqueio(s): ${a.bloqueios.map(b => b.codigo).join(', ')}`
        : '✓ Sem bloqueios';
      const debitoInfo = a.debitosCarmicos.length === 0
        ? '✓ Sem débitos kármicos'
        : `⚠ Débitos: ${a.debitosCarmicos.map(d => d.numero).join(', ')}`;
      return `${rank} **${a.nomeCompleto}** | Expressão: ${a.expressao} | Compatibilidade: ${a.compatibilidade} | Score: ${a.score}/100
   ${bloqueioInfo}
   Lições kármics: ${a.licoesCarmicas.length} | ${debitoInfo} | ${a.justificativa.slice(0, 2).join(' | ')}`;
    })
    .join('\n\n');

  const melhorTexto = isSurpresa
    ? `*(O usuário marcou "Surpresa", você deve identificar o melhor masculino e o melhor feminino)*`
    : (melhorNome
      ? `**${melhorNome.nomeCompleto}** (Score: ${melhorNome.score}/100 | Expressão: ${melhorNome.expressao} | Compatibilidade com Destino: ${melhorNome.compatibilidade})`
      : 'Nenhum candidato fornecido');

  return `## Contexto da Família

${parentesco}
**Sobrenome(s) da família (disponíveis):** ${sobrenomesDisponiveis.join(', ')}
**Data de nascimento do bebê:** ${dataNascimento}
**Número de Destino do bebê:** ${destino}
${generoPreferido ? `**Gênero preferido:** ${generoPreferido}` : ''}
${estiloPreferido ? `**Estilo desejado:** ${estiloPreferido}` : ''}

## Nome Mais Indicado Numericamente

${melhorTexto}

## Ranking Numerológico dos Candidatos
Abaixo estão as melhores composições encontradas pelo nosso algoritmo misturando os nomes indicados com os sobrenomes fornecidos:

${candidatosTexto}

---

## Sua tarefa

Você é um numerólogo cabalístico especializado em nomes para bebês. Com base na análise acima, elabore uma orientação calorosa e profunda para os pais.

### 1. O Destino deste Bebê
Explique o que significa o Número de Destino **${destino}** para a trajetória de vida deste bebê. Que qualidades e desafios este número traz?

### 2. A Escolha do Nome Ideal
${isSurpresa 
  ? `COMO A OPÇÃO "SURPRESA" FOI MARCADA: Você deve identificar dentre os nomes candidatos qual é o MELHOR NOME MASCULINO e qual é o MELHOR NOME FEMININO. Escreva de forma inspiradora por que estes dois nomes foram escolhidos como os mais harmoniosos para cada sexo.`
  : `Explique de forma inspiradora por que **${melhorNome?.primeiroNome ?? 'o nome recomendado'}** (na composição ${melhorNome?.nomeCompleto}) foi escolhido como o mais harmonioso.`
}
Ao explicar a escolha, conecte:
- A ausência (ou presença mínima) de bloqueios
- A compatibilidade entre Expressão e Destino
- As lições kármics e o que elas significam para o desenvolvimento do bebê
- Os débitos kármicos presentes (ou a ausência deles) e o que isso revela sobre a jornada desta alma

### 3. Análise dos Top Candidatos
Para os melhores nomes avaliados, forneça:
- Uma leitura energética breve (2-3 frases)
- O que este nome "projeta" para o mundo
- O principal ponto positivo e, se houver, o desafio a observar

${isSurpresa 
  ? `### 4. Sugestão de Variações e Nomes Próximos\nSe os nomes sugeridos apresentarem scores muito baixos ou bloqueios difíceis, sugira 3 a 5 novas variações de nomes misturando para ambos os sexos, mantendo os sobrenomes da pesquisa, e formando composições numerologicamente melhores.` 
  : `### 4. Sugestão de Variações e Nomes Próximos\nSe o nome mais indicado tiver algum ponto de atenção ou score baixo (abaixo de 75), sugira 3 a 5 variações (nomes no mesmo estilo) que harmonizem melhor com os sobrenomes da família. Mantenha os mesmos sobrenomes da pesquisa para formar a nova composição.`
}

### 5. Orientação para os Pais
Uma mensagem acolhedora sobre como apoiar a criança ao longo do crescimento, considerando os números presentes no nome escolhido.

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Você DEVE usar estruturação Markdown rigorosa.
2. NUNCA use títulos apenas com letras maiúsculas (ex: "PERFIL GERAL"). Use SEMPRE Hash Headers (ex: "## 1. O Destino", "### Top Candidatos").
3. **Atenção ao Uso do Negrito:** Utilize negrito (**) EXCLUSIVAMENTE para expressões numerológicas e termos cabalísticos e para os números em si. O restante do texto deve permanecer no formato normal, sem usar negrito de forma genérica.
4. SEMPRE adicione DUPLO ESPAÇAMENTO (duas quebras de linha) entre um parágrafo e outro, ou entre um título e um parágrafo. O texto final deve ser perfeitamente escaneável, arejado e elegante.

Escreva com calor humano, leveza e profundidade — os pais estão diante de uma das decisões mais importantes da vida do filho.`;
}
