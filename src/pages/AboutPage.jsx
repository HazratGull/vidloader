import React from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from '../utils/router';
import { ShieldCheck, Zap, Globe, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const breadcrumbs = [{ label: 'About', url: '/about' }];

  const aboutStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://vidloader.online/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'About',
            item: 'https://vidloader.online/about',
          },
        ],
      },
      {
        '@type': 'AboutPage',
        name: 'About VidLoader',
        description: 'VidLoader is an independent online video downloader and media converter engineered for fast, clean, and popup-free downloads.',
        url: 'https://vidloader.online/about',
      },
    ],
  };

  return (
    <div className="page-wrapper legal-page-wrapper">
      <SEO
        title="About VidLoader - Independent Online Video Downloader"
        description="Learn about VidLoader, an independent web utility designed to simplify online video resolution and media format conversions without malware or ads."
        keywords="about vidloader, online video downloader company, fast free video downloader"
        canonical="https://vidloader.online/about"
        structuredData={aboutStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Globe size={15} />
              <span>ABOUT VIDLOADER</span>
            </div>
            <h1 className="page-title">Independent, Fast &amp; Clean Video Utility</h1>
            <p className="page-subtitle">
              Building a trustworthy, modern media resolution platform that respects user privacy and eliminates web clutter.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-content-body">
        <div className="section-container">
          <div className="legal-text-card">
            <h2>Our Purpose</h2>
            <p>
              The internet is filled with incredible educational courses, creative commons documentaries, tutorials, and speeches. However, traditional video downloading websites have earned a notorious reputation for aggressive pop-unders, suspicious software downloaders, misleading fake download buttons, and heavy ads that risk user devices.
            </p>
            <p>
              <strong>VidLoader was founded on a simple premise:</strong> to provide a clean, fast, lightweight, and honest online tool that enables users to inspect media streams and download permitted video and audio files directly through their web browser.
            </p>

            <h2>Core Principles</h2>
            <div className="about-values-grid">
              <div className="value-card">
                <Zap size={22} className="text-primary" />
                <h3>Speed &amp; Efficiency</h3>
                <p>Zero heavy animations or render-blocking bloat. VidLoader loads in milliseconds on any mobile or desktop connection.</p>
              </div>

              <div className="value-card">
                <Lock size={22} className="text-primary" />
                <h3>Privacy First</h3>
                <p>We do not track browsing history, store personal media permanently, or require unnecessary user accounts.</p>
              </div>

              <div className="value-card">
                <ShieldCheck size={22} className="text-primary" />
                <h3>Technical Transparency</h3>
                <p>We only present formats and resolutions actively delivered by source servers. We never invent fake 4K or fake files.</p>
              </div>
            </div>

            <h2>Independent Service Disclaimer</h2>
            <div className="about-disclaimer-callout">
              <p>
                VidLoader is an independent online tool and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with YouTube, Google LLC, TikTok, ByteDance Ltd., Instagram, Facebook, Meta Platforms, Inc., Reddit, Inc., or any of their subsidiaries or affiliates.
              </p>
              <p>
                The names YouTube, TikTok, Instagram, Facebook, and Reddit as well as related names, marks, emblems, and images are registered trademarks of their respective owners. Their use on this website is solely for identification and compatibility description purposes.
              </p>
            </div>

            <h2>Contact Our Team</h2>
            <p>
              Have suggestions, technical inquiries, or partnership proposals? Visit our <Link to="/contact">Contact Page</Link> to get in touch directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
