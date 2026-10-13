const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const userUploadedImg = 'C:/Users/HP/.gemini/antigravity-ide/brain/65596e80-6aac-4ca2-852c-4fe0c3ea6a35/.user_uploaded/media_1791137378793.jpg';

console.log('=== Step 1: Saving original user uploaded logo ===');
fs.copyFileSync(userUploadedImg, path.join(publicDir, 'vidloader-logo-original.png'));

console.log('=== Step 2: Generating 1024x1024 transparent master logo ===');
// We already generated scratch/logo_1024_perfect.png which was thoroughly inspected and verified
const masterPng = path.join(rootDir, 'scratch', 'logo_1024_perfect.png');
if (!fs.existsSync(masterPng)) {
  console.log('Regenerating scratch/logo_1024_perfect.png...');
  execSync(`node "${path.join(rootDir, 'scratch', 'test_perfect_edge.cjs')}"`, { stdio: 'inherit' });
}

// Copy to public/vidloader-logo.png and public/vidloader-logo-circle.png
const targetLogo = path.join(publicDir, 'vidloader-logo.png');
const targetCircle = path.join(publicDir, 'vidloader-logo-circle.png');
fs.copyFileSync(masterPng, targetLogo);
fs.copyFileSync(masterPng, targetCircle);
console.log('-> Updated', targetLogo);
console.log('-> Updated', targetCircle);

console.log('=== Step 3: Generating SVG Favicon with high-res crystal logo ===');
const base64Png = fs.readFileSync(masterPng).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#74c000" flood-opacity="0.35" />
    </filter>
  </defs>
  <g filter="url(#emerald-glow)">
    <image href="data:image/png;base64,${base64Png}" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('-> Created public/favicon.svg');

console.log('=== Step 4: Running scripts/generate-icons.js ===');
execSync(`node "${path.join(rootDir, 'scripts', 'generate-icons.js')}"`, { stdio: 'inherit' });

console.log('=== Step 5: Syncing assets to dist directory ===');
if (fs.existsSync(distDir)) {
  const assetsToSync = [
    'vidloader-logo.png',
    'vidloader-logo-circle.png',
    'vidloader-logo-original.png',
    'favicon.ico',
    'favicon.png',
    'favicon-32.png',
    'favicon.svg',
    'vidloader-icon-192.png',
    'vidloader-icon-512.png',
    'vidloader-icon-maskable-192.png',
    'vidloader-icon-maskable-512.png',
    'apple-touch-icon.png',
  ];
  for (const file of assetsToSync) {
    const src = path.join(publicDir, file);
    const dst = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`-> Copied ${file} to dist/`);
    }
  }
}

console.log('=== Step 6: Updating Desktop Shortcut ===');
try {
  execSync(`node "${path.join(rootDir, 'create-shortcut.cjs')}"`, { stdio: 'inherit' });
} catch (e) {
  console.warn('Desktop shortcut creation note:', e.message);
}

console.log('\n=== All logo assets deployed successfully! ===');
