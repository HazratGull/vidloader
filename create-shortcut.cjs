const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const userProfile = os.homedir();
const oneDriveDesktop = path.join(userProfile, 'OneDrive', 'Desktop');
const standardDesktop = path.join(userProfile, 'Desktop');

// Collect all existing desktop directories to ensure shortcut is updated everywhere
const targetDesktopDirs = [];
if (fs.existsSync(oneDriveDesktop)) targetDesktopDirs.push(oneDriveDesktop);
if (fs.existsSync(standardDesktop) && standardDesktop !== oneDriveDesktop) targetDesktopDirs.push(standardDesktop);
if (targetDesktopDirs.length === 0) targetDesktopDirs.push(standardDesktop);

const vbsPath = path.resolve(__dirname, 'VidLoader-Desktop.vbs');
const icoPath = path.resolve(__dirname, 'vidloader.ico');

// Ensure vidloader.ico exists
if (!fs.existsSync(icoPath)) {
  console.log('vidloader.ico not found, generating from logo...');
  try {
    const generateScript = path.resolve(__dirname, 'scripts', 'generate-icons.js');
    if (fs.existsSync(generateScript)) {
      execSync(`node "${generateScript}"`, { stdio: 'inherit' });
    }
  } catch (e) {
    console.error('Warning: Could not auto-generate ico:', e.message);
  }
}

for (const dir of targetDesktopDirs) {
  const shortcutPath = path.join(dir, 'VidLoader.lnk');
  
  const psLines = [
    '$WshShell = New-Object -ComObject WScript.Shell;',
    `$Shortcut = $WshShell.CreateShortcut('${shortcutPath.replace(/\\/g, '\\\\')}');`,
    `$Shortcut.TargetPath = '${vbsPath.replace(/\\/g, '\\\\')}';`,
    `$Shortcut.WorkingDirectory = '${__dirname.replace(/\\/g, '\\\\')}';`,
    `$Shortcut.Description = 'VidLoader - Online Video Downloader Desktop App';`,
    fs.existsSync(icoPath) ? `$Shortcut.IconLocation = '${icoPath.replace(/\\/g, '\\\\')},0';` : '',
    '$Shortcut.Save();'
  ].filter(Boolean).join(' ');

  try {
    execSync(`powershell -NoProfile -Command "${psLines}"`, { stdio: 'inherit' });
    console.log(`Shortcut successfully created with current VidLoader logo at: ${shortcutPath}`);
  } catch (err) {
    console.error(`Failed to create shortcut at ${shortcutPath}:`, err.message);
  }
}

// Refresh Windows desktop icon cache
try {
  execSync('ie4uinit.exe -show', { stdio: 'ignore' });
} catch (_) {}
