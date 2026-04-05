/**
 * Identidade Visual Magnética — dados de branding por número de Expressão.
 *
 * Cada número de Expressão projeta uma vibração visual específica:
 * cores, tipografia e estilo de logo derivados da numerologia cabalística.
 *
 * Usado no produto Nome Empresa para gerar a seção de Branding/Identidade Visual.
 */

export interface CorBranding {
  hex: string;
  nome: string;
  significado: string;
}

export interface IdentidadeVisual {
  numero: number;
  titulo: string;
  descricaoGeral: string;
  cores: {
    primaria: CorBranding;
    secundaria: CorBranding;
    acento: CorBranding;
  };
  tipografia: {
    titulos: { sugestao: string; estilo: string };
    corpo: { sugestao: string; estilo: string };
  };
  logo: {
    formas: string[];
    estilo: string;
    evitar: string[];
    descricao: string;
  };
}

export const IDENTIDADES_VISUAIS: Record<number, IdentidadeVisual> = {
  1: {
    numero: 1,
    titulo: 'Identidade do Pioneiro',
    descricaoGeral: 'O número 1 projeta liderança, assertividade e originalidade. A identidade visual deve comunicar poder sem ostentação — clareza visual que corta o ruído e lidera pelo exemplo.',
    cores: {
      primaria:   { hex: '#C41E1E', nome: 'Vermelho Liderança',  significado: 'Ação, coragem e pioneirismo' },
      secundaria: { hex: '#1A1A1A', nome: 'Preto Absoluto',      significado: 'Autoridade e distinção' },
      acento:     { hex: '#F0F0F0', nome: 'Branco Clareza',      significado: 'Transparência e visão' },
    },
    tipografia: {
      titulos: { sugestao: 'Futura Bold, Bebas Neue ou Montserrat ExtraBold', estilo: 'Geométrica sem serifa, peso máximo, tracking normal' },
      corpo:    { sugestao: 'Helvetica Neue, Inter ou DM Sans', estilo: 'Limpo, legível, peso regular ou medium' },
    },
    logo: {
      formas: ['Triângulo ascendente', 'Seta para cima', 'Ponto de exclamação invertido', 'Linha diagonal'],
      estilo: 'Minimalista e assertivo — um único símbolo forte, sem ornamentos',
      evitar: ['Formas circulares suaves', 'Fontes decorativas ou manuscritas', 'Paletas pastéis', 'Excesso de elementos'],
      descricao: 'O logo deve ser ousado e instantaneamente reconhecível. Uma forma angular que aponta para cima simboliza a ascensão. Versão monocromática em preto/branco deve funcionar perfeitamente.',
    },
  },

  2: {
    numero: 2,
    titulo: 'Identidade do Cuidador',
    descricaoGeral: 'O número 2 emana confiança, parceria e acolhimento. A identidade visual deve transmitir segurança emocional e proximidade humana — como um abraço visual que diz "você pode confiar em nós".',
    cores: {
      primaria:   { hex: '#5B9BD5', nome: 'Azul Confiança',     significado: 'Harmonia, diplomacia e cuidado' },
      secundaria: { hex: '#8FBC8F', nome: 'Verde Sálvia',       significado: 'Equilíbrio e natureza' },
      acento:     { hex: '#F5F0E8', nome: 'Bege Acolhimento',   significado: 'Calor, suavidade e inclusão' },
    },
    tipografia: {
      titulos: { sugestao: 'Garamond, Cormorant Garamond ou Libre Baskerville', estilo: 'Serifada humanista, peso normal ou semibold, tracking levemente amplo' },
      corpo:    { sugestao: 'Lato, Nunito ou Mulish', estilo: 'Sem serifa arredondada, peso light ou regular' },
    },
    logo: {
      formas: ['Dois círculos interligados', 'Onda suave', 'Coração geométrico', 'Formas orgânicas emparelhadas'],
      estilo: 'Orgânico e caloroso — formas curvas que comunicam parceria e comunidade',
      evitar: ['Ângulos agudos', 'Formas isoladas e rígidas', 'Cores frias e metálicas', 'Tipografia condensada e pesada'],
      descricao: 'O logo deve transmitir conexão e cuidado. Dois elementos que se complementam — seja em forma, seja em cor — comunicam a essência do 2. Cores suaves e formas arredondadas reforçam a mensagem de confiança.',
    },
  },

  3: {
    numero: 3,
    titulo: 'Identidade do Criador',
    descricaoGeral: 'O número 3 irradia criatividade, expressão e alegria. A identidade visual deve ser vibrante e inesquecível — capaz de gerar engajamento emocional imediato e transmitir a energia única desta marca.',
    cores: {
      primaria:   { hex: '#FF6B35', nome: 'Laranja Criativo',   significado: 'Entusiasmo, originalidade e expressão' },
      secundaria: { hex: '#7B2FBE', nome: 'Roxo Inspiração',    significado: 'Imaginação e profundidade criativa' },
      acento:     { hex: '#FFD700', nome: 'Amarelo Visionário', significado: 'Luminosidade, otimismo e destaque' },
    },
    tipografia: {
      titulos: { sugestao: 'Playfair Display, Abril Fatface ou Recoleta', estilo: 'Expressiva com personalidade, contrastes de peso marcantes' },
      corpo:    { sugestao: 'Open Sans, Karla ou Quicksand', estilo: 'Sem serifa amigável, peso regular, fácil leitura' },
    },
    logo: {
      formas: ['Espiral', 'Triângulo de três pontas iguais', 'Formas orgânicas únicas', 'Traço de pincel'],
      estilo: 'Expressivo e único — pode ter assimetria intencional ou uso criativo de cor',
      evitar: ['Formas simétricas excessivamente rígidas', 'Paletas monocromáticas neutras', 'Tipografia corporativa sem personalidade'],
      descricao: 'O logo deve ter personalidade inconfundível. Pode usar cor como elemento principal do símbolo. Formas que remetem à criação — espirais, traços — comunicam energia artística. A tipografia pode ser customizada ou única.',
    },
  },

  4: {
    numero: 4,
    titulo: 'Identidade do Construtor',
    descricaoGeral: 'O número 4 comunica solidez, confiabilidade e método. A identidade visual deve transmitir que esta empresa foi construída para durar — percepção de qualidade comprovada e processos que não falham.',
    cores: {
      primaria:   { hex: '#1B3A6B', nome: 'Azul Marinho',       significado: 'Estabilidade, confiança e profissionalismo' },
      secundaria: { hex: '#6B7280', nome: 'Cinza Sólido',       significado: 'Solidez e consistência' },
      acento:     { hex: '#D4AF37', nome: 'Dourado Qualidade',  significado: 'Excelência e valor duradouro' },
    },
    tipografia: {
      titulos: { sugestao: 'Montserrat Bold, Raleway Bold ou Oswald', estilo: 'Geométrica, peso forte, tracking normal a comprimido' },
      corpo:    { sugestao: 'Roboto, Source Sans Pro ou Noto Sans', estilo: 'Neutro e funcional, altamente legível' },
    },
    logo: {
      formas: ['Quadrado ou retângulo sólido', 'Hexágono', 'Cruz ou grade', 'Formas geométricas regulares'],
      estilo: 'Estrutural e sólido — simetria perfeita, proporções clássicas',
      evitar: ['Formas orgânicas irregulares', 'Paletas de cores muito vibrantes', 'Tipografia manuscrita ou decorativa', 'Assimetria'],
      descricao: 'O logo deve ser robusto e simétrico. Formas que remetem à construção e precisão — quadrados, hexágonos — transmitem a mensagem de durabilidade. A versão deve funcionar em baixa qualidade de impressão mantendo o impacto.',
    },
  },

  5: {
    numero: 5,
    titulo: 'Identidade do Explorador',
    descricaoGeral: 'O número 5 irradia liberdade, movimento e versatilidade. A identidade visual deve parecer em constante movimento — dinâmica e adaptável, capaz de surpreender sem perder identidade.',
    cores: {
      primaria:   { hex: '#00B4D8', nome: 'Turquesa Liberdade',  significado: 'Expansão, movimento e inovação' },
      secundaria: { hex: '#7DBF2E', nome: 'Verde Lima Vitalidade', significado: 'Energia, dinamismo e transformação' },
      acento:     { hex: '#FF6B6B', nome: 'Coral Disruptivo',    significado: 'Ousadia e quebra de padrões' },
    },
    tipografia: {
      titulos: { sugestao: 'Raleway, Exo 2 ou Nunito Sans Bold', estilo: 'Moderna, peso variável, pode misturar pesos' },
      corpo:    { sugestao: 'Source Sans Pro, Cabin ou Fira Sans', estilo: 'Funcional e adaptável, leitura em múltiplos contextos' },
    },
    logo: {
      formas: ['Seta curva', 'Símbolo de infinito', 'Forma com movimento implícito', 'Diagonais dinâmicas'],
      estilo: 'Dinâmico e fluido — transmite movimento e adaptabilidade',
      evitar: ['Simetria estática e rígida', 'Formas fechadas e pesadas', 'Paletas sóbrias e frias', 'Tipografia serifada clássica'],
      descricao: 'O logo deve sugerir movimento mesmo quando estático. Formas que fluem — curvas, diagonais, setas — comunicam a natureza exploradora da marca. O sistema visual pode ter múltiplas variações de cor para diferentes contextos.',
    },
  },

  6: {
    numero: 6,
    titulo: 'Identidade do Amante',
    descricaoGeral: 'O número 6 emana beleza, harmonia e calor humano. A identidade visual deve ser refinada e sensorial — capaz de criar uma conexão emocional profunda antes mesmo de qualquer palavra ser lida.',
    cores: {
      primaria:   { hex: '#C9956C', nome: 'Terracota Quente',   significado: 'Calor, sensorialidade e acolhimento' },
      secundaria: { hex: '#2E8B57', nome: 'Verde Esmeralda',    significado: 'Harmonia, equilíbrio e beleza natural' },
      acento:     { hex: '#F7CAD0', nome: 'Rosa Suave',         significado: 'Delicadeza, cuidado e elegância' },
    },
    tipografia: {
      titulos: { sugestao: 'Cormorant Garamond, EB Garamond ou Libre Caslon', estilo: 'Serifada elegante com alto contraste, peso display' },
      corpo:    { sugestao: 'Lora, Libre Baskerville ou Merriweather', estilo: 'Serifada legível, warmth, ritmo de leitura agradável' },
    },
    logo: {
      formas: ['Flor geométrica', 'Símbolo de infinito', 'Formas ovais e circulares', 'Ornamentos botânicos simplificados'],
      estilo: 'Elegante e harmonioso — beleza refinada sem ostentação',
      evitar: ['Formas angulosas e agressivas', 'Cores frias e metálicas', 'Tipografia condensada e técnica', 'Excesso de brancos/pretos puros'],
      descricao: 'O logo deve ser belo por si só — como uma joia. Formas circulares e orgânicas que remetem à natureza e harmonia. A paleta quente cria uma sensação de acolhimento que diferencia a marca no mercado.',
    },
  },

  7: {
    numero: 7,
    titulo: 'Identidade do Sábio',
    descricaoGeral: 'O número 7 projeta profundidade, expertise e precisão. A identidade visual deve comunicar autoridade intelectual — uma marca que sabe mais do que diz e que seus clientes descobrem com o tempo.',
    cores: {
      primaria:   { hex: '#4B0082', nome: 'Índigo Profundidade', significado: 'Sabedoria, mistério e profundidade espiritual' },
      secundaria: { hex: '#A9A9A9', nome: 'Prata Precisão',     significado: 'Exatidão, análise e clareza técnica' },
      acento:     { hex: '#FAFAFA', nome: 'Branco Neve',        significado: 'Clareza, pureza intelectual e espaço para reflexão' },
    },
    tipografia: {
      titulos: { sugestao: 'Didot, Times New Roman Italic ou Spectral', estilo: 'Serifada clássica de alto contraste, elegância académica' },
      corpo:    { sugestao: 'Georgia, Palatino ou EB Garamond', estilo: 'Serifada para leitura profunda, ritmo contemplativo' },
    },
    logo: {
      formas: ['Heptágono (7 lados)', 'Estrela de 7 pontas', 'Geometria sagrada simplificada', 'Formas fractais discretas'],
      estilo: 'Intrigante e sofisticado — convida à contemplação',
      evitar: ['Formas óbvias e diretas', 'Paletas muito coloridas ou vibrantes', 'Tipografia sem serifa comum', 'Elementos decorativos excessivos'],
      descricao: 'O logo deve ter uma camada oculta de significado — algo que o cliente descobre com o tempo. Geometria sagrada ou formas com simetria incomum criam uma presença marcante. O branco e o espaço vazio são elementos de design, não ausência.',
    },
  },

  8: {
    numero: 8,
    titulo: 'Identidade do Governante',
    descricaoGeral: 'O número 8 manifesta poder, abundância e prestígio. A identidade visual deve comunicar que esta é uma marca premium — onde cada detalhe foi pensado para expressar excelência e autoridade no mercado.',
    cores: {
      primaria:   { hex: '#D4AF37', nome: 'Dourado Imperial',   significado: 'Poder, prosperidade e excelência' },
      secundaria: { hex: '#0D0D0D', nome: 'Preto Profundo',     significado: 'Autoridade absoluta e sofisticação' },
      acento:     { hex: '#800020', nome: 'Bordô Prestígio',    significado: 'Status, tradição e distinção' },
    },
    tipografia: {
      titulos: { sugestao: 'Trajan Pro, Cinzel ou Big Caslon', estilo: 'Majestosa, serifada de alto contraste, tracking amplo em maiúsculas' },
      corpo:    { sugestao: 'Garamond, Caslon ou Adobe Text Pro', estilo: 'Clássica e refinada, precisão editorial' },
    },
    logo: {
      formas: ['Símbolo do infinito (∞)', 'Octógono', 'Coroa geométrica simplificada', 'Forma de diamante ou escudo'],
      estilo: 'Premium e atemporal — como os grandes emblemas de marcas de luxo',
      evitar: ['Formas infantis ou lúdicas', 'Paletas pastéis ou muito coloridas', 'Tipografia geométrica moderna e informal', 'Assimetrias acidentais'],
      descricao: 'O logo deve comunicar prestígio imediatamente. O símbolo do infinito representa o ciclo eterno de prosperidade do 8. Dourado sobre preto é a combinação clássica de poder. Cada elemento deve ter peso e intenção — sem nada supérfluo.',
    },
  },

  9: {
    numero: 9,
    titulo: 'Identidade do Humanista',
    descricaoGeral: 'O número 9 irradia propósito, compaixão e visão global. A identidade visual deve comunicar que esta marca existe por algo maior do que si mesma — capaz de inspirar movimento e comprometimento coletivo.',
    cores: {
      primaria:   { hex: '#4A7856', nome: 'Verde Terra',        significado: 'Propósito, sustentabilidade e impacto positivo' },
      secundaria: { hex: '#C96A2A', nome: 'Terracota Humana',   significado: 'Calor humano, diversidade e inclusão' },
      acento:     { hex: '#4169E1', nome: 'Azul Universal',     significado: 'Visão global e pensamento coletivo' },
    },
    tipografia: {
      titulos: { sugestao: 'Playfair Display, Freight Display ou Canela', estilo: 'Humanista e expressiva, combina tradição e modernidade' },
      corpo:    { sugestao: 'Merriweather, Literata ou Lora', estilo: 'Serifada de alta legibilidade, próxima de periódicos de qualidade' },
    },
    logo: {
      formas: ['Círculo com abertura (incompletude que convida)', 'Globo simplificado', 'Mãos geométricas', 'Espiral de expansão'],
      estilo: 'Inspirador e acessível — grandioso sem ser elitista',
      evitar: ['Formas que fecham e isolam', 'Paletas muito corporativas ou frias', 'Simbolismo hermético ou exclusivo', 'Excesso de refinamento que distancia'],
      descricao: 'O logo deve comunicar abertura e pertencimento. Um círculo que não fecha completamente simboliza a missão sempre em andamento. As cores terrosas comunicam raízes humanas enquanto o azul expande para o horizonte global.',
    },
  },

  11: {
    numero: 11,
    titulo: 'Identidade do Mensageiro',
    descricaoGeral: 'O número mestre 11 vibra em frequência extraordinária — intuição, inspiração e mensagem transformadora. A identidade visual deve capturar algo além do racional, tocando diretamente a sensibilidade do espectador.',
    cores: {
      primaria:   { hex: '#B784A7', nome: 'Lilás Etéreo',       significado: 'Intuição, espiritualidade e transformação' },
      secundaria: { hex: '#E8E8E8', nome: 'Prata Celestial',    significado: 'Clarividência e mensagem luminosa' },
      acento:     { hex: '#FFD700', nome: 'Dourado Iluminação', significado: 'Inspiração divina e mensagem elevada' },
    },
    tipografia: {
      titulos: { sugestao: 'Cinzel, Josefin Sans ou Philosopher', estilo: 'Com presença celestial, tracking amplo, leveza e ascensão' },
      corpo:    { sugestao: 'EB Garamond, Crimson Pro ou Cardo', estilo: 'Serifada com espírito humanista, ritmo de leitura contemplativo' },
    },
    logo: {
      formas: ['Estrela de 6 pontas (duas estrelas sobrepostas)', 'Raios de luz', 'Dupla vertical (11)', 'Formas ascendentes e etéreas'],
      estilo: 'Etéreo e impactante — o logo deve parecer que emite luz',
      evitar: ['Formas pesadas e densas', 'Paletas terrosas ou muito saturadas', 'Simbolismo mundano ou corporativo', 'Tipografia sem ritmo espiritual'],
      descricao: 'O logo deve ter uma qualidade quase luminosa. A dupla vertical do próprio número 11 pode ser um símbolo poderoso — dois pilares de luz. Lilás e prata sobre fundo escuro cria uma presença visual que ressoa antes de ser lida.',
    },
  },

  22: {
    numero: 22,
    titulo: 'Identidade do Arquiteto',
    descricaoGeral: 'O número mestre 22 é a manifestação máxima — visão em escala épica traduzida em estrutura concreta. A identidade visual deve comunicar legado desde o primeiro contato — uma marca que foi construída para gerações.',
    cores: {
      primaria:   { hex: '#0A2463', nome: 'Azul Real',          significado: 'Visão estratégica e manifestação de grandeza' },
      secundaria: { hex: '#D4AF37', nome: 'Dourado Manifestação', significado: 'Materialização do ideal em excelência' },
      acento:     { hex: '#808080', nome: 'Granito',            significado: 'Solidez inabalável e durabilidade' },
    },
    tipografia: {
      titulos: { sugestao: 'Helvetica Neue Bold, Gill Sans Ultra Bold ou Akzidenz-Grotesk', estilo: 'Suíça clássica, precisão e força arquitetural' },
      corpo:    { sugestao: 'Gill Sans, Trade Gothic ou Futura Book', estilo: 'Humanista sem serifa, funcional e elegante' },
    },
    logo: {
      formas: ['Pirâmide', 'Espiral de crescimento (Fibonacci)', 'Cubo isométrico', 'Estrutura modular em grade'],
      estilo: 'Monumental e preciso — a escala do logo deve comunicar grandeza mesmo em tamanho pequeno',
      evitar: ['Formas efêmeras ou decorativas', 'Paletas muito vibrantes ou quentes', 'Tipografia expressiva ou manuscrita', 'Elementos que envelhecem rapidamente'],
      descricao: 'O logo deve parecer que foi esculpido, não desenhado. Formas que remetem à arquitetura e à matemática sagrada — proporção áurea, espiral de Fibonacci — comunicam o número mestre 22. Azul profundo e dourado criam a combinação de visão e manifestação.',
    },
  },
};

/**
 * Retorna a identidade visual para o número de Expressão fornecido.
 * Reduz números > 9 que não sejam 11 ou 22.
 */
export function getIdentidadeVisual(numero: number): IdentidadeVisual {
  if (numero === 11 || numero === 22) return IDENTIDADES_VISUAIS[numero]!;
  let n = numero;
  while (n > 9) {
    n = String(n).split('').reduce((acc, d) => acc + Number(d), 0);
    if (n === 11 || n === 22) return IDENTIDADES_VISUAIS[n]!;
  }
  return IDENTIDADES_VISUAIS[n] ?? IDENTIDADES_VISUAIS[1]!;
}
