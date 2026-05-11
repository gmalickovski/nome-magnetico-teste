/**
 * /api/save-lead
 * Endpoint público (sem autenticação) para salvar leads da prévia gratuita.
 * Chamado por PublicAnalysisForm antes de redirecionar para o cadastro.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../backend/db/supabase';

const schema = z.object({
  email:           z.string().email().max(200),
  nome_completo:   z.string().min(2).max(150),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  source:          z.string().max(50).optional().default('analise_gratuita'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body  = await request.json();
    const input = schema.parse(body);

    await supabase.from('analise_leads').insert({
      email:           input.email.toLowerCase().trim(),
      nome_completo:   input.nome_completo.trim(),
      data_nascimento: input.data_nascimento,
      source:          input.source,
    });
  } catch {
    // Fail silently — não bloquear o fluxo do usuário
  }

  // Sempre retornar 200 para não expor erros internos
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
