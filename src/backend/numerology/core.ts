/**
 * Núcleo de numerologia cabalística.
 * Portado do index.html original.
 */

// Tabela de conversão letra → número (numerologia cabalística)
export const TABELA_CONVERSAO: Record<string, number> = {
  A: 1, I: 1, Q: 1, J: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4, X: 4,
  E: 5, H: 5, N: 5,
  U: 6, V: 6, W: 6, Ç: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Diacríticos (modificadores)
const DIACRITICO_AGUDO = '\u0301';   // ´ → +2
const DIACRITICO_TIL = '\u0303';    // ~ → +3
const DIACRITICO_GRAVE = '\u0300';  // ` → ×3

/**
 * Calcula o valor numerológico de uma única letra.
 * Aplica os modificadores de acento conforme as regras cabalísticas.
 */
export function calcularValor(letra: string): number {
  const decomposto = letra.normalize('NFD');
  const base = decomposto.charAt(0).toUpperCase();

  if (base === 'Ç') return 6;

  let valor = TABELA_CONVERSAO[base] ?? 0;

  if (decomposto.length > 1) {
    const diacritico = decomposto.charAt(1);
    switch (diacritico) {
      case DIACRITICO_AGUDO:
        valor += 2;
        break;
      case DIACRITICO_TIL:
        valor += 3;
        break;
      case DIACRITICO_GRAVE:
        valor *= 3;
        break;
    }
  }

  return valor;
}

/**
 * Reduz um número somando seus dígitos, preservando masters 11 e 22 se solicitado.
 */
export function reduzirNumero(n: number, preservarMasters = false): number {
  if (n === undefined || n === null || isNaN(n)) return 0;
  let numero = Math.floor(n);

  while (numero > 9 && !(preservarMasters && (numero === 11 || numero === 22))) {
    numero = String(numero)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  return numero;
}

/**
 * Verifica se uma letra é vogal (para cálculo de Motivação/Alma).
 */
export function ehVogal(letra: string): boolean {
  const base = letra.normalize('NFD').charAt(0).toUpperCase();
  return ['A', 'E', 'I', 'O', 'U'].includes(base);
}

/**
 * Verifica se uma letra é consoante (para cálculo de Missão/Impressão).
 */
export function ehConsoante(letra: string): boolean {
  const base = letra.normalize('NFD').charAt(0).toUpperCase();
  return /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇÑ]$/i.test(base) && !ehVogal(letra);
}

/**
 * Extrai apenas letras (sem espaços) do nome completo.
 */
export function extrairLetras(nome: string): string[] {
  return nome
    .replace(/\s+/g, '')
    .split('')
    .filter(l => /\S/.test(l));
}

/**
 * Extrai apenas o primeiro nome.
 */
export function extrairPrimeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
