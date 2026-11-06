import { afterEach, expect, test } from 'bun:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';
import api from '../src/api/apis';
import { getPost } from '../src/api/postblog.api';
import { matchesCategory, mergePosts, publishedDate, postPath } from '../src/data/categories';
import { articleText, sanitizeArticle } from '../src/utils/article';

const originalAdapter = api.defaults.adapter;
let root;

function post(index, category = 'pakistan-news') {
  return { _id: `post-${index}`, title: `خبر نمبر ${index}`, category,
    article: '<p>پاکستان کی اہم خبر اور تفصیلات</p>', thumbnailImage: 'https://example.com/news.jpg', dateandtime: '2026-06-01T10:00:00Z' };
}

function respond(config, data) {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

async function mount(path) {
  window.history.replaceState({}, '', path);
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
}

async function waitFor(check) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (check()) return;
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
  }
  throw new Error('UI did not reach the expected state: ' + document.body.textContent.slice(-500));
}

function button(text) {
  return [...document.querySelectorAll('button')].find(element => element.textContent.includes(text));
}

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  document.body.innerHTML = '';
  api.defaults.adapter = originalAdapter;
});

test('article sanitizer keeps editorial formatting and removes executable HTML and style overrides', () => {
  const clean = sanitizeArticle('<p style="position:fixed" onclick="alert(1)"><strong>خبر</strong><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">لنک</a></p><script>alert(4)</script><iframe src="https://example.com"></iframe>');
  const element = document.createElement('div');
  element.innerHTML = clean;
  expect(element.querySelector('strong').textContent).toBe('خبر');
  expect(element.querySelector('script, iframe, [onclick], [onerror], [style], [href^="javascript:"]')).toBeNull();
});

test('excerpts decode entities, preserve paragraph boundaries and do not split Unicode characters', () => {
  expect(articleText('<p>پاکستان &amp; دنیا</p><p>خبریں</p><script>bad()</script>')).toBe('پاکستان & دنیا خبریں');
  expect(articleText('<p>😀خبر</p>', 1)).toBe('😀…');
  expect(articleText(null)).toBe('');
});

test('category matches are exact, batches deduplicate stories and invalid dates stay empty', () => {
  expect(matchesCategory(post(1, 'not-pakistan-news'), 'pakistan-news')).toBe(false);
  expect(matchesCategory(post(1, ['sports-news', 'pakistan-news']), 'pakistan-news')).toBe(true);
  expect(mergePosts([post(1)], [post(1), post(2)]).map(item => item._id)).toEqual(['post-1', 'post-2']);
  expect(publishedDate('not-a-date')).toBe('');
});

test('malformed feed responses fail at the API boundary', async () => {
  api.defaults.adapter = async config => respond(config, { posts: null, totalCount: 10 });
  await expect(getPost()).rejects.toThrow('Invalid news response');
});

test('anonymous homepage renders stories without authentication, editor or live playback', async () => {
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    return respond(config, { posts: Array.from({ length: 9 }, (_, index) => post(index)), totalCount: 9 });
  };
  await mount('/');
  expect(document.querySelector('.news-card--lead h2').textContent).toBe('خبر نمبر 0');
  expect(calls).toEqual(['/api/getpost']);
  expect(document.title).toBe('96 News HD | ہر خبر باوثوق');
  expect(document.querySelector('video, a[href="/live"], a[href^="/admin"], a[href^="/portal"], a[href^="/auth"]')).toBeNull();
});

test('load more uses consecutive offsets; retry retains stories and reuses the failed offset', async () => {
  const offsets = [];
  let failOnce = true;
  api.defaults.adapter = async config => {
    const offset = config.params.skip;
    offsets.push(offset);
    if (offset === 12 && failOnce) { failOnce = false; throw new Error('Connection failed'); }
    return respond(config, { posts: Array.from({ length: Math.min(12, 25 - offset) }, (_, index) => post(offset + index)), totalCount: 25 });
  };
  await mount('/page/latest-news');
  expect(document.title).toBe('تازہ ترین | 96 News HD | ہر خبر باوثوق');
  expect(document.querySelectorAll('.listing-page .news-card').length).toBe(12);
  await act(async () => button('مزید خبریں دیکھیں').click());
  expect(document.querySelectorAll('.listing-page .news-card').length).toBe(12);
  await act(async () => button('دوبارہ کوشش کریں').click());
  expect(document.querySelectorAll('.listing-page .news-card').length).toBe(24);
  await act(async () => button('مزید خبریں دیکھیں').click());
  expect(document.querySelectorAll('.listing-page .news-card').length).toBe(25);
  expect(offsets).toEqual([0, 12, 12, 24]);
  expect(button('مزید خبریں دیکھیں')).toBeUndefined();
});

