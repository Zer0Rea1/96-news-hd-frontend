import Link from 'next/link';
import { postLabel, postPath, publishedDate } from '../data/categories';
import { articleText } from '../utils/article';

export { default as NewsImage } from './NewsImage';
import NewsImage from './NewsImage';

export default function NewsCard({ post, variant = 'standard', excerpt = false, priority = false }) {
  return (
    <article className={`news-card news-card--${variant}`}>
      <Link href={postPath(post)} className="story-link">
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
