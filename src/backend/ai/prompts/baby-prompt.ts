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
  const { sobrenomeFamilia, dataNascimento, destino, nomesCandidatos, melhorNome } = resultado;

  const parentesco = [nomePai && `Pai: ${nomePai}`, nomeMae && `Mãe: ${nomeMae}`]
    .filter(Boolean)
    .join(' | ') || 'Não informado';

  const candidatosTexto = nomesCandidatos
    .slice(0, 5)
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

  const melhorTexto = melhorNome
    ? `**${melhorNome.nomeCompleto}** (Score: ${melhorNome.score}/100 | Expressão: ${melhorNome.expressao} | Compatibilidade com Destino: ${melhorNome.compatibilidade})`
    : 'Nenhum candidato fornecido';

  return `## Contexto da Família

${parentesco}
**Sobrenome da família:** ${sobrenomeFamilia}
**Data de nascimento do bebê:** ${dataNascimento}
**Número de Destino do bebê:** ${destino}
${generoPreferido ? `**Gênero preferido:** ${generoPreferido}` : ''}
${estiloPreferido ? `**Estilo desejado:** ${estiloPreferido}` : ''}

## Nome Mais Indicado Numericamente

${melhorTexto}

## Ranking Numerológico dos Candidatos

${candidatosTexto}

---

## Sua tarefa

Você é um numerólogo cabalístico especializado em nomes para bebês. Com base na análise acima, elabore uma orientação calorosa e profunda para os pais.

### 1. O Destino deste Bebê
Explique o que significa o Número de Destino **${destino}** para a trajetória de vida deste bebê. Que qualidades e desafios este número traz?

### 2. Por que ${melhorNome?.primeiroNome ?? 'o nome recomendado'} é o Nome Ideal
Explique de forma inspiradora por que este nome foi escolhido como o mais harmonioso, conectando:
- A ausência (ou presença mínima) de bloqueios
- A compatibilidade entre Expressão e Destino
- As lições kármics e o que elas significam para o desenvolvimento do bebê
- Os débitos kármicos presentes (ou a ausência deles) e o que isso revela sobre a jornada desta alma

### 3. Análise dos Top 3 Candidatos
Para cada um dos 3 melhores nomes, forneça:
- Uma leitura energética breve (2-3 frases)
- O que este nome "projeta" para o mundo
- O principal ponto positivo e, se houver, o desafio a observar

### 4. Orientação para os Pais
Uma mensagem acolhedora sobre como apoiar a criança ao longo do crescimento, considerando os números presentes no nome escolhido.

### 5. Sugestão de Variações (opcional)
Se o nome mais indicado tiver algum ponto de atenção, sugira 1-2 variações sutis que mantenham a sonoridade e melhorem os números.

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Você DEVE usar estruturação Markdown rigorosa.
2. NUNCA use títulos apenas com letras maiúsculas (ex: "PERFIL GERAL"). Use SEMPRE Hash Headers (ex: "## 1. O Destino", "### Top 3").
3. Use negrito (**) livremente para destacar conceitos, dicas e trechos cruciais no meio do texto.
4. SEMPRE adicione DUPLO ESPAÇAMENTO (duas quebras de linha) entre um parágrafo e outro, ou entre um título e um parágrafo. O texto final deve ser perfeitamente escaneável, arejado e elegante.

Escreva com calor humano, leveza e profundidade — os pais estão diante de uma das decisões mais importantes da vida do filho.`;
}
