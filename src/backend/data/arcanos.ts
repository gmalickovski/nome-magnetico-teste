/**
 * Banco de dados de textos dos Arcanos da Numerologia Cabalística.
 *
 * Estrutura centralizada para reutilização em PDF, web e outros contextos.
 * Cada arcano possui descrição breve (para cards e resumos) e descrição
 * completa (para páginas de anexo e detalhamento).
 *
 * Arcanos disponíveis: 1–22 (O Louco = 0/22).
 */

export interface ArcanoTextData {
  numero: number;
  nome: string;
  palavraChave: string;
  /** 1–2 frases — uso em cards, badges e resumos inline */
  descricaoBreve: string;
  /** Parágrafo completo — uso em páginas de anexo e detalhamento */
  descricaoCompleta: string;
  /** O desafio ou risco central deste arcano */
  desafio: string;
}

export const ARCANOS_DATA: Record<number, ArcanoTextData> = {
  1: {
    numero: 1,
    nome: 'O Mago',
    palavraChave: 'Vontade e Iniciativa',
    descricaoBreve:
      'O criador consciente — transforma intenção em resultado usando todos os recursos disponíveis. Potencializa liderança, magnetismo e autonomia.',
    descricaoCompleta:
      'O Mago é o arquétipo do criador consciente — aquele que transforma intenção em resultado concreto usando todos os recursos disponíveis. Sua energia governa a liderança, a iniciativa e o poder de manifestação. Quando ativo como Arcano Regente, potencializa a autonomia, o magnetismo pessoal e a capacidade de abrir novos ciclos. É a vibração do protagonismo: favorece empreendimentos autorais, posições de liderança e períodos em que o esforço encontra resultado direto. A vontade é o motor — e aqui ela está plenamente disponível.',
    desafio:
      'Evitar arrogância, impulsividade e uso do poder de forma egocêntrica. O maior risco é confundir força de vontade com rigidez e deixar de ouvir o que o campo ao redor está sinalizando.',
  },

  2: {
    numero: 2,
    nome: 'A Papisa',
    palavraChave: 'Intuição e Conhecimento Interior',
    descricaoBreve:
      'Guardiã dos mistérios interiores — opera no silêncio e na escuta profunda. Favorece estudo, reflexão e desenvolvimento espiritual.',
    descricaoCompleta:
      'A Papisa é a guardiã dos mistérios interiores — sua energia opera no silêncio, na escuta profunda e na conexão com o subconsciente. Como Arcano Regente, revela uma dimensão fortemente guiada pela intuição e pela paciência. Favorece processos de estudo, reflexão e desenvolvimento espiritual. A sabedoria aqui não vem de livros, mas de uma percepção interna aguçada que capta o que os outros não veem. É uma vibração de receptividade ativa — o campo está aberto para revelar verdades quando há silêncio suficiente para ouvi-las.',
    desafio:
      'Evitar passividade excessiva, segredos prejudiciais e dependência emocional. O risco é paralisar na observação sem jamais agir.',
  },

  3: {
    numero: 3,
    nome: 'A Imperatriz',
    palavraChave: 'Criatividade e Abundância',
    descricaoBreve:
      'Governa criatividade, fertilidade e abundância. Favorece criação artística e tudo que nasce da expressão genuína de si mesmo.',
    descricaoCompleta:
      'A Imperatriz governa a criatividade, a fertilidade e a capacidade de nutrir projetos e pessoas com generosidade natural. Como Arcano Regente, indica uma dimensão onde a abundância flui quando há entrega e expressão autêntica. Sua energia está conectada à natureza, ao prazer e à beleza como forças organizadoras. Favorece criação artística, cuidado, empreendimentos criativos e tudo que nasce da expressão genuína de si mesmo. O campo aqui é fértil — o que for plantado com cuidado tende a florescer.',
    desafio:
      'Evitar superficialidade, vaidade excessiva e dispersão de energia criativa.',
  },

  4: {
    numero: 4,
    nome: 'O Imperador',
    palavraChave: 'Estrutura e Autoridade',
    descricaoBreve:
      'Vibração da ordem, construção e autoridade fundamentada em mérito. Favorece disciplina, sistemas e liderança responsável.',
    descricaoCompleta:
      'O Imperador é a vibração da ordem, da construção e da autoridade fundamentada em mérito. Como Arcano Regente, indica que esta dimensão está sob a regência da disciplina e da estruturação consciente. Favorece a consolidação de sistemas, a criação de regras funcionais e o exercício de liderança responsável. É uma energia de longo prazo: não produz resultados rápidos, mas cria bases que sustentam décadas.',
    desafio:
      'Evitar rigidez excessiva, autoritarismo e resistência às mudanças necessárias.',
  },

  5: {
    numero: 5,
    nome: 'O Hierofante',
    palavraChave: 'Tradição e Ensinamento',
    descricaoBreve:
      'Guardião da tradição e do conhecimento transmitido. Favorece ensinamento, rituais e conexão com o sagrado coletivo.',
    descricaoCompleta:
      '', // TODO: preencher descrição completa
    desafio:
      '', // TODO: preencher desafio
  },

  6: {
    numero: 6,
    nome: 'Os Amantes',
    palavraChave: 'Escolha e União',
    descricaoBreve:
      'Arquétipo das escolhas fundamentais e das uniões significativas. Favorece relacionamentos, parcerias e alinhamento de valores.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  7: {
    numero: 7,
    nome: 'O Carro',
    palavraChave: 'Determinação e Conquista',
    descricaoBreve:
      'Força da determinação e da conquista pelo esforço direcionado. Favorece superação de obstáculos e movimento com propósito.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  8: {
    numero: 8,
    nome: 'A Força',
    palavraChave: 'Coragem e Domínio Interior',
    descricaoBreve:
      'Poder que vem de dentro — a coragem de enfrentar os próprios medos e instintos. Favorece autodomínio e resiliência.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  9: {
    numero: 9,
    nome: 'O Eremita',
    palavraChave: 'Sabedoria e Introspecção',
    descricaoBreve:
      'O sábio que ilumina o caminho com a luz da experiência. Favorece reflexão profunda, solitude criativa e orientação espiritual.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  10: {
    numero: 10,
    nome: 'A Roda da Fortuna',
    palavraChave: 'Ciclos e Transformação',
    descricaoBreve:
      'Governa os grandes ciclos do destino e as viradas de sorte. Favorece adaptação, aproveitamento de oportunidades e visão de longo prazo.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  11: {
    numero: 11,
    nome: 'A Justiça',
    palavraChave: 'Equilíbrio e Causa e Efeito',
    descricaoBreve:
      'Arcano do equilíbrio kármico — cada ação gera uma consequência proporcional. Favorece integridade, clareza de julgamento e responsabilidade.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  12: {
    numero: 12,
    nome: 'O Enforcado',
    palavraChave: 'Entrega e Nova Perspectiva',
    descricaoBreve:
      'A inversão que liberta — pausar e ver o mundo de outro ângulo para alcançar uma compreensão mais profunda.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  13: {
    numero: 13,
    nome: 'A Morte',
    palavraChave: 'Transformação e Encerramento',
    descricaoBreve:
      'O encerramento necessário que abre espaço para o novo. Favorece transformações profundas, rupturas saudáveis e renascimentos.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  14: {
    numero: 14,
    nome: 'A Temperança',
    palavraChave: 'Equilíbrio e Integração',
    descricaoBreve:
      'Arte da síntese — unir opostos em harmonia. Favorece paciência, moderação e processos de cura e integração.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  15: {
    numero: 15,
    nome: 'O Diabo',
    palavraChave: 'Apego e Libertação',
    descricaoBreve:
      'Força dos padrões limitantes e dos apegos que prendem. Revela o que precisa ser reconhecido e liberado para a evolução.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  16: {
    numero: 16,
    nome: 'A Torre',
    palavraChave: 'Ruptura e Revelação',
    descricaoBreve:
      'A desconstrução súbita do que foi construído em bases falsas. Favorece clareza radical e reconstrução sobre alicerces verdadeiros.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  17: {
    numero: 17,
    nome: 'A Estrela',
    palavraChave: 'Esperança e Renovação',
    descricaoBreve:
      'Luz após a tempestade — renovação, esperança e conexão com o propósito maior. Favorece cura, inspiração e abertura ao futuro.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  18: {
    numero: 18,
    nome: 'A Lua',
    palavraChave: 'Ilusão e Inconsciente',
    descricaoBreve:
      'Território do inconsciente e das ilusões. Favorece trabalho com sonhos, intuição profunda e processos de autoconhecimento.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  19: {
    numero: 19,
    nome: 'O Sol',
    palavraChave: 'Iluminação e Alegria',
    descricaoBreve:
      'A vibração mais luminosa — clareza, sucesso, alegria e vitalidade. Favorece realização, visibilidade e manifestação positiva.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  20: {
    numero: 20,
    nome: 'O Julgamento',
    palavraChave: 'Renascimento e Vocação',
    descricaoBreve:
      'O chamado para a missão verdadeira — renascimento consciente e resposta ao propósito mais elevado da alma.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  21: {
    numero: 21,
    nome: 'O Mundo',
    palavraChave: 'Completude e Realização',
    descricaoBreve:
      'O ponto de chegada — completude, integração e realização plena de um ciclo. Favorece reconhecimento, sucesso e expansão global.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },

  22: {
    numero: 22,
    nome: 'O Louco',
    palavraChave: 'Potencial Ilimitado e Salto no Vazio',
    descricaoBreve:
      'O zero — potencial puro antes da forma. Energia de aventura, confiança no universo e início de uma nova jornada sem mapa.',
    descricaoCompleta:
      '', // TODO
    desafio:
      '', // TODO
  },
};

/**
 * Retorna os dados de texto de um arcano pelo número.
 * Para arcanos > 22, reduz os dígitos para obter o arcano base.
 * Para arcano 0, retorna O Louco (22).
 */
export function getArcanoTextData(numero: number): ArcanoTextData {
  if (numero === 0) return ARCANOS_DATA[22];
  if (ARCANOS_DATA[numero]) return ARCANOS_DATA[numero];
  // Reduzir dígitos para arcanos dominantes (> 22)
  let v = numero;
  while (v > 22) {
    v = String(v).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return ARCANOS_DATA[v] ?? ARCANOS_DATA[1];
}
