/**
 * AnalysePDF — documento PDF profissional A4 gerado com @react-pdf/renderer.
 * Usado exclusivamente no server-side pelo endpoint /api/generate-pdf.ts.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { formatAnalysisText } from '../../../utils/textFormatter';

// 1. Desativar hifenização global para que nomes grandes não quebrem (ex: "Cor-rea")
Font.registerHyphenationCallback((word) => [word]);

// 2. Registrar Cinzel a partir do arquivo local como base64 (mais confiável em SSR)
// Tenta dois caminhos candidatos: process.cwd() e relativo ao import.meta.url
let _cinzelRegistered = false;
try {
  const _candidates = [
    path.resolve(process.cwd(), 'public/fonts/Cinzel-Regular.ttf'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../public/fonts/Cinzel-Regular.ttf'),
  ];
  for (const _p of _candidates) {
    if (fs.existsSync(_p)) {
      Font.register({
        family: 'Cinzel',
        src: `data:font/truetype;base64,${fs.readFileSync(_p).toString('base64')}`,
      });
      _cinzelRegistered = true;
      break;
    }
  }
} catch { /* fallback para Helvetica-Bold */ }

const LOGO_FONT = _cinzelRegistered ? 'Cinzel' : 'Helvetica-Bold';

// Remove Unicode emoji/emoticons — react-pdf não suporta a maioria
// Não faz trim() para não remover espaços intencionais em texto inline (negrito)
function stripEmoji(str: string): string {
  return str.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,
    ''
  ).replace(/\s{2,}/g, ' ');
}

// Versão com trim para uso em títulos/cabeçalhos
function stripEmojiTrim(str: string): string {
  return stripEmoji(str).trim();
}

function renderMarkdownPiece(text: string, baseStyle: any, boldStyle: any): React.ReactNode[] {
  const rawParts = text.split(/\*\*([^*]+)\*\*/g);

  // React-pdf strips leading/trailing spaces from inline <Text> children at element boundaries.
  // Fix: mover espaços de fronteira para DENTRO do elemento bold, onde não são descartados.
  const parts = [...rawParts];
  for (let i = 1; i < parts.length; i += 2) {
    // Se o trecho normal anterior termina com espaço → absorver no início do bold
    if (i - 1 >= 0 && parts[i - 1].endsWith(' ')) {
      parts[i] = ' ' + parts[i];
      parts[i - 1] = parts[i - 1].slice(0, -1);
    }
    // Se o trecho normal seguinte começa com espaço → absorver no final do bold
    if (i + 1 < parts.length && parts[i + 1].startsWith(' ')) {
      parts[i] = parts[i] + ' ';
      parts[i + 1] = parts[i + 1].slice(1);
    }
  }

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <Text key={i} style={{ ...baseStyle, ...boldStyle }}>
          {stripEmoji(part)}
        </Text>
      );
    }
    return <Text key={i} style={baseStyle}>{stripEmoji(part)}</Text>;
  });
}

