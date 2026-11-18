import type { APIRoute } from 'astro';
import { STATIC_ROUTES, SITE } from '@/config/site';
import { getPublicProducts } from '@/lib/catalog';
import { buildSitemap } from '@/lib/sitemap';

export const GET: APIRoute = async () => {
  const products = await getPublicProducts();
  const xml = buildSitemap([...STATIC_ROUTES, ...products.map((p) => `/products/${p.slug}/`)], SITE.origin);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
