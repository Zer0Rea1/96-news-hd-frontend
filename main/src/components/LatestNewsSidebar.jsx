import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { postLabel, postPath, publishedDate } from '../data/categories';
import { NewsStatus } from './NewsCard';

export default function LatestNewsSidebar({ latestNews, loading, error = false, onRetry }) {
  return <aside className="latest-news" aria-label="تازہ ترین خبریں">
    <div className="section-heading"><h2>تازہ ترین</h2><span className="latest-label" lang="en">LATEST</span></div>
    {loading ? <div className="latest-skeleton" role="status" aria-label="خبریں لوڈ ہو رہی ہیں">
      {[0, 1, 2, 3, 4].map(index => <div key={index} className="skeleton-line" />)}
    </div> : error ? <NewsStatus onRetry={onRetry}>خبریں لوڈ نہیں ہو سکیں۔</NewsStatus> : latestNews.length ? <ol>
      {latestNews.slice(0, 6).map(post => <li key={post._id}>
        <Link href={postPath(post)}>
          <div className="story-meta"><span>{postLabel(post)}</span><time>{publishedDate(post.dateandtime)}</time></div>
          <h3>{post.title.trim()}</h3>
        </Link>
      </li>)}
    </ol> : <NewsStatus>ابھی کوئی خبر دستیاب نہیں۔</NewsStatus>}
    <Link className="more-news" href="/page/latest-news">مزید خبریں <ArrowLeft size={16} /></Link>
  </aside>;
}
