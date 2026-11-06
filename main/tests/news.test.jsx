import { afterEach, expect, test } from 'bun:test';
import { sanitizeArticle, articleText } from '../src/utils/article';
import { matchesCategory, postPath, publishedDate } from '../src/data/categories';
import { articleMetadata, articleSchema, jsonLd, metadataFor, SITE_ORIGIN } from '../src/lib/seo';
import { getFeed, getArticle, pageNumber, routeSlug } from '../src/lib/news';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const post = { _id: 'a1', slug: 'پاکستان-کی-خبر-a1', title: 'پاکستان کی خبر', article: '<p>تفصیل &amp; مزید خبر</p>', thumbnailImage: 'https://res.cloudinary.com/example/image.webp', dateandtime: '2026-11-06T08:00:00Z', tags: [{ id: 't1', slug: 'pakistan', name: 'پاکستان', legacy_category: 'pakistan-news' }] };
test('server sanitizer removes executable markup and preserves editorial formatting', () => {
  const cleaned = sanitizeArticle('<p onclick="bad()">خبر<strong>اہم</strong></p><script>alert(1)</script><a href="javascript:bad()">link</a><img src="http://evil.test/a" onerror="bad()">');
  expect(cleaned).toContain('<strong>اہم</strong>'); expect(cleaned).not.toMatch(/onclick|onerror|javascript:|<script|http:\/\/evil/);
});
test('excerpts decode entities, preserve paragraphs, and keep complete Unicode code points', () => { expect(articleText('<p>A &amp; B</p><p>C</p>')).toBe('A & B C'); expect(articleText('🙂🙂🙂', 2)).toBe('🙂🙂…'); });
test('native Urdu slugs and legacy labels keep stable navigation', () => { expect(postPath(post)).toBe('/news/' + encodeURIComponent(post.slug)); expect(matchesCategory(post, 'pakistan-news')).toBe(true); expect(matchesCategory(post, 'pak')).toBe(false); expect(publishedDate('bad')).toBe(''); });
test('article metadata contains canonical, social image, Urdu title and publication timestamp', () => { const result = articleMetadata(post); expect(result.title.absolute).toBe('پاکستان کی خبر | 96 News HD | ہر خبر باوثوق'); expect(result.alternates.canonical).toBe(SITE_ORIGIN + postPath(post)); expect(result.description).toBe('تفصیل & مزید خبر'); expect(result.openGraph.type).toBe('article'); expect(result.twitter.images).toEqual([post.thumbnailImage]); expect(result.robots.index).toBe(true); });
test('search metadata is excluded from indexing', () => { expect(metadataFor('تلاش', '/search', undefined, undefined, true).robots.index).toBe(false); });
test('structured data cannot terminate its script tag', () => { const result = jsonLd(articleSchema({ ...post, title: '</script><script>bad()</script>' })); expect(result).not.toContain('</script>'); expect(JSON.parse(result).headline).toContain('</script>'); });
test('pagination rejects malformed or unsafe offsets', () => { for (const value of [undefined, '0', '-1', 'Infinity', '1.5', '999999', ['2']]) expect(pageNumber(value)).toBe(1); expect(pageNumber('12')).toBe(12); });
test('feed forwards encoded Urdu search, tag and page offset to the shared API', async () => { let seen; globalThis.fetch = async url => { seen = new URL(url); return Response.json({ posts: [post], totalCount: 13 }); }; expect((await getFeed(12, 12, 'pakistan', 'پاکستان & دنیا')).posts).toHaveLength(1); expect(seen.searchParams.get('skip')).toBe('12'); expect(seen.searchParams.get('query')).toBe('پاکستان & دنیا'); expect(seen.searchParams.get('tag')).toBe('pakistan'); });
test('API failures retain status so missing articles become real 404 responses', async () => { globalThis.fetch = async () => new Response('', { status: 404 }); await expect(getArticle('missing')).rejects.toMatchObject({ status: 404 }); });
test('malformed feed is rejected at the API boundary', async () => { globalThis.fetch = async () => Response.json({ posts: [{ title: 'missing id' }], totalCount: 1 }); await expect(getFeed()).rejects.toThrow('Invalid news response'); });
test('sitemap includes all pages of published articles, not private routes', async () => {
  const seen = []; globalThis.fetch = async url => { const parsed = new URL(url); if (parsed.pathname === '/api/tags') return Response.json({ tags: post.tags }); const offset = Number(parsed.searchParams.get('skip')); seen.push(offset); const posts = Array.from({ length: offset === 0 ? 100 : 1 }, (_, index) => ({ ...post, _id: String(index + offset), slug: 'خبر-' + (index + offset) })); return Response.json({ posts, totalCount: 101 }); };
  const result = await sitemap(); expect(seen).toEqual([0, 100]); expect(result.filter(row => row.url.includes('/news/'))).toHaveLength(101); expect(result.some(row => /\/admin|\/search|\/live/.test(row.url))).toBe(false); expect(result.some(row => row.url.endsWith('/tag/pakistan'))).toBe(true);
});
test('sitemap failure never publishes a misleading partial article list', async () => { globalThis.fetch = async url => new URL(url).pathname === '/api/tags' ? Response.json({ tags: [] }) : Response.json({ posts: [], totalCount: 10 }); await expect(sitemap()).rejects.toThrow('partial sitemap'); });
test('robots advertises canonical sitemap and excludes private and duplicate search URLs', () => { const result = robots(); expect(result.sitemap).toBe(SITE_ORIGIN + '/sitemap.xml'); expect(result.rules.disallow).toContain('/admin'); expect(result.rules.disallow).toContain('/search'); });

test('route values are decoded once for both encoded page params and decoded metadata params', () => { expect(routeSlug(encodeURIComponent(post.slug))).toBe(post.slug); expect(routeSlug(post.slug)).toBe(post.slug); expect(routeSlug('%bad')).toBe('%bad'); });
