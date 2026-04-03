/**
 * PDFCover — página de capa com identidade visual diferente por produto.
 *
 * Layout fixo (mesma estrutura nos 3 produtos):
 *   Logo → Linha accent → Tipo de análise → Nome em destaque → Subtítulo → Metadados
 *
 * O que varia: cor de fundo, cor do texto, shapes SVG decorativos de fundo.
 *
 * Shapes por produto:
 *   nome_social  → estrela de 5 pontas dourada + mandala circular translúcida
 *   nome_bebe    → lua crescente + círculos concêntricos suaves em rose-gold
 *   nome_empresa → hexágonos + linhas geométricas em azul corporativo
 */
import { Page, View, Text, Svg, Circle, Path, Line, Polygon, StyleSheet, Image } from '@react-pdf/renderer';
import type { ProductTheme, CoverShapeStyle } from './PDFTheme';

// ── Shapes SVG ────────────────────────────────────────────────────────────────

/** Estrela de 5 pontas — Nome Social */
function SocialShapes({ color }: { color: string }) {
  // Pontos de uma estrela de 5 pontas centrada em (297, 420) — centro da página A4
  // Raio externo: 180, raio interno: 75
  const cx = 297;
  const cy = 400;
  const R = 180;
  const r = 75;
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? R : r;
    pts.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  const starPoints = pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <Svg
      width="595"
      height="842"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Estrela central translúcida */}
      <Polygon
        points={starPoints}
        fill={color}
        fillOpacity={0.05}
        stroke={color}
        strokeOpacity={0.15}
        strokeWidth={1}
      />
      {/* Círculo externo */}
      <Circle
        cx={cx}
        cy={cy}
        r={R + 20}
        fill="none"
        stroke={color}
        strokeOpacity={0.08}
        strokeWidth={0.8}
      />
      {/* Círculo interno */}
      <Circle
        cx={cx}
        cy={cy}
        r={r - 10}
        fill="none"
        stroke={color}
        strokeOpacity={0.12}
        strokeWidth={0.8}
      />
      {/* Segundo anel externo */}
      <Circle
        cx={cx}
        cy={cy}
        r={R + 55}
        fill="none"
        stroke={color}
        strokeOpacity={0.05}
        strokeWidth={0.5}
      />
      {/* Mandala: 8 linhas radiais */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI / 4) * i;
        const x1 = cx + (r - 10) * Math.cos(angle);
        const y1 = cy + (r - 10) * Math.sin(angle);
        const x2 = cx + (R + 20) * Math.cos(angle);
        const y2 = cy + (R + 20) * Math.sin(angle);
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeOpacity={0.07}
            strokeWidth={0.5}
          />
        );
      })}
    </Svg>
  );
}

/** Lua crescente + círculos suaves — Nome Bebê */
function BebeShapes({ color }: { color: string }) {
  return (
    <Svg
      width="595"
      height="842"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Círculos concêntricos suaves no canto superior direito */}
      <Circle cx={480} cy={120} r={160} fill={color} fillOpacity={0.05} stroke={color} strokeOpacity={0.08} strokeWidth={0.8} />
      <Circle cx={480} cy={120} r={110} fill={color} fillOpacity={0.04} stroke={color} strokeOpacity={0.06} strokeWidth={0.6} />
      <Circle cx={480} cy={120} r={60} fill={color} fillOpacity={0.06} stroke={color} strokeOpacity={0.10} strokeWidth={0.8} />

      {/* Lua crescente no centro-baixo — feita com 2 círculos (clipPath visual) */}
      {/* Círculo maior (corpo da lua) */}
      <Circle cx={297} cy={440} r={90} fill={color} fillOpacity={0.08} stroke={color} strokeOpacity={0.12} strokeWidth={1} />
      {/* Sobreposição (corte da lua) — círculo sobreposto em cor de fundo */}
      <Circle cx={330} cy={428} r={80} fill="#FFF5F0" fillOpacity={0.95} />

      {/* Estrelinhas decorativas */}
      {[
        [110, 180, 4],
        [200, 120, 3],
        [390, 90, 5],
        [450, 220, 3],
        [140, 320, 3],
        [500, 340, 4],
        [80, 420, 3],
        [520, 500, 3],
      ].map(([x, y, r], i) => (
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={color}
          fillOpacity={0.2}
          stroke={color}
          strokeOpacity={0.3}
          strokeWidth={0.5}
        />
      ))}

      {/* Círculos concêntricos no canto inferior esquerdo */}
      <Circle cx={115} cy={720} r={130} fill="none" stroke={color} strokeOpacity={0.06} strokeWidth={0.6} />
      <Circle cx={115} cy={720} r={80} fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={0.6} />
      <Circle cx={115} cy={720} r={40} fill={color} fillOpacity={0.05} stroke={color} strokeOpacity={0.1} strokeWidth={0.8} />
    </Svg>
  );
}

