import React from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { ShieldAlert, Mail, CheckCircle2, FileText } from 'lucide-react';

export default function DMCAPage() {
  const breadcrumbs = [{ label: 'DMCA Policy', url: '/dmca' }];

  const dmcaStructuredData = {
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
            name: 'DMCA Policy',
            item: 'https://vidloader.online/dmca',
          },
        ],
      },
    ],
  };

  return (
    <div className="page-wrapper legal-page-wrapper">
      <SEO
        title="DMCA / Copyright Policy - VidLoader Intellectual Property Notice"
        description="VidLoader Copyright and DMCA takedown notice procedure. We respect intellectual property and provide a clear process for copyright owners."
        keywords="vidloader dmca, copyright policy, content takedown notice procedure"
        canonical="https://vidloader.online/dmca"
        structuredData={dmcaStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <ShieldAlert size={15} />
              <span>COPYRIGHT COMPLIANCE</span>
            </div>
            <h1 className="page-title">DMCA / Copyright Policy</h1>
            <p className="page-subtitle">
              VidLoader respects intellectual property rights and responds expeditiously to valid copyright infringement notifications.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-content-body">
        <div className="section-container">
          <div className="legal-text-card">
            <h2>1. Notice and Takedown Overview</h2>
            <p>
              VidLoader is a software tool that allows users to process public video links. <strong>VidLoader does not host, store, or archive videos on our servers.</strong> We operate as an automated pipeline that connects clients to publicly accessible content delivered by third-party hosting services.
            </p>
            <p>
              Nevertheless, we take intellectual property rights seriously. If you believe that your copyrighted work is being made available in a manner that infringes your rights, or if you wish to request that specific URLs or domains be blocked from our resolver service, please submit a formal notification as described below.
            </p>

            <h2>2. Filing a Takedown Notice (Required Elements)</h2>
            <p>
              To ensure prompt action, your written notification must include the following information:
            </p>
            <ol>
              <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner.</li>
              <li>Identification of the copyrighted work claimed to have been infringed (or, if multiple works are covered, a representative list).</li>
              <li>Identification of the material claimed to be infringing, including the exact URL(s) on the source platform that you wish to block from resolution.</li>
              <li>Information reasonably sufficient to permit us to contact you, such as your full name, mailing address, telephone number, and email address.</li>
              <li>A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            </ol>

            <h2>3. Where to Send Notices</h2>
            <p>
              Please send all DMCA inquiries and takedown notices to our designated copyright agent via email:
            </p>
            <div className="dmca-contact-card">
              <Mail size={20} className="text-primary" />
              <div>
                <strong>Designated Copyright Agent:</strong>
                <p>Email: <code>dmca@vidloader.online</code></p>
                <p>Subject Line: <em>"DMCA Copyright Infringement Notice"</em></p>
              </div>
            </div>

            <h2>4. Domain and URL Blacklisting</h2>
            <p>
              Upon receiving a valid and complete infringement notification, VidLoader will expeditiously review the request and block the offending URL, content ID, or channel from being resolved or processed by our systems.
            </p>

            <h2>5. Repeat Infringers</h2>
            <p>
              In accordance with applicable law, VidLoader reserves the right to implement technical blocks against repeat requests or abusers of our utility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
