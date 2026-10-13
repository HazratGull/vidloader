import React from 'react';
import { SHORTS_DATA } from '../data/shorts';
import SEO from '../components/SEO';
import Downloader from '../components/Downloader';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedTools from '../components/RelatedTools';
import FAQSection from '../components/FAQSection';
import { Smartphone, CheckCircle2, ListOrdered, Sparkles } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function ShortVideoPage({ slug }) {
  const data = SHORTS_DATA[slug];

  if (!data) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Shorts & Reels', url: '/' },
    { label: data.name, url: `/${data.slug}` },
  ];

  const structuredData = {
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
            name: data.name,
            item: data.canonical,
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: `VidLoader - ${data.h1 || data.name}`,
        url: data.canonical,
        description: data.metaDescription,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Windows, macOS, Linux, Android, iOS)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      ...(data.steps ? [{
        '@type': 'HowTo',
        name: `How to Download ${data.name}`,
        description: data.metaDescription,
        step: data.steps.map((step) => ({
          '@type': 'HowToStep',
          position: step.step,
          name: step.title,
          text: step.description,
        })),
      }] : []),
      ...(data.faqs ? [{
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }] : []),
    ],
  };

  return (
    <div className="page-wrapper short-video-page-wrapper">
      <SEO
        title={data.seoTitle}
        description={data.metaDescription}
        keywords={data.keywords || `${data.name.toLowerCase()}, shorts downloader, download reels hd, vertical video downloader`}
        canonical={data.canonical}
        structuredData={structuredData}
      />

      <div className="platform-hero-container">
        <Breadcrumbs items={breadcrumbs} />

        <div className="platform-hero-content">
          <div className="platform-hero-badge">
            <span className="badge-pill">{data.heroTag}</span>
          </div>

          <h1 className="platform-h1">{data.h1}</h1>

          <p className="platform-intro-text">{data.introText}</p>

          {/* Downloader Card Customized for Shorts */}
          <Downloader
            defaultPlatform={data.platform}
            placeholder="Paste short video or reel URL here..."
          />
        </div>
      </div>

      {/* Vertical Video Features */}
      {data.features && (
        <section className="shorts-features-section">
          <div className="section-container">
            <div className="section-header-centered">
              <div className="section-tag">
                <Smartphone size={15} />
                <span>VERTICAL VIDEO OPTIMIZED</span>
              </div>
              <h2 className="section-title">Engineered for 9:16 Mobile Formats</h2>
            </div>

            <div className="features-grid-cards">
              {data.features.map((feature, idx) => (
                <div key={idx} className="feature-box">
                  <div className="feature-box-icon">
                    <CheckCircle2 size={22} className="text-primary" />
                  </div>
                  <p className="feature-box-desc" style={{ marginTop: '0.5rem', fontWeight: '500' }}>
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instructions */}
      {data.instructions && (
        <section className="shorts-instructions-section">
          <div className="section-container">
            <div className="instructions-card">
              <div className="instructions-header">
                <ListOrdered size={20} className="text-primary" />
                <h2 className="instructions-title">Instructions: Saving Short Videos to Device</h2>
              </div>
              <ol className="instructions-list">
                {data.instructions.map((inst, idx) => (
                  <li key={idx} className="instruction-item">
                    <span className="inst-num">{idx + 1}</span>
                    <span className="inst-text">{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {data.faqs && (
        <FAQSection
          title={`${data.name} FAQ`}
          subtitle="Answers to common questions about saving vertical short videos and reels."
          faqs={data.faqs}
        />
      )}

      {/* Related Tools & Guides */}
      <RelatedTools
        title="Related Tools &amp; Tutorials"
        tools={data.relatedTools}
        guides={data.relatedGuides}
      />
    </div>
  );
}
