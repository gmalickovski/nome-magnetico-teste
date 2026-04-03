/**
 * NomeSocialPDF — documento PDF da análise de Nome Social.
 *
 * Estrutura de páginas:
 *   1. Capa (gold/purple — estrela de 5 pontas)
 *   2. A Estrela de 5 Pontas: Expressão em destaque + 4 números + Bloqueios
 *   3. Karma: Débitos + Lições + Tendências Ocultas
 *   4+. Análise IA completa (triângulos + blocos kármicos injetados inline)
 *   N-1. Variações de nome magnético
 *   N. Folha de treino de assinatura
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { THEMES } from './shared/PDFTheme';
import { PDFCover } from './shared/PDFCover';
import { PDFPageHeader } from './shared/PDFPageHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFNumbersGrid } from './shared/PDFNumbersGrid';
import { RenderMarkdownChunks } from './shared/PDFMarkdownRenderer';
import { BloqueiosBlock, DebitosBlock, LicoesBlock, TendenciasBlock } from './shared/PDFKarmicBlock';
import { LOGO_FONT, TITLE_FONT, loadLogoSrc, formatDate } from './shared/PDFFonts';
import { formatAnalysisText } from '../../../utils/textFormatter';
import type { ProductPDFProps } from './shared/PDFTypes';

const theme = THEMES.nome_social;

const GOLD = theme.primaryColor;
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
  assinaturaPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    color: DARK,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
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
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  assinaturaNome: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
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
    backgroundColor: '#FFFDF0',
    marginBottom: 20,
  },
  assinaturaInstrucoesTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    marginBottom: 6,
  },
  assinaturaInstrucaoItem: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: 3,
  },
  assinaturaLinha: {
    height: 0.5,
    backgroundColor: '#C5C5C5',
    marginBottom: 32,
  },
});

/** Extrai o bloco de conclusão da análise textual */
function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:6\.|conclus)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

function scoreColor(score: number): string {
  return score >= 70 ? '#059669' : score >= 40 ? '#D97706' : '#DC2626';
}

