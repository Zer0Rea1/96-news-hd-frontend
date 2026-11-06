import api from './apis.js';

function validPosts(posts) {
  return Array.isArray(posts) && posts.every(post =>
    post && typeof post._id === 'string' && typeof post.title === 'string'
    && (post.slug === undefined || typeof post.slug === 'string')
    && (post.tags === undefined || (Array.isArray(post.tags) && post.tags.every(tag =>
      tag && typeof tag.id === 'string' && typeof tag.name === 'string' && typeof tag.slug === 'string'))));
}

export async function getPost(params = {}, signal) {
  const { data } = await api.get('/api/getpost', { params, signal, timeout: 20000 });
  if (!validPosts(data.posts) || !Number.isFinite(data.totalCount) || data.totalCount < 0) {
    throw new Error('Invalid news response');
  }
  return data;
}

export async function getArticle(id, signal) {
  const { data } = await api.get(`/api/getpostbyid/${encodeURIComponent(id)}`, { signal, timeout: 20000 });
  if (!validPosts([data.post])) throw new Error('Invalid article response');
  return data;
}

export async function searchPosts(query, signal) {
  const { data } = await api.get('/api/search', { params: { query }, signal, timeout: 20000 });
  if (!validPosts(data.results)) throw new Error('Invalid search response');
  return data.results;
}

export async function getTag(slug, signal) {
  const { data } = await api.get(`/api/tags/${encodeURIComponent(slug)}`, { signal, timeout: 20000 });
  if (!data.tag || typeof data.tag.name !== 'string' || data.tag.slug !== slug) throw new Error('Invalid label response');
  return data.tag;
}
