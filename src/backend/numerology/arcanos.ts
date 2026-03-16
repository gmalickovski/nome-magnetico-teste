/**
 * Arcanos da Numerologia Cabalística (1–99).
 *
 * Regras especiais:
 * - Arcano 0  → usa o valor 22 (O Louco — estado potencial)
 * - Arcano 9  → O Eremita (fim de ciclo, precede o recomeço)
 * - Arcanos > 22 → reduzir os dígitos para obter o arcano base, mas
 *   o valor original é mantido como "arcano dominante" na 1ª linha.
 *
 * Na montagem dos triângulos os arcanos dominantes são formados pela
 * concatenação dos pares da linha base (ex: valores 3 e 5 → arcano 35).
 * O Arcano Regente (vértice) varia de 1 a 9 e é interpretado como
 * o segundo número de Expressão.
 */

export interface Arcano {
  numero: number;
  nome: string;
  palavraChave: string;
  descricao: string;
  desafio: string;
}

/** Reduz um arcano > 9 somando seus dígitos para interpretação base. */
export function reduzirArcano(n: number): number {
  if (n === 0) return 22;
  let v = n;
  while (v > 9 && v !== 11 && v !== 22) {
    v = String(v).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return v;
}

export const ARCANOS: Record<number, Arcano> = {
  1: {
    numero: 1,
    nome: 'O Mago',
    palavraChave: 'Vontade e Iniciativa',
    descricao: 'Capacidade de transformar ideias em realidade. Liderança, autonomia e poder de manifestação. Representa o início de uma nova jornada com plena consciência dos próprios recursos.',
    desafio: 'Evitar arrogância, impulsividade e uso do poder de forma egocêntrica.',
  },
  2: {
    numero: 2,
    nome: 'A Papisa',
    palavraChave: 'Intuição e Conhecimento Interior',
    descricao: 'Profunda conexão com o subconsciente, sabedoria interior e paciência. Representa a dualidade, a receptividade e a escuta interna. Guarda os mistérios da vida.',
    desafio: 'Evitar passividade excessiva, segredos prejudiciais e dependência emocional.',
  },
  3: {
    numero: 3,
    nome: 'A Imperatriz',
    palavraChave: 'Criatividade e Abundância',
    descricao: 'Fertilidade, criatividade, beleza e expressão. Representa o amor materno, a natureza e a capacidade de nutrir projetos e relacionamentos com generosidade.',
    desafio: 'Evitar superficialidade, vaidade excessiva e dispersão de energia criativa.',
  },
  4: {
    numero: 4,
    nome: 'O Imperador',
    palavraChave: 'Estrutura e Autoridade',
    descricao: 'Construção de bases sólidas, ordem e liderança responsável. Representa a estabilidade material, a disciplina e a capacidade de organizar o mundo ao redor.',
    desafio: 'Evitar rigidez, autoritarismo e apego excessivo ao controle.',
  },
  5: {
    numero: 5,
    nome: 'O Papa (Hierofante)',
    palavraChave: 'Sabedoria e Ensinamento',
    descricao: 'Ponte entre o material e o espiritual. Busca pelo conhecimento superior, tradição e propósito de vida. Representa o mestre que compartilha sua sabedoria com o coletivo.',
    desafio: 'Evitar dogmatismo, moralismo excessivo e dependência de aprovação externa.',
  },
  6: {
    numero: 6,
    nome: 'Os Enamorados',
    palavraChave: 'Escolhas e Harmonia',
    descricao: 'Amor, relacionamentos e escolhas fundamentais. Representa o equilíbrio entre razão e coração nas decisões. Aprendizado profundo através das uniões e dos valores pessoais.',
    desafio: 'Evitar indecisão, dependência afetiva e julgamentos superficiais.',
  },
  7: {
    numero: 7,
    nome: 'O Carro',
    palavraChave: 'Determinação e Vitória',
    descricao: 'Domínio sobre forças opostas e avanço determinado rumo aos objetivos. Representa a força de vontade, a disciplina em movimento e a capacidade de superar obstáculos.',
    desafio: 'Evitar arrogância após a vitória, dispersão de energia e falta de direção.',
  },
  8: {
    numero: 8,
    nome: 'A Justiça',
    palavraChave: 'Equilíbrio e Integridade',
    descricao: 'Lei de causa e efeito, verdade e responsabilidade. Representa a imparcialidade, a ética e a consciência de que cada ação gera uma consequência equivalente.',
    desafio: 'Evitar julgamentos severos, inflexibilidade e busca por punição em vez de correção.',
  },
  9: {
    numero: 9,
    nome: 'O Eremita',
    palavraChave: 'Introspecção e Sabedoria',
    descricao: 'Última etapa de um ciclo. Representa a sabedoria adquirida pela experiência, a introspecção profunda e a capacidade de iluminar o caminho dos outros. Precede sempre um recomeço.',
    desafio: 'Evitar isolamento excessivo, arrogância espiritual e recusa ao reengajamento com o mundo.',
  },
  10: {
    numero: 10,
    nome: 'A Roda da Fortuna',
    palavraChave: 'Ciclos e Transformação',
    descricao: 'Mudanças inevitáveis, ciclos da vida e sorte. Representa a compreensão de que tudo está em constante movimento. Aquele que aceita os ciclos navega com mais sabedoria.',
    desafio: 'Evitar passividade diante das mudanças e a crença de que tudo é mero acaso.',
  },
  11: {
    numero: 11,
    nome: 'A Força',
    palavraChave: 'Coragem e Domínio Interior',
    descricao: 'Força que vem de dentro, não da violência. Representa a capacidade de domar os instintos com amor e paciência. Número mestre — intensifica todas as qualidades.',
    desafio: 'Evitar uso da força de forma opressiva e a negação da própria vulnerabilidade.',
  },
  12: {
    numero: 12,
    nome: 'O Enforcado',
    palavraChave: 'Pausa e Perspectiva',
    descricao: 'Sacrifício voluntário, mudança de perspectiva e entrega. Representa o período de espera necessário para a transformação. Ver o mundo de um novo ângulo.',
    desafio: 'Evitar vitimismo, autossabotagem e resistência às pausas necessárias.',
  },
  13: {
    numero: 13,
    nome: 'A Morte',
    palavraChave: 'Transformação e Renovação',
    descricao: 'Fim de um ciclo para que outro comece. Representa a transformação profunda, o desapego do que não serve mais e a coragem de recomeçar.',
    desafio: 'Evitar medo das mudanças, apego ao passado e resistência ao inevitável.',
  },
  14: {
    numero: 14,
    nome: 'A Temperança',
    palavraChave: 'Equilíbrio e Moderação',
    descricao: 'Alquimia interior, equilíbrio e paciência. Representa a habilidade de combinar elementos opostos com sabedoria. O fluxo contínuo entre diferentes estados da vida.',
    desafio: 'Evitar extremos, impaciência e a tentação de forçar resultados prematuros.',
  },
  15: {
    numero: 15,
    nome: 'O Diabo',
    palavraChave: 'Sombra e Libertação',
    descricao: 'Aspectos sombrios da personalidade, vícios e apegos materiais. Representa a necessidade de reconhecer e integrar a sombra para alcançar a verdadeira liberdade.',
    desafio: 'Evitar escravidão aos vícios, materialismo excessivo e negação da própria sombra.',
  },
  16: {
    numero: 16,
    nome: 'A Torre',
    palavraChave: 'Ruptura e Revelação',
    descricao: 'Destruição súbita de estruturas falsas para que a verdade emerja. Representa as crises necessárias que derrubam o que foi construído sobre bases instáveis.',
    desafio: 'Evitar reconstruir os mesmos padrões após a queda e resistir às transformações radicais.',
  },
  17: {
    numero: 17,
    nome: 'A Estrela',
    palavraChave: 'Esperança e Inspiração',
    descricao: 'Renovação após a tempestade, fé no futuro e generosidade. Representa a luz que guia após períodos de escuridão e a capacidade de inspirar os outros.',
    desafio: 'Evitar idealismo ingênuo e desconexão da realidade prática.',
  },
  18: {
    numero: 18,
    nome: 'A Lua',
    palavraChave: 'Ilusão e Inconsciente',
    descricao: 'Mistérios do inconsciente, intuição e ilusões. Representa os medos profundos e as fantasias que moldam a percepção. O caminho entre o racional e o instintivo.',
    desafio: 'Evitar ilusões, medos irracionais e confusão entre intuição e fantasia.',
  },
  19: {
    numero: 19,
    nome: 'O Sol',
    palavraChave: 'Clareza e Alegria',
    descricao: 'Sucesso, vitalidade e clareza. Representa a luz da consciência plena, a alegria de viver e a capacidade de iluminar o caminho para os outros.',
    desafio: 'Evitar arrogância, superficialidade e dependência do reconhecimento externo.',
  },
  20: {
    numero: 20,
    nome: 'O Julgamento',
    palavraChave: 'Renascimento e Chamado',
    descricao: 'Despertar, renascimento e resposta ao chamado da alma. Representa a avaliação honesta da própria trajetória e a abertura para uma nova fase de vida.',
    desafio: 'Evitar autojulgamento severo, resistência ao chamado e medo do renascimento.',
  },
  21: {
    numero: 21,
    nome: 'O Mundo',
    palavraChave: 'Realização e Integração',
    descricao: 'Conclusão bem-sucedida de um ciclo, integração e conquista. Representa a harmonia entre todos os aspectos da vida e a sensação de completude.',
    desafio: 'Evitar a estagnação após a conquista e a recusa de iniciar novos ciclos.',
  },
  22: {
    numero: 22,
    nome: 'O Louco',
    palavraChave: 'Potencial Infinito',
    descricao: 'Estado de potencial puro antes da manifestação. Na numerologia assume o valor 22 (número mestre). Representa a liberdade, a espontaneidade e a coragem de lançar-se ao desconhecido.',
    desafio: 'Evitar irresponsabilidade, falta de direção e desconsideração das consequências.',
  },
};

// Para arcanos 23–99: calcular base reduzida e herdar com adaptação contextual
// Arcanos dominantes (>22) são interpretados pelo seu valor reduzido + contexto posicional

/**
 * Retorna o arcano para exibição.
 * Arcanos > 22 reduzem seus dígitos para encontrar o arcano base.
 */
export function getArcano(numero: number): Arcano & { numeroOriginal?: number } {
  if (numero === 0) return { ...ARCANOS[22]!, numeroOriginal: 0 };
  if (ARCANOS[numero]) return ARCANOS[numero]!;

  // Arcano > 22: reduzir para base
  const base = reduzirArcano(numero);
  const arcanoBase = ARCANOS[base] ?? ARCANOS[1]!;

  return {
    ...arcanoBase,
    numero: base,
    numeroOriginal: numero,
    palavraChave: `${arcanoBase.palavraChave} (Arcano ${numero})`,
  };
}

/**
 * Nome curto do arcano para exibição em triângulos.
 */
export function nomeArcano(numero: number): string {
  if (numero === 0) return 'O Louco (22)';
  const a = ARCANOS[numero];
  if (a) return `${a.numero} — ${a.nome}`;
  const base = reduzirArcano(numero);
  return `${numero} (base ${base})`;
}
