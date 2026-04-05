/**
 * Lógica específica do produto Nome Social (novo fluxo).
 *
 * Fluxo:
 * 1. Calcular número de Destino do usuário pela data de nascimento (âncora imutável).
 * 2. Para cada nome candidato, calcular os 4 triângulos e o score completo.
 * 3. Se todos os candidatos do usuário ficarem abaixo de 70, gerar sugestões
 *    automáticas a partir de um banco de nomes brasileiros comuns.
 * 4. Rankear por score total. Retornar melhorNome + top3 + lista completa.
 */

import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularMissao, calcularImpressao } from '../numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from '../karmic';
import { avaliarCompatibilidade } from '../harmonization';
import { calcularScore, calcularScoreTeto } from '../score';
import type { LicaoCarmica, TendenciaOculta, DebitoCarmicoInfo } from '../karmic';
import type { Bloqueio } from '../triangle';

// ── Banco de nomes brasileiros comuns para sugestões automáticas ──────────────
const NOMES_FEMININOS = [
  'Ana', 'Alice', 'Amanda', 'Beatriz', 'Bruna', 'Camila', 'Carla', 'Carolina',
  'Clara', 'Daniela', 'Diana', 'Eduarda', 'Elena', 'Elisa', 'Fernanda', 'Gabriela',
  'Helena', 'Isabela', 'Isadora', 'Jade', 'Julia', 'Laura', 'Larissa', 'Leticia',
  'Livia', 'Luisa', 'Luna', 'Manuela', 'Mariana', 'Marina', 'Natalia', 'Nicole',
  'Olivia', 'Patricia', 'Paula', 'Rebeca', 'Renata', 'Sara', 'Sofia', 'Sophia',
  'Stella', 'Valentina', 'Vera', 'Vitoria', 'Yasmin', 'Giovanna', 'Bianca',
  'Cecilia', 'Ingrid', 'Mirella',
];

const NOMES_MASCULINOS = [
  'Arthur', 'Bruno', 'Carlos', 'Daniel', 'David', 'Diego', 'Eduardo', 'Emanuel',
  'Enzo', 'Felipe', 'Fernando', 'Gabriel', 'Gustavo', 'Heitor', 'Henrique',
  'Hugo', 'Ian', 'Igor', 'Joao', 'Jose', 'Julio', 'Leonardo', 'Lorenzo',
  'Lucas', 'Luis', 'Luiz', 'Marco', 'Mateus', 'Matheus', 'Miguel', 'Nicolas',
  'Paulo', 'Pedro', 'Rafael', 'Raul', 'Ricardo', 'Roberto', 'Rodrigo', 'Samuel',
  'Sergio', 'Thiago', 'Tiago', 'Victor', 'Vinicius', 'Vitor', 'William', 'Andre',
  'Caio', 'Davi', 'Murilo',
];

const NOMES_NEUTROS = [...NOMES_FEMININOS, ...NOMES_MASCULINOS];

export interface AnaliseNomeSocial {
  nomeCompleto: string;
  expressao: number;
  motivacao: number;
  missao: number;
  impressao: number;
  /** Destino do usuário (âncora imutável pela data de nascimento). */
  destino: number;
  temBloqueio: boolean;
  bloqueios: Bloqueio[];
  sequenciasNegativas: string[];
  licoesCarmicas: LicaoCarmica[];
  tendenciasOcultas: TendenciaOculta[];
  debitosCarmicos: DebitoCarmicoInfo[];
  compatibilidade: 'total' | 'complementar' | 'aceitavel' | 'incompativel';
  score: number;
  /** Score máximo atingível para este usuário (100 - débitos fixos × 12). */
  scoreTeto: number;
  justificativa: string[];
  /** Indica se foi sugerido pelo algoritmo quando os candidatos têm scores baixos. */
  origemSugerida: 'usuario' | 'ia';
}

export interface ResultadoNomeSocial {
  nomeNascimento: string;
  dataNascimento: string;
  destino: number;
  /** Lista completa ranqueada por score DESC. */
  nomesCandidatos: AnaliseNomeSocial[];
  melhorNome: AnaliseNomeSocial | null;
  /** Os 3 seguintes ao melhor (índices 1–3). */
  top3: AnaliseNomeSocial[];
}

/**
 * Analisa um único nome candidato para nome social.
 */
