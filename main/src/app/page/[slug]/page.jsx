import { notFound } from 'next/navigation';
import { categories } from '../../../data/categories';
import { getFeed, pageNumber, routeSlug } from '../../../lib/news';
import { metadataFor } from '../../../lib/seo';
import NewsListing from '../../../components/NewsListing';
export async function generateMetadata({ params, searchParams }) { const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const category = categories.find(item => item.slug === slug); if (!category) notFound(); const page = pageNumber((await searchParams).page); if (page > 1 && !(await getFeed((page - 1) * 12, 12, slug === 'latest-news' ? '' : slug)).posts.length) notFound(); return metadataFor(category.label, '/page/' + encodeURIComponent(slug) + (page > 1 ? '?page=' + page : ''), undefined, undefined, !category); }
export default async function CategoryPage({ params, searchParams }) {
  const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const category = categories.find(item => item.slug === slug); if (!category) notFound();
  const page = pageNumber((await searchParams).page); const data = await getFeed((page - 1) * 12, 12, slug === 'latest-news' ? '' : slug);
  if (page > 1 && !data.posts.length) notFound();
  return <NewsListing label={category.label} posts={data.posts} total={data.totalCount} page={page} path={'/page/' + slug} />;
}
