/**
 * PDFNumbersGrid — grid dos 5 números principais com destaque para o número principal do produto.
 *
 * Layout:
 *   [  NÚMERO DESTAQUE (2× maior)  ]   ← linha 1 (card grande, centralizado)
 *   [ N1 ]  [ N2 ]  [ N3 ]  [ N4 ]    ← linha 2 (4 cards menores)
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS } from './PDFTheme';

const GOLD = PDF_COLORS.gold;
const GRAY = PDF_COLORS.gray;

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
  },
  // Card destaque (número principal)
  featuredWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredCard: {
    width: '52%',
    borderWidth: 2,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.06)',
  },
  featuredIcon: {
    fontSize: 14,
    marginBottom: 4,
  },
  featuredValue: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    lineHeight: 1,
  },
  featuredLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  featuredSublabel: {
    fontSize: 8,
    textAlign: 'center',
  },
  // Cards secundários (4 menores)
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  secondaryValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: 7,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 1,
  },
  secondarySublabel: {
    fontSize: 6,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

interface NumberEntry {
  label: string;
  sublabel: string;
  value: number | null;
  icon?: string;
}

interface PDFNumbersGridProps {
  nums: NumberEntry[];
  featuredLabel: string;   // ex: 'Expressão' ou 'Destino'
  primaryColor: string;    // cor do produto para o card destaque
  accentColor: string;     // cor de acento do produto
}

export function PDFNumbersGrid({
  nums,
  featuredLabel,
  primaryColor,
  accentColor,
}: PDFNumbersGridProps) {
  const featured = nums.find(n => n.label === featuredLabel) ?? nums[0];
  const secondary = nums.filter(n => n.label !== featuredLabel);

  return (
    <View style={styles.container}>
      {/* Número destaque */}
      <View style={styles.featuredWrapper}>
        <View style={[styles.featuredCard, { borderColor: primaryColor }]}>
          {featured.icon ? (
            <Text style={[styles.featuredIcon, { color: primaryColor }]}>
              {featured.icon}
            </Text>
          ) : null}
          <Text style={[styles.featuredValue, { color: primaryColor }]}>
            {featured.value ?? '?'}
          </Text>
          <Text style={[styles.featuredLabel, { color: primaryColor }]}>
            {featured.label}
          </Text>
          <Text style={[styles.featuredSublabel, { color: accentColor }]}>
            {featured.sublabel}
          </Text>
        </View>
      </View>

      {/* 4 números secundários */}
      <View style={styles.secondaryRow}>
        {secondary.map(n => (
          <View key={n.label} style={styles.secondaryCard}>
            <Text style={styles.secondaryValue}>{n.value ?? '?'}</Text>
            <Text style={styles.secondaryLabel}>{n.label}</Text>
            <Text style={styles.secondarySublabel}>{n.sublabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
