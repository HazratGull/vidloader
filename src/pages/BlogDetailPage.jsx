import React from 'react';
import { BLOGS_DATA } from '../data/blogs';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from '../utils/router';
import { Calendar, Clock, Newspaper, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

export default function BlogDetailPage({ slug }) {
  const article = BLOGS_DATA[slug];

  if (!article) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Blog', url: '/blog' },
    { label: article.title, url: `/blog/${article.slug}` },
  ];

  const articleStructuredData = {
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
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: article.canonical,
          },
        ],
      },
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.metaDescription,
        url: article.canonical,
        datePublished: article.publishDate,
        author: {
          '@type': 'Organization',
          name: 'VidLoader Engineering',
          url: 'https://vidloader.online',
        },
        publisher: {
          '@type': 'Organization',
          name: 'VidLoader',
          logo: {
            '@type': 'ImageObject',
            url: 'https://vidloader.online/vidloader-logo.png',
          },
        },
      },
    ],
  };

  // Convert markdown-like content into clean HTML paragraphs
  const renderContent = (raw) => {
    const lines = raw.trim().split('\n');
    const elements = [];
    let currentParagraph = [];
    let inCodeBlock = false;
    let codeContent = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="article-code-block">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      if (trimmed.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`}>{currentParagraph.join(' ')}</p>);
          currentParagraph = [];
        }
        elements.push(<h2 key={`h2-${index}`} className="article-subheading">{trimmed.replace('### ', '')}</h2>);
      } else if (trimmed.startsWith('#### ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`}>{currentParagraph.join(' ')}</p>);
          currentParagraph = [];
        }
        elements.push(<h3 key={`h3-${index}`} className="article-subheading-small">{trimmed.replace('#### ', '')}</h3>);
      } else if (trimmed.startsWith('- ')) {
        elements.push(
          <li key={`li-${index}`} className="article-list-item">
            {trimmed.replace('- ', '')}
          </li>
        );
      } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Table line
        elements.push(
          <div key={`table-row-${index}`} className="article-table-line">
            <code>{trimmed}</code>
          </div>
        );
      } else if (trimmed.length > 0) {
        currentParagraph.push(trimmed);
      } else if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${index}`}>{currentParagraph.join(' ')}</p>);
        currentParagraph = [];
      }
    });

    if (currentParagraph.length > 0) {
      elements.push(<p key="p-last">{currentParagraph.join(' ')}</p>);
    }

    return elements;
  };

  const otherArticles = Object.values(BLOGS_DATA).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="page-wrapper blog-detail-wrapper">
      <SEO
        title={article.seoTitle}
        description={article.metaDescription}
        keywords={`${article.title.toLowerCase()}, video tech blog, media formats, video compression, vidloader article`}
        canonical={article.canonical}
        type="article"
        structuredData={articleStructuredData}
      />

      <article className="article-container">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <header className="article-header">
            <div className="article-badge-row">
              <span className="blog-category-tag">{article.category}</span>
              <span className="article-meta-stat">
                <Calendar size={14} />
                {article.publishDate}
              </span>
              <span className="article-meta-stat">
                <Clock size={14} />
                {article.readTime}
              </span>
            </div>

            <h1 className="article-title">{article.title}</h1>
            <p className="article-lead">{article.excerpt}</p>
          </header>

          <div className="article-body">
            {renderContent(article.content)}
          </div>

          <div className="article-navigation-bar">
            <Link to="/blog" className="btn-back-to-blog">
              <ArrowLeft size={16} />
              <span>Back to All Articles</span>
            </Link>
          </div>
        </div>
      </article>

      {/* Recommended Reads */}
      <section className="more-articles-section">
        <div className="section-container">
          <h2 className="section-title">More Educational Articles</h2>
          <div className="blog-posts-grid">
            {otherArticles.map((post) => (
              <div key={post.slug} className="blog-card">
                <span className="blog-category-tag">{post.category}</span>
                <h3 className="blog-card-title">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="btn-read-post">
                  <span>Read Article</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
