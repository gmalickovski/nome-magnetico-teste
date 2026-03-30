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
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao, calcularImpressao } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import { calcularScore, calcularScoreTeto } from '../score';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../karmic';
import type { Bloqueio } from '../triangle';

// ── Pools por ramo de atividade ───────────────────────────────────────────────
const POOLS_RAMO: Record<string, string[]> = {
  tecnologia:   ['Nexis', 'Vertex', 'Helix', 'Vortex', 'Synapse', 'Cipher', 'Codex', 'Nodus', 'Bitrix', 'Devix', 'Pixus', 'Systema'],
  saude:        ['Vita', 'Salus', 'Bios', 'Sanus', 'Medix', 'Vivax', 'Sanitas', 'Clinix', 'Vitalis', 'Salutem', 'Orbis'],
  educacao:     ['Cognis', 'Sapiens', 'Mentis', 'Logos', 'Paideia', 'Erudit', 'Gnosis', 'Episteme', 'Akademis'],
  consultoria:  ['Ratio', 'Pragma', 'Synth', 'Consilx', 'Praxis', 'Nexum', 'Stratex', 'Advise', 'Axion'],
  gastronomia:  ['Saveur', 'Gusto', 'Nosh', 'Culis', 'Gourmo', 'Epicura', 'Gustos', 'Palatum', 'Culinax'],
  construcao:   ['Solida', 'Tegula', 'Arcus', 'Solidum', 'Fabrix', 'Structa', 'Edilix', 'Constrix'],
  juridico:     ['Veritas', 'Iuris', 'Legis', 'Actio', 'Fidelis', 'Lexum', 'Iustum', 'Advocatum'],
  financeiro:   ['Aurum', 'Finium', 'Creditum', 'Fides', 'Lucrum', 'Pecunia', 'Capitum', 'Dividum'],
  moda:         ['Veste', 'Forma', 'Elega', 'Modus', 'Stylix', 'Coutu', 'Vestis', 'Modix', 'Coutura'],
  imobiliaria:  ['Domis', 'Habitum', 'Locus', 'Fundis', 'Proprio', 'Vivenda', 'Domus', 'Realtix'],
  logistica:    ['Transix', 'Cursus', 'Rotum', 'Carrix', 'Velox', 'Transitum', 'Logistis'],
  marketing:    ['Brandix', 'Imagix', 'Createm', 'Visix', 'Promotum', 'Publicis', 'Mediarum'],
};

// Pool multilíngue com significado (universal para qualquer ramo)
const POOL_MULTILINGUE = [
  // Latim (luz, força, paz, ouro, razão)
  'Lux', 'Pax', 'Vis', 'Ora', 'Lumis', 'Orbis', 'Animus', 'Vigil', 'Fides', 'Virtus', 'Nexum',
  // Grego (excelência, momento certo, crescimento)
  'Arete', 'Kairos', 'Logos', 'Ethos', 'Telos', 'Gnosis', 'Kratos', 'Helios', 'Arkhe',
  // Italiano (valor, força, luz, graça)
  'Forza', 'Valore', 'Grazia', 'Luce', 'Forto', 'Veloce', 'Ardore',
  // Japonês/moderno (crescimento espiral, visão, harmonia)
  'Koru', 'Miru', 'Sora', 'Hana', 'Kaze', 'Hoshi', 'Shizen',
  // Nórdico (força, saga, luz do norte)
  'Vigr', 'Nord', 'Saga', 'Eld', 'Sterk', 'Ljus',
  // Compostos únicos modernos
  'Lumnis', 'Nexlux', 'Vitapax', 'Solaris', 'Zenith', 'Aevum', 'Novaxis', 'Verium',
  'Auris', 'Caelum', 'Firmum', 'Ignis', 'Plenix', 'Rutis', 'Solvix', 'Temis',
];

// Sufixos neutros para combinar com sílabas dos sócios
const SUFIXOS_NEUTROS = ['is', 'us', 'ax', 'os', 'ix', 'um', 'ex', 'or'];

/**
 * Gera pool dinâmico de nomes baseado nos dados dos sócios e ramo de atividade.
 */