export function analisarNomeSocial(
  nomeCandidato: string,
  dataNascimentoUsuario: string,
  origem: 'usuario' | 'ia' = 'usuario'
): AnaliseNomeSocial {
  const nomeCompleto = nomeCandidato.trim();

  const todos = calcularTodosTriangulos(nomeCompleto, dataNascimentoUsuario);
  const bloqueios = detectarBloqueios(todos);
  const sequencias = todasSequenciasNegativas(todos);
  const expressao = calcularExpressao(nomeCompleto);
  const motivacao = calcularMotivacao(nomeCompleto);
  const missao = calcularMissao(nomeCompleto, dataNascimentoUsuario);
  const impressao = calcularImpressao(nomeCompleto);
  const destino = calcularDestino(dataNascimentoUsuario);
  const licoes = detectarLicoesCarmicas(nomeCompleto);
  const tendencias = detectarTendenciasOcultas(nomeCompleto);
  const debitos = calcularDebitosCarmicos(dataNascimentoUsuario, destino, motivacao, expressao);
  const compatibilidade = avaliarCompatibilidade(expressao, destino);

  const debitosFixosCount = debitos.filter(d => d.fixo).length;
  const score = calcularScore({
    bloqueios: bloqueios.length,
    licoesCarmicas: licoes.length,
    tendenciasOcultas: tendencias.length,
    debitosCarmicos: debitos.length,
    debitosCarmicoFixos: debitosFixosCount,
    compatibilidade,
  });
  const scoreTeto = calcularScoreTeto(debitosFixosCount);

  const justificativa: string[] = [];

  if (bloqueios.length === 0) {
    justificativa.push('Sem bloqueios em nenhum dos 4 triângulos');
  } else {
    justificativa.push(`${bloqueios.length} bloqueio(s): ${bloqueios.map(b => b.codigo).join(', ')}`);
  }

  switch (compatibilidade) {
    case 'total':
      justificativa.push(`Expressão (${expressao}) totalmente harmônica com Destino (${destino})`);
      break;
    case 'complementar':
      justificativa.push(`Expressão (${expressao}) complementar ao Destino (${destino})`);
      break;
    case 'aceitavel':
      justificativa.push(`Expressão (${expressao}) aceitável para o Destino (${destino})`);
      break;
    case 'incompativel':
      justificativa.push(`Expressão (${expressao}) pouco compatível com Destino (${destino})`);
      break;
  }

  if (licoes.length > 0) justificativa.push(`${licoes.length} lição(ões) kármica(s)`);
  if (debitos.length > 0) justificativa.push(`${debitos.length} débito(s): ${debitos.map(d => d.numero).join(', ')}`);

  return {
    nomeCompleto,
    expressao,
    motivacao,
    missao,
    impressao,
    destino,
    temBloqueio: bloqueios.length > 0,
    bloqueios,
    sequenciasNegativas: sequencias,
    licoesCarmicas: licoes,
    tendenciasOcultas: tendencias,
    debitosCarmicos: debitos,
    compatibilidade,
    score,
    scoreTeto,
    justificativa,
    origemSugerida: origem,
  };
}

/**
 * Gera sugestões automáticas de nomes com score >= 80.
 * Usado quando todos os candidatos do usuário ficam abaixo de 70.
 */
function gerarSugestoesAutoSocial(
  dataNascimento: string,
  generoPreferido?: string,
  maxSugestoes = 5
): AnaliseNomeSocial[] {
  const genero = (generoPreferido ?? '').toLowerCase();
  let pool: string[];

  if (genero === 'feminino') {
    pool = NOMES_FEMININOS;
  } else if (genero === 'masculino') {
    pool = NOMES_MASCULINOS;
  } else {
    pool = NOMES_NEUTROS;
  }

  // Embaralhar para não retornar sempre os mesmos nomes
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const sugestoes: AnaliseNomeSocial[] = [];
  const vistosNomes = new Set<string>();

  // Primeira passagem: buscar score >= 80
  for (const nome of shuffled) {
    if (sugestoes.length >= maxSugestoes) break;
    const analise = analisarNomeSocial(nome, dataNascimento, 'ia');
    if (!vistosNomes.has(analise.nomeCompleto) && analise.score >= 80) {
      sugestoes.push(analise);
      vistosNomes.add(analise.nomeCompleto);
    }
  }

  // Segunda passagem: se não atingiu o mínimo, pegar os melhores independente do score
  if (sugestoes.length < 2) {
    const todos = shuffled
      .map(nome => analisarNomeSocial(nome, dataNascimento, 'ia'))
      .filter(a => !vistosNomes.has(a.nomeCompleto))
      .sort((a, b) => b.score - a.score);

    for (const analise of todos) {
      if (sugestoes.length >= maxSugestoes) break;
      if (!vistosNomes.has(analise.nomeCompleto)) {
        sugestoes.push(analise);
        vistosNomes.add(analise.nomeCompleto);
      }
    }
  }

  return sugestoes.sort((a, b) => b.score - a.score);
}

/**
 * Analisa múltiplos nomes candidatos para nome social e retorna ranking completo.
 * Se todos os candidatos ficarem abaixo de 70, gera sugestões automáticas.
 */
export function analisarNomesSocial(
  nomesCandidatos: string[],
  nomeNascimento: string,
  dataNascimento: string,
  generoPreferido?: string
): ResultadoNomeSocial {
  const destino = calcularDestino(dataNascimento);

  // Analisar candidatos do usuário
  const analises: AnaliseNomeSocial[] = nomesCandidatos
    .map(n => n.trim())
    .filter(n => n.length >= 2)
    .map(n => analisarNomeSocial(n, dataNascimento, 'usuario'));

  analises.sort((a, b) => b.score - a.score);

  const melhorScoreUsuario = analises[0]?.score ?? 0;

  // Se nenhum candidato do usuário atinge score excelente (≥ 80), gerar sugestões automáticas
  // para garantir sempre opções de alta qualidade junto das do usuário
  if (melhorScoreUsuario < 80) {
    const nomesCandidatosSet = new Set(
      analises.map(a => a.nomeCompleto.toLowerCase())
    );

    const sugestoesIA = gerarSugestoesAutoSocial(
      dataNascimento,
      generoPreferido,
      5
    ).filter(s => !nomesCandidatosSet.has(s.nomeCompleto.toLowerCase()));

    analises.push(...sugestoesIA);
    analises.sort((a, b) => b.score - a.score);
  }

  return {
    nomeNascimento,
    dataNascimento,
    destino,
    nomesCandidatos: analises,
    melhorNome: analises[0] ?? null,
    top3: analises.slice(1, 4),
  };
}
