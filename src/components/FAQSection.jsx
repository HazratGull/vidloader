import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection({
  title = 'Frequently Asked Questions',
  subtitle = 'Find answers to common questions about using VidLoader safely and effectively.',
  faqs = [],
  includeSchema = true,
}) {
  const [openIndices, setOpenIndices] = useState([0]); // first open by default

  if (!faqs || faqs.length === 0) return null;

  const toggleIndex = (index) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqSchema = includeSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="section-container">
        <div className="section-header-centered">
          <div className="section-tag">
            <HelpCircle size={15} />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 id="faq-heading" className="section-title">
            {title}
          </h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        <div className="faq-accordion-container">
          {faqs.map((item, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleIndex(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{item.question}</span>
                  <ChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} size={18} />
                </button>

                {isOpen && (
                  <div className="faq-answer-pane" role="region">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
