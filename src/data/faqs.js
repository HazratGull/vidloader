/**
 * VidLoader Comprehensive Frequently Asked Questions
 * Truthful, accurate, and transparent explanations.
 */

export const FAQS_DATA = [
  {
    category: 'General',
    question: 'What is VidLoader?',
    answer: 'VidLoader is an independent online web utility that helps users process supported video links, inspect available media streams, and download video (MP4) or audio (MP3/M4A) files directly to their personal devices for offline viewing and backup.'
  },
  {
    category: 'General',
    question: 'How does VidLoader work?',
    answer: 'When you submit a URL from a supported video hosting or social platform, VidLoader inspects the public media manifest (such as DASH or HLS playlists) provided by that platform. It extracts the direct stream endpoints, transparently multiplexes separated audio and video tracks when necessary, and presents a clean download link to your browser.'
  },
  {
    category: 'Compatibility',
    question: 'Which video platforms are supported?',
    answer: 'VidLoader supports public video URLs from YouTube (including Shorts), TikTok, Instagram (Reels and standard video posts), Facebook (Watch and Reels), and Reddit. Only publicly accessible media can be resolved; private profiles, subscription content, and paywalled streams are strictly not supported.'
  },
  {
    category: 'Formats & Quality',
    question: 'What video formats are available?',
    answer: 'We prioritize standard, high-compatibility MP4 containers (H.264 video codec with AAC audio) for video, and MP3 or M4A for audio extraction. These formats are universally playable on Windows, macOS, iOS, Android, and Smart TVs without extra software.'
  },
  {
    category: 'Formats & Quality',
    question: 'Can I download HD video?',
    answer: 'Yes. If the original content creator uploaded their video in 720p HD, 1080p Full HD, or higher, and the platform delivers that stream publicly, VidLoader will present the option to download in high definition.'
  },
  {
    category: 'Troubleshooting',
    question: 'Why is a particular quality unavailable?',
    answer: 'VidLoader can only provide resolutions and bitrates that the source platform actively makes available for that specific video. If an author originally recorded and uploaded a video in 480p SD, higher resolutions like 1080p do not exist on the platform servers and cannot be fabricated.'
  },
  {
    category: 'Troubleshooting',
    question: 'Why did my URL fail?',
    answer: 'URL resolution can fail for several reasons: (1) The video is marked private, friends-only, or requires a login; (2) The video has been removed, deleted, or geo-restricted by the author or platform; (3) The link syntax was incomplete or mistyped; or (4) The source platform updated its distribution manifest, requiring a backend adapter update.'
  },
  {
    category: 'Privacy & Security',
    question: 'Does VidLoader store downloaded files permanently?',
    answer: 'No. VidLoader does not store or archive downloaded files permanently. Any transient files processed on our servers during stream multiplexing are automatically purged upon download completion or within an hourly expiration cycle. We do not maintain user download logs or sell your data.'
  },
  {
    category: 'Cost & Access',
    question: 'Is VidLoader free?',
    answer: 'Yes. VidLoader is 100% free to use for standard video resolutions and everyday downloads. We do not require account registration, subscriptions, or credit card information.'
  },
  {
    category: 'Devices',
    question: 'Can I use VidLoader on mobile?',
    answer: 'Yes. VidLoader is built mobile-first. You can use it directly in Safari on iPhone/iPad or Chrome/Firefox on Android. Downloaded media saves straight to your device’s Files, Downloads, or Photos app.'
  },
  {
    category: 'Legal',
    question: 'Is it legal to use VidLoader?',
    answer: 'VidLoader is a neutral technical tool. You are solely responsible for ensuring that you have the legal right, permissions, or license (such as Creative Commons or Public Domain) to download and process any media.'
  }
];
