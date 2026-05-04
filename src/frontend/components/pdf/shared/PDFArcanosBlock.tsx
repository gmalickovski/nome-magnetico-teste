import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { TITLE_FONT, BODY_FONT, BODY_FONT_BOLD } from './PDFFonts';

const GRAY = '#4B5563';

// Cores Padronizadas (Roxo Místico) para o Bloco de Arcanos
const THEME_PURPLE = '#7C3AED';
const BG_PURPLE = '#F5F3FF';
const PILL_BG = '#EDE9FE';
const PILL_TEXT = '#4C1D95';

interface PDFArcanosBlockProps {
  title: string;
  titleColor?: string;
  arcanoRegente?: {
    numero: number;
    nome: string;
    palavraChave: string;
    descricao: string;
    desafio: string;
  } | null;
  arcanosDePassagem?: number[];
  arcanoAtual?: {
    numero: number | null;
    periodo: string;
    idadeInicio: number;
    idadeFim: number;
  };
  arcanoAtualDescricao?: string;
  /** Quando true, oculta a nota de rodapé "ver seção de anexos" */
  hideNote?: boolean;
}

export function PDFArcanosBlock({
  title,
  titleColor = '#7C3AED',
  arcanoRegente,
  arcanosDePassagem,
  arcanoAtual,
  arcanoAtualDescricao,
  hideNote = false,
}: PDFArcanosBlockProps) {
  
  if (!arcanoRegente) return null;

  return (
    <View style={{ marginTop: 14 }}>
      {/* (Subtitulo) Arcanos - Triangulo da... */}
      <Text style={{ 
        fontSize: 11,
        fontFamily: TITLE_FONT,
        color: titleColor,
        borderBottomWidth: 1,
        borderBottomColor: titleColor,
        paddingBottom: 4,
        marginBottom: 10,
        letterSpacing: 0.5,
      }}>
        {title}
      </Text>

      <View wrap={false}>
        {/* Arcano Regente */}
        <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 8 }}>
          <Text style={{ fontFamily: BODY_FONT_BOLD, color: THEME_PURPLE }}>Arcano Regente {arcanoRegente.numero}: {arcanoRegente.nome} — </Text>
          {arcanoRegente.descricao}
        </Text>

        {/* Arcano de Trânsito */}
        {arcanoAtual && arcanoAtual.numero && (
          <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.65, marginBottom: 12 }}>
            <Text style={{ fontFamily: BODY_FONT_BOLD, color: THEME_PURPLE }}>
              Arcano de Trânsito {arcanoAtual.numero} — {arcanoAtual.periodo} (Idade {arcanoAtual.idadeInicio} a {arcanoAtual.idadeFim}) — 
            </Text>
            {' '}{arcanoAtualDescricao || 'O Arcano de Trânsito revela a energia que governa o seu aqui e agora. É a frequência de colheita, provação ou renovação que você está atravessando neste exato momento cronológico da sua vida.'}
          </Text>
        )}

        {/* Sequência de Passagem */}
        {arcanosDePassagem && arcanosDePassagem.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 10, 
              color: THEME_PURPLE, 
              fontFamily: BODY_FONT_BOLD, 
              marginBottom: 4 
            }}>
              Sequência de Passagem (Cronologia)
            </Text>
            <Text style={{ fontSize: 9, color: GRAY, fontStyle: 'italic', marginBottom: 10 }}>
              Duração de cada ciclo: ~{(90 / arcanosDePassagem.length).toFixed(1).replace('.', ',')} anos
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {arcanosDePassagem.map((arcano, idx) => {
                const isAtual = arcanoAtual && arcano === arcanoAtual.numero;
                const bgColor = isAtual ? THEME_PURPLE : BG_PURPLE;
                const textColor = isAtual ? '#FFFFFF' : THEME_PURPLE;
                return (
                  <View key={`arcano-${idx}`} style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: bgColor,
                    borderWidth: 1,
                    borderColor: THEME_PURPLE,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    marginRight: 6
                  }}>
                    <Text style={{
                      fontFamily: BODY_FONT_BOLD,
                      fontSize: 8,
                      color: textColor
                    }}>
                      {arcano}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Legenda das bolinhas */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: THEME_PURPLE, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: GRAY }}>Repetições do seu momento de vida atual</Text>
              
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BG_PURPLE, borderWidth: 1, borderColor: THEME_PURPLE, marginLeft: 12, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: GRAY }}>Demais ciclos da sua jornada</Text>
            </View>
          </View>
        )}

        {/* Aviso Anexos */}
        {!hideNote && (
          <Text style={{ fontSize: 9, color: GRAY, fontStyle: 'italic', marginTop: 4 }}>
            * O significado completo de todos os arcanos presentes na sua análise encontra-se na seção de anexos ao final deste documento.
          </Text>
        )}
      </View>
    </View>
  );
}
