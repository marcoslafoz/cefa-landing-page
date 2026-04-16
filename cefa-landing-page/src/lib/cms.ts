import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data/cms');
const CMS_URL = process.env.PAYLOAD_CMS_URL || 'http://localhost:3000';

export function getMediaUrl(media: string | { url?: string } | null | undefined): string {
  if (!media) return '';
  const url = typeof media === 'string' ? media : media.url || '';
  if (!url) return '';

  if (url.startsWith('/') || url.startsWith('http')) {
    return url;
  }

  return `${CMS_URL.replace(/\/$/, '')}/${url}`;
}
async function getCMSData(filename: string, locale: string) {
  try {
    const filePath = path.join(DATA_DIR, locale, `${filename}.json`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }

    console.warn(`Local file not found: ${filePath}. Run 'npm run sync:cms'.`);
    return null;
  } catch (error) {
    console.error(`Error reading local CMS file [${filename}]:`, error);
    return null;
  }
}

export async function getProducts(locale: string = 'es') {
  const sectionData = await getCMSData('products-section', locale);
  if (sectionData?.products?.length > 0) return sectionData.products;
  const data = await getCMSData('products', locale);
  return data?.docs || [];
}

export async function getProductsSection(locale: string = 'es') {
  const data = await getCMSData('products-section', locale);
  return data || null;
}

export async function getProjectCategories(locale: string = 'es') {
  const data = await getCMSData('project-categories', locale);
  return data?.docs || [];
}

export async function getProjects(locale: string = 'es', categoryIdentifier?: string) {
  const data = await getCMSData('projects', locale);
  const docs = data?.docs || [];
  if (categoryIdentifier) {
    return docs.filter((doc: { category?: string | { identifier?: string } | null }) => {
      if (!doc.category) return false;
      const iden = typeof doc.category === 'object' ? doc.category?.identifier : null;
      return iden === categoryIdentifier;
    });
  }
  return docs;
}

export async function getCertificateCategories(locale: string = 'es') {
  const data = await getCMSData('certificate-categories', locale);
  return data?.docs || [];
}

export async function getCertificates(locale: string = 'es', categoryIdentifier?: string) {
  const data = await getCMSData('certificates', locale);
  const docs = data?.docs || [];
  if (categoryIdentifier) {
    return docs.filter((doc: { category?: string | { identifier?: string } | null }) => {
      if (!doc.category) return false;
      const iden = typeof doc.category === 'object' ? doc.category?.identifier : null;
      return iden === categoryIdentifier;
    });
  }
  return docs;
}

export async function getHeader(locale: string = 'es') {
  const data = await getCMSData('header', locale);
  return data || null;
}

export async function getHero(locale: string = 'es') {
  const data = await getCMSData('hero', locale);
  return data || null;
}

export async function getMission(locale: string = 'es') {
  const data = await getCMSData('mission', locale);
  return data || null;
}

export async function getVision(locale: string = 'es') {
  const data = await getCMSData('vision', locale);
  return data || null;
}

export async function getInnovation(locale: string = 'es') {
  const data = await getCMSData('innovation', locale);
  return data || null;
}

export async function getQuote(locale: string = 'es') {
  const data = await getCMSData('quote', locale);
  return data || null;
}

export async function getContact(locale: string = 'es') {
  const data = await getCMSData('contact', locale);
  return data || null;
}

export async function getClients(locale: string = 'es') {
  const data = await getCMSData('clients', locale);
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
