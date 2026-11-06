import { SITE_ORIGIN } from '../lib/seo';
export default function robots() { return { rules: { userAgent: '*', allow: '/', disallow: ['/search', '/live', '/api/', '/admin', '/portal', '/auth'] }, sitemap: SITE_ORIGIN + '/sitemap.xml', host: SITE_ORIGIN }; }
