import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createUserClient } from '@/backend/db/supabase';

const RequestSchema = z.object({
  birth_name: z.string().min(2, "Nome curto demais"),
  birth_date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data no formato DD/MM/AAAA"),
  gender: z.enum(['Masculino', 'Feminino', 'Neutro'], { required_error: "Gênero é obrigatório" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, accessToken } = locals as any;

  if (!user || !accessToken) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const supabase = createUserClient(accessToken);

  let body;
  try {
    body = RequestSchema.parse(await request.json());
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Dados inválidos' }), { status: 400 });
  }

  // Converter formato brasileiro DD/MM/AAAA para YYYY-MM-DD para salvar no BD
  const partesData = body.birth_date.split('/');
  const dbFormatDate = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

  const { error } = await supabase
    
    .from('profiles')
    .update({
      birth_name: body.birth_name,
      birth_date: dbFormatDate,
      gender: body.gender,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    console.error('[api/user/save-base-profile] Error:', error);
    return new Response(JSON.stringify({ error: 'Erro ao salvar perfil' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
