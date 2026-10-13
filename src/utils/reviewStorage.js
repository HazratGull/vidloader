/**
 * Review & Download Tracking Storage Utility
 * 
 * Rules:
 * - Prompts for review after the FIRST video download (count === 1).
 * - If dismissed/skipped without reviewing, prompts again after 3 more video downloads.
 * - Once reviewed, stops prompting permanently.
 */

const STORAGE_KEYS = {
  DOWNLOAD_COUNT: 'vidloader_download_count',
  HAS_REVIEWED: 'vidloader_has_reviewed',
  LAST_DISMISSED_COUNT: 'vidloader_review_last_dismissed_count',
  USER_REVIEWS: 'vidloader_user_reviews',
};

export function getDownloadCount() {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.DOWNLOAD_COUNT) || '0', 10);
  } catch {
    return 0;
  }
}

export function hasUserReviewed() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.HAS_REVIEWED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Increments download count and determines whether to prompt the user for a review.
 * Returns { count, shouldPromptReview }
 */
export function recordDownloadAndCheckReview() {
  if (typeof window === 'undefined') {
    return { count: 1, shouldPromptReview: false };
  }

  try {
    const current = getDownloadCount() + 1;
    localStorage.setItem(STORAGE_KEYS.DOWNLOAD_COUNT, current.toString());

    // If user already reviewed, never prompt again
    if (hasUserReviewed()) {
      return { count: current, shouldPromptReview: false };
    }

    const lastDismissed = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_DISMISSED_COUNT) || '0', 10);

    let shouldPromptReview = false;

    // Rule 1: Prompt after FIRST video download
    if (current === 1) {
      shouldPromptReview = true;
    }
    // Rule 2: If dismissed, prompt again after 3 more video downloads
    else if (lastDismissed > 0 && current - lastDismissed >= 3) {
      shouldPromptReview = true;
    }
    // Fallback if not dismissed yet but count is 4, 7, 10...
    else if (lastDismissed === 0 && current > 1 && (current - 1) % 3 === 0) {
      shouldPromptReview = true;
    }

    return { count: current, shouldPromptReview };
  } catch {
    return { count: 1, shouldPromptReview: false };
  }
}

/**
 * Called when the user skips, cancels, or dismisses the review modal without submitting.
 * Records the download count at dismissal so we prompt again after 3 more videos.
 */
export function dismissReviewPrompt() {
  if (typeof window === 'undefined') return;
  try {
    const current = getDownloadCount();
    localStorage.setItem(STORAGE_KEYS.LAST_DISMISSED_COUNT, current.toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Saves user review in localStorage and marks user as reviewed so they are never prompted again.
 */
export function saveUserReview(review) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HAS_REVIEWED, 'true');
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_REVIEWS) || '[]');
    existing.unshift({
      id: `rev-${Date.now()}`,
      rating: review.rating || 5,
      comment: review.comment || '',
      tags: review.tags || [],
      author: review.author || 'Anonymous User',
      date: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.USER_REVIEWS, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

export function getUserReviews() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_REVIEWS) || '[]');
  } catch {
    return [];
  }
}

export function getTotalReviewCount() {
  const userReviews = getUserReviews();
  return userReviews.length;
}

export function getAverageRating() {
  const userReviews = getUserReviews();
  if (userReviews.length === 0) return null;
  const sum = userReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  return (sum / userReviews.length).toFixed(1);
}

