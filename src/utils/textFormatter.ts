/**
 * Utilitário para forçar e corrigir a formatação Markdown dos textos retornados pela IA.
 *
 * Cadeia de transformações (ordem importa):
 *   1. Remover negrito de linhas-título solitárias (**TÍTULO** → TÍTULO)
 *   2. Converter linhas MAIÚSCULAS numeradas → ## (H2 dourado)
 *   3. Converter linhas MAIÚSCULAS não-numeradas → ### (H3 roxo)
 *   4. Remover divisores --- inline (viram ruído no PDF)
 *   5. Garantir \n\n antes e depois de todo header #
 *   6. Garantir \n\n entre parágrafos (após pontuação final)
 *   7. Garantir \n\n antes de blocos de lista
 *   8. Normalizar sequências \n{3,} → \n\n
 */
export function formatAnalysisText(text: string | null | undefined): string {
  if (!text) return '';

  let f = text.trim().replace(/\r/g, '');

  // 0a. Remover negrito de qualquer coisa que NÃO seja termo técnico de numerologia ou número isolado.
  //    Estratégia: preservar apenas bold em palavras/números permitidos; strip em tudo o mais.
  const ALLOWED_BOLD = /\*\*(Expressão|Destino|Motivação|Missão|Impressão|Alma|Arcano Regente|Arcano|Bloqueio|Triângulo|Karma|Kármico|Kármica|Kármicas|[0-9]{1,2}(?:\/[0-9]{1,2})?|Triângulo da Vida|Triângulo Pessoal|Triângulo do Destino|Triângulo Social|Débitos? Kármicos?|Tendências? Ocultas?|Lições? Kármicas?)\*\*/gi;

  const PLACEHOLDER = '\x00BOLD\x00';
  const preserved: string[] = [];
  f = f.replace(ALLOWED_BOLD, (match) => {
    preserved.push(match);
    return `${PLACEHOLDER}${preserved.length - 1}${PLACEHOLDER}`;
  });
  // Remover todo bold restante mal formatado / indesejado
  f = f.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  // Restaurar os permitidos
  f = f.replace(new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, 'g'), (_, i) => preserved[Number(i)]);

  // 0b. Forçar negrito em termos-chave (e seus respectivos números adjacentes) se não estiverem.
  const autoBoldTerms = [
    'Triângulo da Vida', 'Triângulo Pessoal', 'Triângulo do Destino', 'Triângulo Social',
    'Débitos? Kármicos?', 'Tendências? Ocultas?', 'Lições? Kármicas?',
    'Motivação', 'Missão', 'Impressão', 'Expressão', 'Destino', 'Arcano Regente', 'Arcano', 'Bloqueios?'
  ];
  
  autoBoldTerms.forEach(term => {
    // Captura o termo MAIS (opcionalmente) espaço, dois-pontos ou hífen, parênteses e números (ex: "Expressão (6)" ou "Missão: 11/2").
    const regex = new RegExp(`(^|[^\\*A-Za-zÀ-ÿ])(${term}(?:\\s*(?::|-)?\\s*\\(?(?:\\d+)(?:/\\d+)?\\)?)?)(?=[^A-Za-zÀ-ÿ\\*]|$)`, 'gi');
    f = f.replace(regex, '$1**$2**');
  });

  // 1. Remover negrito de linhas-título solitárias: "**TÍTULO**" ou "**1. TÍTULO**"
  f = f.replace(/^\s*\*\*\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9].*?)\s*\*\*\s*$/gm, '$1');

  // 1b. Garantir espaço antes do span bold quando palavra anterior cola direto
  //     Ex: "brincar**negrito**texto" → "brincar **negrito**texto"
  f = f.replace(/([^\s\n])(\*\*[^*\n]+\*\*)/g, '$1 $2');

  // 1c. Garantir espaço depois do span bold quando palavra seguinte cola direto
  //     Ex: "brincar **negrito**texto" → "brincar **negrito** texto"
  f = f.replace(/(\*\*[^*\n]+\*\*)([^\s\n])/g, '$1 $2');

  // 2. Linhas MAIÚSCULAS COM número → ## (já não tem ## na frente)
  //    Ex: "1. PERFIL ENERGÉTICO GERAL" → "## 1. PERFIL ENERGÉTICO GERAL"
  f = f.replace(
    /^(?!#)(\d+[\.\)]\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s()/\-–—.,:;✨🔮💫🌟⚡🧬💛🌀🎯🔑]{4,})\r?$/gm,
    (match) => `## ${match.trim()}`
  );

  // 3. Linhas MAIÚSCULAS SEM número → ### (já não tem # na frente, não é linha de lista)
  //    Ex: "EXPRESSÃO (6)" → "### EXPRESSÃO (6)"
  f = f.replace(
    /^(?!#)(?![-*•])([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s()/\-–—.,:;]{5,})\r?$/gm,
    (match) => `### ${match.trim()}`
  );

  // 4. Remover divisores --- soltos (linha inteira só com hifens/traços)
  f = f.replace(/^[ \t]*-{3,}[ \t]*$/gm, '');

  // 4b. Remover headers vazios (##, ###, etc. sem texto após — emitidos pela IA como separadores)
  f = f.replace(/^#{1,6}\s*$/gm, '');

  // 5 e 6. Garantir \n\n ANTES e DEPOIS de qualquer header # (isolar o bloco perfeitamente)
  // Ignora \n, aceita possíveis espaços no começo e isola forçadamente:
  f = f.replace(/(^|\n)[ \t]*(#{1,6}\s+[^\n]+)/g, '$1\n\n$2\n\n');

  // 7. Garantir \n\n entre parágrafos — após ponto, exclamação, interrogação seguido de letra
  f = f.replace(/([.!?])\n(?!\n)(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\-*•])/gi, '$1\n\n');

  // 8. Garantir \n\n antes de bloco de lista
  f = f.replace(/([^\n])\n([-*•] )/g, '$1\n\n$2');

  // 9. Normalizar excesso de linhas em branco
  f = f.replace(/\n{3,}/g, '\n\n');

  // 10. Colapsar linhas em branco ENTRE itens de lista para colar as bullets lado a lado no layout
  // (Ex.: '- Item 1\n\n- Item 2' vira '- Item 1\n- Item 2')
  f = f.replace(/^([-*•][^\n]+)\n{2,}(?=[-*•] )/gm, '$1\n');

  // 11. Limpar `**` de títulos Markdown (linhas começando com #).
  //     Evita que o PDF e alguns parsers rendam os asteriscos de forma literal em subtítulos.
  f = f.replace(/^(#{1,6}\s+.*)$/gm, (match) => match.replace(/\*\*/g, ''));

  return f.trim();
}
