import assert from 'node:assert/strict';
const slug = 'پاکستان-کی-خبر-a1';
const post = { _id: 'a1', id: 'a1', slug, title: 'پاکستان کی خبر', article: '<p>پاکستان کی مکمل خبر یہاں موجود ہے۔</p><script>alert(1)</script>', thumbnailImage: 'https://res.cloudinary.com/example/image/upload/a.webp', dateandtime: '2026-11-06T08:00:00Z', authorname: '96 نیوز ایچ ڈی', tags: [{ id: 't1', slug: 'pakistan', name: 'پاکستان', legacy_category: 'pakistan-news' }] };
const backend = Bun.serve({ port: 0, hostname: '127.0.0.1', fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === '/api/tags') return Response.json({ tags: post.tags });
  if (url.pathname === '/api/tags/pakistan') return Response.json({ tag: post.tags[0] });
  if (url.pathname === '/api/posts') { const skip = Number(url.searchParams.get('skip')); return Response.json({ posts: skip ? [] : [post], totalCount: 1 }); }
  if (url.pathname.startsWith('/api/posts/') && ['a1', slug].includes(decodeURIComponent(url.pathname.slice('/api/posts/'.length)))) return Response.json({ post });
  return Response.json({ error: 'Not found' }, { status: 404 });
} });
const port = 18000 + Math.floor(Math.random() * 10000);
const app = Bun.spawn(['node', './node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env: { ...process.env, API_URL: 'http://127.0.0.1:' + backend.port, NEXT_TELEMETRY_DISABLED: '1' }, stdout: 'ignore', stderr: 'pipe' });
async function get(path) { const r = await fetch('http://127.0.0.1:' + port + path, { headers: { 'User-Agent': 'Googlebot' }, redirect: 'manual', signal: AbortSignal.timeout(20000) }); return { status: r.status, html: await r.text(), headers: r.headers }; }
try {
  let ready = false;
  for (let i = 0; i < 40; i++) { try { await get('/robots.txt'); ready = true; break; } catch { await Bun.sleep(250); } }
  assert(ready, 'Next server did not become ready');
  const home = await get('/'); assert.equal(home.status, 200); assert(home.html.includes('پاکستان کی خبر')); assert(home.html.includes('<title>96 News HD | ہر خبر باوثوق</title>'));
  const article = await get('/news/' + encodeURIComponent(slug)); assert.equal(article.status, 200); assert(article.html.includes('<title>پاکستان کی خبر | 96 News HD | ہر خبر باوثوق</title>')); assert(article.html.includes('property="og:type" content="article"'), article.html.match(/<meta[^>]+(?:og:|twitter:)[^>]*>/g)?.join('\n')); assert(article.html.includes('application/ld+json')); assert(article.html.includes('پاکستان کی مکمل خبر یہاں موجود ہے۔')); assert(!article.html.includes('<script>alert(1)</script>')); assert(article.html.includes('rel="canonical"')); assert(article.html.indexOf('property="og:type"') < article.html.indexOf('</head>'), 'Article metadata must be inside head');
  const legacy = await get('/news/a1'); assert.equal(legacy.status, 308); assert(legacy.headers.get('location').endsWith(encodeURIComponent(slug)));
  for (const path of ['/news/missing', '/tag/missing', '/page/unknown', '/admin']) assert.equal((await get(path)).status, 404, path);
  const tag = await get('/tag/pakistan'); assert.equal(tag.status, 200); assert(tag.html.includes('<title>پاکستان | 96 News HD | ہر خبر باوثوق</title>'));
  const search = await get('/search?q=' + encodeURIComponent('پاکستان')); assert.equal(search.status, 200); assert(search.html.includes('content="noindex, follow"')); assert(search.html.includes('پاکستان کی خبر'));
  const robots = await get('/robots.txt'); assert.equal(robots.status, 200); assert(robots.html.includes('https://www.96newshd.com/sitemap.xml'));
  const sitemap = await get('/sitemap.xml'); assert.equal(sitemap.status, 200); assert(sitemap.html.includes('/news/' + encodeURIComponent(slug))); assert(!sitemap.html.includes('/admin'));
  const live = await get('/live'); assert.equal(live.status, 200); assert(live.html.includes('فی الحال بند')); assert(!live.html.includes('<video'));
  console.log('HTTP verification passed: rendered news, article metadata/JSON-LD, direct sharing URL, canonical redirect, 404s, tags/search, robots, sitemap, paused live.');
} finally { app.kill(); backend.stop(true); }
