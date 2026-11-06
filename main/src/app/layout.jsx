import Link from 'next/link';
import Header from '../components/Header';
import { categories } from '../data/categories';
import { SITE_ORIGIN, metadataFor } from '../lib/seo';
import '../index.css';
import '../App.css';
export const metadata = { metadataBase: new URL(SITE_ORIGIN), ...metadataFor('', '/') };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#bc1924' };
export default function RootLayout({ children }) {
  const date = new Intl.DateTimeFormat('ur-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date());
  return <html lang="ur" dir="rtl"><body><div className="news-site"><a className="skip-link" href="#main-content">مواد پر جائیں</a><Header date={date} /><main id="main-content" className="public-main" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><div className="news-container"><div className="footer-main"><Link href="/" className="footer-brand"><img src="/96news.jpg" width="62" height="62" alt="96 News HD" /><span>96 نیوز ایچ ڈی<small>ہر خبر باوثوق</small></span></Link><nav aria-label="فوٹر مینو">{categories.map(item => <Link key={item.slug} href={'/page/' + item.slug}>{item.label}</Link>)}</nav></div><div className="footer-bottom"><span lang="en" dir="ltr">© {new Date().getFullYear()} 96 News HD. All rights reserved.</span><Link href="/privacy-policy">پرائیویسی پالیسی</Link></div></div></footer>
  </div></body></html>;
}
