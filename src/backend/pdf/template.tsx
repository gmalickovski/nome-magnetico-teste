import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, pdfStyles } from './styles';
import type { Analysis, MagneticName } from '../db/analyses';
import { formatAnalysisText } from '../../utils/textFormatter';
import { getArquetipo } from '../numerology/archetypes';

interface PDFTemplateProps {
  analysis: Analysis;
  magneticNames: MagneticName[];
  theme?: 'dark' | 'light';
}

// ─── HELPER: Renderizador Simples de Markdown para React-PDF ───────────────
function renderMarkdownPiece(text: string, baseStyle: any, boldStyle: any): React.ReactNode[] {
  // Separa o texto pelo negrito: "Algo **importante** aqui" -> ["Algo ", "importante", " aqui"]
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    // Índices ímpares são o conteúdo que estava dentro de ** **
    if (i % 2 === 1) {
      return (
        <Text key={i} style={{ ...baseStyle, ...boldStyle }}>
          {part}
        </Text>
      );
    }
    // Índices pares são texto normal
    return <Text key={i} style={baseStyle}>{part}</Text>;
  });
}

function RenderMarkdownChunks({ text, styles }: { text: string; styles: any }) {
  if (!text) return null;
  // Separa por duplas quebras (blocos/parágrafos)
  const blocks = text.split(/\n\s*\n/);

  return (
    <View style={{ gap: 10 }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // É um Header?
        const matchHeader = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (matchHeader) {
          const level = matchHeader[1].length;
          const content = matchHeader[2];
          // Headers ganham cor Dourada/Destaque
          const headerStyle = {
            ...styles.sectionTitle,
            fontSize: level === 1 ? 16 : level === 2 ? 14 : 12,
            color: level >= 3 ? '#c084fc' : styles.title.color, // H3+ roxo, H1/H2 dourado
            marginTop: idx === 0 ? 0 : 16, // Espaçamento antes do título
            marginBottom: 4,               // Espaçamento depois
          };
          return (
            <Text key={idx} style={headerStyle}>
              {content}
            </Text>
          );
        }

        // Se for lista
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listItems = trimmed.split('\n');
          return (
            <View key={idx} style={{ marginTop: 4, marginBottom: 8, paddingLeft: 10 }}>
              {listItems.map((item, i) => {
                const liText = item.replace(/^[-*]\s+/, '');
                return (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ ...styles.body, marginRight: 6 }}>•</Text>
                    <Text style={{ ...styles.body, flex: 1, lineHeight: 1.5 }}>
                      {renderMarkdownPiece(liText, styles.body, { fontFamily: 'Helvetica-Bold', color: styles.title.color })}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }

        // Parágrafo comum
        return (
          <Text key={idx} style={{ ...styles.body, lineHeight: 1.6, textAlign: 'justify', marginBottom: 6 }}>
            {renderMarkdownPiece(trimmed, styles.body, { fontFamily: 'Helvetica-Bold', color: styles.title.color })}
          </Text>
        );
      })}
    </View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export function PDFTemplate({ analysis, magneticNames, theme = 'dark' }: PDFTemplateProps) {
  const isDark = theme === 'dark';
  const bgColor = isDark ? COLORS.darker : '#FFFFFF';
  const textColor = isDark ? COLORS.textPrimary : '#1a1a1a';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';

  const styles = StyleSheet.create({
    page: { ...pdfStyles.page, backgroundColor: bgColor },
    title: { ...pdfStyles.heading1, color: COLORS.gold },
    subtitle: { fontSize: 12, color: textSecondary, marginBottom: 24 },
    sectionTitle: { ...pdfStyles.heading2, marginTop: 20 },
    body: { ...pdfStyles.body, color: textSecondary },
    card: { ...pdfStyles.card, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9' },
    numbersRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    numberBox: {
      flex: 1, minWidth: 60, alignItems: 'center', padding: 10,
      backgroundColor: isDark ? 'rgba(212,175,55,0.1)' : '#fff8e1',
      borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    },
    numberValue: { fontSize: 22, color: COLORS.gold, fontFamily: 'Helvetica-Bold' },
    numberLabel: { fontSize: 8, color: textSecondary, marginTop: 2 },
    blockageCard: {
      padding: 12, marginBottom: 8, borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255,107,107,0.1)' : '#fff0f0',
      borderLeftWidth: 3, borderLeftColor: COLORS.error,
    },
    debitCard: {
      padding: 12, marginBottom: 8, borderRadius: 6,
      backgroundColor: isDark ? 'rgba(192,132,252,0.1)' : '#faf5ff',
      borderLeftWidth: 3, borderLeftColor: '#c084fc',
    },
    karmicCard: {
      padding: 12, marginBottom: 8, borderRadius: 6,
      backgroundColor: isDark ? 'rgba(56,189,248,0.05)' : '#f0f9ff',
      borderLeftWidth: 3, borderLeftColor: '#38bdf8',
    },
    hiddenCard: {
      padding: 12, marginBottom: 8, borderRadius: 6,
      backgroundColor: isDark ? 'rgba(167,139,250,0.1)' : '#f5f3ff',
      borderLeftWidth: 3, borderLeftColor: '#a78bfa',
    },
    footer: { ...pdfStyles.footer },
    footerText: { ...pdfStyles.footerText, color: textSecondary },
  });

  const bloqueios = (analysis.bloqueios ?? []) as Array<{ titulo: string; descricao: string; codigo: string }>;
  const licoesRaw = (analysis as any).licoes_carmicas as Array<{ numero: number; titulo: string; descricao: string }> | null;
  const tendenciasRaw = (analysis as any).tendencias_ocultas as Array<{ numero: number; titulo: string; descricao: string; frequencia: number }> | null;
  const debitosRaw = (analysis as any).debitos_carmicos as Array<{ numero: number; titulo: string; descricao: string }> | null;

  const hasLicoes = Array.isArray(licoesRaw) && licoesRaw.length > 0;
  const hasTendencias = Array.isArray(tendenciasRaw) && tendenciasRaw.length > 0;
  const hasDebitos = Array.isArray(debitosRaw) && debitosRaw.length > 0;

  const primeiroNome = analysis.nome_completo.split(' ')[0] ?? analysis.nome_completo;

  // Arquétipo derivado do número de Expressão já calculado
  const expressaoNum = analysis.numero_expressao;
  const arquetipo = expressaoNum ? getArquetipo(expressaoNum) : null;

  return (
    <Document>
      {/* Página 1 — Capa */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: COLORS.gold, letterSpacing: 4, marginBottom: 24 }}>
            NOME MAGNÉTICO
          </Text>
          <Text style={{ ...styles.title, fontSize: 36, textAlign: 'center' }}>
            {primeiroNome}
          </Text>
          <Text style={{ ...styles.subtitle, textAlign: 'center', marginTop: 8 }}>
            Análise Numerológica Cabalística Completa
          </Text>
          <View style={{ height: 1, width: 80, backgroundColor: COLORS.gold, opacity: 0.5, marginVertical: 24 }} />
          <Text style={{ fontSize: 10, color: textSecondary, textAlign: 'center' }}>
            {analysis.nome_completo}
          </Text>
          <Text style={{ fontSize: 10, color: textSecondary, textAlign: 'center', marginTop: 4 }}>
            {new Date(analysis.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nome Magnético — Numerologia Cabalística</Text>
          <Text style={styles.footerText}>Página 1</Text>
        </View>
      </Page>

      {/* Página 2 — Números */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Seus 5 Números Principais</Text>
        <Text style={styles.body}>
          Os números calculados a partir do seu nome e data de nascimento revelam sua identidade numerológica completa.
        </Text>
        <View style={styles.numbersRow}>
          {[
            { label: 'Expressão', value: analysis.numero_expressao },
            { label: 'Destino', value: analysis.numero_destino },
            { label: 'Motivação', value: analysis.numero_motivacao },
            { label: 'Missão', value: analysis.numero_missao },
            { label: 'Impressão', value: analysis.numero_personalidade },
          ].map(n => (
            <View key={n.label} style={styles.numberBox}>
              <Text style={styles.numberValue}>{n.value ?? '?'}</Text>
              <Text style={styles.numberLabel}>{n.label}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.goldDivider} />

        {/* Arquétipo */}
        {arquetipo && (
          <>
            <Text style={{ ...styles.sectionTitle, color: COLORS.gold, marginTop: 16 }}>
              Arquétipo — {arquetipo.nome}
            </Text>
            <View style={{
              padding: 14, marginBottom: 12, borderRadius: 8,
              backgroundColor: isDark ? 'rgba(212,175,55,0.07)' : '#fffdf0',
              borderWidth: 1, borderColor: COLORS.border,
            }}>
              <Text style={{ fontSize: 11, color: COLORS.gold, fontFamily: 'Helvetica-Bold', marginBottom: 6, textAlign: 'center' }}>
                "{arquetipo.essencia}"
              </Text>
              <Text style={{ ...styles.body, fontSize: 10, marginBottom: 8 }}>{arquetipo.descricao}</Text>
              <Text style={{ fontSize: 9, color: '#10b981', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                Expressão Positiva
              </Text>
              {arquetipo.expressaoPositiva.map((item, i) => (
                <Text key={i} style={{ ...styles.body, fontSize: 9, marginBottom: 2 }}>• {item}</Text>
              ))}
              {analysis.product_type === 'nome_empresa' && (
                <>
                  <Text style={{ fontSize: 9, color: '#c084fc', fontFamily: 'Helvetica-Bold', marginTop: 6, marginBottom: 4 }}>
                    Marcas de Referência
                  </Text>
                  <Text style={{ ...styles.body, fontSize: 9 }}>{arquetipo.marcasReferencia.join('  ·  ')}</Text>
                  <Text style={{ ...styles.body, fontSize: 9, marginTop: 4 }}>{arquetipo.posicionamento}</Text>
                </>
              )}
            </View>
          </>
        )}

        <View style={pdfStyles.goldDivider} />

        {/* Bloqueios */}
        {bloqueios.length > 0 && (
          <>
            <Text style={{ ...styles.sectionTitle, color: COLORS.error }}>
              Bloqueios Detectados ({bloqueios.length})
            </Text>
            {bloqueios.map(b => (
              <View key={b.codigo} style={styles.blockageCard}>
                <Text style={{ fontSize: 11, color: COLORS.error, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                  {b.titulo}
                </Text>
                <Text style={{ ...styles.body, fontSize: 10 }}>{b.descricao}</Text>
              </View>
            ))}
          </>
        )}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nome Magnético — {analysis.nome_completo}</Text>
          <Text style={styles.footerText}>Página 2</Text>
        </View>
      </Page>

      {/* Página 3 — Análise IA */}
      {analysis.analise_texto && (
        <Page size="A4" style={styles.page}>
          <Text style={{ ...styles.sectionTitle, marginBottom: 20 }}>Análise Numerológica Completa</Text>
          <RenderMarkdownChunks text={formatAnalysisText(analysis.analise_texto)} styles={styles} />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Nome Magnético — {analysis.nome_completo}</Text>
            <Text style={styles.footerText}>Página 3</Text>
          </View>
        </Page>
      )}

      {/* Página 4 — Fatores Kármicos e Ocultos */}
      {(hasLicoes || hasTendencias || hasDebitos) && (
        <Page size="A4" style={styles.page}>
          
          {hasDebitos && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ ...styles.sectionTitle, color: '#c084fc', marginTop: 10 }}>Débitos Kármicos</Text>
              {debitosRaw!.map((d, i) => (
                <View key={i} style={styles.debitCard}>
                  <Text style={{ fontSize: 11, color: '#c084fc', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                    {d.numero} — {d.titulo}
                  </Text>
                  <Text style={{ ...styles.body, fontSize: 10 }}>{d.descricao}</Text>
                </View>
              ))}
            </View>
          )}

          {hasLicoes && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ ...styles.sectionTitle, color: '#38bdf8', marginTop: 10 }}>Lições Kármicas</Text>
              {licoesRaw!.map((l, i) => (
                <View key={i} style={styles.karmicCard}>
                  <Text style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                    {l.titulo}
                  </Text>
                  <Text style={{ ...styles.body, fontSize: 10 }}>{l.descricao}</Text>
                </View>
              ))}
            </View>
          )}

          {hasTendencias && (
             <View style={{ marginBottom: 20 }}>
              <Text style={{ ...styles.sectionTitle, color: '#a78bfa', marginTop: 10 }}>Tendências Ocultas</Text>
              {tendenciasRaw!.map((t, i) => (
                <View key={i} style={styles.hiddenCard}>
                  <Text style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                    {t.titulo} (Frequência: {t.frequencia}x)
                  </Text>
                  <Text style={{ ...styles.body, fontSize: 10 }}>{t.descricao}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nome Magnético — {analysis.nome_completo}</Text>
            <Text style={styles.footerText}>Página 4</Text>
          </View>
        </Page>
      )}

    </Document>
  );
}
