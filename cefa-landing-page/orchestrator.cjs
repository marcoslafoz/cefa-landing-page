'use strict';

/**
 * CEFA – Orchestrator
 *
 * Responsibilities:
 *   1. Webhook server      (POST /webhook/publish) – triggers Astro builds
 *   2. Build manager       – runs `npm run build`, swaps static output atomically
 *   3. SSR process manager – keeps `dist/server/entry.mjs` alive for /api/* routes
 *
 * Ports (internal Docker network only):
 *   4000  – webhook endpoint consumed by Payload CMS
 *   4321  – Astro SSR node server, proxied by nginx for /api/*
 */

const http   = require('http');
const { spawn } = require('child_process');
const fs     = require('fs');
const path   = require('path');

// ── Configuration ────────────────────────────────────────────────────────────

const WEBHOOK_PORT = 4000;
const SSR_PORT     = Number(process.env.SSR_PORT ?? 4321);
const WEBROOT_DIR  = process.env.WEBROOT_DIR ?? '/webroot';
const LOCK_FILE    = path.join(__dirname, 'build.lock');
const SSR_ENTRY    = path.join(__dirname, 'dist', 'server', 'entry.mjs');

// ── Logging ──────────────────────────────────────────────────────────────────

const ts  = () => new Date().toISOString();
const log = (tag, msg)     => console.log(`[${ts()}] [${tag}] ${msg}`);
const err = (tag, msg, e)  => console.error(`[${ts()}] [${tag}] ${msg}`, e ?? '');

// ── SSR process management ───────────────────────────────────────────────────

let ssrProcess       = null;
let ssrPendingStart  = false;  // a (re)start was requested while a process was dying
let ssrKillSent      = false;  // SIGTERM already sent to the current process

/**
 * Unconditionally spawns a new SSR process.
 * Must only be called when ssrProcess === null.
 *
 * All env vars present on the orchestrator are inherited automatically,
 * so CONTACT_TRANSPORT, SMTP_*, TURNSTILE_SECRET_KEY, etc. reach
 * import.meta.env inside the Astro runtime without any extra wiring.
 */
function spawnSsr() {
  ssrPendingStart = false;
  ssrKillSent     = false;

  log('ssr', `Starting Astro SSR server on port ${SSR_PORT}…`);

  const proc = spawn('node', [SSR_ENTRY], {
    stdio: 'inherit',
    env: { ...process.env, HOST: '0.0.0.0', PORT: String(SSR_PORT) },
  });

  ssrProcess = proc;

  proc.on('exit', (code, signal) => {
    if (ssrProcess !== proc) return; // already superseded — ignore
    ssrProcess  = null;
    ssrKillSent = false;

    if (signal === 'SIGTERM' || signal === 'SIGKILL') {
      // Intentional stop: spawn a replacement only if one was requested.
      if (ssrPendingStart) spawnSsr();
      return;
    }

    err('ssr', `Unexpected exit (code=${code ?? '—'}). Restarting in 3 s…`);
    setTimeout(startSsrServer, 3_000);
  });
}

/**
 * Request a (re)start of the SSR server.
 * Safe to call at any time and from any code path – fully idempotent:
 *   • No build yet         → logs and returns; spawnSsr is called after first build.
 *   • No process running   → spawns immediately.
 *   • Process running      → sends SIGTERM once; spawnSsr runs when it exits.
 *   • Multiple rapid calls → coalesced: only one replacement is spawned.
 */
function startSsrServer() {
  if (!fs.existsSync(SSR_ENTRY)) {
    log('ssr', 'dist/server/entry.mjs not found – SSR will start after first successful build.');
    return;
  }

  if (ssrProcess) {
    ssrPendingStart = true;
    if (!ssrKillSent) {
      ssrKillSent = true;
      log('ssr', 'Gracefully replacing running SSR instance…');
      ssrProcess.kill('SIGTERM');
    }
    return;
  }

  spawnSsr();
}

// ── Build management ─────────────────────────────────────────────────────────

