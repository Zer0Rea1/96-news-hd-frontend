import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getArticle, getFeed, routeSlug } from '../../../lib/news';
import { articleMetadata, articleSchema, jsonLd, SITE_ORIGIN } from '../../../lib/seo';
import { postLabel, publishedDate, postPath } from '../../../data/categories';
import { sanitizeArticle } from '../../../utils/article';
import NewsImage from '../../../components/NewsImage';
import LatestNewsSidebar from '../../../components/LatestNewsSidebar';
import ShareArticle from '../../../components/ShareArticle';
async function articleOr404(slug) { try { return await getArticle(slug); } catch (e) { if (e.status === 404) notFound(); throw e; } }
export async function generateMetadata({ params }) { const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const post = await articleOr404(slug); if (post.slug && slug !== post.slug) permanentRedirect(postPath(post)); return articleMetadata(post); }
export default async function ArticlePage({ params }) {
  const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const post = await articleOr404(slug);
  if (post.slug && slug !== post.slug) permanentRedirect(postPath(post));
  // Related-feed failure must never prevent a published article from being read.
  const latest = await getFeed(0, 8).catch(() => ({ posts: [] }));
  return <div className="news-container article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema(post)) }} /><div className="breadcrumbs"><Link href="/">صفحہ اول</Link><span>/</span><span>{postLabel(post)}</span></div><div className="article-grid"><article className="full-article"><span className="article-category">{postLabel(post)}</span><h1>{post.title.trim()}</h1><div className="article-byline"><div><span>{post.authorname || '96 نیوز ایچ ڈی'}</span><time dateTime={post.dateandtime || undefined}>{publishedDate(post.dateandtime)}</time></div><ShareArticle url={SITE_ORIGIN + postPath(post)} /></div><NewsImage post={post} priority /><div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeArticle(post.article) }} />{post.tags?.length > 0 && <nav className="article-tags" aria-label="خبر کے موضوعات">{post.tags.map(tag => <Link key={tag.id} href={'/tag/' + encodeURIComponent(tag.slug)}>{tag.name}</Link>)}</nav>}<div className="article-end"><span>96 نیوز ایچ ڈی</span><Link href="/page/latest-news">مزید خبریں</Link></div></article><LatestNewsSidebar latestNews={latest.posts.filter(item => item._id !== post._id)} loading={false} /></div></div>;
}
