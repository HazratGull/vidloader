import React from 'react';
import { TOOLS_DATA } from '../data/tools';
import SEO from '../components/SEO';
import Downloader from '../components/Downloader';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedTools from '../components/RelatedTools';
import FAQSection from '../components/FAQSection';
import { CheckCircle2, Cpu, Wrench, ArrowRight } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function ToolPage({ slug }) {
  const data = TOOLS_DATA[slug];

  if (!data) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Video Tools', url: '/' },
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
      ...(data.howItWorks ? [{
        '@type': 'HowTo',
        name: `How to Use ${data.name}`,
        description: data.metaDescription,
        step: data.howItWorks.map((step) => ({
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
    <div className="page-wrapper tool-page-wrapper">
      <SEO
        title={data.seoTitle}
        description={data.metaDescription}
        keywords={data.keywords || `${data.name.toLowerCase()}, online video converter, free mp4 converter, youtube to mp3`}
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

          {/* Downloader Card Customized for Tool */}
          <Downloader
            placeholder="Paste video link to convert..."
            targetFormat={data.targetFormat}
          />
        </div>
      </div>

      {/* How it Works */}
      {data.howItWorks && (
        <section className="platform-steps-section">
          <div className="section-container">
            <div className="section-header-centered">
              <div className="section-tag">
                <Wrench size={15} />
                <span>HOW IT WORKS</span>
              </div>
              <h2 className="section-title">How to Use {data.name}</h2>
              <p className="section-subtitle">
                Simple, high-speed media conversion right inside your browser.
              </p>
            </div>

            <div className="platform-steps-grid">
              {data.howItWorks.map((step) => (
                <div key={step.step} className="platform-step-card">
                  <div className="step-circle">{step.step}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technical Highlights */}
      {data.technicalHighlights && (
        <section className="tool-tech-section">
          <div className="section-container">
            <div className="tech-highlights-card">
              <div className="tech-card-header">
                <Cpu size={22} className="text-primary" />
                <h2 className="tech-card-title">Technical Specifications &amp; Compatibility</h2>
              </div>
              <ul className="tech-checklist">
                {data.technicalHighlights.map((highlight, idx) => (
                  <li key={idx} className="tech-item">
                    <CheckCircle2 size={18} className="text-success" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {data.faqs && (
        <FAQSection
          title={`${data.name} FAQ`}
          subtitle={`Frequently asked technical questions regarding ${data.name}.`}
          faqs={data.faqs}
        />
      )}

      {/* Related Tools */}
      <RelatedTools
        title="Related Conversion Tools"
        tools={data.relatedTools}
      />
    </div>
  );
}
