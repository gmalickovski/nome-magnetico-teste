/**
 * NomeBebePDF — documento PDF da análise de Nome para Bebê.
 *
 * Paleta: Rose-gold + Cream (capa com lua crescente + círculos suaves).
 * Número destaque: Destino (calculado da data de nascimento, imutável).
 *
 * Estrutura de páginas:
 *   1. Capa (rose-gold — lua crescente)
 *   2. Destino do Bebê em DESTAQUE + Melhor Nome + 5 Números (Destino destacado)
 *   3. Ranking comparativo dos candidatos
 *   4. Os 4 Triângulos numerológicos com textos contextuais
 *   5. Karma do bebê (débitos + lições + tendências) — se houver
 *   6+. Análise IA completa (triângulos + blocos kármicos injetados inline)
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { THEMES } from './shared/PDFTheme';
import { PDFCover } from './shared/PDFCover';
import { PDFPageHeader } from './shared/PDFPageHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFNumbersGrid } from './shared/PDFNumbersGrid';
import { RenderMarkdownChunks, TrianguloPiramideInline } from './shared/PDFMarkdownRenderer';
import { DebitosBlock, LicoesBlock, TendenciasBlock } from './shared/PDFKarmicBlock';
import { LOGO_FONT, TITLE_FONT, loadLogoSrc, formatDate } from './shared/PDFFonts';
import { formatAnalysisText } from '../../../utils/textFormatter';
import { ARCANOS } from '../../../backend/numerology/arcanos';
import type { ProductPDFProps } from './shared/PDFTypes';

const theme = THEMES.nome_bebe;

const PRIMARY = theme.primaryColor;   // rose-gold
const GOLD = '#D4AF37';
const GRAY = '#4B5563';
const LIGHT_GRAY = '#E5E7EB';
const DARK = '#1a1a1a';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    color: DARK,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
    paddingBottom: 4,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  conclusaoCard: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFF8F5',
    marginTop: 8,
  },
  // Destino do bebê — card grande centralizado
  destinoCard: {
    alignItems: 'center',
    marginBottom: 8,
  },
  destinoBox: {
    width: '55%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    marginTop: 8,
  },
  destinoLabel: {
    fontSize: 10,
    color: GRAY,
    marginBottom: 8,
    letterSpacing: 1,
  },
  destinoNumber: {
    fontSize: 56,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  destinoMeta: {
    fontSize: 9,
    color: GRAY,
  },
  // Melhor nome highlight
  melhorNomeBox: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFF8F5',
    marginTop: 4,
  },
  melhorNomeTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 14,
    color: DARK,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scoreLabel: { fontSize: 9, color: GRAY },
  scoreValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  scoreBar: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 4 },
  scoreBarFill: { height: 8, borderRadius: 4 },
  compatBox: {
    marginTop: 12,
    borderRadius: 6,
    padding: 8,
  },
  compatText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  bloqueioStatus: {
    fontSize: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  // Tabela ranking
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    padding: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: '#FFF8F5',
  },
  tableCell: { fontSize: 8, color: DARK },
});

function scoreColor(score: number): string {
  return score >= 70 ? '#059669' : score >= 40 ? '#D97706' : '#DC2626';
}

function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:6\.|conclus|bencao|encerr)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

export function NomeBebePDF({ analysis, magneticNames }: ProductPDFProps) {
  const logoSrc = loadLogoSrc();
  const freqData = analysis.frequencias_numeros as any;
  const nomeParaExibir = freqData?.ranking?.melhorNome?.nomeCompleto ?? analysis.nome_completo;
  const dataNascimento = formatDate(
    freqData?.ranking?.dataNascimento ?? analysis.data_nascimento
  );
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);

  const letrasNome = nomeParaExibir
    .replace(/\s+/g, '')
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '')
    .toUpperCase()
    .split('');

  // 5 números — para bebê usa números do melhor candidato
  const melhorNome = freqData?.ranking?.melhorNome;
  const destinoBebe = freqData?.ranking?.destino ?? analysis.numero_destino;

  const nums = [
    { label: 'Destino', sublabel: 'O Chamado do Céu', value: destinoBebe, icon: '◈' },
    { label: 'Expressão', sublabel: 'O Dom', value: melhorNome?.expressao ?? analysis.numero_expressao, icon: '✦' },
    { label: 'Motivação', sublabel: 'A Alma', value: melhorNome?.motivacao ?? analysis.numero_motivacao, icon: '♡' },
    { label: 'Impressão', sublabel: 'As Consoantes', value: melhorNome?.impressao ?? analysis.numero_impressao, icon: '◎' },
    { label: 'Missão', sublabel: 'A Vocação', value: melhorNome?.missao ?? analysis.numero_missao, icon: '◇' },
  ];

  const debitos = Array.isArray(analysis.debitos_carmicos) ? analysis.debitos_carmicos : [];
  const licoes = Array.isArray(analysis.licoes_carmicas) ? analysis.licoes_carmicas : [];
  const tendencias = Array.isArray(analysis.tendencias_ocultas) ? analysis.tendencias_ocultas : [];
  const frequencias: Record<string, number> | null =
    freqData?.frequencias ?? null;

  const tVida = analysis.triangulo_vida ?? null;
  const tPessoal = analysis.triangulo_pessoal ?? null;
  const tSocial = analysis.triangulo_social ?? null;
  const tDestino = analysis.triangulo_destino ?? null;
  const hasTriangulos = !!(tVida || tPessoal || tSocial || tDestino);

  const TRIANGLE_FULL_WIDTH = 430;
  const baseLen = Math.max(
    tVida?.linhas[0]?.length ?? 1,
    tPessoal?.linhas[0]?.length ?? 1,
    tSocial?.linhas[0]?.length ?? 1,
    tDestino?.linhas[0]?.length ?? 1,
  );
  const triCellSize = Math.min(18, Math.max(5, Math.floor(TRIANGLE_FULL_WIDTH / baseLen) - 1));
  const triangleMap = hasTriangulos
    ? { vida: tVida, pessoal: tPessoal, social: tSocial, destino: tDestino }
    : undefined;

  const analiseFormatado = analysis.analise_texto
    ? formatAnalysisText(analysis.analise_texto)
    : null;
  const conclusaoTexto = analiseFormatado ? extractConclusao(analiseFormatado) : null;
  const analiseCorpo = analiseFormatado && conclusaoTexto
    ? analiseFormatado.slice(0, analiseFormatado.indexOf(conclusaoTexto)).trim()
    : analiseFormatado;

  const nomesCandidatos: any[] = freqData?.ranking?.nomesCandidatos ?? [];

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

      {/* ── PÁGINA 2: DESTINO DESTAQUE + MELHOR NOME + 5 NÚMEROS ─────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — O Portal do Nascimento`} />

        {/* Destino do bebê — card herói */}
        <View style={[styles.section, { alignItems: 'center' }]}>
          <Text style={styles.sectionTitle}>O Destino que o Céu Escolheu</Text>
          <View style={[styles.destinoBox, { borderColor: PRIMARY }]}>
            <Text style={styles.destinoLabel}>NÚMERO DE DESTINO DO BEBÊ</Text>
            <Text style={[styles.destinoNumber, { color: PRIMARY }]}>{destinoBebe ?? '?'}</Text>
            <Text style={styles.destinoMeta}>Data de nascimento: {dataNascimento}</Text>
          </View>
        </View>

        {/* Estrela dos 5 números — Destino destacado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A Estrela das 5 Pontas</Text>
          <PDFNumbersGrid
            nums={nums}
            featuredLabel="Destino"
            primaryColor={PRIMARY}
            accentColor={theme.accentColor}
          />
        </View>

        {/* Melhor nome destaque */}
        {melhorNome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nome Mais Indicado Numericamente</Text>
            <View style={[styles.melhorNomeBox, { borderColor: PRIMARY }]}>
              <Text style={styles.melhorNomeTitle}>{melhorNome.nomeCompleto}</Text>

              <View style={{ marginBottom: 14 }}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Score Numerológico</Text>
                  <Text style={[styles.scoreValue, { color: scoreColor(melhorNome.score) }]}>
                    {melhorNome.score}/100
                  </Text>
                </View>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        width: `${melhorNome.score}%`,
                        backgroundColor: scoreColor(melhorNome.score),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.compatBox, {
                backgroundColor: melhorNome.compatibilidade === 'total' ? '#ECFDF5' : '#FFFDF0',
              }]}>
                <Text style={[styles.compatText, {
                  color: melhorNome.compatibilidade === 'total' ? '#059669' : '#D97706',
                }]}>
                  Compatibilidade Expressão × Destino:{' '}
                  {melhorNome.compatibilidade === 'total' ? 'Harmonia Total'
                    : melhorNome.compatibilidade === 'complementar' ? 'Harmonia Complementar'
                    : melhorNome.compatibilidade === 'aceitavel' ? 'Aceitável'
                    : 'Incompatível'}
                </Text>
              </View>

              <Text style={[styles.bloqueioStatus, {
                color: melhorNome.temBloqueio ? '#DC2626' : '#059669',
              }]}>
                {melhorNome.temBloqueio
                  ? `${melhorNome.bloqueios?.length ?? 1} bloqueio(s) detectado(s)`
                  : 'Sem bloqueios energéticos'}
              </Text>
            </View>
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 3: RANKING DOS CANDIDATOS ─────────────────────────────── */}
      {nomesCandidatos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Ranking dos Candidatos`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ranking Numerológico dos Candidatos</Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Nome Completo</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Score</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%', textAlign: 'center' }]}>Expr.</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%', textAlign: 'center' }]}>Motiv.</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%', textAlign: 'center' }]}>Impr.</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%', textAlign: 'center' }]}>Compatib.</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>Bloq.</Text>
            </View>

            {nomesCandidatos.slice(0, 12).map((c: any, i: number) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <View style={{ width: '28%' }}>
                  <Text style={[styles.tableCell, i === 0 ? { fontFamily: 'Helvetica-Bold', color: PRIMARY } : {}]}>
                    {i === 0 ? `★ ${c.nomeCompleto}` : c.nomeCompleto}
                  </Text>
                  {c.origemSugerida === 'ia' && (
                    <Text style={{ fontSize: 6, color: '#7c3aed' }}>sugestão automática</Text>
                  )}
                </View>
                <View style={{ width: '20%', paddingRight: 6, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: scoreColor(c.score), marginBottom: 2 }}>
                    {c.score}/100
                  </Text>
                  <View style={{ height: 5, backgroundColor: LIGHT_GRAY, borderRadius: 2 }}>
                    <View style={{ width: `${Math.min(100, c.score)}%`, height: 5, backgroundColor: scoreColor(c.score), borderRadius: 2 }} />
                  </View>
                </View>
                <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>{c.expressao}</Text>
                <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>{c.motivacao}</Text>
                <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>{c.impressao ?? '—'}</Text>
                <Text style={[styles.tableCell, { width: '18%', textAlign: 'center', fontSize: 7, color: c.compatibilidade === 'total' ? '#059669' : c.compatibilidade === 'complementar' ? PRIMARY : c.compatibilidade === 'aceitavel' ? '#D97706' : '#DC2626' }]}>
                  {c.compatibilidade === 'total' ? 'Total' : c.compatibilidade === 'complementar' ? 'Complementar' : c.compatibilidade === 'aceitavel' ? 'Aceitável' : 'Incompat.'}
                </Text>
                <Text style={[styles.tableCell, { width: '10%', textAlign: 'center', color: c.temBloqueio ? '#DC2626' : '#059669' }]}>
                  {c.temBloqueio ? `${c.bloqueios?.length ?? 1}x` : 'Limpo'}
                </Text>
              </View>
            ))}
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA 4: OS 4 TRIÂNGULOS ─────────────────────────────────────── */}
      {hasTriangulos && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Os 4 Triângulos Numerológicos`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estudo dos 4 Triângulos</Text>
            <Text style={{ ...styles.bodyText, marginBottom: 16 }}>
              Os Quatro Triângulos Numerológicos revelam a estrutura energética profunda do nome escolhido para esta criança. Cada triângulo rege uma dimensão específica da vida.
            </Text>

            {([
              { data: tVida, key: 'Triângulo da Vida', desc: 'Vibração base — aspectos gerais de personalidade e energia que a criança projeta ao longo de toda a vida.' },
              { data: tPessoal, key: 'Triângulo Pessoal', desc: 'Mundo íntimo — reações emocionais profundas, como a criança processa sentimentos internamente.' },
              { data: tSocial, key: 'Triângulo Social', desc: 'Influências externas — comportamento em grupo, escola e amizades; percepção que os outros têm dela.' },
              { data: tDestino, key: 'Triângulo do Destino', desc: 'Missão de vida — propósito de longo prazo e legado que esta criança veio construir.' },
            ] as const).filter(t => t.data != null).map(({ data, key, desc }) => {
              const arcanoNum = data!.arcanoRegente;
              const arcanoInfo = arcanoNum != null ? (ARCANOS as any)[arcanoNum] ?? null : null;
              return (
                <View key={key} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#a78bfa', marginBottom: 8 }}>{key}</Text>
                  <Text style={{ fontSize: 10, color: GRAY, marginBottom: 6, lineHeight: 1.4 }}>{desc}</Text>
                  <TrianguloPiramideInline data={data!} label={key} cellSize={triCellSize} letras={letrasNome} />
                  {arcanoInfo && (
                    <View style={{ backgroundColor: '#F9FAFB', borderLeftWidth: 3, borderLeftColor: '#a78bfa', borderRadius: 4, padding: 8, marginTop: 6 }}>
                      <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#6d28d9', marginBottom: 3 }}>
                        Arcano {arcanoNum} — {arcanoInfo.nome}: {arcanoInfo.palavraChave.toLowerCase()}
                      </Text>
                      <Text style={{ fontSize: 8, color: GRAY, lineHeight: 1.4 }}>{arcanoInfo.descricao.split('.')[0]}.</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA 5: KARMA ── (apenas se houver débitos ou lições) ───────── */}
      {(debitos.length > 0 || licoes.length > 0 || tendencias.length > 0) && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Karma & Tendências`} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#D97706', borderBottomColor: '#D97706' }]}>
              Débitos Kármicos
            </Text>
            <DebitosBlock debitos={debitos} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#0369a1', borderBottomColor: '#0369a1' }]}>
              Lições Kármicas
            </Text>
            <LicoesBlock licoes={licoes} />
          </View>

          {tendencias.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#6d28d9', borderBottomColor: '#6d28d9' }]}>
                Tendências Ocultas
              </Text>
              <TendenciasBlock tendencias={tendencias} frequencias={frequencias} />
            </View>
          )}

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA(S) 6+: ANÁLISE IA COMPLETA ───────────────────────────── */}
      {analiseCorpo && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Análise Completa`} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Completa</Text>
            <RenderMarkdownChunks
              text={analiseCorpo}
              styles={styles}
              GOLD={PRIMARY}
              triangleMap={triangleMap}
              triCellSize={triCellSize}
              letrasNome={letrasNome}
            />
          </View>
          <PDFFooter />
        </Page>
      )}

      {/* ── CONCLUSÃO ─────────────────────────────────────────────────────── */}
      {conclusaoTexto && conclusaoTexto.length > 100 && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Bênção Numerológica`} />
          <View style={styles.conclusaoCard}>
            <RenderMarkdownChunks text={conclusaoTexto} styles={styles} GOLD={PRIMARY} />
          </View>
          <PDFFooter />
        </Page>
      )}
    </Document>
  );
}
