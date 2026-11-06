import Link from 'next/link';

export default function NotFound() {
  return <div className="news-container paused-page">
    <span className="not-found-number" lang="en">404</span><h1>یہ صفحہ نہیں ملا</h1>
    <p>ممکن ہے لنک تبدیل ہو گیا ہو۔ تازہ ترین خبریں صفحہ اول پر موجود ہیں۔</p>
    <Link href="/" className="news-button">صفحہ اول پر جائیں</Link>
  </div>;
}