function gerarPoolDinamico(
  nomeSocioPrincipal: string,
  nomeSocio2: string | undefined,
  ramoAtividade: string | undefined
): string[] {
  const pool: string[] = [];

  // 1. Derivados dos sócios — sílabas dos sobrenomes
  const extrairFragmentos = (nome: string): string[] => {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    const sobrenomes = partes.length > 1 ? partes.slice(1) : partes;
    const frags: string[] = [];
    for (const sob of sobrenomes) {
      const s = sob.replace(/[^a-zA-ZÀ-ú]/g, '');
      if (s.length >= 3) {
        frags.push(s.slice(0, 3));
      }
      if (s.length >= 4) {
        frags.push(s.slice(0, 4));
      }
    }
    return frags.map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
  };

  const frags1 = extrairFragmentos(nomeSocioPrincipal);
  const frags2 = nomeSocio2 ? extrairFragmentos(nomeSocio2) : [];

  // Sílaba + sufixo neutro
  for (const frag of [...frags1, ...frags2]) {
    for (const suf of SUFIXOS_NEUTROS) {
      const candidato = frag + suf;
      if (candidato.length >= 5 && candidato.length <= 9) {
        pool.push(candidato);
      }
    }
  }

  // Combinação de sílabas dos dois sócios
  for (const f1 of frags1) {
    for (const f2 of frags2) {
      if (f1.toLowerCase() !== f2.toLowerCase()) {
        const combo1 = f1 + f2.toLowerCase();
        const combo2 = f2 + f1.toLowerCase();
        if (combo1.length >= 5 && combo1.length <= 10) pool.push(combo1);
        if (combo2.length >= 5 && combo2.length <= 10) pool.push(combo2);
      }
    }
  }

  // Iniciais dos sobrenomes como prefixo + sufixo de ramo
  const iniciais = nomeSocioPrincipal.trim().split(/\s+/).slice(1)
    .map(s => s[0]?.toUpperCase() ?? '').join('');
  if (iniciais.length >= 2) {
    pool.push(iniciais + 'is', iniciais + 'ax', iniciais + 'us', iniciais + 'Group');
  }

  // 2. Pool específico do ramo
  const ramoNorm = (ramoAtividade ?? '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ramoKey = Object.keys(POOLS_RAMO).find(k => ramoNorm.includes(k)) ?? '';
  pool.push(...(POOLS_RAMO[ramoKey] ?? []));

  // 3. Pool multilíngue universal
  pool.push(...POOL_MULTILINGUE);

  // Deduplicar, filtrar tamanho mínimo
  return [...new Set(pool.map(n => n.trim()).filter(n => n.length >= 3))];
}

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
  /** Score máximo atingível para este sócio (100 - débitos fixos × 12). */
  scoreTeto: number;
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
  const missao = calcularMissao(nomeEmpresa, dataNascimentoSocio);
  const impressao = calcularImpressao(nomeEmpresa);
  const destinoSocio = calcularDestino(dataNascimentoSocio);
  const destinoEmpresa = dataFundacao ? calcularDestino(dataFundacao) : null;
  const licoes = detectarLicoesCarmicas(nomeEmpresa);
  const tendencias = detectarTendenciasOcultas(nomeEmpresa);
  const debitos = calcularDebitosCarmicos(dataNascimentoSocio, destinoSocio, motivacao, expressao);
  const compatibilidadeSocio = avaliarCompatibilidade(expressao, destinoSocio);
  const compatibilidadeEmpresa = destinoEmpresa !== null
    ? avaliarCompatibilidade(expressao, destinoEmpresa)
    : null;

  const debitosFixosCount = debitos.filter(d => d.fixo).length;
  const score = calcularScore({
    bloqueios: bloqueios.length,
    licoesCarmicas: licoes.length,
    tendenciasOcultas: tendencias.length,
    debitosCarmicos: debitos.length,
    debitosCarmicoFixos: debitosFixosCount,
    compatibilidade: compatibilidadeSocio,
    compatibilidadeSecundaria: compatibilidadeEmpresa ?? undefined,
  });
  const scoreTeto = calcularScoreTeto(debitosFixosCount);

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
    scoreTeto,
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
  nomeSocioPrincipal: string,
  nomeSocio2: string | undefined,
  ramoAtividade: string | undefined,
  maxSugestoes = 5
): AnaliseNomeEmpresa[] {
  const pool = gerarPoolDinamico(nomeSocioPrincipal, nomeSocio2, ramoAtividade);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
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
  dataNascimentoSocio2?: string,
  ramoAtividade?: string,
  descricaoNegocio?: string
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
    const sugestoesIA = gerarSugestoesEmpresaIA(
      dataNascimentoSocio, dataFundacao,
      nomeSocioPrincipal, nomeSocio2, ramoAtividade, 5
    ).filter(s => !jaUsados.has(s.nomeEmpresa.toLowerCase()));
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
