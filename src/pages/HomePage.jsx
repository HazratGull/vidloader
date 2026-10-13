import React from 'react';
import { Link } from '../utils/router';
import SEO from '../components/SEO';
import Downloader from '../components/Downloader';
import FAQSection from '../components/FAQSection';
import { FAQS_DATA } from '../data/faqs';
import {
  Film,
  Music,
  Zap,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  Lock,
  DownloadCloud,
} from 'lucide-react';

export default function HomePage() {
  const topFaqs = FAQS_DATA.slice(0, 6);

  const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://vidloader.online/#website',
        url: 'https://vidloader.online/',
        name: 'VidLoader',
        alternateName: 'VidLoader Video Downloader',
        description: 'Free Online Video Downloader and MP3 Audio Converter',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://vidloader.online/?url={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@id': 'https://vidloader.online/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://vidloader.online/#organization',
        name: 'VidLoader',
        url: 'https://vidloader.online/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://vidloader.online/vidloader-logo.png',
          width: 512,
          height: 512,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://vidloader.online/#webapp',
        name: 'VidLoader - Free Online Video Downloader',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Windows, macOS, Linux, Android, iOS)',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Download YouTube videos in 1080p, 720p HD MP4 and MP3 audio',
          'Download TikTok videos without watermark in HD MP4',
          'Save Instagram Reels, video posts, and IG audio',
          'Download Facebook videos and public FB Reels',
          'Extract high-bitrate MP3 320kbps audio from any video',
          'Save Reddit videos with sound in MP4',
          'Zero software installation or registration needed',
          '100% free, safe, and mobile-friendly'
        ],
      },
      {
        '@type': 'HowTo',
        '@id': 'https://vidloader.online/#howto',
        name: 'How to Download Videos Online Using VidLoader',
        description: 'Quick 3-step walkthrough to download and convert online videos to MP4 or MP3 for free.',
        totalTime: 'PT30S',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Copy Video URL',
            text: 'Copy the public video link from YouTube, TikTok, Instagram, Facebook, Twitter, or Reddit.',
            url: 'https://vidloader.online/#step1',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Paste URL in VidLoader',
            text: 'Paste the copied URL into the VidLoader search box at the top of the page and click Download.',
            url: 'https://vidloader.online/#step2',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Choose Format and Download',
            text: 'Select your preferred format (1080p HD MP4 or 320kbps MP3) and save the file directly to your device.',
            url: 'https://vidloader.online/#step3',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://vidloader.online/#faq',
        mainEntity: topFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      title: 'YouTube Downloader',
      url: '/youtube-downloader',
      desc: 'Save videos, shorts, and music tracks in 1080p, 720p MP4 or MP3.',
      iconColor: '#FF0000',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      title: 'TikTok Downloader',
      url: '/tiktok-downloader',
      desc: 'Download clean TikTok videos without watermarks and extract audio.',
      iconColor: '#000000',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      title: 'Instagram Downloader',
      url: '/instagram-downloader',
      desc: 'Save Instagram Reels, video posts, and carousel clips in Full HD.',
      iconColor: '#E4405F',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      title: 'Facebook Video Downloader',
      url: '/facebook-video-downloader',
      desc: 'Download Facebook Watch clips, news videos, and public reels.',
      iconColor: '#1877F2',
    },
    {
      id: 'reddit',
      name: 'Reddit',
      title: 'Reddit Video Downloader',
      url: '/reddit-video-downloader',
      desc: 'Save v.redd.it videos multiplexed with complete audio in MP4.',
      iconColor: '#FF4500',
    },
  ];

  const popularTools = [
    { title: 'YouTube to MP4', url: '/youtube-to-mp4', desc: 'Direct MP4 packaging with video & sound sync.' },
    { title: 'YouTube to MP3', url: '/youtube-to-mp3', desc: 'Extract pure audio up to 320 kbps bitrate.' },
    { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Universal audio extraction across all platforms.' },
    { title: 'YouTube Shorts Downloader', url: '/youtube-shorts-downloader', desc: 'Download vertical shorts in 1080p.' },
    { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Standardize DASH and web streams to MP4.' },
    { title: 'Video Thumbnail Downloader', url: '/video-thumbnail-downloader', desc: 'Extract max-resolution cover art.' },
  ];

  const guides = [
    {
      title: 'How to Download Videos Online',
      url: '/guides/how-to-download-videos',
      desc: 'The complete beginner walkthrough for desktop and mobile devices.',
    },
    {
      title: 'How to Download YouTube Videos',
      url: '/guides/how-to-download-youtube-videos',
      desc: 'Learn how to save authorized YouTube videos in 1080p HD or MP3 audio.',
    },
    {
      title: 'How to Download TikTok Videos Without Watermark',
      url: '/guides/how-to-download-tiktok-videos',
      desc: 'Save clean, watermark-free vertical TikTok clips to your camera roll.',
    },
  ];

  return (
    <div className="page-wrapper homepage-wrapper">
      <SEO
        title="VidLoader - Free Online Video Downloader | Download HD Videos & MP3"
        description="Free online video downloader to save YouTube, TikTok (no watermark), Instagram Reels, Facebook, and Twitter videos in 1080p, 4K HD MP4 and 320kbps MP3. 100% free, fast, and no registration needed."
        keywords="video downloader, free online video downloader, youtube video downloader, tiktok downloader no watermark, instagram reels downloader, facebook video downloader, mp4 downloader, youtube to mp3, 1080p video downloader, convert video to mp3, fast video downloader"
        canonical="https://vidloader.online/"
        structuredData={homepageStructuredData}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-main-heading">Free Online Video Downloader</h1>

          {/* Downloader Card */}
          <Downloader
            placeholder="Paste YouTube, TikTok, Instagram, or Facebook link..."
          />
        </div>
      </section>

      {/* Supported Platforms Grid */}
      <section className="platforms-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <Globe size={15} />
              <span>SUPPORTED PLATFORMS</span>
            </div>
            <h2 className="section-title">Supported Video Services</h2>
            <p className="section-subtitle">
              VidLoader connects to major public video networks to extract high-quality video and audio streams.
            </p>
          </div>

          <div className="platforms-grid">
            {platforms.map((plat) => (
              <Link key={plat.id} to={plat.url} className="platform-card">
                <div className="platform-card-top">
                  <div className="platform-pill-badge" style={{ borderColor: plat.iconColor }}>
                    <span className="plat-dot" style={{ backgroundColor: plat.iconColor }}></span>
                    <span className="plat-name">{plat.name}</span>
                  </div>
                  <ArrowRight size={16} className="card-hover-arrow" />
                </div>
                <h3 className="platform-card-title">{plat.title}</h3>
                <p className="platform-card-desc">{plat.desc}</p>
                <div className="platform-card-cta">
                  <span>Open Downloader</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How VidLoader Works */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <Zap size={15} />
              <span>HOW IT WORKS</span>
            </div>
            <h2 className="section-title">Download in 3 Simple Steps</h2>
            <p className="section-subtitle">
              No software installation, no browser extensions, and no registration required.
            </p>
          </div>

          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-number-badge">01</div>
              <h3 className="step-card-title">Copy URL</h3>
              <p className="step-card-desc">
                Copy the public video link from your browser or app (YouTube, TikTok, Instagram, Facebook, etc.).
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">02</div>
              <h3 className="step-card-title">Paste in VidLoader Search Bar</h3>
              <p className="step-card-desc">
                Paste the copied video link into the VidLoader search bar at the top of the page.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">03</div>
              <h3 className="step-card-title">Start Download Option</h3>
              <p className="step-card-desc">
                Select your preferred format (MP4 or MP3) and click download to save the media file directly to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Formats & Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <Layers size={15} />
              <span>TECHNICAL FEATURES</span>
            </div>
            <h2 className="section-title">Designed for Fast, High-Fidelity Downloads</h2>
            <p className="section-subtitle">
              Engineered with modern web standards and transparent media processing.
            </p>
          </div>

          <div className="features-grid-cards">
            <div className="feature-box">
              <div className="feature-box-icon">
                <Film size={22} />
              </div>
              <h3 className="feature-box-title">Full HD 1080p &amp; 720p</h3>
              <p className="feature-box-desc">
                Extract high-resolution video streams up to 1080p Full HD with preserved framerates and vibrant dynamic range.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon">
                <Music size={22} />
              </div>
              <h3 className="feature-box-title">Direct MP3 Audio Extraction</h3>
              <p className="feature-box-desc">
                Extract high-bitrate MP3 or M4A audio from speeches, lectures, podcasts, and creative commons tracks.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon">
                <Lock size={22} />
              </div>
              <h3 className="feature-box-title">Privacy-First Architecture</h3>
              <p className="feature-box-desc">
                We never store personal download logs or permanently host user media. Transcoded temporary files are purged automatically.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box-icon">
                <Smartphone size={22} />
              </div>
              <h3 className="feature-box-title">100% Mobile Compatible</h3>
              <p className="feature-box-desc">
                Fully responsive layout tailored for mobile browsers on iOS and Android. Save directly to your Photos or Files app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="popular-tools-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <Sparkles size={15} />
              <span>POPULAR TOOLS</span>
            </div>
            <h2 className="section-title">Specialized Media Tools</h2>
            <p className="section-subtitle">
              Need a specific conversion? Explore our dedicated utilities.
            </p>
          </div>

          <div className="tools-grid-list">
            {popularTools.map((t, idx) => (
              <Link key={idx} to={t.url} className="tool-tile">
                <div className="tool-tile-content">
                  <h3 className="tool-tile-title">{t.title}</h3>
                  <p className="tool-tile-desc">{t.desc}</p>
                </div>
                <ArrowRight size={18} className="tool-tile-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use VidLoader */}
      <section className="why-us-section">
        <div className="section-container">
          <div className="why-us-card">
            <div className="why-us-text">
              <span className="why-tag">WHY VIDLOADER</span>
              <h2 className="why-title">A Transparent, Honest Online Video Tool</h2>
              <p className="why-p">
                Unlike older download portals overloaded with intrusive pop-ups, misleading redirect banners, and bloated installers, VidLoader delivers a streamlined, minimal web interface.
              </p>
              <ul className="why-checklist">
                <li>
                  <CheckCircle2 size={18} className="text-success" />
                  <span>No invasive adware, pop-unders, or misleading fake buttons</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="text-success" />
                  <span>Real format discovery—never promises resolutions that don't exist</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="text-success" />
                  <span>Lightweight, fast-loading architecture optimized for mobile data</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="text-success" />
                  <span>Strict adherence to platform terms and fair use rights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <FAQSection
        title="Frequently Asked Questions"
        subtitle="Common questions about supported formats, video resolution, and usage terms."
        faqs={FAQS_DATA.slice(0, 6)}
      />

      {/* Related Guides Section */}
      <section className="home-guides-section">
        <div className="section-container">
          <div className="section-header-centered">
            <div className="section-tag">
              <span>TUTORIALS &amp; GUIDES</span>
            </div>
            <h2 className="section-title">Learn How to Download Media</h2>
            <p className="section-subtitle">
              Comprehensive walkthroughs for saving and converting videos across all platforms.
            </p>
          </div>

          <div className="home-guides-grid">
            {guides.map((g, idx) => (
              <Link key={idx} to={g.url} className="home-guide-card">
                <span className="guide-card-tag">GUIDE</span>
                <h3 className="guide-card-title">{g.title}</h3>
                <p className="guide-card-desc">{g.desc}</p>
                <div className="guide-card-footer">
                  <span>Read Guide</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>

          <div className="section-view-all-center">
            <Link to="/guides" className="btn-secondary-link">
              <span>View All Guides</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
