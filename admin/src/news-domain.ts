import DOMPurify from 'dompurify';
import { z } from 'zod';
export type NewsTag = { id: string; name: string; slug: string; legacy_category?: string | null; post_count?: number };
export type NewsPost = { id: string; slug: string; title: string; article: string; thumbnailImage: string; tags: NewsTag[]; status: 'draft' | 'published'; version: number };
export function cleanNews(value: string) {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: ['p','br','h2','h3','strong','b','em','i','u','ul','ol','li','blockquote','a'], ALLOWED_ATTR: ['href','title'], ALLOW_DATA_ATTR: false });
}
export const newsInput = z.object({
  title: z.string().trim().min(1, 'Enter a headline.').max(500),
  article: z.string().max(100000).transform(cleanNews).refine(v => { const el = document.createElement('div'); el.innerHTML = v; return Boolean(el.textContent?.trim()); }, 'Write the article.'),
  thumbnailImage: z.url('Upload a thumbnail.').refine(v => new URL(v).origin === 'https://res.cloudinary.com', 'Use an uploaded thumbnail.'),
  tags: z.array(z.uuid()).min(1, 'Choose at least one tag.').max(10, 'Choose up to 10 tags.'),
  status: z.enum(['draft', 'published']),
});
