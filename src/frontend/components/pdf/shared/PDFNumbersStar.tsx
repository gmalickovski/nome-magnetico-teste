/**
 * PDFNumbersStar — os 5 números principais posicionados nas pontas de uma estrela de 5 pontas.
 *
 * Interface idêntica à PDFNumbersGrid para drop-in replacement.
 * O número com featuredLabel vai para a ponta de cima e é levemente maior que os demais.
 *
 * Geometria:
 *   centro em (CX=250, CY=152), raio externo R=100, raio interno r=40
 *   Ponta 0 (topo, featured): ângulo -90°
 *   Pontas 1-4: distribuídas no sentido horário (72° cada)
 */
import { View, Text, StyleSheet, Svg, Polygon } from '@react-pdf/renderer';

// ── Dimensões fixas ────────────────────────────────────────────────────────────
const W = 500;       // largura do container (coincide com área útil do PDF)
const H = 295;       // altura do container
const CX = W / 2;   // 250 — centro horizontal da estrela
const CY = 152;     // centro vertical da estrela
const R_OUTER = 100; // raio das pontas externas
const R_INNER = 40;  // raio dos vértices internos
const LABEL_OFFSET = 24; // distância extra além da ponta para o centro do label
const BOX_W = 72;    // largura da caixa de texto
const BOX_H = 54;    // altura da caixa de texto (número + label + sublabel)

const styles = StyleSheet.create({
  container: {
    width: W,
    height: H,
    position: 'relative',
    marginTop: 6,
    marginBottom: 4,
  },
  labelBox: {
    position: 'absolute',
    width: BOX_W,
    alignItems: 'center',
  },
  featuredValue: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
    marginBottom: 2,
  },
  secondaryValue: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
    marginBottom: 2,
  },
  labelText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  sublabelText: {
    fontSize: 7,
    textAlign: 'center',
  },
});

interface NumberEntry {
  label: string;
  sublabel: string;
  value: number | null;
  icon?: string;
}

interface PDFNumbersStarProps {
  nums: NumberEntry[];
  featuredLabel: string;   // ex: 'Expressão' ou 'Destino'
  primaryColor: string;    // cor do produto para o número destaque
  accentColor: string;     // cor para o sublabel
}

/** Posição XY da ponta de índice i (0=topo, sentido horário) */
function tipXY(i: number): { x: number; y: number } {
  const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
  return {
    x: CX + R_OUTER * Math.cos(angle),
    y: CY + R_OUTER * Math.sin(angle),
  };
}

/** Posição left/top da caixa de texto para a ponta de índice i */
function labelPos(i: number): { left: number; top: number } {
  const { x, y } = tipXY(i);
  // Vetor unitário apontando para fora do centro
  const dx = (x - CX) / R_OUTER;
  const dy = (y - CY) / R_OUTER;
  // Centro do label empurrado LABEL_OFFSET px além da ponta
  const labelCX = x + dx * LABEL_OFFSET;
  const labelCY = y + dy * LABEL_OFFSET;
  return {
    left: Math.round(labelCX - BOX_W / 2),
    top: Math.round(labelCY - BOX_H / 2),
  };
}

export function PDFNumbersStar({
  nums,
  featuredLabel,
  primaryColor,
  accentColor,
}: PDFNumbersStarProps) {
  const featured = nums.find(n => n.label === featuredLabel) ?? nums[0];
  const others = nums.filter(n => n.label !== featuredLabel);
  // featured na ponta de cima (index 0), restantes em sequência horária
  const ordered = [featured, ...others];

  // Pontos da estrela: 10 vértices alternando raio externo/interno
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? R_OUTER : R_INNER;
    return `${(CX + radius * Math.cos(angle)).toFixed(2)},${(CY + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      {/* ── Estrela SVG (fundo) ───────────────────────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }}>
        <Svg width={W} height={H}>
          <Polygon
            points={starPoints}
            fill={primaryColor}
            fillOpacity={0.07}
            stroke={primaryColor}
            strokeOpacity={0.65}
            strokeWidth={1.2}
          />
        </Svg>
      </View>

      {/* ── Labels nas pontas ─────────────────────────────────────────────── */}
      {ordered.map((num, i) => {
        const pos = labelPos(i);
        const isFeatured = i === 0;
        return (
          <View key={num.label} style={[styles.labelBox, { left: pos.left, top: pos.top }]}>
            <Text style={[
              isFeatured ? styles.featuredValue : styles.secondaryValue,
              { color: primaryColor },
            ]}>
              {num.value ?? '?'}
            </Text>
            <Text style={[styles.labelText, { color: isFeatured ? primaryColor : '#374151' }]}>
              {num.label}
            </Text>
            <Text style={[styles.sublabelText, { color: accentColor }]}>
              {num.sublabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
