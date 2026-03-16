import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createCheckoutSession, type ProductType } from '../../backend/payments/stripe';
import { createUserClient } from '../../backend/db/supabase';

const schema = z.object({
  product_type: z.enum(['nome_magnetico', 'nome_bebe', 'nome_empresa']),
});

export const POST: APIRoute = async ({ request, cookies, url }) => {
  // Verificar autenticação
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: 'Autenticação necessária' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = createUserClient(accessToken);
  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'Sessão inválida' }),
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
  const baseUrl = url.origin;

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
