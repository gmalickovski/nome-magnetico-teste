/**
 * PDFMarkdownRenderer — converte texto Markdown em componentes @react-pdf/renderer.
 *
 * Injeção automática de elementos gráficos após headings correspondentes:
 *  - Triângulos numerológicos → sob headings "Triângulo da Vida / Pessoal / Social / Destino"
 *  - Bloqueios energéticos    → sob headings que mencionem "Bloqueio" / "Raio-X"
 *  - Débitos + Lições         → sob headings que mencionem "Karma" / "Peso do Passado" / "Lição"
 *  - Tendências Ocultas       → sob headings que mencionem "Tendência" / "Oculta"
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import {
  BloqueiosBlock,
  DebitosBlock,
  LicoesBlock,
  TendenciasBlock,
  type BloqueioData,
  type DebitoData,
  type LicaoData,
  type TendenciaData,
} from './PDFKarmicBlock';

// ── Helpers de texto ──────────────────────────────────────────────────────────

/** Remove emojis Unicode — @react-pdf não suporta a maioria */
export function stripEmoji(str: string): string {
  return str
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,
      ''
    )
    .replace(/\s{2,}/g, ' ');
}

export function stripEmojiTrim(str: string): string {
  return stripEmoji(str).trim();
}

/** Renderiza um trecho de texto com suporte a **bold** */
export function renderMarkdownPiece(
  text: string,
  baseStyle: any,
  boldStyle: any
): React.ReactNode[] {
  const rawParts = text.split(/\*\*([^*]+)\*\*/g);

  // Mover espaços nas fronteiras para dentro do elemento bold (fix de react-pdf)
  const parts = [...rawParts];
  for (let i = 1; i < parts.length; i += 2) {
    if (i - 1 >= 0 && parts[i - 1].endsWith(' ')) {
      parts[i] = ' ' + parts[i];
      parts[i - 1] = parts[i - 1].slice(0, -1);
    }
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

// ── Detecção de seções para injeção inline ────────────────────────────────────

type TriangleKey = 'vida' | 'pessoal' | 'social' | 'destino';
type KarmicKey = 'bloqueios' | 'karma' | 'tendencias';

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '');
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

function detectKarmicKey(content: string): KarmicKey | null {
  const norm = normalizeStr(content);
  if (
    norm.includes('bloqueio') ||
    norm.includes('raio x') ||
    norm.includes('raio-x') ||
    norm.includes('sequencia negativa')
  )
    return 'bloqueios';
  if (
    norm.includes('karma') ||
    norm.includes('licao') ||
    norm.includes('peso do passado') ||
    norm.includes('debito') ||
    norm.includes('passado')
  )
    return 'karma';
  if (norm.includes('tendencia') || norm.includes('oculta') || norm.includes('frequencia'))
    return 'tendencias';
  return null;
}

// ── Componente: Pirâmide de triângulo inline ──────────────────────────────────

export interface TrianguloData {
  tipo: string;
  linhas: number[][];
  arcanoRegente: number | null;
  sequenciasNegativas: string[];
}

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

export function TrianguloPiramideInline({
  data,
  label,
  cellSize,
  letras,
}: {
  data: TrianguloData;
  label: string;
  cellSize: number;
  letras?: string[];
}) {
  const bloqueioPositions = buildBloqueioPositions(data.linhas);
  const cellFontSize = Math.max(4, Math.floor(cellSize * 0.65));
  const letterFontSize = Math.max(5, Math.floor(cellSize * 0.7));

  return (
    <View style={triStyles.card}>
      <Text style={triStyles.cardLabel}>{label}</Text>

      {letras && letras.length === data.linhas[0].length ? (
        <View style={triStyles.row}>
          {letras.map((char, ni) => (
            <View
              key={`letra-${ni}`}
              style={{
                width: cellSize,
                margin: 0.5,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: letterFontSize,
                  fontFamily: 'Helvetica-Bold',
                  color: '#4B5563',
                }}
              >
                {char}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.linhas.map((linha, li) => (
        <View key={li} style={triStyles.row}>
          {linha.map((num, ni) => {
            const isBloqueio = bloqueioPositions.has(`${li}:${ni}`);
            const isFirstRow = li === 0;
            const isRegent = li === data.linhas.length - 1;

            const cellStyle = isBloqueio ? triStyles.cellBloqueio : triStyles.cellNormal;
            let textColor = isBloqueio ? '#DC2626' : '#1F2937';
            if (isFirstRow && !isBloqueio) textColor = '#D4AF37';
            if (isRegent && !isBloqueio) textColor = '#a78bfa';

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
                  style={{
                    fontSize: cellFontSize,
                    fontFamily: 'Helvetica-Bold',
                    color: textColor,
                  }}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        </View>
      ))}

      {data.arcanoRegente !== null ? (
        <Text style={triStyles.arcano}>Arcano Regente: {data.arcanoRegente}</Text>
      ) : null}
      {data.sequenciasNegativas.length > 0 ? (
        <Text style={triStyles.bloqueioAlert}>
          Bloqueio: {data.sequenciasNegativas.join(', ')}
        </Text>
      ) : null}
    </View>
  );
}

// ── Tipos para o renderer ─────────────────────────────────────────────────────

export interface TriangleMap {
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

// ── Rastro de injeção (para não injetar o mesmo bloco duas vezes) ─────────────
// Quando uma seção kármica é detectada, registra para não duplicar.
type InjectionState = {
  bloqueiosInjetados: boolean;
  karmaInjetado: boolean;
  tendenciasInjetadas: boolean;
};

// ── Componente principal ──────────────────────────────────────────────────────

interface RenderMarkdownChunksProps {
  text: string;
  styles: any;
  GOLD: string;
  triangleMap?: TriangleMap;
  triCellSize?: number;
  letrasNome?: string[];
  // Dados para injeção inline de blocos kármicos
  bloqueios?: BloqueioData[];
  debitos?: DebitoData[];
  licoes?: LicaoData[];
  tendencias?: TendenciaData[];
  frequencias?: Record<string, number> | null;
}

export function RenderMarkdownChunks({
  text,
  styles,
  GOLD,
  triangleMap,
  triCellSize,
  letrasNome,
  bloqueios,
  debitos,
  licoes,
  tendencias,
  frequencias,
}: RenderMarkdownChunksProps) {
  if (!text) return null;

  const cellSize = triCellSize ?? 14;
  const result: React.ReactNode[] = [];

  // Estado de injeção: cada tipo de bloco é injetado apenas 1 vez
  const injectionState: InjectionState = {
    bloqueiosInjetados: false,
    karmaInjetado: false,
    tendenciasInjetadas: false,
  };

  const blocks = text.split(/\n\s*\n/);

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // ── Headings ──────────────────────────────────────────────────────────────
    const matchHeader = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (matchHeader) {
      const level = matchHeader[1].length;
      const content = stripEmojiTrim(matchHeader[2]);
      const fontSize = level === 1 ? 20 : level === 2 ? 15 : level === 3 ? 12 : 10;
      const color = level >= 3 ? (level === 4 ? '#F59E0B' : '#a78bfa') : GOLD;
      const marginTop = level === 1 ? 20 : level === 2 ? 14 : level === 3 ? 10 : 6;
      const marginBottom = level === 1 ? 10 : level === 2 ? 7 : level === 3 ? 5 : 3;

      result.push(
        <Text
          key={idx}
          style={{
            fontSize,
            fontFamily: 'Helvetica-Bold',
            color,
            marginTop: result.length === 0 ? 0 : marginTop,
            marginBottom,
            letterSpacing: level <= 2 ? 0.4 : 0,
          }}
        >
          {content}
        </Text>
      );

      // ── Injeção: Triângulos ───────────────────────────────────────────────
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

      // ── Injeção: Bloqueios ───────────────────────────────────────────────
      if (bloqueios && !injectionState.bloqueiosInjetados && level >= 2) {
        const kKey = detectKarmicKey(content);
        if (kKey === 'bloqueios') {
          injectionState.bloqueiosInjetados = true;
          result.push(
            <BloqueiosBlock key={`bloqueios-${idx}`} bloqueios={bloqueios} />
          );
        }
      }

      // ── Injeção: Débitos + Lições ─────────────────────────────────────────
      if (!injectionState.karmaInjetado && level >= 2) {
        const kKey = detectKarmicKey(content);
        if (kKey === 'karma') {
          injectionState.karmaInjetado = true;
          if (debitos && debitos.length >= 0) {
            result.push(<DebitosBlock key={`debitos-${idx}`} debitos={debitos} />);
          }
          if (licoes && licoes.length >= 0) {
            result.push(<LicoesBlock key={`licoes-${idx}`} licoes={licoes} />);
          }
        }
      }

      // ── Injeção: Tendências ───────────────────────────────────────────────
      if (tendencias && !injectionState.tendenciasInjetadas && level >= 2) {
        const kKey = detectKarmicKey(content);
        if (kKey === 'tendencias') {
          injectionState.tendenciasInjetadas = true;
          result.push(
            <TendenciasBlock
              key={`tendencias-${idx}`}
              tendencias={tendencias}
              frequencias={frequencias}
            />
          );
        }
      }

      return;
    }

    // ── Listas ─────────────────────────────────────────────────────────────────
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = trimmed.split('\n').filter(l => l.trim());
      result.push(
        <View key={idx} style={{ marginTop: 4, marginBottom: 6, paddingLeft: 12 }}>
          {listItems.map((item, i) => {
            const liText = item.replace(/^[-*•]\s+/, '');
            return (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={{ ...styles.bodyText, marginRight: 6, lineHeight: 1.4 }}>•</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...styles.bodyText, lineHeight: 1.4 }}>
                    {renderMarkdownPiece(liText, styles.bodyText, {
                      fontFamily: 'Helvetica-Bold',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      );
      return;
    }

    // ── Parágrafo normal ───────────────────────────────────────────────────────
    result.push(
      <Text
        key={idx}
        style={{ ...styles.bodyText, lineHeight: 1.5, textAlign: 'justify', marginBottom: 8 }}
      >
        {renderMarkdownPiece(trimmed, styles.bodyText, { fontFamily: 'Helvetica-Bold' })}
      </Text>
    );
  });

  return <View style={{ gap: 0 }}>{result}</View>;
}
