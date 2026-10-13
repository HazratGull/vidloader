import React, { useState, useMemo } from 'react';
import { Film, Music, Download, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { triggerActualDownload, resolveApiUrl } from '../services/api';
import { formatBytes } from '../utils/formatters';

function getAudioBitrate(item) {
  if (!item) return 128;
  if (item.bitrate) {
    const match = String(item.bitrate).match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  if (item.quality) {
    const match = String(item.quality).match(/\b(320|256|192|128|96|64)\b/);
    if (match) return parseInt(match[1], 10);
  }
  return 128;
}

function getResolutionHeight(item) {
  if (!item) return 720;
  // 1. Check ID e.g. "mp4-2160p", "mp4-1080p", "mp4-720p"
  if (item.id) {
    const idMatch = String(item.id).match(/(\d{3,4})p?/i);
    if (idMatch) return parseInt(idMatch[1], 10);
  }
  // 2. Check quality string e.g. "4K 2160p", "1080p FHD"
  if (item.quality) {
    const match = String(item.quality).match(/\b(2160|1440|1080|720|480|360|240|144)\b/);
    if (match) return parseInt(match[1], 10);
    if (String(item.quality).toLowerCase().includes('4k')) return 2160;
    if (String(item.quality).toLowerCase().includes('2k')) return 1440;
    if (String(item.quality).toLowerCase().includes('fhd') || String(item.quality).toLowerCase().includes('hd 1080')) return 1080;
    if (String(item.quality).toLowerCase().includes('hd')) return 720;
    if (String(item.quality).toLowerCase().includes('sd')) return 480;
  }
  // 3. Check resolution string e.g. "1920x1080" or "1080x1920"
  if (item.resolution) {
    const parts = String(item.resolution).split('x').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
    if (parts.length === 2) {
      return Math.min(parts[0], parts[1]);
    }
  }
  if (item.height && !isNaN(item.height)) return parseInt(item.height, 10);
  return 720;
}

// Consistent label generator: "MP4 · 1080p", "MP4 · 720p", "MP3 · 320kbps"
function getFormattedLabel(item, defaultType = 'MP4') {
  if (!item) return 'MP4 · 720p';
  const isAudio = item.type === 'audio' || item.container === 'MP3' || item.container === 'M4A';
  const container = (item.container || item.ext || (isAudio ? 'MP3' : defaultType)).toUpperCase();

  if (isAudio) {
    const bitrate = getAudioBitrate(item);
    return `${container} · ${bitrate}kbps`;
  }

  const height = getResolutionHeight(item);
  return `${container} · ${height}p`;
}



export default function FormatSelector({
  formats = [],
  onSelectFormat,
  activeJob,
  mediaTitle = 'video',
  onDownloadTriggered,
  thumbnailUrl = null,
  targetFormat = null,
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (targetFormat === 'IMAGE' || targetFormat === 'THUMBNAIL') return 'thumbnail';
    if (targetFormat === 'MP3' || targetFormat === 'AUDIO') return 'audio';
    return 'video';
  });
  const [downloadedFormatId, setDownloadedFormatId] = useState(null);
  const [showAllFormats, setShowAllFormats] = useState(false);

  // Deduplicate and strictly sort video formats descending (4K -> 2K -> 1080p -> 720p -> 480p -> 360p)
  const uniqueVideoFormats = useMemo(() => {
    const vList = formats.filter((f) => f.type === 'video');
    const sorted = [...vList].sort((a, b) => getResolutionHeight(b) - getResolutionHeight(a));
    const seenLabels = new Set();
    const result = [];
    for (const item of sorted) {
      const label = getFormattedLabel(item, 'MP4');
      if (!seenLabels.has(label)) {
        seenLabels.add(label);
        result.push(item);
      }
    }
    return result;
  }, [formats]);

  // Deduplicate and strictly sort audio formats descending by bitrate (320kbps -> 192kbps -> 128kbps)
  const uniqueAudioFormats = useMemo(() => {
    const aList = formats.filter((f) => f.type === 'audio' || f.container === 'MP3' || f.container === 'M4A');
    const sorted = [...aList].sort((a, b) => getAudioBitrate(b) - getAudioBitrate(a));
    const seenLabels = new Set();
    const result = [];
    for (const item of sorted) {
      const label = getFormattedLabel(item, 'MP3');
      if (!seenLabels.has(label)) {
        seenLabels.add(label);
        result.push(item);
      }
    }
    return result;
  }, [formats]);

  const displayedVideoFormats = showAllFormats ? uniqueVideoFormats : uniqueVideoFormats.slice(0, 4);

  const handleDownloadClick = (item) => {
    const targetId = item?.id || item?.formatId;
    // If already completed, trigger immediate single download
    if (activeJob && (activeJob.formatId === targetId || activeJob.formatId === item?.id) && activeJob.status === 'completed') {
      triggerActualDownload(mediaTitle, item, activeJob.downloadUrl);
      setDownloadedFormatId(targetId);
      setTimeout(() => setDownloadedFormatId(null), 4000);
      if (onDownloadTriggered) {
        onDownloadTriggered();
      }
      return;
    }
    // Otherwise initiate the process flow
    onSelectFormat(item);
  };

  return (
    <div className="format-selector-wrapper">
      {/* Category Tabs Header */}
      <div className="format-tabs-header" role="tablist" aria-label="Format categories">
        <button
          type="button"
          className={`format-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
          role="tab"
          aria-selected={activeTab === 'video'}
        >
          <Film size={15} />
          <span>Video</span>
        </button>

        <button
          type="button"
          className={`format-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
          role="tab"
          aria-selected={activeTab === 'audio'}
        >
          <Music size={15} />
          <span>Audio</span>
        </button>

        {thumbnailUrl && (
          <button
            type="button"
            className={`format-tab-btn ${activeTab === 'thumbnail' ? 'active' : ''}`}
            onClick={() => setActiveTab('thumbnail')}
            role="tab"
            aria-selected={activeTab === 'thumbnail'}
          >
            <ImageIcon size={15} />
            <span>Cover</span>
          </button>
        )}
      </div>


      {/* Clean Minimalist Active Progress Card (Zero Text Overflow, Accurate States) */}
      {activeJob && (
        <div className={`download-progress-card ${activeJob.status === 'completed' ? 'is-complete' : ''} ${activeJob.status === 'failed' ? 'is-failed' : ''}`}>
          <div className="progress-card-header">
            <div className="progress-header-left">
              {activeJob.status === 'completed' ? (
                <CheckCircle2 size={18} className="text-success progress-status-icon" />
              ) : activeJob.status === 'failed' ? (
                <AlertCircle size={18} className="text-danger progress-status-icon" />
              ) : (
                <Loader2 size={18} className="spinner text-primary progress-status-icon" />
              )}
              <span className="progress-title">
                {activeJob.status === 'completed'
                  ? 'Download Complete'
                  : activeJob.status === 'failed'
                  ? 'Download Notice'
                  : `Downloading ${activeJob.quality || ''} ${(activeJob.format || 'MP4').toUpperCase()}`.trim()}
              </span>
            </div>
            <span className={`progress-percentage-pill ${activeJob.status === 'failed' ? 'pill-failed' : ''}`}>
              {activeJob.status === 'completed' ? '100%' : activeJob.status === 'failed' ? 'Notice' : `${activeJob.progress ?? 0}%`}
            </span>
          </div>

          {activeJob.status !== 'failed' && (
            <div className="progress-track-wrapper">
              <div
                className="progress-track-bar"
                role="progressbar"
                aria-valuenow={activeJob.status === 'completed' ? 100 : (activeJob.progress ?? 0)}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: `${activeJob.status === 'completed' ? 100 : Math.min(100, Math.max(0, activeJob.progress ?? 0))}%` }}
              >
                <div className="progress-shimmer"></div>
              </div>
            </div>
          )}

          {activeJob.status !== 'failed' && activeJob.status !== 'completed' && (
            <div className="progress-card-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.8rem', color: '#64748b' }}>
              <span className="progress-meta-stage" style={{ fontWeight: 500 }}>
                {activeJob.stage || 'Processing stream...'}
              </span>
              <span className="progress-meta-stats" style={{ fontSize: '0.76rem', color: '#6366f1', fontWeight: 600 }}>
                {activeJob.downloadedBytes > 0 && activeJob.totalBytes > 0 && (
                  <span>{formatBytes(activeJob.downloadedBytes)} / {formatBytes(activeJob.totalBytes)} &bull; </span>
                )}
                {activeJob.speed && <span>{activeJob.speed}</span>}
                {activeJob.speed && activeJob.eta && <span> &bull; </span>}
                {activeJob.eta && <span>ETA {activeJob.eta}</span>}
              </span>
            </div>
          )}

          {activeJob.status === 'failed' && (
            <div className="progress-card-failed-notice" style={{ marginTop: '10px', fontSize: '0.84rem', color: '#dc2626' }}>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}>
                {activeJob.error || 'This video requires browser authentication or is restricted by the platform on cloud servers.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                <a
                  href={resolveApiUrl('/api/download-pc-launcher')}
                  download="VidLoader-PC-Launcher.bat"
                  className="savefrom-btn-green"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                  title="Run on PC with zero cloud restrictions"
                >
                  <Download size={13} />
                  <span>Download via Free PC App (Zero Blocks)</span>
                </a>
              </div>
            </div>
          )}

          {activeJob.status === 'completed' && activeJob.downloadUrl && (
            <div className="progress-card-footer">
              <span className="progress-saved-hint">Saved to your device</span>
              <button
                type="button"
                className="progress-save-again-btn"
                onClick={() => handleDownloadClick(activeJob)}
                aria-label="Save file again"
              >
                <Download size={13} />
                <span>Save again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Download Options Table: Consistent labels, aligned columns, fixed-width buttons */}
      <div className="format-options-table-container">
        {/* VIDEO TAB CONTENT: ONLY VIDEO FORMATS (No duplicate audio rows) */}
        {activeTab === 'video' && (
          <div className="savefrom-format-table" role="region" aria-label="Available video formats">
            <div className="savefrom-table-header">
              <div className="col-header-format">Format</div>
              <div className="col-header-download">Download</div>
            </div>

            <div className="savefrom-table-body">
              {displayedVideoFormats.length === 0 ? (
                <div className="format-empty-state">No video formats available for this link.</div>
              ) : (
                displayedVideoFormats.map((item) => {
                  const isProcessingThis =
                    activeJob &&
                    activeJob.formatId === item.id &&
                    activeJob.status !== 'completed';
                  const isCompletedThis =
                    activeJob &&
                    activeJob.formatId === item.id &&
                    activeJob.status === 'completed';

                  const label = getFormattedLabel(item, 'MP4');

                  return (
                    <div key={item.id} className="savefrom-row">
                      <div className="savefrom-col-format">
                        <span className="savefrom-label-text">{label}</span>
                      </div>

                      <div className="savefrom-col-download">
                        <button
                          type="button"
                          className={`savefrom-btn-green ${isCompletedThis ? 'is-completed' : ''} ${isProcessingThis ? 'is-processing' : ''}`}
                          disabled={isProcessingThis}
                          onClick={() => handleDownloadClick(item)}
                          aria-label={`Download ${label}`}
                        >
                          {isProcessingThis ? (
                            <>
                              <Loader2 size={14} className="spinner" />
                              <span>{activeJob.progress ? `${activeJob.progress}%` : '...'}</span>
                            </>
                          ) : isCompletedThis ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Download</span>
                            </>
                          ) : (
                            <span>Download</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Show more / Show less toggle button if more than 4 video formats */}
            {uniqueVideoFormats.length > 4 && (
              <div className="savefrom-show-more-row">
                <button
                  type="button"
                  className="savefrom-show-more-btn"
                  onClick={() => setShowAllFormats((prev) => !prev)}
                >
                  {showAllFormats ? 'Show less' : 'Show more'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* AUDIO TAB CONTENT: ONLY AUDIO FORMATS */}
        {activeTab === 'audio' && (
          <div className="savefrom-format-table" role="region" aria-label="Available audio formats">
            <div className="savefrom-table-header">
              <div className="col-header-format">Format</div>
              <div className="col-header-download">Download</div>
            </div>

            <div className="savefrom-table-body">
              {uniqueAudioFormats.length === 0 ? (
                <div className="format-empty-state">No audio formats available for this link.</div>
              ) : (
                uniqueAudioFormats.map((item) => {
                  const isProcessingThis =
                    activeJob &&
                    activeJob.formatId === item.id &&
                    activeJob.status !== 'completed';
                  const isCompletedThis =
                    activeJob &&
                    activeJob.formatId === item.id &&
                    activeJob.status === 'completed';

                  const label = getFormattedLabel(item, 'MP3');

                  return (
                    <div key={item.id} className="savefrom-row">
                      <div className="savefrom-col-format">
                        <span className="savefrom-label-text">{label}</span>
                      </div>

                      <div className="savefrom-col-download">
                        <button
                          type="button"
                          className={`savefrom-btn-green ${isCompletedThis ? 'is-completed' : ''} ${isProcessingThis ? 'is-processing' : ''}`}
                          disabled={isProcessingThis}
                          onClick={() => handleDownloadClick(item)}
                          aria-label={`Download ${label}`}
                        >
                          {isProcessingThis ? (
                            <>
                              <Loader2 size={14} className="spinner" />
                              <span>{activeJob.progress ? `${activeJob.progress}%` : '...'}</span>
                            </>
                          ) : isCompletedThis ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Download</span>
                            </>
                          ) : (
                            <span>Download</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* THUMBNAIL TAB CONTENT */}
        {activeTab === 'thumbnail' && thumbnailUrl && (
          <div className="savefrom-format-table" role="region" aria-label="Available thumbnail formats">
            <div className="savefrom-table-header">
              <div className="col-header-format">Format</div>
              <div className="col-header-download">Download</div>
            </div>

            <div className="savefrom-table-body">
              <div className="savefrom-row">
                <div className="savefrom-col-format">
                  <span className="savefrom-label-text">Cover · HD</span>
                </div>
                <div className="savefrom-col-download">
                  <a
                    href={resolveApiUrl(`/api/thumbnail?url=${encodeURIComponent(thumbnailUrl)}&title=${encodeURIComponent(mediaTitle)}`)}
                    download={`VidLoader_Thumbnail_${mediaTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`}
                    className="savefrom-btn-green"
                    aria-label="Download Cover HD"
                    onClick={() => {
                      setDownloadedFormatId('thumb-max');
                      setTimeout(() => setDownloadedFormatId(null), 4000);
                      if (onDownloadTriggered) onDownloadTriggered();
                    }}
                  >
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="format-footer-notice">
        <p>
          100% Free Forever &bull; No sign-up required &bull; High-speed instant downloads.
        </p>
      </div>
    </div>
  );
}
