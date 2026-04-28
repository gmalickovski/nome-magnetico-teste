/**
 * NomeAtualPDF — documento PDF da análise Gratuita (Nome Atual).
 *
 * Estrutura de páginas:
 *   1. Capa
 *   2. Guia de Leitura (intro)
 *   3. Os Números — Destino (card central) + 4 números do nome lado a lado
 *   4. Os 4 Triângulos (explicação — se disponíveis)
 *   5. Karma, Lições e Tendências Ocultas
 *   6+. Análise IA completa (triângulos + diagnóstico)
 *   8. CTA / Oferta para a Harmonização (Nome Social)
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { THEMES, THEME_NOME_ATUAL } from './shared/PDFTheme';
import { PDFCover } from './shared/PDFCover';
import { PDFStandardIntro } from './shared/PDFStandardIntro';
import { PDFPageHeader } from './shared/PDFPageHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFNumbersGrid } from './shared/PDFNumbersGrid';
import { PDFNumbersStar } from './shared/PDFNumbersStar';
import { RenderMarkdownChunks, TrianguloPiramideInline } from './shared/PDFMarkdownRenderer';
import { BloqueiosBlock, DebitosBlock, LicoesBlock, TendenciasBlock } from './shared/PDFKarmicBlock';
import { LOGO_FONT, TITLE_FONT, BODY_FONT, BODY_FONT_BOLD, loadLogoSrc, formatDate } from './shared/PDFFonts';
import { formatAnalysisText } from '../../../utils/textFormatter';
import { getArcano } from '../../../backend/numerology/arcanos';
import type { ProductPDFProps } from './shared/PDFTypes';

const theme = THEME_NOME_ATUAL;

const GOLD = theme.primaryColor;
const GRAY = '#4B5563';
const LIGHT_GRAY = '#E5E7EB';
const DARK = '#131313';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: DARK,
  },
  darkPage: {
    backgroundColor: DARK,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: '#e5e2e1',
  },
  assinaturaPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: DARK,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: TITLE_FONT,
    color: GOLD,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    paddingBottom: 4,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  hugeTitle: {
    fontSize: 18,
    fontFamily: TITLE_FONT,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  fixedText: {
    fontSize: 10,
    fontFamily: BODY_FONT,
    color: GRAY,
    lineHeight: 1.6,
    marginBottom: 16,
    marginTop: 6,
    padding: 0,
    backgroundColor: 'transparent',
    textAlign: 'justify',
  },
  bodyText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  conclusaoCard: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFDF0',
    marginTop: 8,
  },
  // Variações de nome magnético
  variationCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
  },
  variationCardTop: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 6,
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  variationName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  variationScore: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  variationBar: {
    height: 4,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 2,
    marginBottom: 6,
  },
  variationBarFill: {
    height: 4,
    borderRadius: 2,
  },
  variationMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 3,
  },
  variationMetaText: {
    fontSize: 8,
    color: GRAY,
  },
  variationJustificativa: {
    fontSize: 8,
    color: GRAY,
    lineHeight: 1.4,
    marginTop: 3,
  },
  // Assinatura
  assinaturaTitle: {
    fontSize: 18,
    fontFamily: TITLE_FONT,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  assinaturaNome: {
    fontSize: 22,
    fontFamily: TITLE_FONT,
    color: DARK,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  assinaturaInstrucoesBox: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginBottom: 20,
  },
  assinaturaInstrucoesTitle: {
    fontSize: 9,
    fontFamily: BODY_FONT_BOLD,
    color: GOLD,
    marginBottom: 6,
  },
  assinaturaInstrucaoItem: {
    fontSize: 8,
    fontFamily: BODY_FONT,
    color: GRAY,
    lineHeight: 1.6,
    marginBottom: 3,
  },
  assinaturaLinha: {
    height: 0.5,
    backgroundColor: '#C5C5C5',
    marginBottom: 32,
  },
});

/** Extrai estritamente o bloco de Conclusão Final do texto */
function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:\d+\.\s*conclus|\d+\.\s*o nome como|conclus[aã]o)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

function scoreColor(score: number): string {
  return score >= 70 ? '#059669' : score >= 40 ? '#D97706' : '#DC2626';
}

function compatColor(c: string): string {
  return c === 'total' ? '#059669' : c === 'complementar' ? '#7c3aed' : c === 'aceitavel' ? '#D97706' : '#DC2626';
}

function compatLabel(c: string): string {
  return c === 'total' ? 'Total' : c === 'complementar' ? 'Complementar' : c === 'aceitavel' ? 'Aceitável' : 'Incompatível';
}

