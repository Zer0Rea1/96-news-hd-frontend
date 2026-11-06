import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Copy, ArrowLeft } from 'lucide-react';
import { getArticle } from '../api/postblog.api';
import { postLabel, publishedDate } from '../data/categories';
import { sanitizeArticle } from '../utils/article';
import { NewsImage, NewsSkeleton, NewsStatus } from '../components/NewsCard';
import LatestNewsSidebar from '../components/LatestNewsSidebar';
import useNews from '../hooks/useNews';

export default function PostPage() {
  const { slug } = useParams();
  return <Article key={slug} id={slug} />;
}

function Article({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [missing, setMissing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const latest = useNews(8);

  useEffect(() => {
    const controller = new AbortController();
    getArticle(id, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      setData(result);
      document.title = `${result.post.title.trim()} | 96 News HD | ہر خبر باوثوق`;
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error.response?.status === 404) setMissing(true);
      else setError(true);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, attempt]);

  async function copyLink() {
    try {
      // Keep the backend's social-preview bridge until public article URLs serve their own metadata.
      const url = new URL(`/post/${encodeURIComponent(data.post.slug || id)}`, import.meta.env.VITE_API_URL).href;
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch { setCopyStatus('failed'); }
  }

  if (loading) return <div className="news-container listing-page"><NewsSkeleton count={2} /></div>;
  if (error || missing) return <div className="news-container listing-page"><NewsStatus
    onRetry={error ? () => { setLoading(true); setError(false); setMissing(false); setAttempt(value => value + 1); } : undefined}>{missing ? 'یہ خبر دستیاب نہیں ہے۔' : 'خبر لوڈ نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔'}</NewsStatus>
    <Link className="text-link" to="/">صفحہ اول پر جائیں <ArrowLeft size={17} /></Link></div>;

  const { post, authorname } = data;
  return <div className="news-container article-page">
    <div className="breadcrumbs"><Link to="/">صفحہ اول</Link><span>/</span><span>{postLabel(post)}</span></div>
    <div className="article-grid"><article className="full-article">
      <span className="article-category">{postLabel(post)}</span>
      <h1>{post.title.trim()}</h1>
      <div className="article-byline"><div><span>{authorname || '96 نیوز ایچ ڈی'}</span><time>{publishedDate(post.dateandtime)}</time></div>
        <button type="button" className="copy-button" onClick={copyLink}>
          {copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}{copyStatus === 'copied' ? 'لنک کاپی ہو گیا' : 'لنک کاپی کریں'}
        </button>
      </div>
      <p className="sr-only" role="status">{copyStatus === 'copied' ? 'لنک کاپی ہو گیا' : ''}</p>
      {copyStatus === 'failed' && <p className="copy-error" role="alert">لنک کاپی نہیں ہو سکا۔ براہ کرم براؤزر سے صفحے کا لنک کاپی کریں۔</p>}
      <NewsImage key={post.thumbnailImage} post={post} priority />
      <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeArticle(post.article) }} />
      {post.tags?.length > 0 && <nav className="article-tags" aria-label="خبر کے موضوعات">
        {post.tags.map(tag => <Link key={tag.id} to={`/tag/${encodeURIComponent(tag.slug)}`}>{tag.name}</Link>)}
      </nav>}
      <div className="article-end"><span>96 نیوز ایچ ڈی</span><Link to="/page/latest-news">مزید خبریں <ArrowLeft size={16} /></Link></div>
    </article>
      <LatestNewsSidebar latestNews={latest.news.filter(item => item._id !== post._id)} loading={latest.loading} error={latest.error} onRetry={latest.retry} />
    </div>
  </div>;
}
