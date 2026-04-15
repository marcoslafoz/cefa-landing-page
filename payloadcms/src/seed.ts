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
  const landingPath = process.env.LANDING_PAGE_PATH || path.resolve(__dirname, '../../landing-page')
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
  const productKeys = ['p1', 'p2', 'p3', 'p4']
  for (const pk of productKeys) {
    const product = await payload.create({
      collection: 'products',
      locale: 'es',
      data: {
        title: locales.es[`products.${pk}.title`],
        description: locales.es[`products.${pk}.desc`],
      },
      context: { disableAutoTranslate: true },
    })
    for (const locale of ['en', 'de', 'pl']) {
      await payload.update({
        collection: 'products',
        id: product.id,
        locale: locale as any,
        data: {
          title: (locales as any)[locale][`products.${pk}.title`] || locales.es[`products.${pk}.title`],
          description: (locales as any)[locale][`products.${pk}.desc`] || locales.es[`products.${pk}.desc`],
        },
        context: { disableAutoTranslate: true },
      })
    }
  }

  console.log('Subiendo Media...')
  const projectsData = JSON.parse(fs.readFileSync(path.join(landingPath, 'src/data/projects.json'), 'utf8'))
  const certsData = JSON.parse(fs.readFileSync(path.join(landingPath, 'src/data/certifications.json'), 'utf8'))

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
  const allMediaPaths = [
    ...projectsData.aragonProjects.map((p: any) => p.image),
    ...projectsData.euProjects.map((p: any) => p.image),
    ...certsData.qualityCerts.map((c: any) => c.image),
    ...certsData.envCerts.map((c: any) => c.image),
  ].filter(Boolean);

  for (const imgPath of Array.from(new Set(allMediaPaths))) {
    const id = await uploadMedia(imgPath as string);
    if (id) mediaMap[imgPath as string] = id;
  }

  console.log('Sembrando Proyectos...')
  const allProjects = [
    ...projectsData.aragonProjects.map((p: any) => ({ ...p, pType: 'aragon' })),
    ...projectsData.euProjects.map((p: any) => ({ ...p, pType: 'eu' }))
  ]
  for (const proj of allProjects) {
    const mediaId = mediaMap[proj.image];
    await payload.create({
      collection: 'projects',
      data: {
        type: proj.pType,
        title: proj.title,
        client: proj.pType === 'aragon' ? 'I+D Interno (FEDER)' : 'Unión Europea',
        description: proj.title,
        ...(mediaId && { image: mediaId })
      },
      context: { disableAutoTranslate: true },
    })
  }

  console.log('Sembrando Certificados...')
  const allCerts = [
    ...certsData.qualityCerts.map((c: any) => ({ ...c, cType: 'Calidad' })),
    ...certsData.envCerts.map((c: any) => ({ ...c, cType: 'Medio Ambiente' }))
  ]
  for (const cert of allCerts) {
    const mediaId = mediaMap[cert.image];
    const dataObj: any = {
      type: cert.cType,
      name: cert.name,
      issuer: cert.org,
      issueDate: cert.year,
    };
    if (mediaId && cert.type === 'image') dataObj.image = mediaId;
    if (mediaId && cert.type === 'pdf') dataObj.file = mediaId;
    await payload.create({
      collection: 'certificates',
      data: dataObj,
      context: { disableAutoTranslate: true },
    })
  }

  console.log('--- Seed completado con éxito ---')
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