export function capitalizeTitle(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function RenderMarkdownChunks({ text, styles, GOLD, triangleMap, triCellSize, letrasNome }: {
  text: string;
  styles: any;
  GOLD: string;
  triangleMap?: TriangleMap;
  triCellSize?: number;
  letrasNome?: string[];
}) {
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/);
  const cellSize = triCellSize ?? 14;
  const result: React.ReactNode[] = [];

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const matchHeader = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (matchHeader) {
      const level = matchHeader[1].length;
      const content = stripEmojiTrim(matchHeader[2]);
      const fontSize = level === 1 ? 20 : level === 2 ? 15 : level === 3 ? 12 : 10;
      const color = level >= 3 ? (level === 4 ? '#F59E0B' : '#a78bfa') : GOLD;
      const marginTop = level === 1 ? 20 : level === 2 ? 14 : level === 3 ? 10 : 6;
      const marginBottom = level === 1 ? 10 : level === 2 ? 7 : level === 3 ? 5 : 3;
      result.push(
        <Text key={idx} style={{
          fontSize,
          fontFamily: 'Helvetica-Bold',
          color,
          marginTop: result.length === 0 ? 0 : marginTop,
          marginBottom,
          letterSpacing: level <= 2 ? 0.4 : 0,
        }}>
          {content}
        </Text>
      );

      // Injeta o triângulo IMEDIATAMENTE após seu título (não pendente)
      if (triangleMap && level >= 2) {
        const triKey = detectTriangleKey(content);
        if (triKey) {
          const tData = triangleMap[triKey];
          if (tData) {
            result.push(
              <TrianguloPiramideInline
                key={`pyramid-${triKey}-${idx}`}
                data={tData}
                label={TRIANGLE_LABELS[triKey]}
                cellSize={cellSize}
                letras={letrasNome}
              />
            );
          }
        }
      }
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = trimmed.split('\n').filter(l => l.trim());
      result.push(
        <View key={idx} style={{ marginTop: 4, marginBottom: 8, paddingLeft: 12 }}>
          {listItems.map((item, i) => {
            const liText = item.replace(/^[-*•]\s+/, '');
            return (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ ...styles.bodyText, marginRight: 6, lineHeight: 1.75 }}>•</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...styles.bodyText, lineHeight: 1.75 }}>
                    {renderMarkdownPiece(liText, styles.bodyText, { fontFamily: 'Helvetica-Bold' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      );
      return;
    }

    // Parágrafo normal
    result.push(
      <Text key={idx} style={{ ...styles.bodyText, lineHeight: 1.75, textAlign: 'justify', marginBottom: 8 }}>
        {renderMarkdownPiece(trimmed, styles.bodyText, { fontFamily: 'Helvetica-Bold' })}
      </Text>
    );
  });

  return <View style={{ gap: 0 }}>{result}</View>;
}

// ── Componente: Pirâmide de um triângulo ──────────────────────────────────────
interface TrianguloData {
  tipo: string;
  linhas: number[][];
  arcanoRegente: number | null;
  sequenciasNegativas: string[];
}

// Detecta posições que participam de sequências de ≥3 números iguais consecutivos
function buildBloqueioPositions(linhas: number[][]): Set<string> {
  const set = new Set<string>();
  for (let li = 0; li < linhas.length; li++) {
    const row = linhas[li];
    let i = 0;
    while (i < row.length) {
      let j = i + 1;
      while (j < row.length && row[j] === row[i]) j++;
      if (j - i >= 3) {
        for (let k = i; k < j; k++) set.add(`${li}:${k}`);
      }
      i = j;
    }
  }
  return set;
}

// Helpers para injeção de triângulos inline
type TriangleKey = 'vida' | 'pessoal' | 'social' | 'destino';

interface TriangleMap {
  vida?: TrianguloData | null;
  pessoal?: TrianguloData | null;
  social?: TrianguloData | null;
  destino?: TrianguloData | null;
}

const TRIANGLE_LABELS: Record<TriangleKey, string> = {
  vida: 'Triangulo da Vida',
  pessoal: 'Triangulo Pessoal',
  social: 'Triangulo Social',
  destino: 'Triangulo do Destino',
};

function normalizeStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '');
}

function detectTriangleKey(content: string): TriangleKey | null {
  const norm = normalizeStr(content);
  if (!norm.includes('triangulo')) return null;
  if (norm.includes('vida')) return 'vida';
  if (norm.includes('pessoal')) return 'pessoal';
  if (norm.includes('social')) return 'social';
  if (norm.includes('destino')) return 'destino';
  return null;
}

