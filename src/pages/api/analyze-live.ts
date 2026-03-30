import type { APIRoute } from 'astro';
import { z } from 'zod';
import { calcularTodosTriangulos, detectarBloqueios } from '@/backend/numerology/triangle';
import { calcularExpressao, calcularDestino, calcularMotivacao, calcularImpressao, calcularMissao } from '@/backend/numerology/numbers';
import { detectarLicoesCarmicas, detectarTendenciasOcultas, calcularDebitosCarmicos } from '@/backend/numerology/karmic';
import { avaliarCompatibilidade } from '@/backend/numerology/harmonization';
import { calcularScore } from '@/backend/numerology/score';

const RequestSchema = z.object({
  nome_candidato: z.string().min(2),
  data_nascimento_db: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // formato postgres
});

export const POST: APIRoute = async ({ request }) => {
  // OBS: Como essa rota batida com frenquência durante digitação,
  // Podemos mantê-la como endpoint computacional simples sem bater na DB.
  
  let body;
  try {
    body = RequestSchema.parse(await request.json());
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Dados inválidos' }), { status: 400 });
  }

  try {
    // Converter de YYYY-MM-DD para DD/MM/AAAA (o formato que o Triangle espera)
    const partes = body.data_nascimento_db.split('-');
    const bdDataStr = `${partes[2]}/${partes[1]}/${partes[0]}`;

    const triangulos = calcularTodosTriangulos(body.nome_candidato, bdDataStr);
    const bloqueios = detectarBloqueios(triangulos);
    
    // Números Core
    const expressao = calcularExpressao(body.nome_candidato);
    const destino = calcularDestino(bdDataStr);
    const motivacao = calcularMotivacao(body.nome_candidato);
    const impressao = calcularImpressao(body.nome_candidato);
    const missao = calcularMissao(body.nome_candidato, bdDataStr);

    // Kármico
    const licoesCarmicas = detectarLicoesCarmicas(body.nome_candidato);
    const tendenciasOcultas = detectarTendenciasOcultas(body.nome_candidato);
    const debitosCarmicos = calcularDebitosCarmicos(bdDataStr, destino, motivacao, expressao);

    // Compatibilidade e score unificado
    const compatibilidade = avaliarCompatibilidade(expressao, destino);
    const score = calcularScore({
      bloqueios: bloqueios.length,
      licoesCarmicas: licoesCarmicas.length,
      tendenciasOcultas: tendenciasOcultas.length,
      debitosCarmicos: debitosCarmicos.length,
      debitosCarmicoFixos: debitosCarmicos.filter(d => d.fixo).length,
      compatibilidade,
    });

    return new Response(JSON.stringify({
      triangulos,
      bloqueios,
      numeros: {
        expressao,
        destino,
        motivacao,
        impressao,
        missao
      },
      licoesCarmicas,
      tendenciasOcultas,
      debitosCarmicos,
      compatibilidade,
      score
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('[api/analyze-live] Erro:', error);
    return new Response(JSON.stringify({ error: 'Erro de cálculo interno' }), { status: 500 });
  }
};
