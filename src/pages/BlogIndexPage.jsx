import React from 'react';
import { Link } from '../utils/router';
import { BLOGS_DATA } from '../data/blogs';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Newspaper, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogIndexPage() {
  const articles = Object.values(BLOGS_DATA);

  const blogsStructuredData = {
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
            name: 'Blog',
            item: 'https://vidloader.online/blog',
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'VidLoader Engineering Blog Articles',
        itemListElement: articles.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.title,
          url: `https://vidloader.online/blog/${b.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="page-wrapper blog-index-wrapper">
      <SEO
        title="VidLoader Engineering Blog - Video Technology & Formats"
        description="Educational insights, codecs, streaming architectures, compression guides, and technical explanations from the VidLoader engineering team."
        keywords="video tech blog, video codecs, streaming architecture, digital video compression, mp4 vs mp3, 1080p video quality"
        canonical="https://vidloader.online/blog"
        structuredData={blogsStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={[{ label: 'Blog', url: '/blog' }]} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Newspaper size={15} />
              <span>EDUCATIONAL ARTICLES</span>
            </div>
            <h1 className="page-title">VidLoader Engineering Blog</h1>
            <p className="page-subtitle">
              In-depth articles explaining codecs, container formats, adaptive bitrate streaming, and digital video compression.
            </p>
          </div>
        </div>
      </div>

      <section className="blog-list-section">
        <div className="section-container">
          <div className="blog-posts-grid">
            {articles.map((post) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card-meta">
                  <span className="blog-category-tag">{post.category}</span>
                  <div className="blog-meta-stats">
                    <span>
                      <Calendar size={13} /> {post.publishDate}
                    </span>
                    <span>
                      <Clock size={13} /> {post.readTime}
                    </span>
                  </div>
                </div>

                <h2 className="blog-card-title">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="blog-card-excerpt">{post.excerpt}</p>

                <div className="blog-card-footer">
                  <Link to={`/blog/${post.slug}`} className="btn-read-post">
                    <span>Read Article</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
