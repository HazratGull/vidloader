/**
 * VidLoader URL Validation & Platform Detector
 * Provides client-side validation, SSRF safety checks, and platform identification.
 */

export const SUPPORTED_PLATFORMS = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  REDDIT: 'reddit',
  TWITTER: 'twitter',
  DAILYMOTION: 'dailymotion',
  PINTEREST: 'pinterest',
  VIMEO: 'vimeo',
  THREADS: 'threads',
  TWITCH: 'twitch',
  LINKEDIN: 'linkedin',
  TUMBLR: 'tumblr',
  SNAPCHAT: 'snapchat',
  SOUNDCLOUD: 'soundcloud',
  BLUESKY: 'bluesky',
  STREAMABLE: 'streamable',
  BILIBILI: 'bilibili',
  KWAI: 'kwai',
  LIKEE: 'likee',
};

export const PLATFORM_INFO = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    domain: 'youtube.com',
    color: '#FF0000',
    icon: 'youtube',
    badge: 'YouTube / Shorts',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    domain: 'tiktok.com',
    color: '#000000',
    icon: 'tiktok',
    badge: 'TikTok Video',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    domain: 'instagram.com',
    color: '#E4405F',
    icon: 'instagram',
    badge: 'Instagram Reels / Post',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    domain: 'facebook.com',
    color: '#1877F2',
    icon: 'facebook',
    badge: 'Facebook Watch / Reels',
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    domain: 'reddit.com',
    color: '#FF4500',
    icon: 'reddit',
    badge: 'Reddit Video',
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    domain: 'x.com',
    color: '#1DA1F2',
    icon: 'twitter',
    badge: 'Twitter / X Video',
  },
  dailymotion: {
    id: 'dailymotion',
    name: 'Dailymotion',
    domain: 'dailymotion.com',
    color: '#0066DC',
    icon: 'dailymotion',
    badge: 'Dailymotion Video',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    domain: 'pinterest.com',
    color: '#E60023',
    icon: 'pinterest',
    badge: 'Pinterest Video',
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    domain: 'vimeo.com',
    color: '#1AB7EA',
    icon: 'vimeo',
    badge: 'Vimeo Video',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    domain: 'threads.net',
    color: '#000000',
    icon: 'threads',
    badge: 'Threads Video',
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    domain: 'twitch.tv',
    color: '#9146FF',
    icon: 'twitch',
    badge: 'Twitch Clip',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    color: '#0A66C2',
    icon: 'linkedin',
    badge: 'LinkedIn Video',
  },
  tumblr: {
    id: 'tumblr',
    name: 'Tumblr',
    domain: 'tumblr.com',
    color: '#36465D',
    icon: 'tumblr',
    badge: 'Tumblr Video',
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    domain: 'snapchat.com',
    color: '#FFFC00',
    icon: 'snapchat',
    badge: 'Snapchat Spotlight',
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    domain: 'soundcloud.com',
    color: '#FF5500',
    icon: 'soundcloud',
    badge: 'SoundCloud Audio',
  },
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    domain: 'bsky.app',
    color: '#1185FE',
    icon: 'bluesky',
    badge: 'Bluesky Video',
  },
  streamable: {
    id: 'streamable',
    name: 'Streamable',
    domain: 'streamable.com',
    color: '#0F70E6',
    icon: 'streamable',
    badge: 'Streamable Video',
  },
  bilibili: {
    id: 'bilibili',
    name: 'Bilibili',
    domain: 'bilibili.com',
    color: '#00AEEC',
    icon: 'bilibili',
    badge: 'Bilibili Video',
  },
  kwai: {
    id: 'kwai',
    name: 'Kwai',
    domain: 'kwai.com',
    color: '#FF4800',
    icon: 'kwai',
    badge: 'Kwai Video',
  },
  likee: {
    id: 'likee',
    name: 'Likee',
    domain: 'likee.video',
    color: '#FF0055',
    icon: 'likee',
    badge: 'Likee Video',
  },
};

/**
 * Validates syntax and basic security of a URL string
 */
