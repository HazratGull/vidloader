import React from 'react';
import { GUIDES_DATA } from '../data/guides';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedTools from '../components/RelatedTools';
import FAQSection from '../components/FAQSection';
import { Clock, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function GuideDetailPage({ slug }) {
  const guide = GUIDES_DATA[slug];

  if (!guide) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Guides', url: '/guides' },
    { label: guide.title, url: `/guides/${guide.slug}` },
  ];

  const guideStructuredData = {
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
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: guide.canonical,
          },
        ],
      },
      {
        '@type': 'Article',
        headline: guide.h1,
        description: guide.metaDescription,
        url: guide.canonical,
        datePublished: guide.publishDate,
        author: {
          '@type': 'Organization',
          name: 'VidLoader Editorial Team',
          url: 'https://vidloader.online',
        },
        publisher: {
          '@type': 'Organization',
          name: 'VidLoader',
          logo: {
            '@type': 'ImageObject',
            url: 'https://vidloader.online/vidloader-logo.png',
          },
        },
      },
      ...(guide.steps ? [{
        '@type': 'HowTo',
        name: guide.h1,
        description: guide.metaDescription,
        step: guide.steps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.title,
          text: step.content,
        })),
      }] : []),
      ...(guide.faqs ? [{
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((faq) => ({
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
    <div className="page-wrapper guide-detail-wrapper">
      <SEO
        title={guide.seoTitle}
        description={guide.metaDescription}
        keywords={`${guide.title.toLowerCase()}, video download guide, how to download video tutorial, step by step video download`}
        canonical={guide.canonical}
        type="article"
        structuredData={guideStructuredData}
      />

      <div className="guide-hero-header">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="guide-meta-bar">
            <span className="guide-badge-pill">STEP-BY-STEP GUIDE</span>
            <span className="guide-meta-item">
              <Calendar size={14} />
              {guide.publishDate}
            </span>
            <span className="guide-meta-item">
              <Clock size={14} />
              {guide.readTime}
            </span>
          </div>

          <h1 className="guide-h1">{guide.h1}</h1>

          <p className="guide-intro-lead">{guide.intro}</p>
        </div>
      </div>

      <div className="guide-content-body">
        <div className="section-container">
          <div className="guide-main-column">
            {/* Step-by-Step Instructions */}
            <div className="guide-steps-list">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="guide-step-block">
                  <div className="step-badge-indicator">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="step-block-content">
                    <h2 className="step-block-title">{step.title}</h2>
                    <p className="step-block-text">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Important Notes */}
            {guide.importantNotes && (
              <div className="important-notes-callout">
                <div className="callout-header">
                  <AlertTriangle size={20} className="text-warning" />
                  <h3 className="callout-title">Important Guidelines &amp; Best Practices</h3>
                </div>
                <ul className="callout-list">
                  {guide.importantNotes.map((note, idx) => (
                    <li key={idx} className="callout-item">
                      <CheckCircle2 size={16} className="text-primary" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide FAQs */}
      {guide.faqs && (
        <FAQSection
          title="Guide Questions &amp; Answers"
          subtitle="Key takeaways for this walkthrough."
          faqs={guide.faqs}
        />
      )}

      {/* Related Tools */}
      <RelatedTools
        title="Recommended Tools for This Guide"
        tools={guide.relatedTools}
      />
    </div>
  );
}
