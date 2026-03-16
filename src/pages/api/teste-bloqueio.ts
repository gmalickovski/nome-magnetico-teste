import type { APIRoute } from 'astro';
import { z } from 'zod';
import { calcularTrianguloDaVida, detectarBloqueios } from '../../backend/numerology/triangle';
import { calcularCincoNumeros } from '../../backend/numerology/numbers';

const schema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/AAAA'),
});

// Rate limit simples em memória (produção: usar Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  // Rate limit por IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('cf-connecting-ip') ??
    '0.0.0.0';

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Muitas requisições. Tente novamente em 1 hora.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validar body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { nome_completo, data_nascimento } = parsed.data;

  try {
    const triangulo = calcularTrianguloDaVida(nome_completo);
    const bloqueios = detectarBloqueios(triangulo.sequencias);
    const cincoNumeros = calcularCincoNumeros(nome_completo, data_nascimento);

    // Retornar apenas dados parciais (chamariz — análise completa requer pagamento)
    return new Response(
      JSON.stringify({
        nome: nome_completo.split(' ')[0],
        arcanoRegente: triangulo.arcanoRegente,
        quantidadeBloqueios: bloqueios.length,
        bloqueios: bloqueios.map(b => ({
          codigo: b.codigo,
          titulo: b.titulo,
          // Só mostrar o início da descrição como teaser
          descricao: b.descricao.split('.')[0] + '.',
        })),
        numerosBasicos: {
          expressao: cincoNumeros.expressao,
          destino: cincoNumeros.destino,
        },
        temBloqueios: bloqueios.length > 0,
        // Análise completa requer plano
        analiseCompleta: null,
        cta: {
          mensagem: bloqueios.length > 0
            ? `${nome_completo.split(' ')[0]}, detectamos ${bloqueios.length} bloqueio(s) no seu nome. A análise completa revela como transformar essa energia.`
            : `${nome_completo.split(' ')[0]}, seu nome tem uma vibração energética poderosa! Descubra como potencializá-la ainda mais.`,
          url: '/comprar',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[teste-bloqueio] Erro:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar análise' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
