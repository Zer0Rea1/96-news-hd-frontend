export const categories = [
  { slug: 'latest-news', label: 'تازہ ترین' },
  { slug: 'pakistan-news', label: 'پاکستان' },
  { slug: 'international-news', label: 'دنیا' },
  { slug: 'sports-news', label: 'کھیل' },
  { slug: 'business-news', label: 'کاروبار' },
  { slug: 'health-news', label: 'صحت' },
  { slug: 'science-news', label: 'سائنس' },
];

export function matchesCategory(post, slug) {
  return slug === 'latest-news' || post.tags?.some(tag => tag.slug === slug || tag.legacy_category === slug) || (Array.isArray(post.category)
    ? post.category.includes(slug)
    : post.category === slug);
}

export function categoryLabel(category) {
  return categories.find(item => Array.isArray(category)
    ? category.includes(item.slug)
    : item.slug === category)?.label || 'خبریں';
}

export function mergePosts(existing, incoming) {
  return [...new Map([...existing, ...incoming].map(post => [post._id, post])).values()];
}

export function publishedDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '';
  return new Intl.DateTimeFormat('ur-PK', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi',
  }).format(new Date(value));
}

export function postPath(post) {
  return `/news/${encodeURIComponent(post.slug || post._id)}`;
}

export function postLabel(post) {
  return post.tags?.[0]?.name || categoryLabel(post.category);
}
