import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS } from './PDFTheme';

const GOLD = PDF_COLORS.gold;
const PRIMARY = '#4A7FC1';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    height: 140,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: '18%',
  },
  barValueWrapper: {
    width: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  barValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
  },
  labelsWrapper: {
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  barSublabel: {
    fontSize: 7,
    color: '#4B5563',
    textAlign: 'center',
  }
});

interface CorpNum {
  label: string;
  sublabel: string;
  value: number | string | null;
  heightPts: number;
  color: string;
}

export function PDFNumbersCorporate({ nums }: { nums: Record<string, any> }) {
  // Ordem crescente de importância/construção: Motivação -> Impressão -> Expressão -> Missão -> Destino
  const orderedData: CorpNum[] = [
    { label: 'Motivação', sublabel: 'Essência', value: nums.motivacao, heightPts: 35, color: '#94a3b8' },
    { label: 'Impressão', sublabel: 'A Marca', value: nums.impressao, heightPts: 48, color: '#64748b' },
    { label: 'Expressão', sublabel: 'Magnetismo', value: nums.expressao, heightPts: 62, color: PRIMARY },
    { label: 'Missão', sublabel: 'Propósito', value: nums.missao, heightPts: 76, color: '#3b82f6' },
    { label: 'Destino', sublabel: 'O Chamado', value: nums.destino, heightPts: 92, color: GOLD },
  ];

  return (
    <View style={styles.container}>
      {orderedData.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={[styles.barValueWrapper, { height: item.heightPts, backgroundColor: item.color }]}>
            <Text style={styles.barValue}>{item.value ?? '?'}</Text>
          </View>
          <View style={styles.labelsWrapper}>
            <Text style={[styles.barLabel, { color: item.color }]}>{item.label}</Text>
            <Text style={styles.barSublabel}>{item.sublabel}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
