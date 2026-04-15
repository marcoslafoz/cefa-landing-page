import { getPayload } from 'payload'
import configPromise from './payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import seedMap from '../seed-map.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function seed(payload: any) {
  console.log('--- Iniciando seeding automatizado ---')

  // 1. Cargar traducciones desde la landing
  const landingPath = process.env.LANDING_PAGE_PATH || path.resolve(__dirname, '../../cefa-landing-page')
  const i18nPath = path.join(landingPath, 'src/i18n')
  const locales = {
    es: JSON.parse(fs.readFileSync(path.join(i18nPath, 'es.json'), 'utf8')),
    en: JSON.parse(fs.readFileSync(path.join(i18nPath, 'en.json'), 'utf8')),
    de: JSON.parse(fs.readFileSync(path.join(i18nPath, 'de.json'), 'utf8')),
    pl: JSON.parse(fs.readFileSync(path.join(i18nPath, 'pl.json'), 'utf8')),
  }

  // 2. El mapa de seed ya está importado arriba

  /**
   * Procesa un objeto del mapa para un idioma, opcionalmente inyectando IDs de items existentes
   */
  function processMap(obj: any, locale: string, existingData?: any): any {
    if (typeof obj === 'string') {
      return (locales as any)[locale][obj] || (locales as any)['es'][obj] || obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        const existingItem = existingData && Array.isArray(existingData) ? existingData[index] : null;
        const processed = processMap(item, locale, existingItem);
        if (existingItem && existingItem.id && typeof processed === 'object') {
          return { ...processed, id: existingItem.id };
        }
        return processed;
      });
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = processMap(value, locale, existingData ? existingData[key] : null);
      }
      return result;
    }

    return obj;
  }

  // 3. Sembrar cada Global definido en el mapa
  console.log('Sembrando Globals...')
  const availableLocales = ['es', 'en', 'de', 'pl']
  for (const [globalSlug, mapping] of Object.entries(seedMap)) {
    console.log(`Poblando Global: ${globalSlug}...`)

    // Primero ES para crear la estructura e IDs
    console.log(`  -> Idioma: ES`)
    await payload.updateGlobal({
      slug: globalSlug as any,
      locale: 'es',
      data: processMap(mapping, 'es'),
      context: { disableAutoTranslate: true },
    })

    // Obtenemos la estructura con IDs
    const currentGlobal = await payload.findGlobal({
      slug: globalSlug as any,
      locale: 'es',
    })

    // Ahora el resto de idiomas preservando IDs de arrays para que no se borren/sobreescriban
    for (const locale of ['en', 'de', 'pl']) {
      console.log(`  -> Idioma: ${locale.toUpperCase()}`)
      const localeData = processMap(mapping, locale, currentGlobal)

      await payload.updateGlobal({
        slug: globalSlug as any,
        locale: locale as any,
        data: localeData,
        context: { disableAutoTranslate: true },
      })
    }
  }

  // 4. Sembrar Colecciones
  console.log('Limpiando colecciones...')
  await payload.delete({ collection: 'products', where: {} })
  await payload.delete({ collection: 'projects', where: {} })
  await payload.delete({ collection: 'certificates', where: {} })
  await payload.delete({ collection: 'media', where: {} })

  console.log('Sembrando Productos...')
  const productsCmsPath = path.join(landingPath, 'src/data/cms/es/products.json')
  const productsData = JSON.parse(fs.readFileSync(productsCmsPath, 'utf8'))

  for (const prodDoc of productsData.docs) {
    const product = await payload.create({
      collection: 'products',
      locale: 'es',
      data: {
        title: prodDoc.title,
        description: prodDoc.description,
      },
      context: { disableAutoTranslate: true },
    })

    for (const locale of ['en', 'de', 'pl']) {
      try {
        const localePath = path.join(landingPath, `src/data/cms/${locale}/products.json`)
        const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'))
        const localeDoc = localeData.docs.find((d: any) => d.id === prodDoc.id) || localeData.docs.find((d: any) => d.title === prodDoc.title)

        if (localeDoc) {
          await payload.update({
            collection: 'products',
            id: product.id,
            locale: locale as any,
            data: {
              title: localeDoc.title,
              description: localeDoc.description,
            },
            context: { disableAutoTranslate: true },
          })
        }
      } catch (e) {
        console.warn(`No se pudo encontrar traducción para producto ${prodDoc.title} en ${locale}`)
      }
    }
  }

  console.log('Cargando datos de Colecciones desde CMS...')
  const projectsData = JSON.parse(fs.readFileSync(path.join(landingPath, 'src/data/cms/es/projects.json'), 'utf8'))
  const certsData = JSON.parse(fs.readFileSync(path.join(landingPath, 'src/data/cms/es/certificates.json'), 'utf8'))

  const uploadMedia = async (imagePath: string) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.replace(/^\/+/, '');
    const fullPath = path.join(landingPath, 'public', cleanPath);
    if (!fs.existsSync(fullPath)) return null;

    try {
      const stats = fs.statSync(fullPath);
      const isPdf = cleanPath.toLowerCase().endsWith('.pdf');
      const isPng = cleanPath.toLowerCase().endsWith('.png');
      const mime = isPdf ? 'application/pdf' : (isPng ? 'image/png' : 'image/jpeg');

      const media = await payload.create({
        collection: 'media',
        data: { alt: path.basename(cleanPath) },
        file: {
          data: fs.readFileSync(fullPath),
          mimetype: mime,
          name: path.basename(cleanPath),
          size: stats.size,
        }
      });
      return media.id;
    } catch (err) {
      console.error(`Error subiendo media ${imagePath}:`, err);
      return null;
    }
  }

  const mediaMap: Record<string, string> = {};
  const allMediaPaths: string[] = [];

  // Extraer rutas de media de proyectos (si las hay)
  projectsData.docs.forEach((p: any) => {
    if (p.image?.url) allMediaPaths.push(p.image.url);
    if (p.gallery)
      p.gallery.forEach((g: any) => {
        if (g.image?.url) allMediaPaths.push(g.image.url);
      });
  });

  // Extraer rutas de media de certificados
  certsData.docs.forEach((c: any) => {
    if (c.image?.url) allMediaPaths.push(c.image.url);
    if (c.file?.url) allMediaPaths.push(c.file.url);
  });

  // HEURÍSTICA: Listar archivos físicos para asegurar que todo se sube aunque no esté en el JSON
  const mediaDir = path.join(landingPath, 'public/cms-media');
  let physicalMediaFiles: string[] = [];
  if (fs.existsSync(mediaDir)) {
    physicalMediaFiles = fs
      .readdirSync(mediaDir)
      .filter((f) => !f.startsWith('.'))
      .map((f) => `/cms-media/${f}`);
  }

  const totalMediaToUpload = Array.from(new Set([...allMediaPaths, ...physicalMediaFiles]));

  console.log(`Subiendo ${totalMediaToUpload.length} archivos de media...`);
  for (const imgPath of totalMediaToUpload) {
    const id = await uploadMedia(imgPath as string);
    if (id) mediaMap[imgPath as string] = id;
  }

  // Función para encontrar media por patrón de nombre
  const findMediaByPattern = (pattern: string) => {
    const key = Object.keys(mediaMap).find((k) => k.toLowerCase().includes(pattern.toLowerCase()));
    return key ? mediaMap[key] : null;
  };

  console.log('Sembrando Proyectos...');
  for (const projDoc of projectsData.docs) {
    // Heurística para encontrar la imagen si no viene en el JSON
    let mediaId = projDoc.image?.url ? mediaMap[projDoc.image.url] : null;
    if (!mediaId) {
      if (projDoc.title.includes('Materiales Sostenibles') && projDoc.title.includes('2024'))
        mediaId = findMediaByPattern('aragon-materiales-sostenibles-logistica-vec-2024');
      else if (projDoc.title.includes('Materiales Sostenibles') && projDoc.title.includes('2025'))
        mediaId = findMediaByPattern('aragon-materiales-sostenibles-logistica-vec-2025');
      else if (projDoc.title.includes('circularidad') && projDoc.title.includes('2024'))
        mediaId = findMediaByPattern('aragon-circularidad-reduccion-consumos-2024');
      else if (projDoc.title.includes('circularidad') && projDoc.title.includes('2022'))
        mediaId = findMediaByPattern('aragon-circularidad-reduccion-consumos-2022');
      else if (projDoc.title.includes('HORMIGOBOTS')) mediaId = findMediaByPattern('ue-hormigobots');
      else if (
        projDoc.title.includes('Monitorización Energética') &&
        projDoc.title.includes('MRA') &&
        projDoc.title.includes('Fase 1')
      )
        mediaId = findMediaByPattern('ue-monitorizacion-energetica-mra-fase1');
      else if (
        projDoc.title.includes('Monitorización Energética') &&
        projDoc.title.includes('MRA') &&
        projDoc.title.includes('Fase 2')
      )
        mediaId = findMediaByPattern('ue-monitorizacion-energetica-mra-fase2');
      else if (projDoc.title.includes('REACT-UE'))
        mediaId = findMediaByPattern('ue-feder-react-recuperacion-economica');
      else if (projDoc.title.includes('IDAE CEFA'))
        mediaId = findMediaByPattern('ue-monitorizacion-energetica-cefa');
    }

    const project = await payload.create({
      collection: 'projects',
      locale: 'es',
      data: {
        type: projDoc.type,
        title: projDoc.title,
        client: projDoc.client || (projDoc.type === 'aragon' ? 'I+D Interno (FEDER)' : 'Unión Europea'),
        description: projDoc.description,
        ...(mediaId && { image: mediaId }),
      },
      context: { disableAutoTranslate: true },
    });

    // Localización de proyectos
    for (const locale of ['en', 'de', 'pl']) {
      try {
        const localePath = path.join(landingPath, `src/data/cms/${locale}/projects.json`);
        const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        const localeDoc =
          localeData.docs.find((d: any) => d.id === projDoc.id) ||
          localeData.docs.find((d: any) => d.title === projDoc.title);

        if (localeDoc) {
          await payload.update({
            collection: 'projects',
            id: project.id,
            locale: locale as any,
            data: {
              title: localeDoc.title,
              description: localeDoc.description,
            },
            context: { disableAutoTranslate: true },
          });
        }
      } catch (e) {
        // Silencioso
      }
    }
  }

  console.log('Sembrando Certificados...');
  for (const certDoc of certsData.docs) {
    let imageId = certDoc.image?.url ? mediaMap[certDoc.image.url] : null;
    let fileId = certDoc.file?.url ? mediaMap[certDoc.file.url] : null;

    // Heurística para certificados si faltan en el JSON
    if (!imageId && !fileId) {
      if (certDoc.name === 'ISO 9001') imageId = findMediaByPattern('certificado-calidad-02');
      else if (certDoc.name === 'IATF 16949') imageId = findMediaByPattern('certificado-calidad-01');
      else if (certDoc.name === 'ISO 14001') imageId = findMediaByPattern('certificado-medioambiente');
      else if (certDoc.name === 'TISAX') fileId = findMediaByPattern('TISAXCEFASP');
    }

    const dataObj: any = {
      type: certDoc.type,
      name: certDoc.name,
      issuer: certDoc.issuer,
      issueDate: certDoc.issueDate,
    };
    if (imageId) dataObj.image = imageId;
    if (fileId) dataObj.file = fileId;

    await payload.create({
      collection: 'certificates',
      data: dataObj,
      context: { disableAutoTranslate: true },
    });
  }

  console.log('--- Seed completado con éxito ---');
}

// Permitir ejecución directa
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.endsWith('seed.ts')) {
  const run = async () => {
    const payload = await getPayload({ config: configPromise })
    await seed(payload)
    process.exit(0)
  }
  run().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
