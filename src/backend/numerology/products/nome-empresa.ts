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
 *    - Verificar lições kármics e tendências ocultas
 * 4. Rankear por score total.
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao, calcularPersonalidade } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import { calcularScore } from '../score';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../karmic';
import type { Bloqueio } from '../triangle';

// ── Banco de nomes empresariais brandáveis para sugestões automáticas ─────────
const NOMES_EMPRESA_POOL = [
  'Nova', 'Alta', 'Vera', 'Alva', 'Lumen', 'Nexo', 'Vesta', 'Aura',
  'Axis', 'Core', 'Apex', 'Prime', 'Vital', 'Lyra', 'Orion', 'Zenit',
  'Aeon', 'Versa', 'Alma', 'Kira', 'Mara', 'Nara', 'Tara', 'Lara',
  'Elos', 'Vela', 'Tema', 'Sena', 'Gaia', 'Hera', 'Iris', 'Lima',
  'Mina', 'Rena', 'Vila', 'Yara', 'Ativa', 'Forma', 'Visao', 'Camara',
  'Vena', 'Obra', 'Roma', 'Nina', 'Olga', 'Unia', 'Zona', 'Elan',
  'Vox', 'Link', 'Nomen', 'Vibe', 'Trama', 'Livre', 'Xena', 'Sara',
  'Zara', 'Lota', 'Jota', 'Kena', 'Pena', 'Tena', 'Wina', 'Lota',
];

export interface AnaliseNomeEmpresa {
  nomeEmpresa: string;
  expressao: number;
  motivacao: number;
  missao: number;
  impressao: number;
  destinoSocio: number;
  destinoEmpresa: number | null;  // null se não tiver data de fundação
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  debitosCarmicos: DebitoCarmicoInfo[];
  compatibilidadeSocio: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  compatibilidadeEmpresa: 'total' | 'complementar' | 'aceitavel' | 'incompativel' | null;
  score: number;
  justificativa: string[];
  origemSugerida?: 'usuario' | 'ia';
}

export interface ResultadoNomeEmpresa {
  nomeSocioPrincipal: string;
  dataNascimentoSocio: string;
  dataFundacao: string | null;
  destinoSocio: number;
  destinoEmpresa: number | null;
  nomesCandidatos: AnaliseNomeEmpresa[];
  melhorNome: AnaliseNomeEmpresa | null;
  // Sócio 2 (opcional)
  nomeSocio2?: string;
  dataNascimentoSocio2?: string;
  destinoSocio2?: number;
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
  const impressao = calcularPersonalidade(nomeEmpresa); // 1ª palavra da empresa
  const destinoSocio = calcularDestino(dataNascimentoSocio);
  const destinoEmpresa = dataFundacao ? calcularDestino(dataFundacao) : null;
  const licoes = detectarLicoesCarmicas(nomeEmpresa);
  const tendencias = detectarTendenciasOcultas(nomeEmpresa);
  const debitos = calcularDebitosCarmicos(dataNascimentoSocio, destinoSocio, motivacao, expressao);
  const compatibilidadeSocio = avaliarCompatibilidade(expressao, destinoSocio);
  const compatibilidadeEmpresa = destinoEmpresa !== null
    ? avaliarCompatibilidade(expressao, destinoEmpresa)
    : null;

  const score = calcularScore({
    bloqueios: bloqueios.length,
    licoesCarmicas: licoes.length,
    tendenciasOcultas: tendencias.length,
    debitosCarmicos: debitos.length,
    compatibilidade: compatibilidadeSocio,
    compatibilidadeSecundaria: compatibilidadeEmpresa ?? undefined,
  });

  const justificativa: string[] = [];

  if (bloqueios.length === 0) {
    justificativa.push('✓ Sem bloqueios em nenhum dos 4 triângulos');
  } else {
    justificativa.push(`✗ ${bloqueios.length} bloqueio(s): ${bloqueios.map(b => b.codigo).join(', ')}`);
  }

  justificativa.push(`Compatibilidade sócio: ${compatibilidadeSocio} (Destino ${destinoSocio})`);
  if (compatibilidadeEmpresa !== null && destinoEmpresa !== null) {
    justificativa.push(`Compatibilidade empresa: ${compatibilidadeEmpresa} (Destino ${destinoEmpresa})`);
  }
  justificativa.push(`~ Missão empresarial: ${missao} — número de expressão estrutural`);

