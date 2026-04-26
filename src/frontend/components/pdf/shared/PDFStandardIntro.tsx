import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { Page } from '@react-pdf/renderer';
import { PDFPageHeader } from './PDFPageHeader';
import { PDFFooter } from './PDFFooter';
import type { ProductTheme, ProductType } from './PDFTheme';
import { TITLE_FONT } from './PDFFonts';

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 65,
    paddingHorizontal: 45,
  },
  section: {
    marginBottom: 24,
  },
  hugeTitle: {
    fontSize: 18,
    fontFamily: TITLE_FONT,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  subHead: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 10,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 14,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  }
});

interface IntroProps {
  theme: ProductTheme;
  productType: ProductType;
  entityName: string;
  isFreeAnalysis?: boolean;
}

export function PDFStandardIntro({ theme, productType, entityName, isFreeAnalysis = false }: IntroProps) {

  const isLightBackground = productType === 'nome_bebe';
  const textColor = isLightBackground ? '#5C2D1E' : '#e5e2e1';
  const boldColor = isLightBackground ? theme.primaryColor : '#ffffff';

  // Textos Históricos e Holísticos da Página 1
  const getHolisticText = () => {
    switch (productType) {
      case 'nome_empresa':
        return 'Grandes negócios não crescem apenas com gestão e planilhas financeiras. Eles também precisam de uma base invisível forte. A Numerologia Cabalística é uma sabedoria milenar que mostra como as letras formam um campo de energia (uma "vibração"). Cada nome atrai ou afasta clientes e oportunidades dependendo das letras que o formam. Quando escolhemos um nome empresarial com sabedoria geométrica, ele age como um ímã silencioso, ajudando a empresa a vender mais rápido e trazendo facilidades inesperadas, aliviando o cansaço dos fundadores.';
      case 'nome_bebe':
        return 'A escolha do nome de um bebê é o primeiro e mais importante presente que os pais oferecem para a criança. Baseado em tradições milenares, sabemos que o nome escolhido não é apenas um som bonito, mas uma verdadeira "roupa de energia" que vai vestir a criança por toda a vida. Um nome bem escolhido facilita muito os caminhos, atrai melhores amizades, ajuda na profissão futura e traz proteção. Ao conhecer as vibrações das letras, os pais entregam um escudo invisível e amoroso para proteger o filho durante toda a sua existência.';
      case 'nome_social':
      default:
        return 'O nome que você usa e assina todos os dias não é apenas uma forma de ser chamado; ele funciona como um ímã constante na sua vida material e afetiva. Se você sente que se esforça demais e as coisas parecem "travar" na hora de dar certo, a causa pode estar nas repetições das letras da sua assinatura principal. A Numerologia Cabalística carrega conhecimentos antigos para organizar suas letras da melhor forma possível, removendo essas pequenas falhas que não vemos e ajudando você a atrair bons relacionamentos, saúde e muita prosperidade.';
    }
  };

  const introTitleSubtitleP1 = {
    nome_empresa: 'O Segredo Oculto das Grandes Marcas',
    nome_bebe: 'O Poder Vibracional do Nascer',
    nome_social: 'O Despertar da Sua Frequência',
  }[productType];

  return (
    <>
      {/* ── PÁGINA 1: HOLÍSTICA / BENEFÍCIOS ────────────────────────────── */}
      <Page size="A4" style={[styles.page, { backgroundColor: theme.coverBgColor }]}>
        <PDFPageHeader subtitle={`${entityName} — ${introTitleSubtitleP1}`} />

        <View style={styles.section}>
          <Text style={[styles.hugeTitle, { color: theme.accentColor, marginBottom: 16 }]}>
            {isFreeAnalysis ? 'O Magnetismo da Sua Identidade' : 'A Força Invisível das Palavras'}
          </Text>

          {isFreeAnalysis ? (
            <>
              <Text style={[styles.subHead, { color: textColor }]}>O Princípio</Text>
              <Text style={[styles.bodyText, { color: textColor }]}>
                Tudo é energia e frequência. Cada letra do nome que você assina emite um som e um valor que atraem resultados específicos — em finanças, relacionamentos e saúde. Isso não é metáfora: é a geometria invisível que organiza o que você atrai antes mesmo de agir.
              </Text>

              <Text style={[styles.subHead, { color: textColor }]}>A Dor</Text>
              <Text style={[styles.bodyText, { color: textColor }]}>
                Se você se esforça muito, mas sente as coisas "travando" na hora de dar certo, a causa pode estar nas repetições de letras da sua assinatura. Sequências específicas criam bloqueios que operam 24 horas por dia — silenciosamente, independentemente do quanto você trabalha ou se dedica.
              </Text>

              <Text style={[styles.subHead, { color: textColor }]}>A Solução</Text>
              <Text style={[styles.bodyText, { color: textColor }]}>
                Este relatório revela as falhas invisíveis do seu nome e como organizar essas letras para atrair fluidez, relacionamentos e prosperidade. O diagnóstico é objetivo e matemático. O que você faz com ele depende de você.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.subHead, { color: textColor }]}>
                O que é a Numerologia Cabalística?
              </Text>
              <Text style={[styles.bodyText, { color: textColor }]}>
                Há milhares de anos, sabedorias da Cabala judaica e estudos do pensador grego Pitágoras descobriram que todo o universo funciona como uma grande música. Para eles, tudo é energia e a linguagem que escrevemos influencia o que colhemos do mundo. Cada letra que escrevemos tem um valor, um som e uma frequência energética.
                {'\n\n'}
                Isso quer dizer que nosso nome não foi criado por acaso: ele dita o nosso propósito, quais serão os nossos talentos e também pode esconder nossos maiores desafios nessa vida material.
              </Text>

              <Text style={[styles.subHead, { color: textColor }]}>
                {productType === 'nome_empresa' ? 'O Peso do Nome na Empresa' : productType === 'nome_bebe' ? 'O Cuidado Mais Protetor de Todos' : 'O Magnetismo da Sua Identidade'}
              </Text>
              <Text style={[styles.bodyText, { color: textColor }]}>
                {getHolisticText()}
              </Text>
            </>
          )}
        </View>

        <PDFFooter />
      </Page>

      {/* ── PÁGINA 2: O MÉTODO E O SCORE ────────────────────────────────── */}
      <Page size="A4" style={[styles.page, { backgroundColor: theme.coverBgColor }]}>
        <PDFPageHeader subtitle={`${entityName} — Como Ler a Análise`} />
        
        <View style={styles.section}>
          <Text style={[styles.hugeTitle, { color: theme.accentColor, marginBottom: 16 }]}>
            Instruções e Regras Ocultas
          </Text>
          
          <Text style={[styles.subHead, { color: textColor }]}>
            A Arquitetura da Análise
          </Text>
          {isFreeAnalysis ? (
            <View style={{ marginBottom: 14 }}>
              {[
                ['5 Números Principais', 'Os pilares da sua identidade vibracional.'],
                ['Pirâmides de Fluxo', 'O mapa do seu dia a dia — como sua energia se organiza no mundo real.'],
                ['Bloqueios e Falhas', 'Onde a sua energia está sendo drenada — sequências repetidas que travam os resultados.'],
                ['Lições Kármicas', 'Vibrações ausentes no nome que criam pontos cegos na vida.'],
                ['Tendências Ocultas', 'Excessos que distorcem comportamentos e sabotam potencial.'],
              ].map(([title, desc], i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, color: boldColor, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>•</Text>
                  <Text style={{ fontSize: 11, color: textColor, lineHeight: 1.5, flex: 1 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', color: boldColor }}>{title}:</Text>{' '}{desc}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.bodyText, { color: textColor }]}>
              As informações apresentadas a seguir não são adivinhações. Usamos cálculos lógicos e estritos. Primeiro, o nosso sistema cruza as letras e descobre os <Text style={[styles.bold, { color: boldColor }]}>5 Números Principais</Text>, que são os pilares da sua análise. Depois, montamos uma pirâmide chamada <Text style={[styles.bold, { color: boldColor }]}>Os 4 Triângulos Numerológicos</Text>, que mostram o mapa de como as coisas realmente vão funcionar no seu dia a dia.
              {'\n\n'}
              Também procuramos falhas perigosas que queremos evitar a todo custo: analisamos os <Text style={[styles.bold, { color: boldColor }]}>Bloqueios</Text> (sequências repetidas de números que paralisam a vida), verificamos as <Text style={[styles.bold, { color: boldColor }]}>Lições Kármicas</Text> (energias e aprendizados que estão faltando) e detectamos as <Text style={[styles.bold, { color: boldColor }]}>Tendências Ocultas</Text> (exageros de energia que fazem mal). Finalmente, tudo isso é envolvido em um grande perfil psicológico mundial (o <Text style={[styles.bold, { color: boldColor }]}>Arquétipo</Text>), para revelar qual papel este nome tem perante a sociedade.
            </Text>
          )}

          <Text style={[styles.subHead, { color: textColor }]}>
            O Peso dos Dados Imutáveis e a Nota de 0 a 100
          </Text>
          <Text style={[styles.bodyText, { color: textColor }]}>
            Preste bastante atenção: o nosso sistema de nota final (o Score) é exigente e rigoroso. O grande motivo de não darmos "notas máximas" a todo momento é que lidamos com as âncoras da vida: os <Text style={[styles.bold, { color: boldColor }]}>Dados Imutáveis</Text>. Nós nunca poderemos mudar o seu dia ou data de nascimento (ou a data de criação da empresa). 
            {'\n\n'}
            As nossas datas de nascença carregam Débitos Kármicos fixos e geram parte inalterável dos nossos 5 Números Principais (como o número do Destino). A nossa inteligência precisa criar uma geometria de nome perfeita <Text style={[styles.italic]}>contornando e respeitando</Text> essas datas que já estão gravadas na sua história. Como a busca é por um nome que case perfeitamente com um dado estático, ao mesmo tempo em que anula falhas e bloqueios, <Text style={[styles.bold, { color: boldColor }]}>tirar um "100 de 100" é um evento muito raro</Text>.
            {'\n\n'}
            Portanto, retire dos ombros a busca pela perfeição matemática dos 100 pontos. Uma pontuação final <Text style={[styles.bold, { color: boldColor }]}>acima de 75 pontos</Text> prova que o nome se adaptou brilhantemente ao seu destino e trará extrema confiança e segurança. Quando você encontrar um nome com <Text style={[styles.bold, { color: boldColor }]}>mais de 85 pontos</Text>, comemore: você tem em mãos um verdadeiro "ímã de prosperidade", perfeitamente costurado para transformar seu esforço em pura fluidez.
          </Text>
        </View>

        <PDFFooter />
      </Page>
    </>
  );
}
