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

// Frases personalizadas do "Custo da Inércia" por código de bloqueio.
// Usadas no PDF gratuito em vez do antídoto — cria o gap que motiva a compra.
const CUSTO_INERCIA_MAP: Record<string, string> = {
  '111': 'Você pode se forçar a agir e buscar disciplina, mas enquanto o 111 dominar sua frequência vibratória, toda tentativa de liderança encontrará resistência invisível — a paralisia está codificada no nome, emitindo este sinal 24 horas por dia.',
  '222': 'Você pode tentar se relacionar mais e praticar comunicação, mas enquanto o 222 emitir sua frequência, cada parceria de valor tende a escorrer pelos dedos — a dependência e a indecisão operam antes mesmo que você perceba.',
  '333': 'Você pode praticar falar em público e trabalhar a autoconfiança, mas enquanto o 333 bloquear sua vibração, as palavras certas chegam tarde demais — o travamento de expressão age antes que você abra a boca.',
  '444': 'Você pode trabalhar o dobro e mostrar resultados, mas enquanto o 444 emitir esta frequência, o esforço não se converte em reconhecimento nem remuneração justa — a estrutura da recompensa está travada no nome.',
  '555': 'Você pode planejar com perfeição e criar rotinas sólidas, mas enquanto o 555 dominar sua vibração, mudanças não desejadas chegam sem aviso — a inconstância está programada e emitida pelo nome a cada instante.',
  '666': 'Você pode cuidar de todos ao redor e praticar o desapego, mas enquanto o 666 operar no nome, o cuidado que você oferece volta transformado em sobrecarga e exploração — o desequilíbrio está na raiz da frequência.',
  '777': 'Você pode meditar horas por dia e buscar práticas espirituais, mas enquanto o 777 bloquear sua frequência, a introspecção vira isolamento — suas melhores ideias nunca saem do plano mental para o mundo real.',
  '888': 'Você pode se esforçar 10x mais e aplicar toda a disciplina financeira do mundo, mas enquanto sua assinatura emitir a frequência 888, o dinheiro continuará saindo por entre seus dedos — a luta pela abundância está codificada no nome.',
  '999': 'Você pode buscar novos começos e praticar o perdão, mas enquanto o 999 dominar sua vibração, os ciclos não fecham — perdas e rancores se acumulam, impedindo que o próximo capítulo comece de verdade.',
};

/** Remove a sentença do antídoto da descrição para exibição no PDF gratuito */
function stripAntidoto(descricao: string): string {
  const idx = descricao.search(/\s*O antídoto é/i);
  if (idx !== -1) return descricao.slice(0, idx).trim();
  return descricao;
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginTop: 6,
    marginBottom: 8,
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
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 11,
    marginBottom: 8,
    borderRadius: 6,
  },
  bloqueioTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
    marginBottom: 6,
  },
  bloqueioDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  bloqueioSaude: {
    fontSize: 9,
    color: '#7f1d1d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  bloqueioTriangulos: {
    fontSize: 9,
    color: '#991b1b',
    marginTop: 4,
  },
  bloqueioAtivoBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 8,
    alignSelf: 'center',
  },
  bloqueioAtivoBadgeText: {
    fontSize: 7,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  custoInerciaBox: {
    backgroundColor: '#450A0A',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  custoInerciaText: {
    fontSize: 9,
    color: '#FEE2E2',
    lineHeight: 1.55,
    fontStyle: 'italic',
  },
  emitindo24hText: {
    fontSize: 8,
    color: '#FCA5A5',
    marginTop: 5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  // Débitos
  debitoRow: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 11,
    marginBottom: 8,
    borderRadius: 6,
  },
  debitoRowVariable: {
    backgroundColor: '#F5F3FF',
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    padding: 11,
    marginBottom: 8,
    borderRadius: 6,
  },
  debitoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6,
  },
  debitoTitleVariable: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#5B21B6',
    marginBottom: 6,
  },
  debitoDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  debitoNoneBox: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 11,
    borderRadius: 6,
    marginBottom: 8,
  },
  debitoNoneText: {
    fontSize: 10,
    color: '#065F46',
  },
  // Lições
  licaoRow: {
    backgroundColor: 'rgba(56,189,248,0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    padding: 11,
    marginBottom: 8,
    borderRadius: 6,
  },
  licaoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 6,
  },
  licaoDesc: {
    fontSize: 10,
    color: GRAY,
    lineHeight: 1.4,
  },
  licaoNoneBox: {
    backgroundColor: 'rgba(56,189,248,0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    padding: 11,
    borderRadius: 6,
    marginBottom: 8,
  },
  licaoNoneText: {
    fontSize: 10,
    color: '#0369a1',
  },
  // Tendências
  tendenciaRow: {
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#a78bfa',
    padding: 11,
    marginBottom: 8,
    borderRadius: 6,
  },
  tendenciaTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#6d28d9',
    marginBottom: 6,
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
    fontSize: 10,
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

/** Cards de Bloqueios Energéticos.
 *  showAntidoto=false → modo PDF gratuito: remove o antídoto, adiciona "Custo da Inércia".
 */
export function BloqueiosBlock({
  bloqueios,
  showAntidoto = true,
}: {
  bloqueios: BloqueioData[];
  showAntidoto?: boolean;
}) {
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
          {/* Cabeçalho do bloqueio */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.bloqueioTitle, { marginBottom: 0 }]}>{b.codigo} — {b.titulo}</Text>
            {!showAntidoto && (
              <View style={styles.bloqueioAtivoBadge}>
                <Text style={styles.bloqueioAtivoBadgeText}>ATIVO 24H</Text>
              </View>
            )}
          </View>

          {/* Diagnóstico — sem o antídoto no modo gratuito */}
          <Text style={styles.bloqueioDesc}>
            {showAntidoto ? b.descricao : stripAntidoto(b.descricao)}
          </Text>

          {/* Custo da Inércia — apenas no modo gratuito */}
          {!showAntidoto && CUSTO_INERCIA_MAP[b.codigo] && (
            <View style={styles.custoInerciaBox}>
              <Text style={styles.custoInerciaText}>
                {CUSTO_INERCIA_MAP[b.codigo]}
              </Text>
              <Text style={styles.emitindo24hText}>
                Esta frequência continua sendo emitida pelo seu nome enquanto ele não for harmonizado.
              </Text>
            </View>
          )}

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
    <View style={{ marginBottom: 20 }} wrap={false}>
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
