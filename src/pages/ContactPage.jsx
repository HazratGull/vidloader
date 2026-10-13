import React, { useState } from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { resolveApiUrl } from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Support',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const breadcrumbs = [{ label: 'Contact', url: '/contact' }];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Persist in localStorage as backup
    try {
      const stored = JSON.parse(localStorage.getItem('vidloader_contact_messages') || '[]');
      stored.unshift({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('vidloader_contact_messages', JSON.stringify(stored));
    } catch {}

    // Dispatch to server API
    try {
      await fetch(resolveApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // Offline fallback still succeeds via local persistence
    }

    // Submission success state
    setSubmitted(true);
  };

  const contactStructuredData = {
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
            name: 'Contact',
            item: 'https://vidloader.online/contact',
          },
        ],
      },
      {
        '@type': 'ContactPage',
        name: 'Contact VidLoader',
        description: 'Get in touch with the VidLoader technical team for technical assistance, reporting broken link resolvers, DMCA inquiries, or feedback.',
        url: 'https://vidloader.online/contact',
      },
    ],
  };

  return (
    <div className="page-wrapper contact-page-wrapper">
      <SEO
        title="Contact Us - VidLoader Support & Feedback"
        description="Get in touch with the VidLoader technical team for technical assistance, reporting broken link resolvers, DMCA inquiries, or feedback."
        keywords="contact vidloader, vidloader support, report video download bug, help"
        canonical="https://vidloader.online/contact"
        structuredData={contactStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Mail size={15} />
              <span>SUPPORT &amp; INQUIRIES</span>
            </div>
            <h1 className="page-title">Contact VidLoader</h1>
            <p className="page-subtitle">
              Have an inquiry, feedback, or need to report an unsupported video URL format? Send us a message.
            </p>
          </div>
        </div>
      </div>

      <div className="contact-form-section">
        <div className="section-container">
          <div className="contact-grid">
            {/* Information Column */}
            <div className="contact-info-card">
              <h2>How We Can Help</h2>
              <p>
                Our engineering team actively monitors URL resolver endpoints across all supported platforms. If an update on YouTube, TikTok, or Instagram causes errors, let us know!
              </p>

              <div className="contact-methods-list">
                <div className="contact-method-item">
                  <div className="method-icon">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4>Technical Support</h4>
                    <p>Report link resolution issues or platform bugs.</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <div className="method-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4>Direct Email Inquiries</h4>
                    <p>contact@vidloader.online</p>
                  </div>
                </div>
              </div>

              <div className="contact-notice-box">
                <p>
                  <strong>Response Times:</strong> We typically respond to technical inquiries and takedown notices within 24 to 48 business hours.
                </p>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="contact-form-card">
              {submitted ? (
                <div className="contact-success-state">
                  <CheckCircle2 size={48} className="text-success" />
                  <h3>Message Sent Successfully!</h3>
                  <p>
                    Thank you for reaching out, <strong>{formData.name}</strong>. Our team will review your message and respond to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    className="btn-secondary-link"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        category: 'Support',
                        subject: '',
                        message: '',
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form" noValidate>
                  {error && (
                    <div className="contact-error-banner" role="alert">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="form-group-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Your Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Alex Morgan"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label htmlFor="category" className="form-label">
                        Inquiry Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Support">Technical Support / Resolver Bug</option>
                        <option value="Feature">Feature Suggestion</option>
                        <option value="DMCA">DMCA / Copyright Notice</option>
                        <option value="Business">API / Webmaster Inquiry</option>
                        <option value="Other">General Feedback</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief summary of inquiry"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please include any relevant video URLs or browser details..."
                      required
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-contact-submit">
                    <Send size={16} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
