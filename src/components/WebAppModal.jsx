import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, AlertCircle, ArrowLeft } from 'lucide-react';
import { resolveApiUrl } from '../services/api';

const PLATFORMS = {
  windows: {
    id: 'windows',
    name: 'Windows (64-bit)',
    file: 'VidLoader-Setup.exe',
    buttonLabel: 'Download for Windows (.exe)',
    ext: '.exe installer',
  },
  mac: {
    id: 'mac',
    name: 'macOS (Universal)',
    file: 'VidLoader-macOS.dmg',
    buttonLabel: 'Download for macOS (.dmg)',
    ext: '.dmg package',
  },
  linux: {
    id: 'linux',
    name: 'Linux (64-bit)',
    file: 'VidLoader-Linux.AppImage',
    buttonLabel: 'Download for Linux (.AppImage)',
    ext: '.AppImage 64-bit',
  },
  android: {
    id: 'android',
    name: 'Android',
    file: 'VidLoader-v2.4.apk',
    buttonLabel: 'Download for Android (.apk)',
    ext: '.apk installer',
  },
  ios: {
    id: 'ios',
    name: 'iPhone / iPad',
    file: 'VidLoader-iOS.mobileconfig',
    buttonLabel: 'Download for iPhone / iPad',
    ext: 'Mobile Web Clip',
  },
};

function detectUserPlatform() {
  if (typeof window === 'undefined') return PLATFORMS.windows;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return PLATFORMS.ios;
  if (/Android/i.test(ua)) return PLATFORMS.android;
  if (/Macintosh|Mac OS X/i.test(ua)) return PLATFORMS.mac;
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return PLATFORMS.linux;
  return PLATFORMS.windows;
}

export default function WebAppModal({ isOpen, onClose }) {
  const [detectedPlatform, setDetectedPlatform] = useState(() => detectUserPlatform());
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const modalRef = useRef(null);
  const prevFocusedRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    setDetectedPlatform(detectUserPlatform());
    setShowOtherPlatforms(false);
    setDownloadError(null);
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    setShowOtherPlatforms(false);
    setDownloadError(null);
    onClose();
  }, [onClose]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    prevFocusedRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), a:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      if (prevFocusedRef.current && typeof prevFocusedRef.current.focus === 'function') {
        prevFocusedRef.current.focus();
      }
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  // Programmatic direct download trigger - downloads immediately on every click
  const triggerDownload = (platformKey) => {
    try {
      setDownloadError(null);
      const downloadUrl = resolveApiUrl(`/api/download-installer?platform=${platformKey}`);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setDownloadError('Download failed to start. Please click Retry.');
    }
  };

  return (
    <div
      className="download-modal-backdrop"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div
        className="download-modal-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close X */}
        <div className="download-modal-top-bar">
          <button
            ref={closeBtnRef}
            type="button"
            className="download-modal-close-btn"
            onClick={handleDismiss}
            aria-label="Close download modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Original VidLoader Logo Icon */}
        <div className="download-modal-logo-wrapper">
          <img
            src="/vidloader-logo.png"
            alt="VidLoader App Icon"
            className="download-modal-logo-img"
          />
        </div>

        {/* Modal Title */}
        <h2 id="download-modal-title" className="download-modal-title">
          Download VidLoader
        </h2>

        {downloadError && (
          <div className="download-modal-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{downloadError}</span>
            <button
              type="button"
              className="download-error-retry-btn"
              onClick={() => triggerDownload(detectedPlatform.id)}
            >
              Retry
            </button>
          </div>
        )}

        {!showOtherPlatforms ? (
          /* PRIMARY VIEW: One-Click Detected OS Download */
          <div className="download-primary-view">
            <div className="download-detected-pill">
              <span>Detected: {detectedPlatform.name}</span>
            </div>

            <button
              type="button"
              className="download-primary-action-btn"
              onClick={() => triggerDownload(detectedPlatform.id)}
              aria-label={detectedPlatform.buttonLabel}
            >
              <Download size={18} />
              <span>{detectedPlatform.buttonLabel}</span>
            </button>

            <button
              type="button"
              className="download-other-platforms-link"
              onClick={() => setShowOtherPlatforms(true)}
            >
              Other platforms (macOS, Linux, Android, iOS)
            </button>
          </div>
        ) : (
          /* SECONDARY VIEW: All Platforms Direct Downloads */
          <div className="download-other-platforms-view">
            <div className="download-other-platforms-list" role="list">
              {Object.values(PLATFORMS).map((p) => (
                <div key={p.id} className="download-platform-item" role="listitem">
                  <div className="platform-meta">
                    <span className="platform-name">{p.name}</span>
                    <span className="platform-ext">{p.ext}</span>
                  </div>
                  <button
                    type="button"
                    className="platform-download-btn"
                    onClick={() => triggerDownload(p.id)}
                    aria-label={`Download for ${p.name}`}
                  >
                    <Download size={15} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="download-back-link"
              onClick={() => setShowOtherPlatforms(false)}
            >
              <ArrowLeft size={14} />
              <span>Back to detected OS ({detectedPlatform.name})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
