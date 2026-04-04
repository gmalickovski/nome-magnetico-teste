/**
 * PDFKarmicBlock — componentes de cards kármicos para injeção inline no PDF.
 *
 * Cada bloco é projetado para aparecer imediatamente após o heading correspondente
 * no texto da análise, co-localizando as informações gráficas com o texto explicativo.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS } from './PDFTheme';

const GOLD = PDF_COLORS.gold;
const GRAY = PDF_COLORS.gray;
const LIGHT_GRAY = PDF_COLORS.lightGray;

const styles = StyleSheet.create({
  sectionBlock: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
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
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
    marginBottom: 2,
  },
  bloqueioDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  bloqueioSaude: {
    fontSize: 9,
    color: '#7f1d1d',
    marginTop: 3,
    fontStyle: 'italic',
  },
  bloqueioTriangulos: {
    fontSize: 9,
    color: '#991b1b',
    marginTop: 2,
  },
  // Débitos
  debitoRow: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  debitoRowVariable: {
    backgroundColor: '#F5F3FF',
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  debitoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 2,
  },
  debitoTitleVariable: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#5B21B6',
    marginBottom: 2,
  },
  debitoDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  debitoNoneBox: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  debitoNoneText: {
    fontSize: 8,
    color: '#065F46',
  },
  // Lições
  licaoRow: {
    backgroundColor: 'rgba(56,189,248,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  licaoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 2,
  },
  licaoDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  licaoNoneBox: {
    backgroundColor: 'rgba(56,189,248,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  licaoNoneText: {
    fontSize: 8,
    color: '#0369a1',
  },
  // Tendências
  tendenciaRow: {
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#a78bfa',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  tendenciaTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#6d28d9',
    marginBottom: 2,
  },
  tendenciaDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  tendenciaNoneBox: {
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#a78bfa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  tendenciaNoneText: {
    fontSize: 8,
    color: '#6d28d9',
  },
  // Frequency chart
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  freqLabel: {
    fontSize: 8,
    color: '#4B5563',
    width: 14,
    textAlign: 'right',
    marginRight: 6,
  },
  freqBar: {
    flex: 1,
    height: 10,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 3,
  },
  freqFill: {
    height: 10,
    backgroundColor: '#a78bfa',
    borderRadius: 3,
  },
  freqCount: {
    fontSize: 8,
    color: '#4B5563',
    width: 18,
    textAlign: 'right',
    marginLeft: 6,
  },
  // Badge permanente
  badgePermanente: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 0.5,
    borderColor: '#F59E0B',
    marginLeft: 6,
  },
  badgePermanenteText: {
    fontSize: 7,
    color: '#D97706',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
});

// ── Interfaces de dados ───────────────────────────────────────────────────────

export interface BloqueioData {
  codigo: string;
  titulo: string;
  descricao: string;
  aspectoSaude?: string;
  triangulos?: string[];
}

export interface DebitoData {
  numero: number;
  titulo: string;
  descricao: string;
  fixo?: boolean;
}

export interface LicaoData {
  numero: number;
  titulo: string;
  descricao: string;
}

export interface TendenciaData {
  numero: number;
  titulo: string;
  descricao: string;
  frequencia: number;
}

// ── Componentes de bloco ──────────────────────────────────────────────────────

/** Cards de Bloqueios Energéticos */
export function BloqueiosBlock({ bloqueios }: { bloqueios: BloqueioData[] }) {
  if (bloqueios.length === 0) {
    return (
      <View style={styles.debitoNoneBox}>
        <Text style={styles.debitoNoneText}>
          Nenhum bloqueio energético detectado neste nome — vibração limpa em todos os triângulos.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.sectionBlock}>
      {bloqueios.map((b, i) => (
        <View key={i} style={styles.bloqueioRow} wrap={false}>
          <Text style={styles.bloqueioTitle}>{b.codigo} — {b.titulo}</Text>
          <Text style={styles.bloqueioDesc}>{b.descricao}</Text>
          {b.aspectoSaude ? (
            <Text style={styles.bloqueioSaude}>Aspecto de saúde: {b.aspectoSaude}</Text>
          ) : null}
          {b.triangulos && b.triangulos.length > 0 ? (
            <Text style={styles.bloqueioTriangulos}>
              Presente em: {b.triangulos.join(', ')}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Cards de Débitos Kármicos */
export function DebitosBlock({ debitos }: { debitos: DebitoData[] }) {
  if (debitos.length === 0) {
    return (
      <View style={styles.debitoNoneBox}>
        <Text style={styles.debitoNoneText}>
          Nenhum débito kármico detectado — alma sem pendências de encarnações passadas.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.sectionBlock}>
      {debitos.map((d, i) => {
        const isFixed = d.fixo === true;
        return (
          <View key={i} style={isFixed ? styles.debitoRow : styles.debitoRowVariable} wrap={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
              <Text style={isFixed ? styles.debitoTitle : styles.debitoTitleVariable}>
                {d.titulo}
              </Text>
              {isFixed ? (
                <View style={styles.badgePermanente}>
                  <Text style={styles.badgePermanenteText}>PERMANENTE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.debitoDesc}>{d.descricao}</Text>
            {isFixed ? (
              <Text style={{ fontSize: 7, color: '#92400E', marginTop: 3, fontStyle: 'italic' }}>
                Ligado ao dia natalício / Destino — não pode ser eliminado por mudança de nome.
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

/** Cards de Lições Kármicas */
export function LicoesBlock({ licoes }: { licoes: LicaoData[] }) {
  if (licoes.length === 0) {
    return (
      <View style={styles.licaoNoneBox}>
        <Text style={styles.licaoNoneText}>
          Nenhuma lição kármica pendente — todos os números estão presentes neste nome.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.sectionBlock}>
      {licoes.map((l, i) => (
        <View key={i} style={styles.licaoRow} wrap={false}>
          <Text style={styles.licaoTitle}>{l.titulo}</Text>
          <Text style={styles.licaoDesc}>{l.descricao}</Text>
        </View>
      ))}
    </View>
  );
}

/** Gráfico de frequência de números */
function FrequencyBar({ frequencias }: { frequencias: Record<string, number> }) {
  const entries = Object.entries(frequencias)
    .map(([k, v]) => ({ num: Number(k), count: v }))
    .filter(e => e.num >= 1 && e.num <= 8)
    .sort((a, b) => a.num - b.num);
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(e => e.count), 1);
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={[styles.sectionLabel, { color: '#6d28d9', fontSize: 11, marginBottom: 4, textTransform: 'none' }]}>
        Mapeamento de Repetição Energética
      </Text>
      <Text style={{ fontSize: 10, color: GRAY, marginBottom: 12, lineHeight: 1.4 }}>
        Este gráfico tangibiliza o ímpeto magnético presente em seu nome. As barras mais densas indicam talentos que você vivencia em extremo excesso, apontando com exatidão onde o seu potencial transborda para a desordem.
      </Text>
      {entries.map(({ num, count }) => {
        const pct = (count / max) * 100;
        return (
          <View key={num} style={styles.freqRow}>
            <Text style={styles.freqLabel}>{num}</Text>
            <View style={styles.freqBar}>
              <View style={[styles.freqFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.freqCount}>{count}x</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Cards de Tendências Ocultas + gráfico de frequências */
export function TendenciasBlock({
  tendencias,
  frequencias,
}: {
  tendencias: TendenciaData[];
  frequencias?: Record<string, number> | null;
}) {
  return (
    <View style={styles.sectionBlock}>
      {frequencias && Object.keys(frequencias).length > 0 ? (
        <FrequencyBar frequencias={frequencias} />
      ) : null}
      {tendencias.length === 0 ? (
        <View style={styles.tendenciaNoneBox}>
          <Text style={styles.tendenciaNoneText}>
            Nenhuma tendência oculta detectada — nenhum número se repete excessivamente.
          </Text>
        </View>
      ) : (
        <>
          {tendencias.map((t, i) => (
            <View key={i} style={styles.tendenciaRow} wrap={false}>
              <Text style={styles.tendenciaTitle}>
                {t.titulo} — {t.frequencia}x no nome
              </Text>
              <Text style={styles.tendenciaDesc}>{t.descricao}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
