import { getFeed, getTags } from '../lib/news';
import { SITE_ORIGIN } from '../lib/seo';
import { categories, postPath } from '../data/categories';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const tags = await getTags();
  const entries = [{ url: SITE_ORIGIN + '/' }, { url: SITE_ORIGIN + '/privacy-policy' }, ...categories.map(category => ({ url: SITE_ORIGIN + '/page/' + category.slug })), ...tags.map(tag => ({ url: SITE_ORIGIN + '/tag/' + encodeURIComponent(tag.slug) }))];
  let skip = 0;
  while (true) {
    const { posts, totalCount } = await getFeed(skip, 100);
    if (totalCount + entries.length > 50000) throw new Error('Split sitemap required above 50,000 URLs.');
    for (const post of posts) entries.push({ url: SITE_ORIGIN + postPath(post), ...(post.dateandtime && !Number.isNaN(Date.parse(post.dateandtime)) ? { lastModified: new Date(post.dateandtime) } : {}) });
    skip += posts.length;
    if (skip >= totalCount) break;
    if (!posts.length) throw new Error('Incomplete news feed; refusing to publish a partial sitemap.');
  }
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
