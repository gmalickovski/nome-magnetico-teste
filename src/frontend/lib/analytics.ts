/**
 * Wrapper tipado para umami.track — eventos customizados do Nome Magnético.
 * O script do Umami é carregado via BaseLayout.astro.
 */

type UmamiEvent =
  | 'cta_hero_click'
  | 'cta_produto_click'
  | 'pricing_view'
  | 'checkout_start'
  | 'coupon_applied'
  | 'purchase_complete'
  | 'report_generated'
  | 'pdf_downloaded'
  | 'calculadora_submit'
  | 'blog_cta_click';

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
}

export function track(event: UmamiEvent, data?: EventData): void {
  if (typeof window !== 'undefined' && (window as unknown as { umami?: { track: (e: string, d?: unknown) => void } }).umami) {
    (window as unknown as { umami: { track: (e: string, d?: unknown) => void } }).umami.track(event, data);
  }
}
