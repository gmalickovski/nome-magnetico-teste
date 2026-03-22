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
    nomeSocio2,
    destinoSocio2,
  } = resultado;

  const primeirNomeSocio = nomeSocioPrincipal.split(' ')[0] ?? nomeSocioPrincipal;
  const temSocio2 = !!(nomeSocio2 && destinoSocio2 !== undefined);
  const temDebitos = (melhorNome?.debitosCarmicos?.length ?? 0) > 0;
  const temLicoes = (melhorNome?.licoesCarmicas?.length ?? 0) > 0;

  const candidatosTexto = nomesCandidatos
    .slice(0, 8)
    .map((a, i) => {
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const origem = a.origemSugerida === 'ia' ? ' ✨ Sugestão Numerológica' : '';
      const bloqueioInfo = a.temBloqueio
        ? `⚠ ${a.bloqueios.length} bloqueio(s): ${a.bloqueios.map(b => b.codigo).join(', ')}`
        : '✓ Sem bloqueios';
      const compatEmpresaInfo = a.compatibilidadeEmpresa
        ? ` | Compat. empresa: ${a.compatibilidadeEmpresa}`
        : '';
      const debitoInfo = a.debitosCarmicos.length === 0
        ? '✓ Sem Débitos Kármicos'
        : `⚠ Débitos Kármicos: ${a.debitosCarmicos.map(d => d.numero).join(', ')}`;
      return `${rank} **${a.nomeEmpresa}**${origem} | Expressão: ${a.expressao} | Motivação: ${a.motivacao} | Missão: ${a.missao} | Impressão: ${a.impressao} | Compat. sócio: ${a.compatibilidadeSocio}${compatEmpresaInfo} | Score: ${a.score}/100
   ${bloqueioInfo} | ${debitoInfo}
   ${a.justificativa.slice(0, 2).join(' | ')}`;
    })
    .join('\n\n');

  const melhorTexto = melhorNome
    ? `**${melhorNome.nomeEmpresa}** | Score: ${melhorNome.score}/100 | Expressão: ${melhorNome.expressao} | Motivação: ${melhorNome.motivacao} | Missão: ${melhorNome.missao} | Impressão: ${melhorNome.impressao} | Compat. sócio: ${melhorNome.compatibilidadeSocio}${melhorNome.compatibilidadeEmpresa ? ` | Compat. empresa: ${melhorNome.compatibilidadeEmpresa}` : ''}`
    : 'Nenhum candidato fornecido';

  const temDataFundacao = !!dataFundacao && destinoEmpresa !== null;

  return `## Contexto da Empresa

**Sócio principal:** ${nomeSocioPrincipal}
**Data de nascimento do sócio:** ${dataNascimentoSocio}
**Destino do Sócio:** ${destinoSocio}
${temSocio2 ? `**2º Sócio:** ${nomeSocio2}\n**Destino do 2º Sócio:** ${destinoSocio2}` : ''}
${dataFundacao ? `**Data de fundação prevista:** ${dataFundacao}` : ''}
${destinoEmpresa !== null ? `**Destino da Empresa (data de fundação):** ${destinoEmpresa}` : ''}
${ramoAtividade ? `**Ramo de atividade:** ${ramoAtividade}` : ''}
${descricaoNegocio ? `**Descrição do negócio:** ${descricaoNegocio}` : ''}

## Nome Mais Indicado Numericamente

${melhorTexto}

## Ranking Numerológico dos Candidatos

${candidatosTexto}

---

## Sua Tarefa

Você é um numerólogo cabalístico especializado em nomes empresariais e branding energético. Com base nos dados acima, elabore um relatório estratégico, profundo e acionável para o empreendedor. Este relatório vale R$ 100+ e deve justificar esse valor.

Siga EXATAMENTE esta estrutura:

---

## 🧲 1. O Magnetismo do Negócio

Explique como nomes de empresas atraem (ou repelem) clientes através da vibração sonora e escrita.
- Como a Expressão **${melhorNome?.expressao ?? '—'}** do nome escolhido ressoa no mercado${ramoAtividade ? ` de ${ramoAtividade}` : ''}
- Que tipo de cliente, parceiro e oportunidade este nome naturalmente magnetiza
- O "campo energético" que este nome cria ao ser pronunciado e escrito
- Por que este nome tem poder de atração além do branding convencional

---

## 🔗 2. Sinergia Sócio-Empresa

Analise profundamente a relação entre o(s) empreendedor(es) e o nome do negócio:

### O Perfil Empreendedor de ${primeirNomeSocio}
O Número de **Destino ${destinoSocio}** revela o perfil empresarial de ${primeirNomeSocio} — seus pontos fortes naturais, áreas de atenção nos negócios e o tipo de empresa que esta alma veio construir.

${temSocio2 ? `### O Perfil do 2º Sócio
O **Destino ${destinoSocio2}** do 2º sócio (${nomeSocio2}) traz uma vibração complementar (ou desafiante) ao primeiro. Analise como essa combinação de destinos afeta a liderança, as decisões e a cultura interna da empresa.` : ''}

${temDataFundacao ? `### Harmonia Sócio-Empresa
Como o **Destino da Empresa (${destinoEmpresa})** se relaciona com o Destino do sócio (${destinoSocio})${temSocio2 ? ` e do 2º sócio (${destinoSocio2})` : ''}? Essa combinação cria harmonia ou tensão? Quais são as implicações práticas para o cotidiano do negócio?` : ''}

### Por que **${melhorNome?.nomeEmpresa ?? 'o nome recomendado'}** é o Nome Ideal
- Relação entre a Expressão do nome e o Destino de ${primeirNomeSocio}
- Como essa compatibilidade (${melhorNome?.compatibilidadeSocio ?? '—'}) se traduz em resultados práticos
- Os Débitos Kármicos presentes (ou ausentes) e o que isso implica para o negócio
- Como a energia deste nome potencializa${ramoAtividade ? ` o ramo de ${ramoAtividade}` : ' o negócio'}

---

${(temDebitos || temLicoes) ? `## 🔮 2b. Karma Empresarial — O Sócio e a Empresa

