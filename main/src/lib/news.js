import { cache } from 'react';
export const API_ORIGIN = process.env.API_URL || 'https://api.96newshd.com';
export class NewsError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
async function json(path) {
  const response = await fetch(new URL(path, API_ORIGIN), { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new NewsError(response.status, 'News service unavailable');
  return response.json();
}
export function validPosts(posts) {
  return Array.isArray(posts) && posts.every(post => post && typeof post._id === 'string' && typeof post.title === 'string' && (post.slug === undefined || typeof post.slug === 'string') && (post.tags === undefined || (Array.isArray(post.tags) && post.tags.every(tag => tag && typeof tag.id === 'string' && typeof tag.name === 'string' && typeof tag.slug === 'string'))));
}
export const getFeed = cache(async (skip = 0, limit = 12, tag = '', query = '') => {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (tag) params.set('tag', tag);
  if (query) params.set('query', query);
  const data = await json('/api/posts?' + params);
  if (!validPosts(data.posts) || !Number.isInteger(data.totalCount) || data.totalCount < 0) throw new Error('Invalid news response');
  return data;
});
export const getArticle = cache(async reference => {
  const data = await json('/api/posts/' + encodeURIComponent(reference));
  if (!validPosts([data.post])) throw new Error('Invalid article response');
  return data.post;
});
export const getTag = cache(async slug => {
  const data = await json('/api/tags/' + encodeURIComponent(slug));
  if (!data.tag || typeof data.tag.name !== 'string' || data.tag.slug !== slug) throw new Error('Invalid tag response');
  return data.tag;
});
export const getTags = cache(async () => {
  const data = await json('/api/tags');
  if (!Array.isArray(data.tags)) throw new Error('Invalid tags response');
  return data.tags;
});
export function pageNumber(value) {
  return typeof value === 'string' && /^[1-9]\d{0,4}$/.test(value) ? Number(value) : 1;
}

export function routeSlug(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}
