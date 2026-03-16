/**
 * SignatureEvaluation — critérios objetivos para avaliação e melhoria da assinatura.
 * Baseado em critérios formais (sem radiestesia/pêndulo).
 */

interface CriterioAssinatura {
  deveSerLegivel: string;
  inclinacao: string;
  semTracosNegativos: string;
  esteticaGeral: string;
}

interface Props {
  criterios: CriterioAssinatura;
  nomeMagnetico?: string;
}

interface Criterio {
  id: string;
  titulo: string;
  descricao: string;
  dicaVisual: string;
  icone: string;
}

const CRITERIOS_VISUAIS: Criterio[] = [
  {
    id: 'legibilidade',
    titulo: 'Legibilidade',
    descricao: '',
    dicaVisual: 'Escreva o nome de forma que qualquer pessoa consiga ler sem dificuldade.',
    icone: '👁️',
  },
  {
    id: 'inclinacao',
    titulo: 'Inclinação',
    descricao: '',
    dicaVisual: 'Pratique traços levemente ascendentes — da esquerda para a direita, subindo.',
    icone: '📈',
  },
  {
    id: 'tracosNegativos',
    titulo: 'Traços Negativos',
    descricao: '',
    dicaVisual: 'Evite cruzar letras agressivamente, pontos excessivos e sublinhos cortantes.',
    icone: '✂️',
  },
  {
    id: 'estetica',
    titulo: 'Estética Geral',
    descricao: '',
    dicaVisual: 'Mantenha espaçamento uniforme entre as letras, sem compressão ou excesso de ornamentos.',
    icone: '✨',
  },
];

function CriterioCard({ criterio, descricao }: { criterio: Criterio; descricao: string }) {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{criterio.icone}</span>
        <h3 className="font-semibold text-gray-200">{criterio.titulo}</h3>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{descricao}</p>
      <div className="rounded-lg p-3 bg-gold/10 border border-gold/20">
        <p className="text-xs text-gold uppercase tracking-wider mb-1">Dica prática</p>
        <p className="text-yellow-200 text-sm">{criterio.dicaVisual}</p>
      </div>
    </div>
  );
}

export default function SignatureEvaluation({ criterios, nomeMagnetico }: Props) {
  const descricoes = [
    criterios.deveSerLegivel,
    criterios.inclinacao,
    criterios.semTracosNegativos,
    criterios.esteticaGeral,
  ];

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">✍️</span>
          <div>
            <h3 className="font-semibold text-gold mb-2">Guia da Assinatura Magnética</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A assinatura é a expressão visual do seu nome no mundo. Pequenos ajustes na forma
              como você assina podem amplificar a energia do{' '}
              {nomeMagnetico ? <strong className="text-gold">{nomeMagnetico}</strong> : 'seu Nome Magnético'}.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Critérios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CRITERIOS_VISUAIS.map((c, i) => (
          <CriterioCard key={c.id} criterio={c} descricao={descricoes[i] ?? ''} />
        ))}
      </div>

      {/* Exercício prático */}
      <div className="rounded-xl p-5 bg-emerald-500/10 border border-emerald-500/20 space-y-3">
        <h3 className="font-semibold text-emerald-300 flex items-center gap-2">
          <span>📝</span> Exercício de Fixação
        </h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">1.</span>
            Pegue um papel e escreva{nomeMagnetico ? ` "${nomeMagnetico}"` : ' seu Nome Magnético'} 10 vezes, conscientemente.
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">2.</span>
            Observe a inclinação natural da sua escrita e corrija para que suba levemente.
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">3.</span>
            Certifique-se de que todas as letras são reconhecíveis — especialmente a inicial do nome.
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">4.</span>
            Repita este exercício por 7 dias para criar memória muscular da nova assinatura.
          </li>
        </ol>
      </div>

      {/* Contextos de uso */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <span>📋</span> Onde Implementar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            'Documentos oficiais',
            'E-mails profissionais',
            'Redes sociais',
            'Contratos',
            'Cartões de visita',
            'Arte e criação',
          ].map(ctx => (
            <div key={ctx} className="rounded-lg px-3 py-2 bg-white/5 text-sm text-gray-300 text-center">
              {ctx}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
