import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Projects } from './collections/Projects'
import { Certificates } from './collections/Certificates'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Hero } from './globals/Hero'
import { Company } from './globals/Company'
import { Innovation } from './globals/Innovation'
import { ContactInfo } from './globals/ContactInfo'
import { Awards } from './globals/Awards'
import { Certifications } from './globals/Certifications'
import { ResearchDevelopment } from './globals/ResearchDevelopment'
import { History } from './globals/History'
import { Careers } from './globals/Careers'
import { FAQ } from './globals/FAQ'
import { SEO } from './globals/SEO'
import { LandingContent } from './globals/LandingContent'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/PublishButton#PublishButton'],
    },
  },
  onInit: async (payload) => {
    if (process.env.PAYLOAD_SEED === 'true') {
      payload.logger.info('Variable PAYLOAD_SEED detectada. Iniciando seed...')
      try {
        const { seed } = await import('./seed')
        await seed(payload)
        payload.logger.info('✅ Seed completado.')
      } catch (err) {
        payload.logger.error({ err }, '❌ Error durante el seed')
      }
    }
  },
  collections: [Users, Media, Pages, Products, Projects, Certificates],
  globals: [
    SiteSettings,
    Navigation,
    Hero,
    Company,
    Innovation,
    ContactInfo,
    Awards,
    Certifications,
    ResearchDevelopment,
    History,
    Careers,
    FAQ,
    SEO,
    LandingContent,
  ],
  editor: lexicalEditor(),
  localization: {
    locales: ['es', 'en', 'de', 'pl'],
    defaultLocale: 'es',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})
