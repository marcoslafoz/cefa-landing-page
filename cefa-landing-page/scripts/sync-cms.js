import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CMS_BASE_URL = process.env.PAYLOAD_CMS_URL ?? 'http://localhost:3000';
const CMS_URL = `${CMS_BASE_URL}/api`;
const LOCALES = ['es', 'en', 'de', 'pl'];

const COLLECTIONS = [
  { endpoint: 'products?limit=100&depth=2', name: 'products' },
  { endpoint: 'projects?limit=100&depth=2', name: 'projects' },
  { endpoint: 'certificates?limit=100&depth=2', name: 'certificates' },
  { endpoint: 'media?limit=1000', name: 'media' },
];

const GLOBALS = [

  { endpoint: 'globals/header?depth=2', name: 'header' },
  { endpoint: 'globals/hero?depth=2', name: 'hero' },
  { endpoint: 'globals/mission?depth=2', name: 'mission' },
  { endpoint: 'globals/innovation?depth=2', name: 'innovation' },
  { endpoint: 'globals/contact?depth=2', name: 'contact' },
  { endpoint: 'globals/awards?depth=2', name: 'awards' },
  { endpoint: 'globals/certifications-content?depth=2', name: 'certifications-content' },
  { endpoint: 'globals/rd-content?depth=2', name: 'rd-content' },
  { endpoint: 'globals/history-content?depth=2', name: 'history-content' },
  { endpoint: 'globals/careers?depth=2', name: 'careers' },
  { endpoint: 'globals/faq?depth=2', name: 'faq' },
  { endpoint: 'globals/seo?depth=2', name: 'seo' },
];

const MEDIA_DIR = path.resolve(__dirname, '../public/cms-media');
const downloadedFiles = new Set();

async function downloadMedia(cmsUrl) {
  if (!cmsUrl || !cmsUrl.startsWith('/')) return cmsUrl;

  const fullUrl = `${CMS_BASE_URL}${cmsUrl}`;
  const filename = path.basename(cmsUrl);
  const localPath = path.join(MEDIA_DIR, filename);

  // Registrar que este archivo es válido en esta sesión de sincronización
  downloadedFiles.add(filename);

  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  // Si ya existe, nos lo saltamos pero ya lo tenemos marcado como válido en el Set
  if (fs.existsSync(localPath)) {
    return `/cms-media/${filename}`;
  }

  try {
    const res = await fetch(fullUrl);
    if (!res.ok) return cmsUrl;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
    return `/cms-media/${filename}`;
  } catch (err) {
    console.error(`Error bajando media ${cmsUrl}:`, err);
    return cmsUrl;
  }
}

async function processMedia(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = await processMedia(obj[i]);
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'url' && typeof obj[key] === 'string' && obj[key].startsWith('/')) {
        obj[key] = await downloadMedia(obj[key]);
      } else {
        obj[key] = await processMedia(obj[key]);
      }
    }
  }
  return obj;
}

async function fetchAndSave(url, filepath) {
  try {
    const timestampUrl = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
    const response = await fetch(timestampUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    let data = await response.json();

    // Procesar y bajar medios recursivamente
    data = await processMedia(data);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Synced: ${path.relative(__dirname, filepath)}`);
  } catch (error) {
    console.error(`❌ Failed to sync: ${url} -> ${error.message}`);
  }
}

async function syncCMS() {
  console.log(`🔄 Sincronizando datos y media desde Payload CMS (${CMS_BASE_URL})...`);

  const dataDir = path.resolve(__dirname, '../src/data/cms');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const locale of LOCALES) {
    const localeDir = path.join(dataDir, locale);
    if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true });

    console.log(`\n📥 Descargando idioma: [${locale.toUpperCase()}]`);

    for (const collection of COLLECTIONS) {
      const url = `${CMS_URL}/${collection.endpoint}&locale=${locale}`;
      await fetchAndSave(url, path.join(localeDir, `${collection.name}.json`));
    }

    for (const global of GLOBALS) {
      const separator = global.endpoint.includes('?') ? '&' : '?';
      const url = `${CMS_URL}/${global.endpoint}${separator}locale=${locale}`;
      await fetchAndSave(url, path.join(localeDir, `${global.name}.json`));
    }
  }

  /* 
  // LIMPIEZA: Eliminar archivos huerfanos (que ya no existen en el CMS)
  if (fs.existsSync(MEDIA_DIR)) {
    const existingFiles = fs.readdirSync(MEDIA_DIR);
    let deletedCount = 0;
    for (const file of existingFiles) {
      if (!downloadedFiles.has(file)) {
        fs.unlinkSync(path.join(MEDIA_DIR, file));
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`\n🧹 Limpieza: Se eliminaron ${deletedCount} archivos que ya no están en uso.`);
    }
  }
  */


  console.log(
    '\n✨ Sincronización completada con éxito. Astro puede usar ahora src/data/cms/ y public/cms-media/'
  );
}

syncCMS();
