import React, { useState } from 'react';
import { Link } from '../utils/router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Code, CheckCircle2, Copy, Globe, Sparkles, ExternalLink } from 'lucide-react';

export default function WebmastersPage() {
  const [copiedBadge, setCopiedBadge] = useState(false);
  const breadcrumbs = [{ label: 'For Webmasters', url: '/webmasters' }];

  const badgeSnippet = `<!-- VidLoader Quick Download Button -->
<a href="https://vidloader.online" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-family:sans-serif;font-size:13px;font-weight:600;">
  <span>Download with VidLoader</span>
</a>`;

  const copyBadge = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(badgeSnippet);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    }
  };

  const webmastersStructuredData = {
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
            name: 'For Webmasters',
            item: 'https://vidloader.online/webmasters',
          },
        ],
      },
    ],
  };

  return (
    <div className="page-wrapper legal-page-wrapper">
      <SEO
        title="For Webmasters & Developers - VidLoader Download Integration Tools"
        description="Tools, badges, and integration solutions for content creators, bloggers, and webmasters looking to provide offline media access."
        keywords="webmaster video download badge, video download button embed, website media tool"
        canonical="https://vidloader.online/webmasters"
        structuredData={webmastersStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Globe size={15} />
              <span>WEBMASTER RESOURCES</span>
            </div>
            <h1 className="page-title">Tools for Webmasters &amp; Creators</h1>
            <p className="page-subtitle">
              Integrate VidLoader buttons, embed direct media links, and offer safe offline reading to your audience.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-content-body">
        <div className="section-container">
          <div className="legal-text-card">
            <h2>Embeddable VidLoader Badge</h2>
            <p>
              If you run a blog, podcast site, or educational portal and want to offer your readers a 1-click option to download your video lectures or podcasts:
            </p>

            <div className="badge-preview-box">
              <div className="badge-preview-render">
                <a
                  href="https://vidloader.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="preview-btn"
                >
                  Download with VidLoader
                </a>
              </div>

              <div className="badge-code-display">
                <pre><code>{badgeSnippet}</code></pre>
                <button className="btn-copy-badge" onClick={copyBadge}>
                  {copiedBadge ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
                  <span>{copiedBadge ? 'Copied HTML' : 'Copy HTML Snippet'}</span>
                </button>
              </div>
            </div>

            <h2>Direct URL Query Linking</h2>
            <p>
              You can link directly to VidLoader with a pre-filled URL by appending the target link as a query parameter (coming in API v2):
            </p>
            <code>https://vidloader.online/?url=https://www.youtube.com/watch?v=VIDEO_ID</code>

            <h2>Fair Use &amp; Publisher Rights</h2>
            <p>
              VidLoader actively collaborates with digital content creators. If you are a copyright owner and want to manage or restrict link resolution for your proprietary domains, please refer to our <Link to="/dmca">DMCA &amp; Copyright Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
