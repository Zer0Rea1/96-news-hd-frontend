import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewsCard, { NewsStatus } from './NewsCard';
import NewsSection from './NewsSection';
import LatestNewsSidebar from './LatestNewsSidebar';
import { categories, matchesCategory, postPath } from '../data/categories';

export default function Home({ news }) {
  return <div className="news-container home-page">
    <h1 className="sr-only">96 نیوز ایچ ڈی، پاکستان اور دنیا کی خبریں</h1>
    <div className="headline-strip"><Link className="headline-label" href="/page/latest-news">تازہ ترین</Link>
      {news[0] ? <Link href={postPath(news[0])} className="headline-text">{news[0].title}</Link>
        : <span>پاکستان اور دنیا کی خبریں</span>}
      <Link href="/page/latest-news" className="headline-arrow" aria-label="تمام تازہ خبریں"><ArrowLeft size={18} /></Link>
    </div>
    <div className="section-heading lead-heading"><h2>اہم خبریں</h2><span className="section-caption">96 نیوز ایچ ڈی</span></div>
    {!news.length ? <NewsStatus>ابھی کوئی خبر دستیاب نہیں۔</NewsStatus> : <>
        <section className="front-page-grid" aria-label="اہم خبریں">
          <NewsCard post={news[0]} variant="lead" excerpt priority />
          <div className="supporting-stories">{news.slice(1, 3).map(post => <NewsCard key={post._id} post={post} variant="supporting" />)}</div>
          <LatestNewsSidebar latestNews={news.slice(3, 9)} loading={false} />
        </section>
        <section className="news-around" aria-label="مزید خبریں">
          {news.slice(3, 7).map(post => <NewsCard key={post._id} post={post} />)}
        </section>
        <div className="category-columns">
          {categories.slice(1).map(category => <NewsSection key={category.slug}
            category={category.slug} section_name={category.label}
            news={news.filter(post => matchesCategory(post, category.slug))} />)}
        </div>
        <div className="archive-link"><div><h2>خبروں کا سلسلہ جاری ہے</h2><p>مزید خبریں اور گزشتہ رپورٹس پڑھیں</p></div>
          <Link className="news-button" href="/page/latest-news">تمام خبریں <ArrowLeft size={17} /></Link>
        </div>
      </>}
  </div>;
}
