import { View, Text } from '@react-pdf/renderer';

import type { Arquetipo } from '../../../../backend/numerology/archetypes';

const TITLE_FONT = 'Cinzel';
const BODY_FONT = 'Helvetica';
const BODY_FONT_BOLD = 'Helvetica-Bold';

export function ArquetipoCardPDF({ arquetipo }: { arquetipo: Arquetipo }) {
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
          <Text style={{ fontSize: 16, fontFamily: TITLE_FONT, color: '#D4AF37' }}>
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
