-- Migration 015: Conteúdo inicial das FAQs do Nome Magnético
-- Fonte: NOME_MAGNETICO_INVESTIDOR.md + conhecimento do produto
-- Formato: Markdown (renderizado em runtime via `marked`)

-- ================================================================
-- CATEGORIA: Sobre a Análise
-- ================================================================

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O que é o Nome Magnético?',
$$O **Nome Magnético** é um sistema de análise numerológica cabalística que examina seu nome completo e data de nascimento para revelar padrões energéticos ocultos e bloqueios que podem estar travando áreas da sua vida.

O sistema calcula **5 números principais**, constrói **4 Triângulos Numerológicos** e detecta bloqueios — sequências numéricas repetidas que indicam travamentos em saúde, relacionamentos, carreira ou criatividade.

A partir dessa análise, o Nome Magnético sugere variações do nome que eliminam esses bloqueios, mantendo harmonia com o seu Número de Destino. O resultado é um relatório profundo gerado por IA, disponível também em **PDF premium**.

São 3 produtos: **Nome Social** (transformação pessoal), **Nome Bebê** (escolha do nome do filho) e **Nome Empresa** (branding vibracional).$$,
  1, true, true, 'o-que-e-nome-magnetico'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'Para quem é indicado o Nome Magnético?',
$$O Nome Magnético é ideal para pessoas que buscam autoconhecimento aplicado:

- **Profissionais** que sentem que "travam" na carreira sem razão clara
- **Empreendedores** que percebem que o nome da empresa "não carrega" o negócio
- **Pais** que querem garantir a melhor frequência vibracional para o nome do filho
- **Pessoas em transição de vida** buscando um novo começo alinhado numerologicamente

Não é necessário conhecimento prévio de numerologia. O relatório explica cada cálculo de forma clara e acessível.$$,
  2, true, false, 'para-quem-e-indicado'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O relatório é gerado por IA? É confiável?',
$$Sim, o relatório narrativo é gerado por IA (Claude, da Anthropic), mas com uma diferença essencial: **os cálculos numerológicos são 100% determinísticos e matemáticos**, executados por um motor de cálculo próprio que não usa IA.

O processo ocorre em duas etapas:
1. **Motor de cálculo** processa os dados e calcula os 5 números, os 4 triângulos e detecta bloqueios com precisão matemática — os resultados são verificáveis
2. **IA** recebe os resultados estruturados e cria uma narrativa personalizada de 3.000+ palavras, integrando todos os dados

Isso garante que os números são exatos e verificáveis, enquanto a IA entrega uma interpretação profunda e humanizada.$$,
  3, true, true, 'relatorio-ia-confiavel'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O que está incluído na análise do Nome Social?',
$$A análise do **Nome Social** é a análise completa do seu nome de nascimento. Ela inclui:

- **5 números principais**: Expressão, Destino, Motivação, Missão e Personalidade
- **4 Triângulos Numerológicos**: Vida, Pessoal, Social e Destino — cada um revelando uma dimensão diferente
- **Bloqueios energéticos**: sequências repetidas (111 a 999) com antídotos práticos
- **Lições Kármicas**: números ausentes no nome, indicando qualidades a desenvolver nesta vida
- **Tendências Ocultas**: números em excesso, revelando padrões de desequilíbrio
- **Arquétipo pessoal**: qual identidade mítica (O Herói, O Sábio, O Criador...) o seu número revela
- **Top 3 Nomes Magnéticos**: variações do nome sem bloqueios, rankeadas por score de harmonia
- **Guia de 30 dias**: plano prático para adotar o novo nome progressivamente
- **PDF premium** para download$$,
  4, true, true, 'o-que-inclui-nome-social'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O que é o produto Nome Bebê?',
$$O **Nome Bebê** é para pais que estão escolhendo o nome do filho e querem garantir que ele seja livre de bloqueios e harmonioso com o Destino da criança.

Você informa o **sobrenome da família**, a **data de nascimento do bebê** e uma **lista de nomes candidatos**. O sistema analisa cada candidato e entrega:

