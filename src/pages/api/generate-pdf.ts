import type { APIRoute } from 'astro';
import { getAnalysis, getMagneticNames } from '../../backend/db/analyses';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { NomeSocialPDF } from '../../frontend/components/pdf/NomeSocialPDF';
import { NomeBebePDF } from '../../frontend/components/pdf/NomeBebePDF';
import { NomeEmpresaPDF } from '../../frontend/components/pdf/NomeEmpresaPDF';

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

  // Gera slug para uso no nome do arquivo
  function toSlug(str: string) {
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const productType = analysis.product_type ?? 'nome_social';
  let filename: string;
  if (productType === 'nome_bebe') {
    const sobrenome = toSlug(
      analysis.nome_completo.split(' ').slice(1).join(' ') || analysis.nome_completo
    );
    filename = `analise-nome-bebe-${sobrenome}-nome-magnetico.pdf`;
  } else if (productType === 'nome_empresa') {
    const freqData = (analysis as any).frequencias_numeros as any;
    const nomeEmpresa = freqData?.melhorNome?.nomeEmpresa ?? analysis.nome_completo;
    filename = `analise-nome-empresa-${toSlug(nomeEmpresa)}-nome-magnetico.pdf`;
  } else {
    filename = `analise-nome-social-${toSlug(analysis.nome_completo)}-nome-magnetico.pdf`;
  }

  const PDFComponent =
    productType === 'nome_bebe'
      ? NomeBebePDF
      : productType === 'nome_empresa'
        ? NomeEmpresaPDF
        : NomeSocialPDF;

  const pdfBuffer = await renderToBuffer(
    React.createElement(PDFComponent, {
      analysis: analysis as any,
      magneticNames,
      userName: firstName,
    }) as any
  );

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
