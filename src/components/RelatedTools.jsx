import React from 'react';
import { Link } from '../utils/router';
import { ArrowRight, Wrench, BookOpen } from 'lucide-react';

export default function RelatedTools({
  title = 'Related Tools & Resources',
  tools = [],
  guides = [],
}) {
  if (tools.length === 0 && guides.length === 0) return null;

  return (
    <section className="related-section">
      <div className="section-container">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">
          Explore complementary tools and step-by-step guides for media processing.
        </p>

        <div className="related-grid">
          {tools.map((item, idx) => (
            <Link key={idx} to={item.url} className="related-card tool-card">
              <div className="related-card-header">
                <div className="related-icon-box">
                  <Wrench size={18} />
                </div>
                <ArrowRight size={16} className="card-arrow" />
              </div>
              <h3 className="related-card-title">{item.title}</h3>
              {item.desc && <p className="related-card-desc">{item.desc}</p>}
            </Link>
          ))}

          {guides.map((item, idx) => (
            <Link key={`g-${idx}`} to={item.url} className="related-card guide-card">
              <div className="related-card-header">
                <div className="related-icon-box guide-icon">
                  <BookOpen size={18} />
                </div>
                <ArrowRight size={16} className="card-arrow" />
              </div>
              <h3 className="related-card-title">{item.title}</h3>
              <p className="related-card-desc">Step-by-step tutorial &amp; best practices</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
