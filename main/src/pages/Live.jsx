import { Link } from 'react-router-dom';
import { TvMinimal } from 'lucide-react';

// LivePlayer is preserved in components/LivePlayer.jsx; mount it here when broadcasting resumes.
export default function Live() {
  return <div className="news-container paused-page">
    <TvMinimal size={48} strokeWidth={1.2} aria-hidden="true" />
    <h1>لائیو نشریات فی الحال بند ہیں</h1>
    <p>آپ ہماری ویب سائٹ پر خبریں اور رپورٹس پڑھ سکتے ہیں۔</p>
    <Link className="news-button" to="/page/latest-news">تازہ ترین خبریں پڑھیں</Link>
  </div>;
}
