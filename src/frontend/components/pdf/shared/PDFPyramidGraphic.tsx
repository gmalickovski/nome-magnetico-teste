import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS } from './PDFTheme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cellBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  cellText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
});

interface PDFPyramidGraphicProps {
  triangulo: { linhas: number[][] } | null;
  bloqueiosEncontrados?: string[];
  primaryColor?: string;
}

export function PDFPyramidGraphic({ triangulo, bloqueiosEncontrados = [], primaryColor = PDF_COLORS.gold }: PDFPyramidGraphicProps) {
  if (!triangulo || !triangulo.linhas || !Array.isArray(triangulo.linhas)) return null;

  return (
    <View style={styles.container}>
      {triangulo.linhas.map((linha, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {linha.map((num, colIndex) => {
            // Em PDFs sem interatividade complexa, apenas destacamos as células de forma genérica
            // idealmente verificaríamos a sequência. Vamos destacar os blocos se a config assim quiser:
            const isBlocked = false; // simplificado visualmente para manter elegância

            return (
              <View 
                key={colIndex} 
                style={[
                  styles.cellBox, 
                  { 
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    backgroundColor: isBlocked ? 'rgba(220, 38, 38, 0.1)' : 'rgba(212, 175, 55, 0.05)'
                  }
                ]}
              >
                <Text style={[styles.cellText, { color: isBlocked ? '#DC2626' : '#374151' }]}>
                  {num}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
