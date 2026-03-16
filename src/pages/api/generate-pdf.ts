import type { APIRoute } from 'astro';
import { createUserClient } from '../../backend/db/supabase';
import { getAnalysis, getMagneticNames } from '../../backend/db/analyses';

export const GET: APIRoute = async ({ url, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response('Autenticação necessária', { status: 401 });
  }

  const client = createUserClient(accessToken);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return new Response('Sessão inválida', { status: 401 });

  const analysisId = url.searchParams.get('id');
  if (!analysisId) return new Response('ID ausente', { status: 400 });

  const analysis = await getAnalysis(analysisId);
  if (!analysis || analysis.user_id !== user.id) {
    return new Response('Análise não encontrada', { status: 404 });
  }

  if (analysis.status !== 'complete') {
    return new Response('Análise ainda não concluída', { status: 400 });
  }

  const magneticNames = await getMagneticNames(analysisId);

  // Por ora retorna JSON da análise — integrar @react-pdf/renderer na FASE 10
  return new Response(
    JSON.stringify({ analysis, magneticNames }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="nome-magnetico-${analysis.nome_completo.split(' ')[0]}.json"`,
      },
    }
  );
};
