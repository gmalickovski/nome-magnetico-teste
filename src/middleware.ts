import { defineMiddleware } from 'astro:middleware';
import { createUserClient } from './backend/db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Rotas públicas — sem verificação
  const publicPaths = [
    '/',
    '/comprar',
    '/suporte',
    '/api/teste-bloqueio',
    '/api/create-checkout',
    '/api/stripe-webhook',
  ];

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_astro/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/);

  if (isPublic) {
    return next();
  }

  // Verificar sessão para rotas protegidas
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
      return context.redirect('/auth/login?redirect=' + encodeURIComponent(pathname));
    }
    return next();
  }

  try {
    const client = createUserClient(accessToken);
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
      // Token inválido — limpar cookies e redirecionar
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });

      if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
        return context.redirect('/auth/login');
      }
      return next();
    }

    // Injetar usuário no contexto
    context.locals.user = user;
    context.locals.accessToken = accessToken;

    // Verificar acesso admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const { data: profile } = await client
        .schema('nome_magnetico')
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
