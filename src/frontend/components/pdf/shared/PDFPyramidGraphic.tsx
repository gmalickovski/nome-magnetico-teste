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

/** Detecta posições com bloqueio (3+ iguais consecutivos na mesma linha) */
function buildBloqueioSet(linhas: number[][]): Set<string> {
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

export function PDFPyramidGraphic({ triangulo, primaryColor = PDF_COLORS.gold }: PDFPyramidGraphicProps) {
  if (!triangulo || !triangulo.linhas || !Array.isArray(triangulo.linhas)) return null;

  const bloqueioSet = buildBloqueioSet(triangulo.linhas);

  return (
    <View style={styles.container}>
      {triangulo.linhas.map((linha, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {linha.map((num, colIndex) => {
            const isBlocked = bloqueioSet.has(`${rowIndex}:${colIndex}`);
            const isRegent = rowIndex === triangulo.linhas.length - 1;

            return (
              <View
                key={colIndex}
                style={[
                  styles.cellBox,
                  {
                    borderColor: isBlocked
                      ? '#B91C1C'
                      : isRegent
                      ? '#6D28D9'
                      : `${primaryColor}66`,
                    backgroundColor: isBlocked
                      ? 'rgba(220, 38, 38, 0.18)'
                      : isRegent
                      ? 'rgba(109, 40, 217, 0.12)'
                      : `${primaryColor}0D`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    {
                      color: isBlocked
                        ? '#DC2626'
                        : isRegent
                        ? '#A78BFA'
                        : '#374151',
                    },
                  ]}
                >
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
