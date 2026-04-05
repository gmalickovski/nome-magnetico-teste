import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createUserClient } from '../../backend/db/supabase';
import { hasActiveSubscription } from '../../backend/db/subscriptions';
import { createAnalysis, updateAnalysis, saveMagneticNames } from '../../backend/db/analyses';
import { calcularTodosTriangulos, detectarBloqueios, todasSequenciasNegativas } from '../../backend/numerology/triangle';
import { calcularCincoNumeros } from '../../backend/numerology/numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, mapearFrequencias, calcularDebitosCarmicos } from '../../backend/numerology/karmic';
import { gerarNomesMagneticos } from '../../backend/numerology/suggestions';
import { generateAnalysis, generateSuggestions, generateBabyAnalysis, generateCompanyAnalysis, generateSocialAnalysis } from '../../backend/ai/brain';
import { calcularScore, calcularScoreTeto } from '../../backend/numerology/score';
import { avaliarCompatibilidade } from '../../backend/numerology/harmonization';
import { analisarNomesBebe } from '../../backend/numerology/products/nome-bebe';
import { analisarNomesEmpresa } from '../../backend/numerology/products/nome-empresa';
import { analisarNomesSocial } from '../../backend/numerology/products/nome-social';
import type { ProductType } from '../../backend/payments/stripe';

