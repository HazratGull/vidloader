import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from '../utils/router';
import {
  Search,
  Clipboard,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  Clock,
  User,
  Sparkles,
  Star,
  Play,
} from 'lucide-react';
import { validateUrl } from '../utils/urlValidator';
import { formatDuration } from '../utils/formatters';
import { resolveMedia, startProcess, getJobStatus, triggerActualDownload, getApiBaseUrl } from '../services/api';
import FormatSelector from './FormatSelector';
import TutorialModal from './TutorialModal';
import ReviewModal from './ReviewModal';
import {
  recordDownloadAndCheckReview,
  getDownloadCount,
  getTotalReviewCount,
  getAverageRating,
} from '../utils/reviewStorage';
import { useLanguage } from '../context/LanguageContext';

export default function Downloader({
  defaultPlatform = null,
  placeholder = 'Paste video URL here...',
  headline = null,
  subheadline = null,
  targetFormat = null,
}) {
  const { t } = useLanguage();
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockedPlatformNotice, setBlockedPlatformNotice] = useState(null);
  const [mediaResult, setMediaResult] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentDownloadCount, setCurrentDownloadCount] = useState(() => getDownloadCount());
  const [reviewCount, setReviewCount] = useState(() => getTotalReviewCount());
  const [avgRating, setAvgRating] = useState(() => getAverageRating());
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const activePollRef = useRef(null);
  const isResolvingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__openReviewModal = () => setReviewModalOpen(true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__openReviewModal;
      }
      if (activePollRef.current) {
        clearInterval(activePollRef.current);
        activePollRef.current = null;
      }
      isResolvingRef.current = false;
    };
  }, []);

  const handleDownloadCompleted = useCallback(() => {
    const { count, shouldPromptReview } = recordDownloadAndCheckReview();
    setCurrentDownloadCount(count);
    if (shouldPromptReview) {
      setTimeout(() => {
        setReviewModalOpen(true);
      }, 1500);
    }
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    setReviewCount(getTotalReviewCount());
    setAvgRating(getAverageRating());
  }, []);

  // Auto-fill and auto-resolve from URL parameter (e.g. from Web Extension or Bookmarklet)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const incomingUrl = searchParams.get('url') || searchParams.get('link');
      if (incomingUrl && incomingUrl.trim()) {
        const decoded = decodeURIComponent(incomingUrl.trim());
        setUrlInput(decoded);
        const validation = validateUrl(decoded);
        if (validation.isValid) {
          setIsLoading(true);
          resolveMedia(validation.normalizedUrl, validation.platform || defaultPlatform)
            .then(result => {
              if (result && result.success) {
                setMediaResult(result);
              } else {
                setError(result?.message || "Couldn't load media for this URL.");
              }
            })
            .catch(err => {
              setError(err.message || 'Error processing URL from extension');
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    }
  }, [defaultPlatform]);

  // Main URL Processing & Resolution Function
  const processUrl = useCallback(async (targetUrl) => {
    if (!targetUrl || !targetUrl.trim()) return;
    if (isResolvingRef.current) return;
    const cleanUrl = targetUrl.trim();
    setError(null);
    setBlockedPlatformNotice(null);
    setActiveJob(null);

    const validation = validateUrl(cleanUrl);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    isResolvingRef.current = true;
    setIsLoading(true);
    try {
      const result = await resolveMedia(validation.normalizedUrl, validation.platform || defaultPlatform);
      if (!result || !result.success) {
        if (result && result.blockedByPlatform) {
          setBlockedPlatformNotice(result);
          setError(result.message);
          return;
        }
        throw new Error(result?.message || "We couldn't retrieve media information from this URL.");
      }
      setMediaResult(result);
    } catch (err) {
      setError(err.message || "We couldn't retrieve media information from this URL.");
      setMediaResult(null);
    } finally {
      isResolvingRef.current = false;
      setIsLoading(false);
    }
  }, [defaultPlatform]);

  // Auto-scroll to results card when formats are ready
  useEffect(() => {
    if (mediaResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [mediaResult]);

  // Handle Clipboard Paste Button -> Automatically start processing!
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const clean = text.trim();
          setUrlInput(clean);
          setError(null);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 1500);
          if (inputRef.current) inputRef.current.focus();
          processUrl(clean);
        }
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch {
      if (inputRef.current) inputRef.current.focus();
    }
  };

  // Handle Native Keyboard / Right-click Paste in Input Field -> Automatically start processing!
  const handleInputPaste = (e) => {
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    if (pastedText && pastedText.trim()) {
      const clean = pastedText.trim();
      setUrlInput(clean);
      setError(null);
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 1500);
      processUrl(clean);
    }
  };

  // Clear Input
  const handleClear = () => {
    if (activePollRef.current) {
      clearInterval(activePollRef.current);
      activePollRef.current = null;
    }
    setUrlInput('');
    setError(null);
    setMediaResult(null);
    setActiveJob(null);
    if (inputRef.current) inputRef.current.focus();
  };

  // Handle manual submission (Enter key or Download button click)
  const handleResolve = (e) => {
    if (e) e.preventDefault();
    if (!urlInput || !urlInput.trim()) {
      if (inputRef.current) inputRef.current.focus();
      setError('Please enter or paste a valid video URL.');
      return;
    }
    processUrl(urlInput);
  };

  // Handle format selection and process job
  const handleSelectFormat = async (formatItem) => {
    setError(null);
    if (activePollRef.current) {
      clearInterval(activePollRef.current);
      activePollRef.current = null;
    }

    try {
      setActiveJob({
        formatId: formatItem.id,
        quality: formatItem.quality,
        format: formatItem.container,
        status: 'queued',
        progress: 0,
        stage: 'Connecting to media source...',
        speed: null,
        eta: null,
        downloadedBytes: 0,
        totalBytes: null,
        downloadUrl: null,
      });

      const response = await startProcess(
        mediaResult.originalUrl,
        formatItem.container.toLowerCase(),
        formatItem.quality,
        mediaResult.title,
        formatItem.id
      );

      if (!response || !response.jobId) {
        throw new Error('Something went wrong while processing this video. Please try again.');
      }

      const jobId = response.jobId;

      // Poll actual status until completed, failed, or watchdog timeout (prevents infinite spinning)
      let pollCount = 0;
      const MAX_POLL_ATTEMPTS = 70; // ~49 seconds maximum wait
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount > MAX_POLL_ATTEMPTS) {
          if (activePollRef.current) {
            clearInterval(activePollRef.current);
            activePollRef.current = null;
          }
          const timeoutErr = 'Processing timed out while downloading the stream. The remote platform may be throttling requests. Please retry or choose another quality format.';
          setError(timeoutErr);
          setActiveJob({
            formatId: formatItem.id,
            quality: formatItem.quality,
            format: formatItem.container,
            status: 'failed',
            error: timeoutErr,
          });
          return;
        }

        try {
          const statusRes = await getJobStatus(jobId);
          if (statusRes.status === 'completed') {
            if (activePollRef.current) {
              clearInterval(activePollRef.current);
              activePollRef.current = null;
            }
            setActiveJob({
              formatId: formatItem.id,
              quality: formatItem.quality,
              format: formatItem.container,
              status: 'completed',
              progress: 100,
              stage: 'Download ready!',
              speed: null,
              eta: null,
              downloadedBytes: statusRes.fileInfo?.sizeBytes || null,
              totalBytes: statusRes.fileInfo?.sizeBytes || null,
              downloadUrl: statusRes.downloadUrl,
              fileInfo: statusRes.fileInfo,
            });

            // Automatically trigger the real file download directly into the user's device!
            triggerActualDownload(mediaResult.title, formatItem, statusRes.downloadUrl);
            handleDownloadCompleted();

            // Clear completion status after 10s so user has time to view or save again
            setTimeout(() => {
              setActiveJob((curr) => (curr?.status === 'completed' ? null : curr));
            }, 10000);
          } else if (statusRes.status === 'failed') {
            if (activePollRef.current) {
              clearInterval(activePollRef.current);
              activePollRef.current = null;
            }
            if (statusRes.blockedByPlatform) {
              setBlockedPlatformNotice({
                platform: mediaResult?.source || 'This platform',
                message: statusRes.error || 'This platform restricts cloud downloads on datacenter servers.'
              });
            }
            const cleanErr = statusRes.error || statusRes.message || 'Something went wrong while processing this video. Please try again.';
            setError(cleanErr);
            setActiveJob({
              formatId: formatItem.id,
              quality: formatItem.quality,
              format: formatItem.container,
              status: 'failed',
              error: cleanErr,
            });
          } else {
            setActiveJob((prev) => {
              const serverP = typeof statusRes.progress === 'number' ? statusRes.progress : (prev?.progress ?? 0);
              const nextP = Math.max(prev?.progress ?? 0, serverP);
              return {
                ...prev,
                status: statusRes.status,
                progress: nextP,
                stage: statusRes.stage || prev?.stage || 'Processing stream...',
                speed: statusRes.speed ?? prev?.speed,
                eta: statusRes.eta ?? prev?.eta,
                downloadedBytes: statusRes.downloadedBytes ?? prev?.downloadedBytes,
                totalBytes: statusRes.totalBytes ?? prev?.totalBytes,
                fileInfo: statusRes.fileInfo || prev?.fileInfo,
              };
            });
          }
        } catch {
          if (activePollRef.current) {
            clearInterval(activePollRef.current);
            activePollRef.current = null;
          }
          const cleanErr = 'Unable to check download status. Please verify server connection.';
          setError(cleanErr);
          setActiveJob({
            formatId: formatItem.id,
            quality: formatItem.quality,
            format: formatItem.container,
            status: 'failed',
            error: cleanErr,
          });
        }
      }, 700);

      activePollRef.current = pollInterval;
    } catch (err) {
      if (activePollRef.current) {
        clearInterval(activePollRef.current);
        activePollRef.current = null;
      }
      const cleanErr = err.message || 'Something went wrong while processing this video. Please try again.';
      setError(cleanErr);
      setActiveJob({
        formatId: formatItem.id,
        quality: formatItem.quality,
        format: formatItem.container,
        status: 'failed',
        error: cleanErr,
      });
    }
  };

  return (
    <div className="downloader-card-container">
      {/* Downloader Form Card */}
      <div className="downloader-card">
        {headline && (
          <div className="downloader-card-header">
            <h2 className="downloader-headline">{headline}</h2>
            {subheadline && <p className="downloader-subheadline">{subheadline}</p>}
          </div>
        )}

        <form onSubmit={handleResolve} className="downloader-form">
          {/* 1. Large URL Input Bar */}
          <div className={`downloader-input-wrapper ${error ? 'has-error' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className="downloader-input"
              value={urlInput}
              onChange={(e) => {
                const val = e.target.value;
                setUrlInput(val);
                if (error) setError(null);
                // Auto-detect pasted complete valid URL via autofill/mobile paste
                if (
                  val &&
                  (val.startsWith('http://') || val.startsWith('https://')) &&
                  val.length > 15 &&
                  !mediaResult &&
                  !isLoading
                ) {
                  const validation = validateUrl(val.trim());
                  if (validation.isValid) {
                    processUrl(val.trim());
                  }
                }
              }}
              onPaste={handleInputPaste}
              placeholder={placeholder === 'Paste video URL here...' ? 'Paste your video link here...' : placeholder}
              aria-label="Video URL Input"
              disabled={isLoading}
              spellCheck="false"
              autoComplete="off"
            />

            {/* Clear Button */}
            {urlInput && !isLoading && (
              <button
                type="button"
                className="input-tool-btn clear-btn"
                onClick={handleClear}
                title={t('input.clear', 'Clear input')}
                aria-label={t('input.clear', 'Clear input')}
              >
                <X size={16} />
              </button>
            )}

            {/* Paste Button */}
            <button
              type="button"
              className={`input-tool-btn paste-btn ${pasteSuccess ? 'success' : ''}`}
              onClick={handlePaste}
              title={t('input.paste', 'Paste from clipboard')}
              aria-label={t('input.paste', 'Paste from clipboard')}
            >
              {pasteSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span className="tool-text">{t('input.paste', 'Pasted!')}</span>
                </>
              ) : (
                <>
                  <Clipboard size={16} />
                  <span className="tool-text">{t('input.paste', 'Paste')}</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Full-Width Prominent Download Button */}
          <button
            type="submit"
            className="btn-download-primary"
            disabled={isLoading}
            aria-label="Submit URL and download"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="spinner" />
                <span>{t('input.resolving', 'Processing...')}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{t('input.fetch', 'Download')}</span>
              </>
            )}
          </button>
        </form>

        {/* Error Alert State */}
        {error && (
          <div className="downloader-error-banner" role="alert">
            <AlertCircle size={18} className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Platform Datacenter Restriction Desktop App Card */}
        {blockedPlatformNotice && (
          <div className="platform-datacenter-notice-card" role="region" aria-label="Desktop App Notice" style={{
            margin: '1rem 0',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.08))',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                100% Unblocked on Home IP
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                {blockedPlatformNotice.platform || 'This platform'} restricts cloud server downloads
              </strong>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Major social networks block cloud hosting IP addresses. You can download this exact video instantly with zero blocks using our free 1-Click Desktop App, which executes directly on your home connection.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <a
                href={`${getApiBaseUrl()}/download-pc-launcher`}
                download="VidLoader-PC-Launcher.bat"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none'
                }}
              >
                📥 Launch 1-Click PC App (.bat)
              </a>
              <a
                href={`${getApiBaseUrl()}/download-installer?platform=windows`}
                download="VidLoader-Setup.exe"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none'
                }}
              >
                🖥️ Windows Setup (.exe)
              </a>
            </div>
          </div>
        )}

        {/* 3. Terms of Service & Privacy Policy Acceptance */}
        <div className="downloader-legal-notice">
          <span>
            By using our service you accept our{' '}
            <Link to="/terms" className="legal-link">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="legal-link">Privacy Policy</Link>
          </span>
        </div>

        {/* 4. How To Download Watch the Tutorial */}
        <div className="how-to-download-trigger-wrap">
          <button
            type="button"
            className="how-to-download-trigger-btn"
            onClick={() => setTutorialModalOpen(true)}
            aria-label="How to download? Watch the tutorial"
          >
            <div className="tutorial-play-icon-circle">
              <Play size={11} fill="#ffffff" color="#ffffff" style={{ marginLeft: '1.5px' }} />
            </div>
            <span className="how-download-link">How To Download</span>
            <span className="how-download-sub">Watch the Tutorial</span>
          </button>
        </div>

        {/* Rating & Reviews Bar (Dynamic & Honest) */}
        <div className="downloader-reviews-rating-bar">
          <button
            type="button"
            className="reviews-rating-btn"
            onClick={() => setReviewModalOpen(true)}
            title="Rate your experience or view reviews"
          >
            <div className="rating-stars-row" aria-label={reviewCount > 0 ? `Rated ${avgRating} out of 5 stars` : 'Rate VidLoader'}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            {reviewCount > 0 ? (
              <>
                <span className="rating-score">{avgRating || '5.0'}</span>
                <span className="rating-out-of">/5</span>
                <span className="rating-divider">&bull;</span>
                <span className="rating-count-text">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
              </>
            ) : (
              <span className="rating-count-text">Rate VidLoader &bull; Feedback</span>
            )}
          </button>
        </div>

        {/* Results State UI - Side by Side (Video on Left, Formats Table on Right) */}
        {mediaResult && (
          <div ref={resultsRef} className="downloader-results-card" aria-live="polite">
            {/* Left Column: Media Preview (Thumbnail + Title + Duration) */}
            <div className="results-media-col">
              <div className="results-thumbnail-frame">
                <img
                  src={mediaResult.thumbnail}
                  alt={mediaResult.title}
                  className="results-media-thumbnail"
                  loading="lazy"
                />
                {formatDuration(mediaResult.duration) && (
                  <div className="thumbnail-duration-badge">
                    <Clock size={12} />
                    <span>{formatDuration(mediaResult.duration)}</span>
                  </div>
                )}
              </div>

              <div className="results-media-info">
                <h3 className="results-media-title" title={mediaResult.title}>
                  {mediaResult.title}
                </h3>
                <div className="results-media-sub">
                  {formatDuration(mediaResult.duration) && (
                    <span className="results-duration-text">{formatDuration(mediaResult.duration)}</span>
                  )}
                  {mediaResult.author && (
                    <span className="results-author-text">
                      {formatDuration(mediaResult.duration) ? ' • ' : ''}{mediaResult.author}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Download Options Beside Video */}
            <div className="results-formats-col">
              <FormatSelector
                formats={mediaResult.formats}
                onSelectFormat={handleSelectFormat}
                activeJob={activeJob}
                mediaTitle={mediaResult.title}
                onDownloadTriggered={handleDownloadCompleted}
                thumbnailUrl={mediaResult.thumbnail}
                targetFormat={targetFormat}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clickable Social Media & Video Tool Pills for Better SEO */}
      <div className="seo-platform-pills-container">
        <div className="seo-pills-row">
          <Link to="/youtube-downloader" className="seo-tool-pill" title="YouTube Video Downloader">
            <span className="pill-icon-yt">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
                <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF"/>
              </svg>
            </span>
            <span className="pill-title">YouTube</span>
          </Link>

          <Link to="/youtube-to-mp4" className="seo-tool-pill" title="YouTube to MP4 Converter">
            <span className="pill-badge-red pill-badge-mp4">mp4</span>
            <span className="pill-title">YouTube Mp4</span>
          </Link>

          <Link to="/youtube-shorts-downloader" className="seo-tool-pill" title="YouTube Shorts Downloader">
            <span className="pill-icon-shorts">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
                <path d="M17.77 10.32l-1.2-.5.95-.52c1.78-.97 2.44-3.19 1.48-4.96a3.72 3.72 0 00-4.97-1.48L7.26 6.86A3.72 3.72 0 005.78 11.83l1.2.5-.95.52c-1.78.97-2.44 3.19-1.48 4.96a3.72 3.72 0 004.97 1.48l6.77-4.01a3.72 3.72 0 001.48-4.96z" fill="#FF0000"/>
                <polygon points="10,8.5 15.5,12 10,15.5" fill="#FFFFFF"/>
              </svg>
            </span>
            <span className="pill-title">YouTube Shorts</span>
          </Link>

          <Link to="/youtube-to-mp3" className="seo-tool-pill" title="YouTube to MP3 Audio Downloader">
            <span className="pill-icon-mp3">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="11" fill="#FF0000"/>
                <circle cx="12" cy="12" r="8.5" fill="#FFFFFF"/>
                <polygon points="10,8 15.5,12 10,16" fill="#FF0000"/>
              </svg>
            </span>
            <span className="pill-title">YouTube Mp3</span>
          </Link>
        </div>

        <div className="seo-pills-row">
          <Link to="/tiktok-downloader" className="seo-tool-pill" title="TikTok Video Downloader">
            <span className="pill-icon-tiktok">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#000000">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.313-4.634c.314 0 .619.05 1.002.146V9.45a6.34 6.34 0 0 0-1.002-.079C6.022 9.371 3.2 12.193 3.2 15.658c0 3.466 2.822 6.288 6.287 6.288 3.465 0 6.287-2.822 6.287-6.288V8.697a8.21 8.21 0 0 0 4.815 1.543V6.797a4.85 4.85 0 0 1-1-.111z"/>
              </svg>
            </span>
            <span className="pill-title">TikTok</span>
          </Link>

          <Link to="/facebook-video-downloader" className="seo-tool-pill" title="Facebook Video Downloader">
            <span className="pill-icon-fb">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </span>
            <span className="pill-title">Facebook</span>
          </Link>

          <Link to="/dailymotion-video-downloader" className="seo-tool-pill" title="Dailymotion Video Downloader">
            <span className="pill-icon-dailymotion">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#0066DC">
                <path d="M19.273 13.921c-.085 2.502-1.444 4.417-3.69 4.417-2.037 0-3.606-1.697-3.606-4.341 0-2.636 1.569-4.34 3.606-4.34 2.198 0 3.597 1.833 3.69 4.264zm3.727-8.921h-3.636v4.06c-1.094-1.282-2.758-1.996-4.577-1.996C10.222 7.064 7 10.279 7 14.15c0 3.863 3.222 7.078 7.787 7.078 2.011 0 3.698-.781 4.75-2.172v1.944h3.463V5z"/>
              </svg>
            </span>
            <span className="pill-title">Dailymotion</span>
          </Link>

          <Link to="/twitter-video-downloader" className="seo-tool-pill" title="Twitter Video Downloader">
            <span className="pill-icon-twitter">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
              </svg>
            </span>
            <span className="pill-title">Twitter</span>
          </Link>

          <Link to="/reddit-video-downloader" className="seo-tool-pill" title="Reddit Video Downloader">
            <span className="pill-icon-reddit">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#FF4500">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </span>
            <span className="pill-title">Reddit</span>
          </Link>
        </div>
      </div>

      {/* Tutorial Walkthrough Modal */}
      <TutorialModal
        isOpen={tutorialModalOpen}
        onClose={() => setTutorialModalOpen(false)}
      />

      {/* User Review Prompt Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        downloadCount={currentDownloadCount || 1}
      />

    </div>
  );
}
