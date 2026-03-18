import type { AnaliseNomeEmpresa, ResultadoNomeEmpresa } from '../../numerology/products/nome-empresa';

export interface CompanyPromptParams {
  resultado: ResultadoNomeEmpresa;
  ramoAtividade?: string;
  descricaoNegocio?: string;
}

export function buildCompanyAnalysisPrompt(params: CompanyPromptParams): string {
  const { resultado, ramoAtividade, descricaoNegocio } = params;
  const {
    nomeSocioPrincipal,
    dataNascimentoSocio,
    dataFundacao,
    destinoSocio,
    destinoEmpresa,
    nomesCandidatos,
    melhorNome,
  } = resultado;

  const candidatosTexto = nomesCandidatos
    .slice(0, 5)
    .map((a, i) => {
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const bloqueioInfo = a.temBloqueio
        ? `⚠ ${a.bloqueios.length} bloqueio(s): ${a.bloqueios.map(b => b.codigo).join(', ')}`
        : '✓ Sem bloqueios';
      const compatEmpresaInfo = a.compatibilidadeEmpresa
        ? ` | Compat. empresa: ${a.compatibilidadeEmpresa}`
        : '';
      const debitoInfo = a.debitosCarmicos.length === 0
        ? '✓ Sem débitos kármicos'
        : `⚠ Débitos: ${a.debitosCarmicos.map(d => d.numero).join(', ')}`;
      return `${rank} **${a.nomeEmpresa}** | Expressão: ${a.expressao} | Compat. sócio: ${a.compatibilidadeSocio}${compatEmpresaInfo} | Score: ${a.score}/100
   ${bloqueioInfo} | ${debitoInfo}
   ${a.justificativa.slice(0, 2).join(' | ')}`;
    })
    .join('\n\n');

  const melhorTexto = melhorNome
    ? `**${melhorNome.nomeEmpresa}** (Score: ${melhorNome.score}/100 | Expressão: ${melhorNome.expressao} | Compatibilidade com sócio: ${melhorNome.compatibilidadeSocio}${melhorNome.compatibilidadeEmpresa ? ` | Compat. com empresa: ${melhorNome.compatibilidadeEmpresa}` : ''})`
    : 'Nenhum candidato fornecido';

  return `## Contexto da Empresa

**Sócio principal:** ${nomeSocioPrincipal}
**Data de nascimento do sócio:** ${dataNascimentoSocio}
**Destino do sócio:** ${destinoSocio}
${dataFundacao ? `**Data de fundação prevista:** ${dataFundacao}` : ''}
${destinoEmpresa !== null ? `**Destino da empresa (data de fundação):** ${destinoEmpresa}` : ''}
${ramoAtividade ? `**Ramo de atividade:** ${ramoAtividade}` : ''}
${descricaoNegocio ? `**Descrição do negócio:** ${descricaoNegocio}` : ''}

## Nome Mais Indicado Numericamente

${melhorTexto}

## Ranking Numerológico dos Candidatos

${candidatosTexto}

---

## Sua tarefa

Você é um numerólogo cabalístico especializado em nomes empresariais. Com base na análise acima, elabore uma orientação estratégica e profunda para o empreendedor.

### 1. O Destino de ${nomeSocioPrincipal.split(' ')[0]}
Explique o Número de Destino **${destinoSocio}** do sócio principal e o que ele revela sobre o perfil empreendedor desta pessoa — pontos fortes e áreas de atenção nos negócios.
${destinoEmpresa !== null ? `\nComo o Destino da empresa (${destinoEmpresa}) se relaciona com o Destino do sócio? Essa combinação traz harmonia ou desafios específicos?` : ''}

### 2. Por que ${melhorNome?.nomeEmpresa ?? 'o nome recomendado'} é o Nome Ideal
Explique por que este nome foi eleito o mais harmonioso para este negócio:
- Relação entre a Expressão do nome e o Destino do sócio
- Ausência (ou mínimo) de bloqueios que possam prejudicar o negócio
- Os débitos kármicos presentes (ou ausentes) e o que isso implica para o negócio
- Como a energia deste nome potencializa o ramo de atividade${ramoAtividade ? ` (${ramoAtividade})` : ''}

### 3. Análise dos Top 3 Candidatos
Para cada um dos 3 melhores nomes, forneça:
- A "personalidade energética" deste nome empresarial
- Como ele seria percebido por clientes e parceiros
- Pontos fortes e eventuais desafios numerológicos

### 4. Impacto nos Bloqueios
Se o nome escolhido possui bloqueios, explique como eles podem afetar o negócio e o que o empresário pode fazer para neutralizá-los energeticamente.

### 5. Orientação Estratégica
Com base na numerologia, que tipo de posicionamento, valores e diferenciais este nome empresarial naturalmente atrai? Como o empreendedor pode alinhar a estratégia do negócio com a energia deste nome?

### 6. Próximos Passos
Orientações práticas para ativar a energia do nome escolhido (lançamento, registro, comunicação visual, data ideal de abertura se não definida).

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Você DEVE usar estruturação Markdown rigorosa.
2. NUNCA use títulos apenas com letras maiúsculas (ex: "PERFIL GERAL"). Use SEMPRE Hash Headers (ex: "## 1. O Destino", "### Análise").
3. Use negrito (**) livremente para destacar conceitos, dicas e trechos cruciais no meio do texto.
4. SEMPRE adicione DUPLO ESPAÇAMENTO (duas quebras de linha) entre um parágrafo e outro, ou entre um título e um parágrafo. O texto final deve ser perfeitamente escaneável, arejado e elegante.

Escreva com autoridade, clareza e uma pitada de entusiasmo empreendedor — este é um momento decisivo para o negócio!`;
}