  if (licoes.length > 0) {
    justificativa.push(`~ ${licoes.length} lição(ões) kármica(s)`);
  }
  if (debitos.length > 0) {
    justificativa.push(`✗ ${debitos.length} débito(s) kármico(s): ${debitos.map(d => d.numero).join(', ')}`);
  }

  const tendencia8 = tendencias.find(t => t.numero === 8);
  if (tendencia8) {
    justificativa.push(`~ Tendência oculta ao excesso do 8 (${tendencia8.frequencia}×) — risco de materialismo excessivo`);
  }

  return {
    nomeEmpresa,
    expressao,
    motivacao,
    missao,
    impressao,
    destinoSocio,
    destinoEmpresa,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    licoesCarmicas: licoes,
    tendenciasOcultas: tendencias,
    debitosCarmicos: debitos,
    compatibilidadeSocio,
    compatibilidadeEmpresa,
    score,
    justificativa,
    origemSugerida: 'usuario' as const,
  };
}

/**
 * Gera sugestões automáticas de nomes de empresa com score >= 80.
 * Usado quando todos os candidatos do usuário ficam abaixo de 80.
 */
function gerarSugestoesEmpresaIA(
  dataNascimentoSocio: string,
  dataFundacao: string | null,
  maxSugestoes = 5
): AnaliseNomeEmpresa[] {
  const shuffled = [...NOMES_EMPRESA_POOL].sort(() => Math.random() - 0.5);
  const sugestoes: AnaliseNomeEmpresa[] = [];
  const vistos = new Set<string>();

  // 1ª passagem: buscar score >= 80
  for (const nome of shuffled) {
    if (sugestoes.length >= maxSugestoes) break;
    const analise = analisarNomeEmpresa(nome, dataNascimentoSocio, dataFundacao);
    if (!vistos.has(nome.toLowerCase()) && analise.score >= 80) {
      sugestoes.push({ ...analise, origemSugerida: 'ia' });
      vistos.add(nome.toLowerCase());
    }
  }

  // 2ª passagem: se não atingiu o mínimo, pegar os melhores disponíveis
  if (sugestoes.length < 2) {
    const todos = shuffled
      .filter(n => !vistos.has(n.toLowerCase()))
      .map(n => ({ ...analisarNomeEmpresa(n, dataNascimentoSocio, dataFundacao), origemSugerida: 'ia' as const }))
      .sort((a, b) => b.score - a.score);

    for (const analise of todos) {
      if (sugestoes.length >= maxSugestoes) break;
      sugestoes.push(analise);
      vistos.add(analise.nomeEmpresa.toLowerCase());
    }
  }

  return sugestoes.sort((a, b) => b.score - a.score);
}

/**
 * Analisa múltiplos nomes candidatos para empresa e retorna ranqueados.
 * Se o melhor candidato do usuário tiver score < 80, gera sugestões automáticas.
 */
export function analisarNomesEmpresa(
  nomesCandidatos: string[],
  nomeSocioPrincipal: string,
  dataNascimentoSocio: string,
  dataFundacao: string | null,
  nomeSocio2?: string,
  dataNascimentoSocio2?: string
): ResultadoNomeEmpresa {
  const destinoSocio = calcularDestino(dataNascimentoSocio);
  const destinoEmpresa = dataFundacao ? calcularDestino(dataFundacao) : null;
  const destinoSocio2 = dataNascimentoSocio2 ? calcularDestino(dataNascimentoSocio2) : undefined;

  const analises = nomesCandidatos
    .filter(n => n.trim().length >= 2)
    .map(n => analisarNomeEmpresa(n.trim(), dataNascimentoSocio, dataFundacao))
    .sort((a, b) => b.score - a.score);

  const melhorScoreUsuario = analises[0]?.score ?? 0;

  if (melhorScoreUsuario < 80) {
    const jaUsados = new Set(analises.map(a => a.nomeEmpresa.toLowerCase()));
    const sugestoesIA = gerarSugestoesEmpresaIA(dataNascimentoSocio, dataFundacao, 5)
      .filter(s => !jaUsados.has(s.nomeEmpresa.toLowerCase()));
    analises.push(...sugestoesIA);
    analises.sort((a, b) => b.score - a.score);
  }

  return {
    nomeSocioPrincipal,
    dataNascimentoSocio,
    dataFundacao,
    destinoSocio,
    destinoEmpresa,
    nomesCandidatos: analises,
    melhorNome: analises[0] ?? null,
    ...(nomeSocio2 ? { nomeSocio2, dataNascimentoSocio2, destinoSocio2 } : {}),
  };
}
