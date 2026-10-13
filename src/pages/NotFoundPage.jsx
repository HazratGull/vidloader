import React from 'react';
import SEO from '../components/SEO';
import { Link } from '../utils/router';
import { AlertCircle, Home, Search, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page-wrapper not-found-wrapper">
      <SEO
        title="404 - Page Not Found | VidLoader"
        description="The page you are looking for does not exist or has been moved. Explore our supported video downloaders and tools."
        canonical="https://vidloader.online/404"
      />

      <div className="not-found-container">
        <div className="not-found-card">
          <div className="not-found-icon-circle">
            <AlertCircle size={40} className="text-primary" />
          </div>

          <span className="not-found-code">404 ERROR</span>
          <h1 className="not-found-title">Page Not Found</h1>

          <p className="not-found-description">
            The page you requested could not be located. It might have been relocated, renamed, or is temporarily unavailable.
          </p>

          <div className="not-found-actions">
            <Link to="/" className="btn-primary-link">
              <Home size={16} />
              <span>Back to VidLoader Home</span>
            </Link>
          </div>

          <div className="not-found-popular-links">
            <span className="popular-links-title">Popular Destinations:</span>
            <div className="popular-links-list">
              <Link to="/youtube-downloader">YouTube Downloader</Link>
              <Link to="/tiktok-downloader">TikTok Downloader</Link>
              <Link to="/instagram-downloader">Instagram Downloader</Link>
              <Link to="/guides">Guides &amp; Tutorials</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
