'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { categories } from '../data/categories';
import brand from '../assets/96news.jpg';

export default function Header({ date }) {
  const dialog = useRef(null);
  const pathname = usePathname();
  const closeMenu = () => dialog.current.close();
  return <>
    <header className="site-header">
      <div className="utility-bar"><div className="news-container utility-content">
        <time>{date}</time>
      </div></div>
      <div className="news-container masthead">
        <button type="button" className="icon-button mobile-menu-button" aria-label="مینو کھولیں"
          aria-haspopup="dialog" onClick={() => dialog.current.showModal()}><Menu size={24} /></button>
        <Link href="/" className="brand" aria-label="96 نیوز ایچ ڈی، صفحہ اول">
          <img src={brand.src} alt="96 News HD" width="80" height="80" />
          <div className="brand-copy"><span>96 نیوز ایچ ڈی</span><p>ہر خبر باوثوق</p></div>
        </Link>
        <form role="search" action="/search" method="get" className="header-search">
          <label className="sr-only" htmlFor="header-query">خبر تلاش کریں</label>
          <input id="header-query" type="search" name="q" placeholder="آپ کیا تلاش کرنا چاہتے ہیں؟" required />
          <button type="submit" aria-label="تلاش کریں"><Search size={20} /></button>
        </form>
        <Link className="icon-button mobile-search-button" href="/search" aria-label="خبر تلاش کریں"><Search size={22} /></Link>
      </div>
      <nav className="primary-nav" aria-label="مرکزی مینو"><div className="news-container nav-content">
        <Link href="/" className={pathname === '/' ? 'active' : undefined}>صفحہ اول</Link>
        {categories.map(item => <Link key={item.slug} className={pathname === `/page/${item.slug}` ? 'active' : undefined} href={`/page/${item.slug}`}>{item.label}</Link>)}
      </div></nav>
    </header>
    <dialog className="mobile-menu" ref={dialog} aria-labelledby="menu-heading"
      onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="menu-heading"><h2 id="menu-heading">96 نیوز ایچ ڈی</h2>
        <button type="button" className="icon-button" aria-label="مینو بند کریں" onClick={closeMenu} autoFocus><X size={23} /></button>
      </div>
      <nav aria-label="موبائل مینو">
        <Link href="/" onClick={closeMenu}>صفحہ اول</Link>
        {categories.map(item => <Link key={item.slug} className={pathname === `/page/${item.slug}` ? 'active' : undefined} href={`/page/${item.slug}`} onClick={closeMenu}>{item.label}</Link>)}
      </nav>
    </dialog>
  </>;
}
