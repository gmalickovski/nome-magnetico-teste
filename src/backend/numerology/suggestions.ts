/**
 * Geração e scoring de variações do nome sem bloqueios.
 */

import { calcularTrianguloDaVida } from './triangle';
import { calcularExpressao, calcularMotivacao, calcularMissao } from './numbers';
import { reduzirNumero } from './core';

export interface VariacaoNome {
  nome: string;
  numerosExpressao: number;
  motivacao: number;
  missao: number;
  temBloqueio: boolean;
  score: number;
  justificativa: string;
}

// Substituições de letras comuns para variações
const SUBSTITUICOES: Record<string, string[]> = {
  A: ['Á', 'Â', 'Ã'],
  E: ['É', 'Ê'],
  I: ['Í'],
  O: ['Ó', 'Ô', 'Õ'],
  U: ['Ú', 'Ü'],
  C: ['Ç'],
  Y: ['I', 'J'],
  K: ['C', 'Q'],
  W: ['V', 'U'],
  PH: ['F'],
  TH: ['T'],
  CH: ['X'],
};

// Sufixos comuns em nomes brasileiros
const SUFIXOS_COMUNS = ['a', 'o', 'e', 'i', 'us', 'is', 'as', 'os', 'es'];

/**
 * Gera variações de um nome completo.
 * Modifica o primeiro nome mantendo o(s) sobrenome(s).
 */
export function gerarVariacoes(nomeCompleto: string, quantidade = 5): string[] {
  const partes = nomeCompleto.trim().split(/\s+/);
  const primeiroNome = partes[0]!;
  const sobrenomes = partes.slice(1).join(' ');

  const variacoes = new Set<string>();

  // Variação 1: adicionar/remover letra final
  if (primeiroNome.endsWith('a') || primeiroNome.endsWith('A')) {
    variacoes.add(`${primeiroNome.slice(0, -1)}e ${sobrenomes}`.trim());
    variacoes.add(`${primeiroNome.slice(0, -1)}i ${sobrenomes}`.trim());
    variacoes.add(`${primeiroNome}na ${sobrenomes}`.trim());
  }
  if (primeiroNome.endsWith('o') || primeiroNome.endsWith('O')) {
    variacoes.add(`${primeiroNome.slice(0, -1)}a ${sobrenomes}`.trim());
    variacoes.add(`${primeiroNome.slice(0, -1)}e ${sobrenomes}`.trim());
  }

  // Variação 2: adicionar prefixo
  variacoes.add(`Ana ${primeiroNome} ${sobrenomes}`.trim());
  variacoes.add(`Maria ${primeiroNome} ${sobrenomes}`.trim());
  variacoes.add(`João ${primeiroNome} ${sobrenomes}`.trim());

  // Variação 3: substituições de letras (acentos)
  for (const [orig, subs] of Object.entries(SUBSTITUICOES)) {
    if (primeiroNome.toUpperCase().includes(orig)) {
      for (const sub of subs.slice(0, 2)) {
        const novo = primeiroNome.replace(new RegExp(orig, 'gi'), sub);
        if (novo !== primeiroNome) {
          variacoes.add(`${novo} ${sobrenomes}`.trim());
        }
      }
    }
  }

  // Variação 4: diminutivos/hipocorísticos comuns
  const nomeBase = primeiroNome.replace(/[aeiou]$/i, '');
  for (const sufixo of SUFIXOS_COMUNS.slice(0, 3)) {
    const novo = nomeBase + sufixo;
    if (novo.length >= 3 && novo !== primeiroNome.toLowerCase()) {
      const nomeCapitalizado = novo.charAt(0).toUpperCase() + novo.slice(1);
      variacoes.add(`${nomeCapitalizado} ${sobrenomes}`.trim());
    }
  }

  // Filtrar o nome original e limitar
  const resultado = Array.from(variacoes)
    .filter(v => v.toLowerCase() !== nomeCompleto.toLowerCase())
    .slice(0, quantidade * 3); // pegar mais para filtrar depois

  return resultado;
}

/**
 * Calcula o score de uma variação do nome.
 * Score 0-100 baseado em: sem bloqueios, boa expressão, harmonia numérica.
 */
export function scoreVariacao(
  nomeSugerido: string,
  numeroExpressaoAlvo: number,
  numeroDestinoAlvo: number
): VariacaoNome {
  const triangulo = calcularTrianguloDaVida(nomeSugerido);
  const expressao = calcularExpressao(nomeSugerido);
  const motivacao = calcularMotivacao(nomeSugerido);
  const missao = calcularMissao(nomeSugerido);
  const temBloqueio = triangulo.sequencias.length > 0;

  let score = 100;
  const justificativas: string[] = [];

  // Penalidades por bloqueios
  if (temBloqueio) {
    score -= triangulo.sequencias.length * 25;
    justificativas.push(`Contém ${triangulo.sequencias.length} bloqueio(s): ${triangulo.sequencias.join(', ')}`);
  } else {
    justificativas.push('Sem bloqueios energéticos');
  }

  // Bônus por compatibilidade com número de destino
  const expressaoReduzida = reduzirNumero(expressao, false);
  const destinoReduzido = reduzirNumero(numeroDestinoAlvo, false);

  if (expressaoReduzida === destinoReduzido) {
    score += 15;
    justificativas.push(`Expressão (${expressao}) harmônica com Destino (${numeroDestinoAlvo})`);
  } else if (Math.abs(expressaoReduzida - destinoReduzido) === 1) {
    score += 5;
    justificativas.push(`Expressão próxima ao Destino`);
  }

  // Bônus por compatibilidade com expressão original
  if (expressao === numeroExpressaoAlvo) {
    score += 10;
    justificativas.push(`Mantém número de Expressão original (${expressao})`);
  }

  // Garantir range 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    nome: nomeSugerido,
    numerosExpressao: expressao,
    motivacao,
    missao,
    temBloqueio,
    score,
    justificativa: justificativas.join(' | '),
  };
}

/**
 * Gera e rankeia variações sem bloqueios.
 */
export function gerarNomesMagneticos(
  nomeCompleto: string,
  numeroExpressao: number,
  numeroDestino: number,
  quantidade = 5
): VariacaoNome[] {
  const variacoes = gerarVariacoes(nomeCompleto, quantidade * 3);

  return variacoes
    .map(v => scoreVariacao(v, numeroExpressao, numeroDestino))
    .filter(v => !v.temBloqueio)
    .sort((a, b) => b.score - a.score)
    .slice(0, quantidade);
}