export function NomeSocialPDF({ analysis, magneticNames, userName }: ProductPDFProps) {
  const logoSrc = loadLogoSrc();
  const nomeParaExibir = analysis.nome_completo;
  const dataNascimento = formatDate(analysis.data_nascimento);
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);

  const letrasNome = nomeParaExibir
    .replace(/\s+/g, '')
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '')
    .toUpperCase()
    .split('');

  const nums = [
    { label: 'Expressão', sublabel: 'O Dom', value: analysis.numero_expressao, icon: '✦' },
    { label: 'Destino', sublabel: 'O Chamado', value: analysis.numero_destino, icon: '◈' },
    { label: 'Motivação', sublabel: 'A Alma', value: analysis.numero_motivacao, icon: '♡' },
    { label: 'Impressão', sublabel: 'As Consoantes', value: analysis.numero_impressao, icon: '◎' },
    { label: 'Missão', sublabel: 'A Vocação', value: analysis.numero_missao, icon: '◇' },
  ];

  const bloqueios = Array.isArray(analysis.bloqueios) ? analysis.bloqueios : [];
  const debitos = Array.isArray(analysis.debitos_carmicos) ? analysis.debitos_carmicos : [];
  const licoes = Array.isArray(analysis.licoes_carmicas) ? analysis.licoes_carmicas : [];
  const tendencias = Array.isArray(analysis.tendencias_ocultas) ? analysis.tendencias_ocultas : [];
  const freqData = analysis.frequencias_numeros as any;
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

  const analiseFormatado = analysis.analise_texto
    ? formatAnalysisText(analysis.analise_texto)
    : null;

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

      {/* ── PÁGINA 2: A ESTRELA DE 5 PONTAS + BLOQUEIOS ───────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — Análise de Nome Social`} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A Estrela das 5 Pontas</Text>
          <PDFNumbersGrid
            nums={nums}
            featuredLabel="Expressão"
            primaryColor={theme.primaryColor}
            accentColor={theme.accentColor}
          />
        </View>

        {/* Bloqueios logo abaixo dos números */}
        {bloqueios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626' }]}>
              Bloqueios Energéticos ({bloqueios.length})
            </Text>
            <BloqueiosBlock bloqueios={bloqueios} />
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 3: KARMA — DÉBITOS + LIÇÕES + TENDÊNCIAS ──────────────── */}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#6d28d9', borderBottomColor: '#6d28d9' }]}>
            Tendências Ocultas
          </Text>
          <TendenciasBlock tendencias={tendencias} frequencias={frequencias} />
        </View>

        <PDFFooter />
      </Page>

      {/* ── PÁGINA(S) 4+: ANÁLISE IA COMPLETA ────────────────────────────── */}
      {analiseCorpo && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Análise Completa`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Completa</Text>
            <RenderMarkdownChunks
              text={analiseCorpo}
              styles={styles}
              GOLD={GOLD}
              triangleMap={triangleMap}
              triCellSize={triCellSize}
              letrasNome={letrasNome}
            />
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA: CONCLUSÃO ─────────────────────────────────────────────── */}
      {conclusaoTexto && conclusaoTexto.length > 100 && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Conclusão`} />
          <View style={styles.conclusaoCard}>
            <RenderMarkdownChunks text={conclusaoTexto} styles={styles} GOLD={GOLD} />
          </View>
          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA: VARIAÇÕES DE NOME MAGNÉTICO ───────────────────────────── */}
      {magneticNames.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Variações Numerológicas`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estudo das Variações de Nome Social</Text>
            <Text style={{ ...styles.bodyText, marginBottom: 14, lineHeight: 1.5 }}>
              As 3 melhores variações numerológicas geradas para o seu nome. Cada opção foi calculada para reduzir bloqueios, eliminar débitos variáveis e aumentar a harmonia entre Expressão e Destino.
            </Text>

            {magneticNames.slice(0, 3).map((name, i) => {
              const sc = scoreColor(name.score);
              const isTop = i === 0;
              return (
                <View key={i} style={isTop ? styles.variationCardTop : styles.variationCard}>
                  <View style={styles.variationHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {isTop && (
                        <Text style={{ fontSize: 8, color: GOLD, fontFamily: 'Helvetica-Bold' }}>
                          ★ RECOMENDADO{'  '}
                        </Text>
                      )}
                      <Text style={[styles.variationName, { color: isTop ? DARK : '#374151' }]}>
                        {name.nome_sugerido}
                      </Text>
                    </View>
                    <Text style={[styles.variationScore, { color: sc }]}>{name.score}/100</Text>
                  </View>

                  <View style={styles.variationBar}>
                    <View
                      style={[
                        styles.variationBarFill,
                        { width: `${Math.min(100, name.score)}%`, backgroundColor: sc },
                      ]}
                    />
                  </View>

                  <View style={styles.variationMeta}>
                    {name.numero_expressao != null && (
                      <Text style={styles.variationMetaText}>
                        Expressão:{' '}
                        <Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>
                          {name.numero_expressao}
                        </Text>
                      </Text>
                    )}
                    {name.numero_motivacao != null && (
                      <Text style={styles.variationMetaText}>
                        Motivação: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{name.numero_motivacao}</Text>
                      </Text>
                    )}
                  </View>

                  {name.justificativa && (
                    <Text style={styles.variationJustificativa}>{name.justificativa}</Text>
                  )}
                </View>
              );
            })}
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA FINAL: FOLHA DE TREINO DE ASSINATURA ───────────────────── */}
      <Page size="A4" style={styles.assinaturaPage}>
        <Text style={styles.assinaturaTitle}>Folha de Treino de Assinatura</Text>
        <Text style={styles.assinaturaNome}>{nomeParaExibir}</Text>

        <View style={styles.assinaturaInstrucoesBox}>
          <Text style={styles.assinaturaInstrucoesTitle}>
            Como criar uma assinatura de alto poder energético
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • Nunca cruze traços por cima das letras — linhas cortantes bloqueiam o fluxo energético da assinatura.
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • Inclinação levemente ascendente (da esquerda para a direita) transmite ambição e crescimento positivo.
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • Evite traçados que descem abruptamente ao final — simbolizam queda ou fechamento de ciclos de forma negativa.
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • A assinatura deve ser legível o suficiente para reconhecer as letras principais do seu nome magnético.
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • Termine com um traçado que fecha o nome sem corte — pode ser uma curva suave ascendente ou um ponto de energia.
          </Text>
          <Text style={styles.assinaturaInstrucaoItem}>
            • Pratique até que o movimento se torne fluido e natural — a assinatura deve expressar confiança e leveza.
          </Text>
        </View>

        {Array.from({ length: 13 }).map((_, i) => (
          <View key={i} style={styles.assinaturaLinha} />
        ))}

        <PDFFooter />
      </Page>
    </Document>
  );
}
