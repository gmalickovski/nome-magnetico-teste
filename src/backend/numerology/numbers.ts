/**
 * Cálculo dos 5 números principais da numerologia cabalística.
 */

import {
  calcularValor,
  reduzirNumero,
  ehVogal,
  ehConsoante,
  extrairLetras,
  extrairPrimeiroNome,
} from './core';

export interface CincoNumeros {
  expressao: number;
  destino: number;
  motivacao: number;
  missao: number;
  personalidade: number;
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
 * 4. Número de Missão/Impressão: apenas consoantes do nome completo
 */
export function calcularMissao(nomeCompleto: string): number {
  const letras = extrairLetras(nomeCompleto);
  const consoantes = letras.filter(l => ehConsoante(l));
  const soma = consoantes.reduce((acc, l) => acc + calcularValor(l), 0);
  return reduzirNumero(soma, true);
}

/**
 * 5. Número de Personalidade: apenas o primeiro nome
 */
export function calcularPersonalidade(nomeCompleto: string): number {
  const primeiroNome = extrairPrimeiroNome(nomeCompleto);
  const letras = extrairLetras(primeiroNome);
  const soma = letras.reduce((acc, l) => acc + calcularValor(l), 0);
  return reduzirNumero(soma, false);
}

/**
 * Calcula todos os 5 números de uma vez.
 */
export function calcularCincoNumeros(
  nomeCompleto: string,
  dataNascimento: string
): CincoNumeros {
  return {
    expressao: calcularExpressao(nomeCompleto),
    destino: calcularDestino(dataNascimento),
    motivacao: calcularMotivacao(nomeCompleto),
    missao: calcularMissao(nomeCompleto),
    personalidade: calcularPersonalidade(nomeCompleto),
  };
}
