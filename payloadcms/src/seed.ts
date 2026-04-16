import { getPayload } from 'payload'
import configPromise from './payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import seedMap from '../seed-map.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function seed(payload: any) {
  console.log('--- Starting automated seed ---')

  const landingPath = process.env.LANDING_PAGE_PATH || path.resolve(__dirname, '../../cefa-landing-page')
  const i18nPath = path.resolve(__dirname, './seed-data')

  const safeReadJSON = (filePath: string) => {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e)
    }
    return {}
  }

  const locales = {
    es: safeReadJSON(path.join(i18nPath, 'es.json')),
    en: safeReadJSON(path.join(i18nPath, 'en.json')),
    de: safeReadJSON(path.join(i18nPath, 'de.json')),
    pl: safeReadJSON(path.join(i18nPath, 'pl.json')),
  }

  /**
   * Processes a map object for a locale, optionally injecting IDs from existing items
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

  console.log('Seeding Globals...')
  for (const [globalSlug, mapping] of Object.entries(seedMap)) {
    console.log(`Populating Global: ${globalSlug}...`)

    console.log(`  -> Locale: ES`)
    await payload.updateGlobal({
      slug: globalSlug as any,
      locale: 'es',
      data: processMap(mapping, 'es'),
      context: { disableAutoTranslate: true },
    })

    const currentGlobal = await payload.findGlobal({
      slug: globalSlug as any,
      locale: 'es',
    })

    for (const locale of ['en', 'de', 'pl']) {
      console.log(`  -> Locale: ${locale.toUpperCase()}`)
      const localeData = processMap(mapping, locale, currentGlobal)

      await payload.updateGlobal({
        slug: globalSlug as any,
        locale: locale as any,
        data: localeData,
        context: { disableAutoTranslate: true },
      })
    }
  }

  console.log('Clearing collections...')
  try {
    await payload.delete({ collection: 'project-categories', where: {} })
    await payload.delete({ collection: 'projects', where: {} })
    await payload.delete({ collection: 'certificate-categories', where: {} })
    await payload.delete({ collection: 'certificates', where: {} })
    await payload.delete({ collection: 'media', where: {} })
  } catch (e) {
    console.log('Error clearing collections (may not exist yet):', e);
  }

  console.log('Loading collection data from CMS...')
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
      console.error(`Error uploading media ${imagePath}:`, err);
      return null;
    }
  }

  const mediaMap: Record<string, string> = {};

  let brandsData: any[] = [];
  try {
    const brandsPath = path.join(landingPath, 'src/data/brands.json');
    brandsData = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
  } catch (e) {
    console.error("Error loading brands.json", e);
  }

  const mediaDir = path.join(landingPath, 'public/cms-media');
  const mediaFiles = fs.existsSync(mediaDir)
    ? fs.readdirSync(mediaDir).filter((f) => !f.startsWith('.')).map((f) => `/cms-media/${f}`)
    : [];

  console.log(`Uploading ${mediaFiles.length} media files...`);
  for (const imgPath of mediaFiles) {
    const id = await uploadMedia(imgPath);
    if (id) mediaMap[imgPath] = id;
  }

  console.log('Linking images to Products Section...');
  const currentProductsSection = await payload.findGlobal({ slug: 'products-section' });
  if (currentProductsSection && currentProductsSection.products && currentProductsSection.products.length > 0) {
    const productsArray = [...currentProductsSection.products];
    if (productsArray[0] && mediaMap['/cms-media/dashboard.webp']) productsArray[0].image = mediaMap['/cms-media/dashboard.webp'];
    if (productsArray[1] && mediaMap['/cms-media/door-panels.webp']) productsArray[1].image = mediaMap['/cms-media/door-panels.webp'];
    if (productsArray[2] && mediaMap['/cms-media/functional.webp']) productsArray[2].image = mediaMap['/cms-media/functional.webp'];
    if (productsArray[3] && mediaMap['/cms-media/exterior.webp']) productsArray[3].image = mediaMap['/cms-media/exterior.webp'];

    await payload.updateGlobal({
      slug: 'products-section',
      data: { products: productsArray },
      locale: 'es',
    });
  }

  console.log('Linking images to Vision...');
  const currentVision = await payload.findGlobal({ slug: 'vision' });
  if (currentVision) {
    const galleryArray = [];
    if (mediaMap['/cms-media/zagan.webp']) galleryArray.push({ image: mediaMap['/cms-media/zagan.webp'], alt: 'CEFA Żagań' });
    if (mediaMap['/cms-media/factory.webp']) galleryArray.push({ image: mediaMap['/cms-media/factory.webp'], alt: 'CEFA Zaragoza' });

    if (galleryArray.length > 0) {
      await payload.updateGlobal({
        slug: 'vision',
        data: { gallery: galleryArray },
        locale: 'es',
      });
    }
  }

  console.log('Linking logos to Clients...');
  const currentClients = await payload.findGlobal({ slug: 'clients' });
  if (currentClients && brandsData.length > 0) {
    const logosArray: any[] = [];
    for (const b of brandsData) {
      const imgPath = `/cms-media/${b.file}`;
      if (mediaMap[imgPath]) {
        logosArray.push({ image: mediaMap[imgPath], name: b.name });
      }
    }
    if (logosArray.length > 0) {
      await payload.updateGlobal({
        slug: 'clients',
        data: { logos: logosArray },
        locale: 'es',
      });
    }
  }

  console.log('Seeding Project Categories...');
  const catMap: Record<string, string> = {};

  const euLogo = mediaMap['/cms-media/union-europea.png'];
  const aragonLogo = mediaMap['/cms-media/gobierno-aragon.webp'];

  const euCat = await payload.create({
    collection: 'project-categories',
    data: { name: 'Unión Europea', identifier: 'eu', logo: euLogo }
  });
  catMap['eu'] = euCat.id;

  const aragonCat = await payload.create({
    collection: 'project-categories',
    data: { name: 'Gobierno de Aragón (FEDER)', identifier: 'aragon', logo: aragonLogo }
  });
  catMap['aragon'] = aragonCat.id;

  // Sort projects so EU projects come first, then Aragón
  const sortedProjects = [...projectsData.docs].sort((a: any, b: any) => {
    const aId = typeof a.category === 'object' ? a.category?.identifier : a.category;
    const bId = typeof b.category === 'object' ? b.category?.identifier : b.category;
    if (aId === 'eu' && bId !== 'eu') return -1;
    if (aId !== 'eu' && bId === 'eu') return 1;
    return 0;
  });

  console.log('Seeding Projects...');
  for (const projDoc of sortedProjects) {
    const mediaId = projDoc.file?.url ? mediaMap[projDoc.file.url] : null;

    // Resolve category identifier from the nested category object
    const projCategoryId = typeof projDoc.category === 'object'
      ? projDoc.category?.identifier
      : projDoc.category;
    const projIsAragon = projCategoryId === 'aragon';

    const project = await payload.create({
      collection: 'projects',
      locale: 'es',
      data: {
        category: catMap[projCategoryId] || catMap['eu'],
        title: projDoc.title,
        client: projDoc.client || (projIsAragon ? 'I+D Interno (FEDER)' : 'Unión Europea'),
        description: projDoc.description,
        ...(mediaId && { file: mediaId }),
      },
      context: { disableAutoTranslate: true },
    });

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
      }
    }
  }

  console.log('Seeding Certificate Categories...');
  const certCatMap: Record<string, string> = {};

  const calidadCat = await payload.create({
    collection: 'certificate-categories',
    data: { name: 'Calidad', identifier: 'calidad' }
  });
  certCatMap['Calidad'] = calidadCat.id;

  const envCat = await payload.create({
    collection: 'certificate-categories',
    data: { name: 'Medio Ambiente', identifier: 'medio-ambiente' }
  });
  certCatMap['Medio Ambiente'] = envCat.id;

  console.log('Seeding Certificates...');
  for (const certDoc of certsData.docs) {
    const fileId = certDoc.file?.url ? mediaMap[certDoc.file.url] : (certDoc.image?.url ? mediaMap[certDoc.image.url] : null);

    // Resolve category from the nested category object (not certDoc.type which doesn't exist)
    const certCategoryName = typeof certDoc.category === 'object'
      ? certDoc.category?.name
      : certDoc.category;
    const certCategoryId = typeof certDoc.category === 'object'
      ? certDoc.category?.identifier
      : null;

    // Match by name OR by identifier
    const resolvedCatId =
      certCatMap[certCategoryName] ||
      (certCategoryId === 'medio-ambiente' ? certCatMap['Medio Ambiente'] : null) ||
      (certCategoryId === 'calidad' ? certCatMap['Calidad'] : null) ||
      certCatMap['Calidad'];

    const dataObj: any = {
      category: resolvedCatId,
      name: certDoc.name,
      issuer: certDoc.issuer,
      issueDate: certDoc.issueDate,
    };
    if (fileId) dataObj.file = fileId;

    await payload.create({
      collection: 'certificates',
      data: dataObj,
      context: { disableAutoTranslate: true },
    });
  }

  console.log('Linking logos to Header...');
  await payload.updateGlobal({
    slug: 'header',
    data: {
      logos: {
        cefaColor: mediaMap['/cms-media/cefa-color.svg'],
        cefaWhite: mediaMap['/cms-media/cefa-mono-white.svg'],
        motherson: mediaMap['/cms-media/motherson.svg'],
      }
    }
  });

  console.log('Linking background to Hero...');
  await payload.updateGlobal({
    slug: 'hero',
    data: {
      backgroundImage: mediaMap['/cms-media/frame.webp'],
      vimeoUrl: 'https://vimeo.com/1181594121',
    }
  });

  console.log('--- Seed completed successfully ---');
}

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
