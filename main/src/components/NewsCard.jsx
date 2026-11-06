import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { postLabel, postPath, publishedDate } from '../data/categories';
import { articleText } from '../utils/article';

export function NewsImage({ post, priority = false }) {
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

export default function NewsCard({ post, variant = 'standard', excerpt = false, priority = false }) {
  return (
    <article className={`news-card news-card--${variant}`}>
      <Link to={postPath(post)} className="story-link">
        <NewsImage post={post} priority={priority} />
        <div className="story-copy">
          <div className="story-meta"><span>{postLabel(post)}</span><time>{publishedDate(post.dateandtime)}</time></div>
          <h2>{post.title.trim()}</h2>
          {excerpt && <p className="story-excerpt">{articleText(post.article, variant === 'lead' ? 180 : 120)}</p>}
        </div>
      </Link>
    </article>
  );
}

export function NewsSkeleton({ count = 3 }) {
  return <div className="news-grid" role="status" aria-label="خبریں لوڈ ہو رہی ہیں">
    {Array.from({ length: count }, (_, index) => <div className="story-skeleton" key={index} aria-hidden="true">
      <div className="skeleton-media" /><div className="skeleton-line" /><div className="skeleton-line short" />
    </div>)}
  </div>;
}

export function NewsStatus({ children, onRetry }) {
  return <div className="news-status" role={onRetry ? 'alert' : 'status'}>
    <p>{children}</p>
    {onRetry && <button type="button" className="news-button" onClick={onRetry}>دوبارہ کوشش کریں</button>}
  </div>;
}
