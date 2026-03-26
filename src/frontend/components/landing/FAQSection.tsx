import React from 'react';
import { Accordion } from '../ui/Accordion';

export interface FaqItemProps {
  id: string;
  pergunta: string;
  answerHtml: string;
}

const fallbackItems = [
  {
    id: '1',
    question: 'O que é a numerologia cabalística?',
    answer:
      'É a ciência exata de conversão de letras em números e cálculo de frequências. Baseada na tradição mística hebraica, oferece um mapa matemático profundo, unindo cabala, cálculos precisos e arquétipos junguianos.',
  },
  {
    id: '2',
    question: 'Como a mudança da assinatura remove bloqueios?',
    answer:
      'Cada letra emite uma força. Mudando letras na assinatura, a equação do seu Triângulo da Vida muda, desmanchando sequências repetitivas (como 444, de inércia ou 888 de excesso) que causam bloqueios visíveis em diversas áreas.',
  },
  {
    id: '3',
    question: 'Qual a diferença para a numerologia comum?',
    answer:
      'Nosso motor processa velozmente os 4 triângulos completos, cruza a compatibilidade de destino e expressão e gera um score perfeito para o nível da sua vibração pessoal — alinhado aos Arquétipos Junguianos, algo inacessível em semanas de cálculos manuais.',
  },
  {
    id: '4',
    question: 'Preciso mudar meu nome na identidade?',
    answer:
      'Não necessariamente. O Nome Magnético pode ser adotado na sua assinatura do dia a dia, redes sociais e vida profissional para ativar magneticamente a vibração sem burocracias de cartório.',
  },
  {
    id: '5',
    question: 'O que o relatório completo entrega?',
    answer:
      'Uma interpretação profunda dos 5 números, o caminho de transformação de cada bloqueio, top 3 Nomes Magnéticos personalizados com scoring numérico, além do Guia Executivo de Implementação de 30 dias em PDF premium.',
  },
];

interface FAQSectionProps {
  items?: FaqItemProps[];
}

export function FAQSection({ items }: FAQSectionProps) {
  const accordionItems = items && items.length > 0
    ? items.map(item => ({
        id: item.id,
        question: item.pergunta,
        answer: '',
        answerHtml: item.answerHtml,
      }))
    : fallbackItems;

  return (
    <section id="faq" className="py-20 md:py-32 bg-[#111111]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-3">
            Dúvidas
          </p>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
            Perguntas Frequentes
          </h2>
        </div>

        <Accordion items={accordionItems} />

        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm">
            Ainda tem dúvidas?{' '}
            <a href="/app/suporte" className="text-[#D4AF37] hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
