import type { APIRoute } from 'astro';
import { getAnalysis, getMagneticNames } from '../../backend/db/analyses';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { AnalysePDF } from '../../frontend/components/pdf/AnalysePDF';

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) {
    // Redirect to login so the user can re-authenticate instead of seeing a blank error page
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/auth/login?redirect=' + encodeURIComponent(url.pathname + url.search) },
    });
  }

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
  const firstName = analysis.nome_completo.split(' ')[0];

  const pdfBuffer = await renderToBuffer(
    React.createElement(AnalysePDF, {
      analysis: analysis as any,
      magneticNames,
      userName: firstName,
    }) as any
  );

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="nome-magnetico-${firstName}.pdf"`,
    },
  });
};
