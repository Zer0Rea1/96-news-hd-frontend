import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import NewsPage, { TagPage } from './pages/NewsPages';
import SearchPage from './pages/SearchPage';
import Live from './pages/Live';
import NotFound from './pages/NotFound';

const PostPage = lazy(() => import('./pages/PostPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="app-loading" role="status">لوڈ ہو رہا ہے…</div>}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/news/:slug" element={<PostPage />} />
        <Route path="/page/:slug" element={<NewsPage />} />
        <Route path="/tag/:slug" element={<TagPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/live" element={<Live />} />
        <Route path="/privacy-policy" element={<div className="privacy-page" dir="ltr" lang="en"><PrivacyPolicy /></div>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense></BrowserRouter>;
}
