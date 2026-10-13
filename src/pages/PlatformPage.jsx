import React from 'react';
import { PLATFORMS_DATA } from '../data/platforms';
import SEO from '../components/SEO';
import Downloader from '../components/Downloader';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedTools from '../components/RelatedTools';
import FAQSection from '../components/FAQSection';
import { CheckCircle2, ShieldAlert, Sparkles, Layers, Zap, Info } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function PlatformPage({ slug }) {
  const data = PLATFORMS_DATA[slug];

  if (!data) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Video Downloaders', url: '/' },
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
        name: `How to Download ${data.platformName} Videos`,
        description: `Step-by-step instructions for downloading ${data.platformName} videos in high quality.`,
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
    <div className="page-wrapper platform-page-wrapper">
      <SEO
        title={data.seoTitle}
        description={data.metaDescription}
        keywords={data.keywords || `${data.name.toLowerCase()}, ${data.platformName.toLowerCase()} video download, save ${data.platformName.toLowerCase()} video, download video online, mp4 downloader`}
        canonical={data.canonical}
        structuredData={structuredData}
      />

      <div className="platform-hero-container">
        <Breadcrumbs items={breadcrumbs} />

        <div className="platform-hero-content">
          <h1 className="platform-h1">{data.h1}</h1>

          <p className="platform-intro-text">{data.introText}</p>

          {/* Downloader Card Customized for Platform */}
          <Downloader
            defaultPlatform={data.id}
            placeholder={`Paste ${data.platformName} URL here...`}
          />
        </div>
      </div>

      {/* Supported Qualities & Specifications */}
      {data.supportedQualities && (
        <section className="platform-specs-section">
          <div className="section-container">
            <div className="specs-card">
              <div className="specs-card-header">
                <Layers size={20} className="specs-icon" />
                <h2 className="specs-title">Supported Formats &amp; Qualities for {data.platformName}</h2>
              </div>
              <p className="specs-subtext">
                VidLoader inspects the public media delivery endpoints and surfaces every resolution actively delivered by {data.platformName}.
              </p>

              <div className="specs-table-wrapper">
                <table className="specs-table">
                  <thead>
                    <tr>
                      <th>Resolution / Quality</th>
                      <th>Container</th>
                      <th>Technical Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.supportedQualities.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="spec-quality-pill">{item.quality}</span>
                        </td>
                        <td>
                          <span className="spec-container-badge">{item.format}</span>
                        </td>
                        <td className="spec-note-text">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it Works Step-by-Step */}
      <section className="platform-steps-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <Zap size={15} />
              <span>STEP-BY-STEP</span>
            </div>
            <h2 className="section-title">How to Download {data.platformName} Videos</h2>
            <p className="section-subtitle">
              Follow these simple steps to save media directly to your device.
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

      {/* Key Features */}
      {data.features && (
        <section className="platform-features-section">
          <div className="section-container">
            <div className="section-header-centered">
              <div className="section-tag">
                <Sparkles size={15} />
                <span>KEY ADVANTAGES</span>
              </div>
              <h2 className="section-title">Why Use VidLoader for {data.platformName}</h2>
            </div>

            <div className="features-columns-grid">
              {data.features.map((feat, idx) => (
                <div key={idx} className="platform-feature-card">
                  <div className="feature-check-icon">
                    <CheckCircle2 size={20} className="text-primary" />
                  </div>
                  <div className="feature-card-content">
                    <h3 className="feature-card-title">{feat.title}</h3>
                    <p className="feature-card-desc">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {data.faqs && (
        <FAQSection
          title={`${data.platformName} Video Downloader FAQ`}
          subtitle={`Frequently asked questions about downloading and saving videos from ${data.platformName}.`}
          faqs={data.faqs}
        />
      )}

      {/* Related Tools & Guides */}
      <RelatedTools
        title={`Related ${data.platformName} Tools & Guides`}
        tools={data.relatedTools}
        guides={data.relatedGuides}
      />
    </div>
  );
}
