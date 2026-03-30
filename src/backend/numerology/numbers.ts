/**
 * Cálculo dos números principais da numerologia cabalística.
 */

import {
  calcularValor,
  reduzirNumero,
  ehVogal,
  ehConsoante,
  extrairLetras,
} from './core';

export interface CincoNumeros {
  expressao: number;
  destino: number;
  motivacao: number;
  impressao: number;
  missao: number;
}

/**
 * 1. Número de Expressão: todas as letras do nome completo
 */
export function calcularExpressao(nomeCompleto: string): number {
  const letras = extrairLetras(nomeCompleto);
  const soma = letras.reduce((acc, l) => acc + calcularValor(l), 0);
  return reduzirNumero(soma, true);
}

/**
 * 2. Número de Destino: soma dos dígitos da data de nascimento
 */
export function calcularDestino(dataNascimento: string): number {
  // Aceita formato DD/MM/AAAA ou DDMMAAAA
  const digitos = dataNascimento.replace(/\D/g, '');
  const soma = digitos.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduzirNumero(soma, true);
}

/**
 * 3. Número de Motivação/Alma: apenas vogais do nome completo
 */
export function calcularMotivacao(nomeCompleto: string): number {
  const letras = extrairLetras(nomeCompleto);
  const vogais = letras.filter(l => ehVogal(l));
  const soma = vogais.reduce((acc, l) => acc + calcularValor(l), 0);
  return reduzirNumero(soma, true);
}

/**
 * 4. Número de Impressão: apenas consoantes do nome completo
 *    ATENÇÃO: Não existe Impressão 11 e 22 — masters NÃO são preservados.
 */
export function calcularImpressao(nomeCompleto: string): number {
  const letras = extrairLetras(nomeCompleto);
  const consoantes = letras.filter(l => ehConsoante(l));
  const soma = consoantes.reduce((acc, l) => acc + calcularValor(l), 0);
  return reduzirNumero(soma, false);
}

/**
 * 5. Número de Missão/Vocação: Destino + Expressão
 *    Preserva masters 11 e 22.
 */
export function calcularMissao(nomeCompleto: string, dataNascimento: string): number {
  const expressao = calcularExpressao(nomeCompleto);
  const destino = calcularDestino(dataNascimento);
  return reduzirNumero(expressao + destino, true);
}

/**
 * Calcula todos os números de uma vez.
 */
export function calcularCincoNumeros(
  nomeCompleto: string,
  dataNascimento: string
): CincoNumeros {
  return {
    expressao: calcularExpressao(nomeCompleto),
    destino: calcularDestino(dataNascimento),
    motivacao: calcularMotivacao(nomeCompleto),
    impressao: calcularImpressao(nomeCompleto),
    missao: calcularMissao(nomeCompleto, dataNascimento),
  };
}
