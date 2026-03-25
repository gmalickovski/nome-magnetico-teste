import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createCheckoutSession, type ProductType } from '../../backend/payments/stripe';

const schema = z.object({
  product_type: z.enum(['nome_social', 'nome_bebe', 'nome_empresa']),
});

export const POST: APIRoute = async ({ request, locals, url }) => {
  // Verificar autenticação
  const user = locals.user;
  const accessToken = locals.accessToken;

  if (!user || !accessToken) {
    return new Response(
      JSON.stringify({ error: 'Autenticação necessária' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
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
      JSON.stringify({ error: 'Produto inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { product_type } = parsed.data;
  // O Node SSR atrás de um proxy reverso as vezes recebe a origin como localhost ou IP
  // se o X-Forwarded-Host não estiver configurado perfeitamente no NGINX/Caddy.
  // APP_URL no .env é a fonte absoluta de verdade, logo, usamos ela como primeira opção.
  const baseUrl = process.env.APP_URL || url.origin;

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email ?? '',
      productType: product_type as ProductType,
      successUrl: `${baseUrl}/app?checkout=success`,
      cancelUrl: `${baseUrl}/comprar?checkout=cancel`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[create-checkout] Erro:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao criar sessão de pagamento' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
