import React, { useEffect } from 'react';

/**
 * SEO Component
 * Dynamically updates page title, canonical tag, Open Graph metadata,
 * Twitter tags, robots crawler hints, and structured JSON-LD schemas.
 */
export default function SEO({
  title = 'VidLoader - Free Online Video Downloader | Download HD Videos & MP3',
  description = 'Free online video downloader to save YouTube, TikTok (no watermark), Instagram Reels, Facebook, and Twitter videos in 1080p, 4K HD MP4 and 320kbps MP3. 100% free, fast, and no registration needed.',
  keywords = 'video downloader, free online video downloader, youtube video downloader, tiktok downloader no watermark, instagram video downloader, instagram reels downloader, facebook video downloader, mp4 downloader, youtube to mp3, 1080p video downloader, convert video to mp3, fast video downloader',
  canonical = 'https://vidloader.online/',
  type = 'website',
  image = 'https://vidloader.online/og-banner.png',
  structuredData = null,
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Search Engine Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'bingbot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'author', 'VidLoader');

    // 3. Open Graph Social Metadata
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'VidLoader');
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:image:secure_url', image);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', title);
    setMetaTag('property', 'og:locale', 'en_US');

    // 4. Twitter / X Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setMetaTag('name', 'twitter:site', '@VidLoader');
    setMetaTag('name', 'twitter:creator', '@VidLoader');

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // 6. Structured Data (JSON-LD)
    let scriptTag = document.getElementById('vidloader-schema-jsonld');
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'vidloader-schema-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, canonical, type, image, structuredData]);

  return null;
}