/** Hexágonos + linhas — Nome Empresa */
function EmpresaShapes({ color, accentColor }: { color: string; accentColor: string }) {
  // Função para pontos de um hexágono regular
  function hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  }

  return (
    <Svg
      width="595"
      height="842"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Linhas diagonais de grade */}
      {[-60, 0, 60, 120, 180, 240, 300, 360, 420].map((y, i) => (
        <Line
          key={`line-${i}`}
          x1={0}
          y1={y}
          x2={595}
          y2={y + 80}
          stroke={color}
          strokeOpacity={0.04}
          strokeWidth={0.6}
        />
      ))}

      {/* Hexágonos principais — cluster inferior direito */}
      <Polygon points={hexPoints(440, 620, 80)} fill={color} fillOpacity={0.05} stroke={color} strokeOpacity={0.12} strokeWidth={0.8} />
      <Polygon points={hexPoints(510, 550, 55)} fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={0.5} />
      <Polygon points={hexPoints(370, 560, 50)} fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={0.5} />
      <Polygon points={hexPoints(475, 690, 45)} fill="none" stroke={color} strokeOpacity={0.06} strokeWidth={0.5} />

      {/* Hexágonos acento — cluster superior esquerdo */}
      <Polygon points={hexPoints(120, 160, 70)} fill={accentColor} fillOpacity={0.04} stroke={accentColor} strokeOpacity={0.10} strokeWidth={0.7} />
      <Polygon points={hexPoints(55, 220, 45)} fill="none" stroke={accentColor} strokeOpacity={0.07} strokeWidth={0.5} />
      <Polygon points={hexPoints(190, 210, 40)} fill="none" stroke={accentColor} strokeOpacity={0.07} strokeWidth={0.5} />

      {/* Linha horizontal central accent */}
      <Line x1={0} y1={421} x2={595} y2={421} stroke={accentColor} strokeOpacity={0.06} strokeWidth={0.5} />

      {/* Ponto accent central */}
      <Circle cx={297} cy={421} r={3} fill={accentColor} fillOpacity={0.15} />
    </Svg>
  );
}

// ── Componente de capa ────────────────────────────────────────────────────────

function CoverShapes({
  style,
  primaryColor,
  accentColor,
}: {
  style: CoverShapeStyle;
  primaryColor: string;
  accentColor: string;
}) {
  if (style === 'social') return <SocialShapes color={primaryColor} />;
  if (style === 'bebe') return <BebeShapes color={primaryColor} />;
  return <EmpresaShapes color={primaryColor} accentColor={accentColor} />;
}

const coverStyles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: 48,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    width: 72,
    marginBottom: 16,
  },
  brand: {
    fontSize: 28,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  accentLine: {
    width: 64,
    height: 2,
    marginBottom: 32,
  },
  productType: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 48,
  },
  bottomLine: {
    width: 64,
    height: 1,
    marginTop: 48,
    opacity: 0.4,
  },
  meta: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

interface PDFCoverProps {
  theme: ProductTheme;
  nomeParaExibir: string;
  dataNascimento: string;
  dataGeracao: string;
  logoSrc?: string;
  logoFont?: string;
  titleFont?: string;
}

export function PDFCover({
  theme,
  nomeParaExibir,
  dataNascimento,
  dataGeracao,
  logoSrc,
  logoFont = 'Helvetica-Bold',
  titleFont = 'Helvetica-Bold',
}: PDFCoverProps) {
  return (
    <Page
      size="A4"
      style={[coverStyles.page, { backgroundColor: theme.coverBgColor }]}
    >
      {/* Shapes decorativos de fundo */}
      <CoverShapes
        style={theme.coverShapeStyle}
        primaryColor={theme.primaryColor}
        accentColor={theme.accentColor}
      />

      {/* Logo da marca */}
      {logoSrc ? (
        <Image src={logoSrc} style={coverStyles.logo} />
      ) : null}

      {/* Nome da marca */}
      <Text
        style={[coverStyles.brand, { color: theme.coverLogoColor, fontFamily: logoFont }]}
      >
        NOME MAGNETICO
      </Text>

      {/* Linha accent */}
      <View style={[coverStyles.accentLine, { backgroundColor: theme.primaryColor }]} />

      {/* Tipo do produto */}
      <Text style={[coverStyles.productType, { color: theme.primaryColor }]}>
        {theme.productLabel}
      </Text>

      {/* Nome em destaque */}
      <Text
        style={[coverStyles.name, { color: theme.coverTitleColor, fontFamily: titleFont }]}
      >
        {nomeParaExibir}
      </Text>

      {/* Subtítulo */}
      <Text style={coverStyles.subtitle}>{theme.coverSubtitle}</Text>

      {/* Linha inferior */}
      <View style={[coverStyles.bottomLine, { backgroundColor: theme.primaryColor }]} />

      {/* Metadados */}
      {dataNascimento ? (
        <Text style={coverStyles.meta}>Data de nascimento: {dataNascimento}</Text>
      ) : null}
      <Text style={coverStyles.meta}>Gerado em: {dataGeracao}</Text>
    </Page>
  );
}