- **Ranking por score** de harmonia (0–100), com análise detalhada de cada nome
- **"Nome de Ouro"**: o mais harmonioso, sem bloqueios, alinhado ao Destino do bebê
- **Arquétipo da Criança**: "Que herói esse filho será?" com referências culturais e mitológicas
- **Perfil de temperamento** da criança a partir dos números
- **Guia de criação personalizado**: como educar respeitando a natureza numérica da criança$$,
  5, true, false, 'o-que-e-nome-bebe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O que é o produto Nome Empresa?',
$$O **Nome Empresa** é para empreendedores fundando um negócio ou repensando a marca de uma empresa existente.

Você informa o **nome e data de nascimento do sócio principal**, a **data de fundação** (opcional) e uma **lista de nomes candidatos**. O sistema entrega:

- **Ranking dos candidatos** por score de harmonia vibracional
- **Arquétipo da Marca**: qual persona o mercado percebe? (O Criador como Apple, O Herói como Nike...)
- **Bloqueios de risco**: sequências que podem se manifestar como riscos operacionais ou financeiros
- **Compatibilidade com o Destino do sócio** e com a data de fundação da empresa
- **Orientação estratégica**: tom de voz, paleta e tipografia alinhados numerologicamente$$,
  6, true, false, 'o-que-e-nome-empresa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'O que é o arquétipo na análise?',
$$Os arquétipos são padrões universais identificados pelo psicólogo **Carl Gustav Jung** — personagens recorrentes em mitos, contos e culturas de todos os tempos: o Herói, o Sábio, o Criador, o Guardião, o Rebelde.

O número de Expressão calculado na numerologia cabalística revela naturalmente esse padrão:
- **Número 1** → O Herói: pioneiro, corajoso, orientado à ação
- **Número 7** → O Sábio: analítico, introspectivo, buscador da verdade
- **Número 9** → O Humanista: compassivo, universal, comprometido com algo maior

No relatório você recebe não apenas "seu número é X", mas uma narrativa completa: qual arquétipo você carrega, figuras históricas que representam sua jornada, e como a **sombra** desse arquétipo pode estar criando bloqueios.

Para empresas, o Arquétipo da Marca identifica matematicamente o posicionamento natural do nome no mercado — o mesmo trabalho que consultorias de branding cobram dezenas de milhares de reais para entregar.$$,
  7, true, false, 'o-que-e-arquetipo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'sobre-analise'),
  'Posso baixar a análise em PDF?',
$$Sim. Toda análise inclui um **PDF premium** disponível para download, com identidade visual cuidadosa e personalizado com seu nome e análise completa.

O PDF fica acessível diretamente na página de resultados, no botão **"Baixar PDF"**, durante todo o período de acesso (30 dias).$$,
  8, true, false, 'posso-baixar-pdf'
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- CATEGORIA: Numerologia Cabalística
-- ================================================================

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'O que é a numerologia cabalística?',
$$A numerologia cabalística é um sistema matemático de análise simbólica com raízes na **Cabala judaica**, uma das tradições místicas mais antigas do mundo (mais de 2.000 anos).

Diferentemente da numerologia popular de revistas, a versão cabalística usada no Nome Magnético tem:

- **Regras precisas** de atribuição numérica para cada letra do alfabeto
- **Tratamento de acentos**: cada tipo (agudo, til, grave) modifica o valor da letra de forma específica
- **Lógica piramidal** de redução que revela padrões ocultos nas sequências numéricas

O princípio fundamental é que cada letra carrega uma frequência vibratória. Quando essas frequências se combinam no nome, formam um padrão matemático único que pode revelar bloqueios, potenciais e qualidades da alma.$$,
  1, true, true, 'o-que-e-numerologia-cabalistica'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'O que são os bloqueios numerológicos?',
$$Bloqueios numerológicos são **sequências numéricas repetidas** que aparecem nos Triângulos Numerológicos do seu nome, indicando um padrão de travamento em uma área específica da vida.

Cada sequência tem um significado:

