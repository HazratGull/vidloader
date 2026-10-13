import React from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  const breadcrumbs = [{ label: 'Terms of Service', url: '/terms' }];

  const termsStructuredData = {
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
            name: 'Terms of Service',
            item: 'https://vidloader.online/terms',
          },
        ],
      },
    ],
  };

  return (
    <div className="page-wrapper legal-page-wrapper">
      <SEO
        title="Terms of Service - VidLoader Fair Use & Conditions"
        description="Terms and conditions governing the use of VidLoader online video downloader and media conversion utilities."
        keywords="vidloader terms, video downloader terms of service, fair use policy"
        canonical="https://vidloader.online/terms"
        structuredData={termsStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <FileText size={15} />
              <span>LEGAL AGREEMENT</span>
            </div>
            <h1 className="page-title">Terms of Service</h1>
            <p className="page-subtitle">
              Last updated: September 2026. Please read these terms carefully before utilizing the VidLoader website or tools.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-content-body">
        <div className="section-container">
          <div className="legal-text-card">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using VidLoader (https://vidloader.online) and any related tools or services, you agree to be bound by these Terms of Service. If you do not agree to all terms, you must discontinue use of the website immediately.
            </p>

            <h2>2. Permitted Use &amp; Intellectual Property Rights</h2>
            <p>
              VidLoader is designed as a neutral, browser-based media inspection and utility tool. You agree that:
            </p>
            <ul>
              <li>You will only resolve, convert, or download media that you own, have express permission from the copyright holder to download, or that is distributed under Creative Commons or Public Domain licenses permitting reproduction.</li>
              <li>You will not use VidLoader to infringe upon the intellectual property or proprietary rights of any third party.</li>
              <li>You are solely responsible for ensuring that your use of downloaded media complies with all applicable local, national, and international copyright laws.</li>
            </ul>

            <h2>3. Technological Restrictions &amp; Prohibitions</h2>
            <p>
              You explicitly agree NOT to:
            </p>
            <ul>
              <li>Attempt to circumvent, bypass, or disable digital rights management (DRM), encryption, or access-control technologies implemented by any video streaming platform.</li>
              <li>Access or download content from private profiles, password-protected feeds, paid paywalls, or subscription-only media.</li>
              <li>Use automated scripts, bots, spiders, or scrapers to place an unreasonable load on VidLoader's infrastructure.</li>
              <li>Re-distribute or sell media downloaded through VidLoader in violation of publisher copyrights.</li>
            </ul>

            <h2>4. Third-Party Trademarks &amp; Affiliation Disclaimer</h2>
            <p>
              VidLoader is an independent technical tool. VidLoader is not affiliated with, authorized, or endorsed by Google, YouTube, Meta, Instagram, Facebook, TikTok, ByteDance, or Reddit. All brand names and trademarks belong strictly to their respective holders.
            </p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>
              VidLoader is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any specific video URL will remain supported in the future.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, VidLoader and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the website or tools.
            </p>

            <h2>7. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any feature or service at any time without prior notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
