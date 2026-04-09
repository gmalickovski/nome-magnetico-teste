import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://nomemagnetico.com.br';

  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-04-09' },
    { url: '/comprar', changefreq: 'weekly', priority: '0.9', lastmod: '2026-04-09' },
    { url: '/auth/cadastro', changefreq: 'monthly', priority: '0.7', lastmod: '2026-04-09' },
    { url: '/suporte', changefreq: 'monthly', priority: '0.6', lastmod: '2026-04-09' },
    { url: '/privacidade', changefreq: 'yearly', priority: '0.3', lastmod: '2026-03-18' },
    { url: '/termos', changefreq: 'yearly', priority: '0.3', lastmod: '2026-03-18' },
    { url: '/reembolso', changefreq: 'yearly', priority: '0.3', lastmod: '2026-03-18' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
