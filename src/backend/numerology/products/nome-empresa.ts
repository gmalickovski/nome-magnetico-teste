/**
 * Lógica específica do produto Nome da Empresa.
 *
 * Fluxo:
 * 1. Calcular número de Destino do sócio principal (data de nascimento).
 * 2. Calcular número de Destino da empresa (data de fundação, se houver).
 * 3. Para cada nome candidato:
 *    - Calcular os 4 triângulos (usando data de fundação ou nascimento do sócio)
 *    - Verificar sequências negativas
 *    - Calcular compatibilidade Expressão × Destino do sócio
 *    - Calcular compatibilidade Expressão × Destino da empresa (se tiver data)
 *    - Verificar lições cármicas e tendências ocultas
 * 4. Rankear por score total.
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import type { LicaoCarmica, TendenciaOculta } from '../karmic';
import type { Bloqueio } from '../triangle';

export interface AnaliseNomeEmpresa {
  nomeEmpresa: string;
  expressao: number;
  motivacao: number;
  missao: number;
  destinoSocio: number;
  destinoEmpresa: number | null;  // null se não tiver data de fundação
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  compatibilidadeSocio: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  compatibilidadeEmpresa: 'total' | 'complementar' | 'aceitavel' | 'incompativel' | null;
  score: number;
  justificativa: string[];
}

export interface ResultadoNomeEmpresa {
  nomeSocioPrincipal: string;
  dataNascimentoSocio: string;
  dataFundacao: string | null;
  destinoSocio: number;
  destinoEmpresa: number | null;
  nomesCandidatos: AnaliseNomeEmpresa[];
  melhorNome: AnaliseNomeEmpresa | null;
}

/**
 * Analisa um nome candidato para empresa.
 * Usa a data de fundação para os triângulos (ou data do sócio se não houver).
 */
export function analisarNomeEmpresa(
  nomeEmpresa: string,
  dataNascimentoSocio: string,
  dataFundacao: string | null
): AnaliseNomeEmpresa {
  // Para os triângulos, usar data de fundação preferencial, senão data do sócio
  const dataParaTriangulos = dataFundacao ?? dataNascimentoSocio;

  const todos = calcularTodosTriangulos(nomeEmpresa, dataParaTriangulos);
  const bloqueios = detectarBloqueios(todos);
  const sequencias = todasSequenciasNegativas(todos);
  const expressao = calcularExpressao(nomeEmpresa);
  const motivacao = calcularMotivacao(nomeEmpresa);
  const missao = calcularMissao(nomeEmpresa);
  const destinoSocio = calcularDestino(dataNascimentoSocio);
  const destinoEmpresa = dataFundacao ? calcularDestino(dataFundacao) : null;
  const licoes = detectarLicoesCarmicas(nomeEmpresa);
  const tendencias = detectarTendenciasOcultas(nomeEmpresa);
  const compatibilidadeSocio = avaliarCompatibilidade(expressao, destinoSocio);
  const compatibilidadeEmpresa = destinoEmpresa !== null
    ? avaliarCompatibilidade(expressao, destinoEmpresa)
    : null;

  let score = 100;
  const justificativa: string[] = [];

  // Penalidade por bloqueios
  if (bloqueios.length === 0) {
    score += 15;
    justificativa.push('✓ Sem bloqueios em nenhum dos 4 triângulos');
  } else {
    score -= bloqueios.length * 20;
    justificativa.push(`✗ ${bloqueios.length} bloqueio(s): ${bloqueios.map(b => b.codigo).join(', ')}`);
  }

  // Bônus por compatibilidade com o sócio principal
  switch (compatibilidadeSocio) {
    case 'total':
      score += 20;
      justificativa.push(`✓ Expressão (${expressao}) totalmente harmônica com Destino do sócio (${destinoSocio})`);
      break;
    case 'complementar':
      score += 12;
      justificativa.push(`✓ Expressão (${expressao}) complementar ao Destino do sócio (${destinoSocio})`);
      break;
    case 'aceitavel':
      score += 5;
      justificativa.push(`~ Expressão (${expressao}) aceitável para o Destino do sócio (${destinoSocio})`);
      break;
    case 'incompativel':
      score -= 10;
      justificativa.push(`✗ Expressão (${expressao}) pouco compatível com Destino do sócio (${destinoSocio})`);
      break;
  }

  // Bônus adicional por compatibilidade com o Destino da empresa (data de fundação)
  if (compatibilidadeEmpresa !== null && destinoEmpresa !== null) {
    switch (compatibilidadeEmpresa) {
      case 'total':
        score += 10;
        justificativa.push(`✓ Expressão (${expressao}) harmônica com Destino da empresa (${destinoEmpresa})`);
        break;
      case 'complementar':
        score += 6;
        justificativa.push(`✓ Expressão (${expressao}) complementar ao Destino da empresa (${destinoEmpresa})`);
        break;
      case 'aceitavel':
        score += 2;
        justificativa.push(`~ Expressão (${expressao}) aceitável para Destino da empresa (${destinoEmpresa})`);
        break;
      case 'incompativel':
        score -= 5;
        justificativa.push(`✗ Expressão (${expressao}) pouco compatível com Destino da empresa (${destinoEmpresa})`);
        break;
    }
  }

  // Bônus: missão (consoantes) como número de força da empresa
  // Missão impar é preferível para empresas de serviço; par para produto/estrutura
  justificativa.push(`~ Missão empresarial: ${missao} — número de expressão estrutural`);

  // Penalidade por lições cármicas em excesso (empresa com muitos desafios)
  if (licoes.length > 3) {
    score -= (licoes.length - 3) * 5;
    justificativa.push(`~ ${licoes.length} lições cármicas — muitos desafios simultâneos para o negócio`);
  } else if (licoes.length === 0) {
    score += 5;
    justificativa.push('✓ Sem lições cármicas — energia completa neste nome empresarial');
  }

  // Tendências ocultas: para empresa, número 8 em excesso é desfavorável (materialismo)
  const tendencia8 = tendencias.find(t => t.numero === 8);
  if (tendencia8) {
    score -= 5;
    justificativa.push(`~ Tendência oculta ao excesso do 8 (${tendencia8.frequencia}×) — risco de materialismo excessivo`);
  }

  score = Math.max(0, Math.min(100, score));

  return {
    nomeEmpresa,
    expressao,
    motivacao,
    missao,
    destinoSocio,
    destinoEmpresa,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    licoesCarmicas: licoes,
    tendenciasOcultas: tendencias,
    compatibilidadeSocio,
    compatibilidadeEmpresa,
    score,
    justificativa,
  };
}

/**
 * Analisa múltiplos nomes candidatos para empresa e retorna ranqueados.
 */
export function analisarNomesEmpresa(
  nomesCandidatos: string[],
  nomeSocioPrincipal: string,
  dataNascimentoSocio: string,
  dataFundacao: string | null
): ResultadoNomeEmpresa {
  const destinoSocio = calcularDestino(dataNascimentoSocio);
  const destinoEmpresa = dataFundacao ? calcularDestino(dataFundacao) : null;

  const analises = nomesCandidatos
    .filter(n => n.trim().length >= 2)
    .map(n => analisarNomeEmpresa(n.trim(), dataNascimentoSocio, dataFundacao))
    .sort((a, b) => b.score - a.score);

  return {
    nomeSocioPrincipal,
    dataNascimentoSocio,
    dataFundacao,
    destinoSocio,
    destinoEmpresa,
    nomesCandidatos: analises,
    melhorNome: analises[0] ?? null,
  };
}