// Triângulo inline — aparece dentro do fluxo da análise, largura total
function TrianguloPiramideInline({ data, label, cellSize, letras }: { data: TrianguloData; label: string; cellSize: number; letras?: string[] }) {
  const bloqueioPositions = buildBloqueioPositions(data.linhas);
  const cellFontSize = Math.max(4, Math.floor(cellSize * 0.65));
  const letterFontSize = Math.max(5, Math.floor(cellSize * 0.70));

  return (
    <View style={triStyles.card}>
      <Text style={triStyles.cardLabel}>{label}</Text>
      
      {letras && letras.length === data.linhas[0].length && (
        <View style={triStyles.row}>
          {letras.map((char, ni) => (
            <View key={`letra-${ni}`} style={{ width: cellSize, margin: 0.5, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 }}>
              <Text style={{ fontSize: letterFontSize, fontFamily: 'Helvetica-Bold', color: '#4B5563' }}>{char}</Text>
            </View>
          ))}
        </View>
      )}

      {data.linhas.map((linha, li) => (
        <View key={li} style={triStyles.row}>
          {linha.map((num, ni) => {
            const isBloqueio = bloqueioPositions.has(`${li}:${ni}`);
            const isFirstRow = li === 0;
            const isRegent = li === data.linhas.length - 1;

            let cellStyle = isBloqueio ? triStyles.cellBloqueio : triStyles.cellNormal;
            let textStyle = isBloqueio ? triStyles.cellTextBloqueio : triStyles.cellTextNormal;

            if (isFirstRow && !isBloqueio) {
              textStyle = { color: '#D4AF37' }; // Gold
            }
            if (isRegent && !isBloqueio) {
              textStyle = { color: '#a78bfa' }; // Purple
            }

            return (
              <View
                key={ni}
                style={[
                  triStyles.cellBase,
                  { width: cellSize, height: cellSize, margin: 0.5 },
                  cellStyle,
                ]}
              >
                <Text
                  style={[
                    { fontSize: cellFontSize, fontFamily: 'Helvetica-Bold' },
                    textStyle,
                  ]}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
      {data.arcanoRegente !== null && (
        <Text style={triStyles.arcano}>Arcano Regente: {data.arcanoRegente}</Text>
      )}
      {data.sequenciasNegativas.length > 0 && (
        <Text style={triStyles.bloqueioAlert}>
          Bloqueio: {data.sequenciasNegativas.join(', ')}
        </Text>
      )}
    </View>
  );
}

const triStyles = StyleSheet.create({
  card: {
    marginTop: 6,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    alignItems: 'stretch',
  },
  cardLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#D4AF37',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cellBase: {
    borderWidth: 0.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellNormal: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  cellBloqueio: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  cellTextNormal: {
    color: '#1F2937',
  },
  cellTextBloqueio: {
    color: '#DC2626',
  },
  arcano: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
  bloqueioAlert: {
    fontSize: 7,
    color: '#DC2626',
    marginTop: 3,
    textAlign: 'center',
  },
});

// ── Componente: Gráfico de frequências ───────────────────────────────────────
function FrequencyChart({ frequencias }: { frequencias: Record<string, number> }) {
  const entries = Object.entries(frequencias)
    .map(([k, v]) => ({ num: Number(k), count: v }))
    .filter(e => e.num >= 1 && e.num <= 8)
    .sort((a, b) => a.num - b.num);

  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(e => e.count), 1);

  return (
    <View style={{ marginTop: 8 }}>
      {entries.map(({ num, count }) => {
        const pct = (count / max) * 100;
        return (
          <View key={num} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 8, color: '#4B5563', width: 14, textAlign: 'right', marginRight: 6 }}>
              {num}
            </Text>
            <View style={{ flex: 1, height: 10, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
              <View
                style={{
                  width: `${pct}%`,
                  height: 10,
                  backgroundColor: '#a78bfa',
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={{ fontSize: 8, color: '#4B5563', width: 18, textAlign: 'right', marginLeft: 6 }}>
              {count}x
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Paleta ────────────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const DARK = '#1a1a1a';
const GRAY = '#4B5563';
const LIGHT_GRAY = '#E5E7EB';
const TEXT = '#1a1a1a';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    color: TEXT,
  },
  // Capa padrão (escura)
  coverPage: {
    backgroundColor: DARK,
    paddingTop: 80,
    paddingBottom: 56,
    paddingHorizontal: 48,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Capa nome_bebe (pastel suave de tom morno)
  coverPageBebe: {
    backgroundColor: '#FFF9F0',
    paddingTop: 80,
    paddingBottom: 56,
    paddingHorizontal: 48,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLogo: {
    fontSize: 30,
    color: GOLD,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  coverAccentLine: {
    width: 60,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 32,
  },
  coverProduct: {
    fontSize: 10,
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  coverTitleBebe: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1C1033',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 48,
  },
  coverMeta: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  coverBottomLine: {
    width: 60,
    height: 1,
    backgroundColor: GOLD,
    marginTop: 48,
    opacity: 0.5,
  },
  // Header fixo
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingBottom: 8,
    marginBottom: 24,
  },
  pageHeaderBrand: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1,
  },
  pageHeaderInfo: {
    fontSize: 8,
    color: GRAY,
    textAlign: 'right',
  },
  // Footer fixo
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
    paddingTop: 8,
  },
  pageFooterEmail: {
    fontSize: 8,
    color: GRAY,
  },
  pageFooterPage: {
    fontSize: 8,
    color: GRAY,
  },
  // Seções
  section: {
    marginBottom: 24,
  },
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
  // Grid de números
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  numberCard: {
    width: '18%',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    marginBottom: 2,
  },
  numberLabel: {
    fontSize: 7,
    color: GRAY,
    textAlign: 'center',
  },
  // Bloqueios
  bloqueioRow: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  bloqueioTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
    marginBottom: 2,
  },
  bloqueioDesc: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  // Débitos kármicos
  debitoRow: {
    backgroundColor: '#F5F3FF',
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  debitoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#5B21B6',
    marginBottom: 2,
  },
  debitoDesc: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  debitoNoneBox: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 8,
    borderRadius: 4,
  },
  debitoNoneText: {
    fontSize: 9,
    color: '#065F46',
  },
  // Lições Kármicas
  licaoRow: {
    backgroundColor: 'rgba(56,189,248,0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  licaoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 2,
  },
  licaoDesc: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  // Tendências Ocultas
  tendenciaRow: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#a78bfa',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  tendenciaTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6d28d9',
    marginBottom: 2,
  },
  tendenciaDesc: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  // Texto corrido
  bodyText: {
    fontSize: 10,
    color: TEXT,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  // Tabela de nomes
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: GOLD,
    padding: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
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
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 8,
    color: TEXT,
  },
  colNome: { width: '40%' },
  colNum: { width: '15%', textAlign: 'center' },
  colScore: { width: '15%', textAlign: 'center' },
  colJustificativa: { width: '30%' },
  // Conclusão
  conclusaoCard: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFDF0',
    marginTop: 8,
  },
  // Folha de treino de assinatura
  assinaturaPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    color: TEXT,
  },
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
  assinaturaLinhaLabel: {
    fontSize: 7,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  assinaturaLinha: {
    height: 0.5,
    backgroundColor: '#C5C5C5',
    marginBottom: 32,
  },
});

interface Bloqueio {
  codigo: string;
  titulo: string;
  descricao: string;
}

interface DebitoCarmicoInfo {
  numero: number;
  titulo: string;
  descricao: string;
}

interface MagneticName {
  nome_sugerido: string;
  numero_expressao: number | null;
  numero_motivacao: number | null;
  score: number;
  justificativa?: string | null;
}

interface Analysis {
  nome_completo: string;
  data_nascimento: string;
  product_type: string;
  numero_expressao: number | null;
  numero_destino: number | null;
  numero_motivacao: number | null;
  numero_missao: number | null;
  numero_personalidade: number | null;
  bloqueios: Bloqueio[];
  debitos_carmicos?: DebitoCarmicoInfo[] | null;
  licoes_carmicas?: { numero: number; titulo: string; descricao: string }[] | null;
  tendencias_ocultas?: { numero: number; titulo: string; descricao: string; frequencia: number }[] | null;
  frequencias_numeros?: Record<string, number> | null;
  triangulo_vida?: TrianguloData | null;
  triangulo_pessoal?: TrianguloData | null;
  triangulo_social?: TrianguloData | null;
  triangulo_destino?: TrianguloData | null;
  analise_texto: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Props {
  analysis: Analysis;
  magneticNames: MagneticName[];
  userName?: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    if (dateStr.includes('T')) {
      // Tem hora — converter para data local (evita +1 dia por UTC)
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    // Só data (YYYY-MM-DD) — split direto para evitar conversão UTC→local
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

function productLabel(productType: string): string {
  const map: Record<string, string> = {
    nome_magnetico: 'Análise de Nome Social',
    nome_bebe: 'Análise de Nome para Bebê',
    nome_empresa: 'Análise de Nome Empresarial',
  };
  return map[productType] ?? 'Análise Numerológica';
}

/** Extrai o último bloco de conclusão (## ... 6. Conclusão ... até o fim) */
function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:6\.|conclus)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

export function AnalysePDF({ analysis, magneticNames, userName }: Props) {
  const isBebe = analysis.product_type === 'nome_bebe';
  const freqData = analysis.frequencias_numeros as any;
  // Para nome_bebe: usar o nome do melhor candidato em vez de "(bebê) Sobrenome"
  const nomeParaExibir = isBebe
    ? (freqData?.ranking?.melhorNome?.nomeCompleto ?? analysis.nome_completo)
    : analysis.nome_completo;
  const firstName = nomeParaExibir.split(' ')[0];
  const tipoAnalise = productLabel(analysis.product_type);
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);
  const dataNascimento = formatDate(analysis.data_nascimento);

  const letrasNome = nomeParaExibir.replace(/\s+/g, '').replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '').toUpperCase().split('');
  
  let logoSrc = '';
  try {
    const candidatePath = path.resolve(process.cwd(), 'src/frontend/assets/logo-nome-magnético-v4.png');
    if (fs.existsSync(candidatePath)) {
      logoSrc = `data:image/png;base64,${fs.readFileSync(candidatePath).toString('base64')}`;
    }
  } catch (e) {
    // Ignore error
  }

  const nums = [
    { label: 'Expressao', value: analysis.numero_expressao },
    { label: 'Destino', value: analysis.numero_destino },
    { label: 'Motivacao', value: analysis.numero_motivacao },
    { label: 'Missao', value: analysis.numero_missao },
    { label: 'Impressao', value: analysis.numero_personalidade },
  ];

  const bloqueios: Bloqueio[] = Array.isArray(analysis.bloqueios)
    ? (analysis.bloqueios as Bloqueio[])
    : [];

  const debitos: DebitoCarmicoInfo[] | null = Array.isArray(analysis.debitos_carmicos)
    ? (analysis.debitos_carmicos as DebitoCarmicoInfo[])
    : null;

  const licoes = Array.isArray(analysis.licoes_carmicas)
    ? (analysis.licoes_carmicas as any[])
    : null;

  const tendencias = Array.isArray(analysis.tendencias_ocultas)
    ? (analysis.tendencias_ocultas as any[])
    : null;

  // Para nome_bebe: frequencias_numeros é { ranking, frequencias }; para outros: Record<string, number>
  const frequencias: Record<string, number> | null =
    freqData?.frequencias ?? (freqData && !freqData?.ranking ? freqData : null);

  const tVida    = analysis.triangulo_vida    ?? null;
  const tPessoal = analysis.triangulo_pessoal ?? null;
  const tSocial  = analysis.triangulo_social  ?? null;
  const tDestino = analysis.triangulo_destino ?? null;
  const hasTriangulos = !!(tVida || tPessoal || tSocial || tDestino);

  // Calcula cellSize para triângulos inline (full-width, ~430pt disponíveis)
  const TRIANGLE_FULL_WIDTH = 430;
  const baseLen = Math.max(
    tVida?.linhas[0]?.length ?? 1,
    tPessoal?.linhas[0]?.length ?? 1,
    tSocial?.linhas[0]?.length ?? 1,
    tDestino?.linhas[0]?.length ?? 1,
  );
  const triCellSize = Math.min(18, Math.max(5, Math.floor(TRIANGLE_FULL_WIDTH / baseLen) - 1));
  const triangleMap: TriangleMap | undefined = hasTriangulos
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
    <Document title={`Nome Magnetico — ${analysis.nome_completo}`} author="Nome Magnetico">
      {/* === PÁGINA 1: CAPA === */}
      <Page size="A4" style={isBebe ? styles.coverPageBebe : styles.coverPage}>
        {logoSrc ? (
          <Image src={logoSrc} style={{ width: 80, marginBottom: 16 }} />
        ) : null}
        <Text style={[styles.coverLogo, { fontFamily: LOGO_FONT }]}>NOME MAGNETICO</Text>
        <View style={styles.coverAccentLine} />
        <Text style={styles.coverProduct}>{tipoAnalise}</Text>
        <Text style={isBebe ? styles.coverTitleBebe : styles.coverTitle}>{nomeParaExibir}</Text>
        <Text style={styles.coverSubtitle}>Numerologia Cabalística</Text>
        <View style={styles.coverBottomLine} />
        <Text style={styles.coverMeta}>Data de nascimento: {dataNascimento}</Text>
        <Text style={styles.coverMeta}>Gerado em: {dataGeracao}</Text>
      </Page>

      {/* === PÁGINA 2: NÚMEROS + GRÁFICO + BLOQUEIOS + LIÇÕES === */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader} fixed>
          <Text style={styles.pageHeaderBrand}>NOME MAGNETICO</Text>
          <Text style={styles.pageHeaderInfo}>{nomeParaExibir} — {tipoAnalise}</Text>
        </View>

        {/* Os 5 Números */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Os 5 Números Numerológicos</Text>
          <View style={styles.numbersGrid}>
            {nums.map(n => (
              <View key={n.label} style={styles.numberCard}>
                <Text style={styles.numberValue}>{n.value ?? '?'}</Text>
                <Text style={styles.numberLabel}>{n.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bloqueios */}
        {bloqueios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bloqueios Detectados ({bloqueios.length})</Text>
            {bloqueios.map((b, i) => (
              <View key={i} style={styles.bloqueioRow}>
                <Text style={styles.bloqueioTitle}>{b.codigo} — {b.titulo}</Text>
                <Text style={styles.bloqueioDesc}>{b.descricao}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Débitos Kármicos */}
        {debitos !== null && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: '#7C3AED', borderBottomColor: '#7C3AED' }}>Débitos Kármicos</Text>
            {debitos.length === 0 ? (
              <View style={styles.debitoNoneBox}>
                <Text style={styles.debitoNoneText}>Nenhum débito kármico detectado — alma sem pendências de encarnações passadas.</Text>
              </View>
            ) : (
              debitos.map((d, i) => (
                <View key={i} style={styles.debitoRow}>
                  <Text style={styles.debitoTitle}>{capitalizeTitle(d.titulo)}</Text>
                  <Text style={styles.debitoDesc}>{d.descricao}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Lições Kármicas */}
        {licoes !== null && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: '#38bdf8', borderBottomColor: '#38bdf8' }}>Lições Kármicas</Text>
            {licoes.length === 0 ? (
               <View style={{ ...styles.debitoNoneBox, backgroundColor: 'rgba(56,189,248,0.05)', borderLeftColor: '#38bdf8' }}>
                 <Text style={{ ...styles.debitoNoneText, color: '#0369a1' }}>Nenhuma lição kármica pendente detectada para ausência de números neste nome.</Text>
               </View>
            ) : licoes.map((l, i) => (
              <View key={i} style={styles.licaoRow}>
                <Text style={styles.licaoTitle}>{capitalizeTitle(l.titulo)}</Text>
                <Text style={styles.licaoDesc}>{l.descricao}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tendências Ocultas + Gráfico */}
        {tendencias !== null && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: '#a78bfa', borderBottomColor: '#a78bfa' }}>Tendências Ocultas</Text>

            {frequencias && Object.keys(frequencias).length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#6d28d9', marginBottom: 6 }}>
                  Frequência dos Números
                </Text>
                <FrequencyChart frequencias={frequencias} />
              </View>
            )}

            {tendencias.length === 0 ? (
              <View style={{ ...styles.debitoNoneBox, backgroundColor: 'rgba(167,139,250,0.1)', borderLeftColor: '#a78bfa' }}>
                 <Text style={{ ...styles.debitoNoneText, color: '#6d28d9' }}>Nenhuma tendência oculta detectada — nenhum número se repete excessivamente no nome.</Text>
              </View>
            ) : tendencias.map((t, i) => (
              <View key={i} style={styles.tendenciaRow}>
                <Text style={styles.tendenciaTitle}>{capitalizeTitle(t.titulo)} (Frequência: {t.frequencia}x)</Text>
                <Text style={styles.tendenciaDesc}>{t.descricao}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
          <Text
            style={styles.pageFooterPage}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* === PÁGINA(S) DE ANÁLISE COMPLETA (triângulos injetados inline sob seus títulos) === */}
      {analiseCorpo && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader} fixed>
            <Text style={styles.pageHeaderBrand}>NOME MAGNETICO</Text>
            <Text style={styles.pageHeaderInfo}>{nomeParaExibir} — Análise Completa</Text>
          </View>

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

          <View style={styles.pageFooter} fixed>
            <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
            <Text
              style={styles.pageFooterPage}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* PÁGINA ESPECÍFICA PARA OS 4 TRIÂNGULOS (Bebe) */}
      {isBebe && hasTriangulos && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader} fixed>
            <Text style={styles.pageHeaderBrand}>NOME MAGNETICO</Text>
            <Text style={styles.pageHeaderInfo}>{nomeParaExibir} — Os 4 Triângulos Numerológicos</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estudo dos 4 Triângulos</Text>
            <Text style={{ ...styles.bodyText, marginBottom: 16 }}>
              Os Quatro Triângulos Numerológicos revelam a estrutura energética profunda do nome. Cada triângulo rege uma área específica da vida e o fluxo de energia ao longo do tempo.
            </Text>

            {tVida && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...styles.sectionTitle, fontSize: 11, borderBottomWidth: 0, paddingBottom: 0, marginBottom: 4 }}>Triângulo da Vida</Text>
                <Text style={{ fontSize: 9, color: GRAY, marginBottom: 6 }}>Representa os aspectos gerais e a vibração matriz do nome.</Text>
                <TrianguloPiramideInline data={tVida} label="Triângulo da Vida" cellSize={triCellSize} letras={letrasNome} />
              </View>
            )}
            {tPessoal && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...styles.sectionTitle, fontSize: 11, borderBottomWidth: 0, paddingBottom: 0, marginBottom: 4 }}>Triângulo Pessoal</Text>
                <Text style={{ fontSize: 9, color: GRAY, marginBottom: 6 }}>Revela a vida íntima, as reações emocionais e comportamentos mais profundos.</Text>
                <TrianguloPiramideInline data={tPessoal} label="Triângulo Pessoal" cellSize={triCellSize} letras={letrasNome} />
              </View>
            )}
            {tSocial && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...styles.sectionTitle, fontSize: 11, borderBottomWidth: 0, paddingBottom: 0, marginBottom: 4 }}>Triângulo Social</Text>
                <Text style={{ fontSize: 9, color: GRAY, marginBottom: 6 }}>Mostra as influências externas, amizades, ambiente de trabalho e vida pública.</Text>
                <TrianguloPiramideInline data={tSocial} label="Triângulo Social" cellSize={triCellSize} letras={letrasNome} />
              </View>
            )}
            {tDestino && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ ...styles.sectionTitle, fontSize: 11, borderBottomWidth: 0, paddingBottom: 0, marginBottom: 4 }}>Triângulo do Destino</Text>
                <Text style={{ fontSize: 9, color: GRAY, marginBottom: 6 }}>Governa a missão de vida, realizações a longo prazo e legado final.</Text>
                <TrianguloPiramideInline data={tDestino} label="Triângulo do Destino" cellSize={triCellSize} letras={letrasNome} />
              </View>
            )}
          </View>

          <View style={styles.pageFooter} fixed>
            <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
            <Text
              style={styles.pageFooterPage}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* === PÁGINA DE CONCLUSÃO === */}
      {conclusaoTexto && conclusaoTexto.length > 100 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader} fixed>
            <Text style={styles.pageHeaderBrand}>NOME MAGNETICO</Text>
            <Text style={styles.pageHeaderInfo}>{nomeParaExibir} — Conclusão</Text>
          </View>

          <View style={styles.conclusaoCard}>
            <RenderMarkdownChunks text={conclusaoTexto} styles={styles} GOLD={GOLD} />
          </View>

          <View style={styles.pageFooter} fixed>
            <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
            <Text
              style={styles.pageFooterPage}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}
      {/* === PÁGINA DE RANKING (exclusivo nome_bebe) === */}
      {isBebe && freqData?.ranking?.nomesCandidatos?.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader} fixed>
            <Text style={styles.pageHeaderBrand}>NOME MAGNETICO</Text>
            <Text style={styles.pageHeaderInfo}>{nomeParaExibir} — Ranking dos Candidatos</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ranking dos Nomes Candidatos</Text>

            {/* Cabeçalho da tabela */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNome]}>Nome</Text>
              <Text style={[styles.tableHeaderCell, styles.colScore]}>Score</Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>Expressao</Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>Motiv.</Text>
              <Text style={[styles.tableHeaderCell, styles.colJustificativa]}>Compatibilidade</Text>
            </View>

            {(freqData.ranking.nomesCandidatos as any[]).map((c: any, i: number) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, styles.colNome, i === 0 ? { fontFamily: 'Helvetica-Bold', color: GOLD } : {}]}>
                  {i === 0 ? `★ ${c.primeiroNome}` : c.primeiroNome}
                </Text>
                <Text style={[styles.tableCell, styles.colScore, { textAlign: 'center', color: c.score >= 70 ? '#059669' : c.score >= 40 ? '#D97706' : '#DC2626', fontFamily: 'Helvetica-Bold' }]}>
                  {c.score}%
                </Text>
                <Text style={[styles.tableCell, styles.colNum, { textAlign: 'center' }]}>{c.expressao}</Text>
                <Text style={[styles.tableCell, styles.colNum, { textAlign: 'center' }]}>{c.motivacao}</Text>
                <Text style={[styles.tableCell, styles.colJustificativa, { color: c.compatibilidade === 'total' ? '#059669' : c.compatibilidade === 'complementar' ? GOLD : c.compatibilidade === 'aceitavel' ? '#D97706' : '#DC2626' }]}>
                  {c.compatibilidade}{c.temBloqueio ? ` · ${c.bloqueios?.length}x bloq.` : ''}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.pageFooter} fixed>
            <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
            <Text
              style={styles.pageFooterPage}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* === PÁGINA FINAL: TREINO DE ASSINATURA === */}
      {!isBebe && (
        <Page size="A4" style={styles.assinaturaPage}>
          <Text style={styles.assinaturaTitle}>Folha de Treino de Assinatura</Text>
          <Text style={styles.assinaturaNome}>{nomeParaExibir}</Text>

          <View style={styles.assinaturaInstrucoesBox}>
            <Text style={styles.assinaturaInstrucoesTitle}>Como criar uma assinatura de alto poder energetico</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Nunca cruze tracos por cima das letras — linhas cortantes bloqueiam o fluxo energetico da assinatura.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Inclinacao levemente ascendente (da esquerda para a direita) transmite ambicao e crescimento positivo.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Evite tracados que descem abruptamente ao final — simbolizam queda ou fechamento de ciclos de forma negativa.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• A assinatura deve ser legivel o suficiente para reconhecer as letras principais do seu nome magnetico.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Termine com um tracado que fecha o nome sem corte — pode ser uma curva suave ascendente ou um ponto de energia.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Pratique ate que o movimento se torne fluido e natural — a assinatura deve expressar confianca e leveza.</Text>
            <Text style={styles.assinaturaInstrucaoItem}>• Escreva lentamente no inicio, focando na intencao de cada letra. Com o tempo, acelere para que o fluxo seja espontaneo.</Text>
          </View>

          {/* 13 linhas de treino (preenche a folha A4 e deixa espaço para o footer) */}
          {Array.from({ length: 13 }).map((_, i) => (
            <View key={i} style={styles.assinaturaLinha} />
          ))}

          <View style={styles.pageFooter} fixed>
            <Text style={styles.pageFooterEmail}>contato@nomemagnetico.com.br</Text>
            <Text
              style={styles.pageFooterPage}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}
    </Document>
  );
}
