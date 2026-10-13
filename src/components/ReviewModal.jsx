import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { saveUserReview, dismissReviewPrompt } from '../utils/reviewStorage';

export default function ReviewModal({ isOpen, onClose, onReviewSubmitted }) {
  // Empty stars initially (nothing pre-selected)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const modalRef = useRef(null);
  const prevFocusedElementRef = useRef(null);
  const closeBtnRef = useRef(null);

  const handleDismiss = useCallback(() => {
    dismissReviewPrompt();
    setRating(0);
    setHoverRating(0);
    setComment('');
    setIsSubmitted(false);
    onClose(false);
  }, [onClose]);

  // Focus trap and Escape handling
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore upon close
    prevFocusedElementRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus into modal
    const focusTimer = setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
      if (prevFocusedElementRef.current && typeof prevFocusedElementRef.current.focus === 'function') {
        prevFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;

    saveUserReview({
      rating,
      tags: [],
      comment: comment.trim(),
      author: 'Verified User',
    });

    setIsSubmitted(true);

    if (onReviewSubmitted) {
      onReviewSubmitted({ rating, comment: comment.trim(), tags: [] });
    }

    // Short "Thanks!" confirmation state after submit, then auto-close
    setTimeout(() => {
      setIsSubmitted(false);
      setRating(0);
      setHoverRating(0);
      setComment('');
      onClose(true);
    }, 1200);
  };

  return (
    <div
      className="review-modal-backdrop"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        className="review-modal-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title and Close X */}
        <div className="review-modal-header">
          <h2 id="review-modal-title" className="review-modal-title">
            How was it?
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="review-close-btn"
            onClick={handleDismiss}
            aria-label="Close review dialog"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          /* Short "Thanks!" Confirmation State */
          <div className="review-success-state" role="status" aria-live="polite">
            <CheckCircle2 size={32} className="review-success-icon" />
            <h3 className="review-success-heading">Thanks!</h3>
          </div>
        ) : (
          /* Simplified Review Form */
          <form onSubmit={handleSubmit} className="review-form-body">
            {/* 5 empty, tappable stars (nothing pre-selected) */}
            <div
              className="review-stars-group"
              role="radiogroup"
              aria-label="Rating out of 5 stars"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isSelected = (hoverRating || rating) >= starNum;
                return (
                  <button
                    key={starNum}
                    type="button"
                    role="radio"
                    aria-checked={rating === starNum}
                    aria-label={`${starNum} of 5 stars`}
                    className={`review-star-btn ${isSelected ? 'is-selected' : ''}`}
                    onMouseEnter={() => setHoverRating(starNum)}
                    onClick={() => setRating(starNum)}
                  >
                    <Star
                      size={28}
                      className="star-icon"
                      fill={isSelected ? '#eab308' : 'none'}
                      color={isSelected ? '#ca8a04' : '#94a3b8'}
                      strokeWidth={1.75}
                    />
                  </button>
                );
              })}
            </div>

            {/* Optional Comment Box */}
            <div className="review-field-group">
              <textarea
                id="review-feedback-input"
                className="review-comment-textarea"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any feedback? (optional)"
                aria-label="Any feedback? (optional)"
                maxLength={400}
              />
            </div>

            {/* Action Buttons: Submit & Maybe later */}
            <div className="review-actions-row">
              <button
                type="button"
                className="review-btn-later"
                onClick={handleDismiss}
                aria-label="Maybe later"
              >
                Maybe later
              </button>
              <button
                type="submit"
                className="review-btn-submit"
                disabled={!rating}
                aria-label="Submit review"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
