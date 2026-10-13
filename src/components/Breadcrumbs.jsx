import React from 'react';
import { Link } from '../utils/router';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  const breadcrumbsList = [
    { label: 'Home', url: '/' },
    ...items,
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbsList.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.url ? `https://vidloader.online${item.url}` : undefined,
    })),
  };

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ol className="breadcrumbs-list">
        {breadcrumbsList.map((item, idx) => {
          const isLast = idx === breadcrumbsList.length - 1;

          return (
            <li key={idx} className="breadcrumb-item">
              {idx > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
              {isLast || !item.url ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.url} className="breadcrumb-link">
                  {idx === 0 && <Home size={14} className="breadcrumb-home-icon" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
