const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const WEBROOT_DIR = process.env.WEBROOT_DIR || '/webroot';
const LOCK_FILE = path.join(__dirname, 'build.lock');

if (fs.existsSync(LOCK_FILE)) {
  fs.unlinkSync(LOCK_FILE);
}

function rsyncToWebroot() {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(WEBROOT_DIR, 'temp_build_' + Date.now());
    const liveDir = path.join(WEBROOT_DIR, 'live');

    const command = `
      mkdir -p ${tempDir} &&
      if [ -d "dist/client" ]; then cp -r dist/client/* ${tempDir}; else cp -r dist/* ${tempDir}; fi &&
      chmod -R 755 ${tempDir} &&
      rm -rf ${liveDir}_old || true &&
      mv ${liveDir} ${liveDir}_old || true &&
      mv ${tempDir} ${liveDir} &&
      rm -rf ${liveDir}_old || true
    `;

    exec(command, (error, stderr) => {
      if (error) {
        console.error('Swap failed:', error, stderr);
        return reject(error);
      }
      resolve();
    });
  });
}

function runBuild() {
  if (fs.existsSync(LOCK_FILE)) {
    console.log('Build already in progress. Request ignored (lock protected).');
    return;
  }

  fs.writeFileSync(LOCK_FILE, 'lock');
  console.log('Starting build process...');

  const buildProc = exec('npm run build');

  buildProc.stdout.on('data', (data) => process.stdout.write(data));
  buildProc.stderr.on('data', (data) => process.stderr.write(data));

  buildProc.on('close', async (code) => {
    if (code !== 0) {
      console.error(`Build failed with code ${code}`);
    } else {
      console.log('Build successful. Swapping version in Nginx (atomic swap)...');
      try {
        await rsyncToWebroot();
        console.log('Deployment to live completed successfully.');
      } catch (e) {
        console.error('Failed to deploy to webroot:', e);
      }
    }

    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/publish') {
    console.log('Webhook received from Payload CMS');
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Build queued' }));
    runBuild();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook orchestrator running on port ${PORT}`);
  runBuild();
});
