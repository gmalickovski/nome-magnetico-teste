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
  // Custo da Inércia (free analysis)
  bloqueioAtivoBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderWidth: 0.5,
    borderColor: '#EF4444',
    marginLeft: 8,
  },
  bloqueioAtivoBadgeText: {
    fontSize: 7,
    color: '#DC2626',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  custoInerciaBox: {
    backgroundColor: 'rgba(220,38,38,0.07)',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  custoInerciaTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  custoInerciaText: {
    fontSize: 10,
    color: '#7F1D1D',
    lineHeight: 1.6,
  },
  licaoHarmonizacaoBox: {
    backgroundColor: 'rgba(212,175,55,0.07)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
  },
  licaoHarmonizacaoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92640F',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  licaoHarmonizacaoText: {
    fontSize: 10,
    color: '#1A202C',
    lineHeight: 1.6,
  },
});

// ── Custo da Inércia por bloqueio ─────────────────────────────────────────────

const CUSTO_INERCIA_MAP: Record<string, string> = {
  '111': 'Enquanto o bloqueio 111 permanecer ativo no seu nome, cada tentativa de iniciar algo novo será travada por hesitação crônica, procrastinação e medo de exposição — como se uma barreira invisível bloqueasse o primeiro passo antes mesmo de você tentar.',
  '222': 'O bloqueio 222 sabota parcerias e associações: acordos que não se concretizam, colaborações que viram conflito, relacionamentos que perdem a harmonia no momento mais decisivo. A cooperação que deveria ser natural vira campo minado.',
  '333': 'Com o bloqueio 333 ativo, sua voz, criatividade e capacidade de expressão ficam comprometidas. Oportunidades de visibilidade escorregam porque a comunicação trava exatamente quando mais importa — na apresentação, na negociação, no palco.',
  '444': 'O bloqueio 444 fragmenta a base: projetos que não chegam ao fim, instabilidade financeira persistente, dificuldade de construir algo sólido. É como tentar erguer uma estrutura sobre areia — o esforço é real, o resultado some.',
  '555': 'O bloqueio 555 cria turbulência contínua: mudanças que chegam sem avisar, impulsividade que destrói o que foi construído, uma inquietação que impede a colheita. A liberdade desejada se converte em prisão de caos.',
  '666': 'Com o bloqueio 666, harmonia em casa e nos relacionamentos parece sempre fora de alcance. Responsabilidades que sufocam, desequilíbrio entre dar e receber, e a sensação crônica de que você carrega mais do que deveria — sozinho.',
  '777': 'O bloqueio 777 isola espiritualmente: respostas que não chegam, conexões que ficam superficiais, uma desconexão com o propósito maior que corrói a motivação silenciosamente. A busca pelo sentido vira labirinto.',
  '888': 'Você pode se esforçar 10x mais, mas enquanto o bloqueio 888 permanecer ativo, o dinheiro continuará saindo por entre seus dedos — a luta pela abundância está codificada no nome. O esforço financeiro dobra e o resultado não acompanha.',
  '999': 'O bloqueio 999 perpetua ciclos de perda e sacrifício: relações que terminam em abandono, projetos que chegam ao fim prematuramente, e uma dificuldade crônica de fechar capítulos com paz. O fim sempre chega antes da hora.',
};

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
export function BloqueiosBlock({ bloqueios, showAntidoto = true }: { bloqueios: BloqueioData[]; showAntidoto?: boolean }) {
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.bloqueioTitle, { marginBottom: 0 }]}>{b.codigo} — {b.titulo}</Text>
            {!showAntidoto && (
              <View style={styles.bloqueioAtivoBadge}>
                <Text style={styles.bloqueioAtivoBadgeText}>ATIVO 24H</Text>
              </View>
            )}
          </View>
          <Text style={styles.bloqueioDesc}>{b.descricao}</Text>
          {b.aspectoSaude ? (
            <Text style={styles.bloqueioSaude}>Aspecto de saúde: {b.aspectoSaude}</Text>
          ) : null}
          {b.triangulos && b.triangulos.length > 0 ? (
            <Text style={styles.bloqueioTriangulos}>
              Presente em: {b.triangulos.join(', ')}
            </Text>
          ) : null}
          {!showAntidoto && (
            <View style={styles.custoInerciaBox}>
              <Text style={styles.custoInerciaTitle}>⚠ Custo da Inércia</Text>
              <Text style={styles.custoInerciaText}>
                {CUSTO_INERCIA_MAP[b.codigo] ?? 'Esta frequência continua sendo emitida pelo nome 24 horas por dia — apenas a harmonização vibracional do Nome Social pode neutralizá-la.'}
              </Text>
              <Text style={[styles.custoInerciaText, { marginTop: 6, fontStyle: 'italic', color: '#991B1B' }]}>
                Esta frequência é emitida 24h/dia — apenas a harmonização vibracional pode neutralizá-la.
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

/** Cards de Débitos Kármicos */
export function DebitosBlock({ debitos, showSolution = true }: { debitos: DebitoData[]; showSolution?: boolean }) {
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
      {!showSolution && (
        <View style={styles.licaoHarmonizacaoBox} wrap={false}>
          <Text style={styles.licaoHarmonizacaoTitle}>Como a Harmonização Atua nos Débitos Kármicos</Text>
          <Text style={styles.licaoHarmonizacaoText}>
            Débitos variáveis — originados nos números de Motivação ou Expressão — podem ser reduzidos ou eliminados por uma variação do nome que reajuste essas frequências. O processo de harmonização calcula combinações que minimizam esses padrões no campo vibracional.
          </Text>
        </View>
      )}
    </View>
  );
}

/** Cards de Lições Kármicas */
export function LicoesBlock({ licoes, showSolution = true }: { licoes: LicaoData[]; showSolution?: boolean }) {
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
      {!showSolution && (
        <View style={styles.licaoHarmonizacaoBox} wrap={false}>
          <Text style={styles.licaoHarmonizacaoTitle}>Como a Harmonização Resolve as Lições Kármicas</Text>
          <Text style={styles.licaoHarmonizacaoText}>
            O Nome Social Harmonizado pode introduzir as vibrações ausentes no seu campo energético. Quando o nome passa a conter esses números, a qualidade em falta começa a ser cultivada naturalmente — sem depender exclusivamente de esforço consciente.
          </Text>
        </View>
      )}
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
  showSolution = true,
}: {
  tendencias: TendenciaData[];
  frequencias?: Record<string, number> | null;
  showSolution?: boolean;
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
          {!showSolution && (
            <View style={styles.licaoHarmonizacaoBox} wrap={false}>
              <Text style={styles.licaoHarmonizacaoTitle}>Como a Harmonização Reequilibra as Tendências</Text>
              <Text style={styles.licaoHarmonizacaoText}>
                A redistribuição vibracional do Nome Social ajusta a proporção dos números em excesso na raiz do campo energético. O que hoje cria ciclos repetitivos encontra contrapeso natural no novo campo vibracional — algo que esforço consciente sozinho não consegue alcançar.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
