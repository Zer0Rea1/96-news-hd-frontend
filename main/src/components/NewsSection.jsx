import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewsCard, { NewsSkeleton } from './NewsCard';

export default function NewsSection({ news, section_name, category, loading = false }) {
  if (!loading && !news.length) return null;
  return <section className="category-section" aria-label={section_name}>
    <div className="section-heading">
      <h2>{section_name}</h2>
      <Link href={`/page/${category}`}>تمام خبریں <ArrowLeft size={15} /></Link>
    </div>
    {loading ? <NewsSkeleton /> : <div className="category-grid">
      {news.slice(0, 4).map((post, index) => <NewsCard key={post._id} post={post}
        variant={index === 0 ? 'section-lead' : 'compact'} />)}
    </div>}
  </section>;
}
