import React from 'react';
import { Link } from '../utils/router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export default function PrivacyPage() {
  const breadcrumbs = [{ label: 'Privacy Policy', url: '/privacy' }];

  const privacyStructuredData = {
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
            name: 'Privacy Policy',
            item: 'https://vidloader.online/privacy',
          },
        ],
      },
    ],
  };

  return (
    <div className="page-wrapper legal-page-wrapper">
      <SEO
        title="Privacy Policy - VidLoader Safe & Anonymous Video Downloader"
        description="VidLoader privacy policy. We do not store downloaded videos permanently, track personal user data, or harvest personal contact lists."
        keywords="vidloader privacy, safe video downloader privacy, no log video download"
        canonical="https://vidloader.online/privacy"
        structuredData={privacyStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Lock size={15} />
              <span>DATA PROTECTION</span>
            </div>
            <h1 className="page-title">Privacy Policy</h1>
            <p className="page-subtitle">
              Last updated: September 2026. How VidLoader handles technical requests and protects user privacy.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-content-body">
        <div className="section-container">
          <div className="legal-text-card">
            <h2>1. Information We Do Not Collect</h2>
            <p>
              VidLoader operates on a strict data-minimization philosophy:
            </p>
            <ul>
              <li><strong>No User Account Information:</strong> You do not need to create an account, log in, or provide personal credentials to use VidLoader.</li>
              <li><strong>No Permanent Video Hosting:</strong> We do not archive or permanently store videos or audio tracks processed through our tools.</li>
              <li><strong>No Tracking of Content Histories:</strong> We do not build profiles based on the URLs you inspect or convert.</li>
            </ul>

            <h2>2. Technical Log Data &amp; Processing</h2>
            <p>
              When you submit a video URL to our service, our servers temporarily process the request to inspect platform manifests, verify stream validity, and initiate media delivery.
            </p>
            <p>
              Standard server logs (containing IP address, browser user-agent, requested endpoint, and timestamp) are temporarily recorded solely for abuse prevention, DDoS mitigation, and operational monitoring. These operational logs are rotated and discarded automatically.
            </p>

            <h2>3. Temporary File Handling</h2>
            <p>
              In scenarios where video and audio streams require remuxing (such as combining DASH video and audio feeds), temporary files are created on ephemeral storage. These files are automatically deleted immediately after transfer to the client or after an automated hourly expiration window.
            </p>

            <h2>4. Cookies &amp; Local Storage</h2>
            <p>
              VidLoader uses minimal local storage solely to remember user preferences (such as your chosen UI language or previous interface settings). We do not deploy third-party advertising tracking cookies or fingerprinting scripts.
            </p>

            <h2>5. External Links &amp; Third-Party Services</h2>
            <p>
              Our website may contain links to external third-party sites, including streaming platforms. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites.
            </p>

            <h2>6. User Rights (GDPR &amp; CCPA)</h2>
            <p>
              Under applicable privacy regulations (such as GDPR in the European Economic Area and CCPA in California), users have the right to request information on data processing. Because VidLoader does not store identifiable personal profiles, we do not hold personal data archives for deletion or export.
            </p>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy periodically to reflect technological improvements or legal requirements. Any modifications will be posted directly to this page with an updated revision date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <code>privacy@vidloader.online</code> or via our <Link to="/contact">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