test('category pagination asks the backend to filter labels and uses its filtered count', async () => {
  const tagged = { ...post(1, 'sports-news'), tags: [
    { id: 'sports', name: 'کھیل', slug: 'sports', legacy_category: 'sports-news' },
    { id: 'pakistan', name: 'پاکستان', slug: 'pakistan', legacy_category: 'pakistan-news' },
  ] };
  api.defaults.adapter = async config => {
    expect(config.params.tag).toBe('pakistan-news');
    return respond(config, { posts: [tagged], totalCount: 1 });
  };
  await mount('/page/pakistan-news');
  expect(document.querySelectorAll('.listing-page .news-card').length).toBe(1);
  expect(button('مزید خبریں دیکھیں')).toBeUndefined();
  expect(matchesCategory(tagged, 'pakistan-news')).toBe(true);
});

test('Urdu slug links and label pages use the API label name and filter', async () => {
  const tagged = { ...post(1), slug: 'اردو-خبر-abc123', tags: [{ id: 'education', name: 'تعلیم', slug: 'تعلیم' }] };
  expect(postPath(tagged)).toBe('/news/' + encodeURIComponent(tagged.slug));
  expect(postPath(post(1))).toBe('/news/post-1');
  api.defaults.adapter = async config => {
    if (config.url.startsWith('/api/tags/')) return respond(config, { tag: tagged.tags[0] });
    expect(config.params.tag).toBe('تعلیم');
    return respond(config, { posts: [tagged], totalCount: 1 });
  };
  await mount('/tag/' + encodeURIComponent('تعلیم'));
  expect(document.querySelector('.page-heading h1').textContent).toBe('تعلیم');
  expect(document.querySelector('.story-link').getAttribute('href')).toBe(postPath(tagged));
  expect(document.title).toBe('تعلیم | 96 News HD | ہر خبر باوثوق');
});

test('switching category cancels the old request and prevents stale stories overwriting the new page', async () => {
  let oldSignal;
  let resolveOld;
  let calls = 0;
  api.defaults.adapter = config => {
    calls++;
    if (calls === 1) {
      oldSignal = config.signal;
      return new Promise(resolve => { resolveOld = () => resolve(respond(config, { posts: [post(1)], totalCount: 1 })); });
    }
    return Promise.resolve(respond(config, { posts: [post(2, 'sports-news')], totalCount: 1 }));
  };
  await mount('/page/pakistan-news');
  const sports = document.querySelector('.primary-nav a[href="/page/sports-news"]');
  await act(async () => sports.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })));
  expect(oldSignal.aborted).toBe(true);
  await act(async () => resolveOld());
  expect(document.querySelector('.listing-page .news-card h2').textContent).toBe('خبر نمبر 2');
});

test('search URL preserves Urdu and special characters as one query parameter', async () => {
  const query = 'پاکستان & دنیا';
  let received;
  api.defaults.adapter = async config => {
    received = config.params.query;
    return respond(config, { results: [post(1)] });
  };
  await mount(`/search?${new URLSearchParams({ q: query })}`);
  expect(received).toBe(query);
  expect(document.title).toBe('پاکستان & دنیا | تلاش | 96 News HD | ہر خبر باوثوق');
  expect(document.querySelector('#news-query').value).toBe(query);
  expect(document.querySelector('.news-card')).not.toBeNull();
});

test('article page renders sanitized HTML and current article metadata', async () => {
  api.defaults.adapter = async config => respond(config, config.url.includes('getpostbyid')
    ? { post: { ...post(1), article: '<p><strong>خبر</strong><img src="x" onerror="bad()"></p>' }, authorname: 'رپورٹر' }
    : { posts: [post(2)], totalCount: 1 });
  await mount('/news/post-1');
  await waitFor(() => document.querySelector('.article-body'));
  expect(document.querySelector('.article-body strong').textContent).toBe('خبر');
  expect(document.querySelector('.article-body [onerror]')).toBeNull();
  expect(document.querySelector('.full-article h1').textContent).toBe('خبر نمبر 1');
  expect(document.title).toBe('خبر نمبر 1 | 96 News HD | ہر خبر باوثوق');
});

test('disabled live route shows a notice and never starts a player or API request', async () => {
  let calls = 0;
  api.defaults.adapter = async () => { calls++; throw new Error('Unexpected request'); };
  await mount('/live');
  expect(document.body.textContent).toContain('لائیو نشریات فی الحال بند ہیں');
  expect(document.querySelector('video')).toBeNull();
  expect(calls).toBe(0);
});

test.each(['/admin/users', '/admin/paymentverify', '/portal/new-post', '/portal/profile', '/auth/login', '/auth/signup'])(
  'staff route %s is unavailable and never requests account data', async path => {
    let calls = 0;
    api.defaults.adapter = async () => { calls++; throw new Error('Unexpected request'); };
    await mount(path);
    expect(document.body.textContent).toContain('یہ صفحہ نہیں ملا');
    expect(calls).toBe(0);
  },
);
