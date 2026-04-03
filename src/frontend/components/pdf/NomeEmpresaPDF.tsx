/**
 * NomeEmpresaPDF — documento PDF da análise de Nome Empresarial.
 *
 * Paleta: Azul corporativo (#4A7FC1) + Gold accent (capa com hexágonos).
 * Número destaque: Expressão (magnetismo do negócio).
 *
 * Estrutura de páginas:
 *   1. Capa (navy + azul + gold — hexágonos geométricos)
 *   2. Sinergia Sócio-Empresa + Melhor Nome + 5 Números (Expressão destacada)
 *   3. Estudo completo dos candidatos
 *   4. Os 4 Triângulos numerológicos
 *   5. Karma Empresarial (débitos + lições) — se houver
 *   6+. Análise IA completa
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { THEMES } from './shared/PDFTheme';
import { PDFCover } from './shared/PDFCover';
import { PDFPageHeader } from './shared/PDFPageHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFNumbersGrid } from './shared/PDFNumbersGrid';
import { RenderMarkdownChunks, TrianguloPiramideInline } from './shared/PDFMarkdownRenderer';
import { DebitosBlock, LicoesBlock } from './shared/PDFKarmicBlock';
import { LOGO_FONT, TITLE_FONT, loadLogoSrc, formatDate } from './shared/PDFFonts';
import { formatAnalysisText } from '../../../utils/textFormatter';
import { ARCANOS } from '../../../backend/numerology/arcanos';
import type { ProductPDFProps } from './shared/PDFTypes';

const theme = THEMES.nome_empresa;

const PRIMARY = theme.primaryColor;   // azul
const ACCENT = theme.accentColor;     // gold
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
    backgroundColor: '#F0F6FF',
    marginTop: 8,
  },
  // Sinergia cards
  sinergiaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sinergiaCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sinergiaLabel: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sinergiaNumber: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  sinergiaMeta: {
    fontSize: 8,
    color: GRAY,
    textAlign: 'center',
  },
  // Melhor nome
  melhorNomeBox: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
    backgroundColor: '#F0F6FF',
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
  scoreBar: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 4, marginBottom: 14 },
  scoreBarFill: { height: 8, borderRadius: 4 },
  compatBox: { marginTop: 6, borderRadius: 6, padding: 8 },
  compatText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  bloqueioStatus: { fontSize: 8, marginTop: 8, textAlign: 'center' },
  // Estudo candidatos
  candidatoCard: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
  },
  candidatoCardTop: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#F0F6FF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 6,
  },
  candidatoBar: { height: 4, backgroundColor: LIGHT_GRAY, borderRadius: 2, marginBottom: 5 },
  candidatoBarFill: { height: 4, borderRadius: 2 },
  candidatoMeta: { flexDirection: 'row', gap: 10, marginBottom: 4, flexWrap: 'wrap' },
  candidatoMetaText: { fontSize: 8, color: GRAY },
  candidatoCompat: { flexDirection: 'row', gap: 10 },
});

function scoreColor(score: number): string {
  return score >= 70 ? '#059669' : score >= 40 ? '#D97706' : '#DC2626';
}

function compatColor(c: string): string {
  return c === 'total' ? '#059669' : c === 'complementar' ? '#7c3aed' : c === 'aceitavel' ? '#D97706' : '#DC2626';
}

function compatLabel(c: string): string {
  return c === 'total' ? 'Harmonia Total' : c === 'complementar' ? 'Complementar' : c === 'aceitavel' ? 'Aceitável' : 'Incompatível';
}

function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:6\.|conclus|proxim|encerr)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

export function NomeEmpresaPDF({ analysis, magneticNames }: ProductPDFProps) {
  const logoSrc = loadLogoSrc();
  const freqData = analysis.frequencias_numeros as any;
  const melhorNome = freqData?.melhorNome;
  const nomeParaExibir = melhorNome?.nomeEmpresa ?? analysis.nome_completo;
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);
  const dataNascimentoSocio = formatDate(analysis.data_nascimento);

  const letrasNome = nomeParaExibir
    .replace(/\s+/g, '')
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '')
    .toUpperCase()
    .split('');

  // 5 números da empresa — do melhor nome + destino do sócio
  const nums = [
    { label: 'Expressão', sublabel: 'O Magnetismo', value: melhorNome?.expressao ?? analysis.numero_expressao, icon: '✦' },
    { label: 'Destino', sublabel: 'O Chamado', value: freqData?.destinoSocio ?? analysis.numero_destino, icon: '◈' },
    { label: 'Motivação', sublabel: 'A Essência', value: melhorNome?.motivacao ?? analysis.numero_motivacao, icon: '♡' },
    { label: 'Missão', sublabel: 'O Propósito', value: melhorNome?.missao ?? analysis.numero_missao, icon: '◎' },
    { label: 'Impressão', sublabel: 'A Marca', value: melhorNome?.impressao ?? analysis.numero_impressao, icon: '◉' },
  ];

  const debitos = Array.isArray(analysis.debitos_carmicos) ? analysis.debitos_carmicos : [];
  const licoes = Array.isArray(analysis.licoes_carmicas) ? analysis.licoes_carmicas : [];

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

  const nomesCandidatos: any[] = freqData?.nomesCandidatos ?? [];
  const hasKarma =
    (freqData?.melhorNome?.debitosCarmicos?.length > 0) ||
    (freqData?.melhorNome?.licoesCarmicas?.length > 0) ||
    debitos.length > 0 ||
    licoes.length > 0;

  return (
    <Document title={`Nome Magnetico — ${nomeParaExibir}`} author="Nome Magnetico">

      {/* ── PÁGINA 1: CAPA ────────────────────────────────────────────────── */}
      <PDFCover
        theme={theme}
        nomeParaExibir={nomeParaExibir}
        dataNascimento={dataNascimentoSocio}
        dataGeracao={dataGeracao}
        logoSrc={logoSrc}
        logoFont={LOGO_FONT}
        titleFont={TITLE_FONT}
      />

      {/* ── PÁGINA 2: SINERGIA + MELHOR NOME + 5 NÚMEROS ─────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${analysis.nome_completo} — Análise de Nome Empresarial`} />

        {/* Sinergia Sócio-Empresa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinergia Sócio-Empresa</Text>
          <View style={styles.sinergiaRow}>
            <View style={[styles.sinergiaCard, { borderColor: PRIMARY }]}>
              <Text style={styles.sinergiaLabel}>DESTINO DO SÓCIO PRINCIPAL</Text>
              <Text style={[styles.sinergiaNumber, { color: PRIMARY }]}>
                {freqData?.destinoSocio ?? analysis.numero_destino ?? '?'}
              </Text>
              <Text style={styles.sinergiaMeta}>
                {freqData?.nomeSocioPrincipal ?? analysis.nome_completo}
              </Text>
            </View>
            {freqData?.nomeSocio2 && freqData?.destinoSocio2 != null && (
              <View style={[styles.sinergiaCard, { borderColor: '#a78bfa' }]}>
                <Text style={styles.sinergiaLabel}>DESTINO DO 2º SÓCIO</Text>
                <Text style={[styles.sinergiaNumber, { color: '#7c3aed' }]}>{freqData.destinoSocio2}</Text>
                <Text style={styles.sinergiaMeta}>{freqData.nomeSocio2}</Text>
              </View>
            )}
            {freqData?.destinoEmpresa != null && (
              <View style={[styles.sinergiaCard, { borderColor: ACCENT }]}>
                <Text style={styles.sinergiaLabel}>DESTINO DA EMPRESA</Text>
                <Text style={[styles.sinergiaNumber, { color: ACCENT }]}>{freqData.destinoEmpresa}</Text>
                <Text style={styles.sinergiaMeta}>Data de fundação</Text>
              </View>
            )}
          </View>
        </View>

        {/* Estrela dos 5 números — Expressão destacada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A Estrela das 5 Pontas</Text>
          <PDFNumbersGrid
            nums={nums}
            featuredLabel="Expressão"
            primaryColor={PRIMARY}
            accentColor={ACCENT}
          />
        </View>

        {/* Melhor nome */}
        {melhorNome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nome Mais Indicado</Text>
            <View style={[styles.melhorNomeBox, { borderColor: PRIMARY }]}>
              <Text style={styles.melhorNomeTitle}>{melhorNome.nomeEmpresa}</Text>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score Numerológico</Text>
                <Text style={[styles.scoreValue, { color: scoreColor(melhorNome.score) }]}>
                  {melhorNome.score}/100
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, {
                  width: `${Math.min(100, melhorNome.score)}%`,
                  backgroundColor: scoreColor(melhorNome.score),
                }]} />
              </View>

              <View style={[styles.compatBox, {
                backgroundColor: melhorNome.compatibilidadeSocio === 'total' ? '#ECFDF5' : '#F0F6FF',
              }]}>
                <Text style={[styles.compatText, { color: compatColor(melhorNome.compatibilidadeSocio) }]}>
                  Compatibilidade com Sócio: {compatLabel(melhorNome.compatibilidadeSocio)}
                </Text>
              </View>

              {melhorNome.compatibilidadeEmpresa != null && (
                <View style={[styles.compatBox, {
                  backgroundColor: melhorNome.compatibilidadeEmpresa === 'total' ? '#ECFDF5' : '#F0F6FF',
                }]}>
                  <Text style={[styles.compatText, { color: compatColor(melhorNome.compatibilidadeEmpresa) }]}>
                    Compatibilidade com Empresa: {compatLabel(melhorNome.compatibilidadeEmpresa)}
                  </Text>
                </View>
              )}

              <Text style={[styles.bloqueioStatus, { color: melhorNome.temBloqueio ? '#DC2626' : '#059669' }]}>
                {melhorNome.temBloqueio
                  ? `${melhorNome.bloqueios?.length ?? 1} bloqueio(s) detectado(s)`
                  : 'Sem bloqueios energéticos'}
              </Text>
            </View>
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 3: ESTUDO DOS CANDIDATOS ──────────────────────────────── */}
      {nomesCandidatos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${analysis.nome_completo} — Estudo dos Nomes Candidatos`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estudo Completo dos Nomes Candidatos</Text>
            <Text style={{ ...styles.bodyText, marginBottom: 12, lineHeight: 1.5 }}>
              Todos os nomes foram analisados numerologicamente. O marcado com estrela é o mais indicado. (*) foram gerados automaticamente por terem score superior a 80.
            </Text>

            {nomesCandidatos.slice(0, 10).map((c: any, i: number) => {
              const sc = scoreColor(c.score);
              const isTop = i === 0;
              const isIA = c.origemSugerida === 'ia';
              return (
                <View key={i} style={isTop ? styles.candidatoCardTop : styles.candidatoCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {isTop && <Text style={{ fontSize: 8, color: PRIMARY, fontFamily: 'Helvetica-Bold' }}>★ RECOMENDADO{'  '}</Text>}
                      {isIA && !isTop && <Text style={{ fontSize: 7, color: '#7c3aed', fontFamily: 'Helvetica-Bold' }}>(*) SUGESTÃO{'  '}</Text>}
                      <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: isTop ? DARK : '#374151' }}>{c.nomeEmpresa}</Text>
                    </View>
                    <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: sc }}>{c.score}/100</Text>
                  </View>

                  <View style={styles.candidatoBar}>
                    <View style={[styles.candidatoBarFill, { width: `${Math.min(100, c.score)}%`, backgroundColor: sc }]} />
                  </View>

                  <View style={styles.candidatoMeta}>
                    <Text style={styles.candidatoMetaText}>Expressão: <Text style={{ fontFamily: 'Helvetica-Bold', color: PRIMARY }}>{c.expressao}</Text></Text>
                    <Text style={styles.candidatoMetaText}>Motivação: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.motivacao}</Text></Text>
                    <Text style={styles.candidatoMetaText}>Missão: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.missao}</Text></Text>
                    <Text style={styles.candidatoMetaText}>Impressão: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.impressao ?? '?'}</Text></Text>
                  </View>

                  <View style={styles.candidatoCompat}>
                    <Text style={{ fontSize: 7, color: compatColor(c.compatibilidadeSocio) }}>
                      Sócio: {compatLabel(c.compatibilidadeSocio)}
                    </Text>
                    {c.compatibilidadeEmpresa != null && (
                      <Text style={{ fontSize: 7, color: compatColor(c.compatibilidadeEmpresa) }}>
                        Empresa: {compatLabel(c.compatibilidadeEmpresa)}
                      </Text>
                    )}
                    <Text style={{ fontSize: 7, color: c.temBloqueio ? '#DC2626' : '#059669' }}>
                      {c.temBloqueio ? `${c.bloqueios?.length ?? 1} bloqueio(s)` : 'Sem bloqueios'}
                    </Text>
                  </View>
                </View>
              );
            })}
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
              Os Quatro Triângulos Numerológicos revelam a estrutura energética profunda do nome escolhido. Cada triângulo rege uma dimensão específica do negócio.
            </Text>

            {([
              { data: tVida, key: 'Triângulo da Vida', desc: 'Vibração base — aspectos gerais de energia que o negócio projeta ao mercado e como é percebido por clientes e parceiros.' },
              { data: tPessoal, key: 'Triângulo Pessoal', desc: 'Dimensão íntima — cultura interna, valores e a forma como a equipe e sócios vivenciam a empresa.' },
              { data: tSocial, key: 'Triângulo Social', desc: 'Posicionamento de mercado — como clientes, concorrentes e o mercado percebem esta empresa.' },
              { data: tDestino, key: 'Triângulo do Destino', desc: 'Missão e legado — propósito de longo prazo e o impacto que este nome carrega para o futuro.' },
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

      {/* ── PÁGINA 5: KARMA EMPRESARIAL ───────────────────────────────────── */}
      {hasKarma && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${analysis.nome_completo} — Karma Empresarial`} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Karma Empresarial — Perfil do Sócio</Text>
            <Text style={{ ...styles.bodyText, marginBottom: 14, lineHeight: 1.5 }}>
              Os padrões kármicos do empreendedor influenciam diretamente a energia e os resultados do negócio. Compreender e trabalhar esses padrões é fundamental para o sucesso sustentável da empresa.
            </Text>
          </View>

          {/* Débitos do melhor nome (vindos do ranking) ou da análise */}
          {(freqData?.melhorNome?.debitosCarmicos?.length > 0 || debitos.length > 0) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#D97706', borderBottomColor: '#D97706' }]}>
                Débitos Kármicos Identificados
              </Text>
              <DebitosBlock
                debitos={freqData?.melhorNome?.debitosCarmicos ?? debitos}
              />
            </View>
          )}

          {/* Lições */}
          {(freqData?.melhorNome?.licoesCarmicas?.length > 0 || licoes.length > 0) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#7c3aed', borderBottomColor: '#7c3aed' }]}>
                Lições Kármicas — Qualidades a Desenvolver
              </Text>
              <LicoesBlock licoes={freqData?.melhorNome?.licoesCarmicas ?? licoes} />
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
          <PDFPageHeader subtitle={`${nomeParaExibir} — Direcionamento Estratégico`} />
          <View style={styles.conclusaoCard}>
            <RenderMarkdownChunks text={conclusaoTexto} styles={styles} GOLD={PRIMARY} />
          </View>
          <PDFFooter />
        </Page>
      )}
    </Document>
  );
}
