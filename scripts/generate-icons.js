import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

const sourceLogo = path.join(publicDir, 'vidloader-logo.png');

if (!fs.existsSync(sourceLogo)) {
  console.error('Source logo not found at:', sourceLogo);
  process.exit(1);
}

console.log('Generating high-resolution desktop and mobile PWA icons from:', sourceLogo);

// 1. Generate Focused High-Definition Crop for Small Sizes (Favicon 48, 32, 16)
// This ensures that when the site or window is minimized, the crystal arrow is large, bold, and ultra-crisp.
const focusedCrop = path.join(rootDir, 'scratch', 'crystal_focused.png');
// Check if scratch exists
if (!fs.existsSync(path.join(rootDir, 'scratch'))) {
  fs.mkdirSync(path.join(rootDir, 'scratch'), { recursive: true });
}
execSync(`ffmpeg -y -i "${sourceLogo}" -vf "crop=658:850:183:154,scale=512:512:flags=lanczos" -frames:v 1 -update 1 "${focusedCrop}"`, { stdio: 'inherit' });

// 2. Generate multi-resolution ICO for Windows Desktop and Favicon
console.log('1. Building vidloader.ico (Windows Desktop .lnk & favicon)...');
const icoFilter = `"[0:v]scale=256:256:flags=lanczos[s256];[0:v]scale=128:128:flags=lanczos[s128];[0:v]scale=64:64:flags=lanczos[s64];[1:v]scale=48:48:flags=lanczos,unsharp=3:3:0.6:3:3:0.0[s48];[1:v]scale=32:32:flags=lanczos,unsharp=3:3:0.8:3:3:0.0[s32];[1:v]scale=16:16:flags=lanczos,unsharp=3:3:0.9:3:3:0.0[s16]" -map "[s256]" -map "[s128]" -map "[s64]" -map "[s48]" -map "[s32]" -map "[s16]"`;

const rootIco = path.join(rootDir, 'vidloader.ico');
const publicIco = path.join(publicDir, 'favicon.ico');

execSync(`ffmpeg -y -i "${sourceLogo}" -i "${focusedCrop}" -filter_complex ${icoFilter} "${rootIco}"`, { stdio: 'inherit' });
fs.copyFileSync(rootIco, publicIco);
console.log('-> Created vidloader.ico and public/favicon.ico');

// 3. Generate standard transparent PNGs
console.log('2. Generating standard transparent icons...');
// 512 and 192 from master sourceLogo
execSync(`ffmpeg -y -i "${sourceLogo}" -vf "scale=512:512:flags=lanczos" -frames:v 1 -update 1 "${path.join(publicDir, 'vidloader-icon-512.png')}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -i "${sourceLogo}" -vf "scale=192:192:flags=lanczos" -frames:v 1 -update 1 "${path.join(publicDir, 'vidloader-icon-192.png')}"`, { stdio: 'inherit' });

// 48 and 32 from focused crop with high-definition unsharp sharpening so tab favicon & minimized icon are crystal clear
execSync(`ffmpeg -y -i "${focusedCrop}" -vf "scale=48:48:flags=lanczos,unsharp=3:3:0.6:3:3:0.0" -frames:v 1 -update 1 "${path.join(publicDir, 'favicon.png')}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -i "${focusedCrop}" -vf "scale=32:32:flags=lanczos,unsharp=3:3:0.8:3:3:0.0" -frames:v 1 -update 1 "${path.join(publicDir, 'favicon-32.png')}"`, { stdio: 'inherit' });
console.log('-> Created public/vidloader-icon-512.png, vidloader-icon-192.png, favicon.png, favicon-32.png');

// 4. Generate Android Adaptive Maskable Icons (safe-zone centered on white canvas)
console.log('3. Generating Android Adaptive Maskable Icons (80% safe zone)...');
const maskableSizes = [
  { name: 'vidloader-icon-maskable-512.png', canvas: 512, inner: 420 },
  { name: 'vidloader-icon-maskable-192.png', canvas: 192, inner: 158 },
  { name: 'apple-touch-icon.png', canvas: 180, inner: 148 },
];

for (const item of maskableSizes) {
  const outPath = path.join(publicDir, item.name);
  const filter = `"color=c=white:s=${item.canvas}x${item.canvas}[bg];[0:v]scale=${item.inner}:${item.inner}:flags=lanczos[logo];[bg][logo]overlay=(W-w)/2:(H-h)/2"`;
  execSync(`ffmpeg -y -i "${sourceLogo}" -filter_complex ${filter} -frames:v 1 -update 1 "${outPath}"`, { stdio: 'inherit' });
  console.log(`-> Created public/${item.name} (${item.canvas}x${item.canvas} with ${item.inner}x${item.inner} inner logo)`);
}

// 5. Sync to dist directory if it exists
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
    }
  }
  console.log('-> Synced all updated icons to dist/');
}

console.log('\nAll desktop and Android shortcut icons successfully generated!');
