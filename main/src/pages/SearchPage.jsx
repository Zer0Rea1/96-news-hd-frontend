import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import NewsCard, { NewsSkeleton, NewsStatus } from '../components/NewsCard';
import { searchPosts } from '../api/postblog.api';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() || '';
  return <SearchResults key={query} query={query} setParams={setParams} />;
}

function SearchResults({ query, setParams }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    searchPosts(query, controller.signal).then(data => { if (!controller.signal.aborted) setResults(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, attempt]);

  function submit(event) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q').trim();
    setParams(value ? { q: value } : {});
  }

  return <div className="news-container listing-page search-page">
    <div className="breadcrumbs"><Link to="/">صفحہ اول</Link><span>/</span><span>تلاش</span></div>
    <div className="page-heading"><h1>خبر تلاش کریں</h1></div>
    <form key={query} className="search-form" role="search" onSubmit={submit}>
      <label htmlFor="news-query" className="sr-only">خبر یا موضوع</label>
      <Search size={23} aria-hidden="true" />
      <input id="news-query" type="search" name="q" defaultValue={query} placeholder="خبر، شہر یا موضوع لکھیں…" required />
      <button className="news-button" type="submit">تلاش کریں</button>
    </form>
    {query && <p className="search-summary" aria-live="polite">تلاش: <strong>«{query}»</strong></p>}
    {loading ? <NewsSkeleton /> : error ? <NewsStatus onRetry={() => { setLoading(true); setError(false); setAttempt(value => value + 1); }}>تلاش مکمل نہیں ہو سکی۔ دوبارہ کوشش کریں۔</NewsStatus>
      : results.length ? <div className="news-grid">{results.map(post => <NewsCard key={post._id} post={post} excerpt />)}</div>
        : <NewsStatus>{query ? 'کوئی خبر نہیں ملی۔ کوئی دوسرا لفظ تلاش کریں۔' : 'پاکستان، دنیا، کھیل اور دیگر موضوعات کی خبریں تلاش کریں۔'}</NewsStatus>}
  </div>;
}
