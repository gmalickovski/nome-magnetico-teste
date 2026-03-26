/**
 * Arquétipos Junguianos/Narrativos — camada narrativa sobre os números cabalísticos.
 * Derivados do número de Expressão já calculado — sem alteração no sistema numerológico.
 */

export interface Arquetipo {
  numero: number;
  nome: string;
  sombra: string;
  essencia: string;
  descricao: string;
  expressaoPositiva: string[];
  expressaoSombra: string[];
  figurasMiticas: string[];
  /** Marca o(a)s famosas que carregam esse arquétipo — uso no produto Nome Empresa */
  marcasReferencia: string[];
  /** Como esse arquétipo se posiciona no mercado — uso no produto Nome Empresa */
  posicionamento: string;
}

export const ARQUETIPOS: Record<number, Arquetipo> = {
  1: {
    numero: 1,
    nome: 'O Herói',
    sombra: 'O Tirano',
    essencia: 'Sou capaz. Eu lidero o caminho.',
    descricao:
      'O Herói é a força que move montanhas pela força da vontade e da coragem. ' +
      'Vem ao mundo para abrir caminhos onde não existem trilhas, inspira pelo exemplo ' +
      'e recusa a mediocridade. Sua jornada é transformar o mundo pela ação direta e pela liderança autêntica.',
    expressaoPositiva: [
      'Coragem para iniciar o que outros evitam',
      'Capacidade de inspirar e mobilizar pessoas',
      'Determinação inabalável diante dos obstáculos',
    ],
    expressaoSombra: [
      'Autoritarismo e necessidade de controle',
      'Arrogância ao desconsiderar o coletivo',
      'Incapacidade de pedir ajuda ou mostrar vulnerabilidade',
    ],
    figurasMiticas: ['Hércules', 'Arjuna', 'Joana d\'Arc'],
    marcasReferencia: ['Nike', 'Red Bull', 'Duracell'],
    posicionamento:
      'Posiciona-se como referência de excelência e superação. Atrai clientes que querem vencer desafios e se destacar.',
  },

  2: {
    numero: 2,
    nome: 'O Cuidador',
    sombra: 'O Mártir',
    essencia: 'Estou aqui por você. Cuido com amor.',
    descricao:
      'O Cuidador existe para servir, proteger e nutrir. Possui sensibilidade aguçada para as necessidades alheias ' +
      'e encontra significado profundo nas relações. Sua força está na escuta ativa, na diplomacia e na capacidade ' +
      'de criar ambientes seguros onde as pessoas podem florescer.',
    expressaoPositiva: [
      'Empatia profunda e capacidade de acolher',
      'Habilidade para mediar conflitos e criar harmonia',
      'Lealdade e comprometimento com quem ama',
    ],
    expressaoSombra: [
      'Anulação de si mesmo em favor dos outros',
      'Dificuldade em estabelecer limites saudáveis',
      'Vitimização quando o cuidado não é reconhecido',
    ],
    figurasMiticas: ['Deméter', 'Florence Nightingale', 'Buda da Compaixão'],
    marcasReferencia: ['Johnson & Johnson', 'UNICEF', 'Natura'],
    posicionamento:
      'Posiciona-se como marca de confiança, cuidado e relações humanas. Atrai clientes que valorizam pertencimento e segurança.',
  },

  3: {
    numero: 3,
    nome: 'O Criador',
    sombra: 'O Disperso',
    essencia: 'Me expresso. Transformo o mundo pela criação.',
    descricao:
      'O Criador é o arquétipo da expressão pura — usa a arte, a palavra e a imaginação para dar forma ' +
      'ao que antes era invisível. Vive para fazer existir o que ainda não existe. ' +
      'Sua missão é inspirar beleza, alegria e inovação, tornando o mundo mais rico e colorido.',
    expressaoPositiva: [
      'Imaginação fértil e visão inovadora',
      'Capacidade de comunicar ideias com beleza e profundidade',
      'Entusiasmo contagiante que inspira os outros',
    ],
    expressaoSombra: [
      'Dispersão e dificuldade em concluir projetos',
      'Busca por validação externa para a autoestima',
      'Dramaticidade e oscilação emocional intensa',
    ],
    figurasMiticas: ['Apolo', 'Sheherazade', 'Leonardo da Vinci'],
    marcasReferencia: ['Apple', 'LEGO', 'Adobe'],
    posicionamento:
      'Posiciona-se como referência em inovação, design e cultura. Atrai clientes criativos, visionários e que valorizam estética.',
  },

  4: {
    numero: 4,
    nome: 'O Construtor',
    sombra: 'O Controlador',
    essencia: 'Construo com método. O que faço é para durar.',
    descricao:
      'O Construtor é a arquitetura da realidade. Traz ordem ao caos, constrói fundações sólidas e ' +
      'sabe que os grandes projetos exigem paciência e disciplina. ' +
      'É o guardião da estabilidade — aquele que converte sonhos em estruturas concretas e duradouras.',
    expressaoPositiva: [
      'Confiabilidade e consistência em tudo que faz',
      'Capacidade de organizar recursos e executar com excelência',
      'Perseverança diante de longos processos de construção',
    ],
    expressaoSombra: [
      'Rigidez e resistência a mudanças necessárias',
      'Obsessão por controle que afasta colaboradores',
      'Visão limitada ao que é "comprovado" — medo do novo',
    ],
    figurasMiticas: ['Hefesto', 'Imhotep', 'Maçonaria Sagrada'],
    marcasReferencia: ['IKEA', 'Caterpillar', 'Bosch'],
    posicionamento:
      'Posiciona-se como marca de confiança, durabilidade e qualidade comprovada. Atrai clientes que valorizam segurança e longo prazo.',
  },

  5: {
    numero: 5,
    nome: 'O Explorador',
    sombra: 'O Instável',
    essencia: 'Sou livre. Explore, descubra, transforme.',
    descricao:
      'O Explorador é o espírito que não suporta fronteiras. Impulsionado pela curiosidade insaciável, ' +
      'desafia o status quo e busca sempre o horizonte seguinte. ' +
      'Traz inovação disruptiva, versatilidade e a coragem de experimentar o que nunca foi tentado.',
    expressaoPositiva: [
      'Adaptabilidade e capacidade de prosperar na mudança',
      'Pensamento lateral que gera soluções inovadoras',
      'Magnetismo natural que atrai experiências ricas',
    ],
    expressaoSombra: [
      'Comprometimento superficial e fuga do que exige constância',
      'Impulsividade e decisões reativas sem planejamento',
      'Tendência ao excesso — sensações, vícios, dispersão',
    ],
    figurasMiticas: ['Odisseu (Ulisses)', 'Hermes', 'Marco Polo'],
    marcasReferencia: ['Airbnb', 'GoPro', 'The North Face'],
    posicionamento:
      'Posiciona-se como marca de liberdade, aventura e inovação disruptiva. Atrai clientes que querem transformar sua rotina e sair do convencional.',
  },

  6: {
    numero: 6,
    nome: 'O Amante',
    sombra: 'O Possessivo',
    essencia: 'Amo, cuido e crio beleza ao meu redor.',
    descricao:
      'O Amante é a força que une, nutre e embeleza o mundo. Comprometido com a harmonia, ' +
      'a beleza e a profundidade nas relações. Possui sensibilidade estética elevada e capacidade ' +
      'de fazer as pessoas se sentirem verdadeiramente vistas e amadas.',
    expressaoPositiva: [
      'Profundidade emocional e conexões autênticas',
      'Senso estético refinado e atenção ao detalhe',
      'Calor humano e capacidade de criar ambientes acolhedores',
    ],
    expressaoSombra: [
      'Ciúme e possessividade que sufoca o outro',
      'Codependência emocional e dificuldade em ser só',
      'Idealização que leva a decepções repetidas',
    ],
    figurasMiticas: ['Afrodite', 'Rumi', 'Romeu e Julieta'],
    marcasReferencia: ['Chanel', 'Häagen-Dazs', 'Hallmark'],
    posicionamento:
      'Posiciona-se como marca de luxo sensorial, experiência e emoção. Atrai clientes que buscam qualidade, beleza e conexão.',
  },

  7: {
    numero: 7,
    nome: 'O Sábio',
    sombra: 'O Ermitão',
    essencia: 'Busco a verdade. O conhecimento profundo liberta.',
    descricao:
      'O Sábio é a mente que atravessa superfícies e toca a essência das coisas. ' +
      'Dotado de inteligência analítica e intuição espiritual, vive para compreender o que poucos percebem. ' +
      'É o guardião do conhecimento genuíno — aquele que ilumina pelo saber, não pelo poder.',
    expressaoPositiva: [
      'Inteligência profunda e capacidade de análise sistêmica',
      'Intuição aguçada para padrões ocultos',
      'Credibilidade e autoridade conquistada pelo mérito real',
    ],
    expressaoSombra: [
      'Isolamento e arrogância intelectual',
      'Paralisia por análise — dificuldade de agir sem certeza total',
      'Distância emocional que afasta relacionamentos íntimos',
    ],
    figurasMiticas: ['Merlin', 'Minerva (Atena)', 'Confúcio'],
    marcasReferencia: ['Google', 'McKinsey', 'The Economist'],
    posicionamento:
      'Posiciona-se como autoridade em conhecimento, inteligência e expertise. Atrai clientes que valorizam profundidade, dados e resultados comprovados.',
  },

  8: {
    numero: 8,
    nome: 'O Governante',
    sombra: 'O Déspota',
    essencia: 'Manifesto poder com propósito. Abundância é meu estado natural.',
    descricao:
      'O Governante é a energia da manifestação material com maestria. ' +
      'Possui visão estratégica, poder de influência e a capacidade de construir impérios — ' +
      'seja no mundo dos negócios, das artes ou do serviço. ' +
      'Quando integrado, usa o poder para elevar o coletivo; quando na sombra, domina pelo medo.',
    expressaoPositiva: [
      'Visão estratégica e capacidade de construir estruturas de impacto',
      'Magnetismo natural para recursos, parcerias e oportunidades',
      'Liderança que inspira excelência e resultados concretos',
    ],
    expressaoSombra: [
      'Obsessão por status e poder a qualquer custo',
      'Dificuldade em confiar e delegar — necessidade de controle total',
      'Materialismo excessivo que perde de vista o propósito maior',
    ],
    figurasMiticas: ['Zeus', 'Salomão', 'Medici'],
    marcasReferencia: ['Rolex', 'Mercedes-Benz', 'Goldman Sachs'],
    posicionamento:
      'Posiciona-se como marca premium de poder e excelência. Atrai clientes bem-sucedidos que buscam o melhor e associam a marca ao seu próprio status.',
  },

  9: {
    numero: 9,
    nome: 'O Humanista',
    sombra: 'O Sacrificado',
    essencia: 'Sirvo ao todo. A transformação coletiva é minha missão.',
    descricao:
      'O Humanista é a alma que veio ao mundo para servir algo maior do que si mesmo. ' +
      'Compassivo, visionário e idealmente comprometido com a transformação da humanidade, ' +
      'carrega a sabedoria de múltiplas experiências passadas. ' +
      'Sua maior realização está no impacto positivo que deixa nas pessoas e no mundo.',
    expressaoPositiva: [
      'Compaixão universal e empatia que transcende fronteiras',
      'Visão ampla que conecta propósito individual ao bem coletivo',
      'Capacidade de inspirar transformação profunda nas pessoas',
    ],
    expressaoSombra: [
      'Autossacrifício que esgota sem criar impacto real',
      'Idealismo que se perde sem praticidade e ação concreta',
      'Dificuldade em concluir ciclos e receber em troca',
    ],
    figurasMiticas: ['Mahatma Gandhi', 'Madre Teresa', 'Prometeu'],
    marcasReferencia: ['Patagonia', 'TOMS', 'Médicos Sem Fronteiras'],
    posicionamento:
      'Posiciona-se como marca de propósito e impacto social. Atrai clientes conscientes que querem que suas escolhas reflitam seus valores.',
  },

  11: {
    numero: 11,
    nome: 'O Mensageiro',
    sombra: 'O Sonhador',
    essencia: 'Trago luz ao coletivo. Sou ponte entre mundos.',
    descricao:
      'O Mensageiro carrega a vibração dos números mestres — uma sensibilidade extraordinária ' +
      'aliada à missão de iluminar o caminho para muitos. ' +
      'Possui intuição profética, carisma magnético e a capacidade de inspirar transformações coletivas. ' +
      'Sua presença toca algo além do racional — ela ressoa na alma das pessoas.',
    expressaoPositiva: [
      'Intuição e visão que captam o que a maioria não vê',
      'Carisma e magnetismo que mobilizam movimentos',
      'Capacidade de inspirar fé e esperança onde há escuridão',
    ],
    expressaoSombra: [
      'Ansiedade e hipersensibilidade que paralisam a ação',
      'Idealismo desconectado da realidade prática',
      'Necessidade de validação que compromete a autenticidade',
    ],
    figurasMiticas: ['Hermes Trismegisto', 'Joana d\'Arc', 'Martin Luther King'],
    marcasReferencia: ['TED Talks', 'Greenpeace', 'Oprah Winfrey Network'],
    posicionamento:
      'Posiciona-se como marca de inspiração e transformação. Atrai seguidores que buscam significado, propósito e pertencimento a algo maior.',
  },

  22: {
    numero: 22,
    nome: 'O Arquiteto',
    sombra: 'O Perfeccionista',
    essencia: 'Construo legados que transcendem o tempo.',
    descricao:
      'O Arquiteto é o número mestre da manifestação máxima — a capacidade de traduzir visões espirituais ' +
      'em estruturas concretas de grande escala. ' +
      'Carrega a responsabilidade de construir não apenas para si, mas para gerações futuras. ' +
      'Quando integrado, é a força mais poderosa de criação e transformação no plano material.',
    expressaoPositiva: [
      'Visão estratégica de longo prazo e escala transformadora',
      'Capacidade de unir o ideal espiritual com a execução prática',
      'Liderança que inspira comprometimento com algo maior do que o próprio ego',
    ],
    expressaoSombra: [
      'Perfeccionismo que paralisa e impede o início ou conclusão',
      'Pressão interna excessiva pelo peso da missão percebida',
      'Arrogância de quem se vê como único capaz de executar a visão',
    ],
    figurasMiticas: ['Dédalo', 'Salomão (Templo)', 'Nikola Tesla'],
    marcasReferencia: ['SpaceX', 'LVMH', 'Berkshire Hathaway'],
    posicionamento:
      'Posiciona-se como marca de legado e excelência máxima. Atrai clientes visionários que pensam em décadas, não em trimestres.',
  },
};

/**
 * Retorna o arquétipo correspondente ao número fornecido.
 * Reduz números > 9 que não sejam 11 ou 22.
 */
export function getArquetipo(numero: number): Arquetipo {
  if (numero === 11 || numero === 22) return ARQUETIPOS[numero]!;
  let n = numero;
  while (n > 9) {
    n = String(n).split('').reduce((acc, d) => acc + Number(d), 0);
    if (n === 11 || n === 22) return ARQUETIPOS[n]!;
  }
  return ARQUETIPOS[n] ?? ARQUETIPOS[1]!;
}