// Remove any stale lock left by a previous crash before we start listening.
if (fs.existsSync(LOCK_FILE)) {
  fs.unlinkSync(LOCK_FILE);
  log('build', 'Removed stale lock file from previous run.');
}

/**
 * Atomically swap the newly built client assets into the nginx webroot.
 * Pattern: write to a tmp dir → rename to live (atomic on the same filesystem).
 * nginx always reads a complete, consistent tree.
 */
function atomicSwap() {
  return new Promise((resolve, reject) => {
    const tmpDir  = path.join(WEBROOT_DIR, `build_${Date.now()}`);
    const liveDir = path.join(WEBROOT_DIR, 'live');

    // Run all steps in a single shell invocation to minimise overhead.
    const steps = [
      `mkdir -p "${tmpDir}"`,
      `if [ -d "dist/client" ]; then cp -r dist/client/. "${tmpDir}"; else cp -r dist/. "${tmpDir}"; fi`,
      `chmod -R 755 "${tmpDir}"`,
      `rm -rf "${liveDir}_old" 2>/dev/null || true`,
      `mv "${liveDir}" "${liveDir}_old" 2>/dev/null || true`,
      `mv "${tmpDir}" "${liveDir}"`,
      `rm -rf "${liveDir}_old" 2>/dev/null || true`,
    ];

    const sh = spawn('sh', ['-c', steps.join(' && ')], { stdio: ['ignore', 'ignore', 'pipe'] });

    let stderr = '';
    sh.stderr.on('data', (d) => { stderr += d; });
    sh.on('close', (code) => {
      if (code !== 0) {
        err('swap', `Atomic swap failed (exit ${code}):`, stderr.trim());
        return reject(new Error(`swap exited ${code}`));
      }
      resolve();
    });
  });
}

// At most one build queued behind the running one.
let buildQueued = false;

function runBuild() {
  if (fs.existsSync(LOCK_FILE)) {
    log('build', 'Build already in progress – next request queued.');
    buildQueued = true;
    return;
  }

  buildQueued = false;
  fs.writeFileSync(LOCK_FILE, String(Date.now()));
  log('build', 'Build started…');

  // Use spawn (not exec) to avoid the 1 MB stdout/stderr buffer cap.
  const proc = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

  proc.on('close', async (code) => {
    try {
      if (code !== 0) {
        err('build', `Build failed (exit ${code}). Skipping deployment.`);
        return;
      }

      log('build', 'Build succeeded. Deploying static assets…');
      await atomicSwap();
      log('build', 'Static assets live. Reloading SSR server…');
      startSsrServer();
      log('build', 'Deployment complete.');
    } catch (e) {
      err('build', 'Post-build deployment error:', e);
    } finally {
      if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
      if (buildQueued) {
        log('build', 'Processing queued build request…');
        runBuild();
      }
    }
  });
}

// ── Webhook HTTP server ──────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/publish') {
    const origin =
      req.headers['x-forwarded-for'] ??
      req.socket.remoteAddress ??
      'unknown';
    log('webhook', `Build triggered from ${origin}.`);
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'queued' }));
    runBuild();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// ── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  log('process', `${signal} received – shutting down gracefully…`);

  server.close(() => log('webhook', 'HTTP server closed.'));

  if (ssrProcess) {
    ssrPendingStart = false; // don't restart after intentional shutdown
    ssrProcess.kill('SIGTERM');
    log('ssr', 'SIGTERM sent to SSR process.');
  }

  // Hard-exit after 10 s if any child process is stuck.
  const timer = setTimeout(() => {
    log('process', 'Graceful timeout exceeded – forcing exit.');
    process.exit(0);
  }, 10_000);
  timer.unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Boot ─────────────────────────────────────────────────────────────────────

server.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  log('webhook', `Listening on port ${WEBHOOK_PORT}.`);
  startSsrServer(); // boot from a previous build if present (fast recovery on restart)
  runBuild();       // always do a fresh build on container start
});
