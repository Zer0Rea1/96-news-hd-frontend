import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPost, getTag } from '../api/postblog.api';
import NewsCard, { NewsSkeleton, NewsStatus } from '../components/NewsCard';
import { categories, matchesCategory, mergePosts } from '../data/categories';
import NotFound from './NotFound';

export default function NewsPage() {
  const { slug } = useParams();
  const category = categories.find(item => item.slug === slug);
  return category ? <NewsListing key={slug} initialLabel={category.label} tag={slug === 'latest-news' ? undefined : slug} /> : <NotFound />;
}

export function TagPage() {
  const { slug } = useParams();
  return <NewsListing key={slug} tag={slug} />;
}

function NewsListing({ initialLabel, tag }) {
  const [label, setLabel] = useState(initialLabel);
  const [missing, setMissing] = useState(false);
  const [news, setNews] = useState([]);
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getPost({ skip: offset, limit: 12, ...(tag ? { tag } : {}) }, controller.signal),
      !initialLabel && offset === 0 ? getTag(tag, controller.signal) : null,
    ]).then(([data, metadata]) => {
      if (controller.signal.aborted) return;
      // shortcut: older deployed APIs ignore tag filters; retain exact client matching until cutover.
      setNews(previous => mergePosts(previous, data.posts.filter(post => !tag || matchesCategory(post, tag))));
      if (metadata) setLabel(metadata.name);
      const consumed = offset + data.posts.length;
      setNextOffset(consumed);
      setHasMore(data.posts.length > 0 && consumed < data.totalCount);
    }).catch(failure => {
      if (controller.signal.aborted) return;
      if (failure.response?.status === 404) setMissing(true);
      else setError(true);
    })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [tag, initialLabel, offset, attempt]);
  useEffect(() => {
    if (label) document.title = `${label} | 96 News HD | ہر خبر باوثوق`;
  }, [label]);
  if (missing) return <NotFound />;

  return <div className="news-container listing-page">
    <div className="breadcrumbs"><Link to="/">صفحہ اول</Link><span>/</span><span>{label || 'خبریں'}</span></div>
    <div className="page-heading"><div><span className="page-kicker">96 نیوز ایچ ڈی</span><h1>{label || 'خبریں'}</h1></div>
      <span className="section-caption">خبریں اور رپورٹس</span></div>
    {news.length > 0 && <div className="news-grid">{news.map(post => <NewsCard key={post._id} post={post} excerpt />)}</div>}
    {loading && <NewsSkeleton />}
    {error && <NewsStatus onRetry={() => { setLoading(true); setError(false); setAttempt(value => value + 1); }}>خبریں لوڈ نہیں ہو سکیں۔</NewsStatus>}
    {!loading && !error && !news.length && <NewsStatus>{hasMore
      ? 'اس حصے میں اس موضوع کی خبر نہیں ملی۔ مزید خبریں دیکھیں۔'
      : 'اس موضوع کی کوئی خبر ابھی دستیاب نہیں۔'}</NewsStatus>}
    {hasMore && !error && <div className="load-more"><button type="button" className="news-button"
      disabled={loading} onClick={() => { setLoading(true); setOffset(nextOffset); }}>{loading ? 'لوڈ ہو رہا ہے…' : 'مزید خبریں دیکھیں'}<ArrowLeft size={17} /></button></div>}
  </div>;
}
