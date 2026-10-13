import React, { useState } from 'react';
import { FAQS_DATA } from '../data/faqs';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from '../utils/router';
import { HelpCircle, ChevronDown, ArrowRight, MessageSquare } from 'lucide-react';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndices, setOpenIndices] = useState([]);

  const categories = ['All', 'General', 'Compatibility', 'Formats & Quality', 'Troubleshooting', 'Privacy & Security', 'Cost & Access', 'Devices', 'Legal'];

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    return selectedCategory === 'All' || faq.category === selectedCategory;
  });

  const toggleIndex = (idx) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const faqSchema = {
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
            name: 'FAQ',
            item: 'https://vidloader.online/faq',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS_DATA.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="page-wrapper faq-page-wrapper">
      <SEO
        title="Video Downloader FAQ - 1080p Formats, Devices & Help | VidLoader"
        description="Comprehensive answers to all questions regarding VidLoader video resolution, supported platforms, file formats (MP4, MP3), device compatibility, and copyright policies."
        keywords="video downloader faq, how to download 1080p, is video downloading legal, convert video to mp3 help, vidloader support"
        canonical="https://vidloader.online/faq"
        structuredData={faqSchema}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={[{ label: 'FAQ', url: '/faq' }]} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <HelpCircle size={15} />
              <span>HELP CENTER</span>
            </div>
            <h1 className="page-title">Frequently Asked Questions</h1>
            <p className="page-subtitle">
              Have questions about how VidLoader resolves video links or formats? Find verified answers below.
            </p>
          </div>
        </div>
      </div>

      <div className="faq-content-section">
        <div className="section-container">
          {/* Category Filter Pills */}
          <div className="category-pills-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndices([]);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-container" style={{ marginTop: '2rem' }}>
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <HelpCircle size={32} className="text-muted" />
                <p>No questions found in this category.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndices.includes(index);
                return (
                  <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleIndex(index)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <ChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} size={18} />
                    </button>

                    {isOpen && (
                      <div className="faq-answer-pane" role="region">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Support Banner */}
          <div className="faq-contact-box">
            <div className="contact-box-left">
              <MessageSquare size={24} className="text-primary" />
              <div>
                <h3>Still have a question?</h3>
                <p>Can't find what you are looking for? Reach out to our technical team.</p>
              </div>
            </div>
            <Link to="/contact" className="btn-secondary-link">
              <span>Contact Us</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
