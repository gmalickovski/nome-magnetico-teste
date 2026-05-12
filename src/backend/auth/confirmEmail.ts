import { supabase } from '@/backend/db/supabase';

export async function confirmEmailAfterPayment(userId: string) {
  if (!userId) return;
  const verifiedAt = new Date().toISOString();

  const { data, error: fetchError } = await supabase.auth.admin.getUserById(userId);
  if (fetchError) {
    console.error('[confirm-email-after-payment] Falha ao buscar usuario:', fetchError.message);
    return;
  }

  if (!data.user?.email_confirmed_at) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: {
        ...(data.user.user_metadata ?? {}),
        email_verified_at: verifiedAt,
      },
    });

    if (error) {
      console.error('[confirm-email-after-payment] Falha ao confirmar email:', error.message);
    }
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(data.user.user_metadata ?? {}),
        email_verified_at: verifiedAt,
      },
    });

    if (error) {
      console.error('[confirm-email-after-payment] Falha ao marcar metadata:', error.message);
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email_verified_at: verifiedAt })
    .eq('id', userId)
    .is('email_verified_at', null);

  if (profileError) {
    console.warn('[confirm-email-after-payment] Profile marker skipped:', profileError.message);
  }
}
