/**
 * NomeAtualPDF — documento PDF da análise Gratuita (Nome Atual).
 *
 * Estrutura de páginas:
 *   1. Capa (gold/purple — estrela de 5 pontas)
 *   2. A Estrela de 5 Pontas: Expressão em destaque + 4 números + Bloqueios
 *   3. Karma: Débitos + Lições + Tendências Ocultas
 *   4+. Análise IA completa (triângulos + blocos kármicos injetados inline)
 *   5. CTA / Oferta para a Harmonização (Nome Social)
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { THEMES, THEME_NOME_ATUAL } from './shared/PDFTheme';
import { PDFCover } from './shared/PDFCover';
import { PDFStandardIntro } from './shared/PDFStandardIntro';
import { PDFPageHeader } from './shared/PDFPageHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFNumbersGrid } from './shared/PDFNumbersGrid';
import { PDFNumbersStar } from './shared/PDFNumbersStar';
import { RenderMarkdownChunks, TrianguloPiramideInline } from './shared/PDFMarkdownRenderer';
import { BloqueiosBlock, DebitosBlock, LicoesBlock, TendenciasBlock } from './shared/PDFKarmicBlock';
import { LOGO_FONT, TITLE_FONT, BODY_FONT, BODY_FONT_BOLD, loadLogoSrc, formatDate } from './shared/PDFFonts';
import { formatAnalysisText } from '../../../utils/textFormatter';
import type { ProductPDFProps } from './shared/PDFTypes';
import { getArquetipo, type Arquetipo } from '../../../backend/numerology/archetypes';

function ArquetipoCardPDF({ arquetipo }: { arquetipo: Arquetipo }) {
  return (
    <View style={{
      borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, padding: 16, backgroundColor: '#FFFDF0', marginTop: 12
    }} wrap={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ 
          width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 1, borderColor: '#D4AF37',
          justifyContent: 'center', alignItems: 'center',
          marginRight: 12
        }}>
          <Text style={{ fontSize: 18, fontFamily: TITLE_FONT, color: '#D4AF37' }}>{arquetipo.numero}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 9, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 2 }}>
            Sua Identidade Mítica
          </Text>
          <Text style={{ fontSize: 16, fontFamily: TITLE_FONT, color: '#D4AF37', fontWeight: 'bold' }}>
            {arquetipo.nome}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
        <Text style={{ fontSize: 10, fontFamily: TITLE_FONT, color: '#D4AF37', textAlign: 'center' }}>
          "{arquetipo.essencia}"
        </Text>
      </View>

      <Text style={{ fontSize: 10, fontFamily: BODY_FONT, color: '#4B5563', lineHeight: 1.6, marginBottom: 12 }}>
        {arquetipo.descricao}
      </Text>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 10, color: '#10b981', fontFamily: BODY_FONT_BOLD, marginBottom: 4 }}>
          LUZ (Expressão Positiva)
        </Text>
        {arquetipo.expressaoPositiva.map((item, i) => (
          <Text key={i} style={{ fontSize: 9, fontFamily: BODY_FONT, color: '#4B5563', marginBottom: 2, marginLeft: 8 }}>
            • {item}
          </Text>
        ))}
      </View>
      <View>
        <Text style={{ fontSize: 10, color: '#FF6B6B', fontFamily: BODY_FONT_BOLD, marginBottom: 4 }}>
          SOMBRA (Desafios)
        </Text>
        {arquetipo.expressaoSombra.map((item, i) => (
          <Text key={i} style={{ fontSize: 9, fontFamily: BODY_FONT, color: '#4B5563', marginBottom: 2, marginLeft: 8 }}>
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

const theme = THEME_NOME_ATUAL;

const GOLD = theme.primaryColor;
const GRAY = '#4B5563';
const LIGHT_GRAY = '#E5E7EB';
const DARK = '#131313';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: DARK,
  },
  darkPage: {
    backgroundColor: DARK,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: '#e5e2e1',
  },
  assinaturaPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: BODY_FONT,
    color: DARK,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: TITLE_FONT,
    color: GOLD,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    paddingBottom: 4,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  hugeTitle: {
    fontSize: 18,
    fontFamily: TITLE_FONT,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  fixedText: {
    fontSize: 10,
    fontFamily: BODY_FONT,
    color: GRAY,
    lineHeight: 1.6,
    marginBottom: 16,
    marginTop: 6,
    padding: 0,
    backgroundColor: 'transparent',
    textAlign: 'justify',
  },
  bodyText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  conclusaoCard: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFDF0',
    marginTop: 8,
  },
  // Variações de nome magnético
  variationCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
  },
  variationCardTop: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 6,
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  variationName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  variationScore: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  variationBar: {
    height: 4,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 2,
    marginBottom: 6,
  },
  variationBarFill: {
    height: 4,
    borderRadius: 2,
  },
  variationMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 3,
  },
  variationMetaText: {
    fontSize: 8,
    color: GRAY,
  },
  variationJustificativa: {
    fontSize: 8,
    color: GRAY,
    lineHeight: 1.4,
    marginTop: 3,
  },
  // Assinatura
  assinaturaTitle: {
    fontSize: 18,
    fontFamily: TITLE_FONT,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  assinaturaNome: {
    fontSize: 22,
    fontFamily: TITLE_FONT,
    color: DARK,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  assinaturaInstrucoesBox: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginBottom: 20,
  },
  assinaturaInstrucoesTitle: {
    fontSize: 9,
    fontFamily: BODY_FONT_BOLD,
    color: GOLD,
    marginBottom: 6,
  },
  assinaturaInstrucaoItem: {
    fontSize: 8,
    fontFamily: BODY_FONT,
    color: GRAY,
    lineHeight: 1.6,
    marginBottom: 3,
  },
  assinaturaLinha: {
    height: 0.5,
    backgroundColor: '#C5C5C5',
    marginBottom: 32,
  },
});

/** Extrai estritamente o bloco de Conclusão Final do texto */
function extractConclusao(text: string): string | null {
  const match = text.match(/##[^\n]*(?:\d+\.\s*conclus|\d+\.\s*o nome como|conclus[aã]o)/i);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

function scoreColor(score: number): string {
  return score >= 70 ? '#059669' : score >= 40 ? '#D97706' : '#DC2626';
}

function compatColor(c: string): string {
  return c === 'total' ? '#059669' : c === 'complementar' ? '#7c3aed' : c === 'aceitavel' ? '#D97706' : '#DC2626';
}

function compatLabel(c: string): string {
  return c === 'total' ? 'Total' : c === 'complementar' ? 'Complementar' : c === 'aceitavel' ? 'Aceitável' : 'Incompatível';
}

export function NomeAtualPDF({ analysis, magneticNames, userName }: ProductPDFProps) {
  const logoSrc = loadLogoSrc();
  const freqData = analysis.frequencias_numeros as any;
  // Para o novo fluxo, exibir o nome social escolhido (não o nome de nascimento)
  const nomeParaExibir = freqData?.ranking?.melhorNome?.nomeCompleto ?? analysis.nome_completo;
  const nomeNascimento = analysis.nome_completo;
  const dataNascimento = formatDate(
    freqData?.ranking?.dataNascimento ?? analysis.data_nascimento
  );
  const dataGeracao = formatDate(analysis.completed_at ?? analysis.created_at);

  const letrasNome = nomeParaExibir
    .replace(/\s+/g, '')
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '')
    .toUpperCase()
    .split('');

  const melhorNome = freqData?.ranking?.melhorNome;
  const nomesCandidatos: any[] = freqData?.ranking?.nomesCandidatos ?? [];

  const nums = [
    { label: 'Expressão', sublabel: 'O Dom', value: analysis.numero_expressao, icon: '✦' },
    { label: 'Destino', sublabel: 'O Chamado', value: analysis.numero_destino, icon: '◈' },
    { label: 'Motivação', sublabel: 'A Alma', value: analysis.numero_motivacao, icon: '♡' },
    { label: 'Impressão', sublabel: 'As Consoantes', value: analysis.numero_impressao, icon: '◎' },
    { label: 'Missão', sublabel: 'A Vocação', value: analysis.numero_missao, icon: '◇' },
  ];

  const bloqueios = Array.isArray(analysis.bloqueios) ? analysis.bloqueios : [];
  const debitos = Array.isArray(analysis.debitos_carmicos) ? analysis.debitos_carmicos : [];
  const licoes = Array.isArray(analysis.licoes_carmicas) ? analysis.licoes_carmicas : [];
  const tendencias = Array.isArray(analysis.tendencias_ocultas) ? analysis.tendencias_ocultas : [];
  const frequencias: Record<string, number> | null =
    freqData?.frequencias ?? (freqData && !freqData?.ranking ? freqData : null);

  const tVida = analysis.triangulo_vida ?? null;
  const tPessoal = analysis.triangulo_pessoal ?? null;
  const tSocial = analysis.triangulo_social ?? null;
  const tDestino = analysis.triangulo_destino ?? null;

  const TRIANGLE_FULL_WIDTH = 430;
  const baseLen = Math.max(
    tVida?.linhas[0]?.length ?? 1,
    tPessoal?.linhas[0]?.length ?? 1,
    tSocial?.linhas[0]?.length ?? 1,
    tDestino?.linhas[0]?.length ?? 1,
  );
  const triCellSize = Math.min(18, Math.max(5, Math.floor(TRIANGLE_FULL_WIDTH / baseLen) - 1));
  const triangleMap = (tVida || tPessoal || tSocial || tDestino)
    ? { vida: tVida, pessoal: tPessoal, social: tSocial, destino: tDestino }
    : undefined;

  const analiseFormatado = analysis.analise_texto
    ? formatAnalysisText(analysis.analise_texto)
    : null;
  const conclusaoTexto = analiseFormatado ? extractConclusao(analiseFormatado) : null;
  const analiseCorpo = analiseFormatado && conclusaoTexto
    ? analiseFormatado.slice(0, analiseFormatado.indexOf(conclusaoTexto)).trim()
    : analiseFormatado;

  return (
    <Document title={`Nome Magnetico — ${nomeParaExibir}`} author="Nome Magnetico">

      {/* ── PÁGINA 1: CAPA ────────────────────────────────────────────────── */}
      <PDFCover
        theme={theme}
        nomeParaExibir={nomeParaExibir}
        dataNascimento={dataNascimento}
        dataGeracao={dataGeracao}
        logoSrc={logoSrc}
        logoFont={LOGO_FONT}
        titleFont={TITLE_FONT}
      />

      {/* ── PÁGINA INTRODUTÓRIA: GUIA DE LEITURA ────────────────────────── */}
      <PDFStandardIntro theme={theme} productType="nome_social" entityName={nomeParaExibir} />

      {/* Rankeamento removido do relatório atual */}

      {/* ── PÁGINA 3: A ESTRELA DE 5 PONTAS + BLOQUEIOS ───────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — O Pentagrama Pessoal`} />

        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={styles.hugeTitle}>A Essência e o Personagem</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 13, color: '#8A661C', borderBottomColor: '#8A661C', borderBottomWidth: 0.5 }]}>O Pentagrama Pessoal</Text>
          <PDFNumbersStar
            nums={nums}
            featuredLabel="Expressão"
            primaryColor={theme.primaryColor}
            accentColor={theme.accentColor}
          />
          <Text style={{ ...styles.bodyText, marginTop: 16 }}>
            Na geometria sagrada e na numerologia cabalística, a sua energia vital está ancorada em 5 frequências principais, formando o seu Pentagrama Pessoal de luz. 
          </Text>
          <Text style={{ ...styles.bodyText, marginTop: 4 }}>
            A <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Expressão</Text> define suas qualidades inatas, enquanto a <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Motivação</Text> revela o combustível espiritual da sua Alma. Sua <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Impressão</Text> é o invólucro do seu carisma no plano social; e na base, moldando sua jornada e resultados a longo prazo, está o número do <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Destino</Text>. Somente quando estes 5 polos operam em total alinhamento e ressonância cósmica, a estrela desperta — transmutando esforço em potência, fluidez e prosperidade manifesta em seu caminho e na sua Missão.
          </Text>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={[styles.sectionTitle, { fontSize: 13, color: '#8A661C', borderBottomColor: '#8A661C', borderBottomWidth: 0.5 }]}>
            O Arquétipo - Sua Identidade Mítica
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>
            Os arquétipos são energias primordiais que governam o comportamento humano. Na metodologia do Nome Magnético, o seu número de Expressão revela o seu Arquétipo Regente: o 'personagem' que você interpreta no palco da vida. Conhecer seu arquétipo permite que você use seus talentos naturais com maestria e neutralize as sombras que impedem seu crescimento.
          </Text>
          <ArquetipoCardPDF arquetipo={getArquetipo(analysis.numero_expressao ?? 1)} />
        </View>

        {/* Bloqueios logo abaixo dos números */}
        {bloqueios.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#DC2626', borderBottomColor: '#DC2626' }]}>
              Bloqueios Energéticos ({bloqueios.length})
            </Text>
            <BloqueiosBlock bloqueios={bloqueios} showAntidoto={false} />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#059669', borderBottomColor: '#059669' }]}>
              Bloqueios Energéticos (0)
            </Text>
            <View style={{ backgroundColor: '#ecfdf5', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#34d399', marginTop: 8 }}>
              <Text style={{ fontFamily: TITLE_FONT, color: '#065f46', fontSize: 13, marginBottom: 6 }}>
                Parabéns! Fluxo Livre Detectado
              </Text>
              <Text style={{ fontFamily: BODY_FONT, color: '#064e3b', fontSize: 11, lineHeight: 1.5 }}>
                Os cálculos cabalísticos mapearam a totalidade do seu nome e confirmaram que a sua arquitetura vibratória atual está completamente livre de sequências numéricas travadas (bloqueios). Sem as antigas amarras magnéticas para obstruir o seu campo, a sua energia flui de maneira cristalina pelas áreas de finanças, saúde e relacionamentos. O universo abraça e impulsiona o seu livre-arbítrio sem exigir pedágios mecânicos, refletindo um fluxo limpo rumo ao seu Destino.
              </Text>
            </View>
          </View>
        )}

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 4/5: KARMA E TENDÊNCIAS ─────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PDFPageHeader subtitle={`${nomeParaExibir} — O Peso do Passado`} />
        
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text style={styles.hugeTitle}>O Peso do Passado (Karma e Tendências)</Text>
        </View>

        <View style={{ ...styles.section, marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { color: '#D97706', borderBottomColor: '#D97706', fontSize: 13 }]}>
            Débitos Kármicos
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Na visão da numerologia cabalística, a jornada da Alma não é uma linha reta, mas um espiral transcendente de ciclos evolutivos. Os Débitos Kármicos emergem como ecos das suas vidas anteriores, marcando áreas da sua existência onde o livre-arbítrio foi utilizado em desequilíbrio — seja pelo excesso de autoridade cega, rebeldia irresponsável, estagnação ou puro materialismo. Destaca-se que eles não são punições de um universo severo, mas puras leis de compensação exigindo reintegração espiritual.</Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Ao carregar estas pendências em seu código de nascimento, os mesmos cenários de traição, perda ou esforço redobrado tenderão a se repetir até que a lição moral matriz seja integrada. Identificar e compreender seus débitos através deste cálculo liberta você das prisões repetitivas; ao adotar a resposta consciente baseada na antítese dessa sombra, esse fardo se transmuta e você conquista a verdadeira sabedoria atemporal que liberta o seu fluxo.</Text>
          <DebitosBlock debitos={debitos} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#0369a1', borderBottomColor: '#0369a1', fontSize: 13 }]}>
            Lições Kármicas
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>As Lições Kármicas funcionam como os "quartos vazios" da sua grandiosa arquitetura energética: elas determinam exatamente quais virtudes, habilidades sutis ou atributos de maestria estão ausentes no momento de sua encarnação. Sendo traços que você não experenciou ou se negou a desenvolver nas vidas que precederam esta, você tenderá a se sentir inapto ou vulnerável sempre que uma situação de grande peso demandar o sacrifício destas características.</Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Entretanto, encarar essa constatação como uma fraqueza permanente seria um engano. Uma lição não é um atestado de ausência, mas um convite vibrante à expansão prática. O seu próprio Destino frequentemente orquestrará desafios propositais com a missão velada de forçar você a dominar essas ferramentas ocultas. Aplicar a ação disciplinada e paciente frente a esses números ausentes tornará este "déficit" inicial em um de seus maiores trunfos maduros no pico da sua jornada.</Text>
          <LicoesBlock licoes={licoes} />
        </View>

        <View style={{ ...styles.section, marginTop: 0 }}>
          <Text style={[styles.sectionTitle, { color: '#6d28d9', borderBottomColor: '#6d28d9', fontSize: 13 }]}>
            Tendências Ocultas
          </Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Se as lições evidenciam aquilo que falta em seu arcabouço letal, as Tendências Ocultas escancaram exatamente aquilo que lhe sobra. Elas apontam para habilidades instintivas levadas ao absurdo; um talento e um foco de energia vital herdados cujas frequências, acumuladas e repetidas nos agrupamentos de memórias do seu nome, formaram um rio selvagem de grande ímpeto interno. Essa sobrecarga magnética, muitas vezes sutil e inquestionada, provoca uma inclinação subconsciente a focar inteiramente em determinado comportamento reativo.</Text>
          <Text style={{ ...styles.bodyText, marginBottom: 6 }}>Apesar destas vibrações concederem facilidade impressionante para comunicação ardente, ambição material intensa, poder de manipulação ou até altruísmo desgastante, é o excesso incontrolado que obscurece a clareza, convertendo sua habilidade primária em desequilíbrio e sabotando os resultados a longo prazo. O trunfo fundamental desta análise geométrica de repetição reside no mapeamento preciso dessas forças indomadas: ao compreendê-las sob as lentes da razão, você as direciona conscientemente, fazendo o rio trabalhar pelas turbinas a seu favor em vez de deixá-lo inundar o seu sucesso.</Text>
          <TendenciasBlock tendencias={tendencias} frequencias={frequencias} />
        </View>

        <PDFFooter />
      </Page>



      {/* ── PÁGINAS 6+: ANÁLISE IA COMPLETA COM INJEÇÕES DE QUEBRA E TEXTOS ─── */}
      {analiseCorpo && (
        <Page size="A4" style={styles.page}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — Análise Profunda`} />

          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <Text style={styles.hugeTitle}>Sua Análise Profunda</Text>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: GOLD, textAlign: 'center', letterSpacing: 1, marginBottom: 24 }}>
              Estudo Numerológico Completo
            </Text>
          </View>

          <View style={styles.section}>
            <RenderMarkdownChunks
              text={analiseCorpo}
              styles={styles}
              GOLD={GOLD}
              triangleMap={triangleMap}
              triCellSize={triCellSize}
              letrasNome={letrasNome}
              pageBreaks={['Os 4 Triângulos', 'Triângulo Pessoal', 'Triângulo Social', 'Triângulo do Destino', 'Bloqueios e', 'Como Harmonizar']}
              injections={{
                'Triângulo da Vida': <Text style={styles.bodyText}>O Triângulo da Vida materializa os alicerces de sua sobrevivência e ambição prática. É a bússola dourada da sua vitalidade biológica, da sua resiliência e de todo o seu potencial de atração financeira. Ele dita os limites palpáveis da sua expansão material sob o sol.</Text>,
                'Triângulo Pessoal': <Text style={styles.bodyText}>Este triângulo desvenda as profundezas da sua vida íntima. Ele atua sobre o subconsciente, curando ou criando fissuras no amor-próprio e nas reações sentimentais. Através dele visualizamos se você é movido por clareza emocional ou por tempestades invisíveis do seu afeto.</Text>,
                'Triângulo Social': <Text style={styles.bodyText}>Aqui mapeamos a arquitetura do seu magnetismo de grupo. Este vértice define o peso do seu networking, a fluidez das parcerias de negócios e como a sociedade em geral curva-se perante os seus argumentos e dons de comunicação. É a arte do posicionamento projetada em numerologia pura.</Text>,
                'Triângulo do Destino': <Text style={styles.bodyText}>O ápice sagrado: sua convergência final. O Triângulo do Destino revela as circunstâncias incontornáveis e o fluxo principal do projeto que o universo exige de você nesta Era. É para cá que os ventos sopram; é a grande força gravitacional em direção ao topo da sua montanha evolutiva.</Text>,
                'Como Harmonizar': <Text style={styles.bodyText}>Radiografar os desafios é o primeiro elo; instaurar a transmutação é o movimento de mestre. Detalharemos com precisão cirúrgica a tática exata de adequação da sua nova assinatura, desconstruindo resíduos limitantes para consagrar de forma orgânica a sua verdadeira frequência de poder.</Text>
              }}
            />
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* ── PÁGINA: CONCLUSÃO (FUNDO ESCURO) ─────────────────────────────── */}
      {conclusaoTexto && conclusaoTexto.length > 50 && (
        <Page size="A4" style={styles.darkPage}>
          <PDFPageHeader subtitle={`${nomeParaExibir} — O Encerramento`} />
          <View style={{ marginTop: 24, marginBottom: 16 }}>
             <Text style={styles.hugeTitle}>Conclusão Final</Text>
             <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: GOLD, textAlign: 'center', letterSpacing: 1, marginBottom: 24 }}>
               A Síntese do Seu Mapa
             </Text>
          </View>
          <View style={styles.section}>
            <RenderMarkdownChunks
               text={conclusaoTexto}
               styles={{...styles, bodyText: { ...styles.bodyText, color: '#e5e2e1' }}}
               GOLD={GOLD}
            />
          </View>
          <PDFFooter />
        </Page>
      )}

      {/* A seção de Variações Numerológicas foi removida do PDF (só aparece no HTML) */}

      {/* ── PÁGINA FINAL: CTA PARA HARMONIZAÇÃO (NOME SOCIAL) ───────────────────── */}
      <Page size="A4" style={styles.darkPage}>
        <View style={{ marginTop: 24, marginBottom: 8 }}>
          <Text style={styles.hugeTitle}>
            {bloqueios.length > 0
              ? 'O Diagnóstico É Claro — E o Nome Continua Emitindo'
              : 'Sua Frequência Pode Ser Ainda Mais Poderosa'}
          </Text>
          <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: GOLD, textAlign: 'center', letterSpacing: 1, marginBottom: 20 }}>
            A Diferença Entre Saber e Transformar
          </Text>
        </View>

        <View style={styles.section}>

          {/* Bloco de urgência — só aparece se há bloqueios */}
          {bloqueios.length > 0 && (
            <View style={{ backgroundColor: '#450A0A', borderRadius: 8, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#EF4444' }}>
              <Text style={{ fontFamily: TITLE_FONT, fontSize: 11, color: '#FCA5A5', marginBottom: 8 }}>
                {bloqueios.length === 1
                  ? 'Este diagnóstico revelou 1 bloqueio ativo no seu nome de nascimento.'
                  : `Este diagnóstico revelou ${bloqueios.length} bloqueios ativos no seu nome de nascimento.`}
              </Text>
              <Text style={{ fontSize: 10, color: '#FEE2E2', lineHeight: 1.6 }}>
                Práticas espirituais, meditação e disciplina ajudam — mas nenhuma delas muda a frequência que o seu nome emite. Enquanto o nome não for harmonizado, esses bloqueios continuam transmitindo suas limitações{' '}
                <Text style={{ fontFamily: BODY_FONT_BOLD, color: '#FCA5A5' }}>24 horas por dia, 7 dias por semana</Text>
                {' '}— operando silenciosamente nas suas finanças, relacionamentos e saúde.
              </Text>
            </View>
          )}

          {/* O que o Nome Social resolve */}
          <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.07)', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', marginBottom: 14 }}>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 12, color: GOLD, marginBottom: 10, textAlign: 'center' }}>
              O Que a Harmonização Faz pelo Seu Nome
            </Text>
            <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.6, marginBottom: 8 }}>
              Na numerologia cabalística, o nome pelo qual você assina e se apresenta atua como uma antena que pode neutralizar — ou ampliar — as frequências negativas. Um Nome Social harmonizado não apaga seu passado; ele reconfigura o sinal que você emite a partir de agora.
            </Text>
            <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.5, marginBottom: 5 }}>
              <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Bloqueios eliminados: </Text>
              Calculamos variações do seu nome que não formam nenhuma sequência vibratória negativa.
            </Text>
            <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.5, marginBottom: 5 }}>
              <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Destino alinhado: </Text>
              Casamos o seu número de Expressão com o seu número de Destino para máxima ressonância.
            </Text>
            <Text style={{ fontSize: 10, color: '#e5e2e1', lineHeight: 1.5 }}>
              <Text style={{ fontFamily: BODY_FONT_BOLD, color: GOLD }}>Intenção codificada: </Text>
              Você define como quer ser percebido — a IA injeta essas características numéricas no arranjo final.
            </Text>
          </View>

          {/* Citação de impacto */}
          <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)', padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(212, 175, 55, 0.2)', marginBottom: 16 }}>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 10, color: GOLD, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Conhecer os bloqueios sem harmonizá-los é como saber que a torneira está furada{'\n'}e continuar enchendo o balde."
            </Text>
          </View>

          {/* CTA */}
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontFamily: TITLE_FONT, fontSize: 12, color: '#e5e2e1', marginBottom: 6, textAlign: 'center' }}>
              Pronto para mudar a frequência que você emite?
            </Text>
            <Text style={{ fontFamily: BODY_FONT, fontSize: 9, color: '#76746a', marginBottom: 14, textAlign: 'center' }}>
              Acesse sua conta ou abra a URL abaixo no navegador para gerar seu Nome Social Harmonizado.
            </Text>
            <View style={{ backgroundColor: GOLD, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 30 }}>
              <Text style={{ color: '#000', fontFamily: BODY_FONT_BOLD, fontSize: 12 }}>
                nomemagnetico.com.br/nome-social
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
