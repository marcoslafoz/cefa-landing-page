import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(process.cwd(), 'src/data/cms');
const CMS_URL = process.env.PAYLOAD_CMS_URL || 'http://localhost:3000';

/**
 * Resuelve la URL completa de un medio (imagen/PDF) del CMS
 */
export function getMediaUrl(media: any): string {
  if (!media) return '';
  const url = typeof media === 'string' ? media : media.url || '';
  if (!url) return '';

  // Si ya es una ruta local (empieza por /) o una URL completa, la devolvemos tal cual
  if (url.startsWith('/') || url.startsWith('http')) {
    return url;
  }

  // Como fallback, si no empieza por /, lo tratamos como relativo al CMS
  return `${CMS_URL.replace(/\/$/, '')}/${url}`;
}
async function getCMSData(filename: string, locale: string) {
  try {
    const filePath = path.join(DATA_DIR, locale, `${filename}.json`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }

    console.warn(`Archivo local no encontrado: ${filePath}. Ejecuta 'npm run sync:cms'.`);
    return null;
  } catch (error) {
    console.error(`Error leyendo el archivo local de CMS [${filename}]:`, error);
    return null;
  }
}

export async function getProducts(locale: string = 'es') {
  const data = await getCMSData('products', locale);
  return data?.docs || [];
}

export async function getProjects(locale: string = 'es', type?: 'aragon' | 'eu') {
  const data = await getCMSData('projects', locale);
  const docs = data?.docs || [];
  if (type) {
    return docs.filter((doc: any) => doc.type === type);
  }
  return docs;
}

export async function getCertificates(locale: string = 'es', type?: 'quality' | 'environment') {
  const data = await getCMSData('certificates', locale);
  const docs = data?.docs || [];
  if (type) {
    return docs.filter((doc: any) => doc.type === type);
  }
  return docs;
}

export async function getLandingContent(locale: string = 'es') {
  const data = await getCMSData('landing-content', locale);
  return data || null;
}

export async function getNavigation(locale: string = 'es') {
  const data = await getCMSData('navigation', locale);
  return data || null;
}

export async function getHero(locale: string = 'es') {
  const data = await getCMSData('hero', locale);
  return data || null;
}

export async function getCompany(locale: string = 'es') {
  const data = await getCMSData('company', locale);
  return data || null;
}

export async function getInnovation(locale: string = 'es') {
  const data = await getCMSData('innovation', locale);
  return data || null;
}

export async function getContactInfo(locale: string = 'es') {
  const data = await getCMSData('contact-info', locale);
  return data || null;
}

export async function getAwards(locale: string = 'es') {
  const data = await getCMSData('awards', locale);
  return data || null;
}

export async function getCertificationsContent(locale: string = 'es') {
  const data = await getCMSData('certifications-content', locale);
  return data || null;
}

export async function getRDContent(locale: string = 'es') {
  const data = await getCMSData('rd-content', locale);
  return data || null;
}

export async function getHistoryContent(locale: string = 'es') {
  const data = await getCMSData('history-content', locale);
  return data || null;
}

export async function getCareers(locale: string = 'es') {
  const data = await getCMSData('careers', locale);
  return data || null;
}

export async function getFAQ(locale: string = 'es') {
  const data = await getCMSData('faq', locale);
  return data || null;
}

export async function getSEO(locale: string = 'es') {
  const data = await getCMSData('seo', locale);
  return data || null;
}
