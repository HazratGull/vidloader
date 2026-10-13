const https = require('https');

async function test() {
  const postData = JSON.stringify({
    url: 'https://www.youtube.com/watch?v=2smi1gjBBIw',
    format: 'mp4',
    quality: '1080p FHD',
    formatId: 'mp4-1080p',
    title: 'test'
  });

  const options = {
    hostname: 'vidloader.online',
    port: 443,
    path: '/api/process',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      console.log('Process response:', data);
      const json = JSON.parse(data);
      const jobId = json.jobId;
      if (!jobId) return;

      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 2000));
        https.get(`https://vidloader.online/api/process/${jobId}`, (res2) => {
          let sData = '';
          res2.on('data', c => sData += c);
          res2.on('end', () => {
            try {
              const status = JSON.parse(sData);
              console.log(`[T+${(i+1)*2}s] status=${status.status} progress=${status.progress}% stage="${status.stage}" error="${status.error}" diag="${status.diagLogs || ''}"`);
            } catch (e) {
              console.log('Error parsing status:', sData);
            }
          });
        });
      }
    });
  });

  req.write(postData);
  req.end();
}

test();
