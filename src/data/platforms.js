/**
 * VidLoader Supported Platform Data
 * Contains genuinely useful, platform-specific guides, formats, and FAQ data.
 */

export const PLATFORMS_DATA = {
  'youtube-downloader': {
    slug: 'youtube-downloader',
    id: 'youtube',
    name: 'YouTube Downloader',
    platformName: 'YouTube',
    h1: 'YouTube Video Downloader',
    seoTitle: 'YouTube Video Downloader - Download High Quality MP4 & MP3 | VidLoader',
    metaDescription: 'Free online YouTube video downloader. Save YouTube clips, educational videos, and creative commons content in 1080p, 720p MP4 or MP3 audio format.',
    canonical: 'https://vidloader.online/youtube-downloader',
    heroTag: 'FAST YOUTUBE RESOLVER',
    introText: 'VidLoader helps you resolve, stream, and save supported YouTube video URLs. Whether you need an offline copy of a creative commons tutorial, an educational lecture, or an audio track for offline study, VidLoader processes available video streams in crisp MP4 and MP3 formats.',
    sampleUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    supportedQualities: [
      { quality: '1080p FHD', format: 'MP4', note: 'Full High Definition 1920x1080 stream' },
      { quality: '720p HD', format: 'MP4', note: 'Standard High Definition 1280x720 (fast processing)' },
      { quality: '480p / 360p', format: 'MP4', note: 'Optimized for mobile storage and low-bandwidth' },
      { quality: '320 kbps / 128 kbps', format: 'MP3 / M4A', note: 'Direct audio stream extraction' }
    ],
    features: [
      {
        title: 'Zero Software Installation',
        description: 'VidLoader runs entirely in your web browser on Windows, Mac, Linux, iOS, and Android without requiring extensions or desktop apps.'
      },
      {
        title: 'Audio & Video Separation',
        description: 'Choose between pure video streams (with merged audio) or direct high-fidelity MP3/M4A sound extraction.'
      },
      {
        title: 'High Resolution Streams',
        description: 'VidLoader preserves the original source framerate (30fps / 60fps) and dynamic range when supported by the publisher.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy the YouTube URL',
        description: 'Open YouTube in your browser or app, locate the video you have permission to download, and copy its share link from the browser bar or share menu.'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Paste the link into the VidLoader search box above and click the "Download" button to initiate stream resolution.'
      },
      {
        step: 3,
        title: 'Select Format and Quality',
        description: 'Review the extracted video title, duration, and available resolutions (1080p, 720p, 480p, or MP3 audio).'
      },
      {
        step: 4,
        title: 'Save to Your Device',
        description: 'Click "Download" next to your preferred format. The media will download directly to your default browser downloads folder.'
      }
    ],
    faqs: [
      {
        question: 'Can I download YouTube videos in 1080p or 4K with audio?',
        answer: 'Yes. On YouTube, resolutions above 720p frequently separate the video and audio tracks (DASH format). When you select 1080p on VidLoader, the backend muxer stitches the video stream and high-bitrate audio stream together into a single standard MP4 container.'
      },
      {
        question: 'Is it legal to download YouTube videos?',
        answer: 'You should only download videos that you own, have express permission from the copyright owner to download, or that are published under Creative Commons / public domain licenses that permit offline reproduction.'
      },
      {
        question: 'Why does a specific resolution not appear in the results?',
        answer: 'VidLoader only displays qualities that are actively delivered by the YouTube servers for that specific video. If an author only uploaded their video in 720p, higher resolutions like 1080p or 4K will not be shown.'
      },
      {
        question: 'Does VidLoader work for YouTube Shorts?',
        answer: 'Yes! YouTube Shorts use the standard YouTube video infrastructure. You can paste any shorts link (youtube.com/shorts/...) directly into VidLoader.'
      }
    ],
    relatedTools: [
      { title: 'YouTube to MP4', url: '/youtube-to-mp4', desc: 'Direct MP4 video conversion' },
      { title: 'YouTube to MP3', url: '/youtube-to-mp3', desc: 'High-speed audio extractor' },
      { title: 'YouTube Shorts Downloader', url: '/youtube-shorts-downloader', desc: 'Save vertical YouTube short clips' },
      { title: 'Video Thumbnail Downloader', url: '/video-thumbnail-downloader', desc: 'Extract full HD cover art' }
    ],
    relatedGuides: [
      { title: 'How to Download YouTube Videos', url: '/guides/how-to-download-youtube-videos' },
      { title: 'How to Download YouTube Shorts', url: '/guides/how-to-download-youtube-shorts' },
      { title: 'How to Convert Video to MP3', url: '/guides/how-to-convert-video-to-mp3' }
    ]
  },

  'tiktok-downloader': {
    slug: 'tiktok-downloader',
    id: 'tiktok',
    name: 'TikTok Downloader',
    platformName: 'TikTok',
    h1: 'TikTok Video Downloader Without Watermark',
    seoTitle: 'TikTok Video Downloader - Download TikToks Without Watermark | VidLoader',
    metaDescription: 'Free online TikTok video downloader. Save clean TikTok videos in HD MP4 without watermarks, or extract original TikTok background music in MP3.',
    canonical: 'https://vidloader.online/tiktok-downloader',
    heroTag: 'CLEAN TIKTOK SAVER',
    introText: 'Download your favorite TikTok clips, dance trends, culinary tutorials, and original creator content in crisp HD MP4 format. VidLoader resolves clean media streams without distracting platform overlays whenever supported.',
    sampleUrl: 'https://www.tiktok.com/@archidesign/video/7123456789',
    supportedQualities: [
      { quality: 'HD MP4 (No Watermark)', format: 'MP4', note: 'Highest available portrait stream without platform logo' },
      { quality: 'Standard MP4', format: 'MP4', note: 'Standard definition 720x1280 mobile format' },
      { quality: 'Original Sound MP3', format: 'MP3', note: 'Extracts the background audio or original soundtrack' }
    ],
    features: [
      {
        title: 'Clean Video Feeds',
        description: 'VidLoader locates the clean source render delivered to mobile devices, stripping obstructive moving watermark overlays.'
      },
      {
        title: 'Direct Audio Extraction',
        description: 'Love the trending background sound? Download pure MP3 audio directly to your music library.'
      },
      {
        title: 'Works Across All Browsers',
        description: 'Compatible with Safari on iPhone/iPad, Chrome on Android, and all modern desktop operating systems.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy the TikTok Link',
        description: 'In the TikTok app or website, tap the "Share" button on any public video and select "Copy Link".'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Input the URL into the search bar at the top of this page and press "Download".'
      },
      {
        step: 3,
        title: 'Choose Clean MP4 or MP3',
        description: 'Select between the watermark-free video format or the isolated audio track.'
      },
      {
        step: 4,
        title: 'Save to Device',
        description: 'Tap Download to store the file to your Photos or Files app.'
      }
    ],
    faqs: [
      {
        question: 'Do I need a TikTok account to download videos?',
        answer: 'No. You do not need to log in to TikTok or VidLoader. Any publicly accessible TikTok video link can be resolved.'
      },
      {
        question: 'Can I download private TikTok videos?',
        answer: 'No. VidLoader respects creator privacy and security boundaries. Private videos, geo-blocked posts, and friends-only accounts cannot be processed.'
      },
      {
        question: 'Where are TikTok videos saved on iPhone?',
        answer: 'On iOS devices, files downloaded via Safari are saved to the "Files" app (Downloads folder) or can be saved directly to the "Photos" library with one tap.'
      }
    ],
    relatedTools: [
      { title: 'TikTok Video Downloader', url: '/tiktok-video-downloader', desc: 'Fast TikTok short clips saver' },
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Convert video sounds to MP3' },
      { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Universal MP4 transcode tool' }
    ],
    relatedGuides: [
      { title: 'How to Download TikTok Videos', url: '/guides/how-to-download-tiktok-videos' },
      { title: 'How to Convert Video to MP3', url: '/guides/how-to-convert-video-to-mp3' }
    ]
  },

  'instagram-downloader': {
    slug: 'instagram-downloader',
    id: 'instagram',
    name: 'Instagram Downloader',
    platformName: 'Instagram',
    h1: 'Instagram Video & Reels Downloader',
    seoTitle: 'Instagram Video & Reels Downloader - Save IG Videos in HD | VidLoader',
    metaDescription: 'Free online Instagram video downloader. Download Instagram Reels, video posts, and IGTV clips in 1080p MP4 directly to your computer or mobile device.',
    canonical: 'https://vidloader.online/instagram-downloader',
    heroTag: 'INSTAGRAM REELS & FEED',
    introText: 'Easily save Instagram Reels, standard video posts, and carousel videos in their native full HD 1080p resolution. VidLoader connects to public media endpoints to extract the clearest MP4 video streams.',
    sampleUrl: 'https://www.instagram.com/reel/Cw9xyz123/',
    supportedQualities: [
      { quality: '1080p Full HD', format: 'MP4', note: 'Original high-bitrate vertical video (1080x1920)' },
      { quality: '720p HD', format: 'MP4', note: 'Lightweight video stream for fast sharing' },
      { quality: 'Reel Audio MP3', format: 'MP3', note: 'Direct audio stream from trending reel sounds' }
    ],
    features: [
      {
        title: 'Full 1080p Video Support',
        description: 'VidLoader extracts the uncompressed original feed stream without re-encoding degradation.'
      },
      {
        title: 'Reels and Video Posts',
        description: 'Supports both modern Instagram Reels URLs and legacy /p/ feed video URLs.'
      },
      {
        title: 'No Login Required',
        description: 'Never risk your Instagram account credentials. VidLoader requires zero login information.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Locate the Instagram Post',
        description: 'Open Instagram, tap the three dots (...) or the paper airplane share icon on the Reel or Video, and select "Copy Link".'
      },
      {
        step: 2,
        title: 'Insert Link into VidLoader',
        description: 'Paste the copied URL into the VidLoader input field and hit "Download".'
      },
      {
        step: 3,
        title: 'Select Video Quality',
        description: 'Choose 1080p MP4 or audio MP3 from the resolved options list.'
      },
      {
        step: 4,
        title: 'Save to Gallery',
        description: 'Click Download to instantly save the file to your device.'
      }
    ],
    faqs: [
      {
        question: 'Can VidLoader download videos from private Instagram profiles?',
        answer: 'No. To protect privacy and adhere to platform security standards, VidLoader can only process public videos.'
      },
      {
        question: 'Does the author know I downloaded their Reel?',
        answer: 'No. Instagram does not notify creators when media is viewed or saved through browser HTTP queries.'
      },
      {
        question: 'Can I download Instagram Stories?',
        answer: 'VidLoader focuses on permanent video posts and Reels. Stories expire after 24 hours and have restrictive access policies.'
      }
    ],
    relatedTools: [
      { title: 'Instagram Reels Downloader', url: '/instagram-reels-downloader', desc: 'Specialized Reels extractor' },
      { title: 'Video Thumbnail Downloader', url: '/video-thumbnail-downloader', desc: 'Download reel cover photos' },
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Extract audio from videos' }
    ],
    relatedGuides: [
      { title: 'How to Download Instagram Reels', url: '/guides/how-to-download-instagram-reels' },
      { title: 'How to Download Videos Online', url: '/guides/how-to-download-videos' }
    ]
  },

  'facebook-video-downloader': {
    slug: 'facebook-video-downloader',
    id: 'facebook',
    name: 'Facebook Video Downloader',
    platformName: 'Facebook',
    h1: 'Facebook Video Downloader Online',
    seoTitle: 'Facebook Video Downloader - Download FB Videos in HD & SD | VidLoader',
    metaDescription: 'Download Facebook videos online in HD and SD quality. Fast, free Facebook Watch and public video saver with MP4 format options.',
    canonical: 'https://vidloader.online/facebook-video-downloader',
    heroTag: 'FACEBOOK WATCH & CLIPS',
    introText: 'Download public Facebook Watch episodes, news clips, community videos, and reels in high definition 1080p MP4. Fast, secure, and compatible with all modern browsers.',
    sampleUrl: 'https://www.facebook.com/watch/?v=1015891234',
    supportedQualities: [
      { quality: 'HD 1080p / 720p', format: 'MP4', note: 'High Definition original upload stream' },
      { quality: 'SD 480p / 360p', format: 'MP4', note: 'Standard Definition stream with smaller file size' },
      { quality: 'Audio Only MP3', format: 'MP3', note: 'Isolated audio track' }
    ],
    features: [
      {
        title: 'HD & SD Stream Selection',
        description: 'Select between crisp high definition video or bandwidth-saving standard definition.'
      },
      {
        title: 'Facebook Reels & Watch',
        description: 'Supports both facebook.com/watch links and short format fb.watch clips.'
      },
      {
        title: 'Secure & Private',
        description: 'We do not log user sessions or track your browsing activity.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy Facebook Video Link',
        description: 'Click "Share" underneath any public video on Facebook and select "Copy Link".'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Enter the link in the input box above and click "Download".'
      },
      {
        step: 3,
        title: 'Select HD or SD Quality',
        description: 'Review the available options and select your preferred resolution.'
      },
      {
        step: 4,
        title: 'Download MP4',
        description: 'Save the video file directly to your computer or phone.'
      }
    ],
    faqs: [
      {
        question: 'Can I download private Facebook group videos?',
        answer: 'No. Content inside closed or secret Facebook groups requires personal user authentication and is not accessible to independent public resolvers.'
      },
      {
        question: 'Why does a Facebook video only offer SD quality?',
        answer: 'Facebook automatically compresses videos upon upload. If the original video was uploaded in low resolution or if Facebook has not finished processing the HD rendition, only SD is available.'
      }
    ],
    relatedTools: [
      { title: 'Facebook Reels Downloader', url: '/facebook-reels-downloader', desc: 'Download vertical Facebook reels' },
      { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Convert video formats to MP4' },
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Extract audio from videos' }
    ],
    relatedGuides: [
      { title: 'How to Download Videos Online', url: '/guides/how-to-download-videos' },
      { title: 'Video Formats Explained', url: '/blog/video-formats-explained' }
    ]
  },

  'reddit-video-downloader': {
    slug: 'reddit-video-downloader',
    id: 'reddit',
    name: 'Reddit Video Downloader',
    platformName: 'Reddit',
    h1: 'Reddit Video Downloader with Audio',
    seoTitle: 'Reddit Video Downloader - Download Reddit Videos with Sound | VidLoader',
    metaDescription: 'Free online Reddit video downloader. Save v.redd.it videos and Reddit clips with sound in MP4 format. No software required.',
    canonical: 'https://vidloader.online/reddit-video-downloader',
    heroTag: 'REDDIT VIDEOS WITH SOUND',
    introText: 'Reddit natively splits video and audio into distinct DASH streams on its v.redd.it servers, causing standard browser downloads to lack sound. VidLoader solves this by automatically resolving and multiplexing audio and video into a complete MP4 file.',
    sampleUrl: 'https://www.reddit.com/r/space/comments/example_video/',
    supportedQualities: [
      { quality: '720p HD (Merged Audio)', format: 'MP4', note: 'Video stream synchronized with native audio' },
      { quality: '480p / 360p MP4', format: 'MP4', note: 'Standard definition with audio' },
      { quality: 'Audio Only MP3', format: 'MP3', note: 'Direct audio track extraction' }
    ],
    features: [
      {
        title: 'Synchronized Sound',
        description: 'Automatically joins the independent video and audio feeds provided by Reddit.'
      },
      {
        title: 'Works with redd.it & Subreddit URLs',
        description: 'Paste direct post links (reddit.com/r/...) or short shares (redd.it/...).'
      },
      {
        title: 'Universal Compatibility',
        description: 'Outputs standard H.264 MP4 playable on any device or media player.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy Reddit Post Link',
        description: 'Navigate to the Reddit post containing the video and click Share -> Copy Link.'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Paste the URL into the input field above and click "Download".'
      },
      {
        step: 3,
        title: 'Select MP4 with Audio',
        description: 'Choose your desired resolution from the resolved media list.'
      },
      {
        step: 4,
        title: 'Save File',
        description: 'Download the finalized MP4 file with audio intact.'
      }
    ],
    faqs: [
      {
        question: 'Why do Reddit videos often download without sound elsewhere?',
        answer: 'Reddit uses a DASH streaming protocol where video and audio are delivered as two independent files. Without a tool like VidLoader to multiplex them, downloading the video directly results in a muted file.'
      },
      {
        question: 'Can I download videos from NSFW or quarantined subreddits?',
        answer: 'VidLoader can only process publicly accessible Reddit posts. Content behind age confirmation or private community walls cannot be fetched.'
      }
    ],
    relatedTools: [
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Extract audio from Reddit clips' },
      { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Convert and re-mux media' }
    ],
    relatedGuides: [
      { title: 'How to Download Videos Online', url: '/guides/how-to-download-videos' },
      { title: 'Video Formats Explained', url: '/blog/video-formats-explained' }
    ]
  },

  'twitter-video-downloader': {
    slug: 'twitter-video-downloader',
    id: 'twitter',
    name: 'Twitter Video Downloader',
    platformName: 'Twitter / X',
    h1: 'Twitter Video Downloader Online (X)',
    seoTitle: 'Twitter Video Downloader - Download X & Twitter Videos HD | VidLoader',
    metaDescription: 'Free online Twitter video downloader. Save Twitter / X videos and GIFs in HD MP4 with fast processing. Works on mobile and desktop without software.',
    canonical: 'https://vidloader.online/twitter-video-downloader',
    heroTag: 'TWITTER & X VIDEO SAVER',
    introText: 'Download video clips, viral tweets, and GIFs from Twitter (X) in high quality MP4 format. VidLoader resolves direct video URLs from public tweets without requiring login or third-party extensions.',
    sampleUrl: 'https://twitter.com/NASA/status/1647289123456789012',
    supportedQualities: [
      { quality: '1080p / 720p HD', format: 'MP4', note: 'Highest available bitrate stream from tweet' },
      { quality: '480p / 360p SD', format: 'MP4', note: 'Fast mobile-optimized video download' },
      { quality: 'Audio Only MP3', format: 'MP3', note: 'Extract sound directly from video tweet' }
    ],
    features: [
      {
        title: 'Twitter & X Support',
        description: 'Compatible with both x.com and twitter.com links including status posts and media tweets.'
      },
      {
        title: 'Zero Login Needed',
        description: 'No Twitter account or login credentials required to download public video clips.'
      },
      {
        title: 'GIF & Video Saving',
        description: 'Converts looping Twitter GIFs and high-resolution MP4 video tweets with full audio.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy the Tweet Link',
        description: 'On Twitter or X, tap the Share icon on the tweet and choose "Copy Link".'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Paste the link into the VidLoader search box above and press "Download".'
      },
      {
        step: 3,
        title: 'Select Resolution',
        description: 'Pick your preferred video quality (1080p, 720p, 480p, or MP3).'
      },
      {
        step: 4,
        title: 'Save to Device',
        description: 'Click download to save the MP4 video straight to your device.'
      }
    ],
    faqs: [
      {
        question: 'Can I download videos from private Twitter accounts?',
        answer: 'No. To protect privacy and adhere to platform security standards, VidLoader can only process publicly accessible tweets.'
      },
      {
        question: 'Does this work with x.com links as well as twitter.com?',
        answer: 'Yes! VidLoader seamlessly recognizes both x.com and twitter.com links.'
      },
      {
        question: 'Can I convert Twitter GIFs to MP4?',
        answer: 'Yes. Twitter internally stores GIFs as short MP4 video loops. VidLoader extracts the full MP4 file.'
      }
    ],
    relatedTools: [
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Extract audio from Twitter clips' },
      { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Universal MP4 transcode tool' },
      { title: 'Video Thumbnail Downloader', url: '/video-thumbnail-downloader', desc: 'Extract tweet video thumbnail' }
    ],
    relatedGuides: [
      { title: 'How to Download Videos Online', url: '/guides/how-to-download-videos' },
      { title: 'Video Formats Explained', url: '/blog/video-formats-explained' }
    ]
  },

  'dailymotion-video-downloader': {
    slug: 'dailymotion-video-downloader',
    id: 'dailymotion',
    name: 'Dailymotion Downloader',
    platformName: 'Dailymotion',
    h1: 'Dailymotion Video Downloader Online',
    seoTitle: 'Dailymotion Video Downloader - Download Dailymotion Videos in 1080p | VidLoader',
    metaDescription: 'Free online Dailymotion video downloader. Download Dailymotion videos in 1080p, 720p, 480p MP4 or MP3 audio format with high speed.',
    canonical: 'https://vidloader.online/dailymotion-video-downloader',
    heroTag: 'DAILYMOTION HD DOWNLOADER',
    introText: 'VidLoader allows you to stream and download public Dailymotion videos in Full HD 1080p, 720p, and MP3 audio. Clean, fast, and completely free without needing any desktop software.',
    sampleUrl: 'https://www.dailymotion.com/video/x8abcdef',
    supportedQualities: [
      { quality: '1080p Full HD', format: 'MP4', note: 'Crystal clear 1920x1080 high definition stream' },
      { quality: '720p HD', format: 'MP4', note: 'Standard high definition video' },
      { quality: '480p / 380p SD', format: 'MP4', note: 'Fast download for low bandwidth' },
      { quality: 'Audio Only MP3', format: 'MP3', note: 'Direct audio track extraction' }
    ],
    features: [
      {
        title: 'Full High Definition',
        description: 'Preserves the highest resolution delivered by Dailymotion up to 1080p 60fps.'
      },
      {
        title: 'Works with dai.ly links',
        description: 'Supports full dailymotion.com URLs as well as short dai.ly share links.'
      },
      {
        title: 'Audio & Video Formats',
        description: 'Choose between complete MP4 video with synced sound or isolated MP3 audio.'
      }
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Copy Dailymotion URL',
        description: 'Open Dailymotion, find the video you want to download, and copy its URL.'
      },
      {
        step: 2,
        title: 'Paste into VidLoader',
        description: 'Paste the link into the search box above and click "Download".'
      },
      {
        step: 3,
        title: 'Choose Quality',
        description: 'Select your preferred format and resolution from the available list.'
      },
      {
        step: 4,
        title: 'Save to Device',
        description: 'Click Download to save the MP4 video directly to your storage.'
      }
    ],
    faqs: [
      {
        question: 'Can I download age-restricted or password-protected Dailymotion videos?',
        answer: 'No. VidLoader only processes publicly available videos that do not require password authorization.'
      },
      {
        question: 'Does VidLoader support dai.ly short URLs?',
        answer: 'Yes, both dailymotion.com/video/... and short dai.ly/... URLs are fully supported.'
      }
    ],
    relatedTools: [
      { title: 'Video to MP3', url: '/video-to-mp3', desc: 'Extract audio from Dailymotion' },
      { title: 'MP4 Converter', url: '/mp4-converter', desc: 'Convert and re-mux media' }
    ],
    relatedGuides: [
      { title: 'How to Download Videos Online', url: '/guides/how-to-download-videos' },
      { title: 'Video Formats Explained', url: '/blog/video-formats-explained' }
    ]
  }
};
