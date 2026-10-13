import React, { useState } from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Terminal, Code, Copy, CheckCircle2, Server, ArrowRight, ShieldCheck } from 'lucide-react';

export default function APIPage() {
  const [activeTab, setActiveTab] = useState('resolve');
  const [copied, setCopied] = useState(false);

  const breadcrumbs = [{ label: 'API Documentation', url: '/api' }];

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const codeSnippets = {
    resolve: `// POST /api/resolve
// Request
fetch("https://vidloader.online/api/resolve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://www.youtube.com/watch?v=EXAMPLE_ID"
  })
})
.then(res => res.json())
.then(data => {
  console.log("Source:", data.source);
  console.log("Title:", data.title);
  console.log("Available Formats:", data.formats);
});

// Response Schema
{
  "success": true,
  "source": "YouTube",
  "title": "Creative Commons Nature Documentary",
  "thumbnail": "https://vidloader.online/thumbs/example.jpg",
  "duration": 184,
  "formats": [
    {
      "id": "mp4-1080p",
      "type": "video",
      "container": "MP4",
      "quality": "1080p FHD",
      "resolution": "1920x1080",
      "sizeBytes": 52428800
    },
    {
      "id": "mp3-320",
      "type": "audio",
      "container": "MP3",
      "quality": "320 kbps",
      "sizeBytes": 7340032
    }
  ]
}`,
    process: `// POST /api/process
// Initiates stream remuxing / preparation
fetch("https://vidloader.online/api/process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://www.youtube.com/watch?v=EXAMPLE_ID",
    format: "mp4",
    quality: "1080p FHD"
  })
})
.then(res => res.json())
.then(job => {
  console.log("Job Registered:", job.jobId);
});

// Response Schema
{
  "success": true,
  "jobId": "job_1727180000_101",
  "message": "Processing job registered successfully."
}`,
    status: `// GET /api/process/:jobId
// Check Job Progress
fetch("https://vidloader.online/api/process/job_1727180000_101")
  .then(res => res.json())
  .then(status => {
    // States: 'queued' | 'processing' | 'completed' | 'failed'
    console.log("Current Status:", status.status);
    console.log("Progress %:", status.progress);
    if (status.status === "completed") {
      console.log("Download link:", status.downloadUrl);
    }
  });

// Completed Response Schema
{
  "status": "completed",
  "progress": 100,
  "jobId": "job_1727180000_101",
  "downloadUrl": "https://vidloader.online/api/download/job_1727180000_101",
  "fileInfo": {
    "filename": "vidloader_mp4_1080p.mp4",
    "sizeFormatted": "50 MB"
  }
}`
  };

  const apiStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://vidloader.online/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'API Documentation',
            item: 'https://vidloader.online/api',
          },
        ],
      },
      {
        '@type': 'TechArticle',
        headline: 'VidLoader REST API & Stream Architecture Documentation',
        description: 'REST API specifications for VidLoader endpoints for media resolution, format extraction, and processing jobs.',
        url: 'https://vidloader.online/api',
      },
    ],
  };

  return (
    <div className="page-wrapper api-page-wrapper">
      <SEO
        title="Developer Video Downloader API & Architecture - VidLoader"
        description="REST API specifications for VidLoader. Endpoints for media resolution, format extraction, and processing jobs."
        keywords="video downloader api, media resolution api, youtube downloader rest api, mp4 video extraction api"
        canonical="https://vidloader.online/api"
        structuredData={apiStructuredData}
      />

      <div className="standard-page-hero">
        <div className="section-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="hero-text-centered">
            <div className="section-tag">
              <Terminal size={15} />
              <span>DEVELOPER API</span>
            </div>
            <h1 className="page-title">VidLoader REST API &amp; Architecture</h1>
            <p className="page-subtitle">
              Integrate video stream discovery and format resolution into your applications.
            </p>
          </div>
        </div>
      </div>

      <div className="api-content-body">
        <div className="section-container">
          {/* Architecture Flow Diagram */}
          <div className="api-flow-card">
            <h2 className="api-flow-title">Pipeline Architecture</h2>
            <div className="pipeline-steps-flow">
              <div className="pipe-box">User Input</div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-box">URL Validation &amp; SSRF Shield</div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-box">Manifest Resolver</div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-box">Dynamic Format List</div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-box">Remuxer / Pipeline</div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-box">Auto-Purging Storage</div>
            </div>
          </div>

          {/* Interactive Endpoint Tabs */}
          <div className="api-code-showcase-card">
            <div className="code-tabs-header">
              <button
                className={`code-tab-btn ${activeTab === 'resolve' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolve')}
              >
                <span>POST /api/resolve</span>
              </button>
              <button
                className={`code-tab-btn ${activeTab === 'process' ? 'active' : ''}`}
                onClick={() => setActiveTab('process')}
              >
                <span>POST /api/process</span>
              </button>
              <button
                className={`code-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
                onClick={() => setActiveTab('status')}
              >
                <span>GET /api/process/:jobId</span>
              </button>

              <button
                className="copy-code-btn"
                onClick={() => copyToClipboard(codeSnippets[activeTab])}
                title="Copy code"
              >
                {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="code-block-body">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>

          {/* Integration Notes */}
          <div className="api-integration-card">
            <h2>Backend Integration Readiness</h2>
            <p>
              The VidLoader frontend is strictly decoupled from the backend media processor. If you are deploying VidLoader with your own private media processing server (e.g. Node.js with yt-dlp / FFmpeg workers):
            </p>
            <ul>
              <li>Configure the environment variable <code>VITE_API_BASE_URL</code> to point to your API server.</li>
              <li>Ensure your backend implements the three core endpoints: <code>/api/resolve</code>, <code>/api/process</code>, and <code>/api/process/:jobId</code>.</li>
              <li>Enable CORS headers allowing requests from your authorized frontend domain.</li>
              <li>Respect rate limits and run an automated cleanup daemon for ephemeral storage.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
