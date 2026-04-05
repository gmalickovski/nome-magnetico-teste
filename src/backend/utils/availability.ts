/**
 * Verificação de disponibilidade digital de nomes de empresa.
 *
 * Verifica .com (RDAP Verisign), .com.br (RDAP Registro.br) e Instagram.
 * Todas as checagens são paralelas com timeout de 5s.
 * Falha graciosamente — retorna null quando não é possível verificar.
 */

export interface DisponibilidadeNome {
  dominioCom: boolean | null;    // true = livre, false = ocupado, null = não verificado
  dominioBr: boolean | null;
  instagram: boolean | null;
  verificadoEm: string;          // ISO timestamp
}

const TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

/** Normaliza o nome para uso como domínio/username (lowercase, sem espaços/acentos) */
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function verificarDominioCom(nome: string): Promise<boolean | null> {
  const normalizado = normalizarNome(nome);
  if (!normalizado) return null;
  try {
    const res = await withTimeout(
      fetch(`https://rdap.verisign.com/com/v1/domain/${normalizado}.com`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }),
      TIMEOUT_MS
    );
    if (res.status === 404) return true;   // livre
    if (res.status === 200) return false;  // ocupado
    return null;
  } catch {
    return null;
  }
}

async function verificarDominioBr(nome: string): Promise<boolean | null> {
  const normalizado = normalizarNome(nome);
  if (!normalizado) return null;
  try {
    const res = await withTimeout(
      fetch(`https://rdap.registro.br/domain/${normalizado}.com.br`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }),
      TIMEOUT_MS
    );
    if (res.status === 404) return true;
    if (res.status === 200) return false;
    return null;
  } catch {
    return null;
  }
}

async function verificarInstagram(nome: string): Promise<boolean | null> {
  const normalizado = normalizarNome(nome);
  if (!normalizado) return null;
  try {
    const res = await withTimeout(
      fetch(`https://www.instagram.com/${normalizado}/`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; bot)',
        },
      }),
      TIMEOUT_MS
    );
    if (res.status === 404) return true;
    if (res.status === 200) return false;
    return null;
  } catch {
    return null;
  }
}

async function verificarNome(nome: string): Promise<DisponibilidadeNome> {
  const [dominioCom, dominioBr, instagram] = await Promise.all([
    verificarDominioCom(nome),
    verificarDominioBr(nome),
    verificarInstagram(nome),
  ]);
  return {
    dominioCom,
    dominioBr,
    instagram,
    verificadoEm: new Date().toISOString(),
  };
}

/**
 * Verifica disponibilidade de .com, .com.br e Instagram para uma lista de nomes.
 * Retorna um Map com chave = nome normalizado (lowercase).
 */
export async function verificarDisponibilidadeNomes(
  nomes: string[]
): Promise<Map<string, DisponibilidadeNome>> {
  const unicos = [...new Set(nomes.filter(n => n.trim().length >= 2))];
  const resultados = await Promise.allSettled(
    unicos.map(nome => verificarNome(nome).then(disp => ({ nome: nome.toLowerCase(), disp })))
  );
  const mapa = new Map<string, DisponibilidadeNome>();
  for (const r of resultados) {
    if (r.status === 'fulfilled') {
      mapa.set(r.value.nome, r.value.disp);
    }
  }
  return mapa;
}
