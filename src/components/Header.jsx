import React, { useState, useRef, useEffect } from 'react';
import { Link, useRouter } from '../utils/router';
import {
  ChevronDown,
  Menu,
  X,
  Globe,
  Film,
  Music,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  ChevronRight,
  Check,
} from 'lucide-react';
import WebAppModal from './WebAppModal';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { path } = useRouter();
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [webAppModalOpen, setWebAppModalOpen] = useState(false);

  const toolsRef = useRef(null);
  const langRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setLangDropdownOpen(false);
  }, [path]);

  const activeLangObj = languages.find(l => l.code.toLowerCase() === currentLanguage.toLowerCase()) || languages[0];

  const toolsList = [
    { name: 'YouTube to MP4', url: '/youtube-to-mp4', icon: Film, desc: 'Convert video to MP4 format' },
    { name: 'YouTube to MP3', url: '/youtube-to-mp3', icon: Music, desc: 'Extract pure audio track' },
    { name: 'Video to MP3', url: '/video-to-mp3', icon: Music, desc: 'Universal audio extraction' },
    { name: 'MP4 Converter', url: '/mp4-converter', icon: Layers, desc: 'Standardize any web stream' },
    { name: 'Video Converter', url: '/video-converter', icon: Film, desc: 'Format and quality scaling' },
    { name: 'Thumbnail Downloader', url: '/video-thumbnail-downloader', icon: ImageIcon, desc: 'Extract full HD cover art' },
  ];

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo - vidloader.online */}
        <Link to="/" className="brand-logo" aria-label="vidloader.online Homepage">
          <img
            src="/vidloader-logo.png"
            alt="vidloader.online Logo"
            className="brand-logo-icon-img"
            width="46"
            height="46"
          />
          <span className="brand-name">
            vidloader<span className="brand-tld">.online</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-link ${path === '/' ? 'active' : ''}`}
          >
            {t('nav.home', 'Video Downloader')}
          </Link>
          <Link
            to="/youtube-downloader"
            className={`nav-link ${path === '/youtube-downloader' ? 'active' : ''}`}
          >
            {t('nav.youtube', 'YouTube')}
          </Link>
          <Link
            to="/tiktok-downloader"
            className={`nav-link ${path === '/tiktok-downloader' ? 'active' : ''}`}
          >
            {t('nav.tiktok', 'TikTok')}
          </Link>
          <Link
            to="/instagram-downloader"
            className={`nav-link ${path === '/instagram-downloader' ? 'active' : ''}`}
          >
            {t('nav.instagram', 'Instagram')}
          </Link>
          <Link
            to="/facebook-video-downloader"
            className={`nav-link ${path === '/facebook-video-downloader' ? 'active' : ''}`}
          >
            {t('nav.facebook', 'Facebook')}
          </Link>

          {/* Tools Dropdown */}
          <div className="nav-dropdown" ref={toolsRef}>
            <button
              className={`nav-link dropdown-toggle ${
                path.includes('to-mp') || path.includes('converter') || path.includes('thumbnail')
                  ? 'active'
                  : ''
              }`}
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              aria-expanded={toolsDropdownOpen}
              aria-haspopup="true"
            >
              {t('nav.tools', 'Tools')}
              <ChevronDown className={`chevron-icon ${toolsDropdownOpen ? 'rotate' : ''}`} size={14} />
            </button>

            {toolsDropdownOpen && (
              <div className="dropdown-menu tools-grid-menu">
                <div className="dropdown-header-note">
                  <span>SPECIALIZED CONVERTERS</span>
                </div>
                <div className="tools-grid">
                  {toolsList.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Link
                        key={tool.url}
                        to={tool.url}
                        className="tool-dropdown-item"
                        onClick={() => setToolsDropdownOpen(false)}
                      >
                        <div className="tool-item-icon">
                          <IconComponent size={18} />
                        </div>
                        <div className="tool-item-text">
                          <div className="tool-item-title">{tool.name}</div>
                          <div className="tool-item-desc">{tool.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/guides"
            className={`nav-link ${path.startsWith('/guides') ? 'active' : ''}`}
          >
            {t('nav.guides', 'Guides')}
          </Link>
        </nav>

        {/* Right Section: Download App Pill Button & Language */}
        <div className="header-actions">
          <button
            className="webapp-download-pill-btn"
            onClick={() => setWebAppModalOpen(true)}
            title="Download VidLoader App"
            aria-label="Download VidLoader App"
          >
            <Download size={15} className="webapp-pill-icon" />
            <span className="webapp-pill-text">{t('nav.downloadApp', 'Download')}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="lang-dropdown-wrapper" ref={langRef}>
            <button
              className="lang-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
              title={`Current Language: ${activeLangObj.name}`}
            >
              <span className="lang-flag">{activeLangObj.flag}</span>
              <span className="lang-code-text">{activeLangObj.code.toUpperCase()}</span>
              <ChevronDown size={13} className={langDropdownOpen ? 'rotate' : ''} />
            </button>

            {langDropdownOpen && (
              <div className="dropdown-menu lang-menu" role="menu">
                <div className="lang-menu-header">
                  <span>SELECT WEBSITE LANGUAGE</span>
                </div>
                {languages.map((lang) => {
                  const isSelected = currentLanguage.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      className={`lang-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <div className="lang-name-text">
                        <span className="lang-name-primary">{lang.name}</span>
                        <span className="lang-name-native">{lang.native}</span>
                      </div>
                      {isSelected && <Check size={16} className="lang-check-icon" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <div className="mobile-nav-inner">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.home', 'Video Downloader')}
            </Link>
            <Link to="/youtube-downloader" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              YouTube Downloader
            </Link>
            <Link to="/tiktok-downloader" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              TikTok Downloader
            </Link>
            <Link to="/instagram-downloader" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Instagram Downloader
            </Link>
            <Link to="/facebook-video-downloader" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Facebook Video Downloader
            </Link>
            <Link to="/reddit-video-downloader" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Reddit Video Downloader
            </Link>

            <div className="mobile-section-divider">VIDEO TOOLS</div>
            {toolsList.map((tool) => (
              <Link
                key={tool.url}
                to={tool.url}
                className="mobile-subnav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{tool.name}</span>
                <ArrowRight size={14} />
              </Link>
            ))}

            <div className="mobile-section-divider">RESOURCES</div>
            <Link to="/guides" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.guides', 'Guides & Tutorials')}
            </Link>
            <Link to="/faq" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link to="/blog" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>

            {/* Mobile Drawer Language Switcher */}
            <div className="mobile-nav-lang-section">
              <div className="mobile-nav-lang-title">
                <Globe size={14} />
                <span>Choose Language</span>
              </div>
              <div className="mobile-lang-grid">
                {languages.map((lang) => {
                  const isSelected = currentLanguage.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      className={`mobile-lang-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <button
                className="mobile-webapp-action-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setWebAppModalOpen(true);
                }}
              >
                <div className="mobile-webapp-icon-badge">
                  <Download size={18} />
                </div>
                <div className="mobile-webapp-text">
                  <div className="mobile-webapp-title">Download Web App</div>
                  <div className="mobile-webapp-desc">Fast, Clean Web App on Your Device</div>
                </div>
                <ChevronRight size={16} className="mobile-webapp-arrow" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PC & Mobile Friendly Web App Modal */}
      <WebAppModal
        isOpen={webAppModalOpen}
        onClose={() => setWebAppModalOpen(false)}
      />
    </header>
  );
}
