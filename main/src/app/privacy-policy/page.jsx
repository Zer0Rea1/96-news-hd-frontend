import PrivacyPolicy from '../../components/PrivacyPolicy';
import { metadataFor } from '../../lib/seo';
export const metadata = metadataFor('Privacy policy', '/privacy-policy', '96 News HD privacy policy.');
export default function PrivacyPage() { return <div className="privacy-page" dir="ltr" lang="en"><PrivacyPolicy /></div>; }
