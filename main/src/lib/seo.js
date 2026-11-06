import { articleText } from '../utils/article';
export const SITE_ORIGIN = 'https://www.96newshd.com';
export const SITE_TITLE = '96 News HD | ہر خبر باوثوق';
export const SITE_DESCRIPTION = '96 نیوز ایچ ڈی پر پاکستان، دنیا، کھیل، کاروبار، صحت اور سائنس کی تازہ خبریں۔ ہر خبر باوثوق۔';
export function metadataFor(title, path, description = SITE_DESCRIPTION, image, noindex = false) {
  const fullTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
  const url = new URL(path, SITE_ORIGIN).href;
  const images = image && /^https:\/\//.test(image) ? [{ url: image }] : [{ url: SITE_ORIGIN + '/96news.jpg', width: 1024, height: 1024, alt: '96 News HD' }];
  return {
    title: { absolute: fullTitle }, description, alternates: { canonical: url },
    openGraph: { title: fullTitle, description, url, siteName: '96 News HD', locale: 'ur_PK', type: 'website', images },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: images.map(item => item.url) },
    robots: { index: !noindex, follow: true, ...(noindex ? {} : { googleBot: { 'max-image-preview': 'large' } }) },
  };
}
export function articleMetadata(post) {
  const metadata = metadataFor(post.title.trim(), '/news/' + encodeURIComponent(post.slug || post._id), articleText(post.article, 160), post.thumbnailImage);
  metadata.openGraph.type = 'article';
  if (post.dateandtime && !Number.isNaN(Date.parse(post.dateandtime))) metadata.openGraph.publishedTime = new Date(post.dateandtime).toISOString();
  metadata.openGraph.tags = post.tags?.map(tag => tag.name) || [];
  return metadata;
}
export function articleSchema(post) {
  const url = SITE_ORIGIN + '/news/' + encodeURIComponent(post.slug || post._id);
  return {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: post.title.trim(), description: articleText(post.article, 160),
    mainEntityOfPage: url, url, inLanguage: 'ur-PK',
    ...(post.thumbnailImage?.startsWith('https://') ? { image: [post.thumbnailImage] } : {}),
    ...(post.dateandtime && !Number.isNaN(Date.parse(post.dateandtime)) ? { datePublished: new Date(post.dateandtime).toISOString() } : {}),
    author: { '@type': 'Organization', name: post.authorname || '96 News HD', url: SITE_ORIGIN },
    publisher: { '@type': 'Organization', name: '96 News HD', url: SITE_ORIGIN, logo: { '@type': 'ImageObject', url: SITE_ORIGIN + '/96news.jpg' } },
  };
}
export function jsonLd(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
