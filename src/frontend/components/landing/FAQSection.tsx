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
      'A numerologia cabalística é um sistema ancestral que atribui valores numéricos às letras do nome de nascimento, revelando padrões energéticos, bloqueios e potenciais. Diferente de outras numerologias, ela considera os acentos e a vibração completa do nome como foi registrado.',
  },
  {
    id: '2',
    question: 'O que são os bloqueios energéticos no nome?',
    answer:
      'Bloqueios são sequências de três ou mais números iguais (como 111, 333, 555) que aparecem no Triângulo da Vida calculado a partir do seu nome. Cada sequência indica uma área de vida onde a energia flui com dificuldade — pode ser relacionamentos, prosperidade, expressão criativa, etc.',
  },
  {
    id: '3',
    question: 'Preciso mudar meu nome nos documentos?',
    answer:
      'Não necessariamente. O Nome Magnético pode ser usado em contextos específicos — redes sociais, vida profissional, assinatura artística — sem necessidade de mudança legal. O importante é ativar a vibração do nome magneticamente.',
  },
  {
    id: '4',
    question: 'Em quanto tempo vejo resultados?',
    answer:
      'A vibração do nome se manifesta de forma gradual. Muitos usuários relatam mudanças de percepção e oportunidades já nas primeiras semanas após adotar o Nome Magnético. O Guia de Implementação de 30 dias auxilia nessa transição.',
  },
  {
    id: '5',
    question: 'Qual é a diferença entre o teste gratuito e a análise completa?',
    answer:
      'O teste gratuito mostra apenas a quantidade de bloqueios e um preview do título de cada bloqueio. A análise completa inclui: interpretação profunda dos 5 números, detalhes de cada bloqueio com o caminho de transformação, 3 Nomes Magnéticos personalizados com scoring numérico, guia de implementação de 30 dias, afirmações personalizadas e PDF para download.',
  },
  {
    id: '6',
    question: 'Minha privacidade está protegida?',
    answer:
      'Sim. Seus dados de nome e data de nascimento são usados exclusivamente para o cálculo numerológico. Não compartilhamos suas informações com terceiros. Você pode solicitar a exclusão de seus dados a qualquer momento.',
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