const schema = z.object({
  nome_completo: z.string().min(2).max(150),
  data_nascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  product_type: z.enum(['nome_social', 'nome_bebe', 'nome_empresa']).default('nome_social'),
  // campos específicos nome_bebe
  sobrenome_familia: z.string().min(1).max(100).optional(),
  nomes_candidatos: z.array(z.string().min(2)).optional(),
  nome_pai: z.string().optional(),
  sobrenome_pai: z.string().optional(),
  ignorar_pai: z.boolean().optional(),
  nome_mae: z.string().optional(),
  sobrenome_mae: z.string().optional(),
  ignorar_mae: z.boolean().optional(),
  outros_sobrenomes: z.array(z.string()).optional(),
  genero_preferido: z.string().optional(),
  estilo_preferido: z.string().optional(),
  caracteristicas_desejadas: z.string().max(300).optional(),
  // campos específicos nome_empresa
  data_fundacao: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).optional(),
  ramo_atividade: z.string().optional(),
  descricao_negocio: z.string().optional(),
  nome_socio2: z.string().min(2).max(150).optional(),
  data_nascimento_socio2: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).optional(),
  // campos específicos nome_social (novo fluxo)
  objetivo_apresentacao: z.string().max(500).optional(),
  vibracoes_desejadas: z.string().max(300).optional(),
  contexto_uso: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  const accessToken = (locals as any).accessToken;

  if (!user || !accessToken) {
    return new Response(JSON.stringify({ error: 'Autenticação necessária' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createUserClient(accessToken);

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

  const {
    nome_completo, data_nascimento, product_type,
    sobrenome_familia, nomes_candidatos,
    nome_pai, sobrenome_pai, ignorar_pai,
    nome_mae, sobrenome_mae, ignorar_mae,
    outros_sobrenomes,
    genero_preferido, estilo_preferido, caracteristicas_desejadas,
    data_fundacao, ramo_atividade, descricao_negocio,
    nome_socio2, data_nascimento_socio2,
    objetivo_apresentacao, vibracoes_desejadas, contexto_uso,
  } = parsed.data;

  const { data: profile } = await supabase
    
    .from('profiles')
    .select('gender, role')
    .eq('id', user.id)
    .single();

  const gender = profile?.gender || 'Neutro';
  const isAdmin = profile?.role === 'admin';

  // Verificar subscription
  const hasAccess = await hasActiveSubscription(user.id, product_type as ProductType);
  if (!hasAccess && !isAdmin) {
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

      let analiseTexto: string;

      if (product_type === 'nome_empresa') {
        // ── Produto: Nome da Empresa ──
        const candidatos = nomes_candidatos ?? [];

        const resultado = analisarNomesEmpresa(
          candidatos,
          nome_completo,
          data_nascimento,
          data_fundacao ?? null,
          nome_socio2,
          data_nascimento_socio2,
          ramo_atividade,
          descricao_negocio
        );

        // Calcular triângulos do melhor nome (mesmo padrão do nome_bebe)
        const melhorNomeEmpresaStr = resultado.melhorNome?.nomeEmpresa ?? null;
        const dataTriangulosEmpresa = data_fundacao ?? data_nascimento;
        const todosTriangulosEmpresa = melhorNomeEmpresaStr
          ? calcularTodosTriangulos(melhorNomeEmpresaStr, dataTriangulosEmpresa)
          : null;

        await updateAnalysis(analysis.id, {
          frequencias_numeros: resultado as unknown,
          numero_destino: resultado.destinoSocio,
          numero_missao: resultado.melhorNome?.missao ?? null,
          numero_impressao: resultado.melhorNome?.impressao ?? null,
          score: resultado.melhorNome?.score ?? null,
          triangulo_vida:    todosTriangulosEmpresa?.vida    as unknown ?? null,
          triangulo_pessoal: todosTriangulosEmpresa?.pessoal as unknown ?? null,
          triangulo_social:  todosTriangulosEmpresa?.social  as unknown ?? null,
          triangulo_destino: todosTriangulosEmpresa?.destino as unknown ?? null,
        });

        analiseTexto = await generateCompanyAnalysis(
          {
            resultado,
            ramoAtividade: ramo_atividade,
            descricaoNegocio: descricao_negocio,
          },
          user.id,
          analysis.id
        );
      } else if (product_type === 'nome_bebe') {
        // ── Produto: Nome do Bebê ──
        const candidatos = nomes_candidatos ?? [];

        const sobrenomesValidos: string[] = [];
        if (outros_sobrenomes && outros_sobrenomes.length > 0) {
          sobrenomesValidos.push(...outros_sobrenomes);
        }
        if (!ignorar_mae && sobrenome_mae) {
          sobrenomesValidos.push(sobrenome_mae);
        }
        if (!ignorar_pai && sobrenome_pai) {
          sobrenomesValidos.push(sobrenome_pai);
        }
        
        // Fallback for legacy requests 
        if (sobrenomesValidos.length === 0 && sobrenome_familia) {
          sobrenomesValidos.push(sobrenome_familia);
        }
        if (sobrenomesValidos.length === 0) {
          sobrenomesValidos.push(nome_completo.replace('(bebê) ', ''));
        }

        const resultado = analisarNomesBebe(candidatos, sobrenomesValidos, data_nascimento, genero_preferido);

        const melhorNome = resultado.melhorNome;
        const cincoNums = melhorNome
          ? calcularCincoNumeros(melhorNome.nomeCompleto, data_nascimento)
          : null;
        const todosTriangulosBebe = melhorNome
          ? calcularTodosTriangulos(melhorNome.nomeCompleto, data_nascimento)
          : null;
        const freqMapBebe = melhorNome ? mapearFrequencias(melhorNome.nomeCompleto) : {};

        await updateAnalysis(analysis.id, {
          frequencias_numeros: { ranking: resultado, frequencias: freqMapBebe } as unknown,
          numero_expressao:    melhorNome?.expressao    ?? null,
          numero_destino:      resultado.destino,
          numero_motivacao:    melhorNome?.motivacao    ?? null,
          numero_missao:       melhorNome?.missao       ?? null,
          numero_impressao:    melhorNome?.impressao    ?? null,
          bloqueios:           (melhorNome?.bloqueios ?? []) as unknown[],
          triangulo_vida:      todosTriangulosBebe?.vida    as unknown ?? null,
          triangulo_pessoal:   todosTriangulosBebe?.pessoal as unknown ?? null,
          triangulo_social:    todosTriangulosBebe?.social  as unknown ?? null,
          triangulo_destino:   todosTriangulosBebe?.destino as unknown ?? null,
          licoes_carmicas:     (melhorNome?.licoesCarmicas ?? [])    as unknown[],
          tendencias_ocultas:  (melhorNome?.tendenciasOcultas ?? []) as unknown[],
          debitos_carmicos:    (melhorNome?.debitosCarmicos ?? [])   as unknown[],
          score: melhorNome?.score ?? null,
        });

        analiseTexto = await generateBabyAnalysis(
          {
            resultado,
            nomePai: nome_pai,
            nomeMae: nome_mae,
            generoPreferido: genero_preferido,
            estiloPreferido: estilo_preferido,
            caracteristicasDesejadas: caracteristicas_desejadas,
          },
          user.id,
          analysis.id
        );
      } else if (product_type === 'nome_social') {
        // ── Produto: Nome Social (novo fluxo) ──
        const candidatos = nomes_candidatos ?? [];

        const resultado = analisarNomesSocial(
          candidatos,
          nome_completo,
          data_nascimento,
          genero_preferido
        );

        const melhor = resultado.melhorNome;
        const todosTriangulosSocial = melhor
          ? calcularTodosTriangulos(melhor.nomeCompleto, data_nascimento)
          : null;
        const freqMapSocial = melhor ? mapearFrequencias(melhor.nomeCompleto) : {};

        await updateAnalysis(analysis.id, {
          frequencias_numeros: { ranking: resultado, frequencias: freqMapSocial } as unknown,
          numero_expressao:    melhor?.expressao    ?? null,
          numero_destino:      resultado.destino,
          numero_motivacao:    melhor?.motivacao    ?? null,
          numero_missao:       melhor?.missao       ?? null,
          numero_impressao:    melhor?.impressao    ?? null,
          bloqueios:           (melhor?.bloqueios   ?? []) as unknown[],
          triangulo_vida:      todosTriangulosSocial?.vida    as unknown ?? null,
          triangulo_pessoal:   todosTriangulosSocial?.pessoal as unknown ?? null,
          triangulo_social:    todosTriangulosSocial?.social  as unknown ?? null,
          triangulo_destino:   todosTriangulosSocial?.destino as unknown ?? null,
          licoes_carmicas:     (melhor?.licoesCarmicas    ?? []) as unknown[],
          tendencias_ocultas:  (melhor?.tendenciasOcultas ?? []) as unknown[],
          debitos_carmicos:    (melhor?.debitosCarmicos   ?? []) as unknown[],
          score: melhor?.score ?? null,
        });

        // Salvar inputs do formulário para histórico
        const parts = data_nascimento.split('/');
        const dataNascIso = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : data_nascimento;
        await supabase.from('social_name_inputs').insert({
          analysis_id: analysis.id,
          user_id: user.id,
          nome_nascimento: nome_completo,
          data_nascimento: dataNascIso,
          objetivo_apresentacao: objetivo_apresentacao ?? null,
          vibracoes_desejadas: vibracoes_desejadas ?? null,
          contexto_uso: contexto_uso ?? null,
          estilo_preferido: estilo_preferido ?? null,
          genero: genero_preferido ?? null,
          nomes_candidatos: candidatos,
        });

        analiseTexto = await generateSocialAnalysis(
          {
            resultado,
            nomeNascimento: nome_completo,
            objetivoApresentacao: objetivo_apresentacao,
            vibracoesDesejadas: vibracoes_desejadas,
            contextoUso: contexto_uso,
            estiloPreferido: estilo_preferido,
            genero: genero_preferido,
          },
          user.id,
          analysis.id
        );
      } else {
        // ── Produto: fallback genérico (não deve ocorrer com os 3 produtos definidos) ──
        const todosTriangulos = calcularTodosTriangulos(nome_completo, data_nascimento);
        const bloqueios = detectarBloqueios(todosTriangulos);
        const sequenciasNegativas = todasSequenciasNegativas(todosTriangulos);
        const cincoNumeros = calcularCincoNumeros(nome_completo, data_nascimento);

        const licoesCarmicas = detectarLicoesCarmicas(nome_completo);
        const tendenciasOcultas = detectarTendenciasOcultas(nome_completo);
        const frequenciasNumeros = mapearFrequencias(nome_completo);
        const debitosCarmicos = calcularDebitosCarmicos(
          data_nascimento,
          cincoNumeros.destino,
          cincoNumeros.motivacao,
          cincoNumeros.expressao
        );

        const arcanoRegente = todosTriangulos.vida.arcanoRegente;

        const compatibilidade = avaliarCompatibilidade(cincoNumeros.expressao, cincoNumeros.destino);
        const score = calcularScore({
          bloqueios: bloqueios.length,
          licoesCarmicas: licoesCarmicas.length,
          tendenciasOcultas: tendenciasOcultas.length,
          debitosCarmicos: debitosCarmicos.length,
          debitosCarmicoFixos: debitosCarmicos.filter(d => d.fixo).length,
          compatibilidade,
        });

        await updateAnalysis(analysis.id, {
          numero_expressao: cincoNumeros.expressao,
          numero_destino: cincoNumeros.destino,
          numero_motivacao: cincoNumeros.motivacao,
          numero_missao: cincoNumeros.missao,
          numero_impressao: cincoNumeros.impressao,
          arcano_regente: arcanoRegente,
          bloqueios: bloqueios as unknown[],
          triangulo_vida: todosTriangulos.vida as unknown,
          triangulo_pessoal: todosTriangulos.pessoal as unknown,
          triangulo_social: todosTriangulos.social as unknown,
          triangulo_destino: todosTriangulos.destino as unknown,
          licoes_carmicas: licoesCarmicas as unknown[],
          tendencias_ocultas: tendenciasOcultas as unknown[],
          debitos_carmicos: debitosCarmicos as unknown[],
          frequencias_numeros: frequenciasNumeros as unknown,
          score,
        });

        analiseTexto = await generateAnalysis(
          {
            nomeCompleto: nome_completo,
            dataNascimento: data_nascimento,
            cincoNumeros,
            arcanoRegente,
            todosTriangulos,
            bloqueios,
            licoesCarmicas,
            tendenciasOcultas,
            debitosCarmicos,
            gender,
          },
          user.id,
          analysis.id
        );
        void sequenciasNegativas;
      }

      await updateAnalysis(analysis.id, {
        analise_texto: analiseTexto,
        status: 'complete',
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isQuota = errMsg.includes('QUOTA_EXCEEDED');
      console.error('[analyze] Erro ao processar:', isQuota ? 'QUOTA_EXCEEDED (Groq + OpenAI)' : err);
      await updateAnalysis(analysis.id, {
        status: 'error',
        error_message: isQuota
          ? 'Nosso sistema de análise está com alta demanda agora. Por favor, tente novamente em alguns minutos. 🙏'
          : errMsg,
      });
    }
  })();

  return new Response(JSON.stringify({ analysisId: analysis.id }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
