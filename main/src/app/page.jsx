import HomeContent from '../components/HomeContent';
import { getFeed } from '../lib/news';
import { metadataFor, SITE_ORIGIN, jsonLd } from '../lib/seo';
export const metadata = metadataFor('', '/');
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  const data = await getFeed(0, 40);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: '96 News HD', alternateName: '96 نیوز ایچ ڈی', url: SITE_ORIGIN, slogan: 'ہر خبر باوثوق', logo: SITE_ORIGIN + '/96news.jpg' }) }} /><HomeContent news={data.posts} /></>;
}
