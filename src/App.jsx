import React from 'react';
import { useRouter } from './utils/router';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import ToolPage from './pages/ToolPage';
import ShortVideoPage from './pages/ShortVideoPage';
import GuidesIndexPage from './pages/GuidesIndexPage';
import GuideDetailPage from './pages/GuideDetailPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DMCAPage from './pages/DMCAPage';
import APIPage from './pages/APIPage';
import WebmastersPage from './pages/WebmastersPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { path } = useRouter();

  // Normalize path by stripping trailing slash (except root)
  const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

  const renderRoute = () => {
    // 1. Homepage
    if (normalizedPath === '' || normalizedPath === '/') {
      return <HomePage />;
    }

    // 2. Platform Landing Pages
    const platformSlugs = [
      'youtube-downloader',
      'tiktok-downloader',
      'instagram-downloader',
      'facebook-video-downloader',
      'reddit-video-downloader',
      'twitter-video-downloader',
      'dailymotion-video-downloader',
    ];
    const platformSlugMatch = platformSlugs.find((slug) => normalizedPath === `/${slug}`);
    if (platformSlugMatch) {
      return <PlatformPage slug={platformSlugMatch} />;
    }
    if (normalizedPath === '/twitter-downloader') {
      return <PlatformPage slug="twitter-video-downloader" />;
    }
    if (normalizedPath === '/dailymotion-downloader') {
      return <PlatformPage slug="dailymotion-video-downloader" />;
    }

    // 3. Video Tool Pages
    const toolSlugs = [
      'youtube-to-mp4',
      'youtube-to-mp3',
      'video-to-mp3',
      'mp4-converter',
      'video-converter',
      'video-thumbnail-downloader',
    ];
    const toolSlugMatch = toolSlugs.find((slug) => normalizedPath === `/${slug}`);
    if (toolSlugMatch) {
      return <ToolPage slug={toolSlugMatch} />;
    }

    // 4. Short Video Pages
    const shortSlugs = [
      'youtube-shorts-downloader',
      'tiktok-video-downloader',
      'instagram-reels-downloader',
      'facebook-reels-downloader',
    ];
    const shortSlugMatch = shortSlugs.find((slug) => normalizedPath === `/${slug}`);
    if (shortSlugMatch) {
      return <ShortVideoPage slug={shortSlugMatch} />;
    }

    // 5. Guides Hub & Details
    if (normalizedPath === '/guides') {
      return <GuidesIndexPage />;
    }
    if (normalizedPath.startsWith('/guides/')) {
      const guideSlug = normalizedPath.replace('/guides/', '');
      return <GuideDetailPage slug={guideSlug} />;
    }

    // 6. Blog Hub & Details
    if (normalizedPath === '/blog') {
      return <BlogIndexPage />;
    }
    if (normalizedPath.startsWith('/blog/')) {
      const blogSlug = normalizedPath.replace('/blog/', '');
      return <BlogDetailPage slug={blogSlug} />;
    }

    // 7. Core Legal & Company Pages
    if (normalizedPath === '/faq') {
      return <FAQPage />;
    }
    if (normalizedPath === '/about') {
      return <AboutPage />;
    }
    if (normalizedPath === '/contact') {
      return <ContactPage />;
    }
    if (normalizedPath === '/privacy') {
      return <PrivacyPage />;
    }
    if (normalizedPath === '/terms') {
      return <TermsPage />;
    }
    if (normalizedPath === '/dmca') {
      return <DMCAPage />;
    }
    if (normalizedPath === '/api') {
      return <APIPage />;
    }
    if (normalizedPath === '/webmasters') {
      return <WebmastersPage />;
    }

    // 8. 404 Fallback
    return <NotFoundPage />;
  };

  return (
    <LanguageProvider>
      <div className="site-wrapper">
        <Header />
        <main id="main-content" className="site-main">
          {renderRoute()}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
