import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { categories } from '../data/categories';
import brand from '../assets/96news.jpg';
import '../App.css';

export default function MainLayout() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const category = categories.find(item => pathname === `/page/${item.slug}`);
    const query = new URLSearchParams(search).get('q')?.trim();
    const label = category?.label || (pathname === '/search' ? (query ? `${query} | تلاش` : 'تلاش')
      : pathname === '/live' ? 'لائیو نشریات' : pathname === '/privacy-policy' ? 'Privacy policy' : '');
    document.title = [label, '96 News HD', 'ہر خبر باوثوق'].filter(Boolean).join(' | ');
  }, [pathname, search]);

  return <div className="news-site" dir="rtl" lang="ur">
    <a className="skip-link" href="#main-content">مواد پر جائیں</a>
    <Header />
    <main id="main-content" className="public-main" tabIndex={-1}><Outlet /></main>
    <footer className="site-footer"><div className="news-container">
      <div className="footer-main">
        <Link to="/" className="footer-brand"><img src={brand} width="62" height="62" alt="96 News HD" />
          <span>96 نیوز ایچ ڈی<small>ہر خبر باوثوق</small></span>
        </Link>
        <nav aria-label="فوٹر مینو">{categories.map(item => <Link key={item.slug} to={`/page/${item.slug}`}>{item.label}</Link>)}</nav>
      </div>
      <div className="footer-bottom"><span lang="en" dir="ltr">© {new Date().getFullYear()} 96 News HD. All rights reserved.</span>
        <Link to="/privacy-policy">پرائیویسی پالیسی</Link>
      </div>
    </div></footer>
  </div>;
}
