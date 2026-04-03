/**
 * PDFPageHeader — cabeçalho fixo reutilizável para todas as páginas de conteúdo.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS } from './PDFTheme';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.lightGray,
    paddingBottom: 8,
    marginBottom: 24,
  },
  brand: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.gold,
    letterSpacing: 1,
  },
  info: {
    fontSize: 8,
    color: PDF_COLORS.gray,
    textAlign: 'right',
  },
});

interface PDFPageHeaderProps {
  brand?: string;
  subtitle: string;
}

export function PDFPageHeader({ brand = 'NOME MAGNETICO', subtitle }: PDFPageHeaderProps) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.brand}>{brand}</Text>
      <Text style={styles.info}>{subtitle}</Text>
    </View>
  );
}