export function validateUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid supported video URL.',
    };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Please enter a valid supported video URL.',
    };
  }

  // Ensure scheme is http or https
  let parsedUrl;
  try {
    let urlWithScheme = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      urlWithScheme = 'https://' + trimmed;
    }
    parsedUrl = new URL(urlWithScheme);
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid supported video URL.',
    };
  }

  // Basic security check: disallow private or loopback hostnames
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  ) {
    return {
      isValid: false,
      error: 'Invalid address or security restricted host.',
    };
  }

  // Must have a valid domain structure with at least one dot (e.g., example.com)
  if (!hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) {
    return {
      isValid: false,
      error: 'Please enter a valid supported video URL.',
    };
  }

  const platform = detectPlatform(hostname, parsedUrl.pathname);

  if (!platform) {
    return {
      isValid: false,
      isUnsupportedPlatform: true,
      error: 'This platform is not currently supported.',
      hostname,
    };
  }

  return {
    isValid: true,
    normalizedUrl: parsedUrl.href,
    hostname,
    platform: platform.id,
    platformName: platform.name,
    platformInfo: platform,
  };
}

/**
 * Detects which platform a URL belongs to
 */
export function detectPlatform(hostname, pathname = '') {
  const host = hostname.toLowerCase();

  // YouTube / Shorts / youtu.be
  if (
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtu.be'
  ) {
    return PLATFORM_INFO.youtube;
  }

  // TikTok
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
    return PLATFORM_INFO.tiktok;
  }

  // Instagram
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
    return PLATFORM_INFO.instagram;
  }

  // Facebook
  if (
    host === 'facebook.com' ||
    host.endsWith('.facebook.com') ||
    host === 'fb.watch' ||
    host === 'fb.com'
  ) {
    return PLATFORM_INFO.facebook;
  }

  // Reddit
  if (
    host === 'reddit.com' ||
    host.endsWith('.reddit.com') ||
    host === 'redd.it' ||
    host === 'v.redd.it'
  ) {
    return PLATFORM_INFO.reddit;
  }

  // Twitter / X
  if (
    host === 'twitter.com' ||
    host.endsWith('.twitter.com') ||
    host === 'x.com' ||
    host.endsWith('.x.com') ||
    host === 't.co'
  ) {
    return PLATFORM_INFO.twitter;
  }

  // Dailymotion
  if (
    host === 'dailymotion.com' ||
    host.endsWith('.dailymotion.com') ||
    host === 'dai.ly'
  ) {
    return PLATFORM_INFO.dailymotion;
  }

  // Pinterest
  if (host === 'pinterest.com' || host.endsWith('.pinterest.com') || host === 'pin.it') {
    return PLATFORM_INFO.pinterest;
  }

  // Threads
  if (host === 'threads.net' || host.endsWith('.threads.net')) {
    return PLATFORM_INFO.threads;
  }

  // Vimeo
  if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
    return PLATFORM_INFO.vimeo;
  }

  // Twitch
  if (host === 'twitch.tv' || host.endsWith('.twitch.tv')) {
    return PLATFORM_INFO.twitch;
  }

  // LinkedIn
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) {
    return PLATFORM_INFO.linkedin;
  }

  // Tumblr
  if (host === 'tumblr.com' || host.endsWith('.tumblr.com')) {
    return PLATFORM_INFO.tumblr;
  }

  // Snapchat
  if (host === 'snapchat.com' || host.endsWith('.snapchat.com')) {
    return PLATFORM_INFO.snapchat;
  }

  // SoundCloud
  if (host === 'soundcloud.com' || host.endsWith('.soundcloud.com')) {
    return PLATFORM_INFO.soundcloud;
  }

  // Bluesky
  if (host === 'bsky.app' || host.endsWith('.bsky.app')) {
    return PLATFORM_INFO.bluesky;
  }

  // Streamable
  if (host === 'streamable.com' || host.endsWith('.streamable.com')) {
    return PLATFORM_INFO.streamable;
  }

  // Bilibili
  if (host === 'bilibili.com' || host.endsWith('.bilibili.com')) {
    return PLATFORM_INFO.bilibili;
  }

  // Kwai
  if (host === 'kwai.com' || host.endsWith('.kwai.com')) {
    return PLATFORM_INFO.kwai;
  }

  // Likee
  if (host === 'likee.video' || host.endsWith('.likee.video')) {
    return PLATFORM_INFO.likee;
  }

  return null;
}
