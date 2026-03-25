import { defineMiddleware } from 'astro:middleware';
import { supabase } from './backend/db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Fast-path para assets estáticos para não bater no Supabase
  const isAsset =
    pathname.startsWith('/_astro/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/);

  if (isAsset) {
    return next();
  }

  // Verificar sessão para rotas protegidas
  // Cookie nomeado com o storageKey isolado do app (evita colisão com outros
  // apps na mesma instância Supabase, ex: Sincro em localhost).
  // O storageKey 'nome-magnetico-auth' é configurado em supabase-browser.ts.
  const accessToken =
    context.cookies.get('nome-magnetico-auth-access-token')?.value ??
    context.cookies.get('sb-access-token')?.value;
  const refreshToken =
    context.cookies.get('nome-magnetico-auth-refresh-token')?.value ??
    context.cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
      return context.redirect('/auth/login?redirect=' + encodeURIComponent(pathname));
    }
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Token inválido — limpar cookies e redirecionar
      context.cookies.delete('nome-magnetico-auth-access-token', { path: '/' });
      context.cookies.delete('nome-magnetico-auth-refresh-token', { path: '/' });
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });

      if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
        return context.redirect('/auth/login');
      }
      return next();
    }

    // Verificar isolamento de app via app_metadata.apps
    // Bloqueia apenas usuários explicitamente taggeados para outros apps.
    // Usuários sem a chave 'apps' (criados antes do sistema de tags) passam.
    const apps = user.app_metadata?.apps as string[] | undefined;
    if (apps !== undefined && !apps.includes('nome_magnetico')) {
      context.cookies.delete('nome-magnetico-auth-access-token', { path: '/' });
      context.cookies.delete('nome-magnetico-auth-refresh-token', { path: '/' });
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });
      if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
        return context.redirect('/auth/login?msg=sem-acesso');
      }
      return next();
    }

    // Injetar usuário no contexto
    context.locals.user = user;
    context.locals.accessToken = accessToken;

    // Verificar acesso admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return new Response(JSON.stringify({ error: 'Acesso negado' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return context.redirect('/app');
      }
    }
  } catch {
    if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
      return context.redirect('/auth/login');
    }
  }

  return next();
});
