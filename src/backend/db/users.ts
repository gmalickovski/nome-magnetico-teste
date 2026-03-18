import { supabase } from './supabase';

export interface Profile {
  id: string;
  email: string;
  nome: string | null;
  phone: string | null;
  birth_name: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  app_source: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Perfil + status do plano ativo — resultado da view user_status */
export interface UserStatus extends Profile {
  subscription_id: string | null;
  product_type: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  amount_paid: number | null;
  has_active_plan: boolean;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

/** Retorna perfil + status do plano em uma única query (via view user_status). */
export async function getUserStatus(userId: string): Promise<UserStatus | null> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('user_status')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserStatus;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'nome' | 'phone' | 'avatar_url' | 'birth_name' | 'birth_date'>>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .schema('nome_magnetico')
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) return null;
  return data as Profile;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .schema('nome_magnetico')
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin';
}

/**
 * Lista usuários para o painel admin.
 * Inclui status do plano (has_active_plan) via view user_status.
 */
export async function listUsers(page = 1, perPage = 20, filters?: {
  role?: 'user' | 'admin';
  hasActivePlan?: boolean;
}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .schema('nome_magnetico')
    .from('user_status')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.hasActivePlan !== undefined) {
    query = query.eq('has_active_plan', filters.hasActivePlan);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { users: (data ?? []) as UserStatus[], total: count ?? 0 };
}

/** Promove ou rebaixa um usuário (apenas service role). */
export async function setUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<boolean> {
  const { error } = await supabase
    .schema('nome_magnetico')
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}
