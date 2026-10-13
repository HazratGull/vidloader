import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function TutorialModal({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [activeStep, setActiveStep] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Autoplay video when modal opens, pause when closed
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false);
          });
        }
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  // Update time and active step
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Step 1: 0 - 3.1s | Step 2: 3.1 - 6.2s | Step 3: 6.2 - 10s
    if (current < 3.1) {
      setActiveStep(1);
    } else if (current < 6.2) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setActiveStep(1);
  };

  const jumpToStep = useCallback((stepNumber) => {
    if (!videoRef.current) return;
    let targetSec = 0;
    if (stepNumber === 1) targetSec = 0;
    if (stepNumber === 2) targetSec = 3.2;
    if (stepNumber === 3) targetSec = 6.4;

    videoRef.current.currentTime = targetSec;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    setActiveStep(stepNumber);
  }, []);

  const handleProgressBarClick = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = newRatio * duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="tutorial-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="tutorial-modal-card tutorial-video-theater-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="tutorial-modal-header tutorial-theater-header">
          <div className="tutorial-header-left">
            <h2 className="tutorial-modal-title">How to Download</h2>
          </div>
          <button className="tutorial-close-btn" onClick={onClose} aria-label="Close tutorial">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Video Only */}
        <div className="tutorial-modal-body tutorial-video-only-body">
          <div
            className="tutorial-video-frame"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            {/* The Video Element */}
            <video
              ref={videoRef}
              src="/how-to-download-video.mp4"
              poster="/how-to-download-poster.jpg"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="tutorial-guide-video"
            />

            {/* Video Floating Top Bar: Step Navigation Pills */}
            <div className={`tutorial-video-step-nav ${showControls ? 'visible' : ''}`}>
              <button
                type="button"
                className={`step-nav-pill ${activeStep === 1 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); jumpToStep(1); }}
                title="Jump to Step 1: Copy URL"
              >
                <span className="step-num">1</span>
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                className={`step-nav-pill ${activeStep === 2 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); jumpToStep(2); }}
                title="Jump to Step 2: Paste in VidLoader"
              >
                <span className="step-num">2</span>
                <span>Paste in Bar</span>
              </button>
              <button
                type="button"
                className={`step-nav-pill ${activeStep === 3 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); jumpToStep(3); }}
                title="Jump to Step 3: Starts Downloading"
              >
                <span className="step-num">3</span>
                <span>Starts Downloading</span>
              </button>
            </div>

            {/* Big Center Play Button when Paused */}
            {!isPlaying && (
              <button
                type="button"
                className="tutorial-center-play-btn"
                onClick={togglePlay}
                aria-label="Play tutorial video"
              >
                <Play size={38} fill="#ffffff" color="#ffffff" className="play-icon-offset" />
              </button>
            )}

            {/* Bottom Controls Bar Overlay */}
            <div className={`tutorial-video-bottom-controls ${showControls || !isPlaying ? 'visible' : ''}`}>
              {/* Interactive Timeline Scrubber */}
              <div
                className="tutorial-timeline-bar"
                onClick={(e) => { e.stopPropagation(); handleProgressBarClick(e); }}
              >
                <div
                  className="tutorial-timeline-progress"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Step markers on timeline */}
                <div className="timeline-step-marker marker-1" title="Step 1: Copy URL" />
                <div className="timeline-step-marker marker-2" title="Step 2: Paste in Bar" />
                <div className="timeline-step-marker marker-3" title="Step 3: Starts Downloading" />
              </div>

              {/* Action Buttons Row */}
              <div className="tutorial-controls-actions">
                <div className="controls-left">
                  <button
                    type="button"
                    className="video-ctrl-btn"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                  </button>

                  <button
                    type="button"
                    className="video-ctrl-btn"
                    onClick={(e) => { e.stopPropagation(); handleReplay(); }}
                    aria-label="Replay from start"
                    title="Replay from start"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <span className="video-time-tag">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>
                </div>

                <div className="controls-right">
                  <button
                    type="button"
                    className={`video-ctrl-btn sound-btn ${!isMuted ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    title={isMuted ? 'Click to unmute' : 'Muted'}
                  >
                    {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    <span className="ctrl-label">{isMuted ? 'Sound Off' : 'Sound On'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