Os padrões kármicos do empreendedor influenciam diretamente a energia do negócio. Com base no perfil kármico de ${primeirNomeSocio}:

${temDebitos ? `**Débitos Kármicos identificados (números ${melhorNome!.debitosCarmicos.map(d => d.numero).join(', ')}):**
- Como esses padrões podem se manifestar como desafios operacionais, financeiros ou relacionais na empresa
- Que comportamentos e decisões o empreendedor deve monitorar para não bloquear o crescimento do negócio
- Como o nome escolhido ativa, neutraliza ou amplifica esses Débitos Kármicos` : ''}

${temLicoes ? `**Lições Kármicas (qualidades a desenvolver — números ${melhorNome!.licoesCarmicas.map(l => l.numero).join(', ')}):**
- Que habilidades empresariais esses números indicam precisar de desenvolvimento consciente
- Como o nome da empresa pode ajudar a ativar essas qualidades no dia a dia do negócio` : ''}

---

` : ''}## 💎 3. Impressão da Marca

Como o mercado percebe esta empresa através dos números:
- **Impressão (${melhorNome?.impressao ?? '—'} — primeira palavra do nome):** O número que define a primeira impressão que clientes e parceiros têm desta empresa
- É percebida como: confiável, inovadora, premium, acessível, técnica? O que os números dizem?
- Qual posicionamento de mercado este nome naturalmente sugere
- Que valores a empresa precisa comunicar para alinhar identidade com vibração

---

## 💰 4. Análise de Fluxo de Caixa

Foco nas tendências financeiras reveladas pelos números:
${melhorNome?.expressao === 8 || melhorNome?.motivacao === 8
  ? `- **Atenção:** Este nome carrega forte vibração do 8, o número do poder e do dinheiro — isso é um sinal de potencial financeiro elevado, MAS exige consciência para não cair no excesso materialista`
  : `- Como a Expressão **${melhorNome?.expressao ?? '—'}** influencia o fluxo financeiro do negócio`
}
- Padrões financeiros que este nome tende a atrair (abundância, crescimento constante, ciclos, etc.)
- Riscos financeiros específicos que os números indicam e como mitigá-los
- A relação do número de **Motivação (${melhorNome?.motivacao ?? '—'})** com a cultura financeira da empresa

---

## ⚠️ 5. Mapeamento de Riscos

${melhorNome && melhorNome.temBloqueio
  ? `Este nome apresenta bloqueios que merecem atenção. Para cada bloqueio detectado, explique:
