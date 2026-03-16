import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, pdfStyles } from './styles';
import type { Analysis, MagneticName } from '../db/analyses';

interface PDFTemplateProps {
  analysis: Analysis;
  magneticNames: MagneticName[];
  theme?: 'dark' | 'light';
}

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
    magneticCard: {
      padding: 12, marginBottom: 8, borderRadius: 6,
      backgroundColor: isDark ? 'rgba(212,175,55,0.08)' : '#fffbea',
      borderWidth: 1, borderColor: COLORS.border,
    },
    footer: { ...pdfStyles.footer },
    footerText: { ...pdfStyles.footerText, color: textSecondary },
  });

  const bloqueios = (analysis.bloqueios ?? []) as Array<{ titulo: string; descricao: string; codigo: string }>;
  const primeiroNome = analysis.nome_completo.split(' ')[0] ?? analysis.nome_completo;

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
            { label: 'Personalidade', value: analysis.numero_personalidade },
          ].map(n => (
            <View key={n.label} style={styles.numberBox}>
              <Text style={styles.numberValue}>{n.value ?? '?'}</Text>
              <Text style={styles.numberLabel}>{n.label}</Text>
            </View>
          ))}
        </View>

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
          <Text style={styles.sectionTitle}>Análise Numerológica Completa</Text>
          <Text style={{ ...styles.body, fontSize: 10, lineHeight: 1.7 }}>
            {analysis.analise_texto.slice(0, 2000)}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Nome Magnético — {analysis.nome_completo}</Text>
            <Text style={styles.footerText}>Página 3</Text>
          </View>
        </Page>
      )}

      {/* Página 4 — Nomes Magnéticos */}
      {magneticNames.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>✨ Seus Nomes Magnéticos</Text>
          <Text style={styles.body}>
            Estas variações do seu nome foram calculadas para eliminar os bloqueios energéticos e potencializar sua vibração.
          </Text>
          {magneticNames.slice(0, 3).map((name, idx) => (
            <View key={name.id} style={styles.magneticCard}>
              {idx === 0 && (
                <Text style={{ fontSize: 9, color: COLORS.gold, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                  ★ RECOMENDADO
                </Text>
              )}
              <Text style={{ fontSize: 14, color: COLORS.gold, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                {name.nome_sugerido}
              </Text>
              <Text style={{ fontSize: 9, color: textSecondary, marginBottom: 4 }}>
                Expressão: {name.numero_expressao} · Motivação: {name.numero_motivacao} · Score: {name.score}/100
              </Text>
              {name.justificativa && (
                <Text style={{ fontSize: 9, color: textSecondary }}>{name.justificativa}</Text>
              )}
            </View>
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Nome Magnético — {analysis.nome_completo}</Text>
            <Text style={styles.footerText}>Página 4</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
