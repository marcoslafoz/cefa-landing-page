const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const WEBROOT_DIR = process.env.WEBROOT_DIR || '/webroot';
const LOCK_FILE = path.join(__dirname, 'build.lock');

// Limpieza inicial del lock por si el contenedor se reinició a medias
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

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Swap error:', error, stderr);
        return reject(error);
      }
      resolve();
    });
  });
}

function runBuild() {
  if (fs.existsSync(LOCK_FILE)) {
    console.log('🔄 Build ya en progreso. Se ignora esta petición (protegido por lock).');
    return;
  }

  // Crear archivo lock
  fs.writeFileSync(LOCK_FILE, 'lock');
  console.log('🔄 Iniciando proceso de build...');

  // Ejecutamos el comando de build de Astro (que incluye sync-cms)
  const buildProc = exec('npm run build');

  buildProc.stdout.on('data', (data) => process.stdout.write(data));
  buildProc.stderr.on('data', (data) => process.stderr.write(data));

  buildProc.on('close', async (code) => {
    if (code !== 0) {
      console.error(`❌ Build falló con código ${code}`);
    } else {
      console.log('✅ Build exitoso. Intercambiando versión en Nginx (Atomic Swap)...');
      try {
        await rsyncToWebroot();
        console.log('🚀 Publicación en vivo completada exitosamente.');
      } catch (e) {
        console.error('❌ Fallo al desplegar a webroot:', e);
      }
    }

    // Liberar lock
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  });
}

// Servidor Simple HTTP Webhook
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/publish') {
    console.log('🔔 Webhook recibido desde Payload CMS');
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Build recibido' }));
    // Disparar build de manera asíncrona
    runBuild();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏗️  Orquestador Webhook corriendo en puerto ${PORT}`);
  // Build inicial al arrancar el contenedor
  runBuild();
});
