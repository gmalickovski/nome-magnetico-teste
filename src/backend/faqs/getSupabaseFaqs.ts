import { supabase } from '../db/supabase';
import { marked } from 'marked';
import type { FaqItemProps } from '../../frontend/components/landing/FAQSection';

// Configura marked para FAQ (sem sanitização extra — conteúdo nosso)
marked.use({ gfm: true, breaks: false });

interface GetFaqsOptions {
  featuredOnly?: boolean;
}

export async function getSupabaseFaqs(opts: GetFaqsOptions = {}): Promise<FaqItemProps[]> {
  let query = supabase
    .from('faq_items')
    .select('id, question, answer_markdown, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (opts.featuredOnly) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;
  if (error || !data?.length) return [];

  return data.map(item => ({
    id: item.id,
    question: item.question,
    answer: '',
    answer_html: marked.parse(item.answer_markdown ?? '') as string,
  }));
}
