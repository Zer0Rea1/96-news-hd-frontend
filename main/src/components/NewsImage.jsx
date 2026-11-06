'use client';
import { ImageOff } from 'lucide-react';
export default function NewsImage({ post, priority = false }) {
  const source = typeof post.thumbnailImage === 'string' && /^https?:\/\//i.test(post.thumbnailImage)
    ? post.thumbnailImage : null;
  return (
    <div className="news-image">
      <span className="image-fallback" aria-hidden="true"><ImageOff size={28} strokeWidth={1.4} /></span>
      {source && <img src={source} alt={post.title} width="640" height="400"
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}
        decoding="async" onError={event => { event.currentTarget.hidden = true; }} />}
    </div>
  );
}

