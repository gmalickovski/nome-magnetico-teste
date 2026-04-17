/**
 * Wrapper tipado para umami.track — eventos customizados do Nome Magnético.
 * O script do Umami é carregado via BaseLayout.astro.
 */

type UmamiEvent =
  | 'cta_hero_click'
  | 'cta_produto_click'
  | 'cta_nome_social_hero'
  | 'cta_nome_bebe_hero'
  | 'cta_nome_empresarial_hero'
  | 'pricing_view'
  | 'precos_view'
  | 'lp_view'
  | 'checkout_start'
  | 'checkout_redirect_start'
  | 'checkout_failed'
  | 'coupon_applied'
  | 'purchase_complete'
  | 'report_generated'
  | 'pdf_downloaded'
  | 'analise_gratis_submit'
  | 'analise_resultado_cta_click'
  | 'calculadora_submit'
  | 'blog_cta_click'
  | 'blog_cta_lp_click'
  | 'blog_article_view';

interface EventData {
  produto?: 'nome_social' | 'nome_bebe' | 'nome_empresa';
  posicao?: string;
  preco?: number;
  promocao?: string | null;
  codigo_cupom?: string;
  desconto?: number;
  valor?: number;
  tempo_segundos?: number;
  origem?: string;
  erro?: string;
}

export function track(event: UmamiEvent, data?: EventData): void {
  if (typeof window !== 'undefined' && (window as unknown as { umami?: { track: (e: string, d?: unknown) => void } }).umami) {
    (window as unknown as { umami: { track: (e: string, d?: unknown) => void } }).umami.track(event, data);
  }
}