- **111** — Bloqueio de Iniciação: dificuldade de começar, procrastinação
- **222** — Bloqueio de Associação: dificuldade em parcerias e relacionamentos
- **333** — Bloqueio de Expressão: dificuldade de comunicação e criatividade
- **444** — Bloqueio de Estruturação: inércia, dificuldade de organização
- **555** — Bloqueio de Liberdade: resistência a mudanças, aprisionamento
- **666** — Bloqueio de Harmonia: desequilíbrio em família ou finanças
- **777** — Bloqueio de Conexão Espiritual: desconexão do propósito
- **888** — Bloqueio de Poder e Abundância: dificuldade com dinheiro e autoridade
- **999** — Bloqueio de Compaixão Universal: dificuldade de encerrar ciclos

Mudar a forma como você assina o nome altera a equação numerológica e pode dissolver esses padrões.$$,
  2, true, true, 'o-que-sao-bloqueios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'Como funcionam os 4 Triângulos Numerológicos?',
$$O Nome Magnético analisa seu nome através de **4 Triângulos Numerológicos**, cada um revelando uma dimensão diferente:

| Triângulo | O que revela |
|-----------|-------------|
| **Vida** | Aspectos gerais — padrão base do nome |
| **Pessoal** | Vida íntima, reações internas, o "eu" privado |
| **Social** | Influências externas, como o mundo te percebe |
| **Destino** | Resultados práticos, missão, previsões de longo prazo |

Os bloqueios são detectados em todos os 4 triângulos e consolidados na análise. Isso garante uma visão completa — não apenas o padrão superficial, mas as camadas mais profundas do nome.$$,
  3, true, false, 'como-funcionam-triangulos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'Quais são os 5 números principais calculados?',
$$O Nome Magnético calcula **5 números principais** a partir do nome completo e data de nascimento:

1. **Expressão**: calculado a partir de *todas* as letras — revela quem você é na essência
2. **Destino**: calculado a partir dos dígitos da data de nascimento — revela para onde você está indo
3. **Motivação (Alma)**: calculado a partir das *vogais* — revela seus desejos mais profundos
4. **Missão (Impressão)**: calculado a partir das *consoantes* — revela como você age e o que projeta
5. **Personalidade**: calculado a partir do *primeiro nome* apenas — revela sua face social

A harmonia entre Expressão e Destino é um dos critérios centrais para a seleção do Nome Magnético ideal.$$,
  4, true, false, 'quais-sao-5-numeros'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'O que são as Lições Kármicas?',
$$As **Lições Kármicas** são os números de 1 a 8 que estão **ausentes** no seu nome completo.

Na numerologia cabalística, cada número representa uma qualidade. Um número ausente indica uma qualidade não desenvolvida em encarnações anteriores — que a alma veio aprender nesta vida.

Exemplos:
- Ausência do **4**: dificuldade com disciplina, rotina e construção de bases sólidas
- Ausência do **7**: resistência à introspecção e ao desenvolvimento espiritual
- Ausência do **2**: desafios em parceria, diplomacia e sensibilidade

O relatório identifica suas lições kármicas e oferece orientações práticas para trabalhar cada uma delas de forma consciente.$$,
  5, true, false, 'o-que-sao-licoes-karmicas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'numerologia'),
  'O que são as Tendências Ocultas?',
$$As **Tendências Ocultas** são os números que aparecem **4 ou mais vezes** no nome completo, indicando uma energia em excesso.

Enquanto as Lições Kármicas representam ausências, as Tendências Ocultas representam excessos — qualidades superdimensionadas que, sem equilíbrio, tornam-se limitações.

Exemplos:
- Excesso do **1**: tendência ao egocentrismo, dificuldade de delegar
- Excesso do **3**: verbosidade, energia dispersa, superficialidade
- Excesso do **8**: obsessão por resultados materiais, workaholism

O Nome Magnético identifica suas tendências ocultas, explica seus impactos e sugere como o novo nome pode ajudar a equilibrar esses padrões.$$,
  6, true, false, 'o-que-sao-tendencias-ocultas'
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- CATEGORIA: Pagamento e Acesso
-- ================================================================

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'pagamento-acesso'),
  'Quais são os preços de cada produto?',
