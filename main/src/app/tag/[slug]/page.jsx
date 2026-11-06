import { notFound } from 'next/navigation';
import { getFeed, getTag, pageNumber, routeSlug } from '../../../lib/news';
import { metadataFor } from '../../../lib/seo';
import NewsListing from '../../../components/NewsListing';
async function tagOr404(slug) { try { return await getTag(slug); } catch (e) { if (e.status === 404) notFound(); throw e; } }
export async function generateMetadata({ params, searchParams }) { const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const tag = await tagOr404(slug); const page = pageNumber((await searchParams).page); if (page > 1 && !(await getFeed((page - 1) * 12, 12, slug)).posts.length) notFound(); return metadataFor(tag.name, '/tag/' + encodeURIComponent(slug) + (page > 1 ? '?page=' + page : '')); }
export default async function TagPage({ params, searchParams }) { const { slug: rawSlug } = await params; const slug = routeSlug(rawSlug); const page = pageNumber((await searchParams).page); const [tag, data] = await Promise.all([tagOr404(slug), getFeed((page - 1) * 12, 12, slug)]); if (page > 1 && !data.posts.length) notFound(); return <NewsListing label={tag.name} posts={data.posts} total={data.totalCount} page={page} path={'/tag/' + encodeURIComponent(slug)} />; }
