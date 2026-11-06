import Link from 'next/link';
import NewsCard, { NewsStatus } from './NewsCard';
export default function NewsListing({ label, posts, total, page, path, query }) {
  const href = number => { const params = new URLSearchParams(query ? { q: query } : {}); if (number > 1) params.set('page', String(number)); return path + (params.size ? '?' + params : ''); };
  return <div className="news-container listing-page"><div className="breadcrumbs"><Link href="/">صفحہ اول</Link><span>/</span><span>{label}</span></div><div className="page-heading"><h1>{label}</h1></div>
    {posts.length ? <div className="news-grid">{posts.map(post => <NewsCard key={post._id} post={post} excerpt />)}</div> : <NewsStatus>اس موضوع کی کوئی خبر ابھی دستیاب نہیں۔</NewsStatus>}
    <nav className="load-more" aria-label="خبروں کے صفحات">{page > 1 && <Link className="news-button" href={href(page - 1)}>پچھلا صفحہ</Link>}{page * 12 < total && <Link className="news-button" href={href(page + 1)}>مزید خبریں دیکھیں</Link>}</nav>
  </div>;
}
