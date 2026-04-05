import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 160,
    marginTop: 12,
    marginBottom: 16,
  },
  leftCol: {
    width: '50%',
    height: '100%',
    marginRight: 4,
  },
  rightCol: {
    width: '50%',
    height: '100%',
    flexDirection: 'column',
    gap: 4,
  },
  rightRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  
  // Peças
  pieceDestino: {
    flex: 1,
    backgroundColor: '#FFEDD5', // Laranja bem suave
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  pieceExp: {
    flex: 1,
    backgroundColor: '#FEF3C7', // Amarelinho
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pieceMot: {
    flex: 1,
    backgroundColor: '#FCE7F3', // Rosinha
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  pieceImp: {
    flex: 1,
    backgroundColor: '#E0E7FF', // Azul bebê
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  pieceMiss: {
    flex: 1,
    backgroundColor: '#D1FAE5', // Verdinho
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },

  // Tipografia
  valDestino: {
    fontSize: 54,
    fontFamily: 'Helvetica-Bold',
    color: '#9A3412',
    lineHeight: 1,
  },
  labelDestino: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#c2410c',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  subDestino: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#ea580c',
    marginTop: 4,
  },

  valPequeno: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
  },
  labelPequeno: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  subPequeno: {
    fontSize: 6,
    fontFamily: 'Helvetica-Oblique',
  },
});

export interface BabyBlockNums {
  expressao: number;
  motivacao: number;
  destino: number;
  missao?: number;
  impressao?: number;
}

export function PDFNumbersBabyBlocks({ nums }: { nums: BabyBlockNums }) {
  return (
    <View style={styles.container} wrap={false}>
      <View style={styles.leftCol}>
        <View style={styles.pieceDestino}>
          <Text style={styles.valDestino}>{nums.destino}</Text>
          <Text style={styles.labelDestino}>Destino</Text>
          <Text style={styles.subDestino}>O Chamado e a Direção</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        {/* Linha Superior: Expressão e Motivação */}
        <View style={styles.rightRow}>
          <View style={styles.pieceExp}>
            <Text style={[styles.valPequeno, { color: '#92400E' }]}>{nums.expressao}</Text>
            <Text style={[styles.labelPequeno, { color: '#b45309' }]}>Expressão</Text>
            <Text style={[styles.subPequeno, { color: '#d97706' }]}>Os Talentos</Text>
          </View>
          <View style={styles.pieceMot}>
            <Text style={[styles.valPequeno, { color: '#9D174D' }]}>{nums.motivacao}</Text>
            <Text style={[styles.labelPequeno, { color: '#be185d' }]}>Motivação</Text>
            <Text style={[styles.subPequeno, { color: '#db2777' }]}>A Alma</Text>
          </View>
        </View>

        {/* Linha Inferior: Impressão e Missão */}
        <View style={styles.rightRow}>
          <View style={styles.pieceImp}>
            <Text style={[styles.valPequeno, { color: '#3730A3' }]}>{nums.impressao ?? '—'}</Text>
            <Text style={[styles.labelPequeno, { color: '#4338ca' }]}>Impressão</Text>
            <Text style={[styles.subPequeno, { color: '#4f46e5' }]}>O Magnetismo</Text>
          </View>
          <View style={styles.pieceMiss}>
            <Text style={[styles.valPequeno, { color: '#065F46' }]}>{nums.missao ?? '—'}</Text>
            <Text style={[styles.labelPequeno, { color: '#047857' }]}>Missão</Text>
            <Text style={[styles.subPequeno, { color: '#059669' }]}>A Vocação</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
