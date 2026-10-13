import React from 'react';
import { Link } from '../utils/router';
import { GUIDES_DATA } from '../data/guides';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { BookOpen, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function GuidesIndexPage() {
  const guideList = Object.values(GUIDES_DATA);

  const guidesStructuredData = {
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
            name: 'Guides',
            item: 'https://vidloader.online/guides',
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Video Download Guides & Tutorials',
        itemListElement: guideList.map((g, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: g.title,
          url: `https://vidloader.online/guides/${g.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="page-wrapper guides-index-wrapper">
      <SEO
        title="Guides & Tutorials - How to Download & Convert Videos | VidLoader"
        description="Comprehensive, step-by-step tutorials and best practices on downloading, converting, and preserving online videos from YouTube, TikTok, Instagram, and more."
        keywords="video download guides, how to download online video tutorials, save youtube videos, download tiktok no watermark guide"
        canonical="https://vidloader.online/guides"
        structuredData={guidesStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={[{ label: 'Guides', url: '/guides' }]} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <BookOpen size={15} />
              <span>EDUCATION &amp; TUTORIALS</span>
            </div>
            <h1 className="page-title">Video Download Guides &amp; Walkthroughs</h1>
            <p className="page-subtitle">
              Detailed step-by-step instructions on saving online media, extracting audio tracks, and managing video quality safely.
            </p>
          </div>
        </div>
      </div>

      <section className="guides-list-section">
        <div className="section-container">
          <div className="guides-grid-main">
            {guideList.map((guide) => (
              <article key={guide.slug} className="guide-card-tile">
                <div className="guide-card-top-meta">
                  <span className="guide-badge">TUTORIAL</span>
                  <span className="guide-read-time">
                    <Clock size={13} />
                    {guide.readTime}
                  </span>
                </div>

                <h2 className="guide-card-heading">
                  <Link to={`/guides/${guide.slug}`}>{guide.title}</Link>
                </h2>

                <p className="guide-card-intro">{guide.intro}</p>

                <div className="guide-card-action">
                  <Link to={`/guides/${guide.slug}`} className="btn-read-guide">
                    <span>Read Step-by-Step</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