export function NomeAtualPDF({ analysis, magneticNames, userName }: ProductPDFProps) {
  const logoSrc = loadLogoSrc();
  const freqData = analysis.frequencias_numeros as any;
  // Para o novo fluxo, exibir o nome social escolhido (não o nome de nascimento)
  const nomeParaExibir = freqData?.ranking?.melhorNome?.nomeCompleto ?? analysis.nome_completo;
  const nomeNascimento = analysis.nome_completo;
  const dataNascimento = formatDate(
    freqData?.ranking?.dataNascimento ?? analysis.data_nascimento
  );
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);

  const letrasNome = nomeParaExibir
    .replace(/\s+/g, '')
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '')
    .toUpperCase()
    .split('');

  const melhorNome = freqData?.ranking?.melhorNome;
  const nomesCandidatos: any[] = freqData?.ranking?.nomesCandidatos ?? [];

  const nums = [
    { label: 'Expressão', sublabel: 'O Dom', value: analysis.numero_expressao, icon: '✦' },
    { label: 'Destino', sublabel: 'A Estrada (imutável)', value: analysis.numero_destino, icon: '◈' },
    { label: 'Motivação', sublabel: 'A Alma', value: analysis.numero_motivacao, icon: '♡' },
    { label: 'Impressão', sublabel: 'As Consoantes', value: analysis.numero_impressao, icon: '◎' },
    { label: 'Missão', sublabel: 'A Vocação', value: analysis.numero_missao, icon: '◇' },
  ];

  const bloqueios = Array.isArray(analysis.bloqueios) ? analysis.bloqueios : [];
  const debitos = Array.isArray(analysis.debitos_carmicos) ? analysis.debitos_carmicos : [];
  const licoes = Array.isArray(analysis.licoes_carmicas) ? analysis.licoes_carmicas : [];
  const tendencias = Array.isArray(analysis.tendencias_ocultas) ? analysis.tendencias_ocultas : [];

  const rawScore = (analysis as any).score as number | null | undefined;
  type ScoreNivel = 'baixo' | 'aceitavel' | 'excelente' | null;
  const scoreNivel: ScoreNivel =
    rawScore == null ? null
      : rawScore >= 80 ? 'excelente'
        : rawScore >= 50 ? 'aceitavel'
          : 'baixo';
  const frequencias: Record<string, number> | null =
    freqData?.frequencias ?? (freqData && !freqData?.ranking ? freqData : null);

  const tVida = analysis.triangulo_vida ?? null;
  const tPessoal = analysis.triangulo_pessoal ?? null;
  const tSocial = analysis.triangulo_social ?? null;
  const tDestino = analysis.triangulo_destino ?? null;

  const TRIANGLE_FULL_WIDTH = 430;
  const baseLen = Math.max(
    tVida?.linhas[0]?.length ?? 1,
    tPessoal?.linhas[0]?.length ?? 1,
    tSocial?.linhas[0]?.length ?? 1,
    tDestino?.linhas[0]?.length ?? 1,
  );
  const triCellSize = Math.min(18, Math.max(5, Math.floor(TRIANGLE_FULL_WIDTH / baseLen) - 1));
  let analiseFormatado = analysis.analise_texto
    ? formatAnalysisText(analysis.analise_texto)
    : null;
  if (analiseFormatado) {
    analiseFormatado = analiseFormatado.replace(/^#{1,2}\s+[^\n]*\n+/, '');
    analiseFormatado = analiseFormatado.replace(/#{1,6}\s+[^\n]*Manual de Assinatura[^\n]*\n[\s\S]*?(?=#{1,6}\s|\s*$)/i, '');
  }
  const conclusaoTexto = analiseFormatado ? extractConclusao(analiseFormatado) : null;

  return (
    <Document title={`Nome Magnetico — ${nomeParaExibir}`} author="Nome Magnetico">

      {/* ── PÁGINA 1: CAPA ────────────────────────────────────────────────── */}
      <PDFCover
        theme={theme}
        nomeParaExibir={nomeParaExibir}
        dataNascimento={dataNascimento}
        dataGeracao={dataGeracao}
        logoSrc={logoSrc}
        logoFont={LOGO_FONT}
        titleFont={TITLE_FONT}
      />

      {/* ── PÁGINA INTRODUTÓRIA: GUIA DE LEITURA ────────────────────────── */}
      <PDFStandardIntro theme={theme} productType="nome_social" entityName={nomeParaExibir} isFreeAnalysis={true} />

      {/* Rankeamento removido do relatório atual */}

      {/* ── PÁGINA 3: A SUA ESSÊNCIA ─────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — A Essência dos Seus Números`} />

        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <Text style={styles.hugeTitle}>A Sua Essência</Text>
        </View>

        {/* Card do Destino centralizado */}
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View style={{ borderWidth: 2, borderColor: '#6d28d9', borderRadius: 12, padding: 20, backgroundColor: '#F5F3FF', alignItems: 'center', width: 180 }}>
            <Text style={{ fontSize: 9, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{'◈  Número de Destino'}</Text>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 52, color: '#5b21b6', lineHeight: 1 }}>{analysis.numero_destino ?? '?'}</Text>
            <Text style={{ fontSize: 9, color: '#7c3aed', marginTop: 6 }}>A Estrada da Sua Alma</Text>
          </View>
        </View>

        {/* Parágrafo 1 — sobre a imutabilidade do Destino */}
        <View style={{ borderRadius: 8, backgroundColor: '#F5F3FF', padding: 14, marginBottom: 14 }}>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#5b21b6', marginBottom: 8 }}>O Que Não Pode Ser Mudado — e o Que Pode</Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65 }}>
            O seu Número de Destino é o seu projeto original — calculado a partir da data em que você nasceu, ele representa a trilha que a sua alma escolheu antes mesmo de você receber um nome. Ele não pode ser alterado por nenhuma prática, ritual ou mudança de nome, pois está gravado no tecido do tempo desde o seu primeiro respiro. É a sua Estrada: não te define, mas te ilumina. Não importa o caminho que você escolha — o Destino será sempre o horizonte para o qual a sua bússola interior aponta.
          </Text>
        </View>

        {/* 4 numbers do nome — cards menores lado a lado */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {nums.filter(n => n.label !== 'Destino').map((num, i) => {
            // @react-pdf não suporta rgba() em borderColor — usar hex sólido
            const palettes = [
              { color: '#9A6B00', border: '#C89000', bg: '#FFFBF0' }, // Ouro — Expressão
              { color: '#6d28d9', border: '#7C3AED', bg: '#F5F3FF' }, // Roxo — Motivação
              { color: '#0369a1', border: '#0284C7', bg: '#F0F9FF' }, // Azul-teal — Impressão
              { color: '#15803d', border: '#16A34A', bg: '#F0FDF4' }, // Verde — Missão
            ];
            const p = palettes[i % palettes.length];
            return (
              <View key={i} style={{ flex: 1, borderWidth: 1.5, borderColor: p.border, borderRadius: 8, padding: 10, alignItems: 'center', backgroundColor: p.bg }}>
                <Text style={{ fontSize: 7, fontFamily: BODY_FONT_BOLD, color: p.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{num.label}</Text>
                <Text style={{ fontFamily: TITLE_FONT, fontSize: 28, color: p.color, lineHeight: 1 }}>{num.value ?? '?'}</Text>
                <Text style={{ fontSize: 7, color: p.color, textAlign: 'center', marginTop: 4 }}>{num.sublabel}</Text>
              </View>
            );
          })}
        </View>

        {/* Parágrafo 2 — sobre os 4 números mutáveis */}
        <View style={{ borderRadius: 8, backgroundColor: 'rgba(212,175,55,0.06)', padding: 14, marginBottom: 14 }}>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#8A5C00', marginBottom: 8 }}>Os Números do Nome — O Veículo</Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65 }}>
            Os outros quatro números — Expressão, Motivação, Impressão e Missão — emergem das letras do seu nome de batismo. Diferente do Destino, esses números respondem à vibração das letras que você usa. Quando o arranjo do nome muda, esses campos se reorganizam — podendo criar ou desfazer bloqueios, abrir ou fechar caminhos. Você não precisa mudar quem você é. Apenas o veículo através do qual a sua essência se expressa no mundo.
          </Text>
        </View>

        {/* Os Seus Números — explicação individual de cada número */}
        <View>
          <Text style={[styles.sectionTitle, { color: GOLD, borderBottomColor: GOLD, fontSize: 13, marginBottom: 10 }]}>
            Os Seus Números
          </Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 12 }}>
            O mapa numerológico não é uma abstração — é um diagnóstico preciso da frequência que o seu nome emite 24 horas por dia. Cada número representa uma camada distinta dessa frequência: uns são imutáveis, inscritos no momento do nascimento; outros respondem às letras do nome e podem ser ajustados. Compreender cada um separadamente é o primeiro passo para entender por que certas áreas da vida fluem e outras travam.
          </Text>

          {/* Destino */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, backgroundColor: '#F5F3FF', borderRadius: 6, padding: 10 }}>
            <View style={{ width: 32, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 20, color: '#5b21b6', lineHeight: 1 }}>{analysis.numero_destino ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: BODY_FONT_BOLD, color: '#5b21b6', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Destino — A Estrada da Alma</Text>
              <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
                Derivado da data de nascimento, é o único número que não muda — independente de como você assina. Representa a grande trilha escolhida antes desta encarnação: os temas recorrentes, os aprendizados que retornam e o fio condutor que atravessa todas as fases da vida. Quando o nome está em harmonia com o Destino, a jornada flui. Quando está em conflito, a resistência se manifesta como ciclos repetitivos.
              </Text>
            </View>
          </View>

          {/* Expressão */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, backgroundColor: '#FFFBF0', borderRadius: 6, padding: 10 }}>
            <View style={{ width: 32, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 20, color: '#9A6B00', lineHeight: 1 }}>{analysis.numero_expressao ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: BODY_FONT_BOLD, color: '#9A6B00', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Expressão — O Dom Natural</Text>
              <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
                Resultante da soma vibratória de todas as letras do nome de batismo, revela o potencial nato — aquilo que você veio equipado para fazer bem, naturalmente. Os talentos que surgem sem esforço, a forma como você se projeta e a qualidade que as pessoas percebem em você antes mesmo de falar. É o dom de fábrica do nome.
              </Text>
            </View>
          </View>

          {/* Motivação */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, backgroundColor: '#F0F9FF', borderRadius: 6, padding: 10 }}>
            <View style={{ width: 32, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 20, color: '#0369a1', lineHeight: 1 }}>{analysis.numero_motivacao ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: BODY_FONT_BOLD, color: '#0369a1', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Motivação — A Alma do Nome</Text>
              <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
                As vogais carregam o sopro da alma — e é por isso que a Motivação revela o motor mais profundo por trás das escolhas. Não o que você faz, mas o que te move para fazer. O desejo que existe antes da decisão consciente. Quando o nome cria conflito com a Motivação, há uma sensação crônica de viver para fora: fazendo, mas sem sentir que é para si.
              </Text>
            </View>
          </View>

          {/* Impressão */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, backgroundColor: '#F0FDF4', borderRadius: 6, padding: 10 }}>
            <View style={{ width: 32, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 20, color: '#15803d', lineHeight: 1 }}>{analysis.numero_impressao ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: BODY_FONT_BOLD, color: '#15803d', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Impressão — A Máscara Social</Text>
              <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
                As consoantes são o esqueleto visível do nome — a estrutura que o mundo percebe antes de qualquer palavra ser dita. A Impressão é a frequência que os outros captam antes de te conhecerem de verdade: ela molda reputações, primeiras impressões e expectativas. Um número de Impressão desfavorável pode fazer com que as pessoas leiam incorretamente quem você é — criando resistência onde deveria haver abertura.
              </Text>
            </View>
          </View>

          {/* Missão */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDF4FF', borderRadius: 6, padding: 10 }}>
            <View style={{ width: 32, alignItems: 'center', marginRight: 10 }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 20, color: '#7C3AED', lineHeight: 1 }}>{analysis.numero_missao ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: BODY_FONT_BOLD, color: '#7C3AED', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Missão — A Vocação de Vida</Text>
              <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>
                Calculada pelo primeiro nome, a Missão aponta o campo onde os seus dons encontram maior ressonância com o mundo — a área em que o exercício de quem você é naturalmente se converte em contribuição. Quando alinhada com a Expressão e o Destino, gera propósito inevitável. Quando bloqueada, gera dispersão: muito esforço, pouco significado.
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter />
      </Page>

      {/* ── BLOCO: OS 4 TRIÂNGULOS ─────────────────────────────────────────── */}
      {(tVida || tPessoal || tSocial || tDestino) && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Os 4 Triângulos Numerológicos`} />

          <View style={{ marginTop: 20, marginBottom: 14 }}>
            <Text style={styles.hugeTitle}>O que os 4 Triângulos Dizem Sobre Você</Text>
          </View>

          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 14 }}>
            Na Numerologia Cabalística, cada letra do nome tem um valor vibracional preciso — e esses valores interagem entre si de formas que não são aleatórias. Para revelar como essa interação opera, o nome é analisado sob quatro perspectivas distintas, chamadas Pirâmides de Fluxo. Cada pirâmide usa um modificador diferente sobre as mesmas letras, revelando uma dimensão específica da sua jornada. O resultado é um mapa de quatro camadas que mostra exatamente onde a frequência do nome está fluindo — e onde está travada.
          </Text>

          {/* O Que São os Arcanos */}
          <View style={{ borderRadius: 8, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED', padding: 12, marginBottom: 10 }}>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#7C3AED', marginBottom: 6 }}>O Que São os Arcanos</Text>
            <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65 }}>
              A Numerologia Cabalística trabalha com 22 Arcanos — arquétipos de energia que representam forças universais. Em cada pirâmide, o número que emerge no vértice superior é o Arcano Regente: a força dominante que governa aquela dimensão da vida. Não é previsão nem misticismo — é a identificação matemática do padrão que já opera por trás dos eventos daquela área, queira você ou não.
            </Text>
          </View>

          {/* O Que São os Bloqueios */}
          <View style={{ borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', padding: 12, marginBottom: 8 }}>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#DC2626', marginBottom: 6 }}>O Que São os Bloqueios Energéticos</Text>
            <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65 }}>
              Dentro de cada pirâmide, quando um mesmo número aparece três ou mais vezes consecutivas, forma-se um Bloqueio. Na prática: a frequência do nome está emitindo o mesmo padrão em loop naquela dimensão — como um curto-circuito que nunca se resolve. O bloqueio opera independente de esforço, terapia ou força de vontade. Ele é uma propriedade matemática do nome. Nas pirâmides abaixo, as células vermelhas indicam exatamente onde um bloqueio está ativo.
            </Text>
          </View>

          {/* ─── TRIÂNGULO DA VIDA ───────────────────────────────────────────── */}
          {tVida && (
            <View>
              <Text style={[styles.sectionTitle, { color: '#C89000', borderBottomColor: '#C89000', fontSize: 13, marginBottom: 8, marginTop: 24 }]}>
                O Triângulo da Vida
              </Text>
              <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 10 }}>
                A estrutura mais fundamental do mapa. Calculado a partir do valor puro de cada letra — sem modificador externo — revela os padrões que atravessam toda a existência: temas que retornam em diferentes fases, independente das circunstâncias. Governa a saúde do corpo, a vitalidade e a relação com a prosperidade material. Bloqueios aqui criam ciclos crônicos de desgaste físico, instabilidade financeira e a sensação de que conquistas não se sustentam — algo sempre escapa, mesmo quando tudo parece ir bem.
              </Text>
              <TrianguloPiramideInline data={tVida} label="TRIÂNGULO DA VIDA" cellSize={triCellSize} letras={letrasNome} />
              {tVida.arcanoRegente != null && (() => {
                const arc = getArcano(tVida.arcanoRegente!);
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.sectionTitle, { color: '#7C3AED', borderBottomColor: '#7C3AED', fontSize: 11, marginBottom: 8 }]}>
                      Arcano Regente da Vida — {arc.numero}: {arc.nome}
                    </Text>
                    <View wrap={false} style={{ borderRadius: 8, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED', padding: 14 }}>
                      <View style={{ backgroundColor: '#EDE9FE', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#4C1D95', fontFamily: BODY_FONT_BOLD, textAlign: 'center' }}>{arc.palavraChave}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Vibração Dominante</Text>
                      <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>{arc.descricao}</Text>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Desafio a Integrar</Text>
                      <Text style={{ fontSize: 9, color: '#5B21B6', lineHeight: 1.65, fontStyle: 'italic' }}>{arc.desafio}</Text>
                    </View>
                  </View>
                );
              })()}
              {bloqueios.filter((b: any) => b.triangulos?.includes('vida')).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626', fontSize: 11, marginBottom: 8 }]}>
                    Bloqueios do Triângulo da Vida
                  </Text>
                  <BloqueiosBlock bloqueios={bloqueios.filter((b: any) => b.triangulos?.includes('vida'))} showAntidoto={false} />
                </View>
              )}
            </View>
          )}

          {/* ─── TRIÂNGULO PESSOAL ───────────────────────────────────────────── */}
          {tPessoal && (
            <View>
              <Text style={[styles.sectionTitle, { color: '#7C3AED', borderBottomColor: '#7C3AED', fontSize: 13, marginBottom: 8, marginTop: 24 }]}>
                O Triângulo Pessoal
              </Text>
              <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 10 }}>
                Modificado pelo número do dia de nascimento, acessa a dimensão mais interna da vida: a forma como você processa emoções, responde à pressão e se relaciona com as pessoas mais próximas. É o padrão afetivo que opera por baixo da superfície — os mecanismos automáticos que aparecem em momentos de conflito, vulnerabilidade ou intimidade. Bloqueios aqui costumam se manifestar como relacionamentos que seguem o mesmo roteiro, reações que você não consegue controlar e dificuldade persistente de manter conexões profundas.
              </Text>
              <TrianguloPiramideInline data={tPessoal} label="TRIÂNGULO PESSOAL" cellSize={triCellSize} letras={letrasNome} />
              {tPessoal.arcanoRegente != null && (() => {
                const arc = getArcano(tPessoal.arcanoRegente!);
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.sectionTitle, { color: '#7C3AED', borderBottomColor: '#7C3AED', fontSize: 11, marginBottom: 8 }]}>
                      Arcano Regente Pessoal — {arc.numero}: {arc.nome}
                    </Text>
                    <View wrap={false} style={{ borderRadius: 8, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED', padding: 14 }}>
                      <View style={{ backgroundColor: '#EDE9FE', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#4C1D95', fontFamily: BODY_FONT_BOLD, textAlign: 'center' }}>{arc.palavraChave}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Vibração Dominante</Text>
                      <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>{arc.descricao}</Text>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Desafio a Integrar</Text>
                      <Text style={{ fontSize: 9, color: '#5B21B6', lineHeight: 1.65, fontStyle: 'italic' }}>{arc.desafio}</Text>
                    </View>
                  </View>
                );
              })()}
              {bloqueios.filter((b: any) => b.triangulos?.includes('pessoal')).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626', fontSize: 11, marginBottom: 8 }]}>
                    Bloqueios do Triângulo Pessoal
                  </Text>
                  <BloqueiosBlock bloqueios={bloqueios.filter((b: any) => b.triangulos?.includes('pessoal'))} showAntidoto={false} />
                </View>
              )}
            </View>
          )}

          {/* ─── TRIÂNGULO SOCIAL ────────────────────────────────────────────── */}
          {tSocial && (
            <View>
              <Text style={[styles.sectionTitle, { color: '#059669', borderBottomColor: '#059669', fontSize: 13, marginBottom: 8, marginTop: 24 }]}>
                O Triângulo Social
              </Text>
              <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 10 }}>
                Modificado pelo número do mês de nascimento, revela como o campo externo responde ao seu nome — o magnetismo que ele gera e as oportunidades que atrai ou repele. Governa a visibilidade pública, o reconhecimento profissional e a facilidade com que as pessoas certas chegam até você. Bloqueios aqui são particularmente silenciosos: você se esforça, entrega resultado — mas o mundo não vê. O reconhecimento não chega. As portas abrem devagar, ou não abrem.
              </Text>
              <TrianguloPiramideInline data={tSocial} label="TRIÂNGULO SOCIAL" cellSize={triCellSize} letras={letrasNome} />
              {tSocial.arcanoRegente != null && (() => {
                const arc = getArcano(tSocial.arcanoRegente!);
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.sectionTitle, { color: '#7C3AED', borderBottomColor: '#7C3AED', fontSize: 11, marginBottom: 8 }]}>
                      Arcano Regente Social — {arc.numero}: {arc.nome}
                    </Text>
                    <View wrap={false} style={{ borderRadius: 8, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED', padding: 14 }}>
                      <View style={{ backgroundColor: '#EDE9FE', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#4C1D95', fontFamily: BODY_FONT_BOLD, textAlign: 'center' }}>{arc.palavraChave}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Vibração Dominante</Text>
                      <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>{arc.descricao}</Text>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Desafio a Integrar</Text>
                      <Text style={{ fontSize: 9, color: '#5B21B6', lineHeight: 1.65, fontStyle: 'italic' }}>{arc.desafio}</Text>
                    </View>
                  </View>
                );
              })()}
              {bloqueios.filter((b: any) => b.triangulos?.includes('social')).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626', fontSize: 11, marginBottom: 8 }]}>
                    Bloqueios do Triângulo Social
                  </Text>
                  <BloqueiosBlock bloqueios={bloqueios.filter((b: any) => b.triangulos?.includes('social'))} showAntidoto={false} />
                </View>
              )}
            </View>
          )}

          {/* ─── TRIÂNGULO DO DESTINO ────────────────────────────────────────── */}
          {tDestino && (
            <View>
              <Text style={[styles.sectionTitle, { color: '#D97706', borderBottomColor: '#D97706', fontSize: 13, marginBottom: 8, marginTop: 24 }]}>
                O Triângulo do Destino
              </Text>
              <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 10 }}>
                O mais revelador dos quatro. Combina o valor de cada letra com a soma do dia e mês de nascimento — integrando as dimensões pessoal e social em uma única estrutura. Mapeia os resultados que tendem a se materializar: a missão concreta, os frutos do esforço e o legado que a frequência do nome constrói com o tempo. Bloqueios aqui criam o padrão mais desgastante: plantar sem colher — ciclos em que o trabalho existe, o esforço existe, mas a prosperidade duradoura não se instala.
              </Text>
              <TrianguloPiramideInline data={tDestino} label="TRIÂNGULO DO DESTINO" cellSize={triCellSize} letras={letrasNome} />
              {tDestino.arcanoRegente != null && (() => {
                const arc = getArcano(tDestino.arcanoRegente!);
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.sectionTitle, { color: '#7C3AED', borderBottomColor: '#7C3AED', fontSize: 11, marginBottom: 8 }]}>
                      Arcano Regente do Destino — {arc.numero}: {arc.nome}
                    </Text>
                    <View wrap={false} style={{ borderRadius: 8, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED', padding: 14 }}>
                      <View style={{ backgroundColor: '#EDE9FE', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#4C1D95', fontFamily: BODY_FONT_BOLD, textAlign: 'center' }}>{arc.palavraChave}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Vibração Dominante</Text>
                      <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>{arc.descricao}</Text>
                      <Text style={{ fontSize: 8, color: '#7C3AED', fontFamily: BODY_FONT_BOLD, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Desafio a Integrar</Text>
                      <Text style={{ fontSize: 9, color: '#5B21B6', lineHeight: 1.65, fontStyle: 'italic' }}>{arc.desafio}</Text>
                    </View>
                  </View>
                );
              })()}
              {bloqueios.filter((b: any) => b.triangulos?.includes('destino')).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626', fontSize: 11, marginBottom: 8 }]}>
                    Bloqueios do Triângulo do Destino
                  </Text>
                  <BloqueiosBlock bloqueios={bloqueios.filter((b: any) => b.triangulos?.includes('destino'))} showAntidoto={false} />
                </View>
              )}
            </View>
          )}

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA 4/5: KARMA E TENDÊNCIAS ─────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — O Peso do Passado`} />

        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={styles.hugeTitle}>O Peso do Passado (Karma e Tendências)</Text>
        </View>

        <View style={{ ...styles.section, marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { color: '#D97706', borderBottomColor: '#D97706', fontSize: 13 }]}>
            Débitos Kármicos
          </Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>
            Os Débitos Kármicos são padrões energéticos não resolvidos que atravessam encarnações — frequências que não foram integradas em vidas anteriores e que continuam ativas no campo vibracional do nome atual. Eles se manifestam como ciclos repetitivos de traição, perda inexplicável, esforço redobrado sem colheita proporcional ou bloqueios que surgem exatamente onde você mais quer prosperar. Não se trata de punição: é uma conta aberta que o campo energético continua cobrando, silenciosamente, até que a lição seja reconhecida e assimilada de forma consciente.
          </Text>
          <DebitosBlock debitos={debitos} showSolution={false} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#0369a1', borderBottomColor: '#0369a1', fontSize: 13 }]}>
            Lições Kármicas
          </Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>
            As Lições Kármicas revelam os números completamente ausentes no seu nome de batismo — vibrações que nunca foram exercitadas ao longo de encarnações anteriores e que a alma ainda precisa desenvolver. Cada número ausente representa uma qualidade que precisa ser construída do zero nesta vida, sem o suporte da memória energética de vidas passadas. Diferente dos Débitos, as lições não geram dor diretamente — elas criam pontos cegos crônicos: áreas onde o esforço parece desproporcional ao resultado, onde você sente que lhe falta algo que os outros parecem dominar com naturalidade.
          </Text>
          <LicoesBlock licoes={licoes} showSolution={false} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#6d28d9', borderBottomColor: '#6d28d9', fontSize: 13 }]}>
            Tendências Ocultas
          </Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, marginBottom: 10 }}>
            As Tendências Ocultas emergem quando um número aparece quatro vezes ou mais no seu nome de batismo — uma frequência tão intensa que começa a dominar o comportamento de forma automática e muitas vezes imperceptível. Em doses equilibradas, essa vibração seria um talento inato. Em excesso, ela se converte em compulsão: o padrão se repete independente da vontade, criando ciclos que sabotam exatamente as áreas onde você mais deseja prosperar. O que deveria ser força vira obstáculo — e a origem está na arquitetura do nome, não no caráter da pessoa.
          </Text>
          <TendenciasBlock tendencias={tendencias} frequencias={frequencias} showSolution={false} />
        </View>

        {/* Diagnóstico Consolidado */}
        {(bloqueios.length > 0 || debitos.length > 0 || licoes.length > 0 || tendencias.length > 0) && (
          <View style={{ backgroundColor: 'rgba(220,38,38,0.06)', borderWidth: 1.5, borderColor: '#C53030', borderRadius: 8, padding: 16, marginTop: 10 }} wrap={false}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#C53030', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Diagnóstico Consolidado — Frequências Ativas no Seu Nome
            </Text>
            {bloqueios.length > 0 && (
              <View style={{ backgroundColor: 'rgba(220,38,38,0.08)', borderRadius: 4, padding: 7, marginBottom: 5 }}>
                <Text style={{ fontSize: 10, color: '#7F1D1D', fontFamily: 'Helvetica-Bold' }}>
                  {bloqueios.length} bloqueio{bloqueios.length > 1 ? 's' : ''} energético{bloqueios.length > 1 ? 's' : ''} — frequências de travamento ativas 24h/dia
                </Text>
              </View>
            )}
            {debitos.length > 0 && (
              <View style={{ backgroundColor: 'rgba(180,83,9,0.07)', borderRadius: 4, padding: 7, marginBottom: 5 }}>
                <Text style={{ fontSize: 10, color: '#92400E', fontFamily: 'Helvetica-Bold' }}>
                  {debitos.length} débito{debitos.length > 1 ? 's' : ''} kármico{debitos.length > 1 ? 's' : ''} — padrões de encarnações passadas ainda ativos
                </Text>
              </View>
            )}
            {licoes.length > 0 && (
              <View style={{ backgroundColor: 'rgba(3,105,161,0.07)', borderRadius: 4, padding: 7, marginBottom: 5 }}>
                <Text style={{ fontSize: 10, color: '#1E3A5F', fontFamily: 'Helvetica-Bold' }}>
                  {licoes.length} lição{licoes.length > 1 ? 'ões' : ''} kármica{licoes.length > 1 ? 's' : ''} — vibrações ausentes criando lacunas crônicas
                </Text>
              </View>
            )}
            {tendencias.length > 0 && (
              <View style={{ backgroundColor: 'rgba(109,40,217,0.07)', borderRadius: 4, padding: 7, marginBottom: 5 }}>
                <Text style={{ fontSize: 10, color: '#4C1D95', fontFamily: 'Helvetica-Bold' }}>
                  {tendencias.length} tendência{tendencias.length > 1 ? 's' : ''} oculta{tendencias.length > 1 ? 's' : ''} — excessos que geram ciclos repetitivos
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 9, color: '#7F1D1D', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
              Nenhum desses padrões pode ser neutralizado por esforço ou força de vontade. A origem está na frequência emitida pelo nome.
            </Text>
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* ── DIAGNÓSTICO DO NOME removido do relatório gratuito ──────────── */}

      {/* ── PÁGINA: CONCLUSÃO (FUNDO ESCURO) ─────────────────────────────── */}
      {conclusaoTexto && conclusaoTexto.length > 50 && (
        <Page size="A4" style={styles.darkPage}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — O Encerramento`} />
          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <Text style={styles.hugeTitle}>O Diagnóstico É Claro</Text>
          </View>
          <View style={styles.section}>
            <RenderMarkdownChunks
              text={conclusaoTexto.replace(/^#+\s*[^\n]*\n*/gm, '').trim()}
              styles={{ ...styles, bodyText: { ...styles.bodyText, color: '#e5e2e1' } }}
              GOLD={GOLD}
            />
          </View>
          <PDFFooter />
        </Page>
      )}

      {/* A seção de Variações Numerológicas foi removida do PDF (só aparece no HTML) */}

      {/* ── PÁGINA FINAL: CTA — DIAGNÓSTICO CLARO (FUNDO ESCURO) ───────────── */}
      <Page size="A4" style={styles.darkPage}>
        <View style={{ marginTop: 24, marginBottom: 20 }}>
          <Text style={[styles.hugeTitle, {
            color: scoreNivel === 'excelente' ? GOLD
              : scoreNivel === 'aceitavel' ? '#F59E0B'
                : bloqueios.length > 0 ? '#EF4444'
                  : GOLD
          }]}>
            {scoreNivel === 'excelente'
              ? 'Sua Frequência Tem Base Sólida — Mas Há Refinamentos'
              : scoreNivel === 'aceitavel'
                ? 'O Diagnóstico Revelou: Seu Nome Pode Trabalhar Mais Por Você'
                : bloqueios.length > 0
                  ? 'O Diagnóstico É Claro — E o Nome Continua Emitindo'
                  : 'Sua Frequência Pode Ser Ainda Mais Poderosa'}
          </Text>
          {rawScore != null && rawScore > 0 && (
            <Text style={{ fontSize: 10, color: scoreNivel === 'excelente' ? '#10B981' : scoreNivel === 'aceitavel' ? '#F59E0B' : '#EF4444', textAlign: 'center', marginTop: 6 }}>
              Saúde Vibracional Atual: {rawScore}/100
            </Text>
          )}
        </View>

        {/* Box diagnóstico — varia por nível */}
        {scoreNivel === 'excelente' ? (
          <View style={{ backgroundColor: 'rgba(212,175,55,0.10)', borderWidth: 1, borderColor: GOLD, borderRadius: 8, padding: 14, marginBottom: 16 }} wrap={false}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: GOLD, textAlign: 'center', marginBottom: 6 }}>
              Vibração acima da média — refinamentos identificados
            </Text>
            <Text style={{ fontSize: 10, color: '#e5e2e1', textAlign: 'center', lineHeight: 1.5 }}>
              Mesmo com uma frequência favorável, a análise detectou padrões que ainda podem ser ajustados.{'\n'}
              A harmonização remove os últimos pontos de resistência — tornando o campo vibracional completo.
            </Text>
          </View>
        ) : scoreNivel === 'aceitavel' ? (
          <View style={{ backgroundColor: 'rgba(245,158,11,0.10)', borderWidth: 1, borderColor: '#F59E0B', borderRadius: 8, padding: 14, marginBottom: 16 }} wrap={false}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#F59E0B', textAlign: 'center', marginBottom: 6 }}>
              {bloqueios.length > 0
                ? `${bloqueios.length} bloqueio${bloqueios.length > 1 ? 's' : ''} ativo${bloqueios.length > 1 ? 's' : ''} limitando seu potencial`
                : 'Padrões que ainda limitam seus resultados'}
            </Text>
            <Text style={{ fontSize: 10, color: '#FDE68A', textAlign: 'center', lineHeight: 1.5 }}>
              Seu nome opera em frequência parcialmente alinhada — mas aceitável não é o máximo que ele pode entregar.{'\n'}
              Esses padrões continuam agindo enquanto o nome não for harmonizado.
            </Text>
          </View>
        ) : bloqueios.length > 0 ? (
          <View style={{ backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: '#EF4444', borderRadius: 8, padding: 14, marginBottom: 16 }} wrap={false}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#EF4444', textAlign: 'center', marginBottom: 6 }}>
              {bloqueios.length} bloqueio{bloqueios.length > 1 ? 's' : ''} energético{bloqueios.length > 1 ? 's' : ''} detectado{bloqueios.length > 1 ? 's' : ''} no seu nome
            </Text>
            <Text style={{ fontSize: 10, color: '#FCA5A5', textAlign: 'center', lineHeight: 1.5 }}>
              Essas frequências são emitidas 24 horas por dia, 7 dias por semana — enquanto você dorme, trabalha, descansa.{'\n'}
              Comportamento e força de vontade não mudam o que está codificado no nome.
            </Text>
          </View>
        ) : null}

        {/* Box o que a harmonização faz */}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: GOLD, borderRadius: 8, padding: 14, marginBottom: 16 }} wrap={false}>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 12, color: GOLD, marginBottom: 10, textAlign: 'center' }}>
            O Que a Harmonização Faz pelo Seu Nome
          </Text>
          <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.6, marginBottom: 6 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>1. Elimina os bloqueios dos 4 triângulos</Text> — calcula variações do nome que não formam sequências de travamento em nenhum dos triângulos.
          </Text>
          <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.6, marginBottom: 6 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>2. Alinha Expressão com Destino</Text> — encontra a combinação que faz o nome vibrar em harmonia com o propósito de vida.
          </Text>
          <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.6 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>3. Reequilibra o campo energético completo</Text> — reduz débitos variáveis, introduz vibrações ausentes e neutraliza excessos que o nome atual mantém ativos.
          </Text>
        </View>

        {/* Citação — varia por nível */}
        <View style={{ borderLeftWidth: 3, borderLeftColor: scoreNivel === 'aceitavel' ? '#F59E0B' : GOLD, paddingLeft: 14, marginBottom: 20 }}>
          <Text style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', lineHeight: 1.6 }}>
            {scoreNivel === 'excelente'
              ? '"Uma frequência boa pode ser excelente. A diferença entre os dois está nos últimos padrões que o nome ainda carrega."'
              : scoreNivel === 'aceitavel'
                ? '"Aceitável é o nível onde as pessoas param de procurar a causa dos resultados que faltam. O nome continua emitindo."'
                : '"Conhecer os bloqueios sem harmonizá-los é como saber que a torneira está furada e continuar enchendo o balde."'}
          </Text>
        </View>

        {/* Âncora de preço */}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.06)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', borderRadius: 8, padding: 12, marginBottom: 16 }} wrap={false}>
          <Text style={{ fontSize: 10, color: '#92640F', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.6 }}>
            {scoreNivel === 'excelente'
              ? `A Harmonização do seu nome é R$ 98 — um único ajuste para transformar uma boa frequência em uma frequência magneticamente irresistível.`
              : scoreNivel === 'aceitavel'
                ? `Quanto custa mais um ano com uma frequência que entrega 60% do que poderia? A Harmonização é R$ 98 — menos que um jantar, para destravar o que está sendo bloqueado silenciosamente.`
                : bloqueios.length > 0
                  ? `Quanto custa mais um ano com o Bloqueio ${bloqueios[0]?.codigo ?? ''} repelindo seus resultados?\nA Harmonização do seu nome é R$ 98 — menos que um jantar, para uma frequência que muda o que está codificado no seu nome para sempre.`
                  : 'A Harmonização do seu nome é R$ 98 — um único investimento para recalibrar a frequência que você emite todos os dias da sua vida.'}
          </Text>
        </View>

        {/* CTA */}
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 13, color: '#FFFFFF', marginBottom: 6, textAlign: 'center' }}>
            {scoreNivel === 'excelente'
              ? 'O diagnóstico está feito. O próximo nível espera por você.'
              : scoreNivel === 'aceitavel'
                ? 'O diagnóstico está feito. Seu potencial completo espera por você.'
                : 'O diagnóstico está feito. A transformação espera por você.'}
          </Text>
          <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 18, textAlign: 'center' }}>
            Acesse o produto Nome Social para harmonizar sua frequência agora.
          </Text>
          <View style={{ backgroundColor: GOLD, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 30 }}>
            <Text style={{ color: '#000', fontFamily: 'Helvetica-Bold', fontSize: 12 }}>
              nomemagnetico.com.br/nome-social
            </Text>
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
