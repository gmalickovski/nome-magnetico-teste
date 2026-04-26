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
    descricao: 'O Mago é o arquétipo do criador consciente — aquele que transforma intenção em resultado concreto usando todos os recursos disponíveis. Sua energia governa a liderança, a iniciativa e o poder de manifestação. Quando ativo como Arcano Regente, potencializa a autonomia, o magnetismo pessoal e a capacidade de abrir novos ciclos. É a vibração do protagonismo: favorece empreendimentos autorais, posições de liderança e períodos em que o esforço encontra resultado direto. A vontade é o motor — e aqui ela está plenamente disponível.',
    desafio: 'Evitar arrogância, impulsividade e uso do poder de forma egocêntrica. O maior risco é confundir força de vontade com rigidez e deixar de ouvir o que o campo ao redor está sinalizando.',
  },
  2: {
    numero: 2,
    nome: 'A Papisa',
    palavraChave: 'Intuição e Conhecimento Interior',
    descricao: 'A Papisa é a guardiã dos mistérios interiores — sua energia opera no silêncio, na escuta profunda e na conexão com o subconsciente. Como Arcano Regente, revela uma dimensão fortemente guiada pela intuição e pela paciência. Favorece processos de estudo, reflexão e desenvolvimento espiritual. A sabedoria aqui não vem de livros, mas de uma percepção interna aguçada que capta o que os outros não veem. É uma vibração de receptividade ativa — o campo está aberto para revelar verdades quando há silêncio suficiente para ouvi-las.',
    desafio: 'Evitar passividade excessiva, segredos prejudiciais e dependência emocional. O risco aqui é paralisar na observação sem jamais agir — ou guardar percepções valiosas que precisavam ser compartilhadas.',
  },
  3: {
    numero: 3,
    nome: 'A Imperatriz',
    palavraChave: 'Criatividade e Abundância',
    descricao: 'A Imperatriz governa a criatividade, a fertilidade e a capacidade de nutrir projetos e pessoas com generosidade natural. Como Arcano Regente, indica uma dimensão onde a abundância flui quando há entrega e expressão autêntica. Sua energia está conectada à natureza, ao prazer e à beleza como forças organizadoras. Favorece criação artística, cuidado, empreendimentos criativos e tudo que nasce da expressão genuína de si mesmo. O campo aqui é fértil — o que for plantado com cuidado tende a florescer.',
    desafio: 'Evitar superficialidade, vaidade excessiva e dispersão de energia criativa. O excesso desta vibração pode gerar dependência de conforto e resistência aos momentos difíceis que também fazem parte do ciclo.',
  },
  4: {
    numero: 4,
    nome: 'O Imperador',
    palavraChave: 'Estrutura e Autoridade',
    descricao: 'O Imperador é a vibração da ordem, da construção e da autoridade fundamentada em mérito. Como Arcano Regente, indica que esta dimensão está sob a regência da disciplina e da estruturação consciente. Favorece a consolidação de sistemas, a criação de regras funcionais e o exercício de liderança responsável. É uma energia de longo prazo: não produz resultados rápidos, mas cria bases que sustentam décadas. O terreno aqui exige método e comprometimento — quem planta com cuidado colhe com consistência.',
    desafio: 'Evitar rigidez, autoritarismo e apego excessivo ao controle. A estabilidade construída pode se tornar uma prisão se a flexibilidade for descartada em nome da ordem.',
  },
  5: {
    numero: 5,
    nome: 'O Papa (Hierofante)',
    palavraChave: 'Sabedoria e Ensinamento',
    descricao: 'O Hierofante é a ponte entre o mundo material e o espiritual — sua energia governa o conhecimento, o ensinamento e a busca por propósito superior. Como Arcano Regente, indica que esta dimensão é profundamente influenciada por crenças, tradições e sistemas de valores. Favorece estudos aprofundados, o papel de mentor e a transmissão de sabedoria. Há uma vocação de servir como referência — seja como professor, conselheiro ou líder comunitário. O caminho aqui pede integração entre o que se sabe e o que se vive.',
    desafio: 'Evitar dogmatismo, moralismo excessivo e dependência de aprovação externa. Quando a sabedoria se fecha em si mesma, ela deixa de ser sabedoria e passa a ser doutrina.',
  },
  6: {
    numero: 6,
    nome: 'Os Enamorados',
    palavraChave: 'Escolhas e Harmonia',
    descricao: 'Os Enamorados governam as grandes escolhas da vida — aquelas que definem quem você será, não apenas o que você fará. Como Arcano Regente, revela uma dimensão marcada por dilemas relacionais e decisões que envolvem o coração. Favorece relacionamentos significativos, parcerias estratégicas e situações que exigem alinhar valores com ações. O equilíbrio entre razão e emoção é o tema central: quando integrados, as escolhas fluem com harmonia. Esta vibração convida à honestidade consigo mesmo como fundamento de qualquer compromisso duradouro.',
    desafio: 'Evitar indecisão, dependência afetiva e julgamentos superficiais. A incapacidade de escolher — ou de honrar as próprias escolhas — é o principal obstáculo desta vibração.',
  },
  7: {
    numero: 7,
    nome: 'O Carro',
    palavraChave: 'Determinação e Vitória',
    descricao: 'O Carro representa a vitória conquistada pelo domínio das forças internas — a vontade disciplinada que avança mesmo quando os ventos sopram em direções opostas. Como Arcano Regente, indica uma dimensão que exige determinação, controle e direcionamento claro. Favorece superação de obstáculos, competições e qualquer situação que demande manter o foco sob pressão. É a vibração do atleta mental — aquele que vence não pela força bruta, mas pelo alinhamento entre intenção e ação. O caminho aqui pede direção clara; sem ela, a energia se dispersa em velocidade sem destino.',
    desafio: 'Evitar arrogância após a vitória, dispersão de energia e falta de direção. O Carro sem rédeas é o caos — a mesma força que produz vitória pode produzir destruição quando mal dirigida.',
  },
  8: {
    numero: 8,
    nome: 'A Justiça',
    palavraChave: 'Equilíbrio e Integridade',
    descricao: 'A Justiça governa a lei de causa e efeito — o princípio de que cada ação gera uma consequência equivalente, sem exceções. Como Arcano Regente, revela uma dimensão onde a integridade e a responsabilidade determinam os resultados. Favorece situações que exigem tomada de decisão ética, mediação de conflitos e processos que envolvem equilíbrio e verdade. O campo aqui é altamente sensível à honestidade: ações alinhadas com os próprios valores geram resultados proporcionais. Não há atalhos — mas também não há injustiças duradouras.',
    desafio: 'Evitar julgamentos severos, inflexibilidade e busca por punição em vez de correção. A Justiça desequilibrada se torna crueldade — a régua que mede os outros com mais rigor do que a si mesma.',
  },
  9: {
    numero: 9,
    nome: 'O Eremita',
    palavraChave: 'Introspecção e Sabedoria',
    descricao: 'O Eremita representa a sabedoria que só vem da experiência vivida — a luz interior que guia quando o caminho externo parece obscuro. Como Arcano Regente, indica que esta dimensão exige introspecção, paciência e disposição para pausar antes de agir. Favorece períodos de retiro, estudo aprofundado e consolidação da jornada percorrida. É a vibração do fim de ciclo: o que foi vivido está sendo integrado, e um novo capítulo aguarda quando a síntese estiver completa. O silêncio aqui não é ausência — é a linguagem do amadurecimento.',
    desafio: 'Evitar isolamento excessivo, arrogância espiritual e recusa ao reengajamento com o mundo. A sabedoria guardada apenas para si perde o sentido — ela só se completa quando é compartilhada.',
  },
  10: {
    numero: 10,
    nome: 'A Roda da Fortuna',
    palavraChave: 'Ciclos e Transformação',
    descricao: 'A Roda da Fortuna representa os grandes ciclos da existência — os momentos de virada que chegam independentemente da vontade, redesenhando o terreno da vida. Como Arcano Regente, indica uma dimensão marcada pela alternância entre expansão e contração, oportunidade e desafio. Quem compreende os ciclos navega com mais elegância: não resiste ao movimento, mas aprende a surfar as ondas. Favorece adaptação estratégica, reconhecimento de padrões e a disposição de reinventar sem perder a essência. O tempo aqui é aliado de quem mantém a consciência ativa.',
    desafio: 'Evitar passividade diante das mudanças e a crença de que tudo é mero acaso. A Roda gira — mas a consciência de quem está nela determina se o movimento é evolução ou repetição.',
  },
  11: {
    numero: 11,
    nome: 'A Força',
    palavraChave: 'Coragem e Domínio Interior',
    descricao: 'A Força é a vibração do poder que nasce de dentro — não da dominação, mas do domínio amoroso sobre os próprios instintos e impulsos. Como Arcano Regente, revela uma dimensão que exige coragem interior e paciência estratégica. Favorece processos de autodomínio, situações que exigem perseverança discreta e o exercício da influência pelo exemplo. Número Mestre — esta energia tende a ser intensa, amplificando tanto os talentos quanto os desafios. O campo aqui recompensa quem transforma fragilidade em consciência, e consciência em força tranquila.',
    desafio: 'Evitar uso da força de forma opressiva e a negação da própria vulnerabilidade. Negar a fragilidade não produz força — produz rigidez, que quebra onde a flexibilidade resistiria.',
  },
  12: {
    numero: 12,
    nome: 'O Enforcado',
    palavraChave: 'Pausa e Perspectiva',
    descricao: 'O Enforcado representa o poder da pausa voluntária — o sacrifício de uma perspectiva limitada para que uma visão mais ampla possa emergir. Como Arcano Regente, indica que esta dimensão passa por um período de suspensão necessária: espera que não é passividade, mas preparação. Favorece mudanças de ponto de vista, entrega a processos além do controle imediato e momentos em que o melhor movimento é nenhum movimento. O que parece estagnação aqui frequentemente é gestação — algo novo está se formando sob a superfície. A resistência à pausa custa mais do que a aceitação dela.',
    desafio: 'Evitar vitimismo, autossabotagem e resistência às pausas necessárias. Forçar o movimento quando o campo pede pausa não acelera o processo — apenas desgasta quem força.',
  },
  13: {
    numero: 13,
    nome: 'A Morte',
    palavraChave: 'Transformação e Renovação',
    descricao: 'A Morte não representa fim — representa transformação radical e irreversível de uma forma para outra. Como Arcano Regente, indica que esta dimensão está sob a regência de ciclos de encerramento e renovação profunda. Favorece o desapego de padrões, situações ou identidades que cumpriram seu papel e o recomeço que se abre após. É uma das energias mais poderosas do campo: quando não é resistida, libera uma quantidade extraordinária de energia criativa. O que precisa morrer aqui está abrindo espaço para algo genuinamente novo.',
    desafio: 'Evitar medo das mudanças, apego ao passado e resistência ao inevitável. O apego ao que já morreu não preserva nada — apenas adia o sofrimento e retarda o florescimento do novo.',
  },
  14: {
    numero: 14,
    nome: 'A Temperança',
    palavraChave: 'Equilíbrio e Moderação',
    descricao: 'A Temperança governa a alquimia interior — a arte de combinar elementos aparentemente opostos com paciência e sabedoria para criar algo novo e equilibrado. Como Arcano Regente, indica que esta dimensão é governada pela moderação e pelo fluxo contínuo entre estados diferentes. Favorece processos de cura, integração de opostos e situações que exigem ajuste fino em vez de grandes gestos. É a vibração do alquimista: pequenas correções consistentes produzem transformações profundas ao longo do tempo. O campo aqui recompensa paciência e presença, não pressa e força bruta.',
    desafio: 'Evitar extremos, impaciência e a tentação de forçar resultados prematuros. A alquimia não pode ser apressada — tentar acelerar o processo geralmente desfaz o que já estava sendo construído.',
  },
  15: {
    numero: 15,
    nome: 'O Diabo',
    palavraChave: 'Sombra e Libertação',
    descricao: 'O Diabo representa os apegos, vícios e padrões sombrios que aprisionam — mas também a energia bruta que, quando reconhecida e integrada, se converte em potência genuína. Como Arcano Regente, indica que esta dimensão está sendo influenciada por forças inconscientes que operam por baixo da superfície. Favorece trabalho de sombra, liberação de dependências e a transformação do que foi suprimido em força consciente. A negação desta energia aumenta seu poder; o reconhecimento a dissolve. O caminho aqui é a integração honesta — encarar o que foi evitado para deixar de ser governado por ele.',
    desafio: 'Evitar escravidão aos vícios, materialismo excessivo e negação da própria sombra. O que não é visto governa. A única saída é a consciência — não a supressão.',
  },
  16: {
    numero: 16,
    nome: 'A Torre',
    palavraChave: 'Ruptura e Revelação',
    descricao: 'A Torre representa a destruição súbita de estruturas construídas sobre bases falsas — o raio que derruba o que parecia sólido, revelando a verdade que estava encoberta. Como Arcano Regente, indica que esta dimensão está sujeita a rupturas inesperadas que, embora dolorosas, são necessárias para o realinhamento. Favorece a reconstrução sobre bases verdadeiras após colapsos de sistemas que já não serviam. É uma vibração intensa que não pode ser evitada — apenas atravessada com consciência. O que desmorona aqui libera espaço para algo construído com muito mais integridade.',
    desafio: 'Evitar reconstruir os mesmos padrões após a queda e resistir às transformações radicais. Depois da Torre, o maior erro é usar os mesmos tijolos falsos para erguer o mesmo muro em outro lugar.',
  },
  17: {
    numero: 17,
    nome: 'A Estrela',
    palavraChave: 'Esperança e Inspiração',
    descricao: 'A Estrela é a luz que aparece após a tempestade — a vibração da renovação, da esperança fundamentada e da generosidade sem cálculo. Como Arcano Regente, indica que esta dimensão é governada por uma energia de cura e de abertura ao futuro. Favorece projetos criativos, atos de serviço genuíno, situações que exigem fé ativa e a capacidade de inspirar os outros pela própria clareza. É a vibração do que é autêntico: quando a expressão está alinhada com os valores internos, a vida responde com abundância. O campo aqui é nutritivo para quem se permite ser visto.',
    desafio: 'Evitar idealismo ingênuo e desconexão da realidade prática. A esperança sem ação é apenas fantasia — a Estrela pede que a fé no futuro se converta em movimento concreto no presente.',
  },
  18: {
    numero: 18,
    nome: 'A Lua',
    palavraChave: 'Ilusão e Inconsciente',
    descricao: 'A Lua governa as profundezas do inconsciente — os medos, as fantasias e as intuições que operam abaixo do limiar da consciência racional. Como Arcano Regente, indica que esta dimensão é fortemente influenciada pelo invisível: o não-dito, o pressentido e o imagético. Favorece processos criativos que emergem do subconsciente, trabalho com sonhos e o desenvolvimento da percepção além do óbvio. O caminho aqui exige distinguir intuição genuína de projeção e medo. Quando navegada com discernimento, esta energia oferece acesso a camadas de percepção que a mente racional jamais alcançaria.',
    desafio: 'Evitar ilusões, medos irracionais e confusão entre intuição e fantasia. Nesta vibração, o autoengano é o principal inimigo — e o antídoto é a disposição radical de ver o que é real.',
  },
  19: {
    numero: 19,
    nome: 'O Sol',
    palavraChave: 'Clareza e Alegria',
    descricao: 'O Sol representa a força máxima da consciência, da vitalidade e da alegria — a vibração que ilumina o que estava escondido e celebra o que existe. Como Arcano Regente, indica uma dimensão marcada por clareza, visibilidade e potencial de sucesso genuíno. Favorece realização profissional, expansão pública, alegria de viver e a capacidade de ser uma referência de luz para o entorno. É uma das energias mais favoráveis do campo: quando ativa e não bloqueada, atrai oportunidades com naturalidade. O terreno aqui é fértil para o reconhecimento de quem se mostra com autenticidade.',
    desafio: 'Evitar arrogância, superficialidade e dependência do reconhecimento externo. O Sol que não enxerga sombra nenhuma está cego para metade da realidade — e essa metade eventualmente impõe sua presença.',
  },
  20: {
    numero: 20,
    nome: 'O Julgamento',
    palavraChave: 'Renascimento e Chamado',
    descricao: 'O Julgamento representa o despertar para um chamado maior — o momento em que a alma responde à convocação para um novo nível de existência. Como Arcano Regente, indica que esta dimensão está num ponto de avaliação e transição profunda. Favorece processos de revisão honesta da própria trajetória, abertura a novos começos e a disposição de responder ao que a vida está pedindo. É a vibração da ressurreição: o que estava adormecido pode ser reativado com intenção clara. O campo aqui recompensa quem tem coragem de avaliar sem julgamento severo e recomeçar sem culpa.',
    desafio: 'Evitar autojulgamento severo, resistência ao chamado e medo do renascimento. O maior obstáculo desta vibração é o peso do próprio passado — que, quando não perdoado, bloqueia a convocação para o futuro.',
  },
  21: {
    numero: 21,
    nome: 'O Mundo',
    palavraChave: 'Realização e Integração',
    descricao: 'O Mundo representa a conclusão bem-sucedida de um grande ciclo — a integração completa e a sensação de ter chegado a um ponto de realização genuína. Como Arcano Regente, indica que esta dimensão carrega a possibilidade de completude e reconhecimento de longo prazo. Favorece projetos que chegam ao pleno florescimento, reconhecimento público e a sensação de estar no lugar certo fazendo a coisa certa. É uma das energias mais favoráveis do campo: quando ativa, tende a harmonizar os diferentes aspectos da vida em torno de um centro estável. O terreno aqui convida à celebração do caminho percorrido.',
    desafio: 'Evitar a estagnação após a conquista e a recusa de iniciar novos ciclos. A integração completa não é o fim — é o ponto de partida de uma jornada mais elevada. Permanecer estático aqui desperdiça a energia da conquista.',
  },
  22: {
    numero: 22,
    nome: 'O Louco',
    palavraChave: 'Potencial Infinito',
    descricao: 'O Louco representa o estado de potencial puro — a energia do antes, do ponto zero onde tudo ainda é possível e nada está determinado. Como Arcano Regente (Número Mestre 22), indica que esta dimensão carrega uma tensão entre liberdade total e a necessidade de direcionamento consciente. Favorece saltos de fé, novas direções sem mapa e a disposição de começar do zero sem o peso do passado. É a vibração mais paradoxal do campo: pode ser a maior liberdade ou o maior caos, dependendo de como a energia é canalizada. O caminho aqui pede presença plena — a inconsciência aqui tem custo elevado.',
    desafio: 'Evitar irresponsabilidade, falta de direção e desconsideração das consequências. O potencial infinito sem intenção se dispersa em infinitas direções simultâneas — e chega a lugar nenhum.',
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
