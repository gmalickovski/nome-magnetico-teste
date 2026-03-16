import { supabase } from './supabase';
import type { ProductType } from '../payments/stripe';

export interface Subscription {
  id: string;
  user_id: string;
  product_type: ProductType;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid: number | null;
  currency: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

/**
 * Verifica se o usuário tem subscription ativa para um produto.
 */
export async function hasActiveSubscription(
  userId: string,
  productType: ProductType = 'nome_magnetico'
): Promise<boolean> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('subscriptions')
    .select('id, ends_at')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .gt('ends_at', new Date().toISOString())
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/**
 * Retorna a subscription ativa mais recente do usuário.
 */
export async function getActiveSubscription(
  userId: string,
  productType: ProductType = 'nome_magnetico'
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .gt('ends_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as Subscription;
}

/**
 * Cria uma nova subscription após pagamento confirmado.
 */
export async function createSubscription(params: {
  userId: string;
  productType: ProductType;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amountPaid?: number;
  currency?: string;
}): Promise<Subscription> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('subscriptions')
    .insert({
      user_id: params.userId,
      product_type: params.productType,
      stripe_session_id: params.stripeSessionId,
      stripe_payment_intent_id: params.stripePaymentIntentId,
      amount_paid: params.amountPaid,
      currency: params.currency ?? 'brl',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Subscription;
}

/**
 * Lista todas as subscriptions de um usuário.
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Subscription[];
}
