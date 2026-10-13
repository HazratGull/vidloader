import React, { useState } from 'react';
import { Link } from '../utils/router';
import { ChevronDown, Globe, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [openAccordion, setOpenAccordion] = useState({
    col1: false,
    col2: false,
    col3: false,
    col4: false,
  });

  const toggleAccordion = (col) => {
    setOpenAccordion((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  return (
    <footer className="site-footer">
      <div className="footer-top-container">
        {/* Brand Column & Summary */}
        <div className="footer-brand-summary">
          <Link to="/" className="brand-logo footer-logo" aria-label="vidloader.online Homepage">
            <img
              src="/vidloader-logo.png"
              alt="vidloader.online Logo"
              className="brand-logo-icon-img"
              width="46"
              height="46"
            />
            <span className="brand-name">
              vidloader<span className="brand-tld">.online</span>
            </span>
          </Link>

          <p className="footer-description">
            VidLoader is an online video tool for processing supported video links and available media formats.
          </p>

          <div className="footer-disclaimer-card">
            <Shield size={16} className="disclaimer-icon" />
            <p className="disclaimer-text">
              <strong>Independent Service:</strong> VidLoader is not affiliated with, endorsed by, or sponsored by YouTube, TikTok, Instagram, Facebook, Meta, or Reddit. All trademarks belong to their respective owners. Only download media you have the right or permission to process.
            </p>
          </div>
        </div>

        {/* 4 SEO Footer Columns */}
        <div className="footer-columns-grid">
          {/* Column 1 */}
          <div className={`footer-column ${openAccordion.col1 ? 'accordion-open' : ''}`}>
            <button
              className="footer-column-heading-btn"
              onClick={() => toggleAccordion('col1')}
              aria-expanded={openAccordion.col1}
            >
              <span>VIDEO DOWNLOADERS</span>
              <ChevronDown className="footer-accordion-icon" size={16} />
            </button>
            <ul className="footer-links-list">
              <li><Link to="/">Online Video Downloader</Link></li>
              <li><Link to="/youtube-downloader">YouTube Downloader</Link></li>
              <li><Link to="/tiktok-downloader">TikTok Downloader</Link></li>
              <li><Link to="/instagram-downloader">Instagram Downloader</Link></li>
              <li><Link to="/facebook-video-downloader">Facebook Video Downloader</Link></li>
              <li><Link to="/reddit-video-downloader">Reddit Video Downloader</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className={`footer-column ${openAccordion.col2 ? 'accordion-open' : ''}`}>
            <button
              className="footer-column-heading-btn"
              onClick={() => toggleAccordion('col2')}
              aria-expanded={openAccordion.col2}
            >
              <span>VIDEO TOOLS</span>
              <ChevronDown className="footer-accordion-icon" size={16} />
            </button>
            <ul className="footer-links-list">
              <li><Link to="/youtube-to-mp4">YouTube to MP4</Link></li>
              <li><Link to="/youtube-to-mp3">YouTube to MP3</Link></li>
              <li><Link to="/video-to-mp3">Video to MP3</Link></li>
              <li><Link to="/mp4-converter">MP4 Converter</Link></li>
              <li><Link to="/video-converter">Video Converter</Link></li>
              <li><Link to="/video-thumbnail-downloader">Video Thumbnail Downloader</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className={`footer-column ${openAccordion.col3 ? 'accordion-open' : ''}`}>
            <button
              className="footer-column-heading-btn"
              onClick={() => toggleAccordion('col3')}
              aria-expanded={openAccordion.col3}
            >
              <span>GUIDES &amp; HELP</span>
              <ChevronDown className="footer-accordion-icon" size={16} />
            </button>
            <ul className="footer-links-list">
              <li><Link to="/guides/how-to-download-videos">How to Download Videos</Link></li>
              <li><Link to="/guides/how-to-download-youtube-videos">How to Download YouTube Videos</Link></li>
              <li><Link to="/guides/how-to-download-youtube-shorts">How to Download YouTube Shorts</Link></li>
              <li><Link to="/guides/how-to-download-tiktok-videos">How to Download TikTok Videos</Link></li>
              <li><Link to="/guides/how-to-download-instagram-reels">How to Download Instagram Reels</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className={`footer-column ${openAccordion.col4 ? 'accordion-open' : ''}`}>
            <button
              className="footer-column-heading-btn"
              onClick={() => toggleAccordion('col4')}
              aria-expanded={openAccordion.col4}
            >
              <span>VIDLOADER</span>
              <ChevronDown className="footer-accordion-icon" size={16} />
            </button>
            <ul className="footer-links-list">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/api">API</Link></li>
              <li><Link to="/webmasters">For Webmasters</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/dmca">DMCA</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <div className="footer-copyright">
            © 2026 VidLoader. All rights reserved.
          </div>
          <div className="footer-bottom-meta">
            <span className="footer-badge-clean">
              <CheckCircle2 size={13} className="text-success" />
              100% Free &amp; Clean Web Utility
            </span>
            <span className="footer-domain-tag">https://vidloader.online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