$$O Nome Magnético oferece **pagamento único** por análise, sem assinatura mensal:

| Produto | Preço | Validade do acesso |
|---------|-------|-------------------|
| **Nome Social** | R$ 97 | 30 dias |
| **Nome Bebê** | R$ 127 | 30 dias |
| **Nome Empresa** | R$ 147 | 30 dias |

O acesso inclui a análise completa, o PDF premium e todos os recursos da plataforma pelo período contratado.$$,
  1, true, true, 'quais-sao-os-precos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'pagamento-acesso'),
  'Por que o pagamento é único e não uma assinatura?',
$$O modelo de pagamento único foi escolhido porque o produto **entrega valor completo e imediato** em uma única análise — não faz sentido cobrar mensalmente por um relatório que você consome uma vez.

O ciclo natural do produto é: analisar → adotar o nome → perceber mudanças → querer reavaliar meses ou anos depois. Por isso, o acesso tem **validade de 30 dias**: tempo suficiente para absorver a análise e implementar as mudanças.

Quando quiser uma nova análise — após adotar o nome, por exemplo, ou para uma ocasião especial — simplesmente adquire um novo acesso.$$,
  2, true, false, 'por-que-pagamento-unico'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'pagamento-acesso'),
  'Por quanto tempo tenho acesso após a compra?',
$$O acesso à plataforma é válido por **30 dias** a partir da data da compra.

Durante esse período você pode:
- Acessar sua análise completa quantas vezes quiser
- Baixar e fazer o re-download do PDF
- Revisar todos os detalhes do relatório

Após os 30 dias o acesso expira. Para novas análises, basta adquirir um novo acesso.$$,
  3, true, false, 'por-quanto-tempo-acesso'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'pagamento-acesso'),
  'Quais formas de pagamento são aceitas?',
$$Os pagamentos são processados com segurança pelo **Stripe**, uma das plataformas de pagamento mais confiáveis do mundo.

Formas de pagamento aceitas:
- **Cartão de crédito** (Visa, Mastercard, American Express)
- **Cartão de débito**
- **Google Pay / Apple Pay** (quando disponível no dispositivo)

Os dados do cartão são processados diretamente pelo Stripe e nunca armazenados em nossos servidores.$$,
  4, true, false, 'formas-de-pagamento'
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- CATEGORIA: Suporte Técnico
-- ================================================================

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'suporte'),
  'Não consigo acessar minha análise. O que fazer?',
$$Se você está com dificuldades de acesso, experimente os seguintes passos:

1. **Verifique o email de cadastro** — certifique-se de estar logando com o mesmo email usado na compra
2. **Redefina sua senha** — acesse a tela de login e clique em "Esqueci minha senha"
3. **Verifique o período de acesso** — o acesso é válido por 30 dias a partir da compra
4. **Limpe o cache do navegador** — ou tente em uma janela anônima
5. **Confirme o email de cadastro** — se é seu primeiro acesso, pode ser necessário confirmar o email recebido

Se o problema persistir, entre em contato pelo chat ou pelo email **suporte@nomemagnetico.com.br**.$$,
  1, true, false, 'nao-consigo-acessar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.faq_items (category_id, question, answer_markdown, order_index, is_active, is_featured, slug)
SELECT
  (SELECT id FROM public.faq_categories WHERE slug = 'suporte'),
  'Como entro em contato com o suporte?',
$$Nossa equipe está disponível por três canais:

- **Chat ao vivo**: clique no ícone de chat no canto inferior direito da tela. Disponível em horário comercial.
- **Formulário de contato**: preencha o formulário nesta página. Resposta em até 24 horas úteis.
- **Email direto**: suporte@nomemagnetico.com.br para questões urgentes.

Se você é cliente com plano ativo, acesse a [Central de Suporte](/app/suporte) para atendimento prioritário.$$,
  2, true, false, 'como-contatar-suporte'
ON CONFLICT (slug) DO NOTHING;
