import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[*] Starting Tutorial Video Compilation...');

const img1 = path.resolve('public/how-to-download-step1.jpg');
const img2 = path.resolve('public/how-to-download-step2.jpg');
const img3 = path.resolve('public/how-to-download-step3.jpg');
const posterImg = path.resolve('public/how-to-download-poster.jpg');
const outputMp4 = path.resolve('public/how-to-download-video.mp4');

// Copy Step 1 as the video poster
fs.copyFileSync(img1, posterImg);

// Generate gentle audio track with ffmpeg
const audioTrack = path.resolve('public/tutorial-audio.wav');
try {
  const synthAudioCmd = `ffmpeg -y -f lavfi -t 0.35 -i "sine=frequency=523:duration=0.35" -f lavfi -t 0.35 -i "sine=frequency=659:duration=0.35" -f lavfi -t 0.6 -i "sine=frequency=880:duration=0.6" -f lavfi -t 10.5 -i "anullsrc=channel_layout=mono:sample_rate=44100" -filter_complex "[0:a]adelay=600|600[a0];[1:a]adelay=3800|3800[a1];[2:a]adelay=7000|7000[a2];[3:a][a0][a1][a2]amix=inputs=4:dropout_transition=0:duration=first,volume=0.4[out]" -t 10.5 -map "[out]" "${audioTrack}"`;
  execSync(synthAudioCmd, { stdio: 'ignore' });
} catch (e) {
  console.log('Audio synth skipped:', e.message);
}

const hasAudio = fs.existsSync(audioTrack);

// Single line filter without accidental newlines
const videoFilter = "[0:v]scale=1400:-1,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=108:s=1280x720:fps=30[v0];[1:v]scale=1400:-1,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=108:s=1280x720:fps=30[v1];[2:v]scale=1400:-1,zoompan=z='min(zoom+0.0005,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=114:s=1280x720:fps=30[v2];[v0][v1]xfade=transition=fade:duration=0.5:offset=3.1[v01];[v01][v2]xfade=transition=fade:duration=0.5:offset=6.2[vout]";

let cmd = '';
if (hasAudio) {
  cmd = `ffmpeg -y -loop 1 -t 3.6 -i "${img1}" -loop 1 -t 3.6 -i "${img2}" -loop 1 -t 3.8 -i "${img3}" -i "${audioTrack}" -filter_complex "${videoFilter}" -map "[vout]" -map 3:a -c:v libx264 -pix_fmt yuv420p -profile:v main -c:a aac -b:a 128k -t 10.0 -movflags +faststart "${outputMp4}"`;
} else {
  cmd = `ffmpeg -y -loop 1 -t 3.6 -i "${img1}" -loop 1 -t 3.6 -i "${img2}" -loop 1 -t 3.8 -i "${img3}" -filter_complex "${videoFilter}" -map "[vout]" -c:v libx264 -pix_fmt yuv420p -profile:v main -t 10.0 -movflags +faststart "${outputMp4}"`;
}

console.log('[*] Compiling final video with smooth Ken Burns motion & transitions...');
execSync(cmd, { stdio: 'inherit' });

if (hasAudio && fs.existsSync(audioTrack)) {
  try { fs.unlinkSync(audioTrack); } catch {}
}

console.log('[OK] Video successfully compiled to public/how-to-download-video.mp4!');