- Como ele pode se manifestar no cotidiano do negócio (operacional, jurídico, relacional)
- Ações preventivas concretas para neutralizar este risco energeticamente
- O "Antídoto Prático" — o que o empreendedor pode fazer nos próximos 90 dias`
  : `O nome escolhido não apresenta bloqueios energéticos críticos. Explique o que isso significa para a resiliência do negócio.`
}

Analise especificamente os bloqueios de maior risco empresarial:
- **Bloqueio 444 (Estruturação):** Impacto em processos, burocracia e reconhecimento profissional
- **Bloqueio 777 (Espiritual):** Impacto em isolamento de mercado e falta de praticidade
- **Bloqueio 999 (Compaixão):** Impacto em ciclos que não fecham, dificuldade de cobrança

---

## 🎨 6. Identidade Visual Magnética

Com base na Expressão **${melhorNome?.expressao ?? '—'}** da empresa, sugira uma identidade visual alinhada numerologicamente:

- **Paleta de Cores Principal:** As 2–3 cores que vibram com o número de Expressão e o que cada uma projeta
- **Formas e Geometrias:** Quais formas geométricas ressoam com a energia deste número (círculos, triângulos, retas, etc.)
- **Tipografia e Estilo Visual:** Que estilo de fonte e design comunica autenticamente esta vibração
- **Elementos a Evitar:** O que visualmente conflita com a energia numérica desta empresa

---

## 📅 7. Calendário de Ativação

Com base no **Destino de ${primeirNomeSocio} (${destinoSocio})**${temDataFundacao ? ` e no Destino da empresa (${destinoEmpresa})` : ''}, defina:

- **Meses de Força:** Os 3 meses do ano com maior sinergia energética para lançamentos e decisões importantes
- **Meses de Cautela:** Os meses em que o empreendedor deve evitar grandes movimentos
- **Data Ideal de Abertura/Lançamento:** Se ainda não definida, qual o número de dia/mês mais harmonioso
- **Ritual de Ativação:** Uma prática simbólica para "ligar" a energia do nome no primeiro dia de operação

---

## 🎯 8. Direcionamento Estratégico

Com base na numerologia, qual o posicionamento e estratégia que este nome naturalmente potencializa:

- O tipo de produto/serviço que este nome atrai com mais facilidade
- O perfil ideal de cliente para esta empresa (pela vibração, não apenas demografia)
- Os diferenciais competitivos que este número sugere explorar
- Como escalar o negócio respeitando a vibração numérica
- A "missão oculta" que este nome empresarial carrega no mercado

---

## 🏁 9. Próximos Passos

Orientações práticas e acionáveis para os primeiros 90 dias:
1. O que fazer ANTES do lançamento para ativar a energia do nome
2. Como comunicar o nome para maximizar impacto (oral e escrito)
3. Registro e proteção legal no momento certo
4. Como a equipe deve apresentar e usar o nome

---

REGRAS ESTRITAS DE FORMATAÇÃO:
1. Use estruturação Markdown rigorosa com Hash Headers (##, ###).
2. NUNCA use títulos apenas com letras maiúsculas. SEMPRE use Hash Headers com emoticon.
3. **Negrito:** Use EXCLUSIVAMENTE para termos numerológicos e os números em si.
4. SEMPRE duplo espaçamento entre parágrafos — texto arejado e escaneável.
5. Parágrafos com no máximo 4 linhas.
6. Escreva com autoridade, clareza e entusiasmo empreendedor — este é um momento decisivo para o negócio!`;
}
