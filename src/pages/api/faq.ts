import type { APIRoute } from 'astro';
import { supabase } from '../../backend/db/supabase';

export const GET: APIRoute = async ({ url }) => {
  const categorySlug = url.searchParams.get('category') ?? null;

  // Buscar categorias ativas
  const { data: categories, error: catErr } = await supabase
    .from('faq_categories')
    .select('id, title, slug, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (catErr) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar categorias.' }), { status: 500 });
  }

  // Buscar itens ativos, filtrando por categoria se solicitado
  let query = supabase
    .from('faq_items')
    .select('id, category_id, question, answer, answer_html, slug, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (categorySlug) {
    const cat = categories?.find(c => c.slug === categorySlug);
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data: items, error: itemsErr } = await query;

  if (itemsErr) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar FAQs.' }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ categories: categories ?? [], items: items ?? [] }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutos de cache público
      },
    },
  );
};
