import { supabase } from '@/backend/db/supabase';

export async function confirmEmailAfterPayment(userId: string) {
  if (!userId) return;

  const { data, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError) {
    console.error('[confirm-email-after-payment] Falha ao buscar usuario:', fetchError.message);
    return;
  }

  if (!data.user?.email_confirmed_at) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error('[confirm-email-after-payment] Falha ao confirmar email:', error.message);
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', userId)
    .is('email_verified_at', null);

  if (profileError) {
    console.error('[confirm-email-after-payment] Falha ao marcar profile:', profileError.message);
  }
}
