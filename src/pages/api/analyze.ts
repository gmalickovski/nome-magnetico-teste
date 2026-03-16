import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createUserClient } from '../../backend/db/supabase';
import { hasActiveSubscription } from '../../backend/db/subscriptions';
import { createAnalysis, updateAnalysis, saveMagneticNames } from '../../backend/db/analyses';
import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../../backend/numerology/triangle';
import { calcularCincoNumeros } from '../../backend/numerology/numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, mapearFrequencias } from '../../backend/numerology/karmic';
import { gerarNomesMagneticos } from '../../backend/numerology/suggestions';
import { generateAnalysis, generateSuggestions } from '../../backend/ai/brain';
import type { ProductType } from '../../backend/payments/stripe';

const schema = z.object({
  nome_completo: z.string().min(2).max(150),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  product_type: z.enum(['nome_magnetico', 'nome_bebe', 'nome_empresa']).default('nome_magnetico'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Autenticação necessária' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = createUserClient(accessToken);
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0]?.message }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { nome_completo, data_nascimento, product_type } = parsed.data;

  // Verificar subscription
  const hasAccess = await hasActiveSubscription(user.id, product_type as ProductType);
  if (!hasAccess) {
    return new Response(JSON.stringify({ error: 'Subscription inativa para este produto' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Criar análise no banco
  const analysis = await createAnalysis({
    userId: user.id,
    productType: product_type as ProductType,
    nomeCompleto: nome_completo,
    dataNascimento: data_nascimento,
  });

  // Processar em background (não bloqueia a resposta)
  (async () => {
    try {
      await updateAnalysis(analysis.id, { status: 'processing' });

      // Calcular todos os 4 triângulos
      const todosTriangulos = calcularTodosTriangulos(nome_completo, data_nascimento);
      const bloqueios = detectarBloqueios(todosTriangulos);
      const sequenciasNegativas = todasSequenciasNegativas(todosTriangulos);
      const cincoNumeros = calcularCincoNumeros(nome_completo, data_nascimento);

      // Lições cármicas e tendências ocultas
      const licoesCarmicas = detectarLicoesCarmicas(nome_completo);
      const tendenciasOcultas = detectarTendenciasOcultas(nome_completo);
      const frequenciasNumeros = mapearFrequencias(nome_completo);

      const arcanoRegente = todosTriangulos.vida.arcanoRegente;

      // Salvar dados numerológicos calculados
      await updateAnalysis(analysis.id, {
        numero_expressao: cincoNumeros.expressao,
        numero_destino: cincoNumeros.destino,
        numero_motivacao: cincoNumeros.motivacao,
        numero_missao: cincoNumeros.missao,
        numero_personalidade: cincoNumeros.personalidade,
        arcano_regente: arcanoRegente,
        bloqueios: bloqueios as unknown[],
        triangulo_vida: todosTriangulos.vida as unknown,
        triangulo_pessoal: todosTriangulos.pessoal as unknown,
        triangulo_social: todosTriangulos.social as unknown,
        triangulo_destino: todosTriangulos.destino as unknown,
        licoes_carmicas: licoesCarmicas as unknown[],
        tendencias_ocultas: tendenciasOcultas as unknown[],
        frequencias_numeros: frequenciasNumeros as unknown,
      });

      // Gerar análise IA completa (todos os 4 triângulos + karmic + tendências)
      const analiseTexto = await generateAnalysis(
        {
          nomeCompleto: nome_completo,
          dataNascimento: data_nascimento,
          cincoNumeros,
          arcanoRegente,
          todosTriangulos,
          bloqueios,
          licoesCarmicas,
          tendenciasOcultas,
        },
        user.id,
        analysis.id
      );

      // Gerar variações de nomes magnéticos (apenas para produto nome_magnetico)
      if (product_type === 'nome_magnetico') {
        const variacoes = gerarNomesMagneticos(
          nome_completo,
          cincoNumeros.expressao,
          cincoNumeros.destino,
          8
        );

        // Gerar descrição IA das sugestões
        await generateSuggestions(
          { nomeCompleto: nome_completo, cincoNumeros, variacoesCandidatas: variacoes },
          user.id,
          analysis.id
        );

        // Salvar nomes magnéticos
        await saveMagneticNames(analysis.id, user.id, variacoes.map(v => ({
          nomeSugerido: v.nome,
          numeroExpressao: v.numerosExpressao,
          motivacao: v.motivacao,
          missao: v.missao,
          temBloqueio: v.temBloqueio,
          score: v.score,
          justificativa: v.justificativa,
        })));
      }

      await updateAnalysis(analysis.id, {
        analise_texto: analiseTexto,
        status: 'complete',
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[analyze] Erro ao processar:', err);
      await updateAnalysis(analysis.id, {
        status: 'error',
        error_message: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  return new Response(JSON.stringify({ analysisId: analysis.id }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
