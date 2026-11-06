import { getFeed, pageNumber } from '../../lib/news';
import { metadataFor } from '../../lib/seo';
import NewsListing from '../../components/NewsListing';
export async function generateMetadata({ searchParams }) { const query = (await searchParams).q; return metadataFor(typeof query === 'string' && query.trim() ? query.trim() + ' | تلاش' : 'تلاش', '/search', undefined, undefined, true); }
export default async function SearchPage({ searchParams }) {
  const params = await searchParams; const query = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : ''; const page = pageNumber(params.page);
  const data = query ? await getFeed((page - 1) * 12, 12, '', query) : null;
  return <><div className="news-container listing-page search-page"><h1>خبر تلاش کریں</h1><form className="search-form" role="search" action="/search" method="get"><label htmlFor="news-query" className="sr-only">خبر یا موضوع</label><input id="news-query" type="search" name="q" defaultValue={query} maxLength={100} placeholder="خبر یا موضوع" required /><button type="submit" className="news-button">تلاش کریں</button></form></div>{data && <NewsListing label={query} posts={data.posts} total={data.totalCount} page={page} path="/search" query={query} />}</>;
}
