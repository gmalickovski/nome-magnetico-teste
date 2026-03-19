/**
 * Lógica específica do produto Nome do Bebê.
 *
 * Fluxo:
 * 1. Calcular número de Destino do bebê pela data de nascimento (real ou prevista).
 * 2. Para cada nome candidato + sobrenome da família:
 *    - Calcular os 4 triângulos
 *    - Verificar sequências negativas
 *    - Calcular compatibilidade Expressão × Destino
 *    - Verificar lições kármics
 * 3. Rankear por score total.
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import { calcularScore } from '../score';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../karmic';
import type { Bloqueio } from '../triangle';

export interface AnaliseNomeBebe {
  nomeCompleto: string;    // ex: "Sofia Alves"
  primeiroNome: string;
  expressao: number;
  motivacao: number;
  missao: number;
  destino: number;
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  debitosCarmicos: DebitoCarmicoInfo[];
  compatibilidade: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  score: number;
  justificativa: string[];
}

export interface ResultadoNomeBebe {
  sobrenomesDisponiveis: string[];
  dataNascimento: string;
  destino: number;
  nomesCandidatos: AnaliseNomeBebe[];
  melhorNome: AnaliseNomeBebe | null;
}

/**
 * Analisa um nome candidato para bebê.
 */
export function analisarNomeBebe(
  primeiroNome: string,
  sobrenomeFamilia: string,
  dataNascimento: string
): AnaliseNomeBebe {
  const nomeCompleto = sobrenomeFamilia.length > 0 ? `${primeiroNome} ${sobrenomeFamilia}`.trim() : primeiroNome;
  const todos = calcularTodosTriangulos(nomeCompleto, dataNascimento);
  const bloqueios = detectarBloqueios(todos);
  const sequencias = todasSequenciasNegativas(todos);
  const expressao = calcularExpressao(nomeCompleto);
  const motivacao = calcularMotivacao(nomeCompleto);
  const missao = calcularMissao(nomeCompleto);
  const destino = calcularDestino(dataNascimento);
  const licoes = detectarLicoesCarmicas(nomeCompleto);
  const tendencias = detectarTendenciasOcultas(nomeCompleto);
  const debitos = calcularDebitosCarmicos(dataNascimento, destino, motivacao, expressao);
  const compatibilidade = avaliarCompatibilidade(expressao, destino);

  const score = calcularScore({
    bloqueios: bloqueios.length,
    licoesCarmicas: licoes.length,
    tendenciasOcultas: tendencias.length,
    debitosCarmicos: debitos.length,
    compatibilidade,
  });

  const justificativa: string[] = [];

  if (bloqueios.length === 0) {
    justificativa.push('✓ Sem bloqueios em nenhum dos 4 triângulos');
  } else {
    justificativa.push(`✗ ${bloqueios.length} bloqueio(s): ${bloqueios.map(b => b.codigo).join(', ')}`);
  }

  switch (compatibilidade) {
    case 'total':
      justificativa.push(`✓ Expressão (${expressao}) totalmente harmônica com Destino (${destino})`);
      break;
    case 'complementar':
      justificativa.push(`✓ Expressão (${expressao}) complementar ao Destino (${destino})`);
      break;
    case 'aceitavel':
      justificativa.push(`~ Expressão (${expressao}) aceitável para o Destino (${destino})`);
      break;
    case 'incompativel':
      justificativa.push(`✗ Expressão (${expressao}) pouco compatível com Destino (${destino})`);
      break;
  }

  if (licoes.length > 0) {
    justificativa.push(`~ ${licoes.length} lição(ões) kármica(s)`);
  }
  if (debitos.length > 0) {
    justificativa.push(`✗ ${debitos.length} débito(s) kármico(s): ${debitos.map(d => d.numero).join(', ')}`);
  }

  return {
    nomeCompleto,
    primeiroNome,
    expressao,
    motivacao,
    missao,
    destino,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    licoesCarmicas: licoes,
    tendenciasOcultas: tendencias,
    debitosCarmicos: debitos,
    compatibilidade,
    score,
    justificativa,
  };
}

/**
 * Gera todas as combinações não-vazias preservando a ordem relativa dos elementos.
 */
function gerarCombinacoesSobrenomes(sobrenomes: string[]): string[] {
  const combinacoes: string[] = [];
  const n = sobrenomes.length;
  // 1 to (2^n - 1) generates all subsets except empty
  for (let i = 1; i < (1 << n); i++) {
    const subset: string[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        subset.push(sobrenomes[j]);
      }
    }
    combinacoes.push(subset.join(' '));
  }
  return [...new Set(combinacoes)];
}

/**
 * Analisa múltiplos nomes candidatos iterando sobre possíveis composições de sobrenome e retorna ranqueados.
 */
export function analisarNomesBebe(
  nomesCandidatos: string[],
  sobrenomesDisponiveis: string[],
  dataNascimento: string
): ResultadoNomeBebe {
  const destino = calcularDestino(dataNascimento);
  
  // Limpar os sobrenomes e remover vazios
  const sobrenomesValidos = sobrenomesDisponiveis.map(s => s.trim()).filter(s => s.length > 0);
  
  // Combinações de sobrenomes a testar (ou string vazia se nenhum)
  const combinacoes = sobrenomesValidos.length > 0
    ? gerarCombinacoesSobrenomes(sobrenomesValidos)
    : [''];

  const analises: AnaliseNomeBebe[] = [];

  for (const candidato of nomesCandidatos.map(n => n.trim()).filter(n => n.length >= 2)) {
    let melhorAnaliseCandidato: AnaliseNomeBebe | null = null;
    
    // Testa todas as combinações de sobrenome para esse primeiro nome
    for (const combo of combinacoes) {
      const analiseAtual = analisarNomeBebe(candidato, combo, dataNascimento);
      // Fica com a composição que render o maior score numerológico
      if (!melhorAnaliseCandidato || analiseAtual.score > melhorAnaliseCandidato.score) {
        melhorAnaliseCandidato = analiseAtual;
      }
    }
    
    if (melhorAnaliseCandidato) {
      analises.push(melhorAnaliseCandidato);
    }
  }

  analises.sort((a, b) => b.score - a.score);

  return {
    sobrenomesDisponiveis: sobrenomesValidos,
    dataNascimento,
    destino,
    nomesCandidatos: analises,
    melhorNome: analises[0] ?? null,
  };
}
