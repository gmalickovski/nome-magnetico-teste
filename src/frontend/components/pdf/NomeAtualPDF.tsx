/**
 * NomeAtualPDF — documento PDF da análise Gratuita (Nome Atual).
 *
 * Estrutura de páginas:
 *   1. Capa
 *   2. Guia de Leitura (intro)
 *   3. Os Números — Destino (card central) + 4 números do nome lado a lado
 *   4. Bloqueios Energéticos
 *   5. Karma, Lições e Tendências Ocultas
 *   6. Os 4 Triângulos (explicação — se disponíveis)
 *   7+. Análise IA completa (triângulos + diagnóstico)
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
  const triangleMap = (tVida || tPessoal || tSocial || tDestino)
    ? { vida: tVida, pessoal: tPessoal, social: tSocial, destino: tDestino }
    : undefined;

  let analiseFormatado = analysis.analise_texto
    ? formatAnalysisText(analysis.analise_texto)
    : null;
  if (analiseFormatado) {
    // Remove leading # title (AI sometimes generates "# Análise Numerológica para {nome}")
    analiseFormatado = analiseFormatado.replace(/^#{1,2}\s+[^\n]*\n+/, '');
    // Remove "Manual de Assinatura Fluída" section (not relevant for free analysis diagnosis)
    analiseFormatado = analiseFormatado.replace(/#{1,6}\s+[^\n]*Manual de Assinatura[^\n]*\n[\s\S]*?(?=#{1,6}\s|\s*$)/i, '');
  }
  const conclusaoTexto = analiseFormatado ? extractConclusao(analiseFormatado) : null;
  const analiseCorpo = analiseFormatado && conclusaoTexto
    ? analiseFormatado.slice(0, analiseFormatado.indexOf(conclusaoTexto)).trim()
    : analiseFormatado;

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

      {/* ── PÁGINA 3: OS NÚMEROS ─────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — O Projeto de Fábrica`} />

        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <Text style={styles.hugeTitle}>O Número de Destino</Text>
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
        <View style={{ borderRadius: 8, backgroundColor: 'rgba(212,175,55,0.06)', padding: 14 }}>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#8A5C00', marginBottom: 8 }}>Os Números do Nome — O Veículo</Text>
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65 }}>
            Os outros quatro números — Expressão, Motivação, Impressão e Missão — emergem das letras do seu nome de batismo. Diferente do Destino, esses números respondem à vibração das letras que você usa. Quando o arranjo do nome muda, esses campos se reorganizam — podendo criar ou desfazer bloqueios, abrir ou fechar caminhos. Você não precisa mudar quem você é. Apenas o veículo através do qual a sua essência se expressa no mundo.
          </Text>
        </View>

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 4: BLOQUEIOS ENERGÉTICOS ──────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — Raio-X dos Bloqueios`} />

        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <Text style={styles.hugeTitle}>Bloqueios Energéticos</Text>
        </View>

        {bloqueios.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626' }]}>
              {bloqueios.length} Bloqueio{bloqueios.length > 1 ? 's' : ''} Detectado{bloqueios.length > 1 ? 's' : ''} no Seu Nome
            </Text>
            <Text style={{ fontSize: 9, color: '#7C3AED', fontStyle: 'italic', marginBottom: 10 }}>
              Os números em vermelho nas pirâmides dos triângulos (páginas seguintes) indicam exatamente onde cada bloqueio está atuando no seu campo energético.
            </Text>
            <BloqueiosBlock bloqueios={bloqueios} showAntidoto={false} />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#059669', borderBottomColor: '#059669' }]}>
              Nenhum Bloqueio Detectado
            </Text>
            <View style={{ backgroundColor: '#ecfdf5', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#34d399', marginTop: 8 }}>
              <Text style={{ fontFamily: TITLE_FONT, color: '#065f46', fontSize: 13, marginBottom: 6 }}>
                Fluxo Livre Confirmado
              </Text>
              <Text style={{ fontFamily: BODY_FONT, color: '#064e3b', fontSize: 10, lineHeight: 1.6 }}>
                Os cálculos cabalísticos mapearam a totalidade do seu nome e confirmaram que a sua arquitetura vibratória atual está completamente livre de sequências numéricas travadas. Sem essas amarras para obstruir o campo, a sua energia flui de maneira cristalina pelas áreas de finanças, saúde e relacionamentos — refletindo um fluxo limpo rumo ao seu Destino.
              </Text>
            </View>
          </View>
        )}

        <PDFFooter />
      </Page>

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
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Padrões de encarnações anteriores que se repetem como traição, perda ou esforço redobrado — até a lição ser integrada.</Text>
          <DebitosBlock debitos={debitos} showSolution={false} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#0369a1', borderBottomColor: '#0369a1', fontSize: 13 }]}>
            Lições Kármicas
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Vibrações ausentes no nome que criam pontos cegos crônicos — áreas onde você se sente inapto independente do esforço.</Text>
          <LicoesBlock licoes={licoes} showSolution={false} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#6d28d9', borderBottomColor: '#6d28d9', fontSize: 13 }]}>
            Tendências Ocultas
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Frequências repetidas em excesso no nome que criam comportamentos compulsivos — convertendo talento em sabotagem.</Text>
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



      {/* ── PÁGINAS: ANÁLISE IA COMPLETA ──────────────────────────────────── */}
      {analiseCorpo && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Diagnóstico`} />

          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <Text style={styles.hugeTitle}>Diagnóstico do Nome</Text>
          </View>

          <View style={styles.section}>
            <RenderMarkdownChunks
              text={analiseCorpo}
              styles={styles}
              GOLD={GOLD}
              triangleMap={triangleMap}
              triCellSize={triCellSize}
              letrasNome={letrasNome}
              pageBreaks={['Os 4 Triângulos', 'Triângulo Pessoal', 'Triângulo Social', 'Triângulo do Destino', 'Bloqueios e', 'Como Harmonizar']}
              injections={{
                'Tri\u00e2ngulo da Vida': (
                  <View style={{ borderRadius: 8, backgroundColor: 'rgba(212,175,55,0.06)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', padding: 10, marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, color: GOLD, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>O QUE REVELA</Text>
                    <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>Calculado a partir do valor puro de cada letra. Revela os padroes fundamentais de existencia - os temas que se repetem nas diferentes fases da vida, independentemente das circunstancias. Molda a relacao com o corpo, a vitalidade, o dinheiro e a resiliencia diante dos desafios. Bloqueios neste triangulo afetam saude e ciclos de prosperidade.</Text>
                  </View>
                ),
                'Tri\u00e2ngulo Pessoal': (
                  <View style={{ borderRadius: 8, backgroundColor: 'rgba(190,165,255,0.06)', borderWidth: 1, borderColor: 'rgba(190,165,255,0.25)', padding: 10, marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, color: '#7c3aed', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>O QUE REVELA</Text>
                    <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>Calculado adicionando o numero do dia de nascimento a cada letra. Mapeia a dimensao intima e emocional - as reacoes internas, os mecanismos de defesa e os padroes afetivos que raramente sao visiveis ao mundo. Revela como voce processa as experiencias por dentro e os ciclos emocionais que se repetem nos relacionamentos mais proximos.</Text>
                  </View>
                ),
                'Tri\u00e2ngulo Social': (
                  <View style={{ borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.06)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', padding: 10, marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, color: '#059669', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>O QUE REVELA</Text>
                    <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>Calculado adicionando o numero do mes de nascimento a cada letra. Revela como o mundo externo percebe e responde ao seu nome - o magnetismo pessoal, as oportunidades de networking e a reputacao. Governa a visibilidade, as vendas e as conexoes estrategicas. Bloqueios aqui sabotam a presenca publica e o reconhecimento.</Text>
                  </View>
                ),
                'Tri\u00e2ngulo do Destino': (
                  <View style={{ borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.06)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', padding: 10, marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, color: '#b45309', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>O QUE REVELA</Text>
                    <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.6 }}>Calculado adicionando a soma reduzida do dia e mes de nascimento a cada letra. Mapeia os resultados que tendem a se materializar ao longo da vida - a missao maior e os frutos que a frequencia do nome produz. Bloqueios aqui criam ciclos de esforco sem colheita - o trabalho nao se converte em resultado.</Text>
                  </View>
                ),
              }}
            />
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA: CONCLUSÃO (FUNDO ESCURO) ─────────────────────────────── */}
      {conclusaoTexto && conclusaoTexto.length > 50 && (
        <Page size="A4" style={styles.darkPage}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — O Encerramento`} />
          <View style={{ marginTop: 24, marginBottom: 16 }}>
             <Text style={styles.hugeTitle}>Conclusão Final</Text>
             <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: GOLD, textAlign: 'center', letterSpacing: 1, marginBottom: 24 }}>
               A Síntese do Seu Mapa
             </Text>
          </View>
          <View style={styles.section}>
            <RenderMarkdownChunks
               text={conclusaoTexto}
               styles={{...styles, bodyText: { ...styles.bodyText, color: '#e5e2e1' }}}
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
